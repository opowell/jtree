// A headless Chrome for tests, driven through the DevTools protocol (Node's own WebSocket; no
// packages). Pages are real: jtree's participant pages, its admins, with their scripts and sockets.
//
//   const browser = await launch();          // null if there is no Chrome (tests then skip)
//   const page = await browser.open(url);
//   await page.waitFor(() => document.querySelector('h1') != null);
//   await page.click('button.next'); await page.type('input[name=x]', '5');
//   const text = await page.eval(() => document.body.innerText);
//   await browser.close();

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Chrome's executable: $CHROME_PATH, or where Chrome or Chromium usually is; null if none. */
function findChrome() {
    const candidates = [
        process.env.CHROME_PATH,
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ];
    return candidates.find((c) => c && fs.existsSync(c)) || null;
}

/** A DevTools protocol connection: send(method, params) → result; events to on(method, fn). */
function connect(wsUrl) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);
        let next = 1;
        const pending = new Map();
        const listeners = [];
        ws.onmessage = (e) => {
            const msg = JSON.parse(e.data);
            if (msg.id != null && pending.has(msg.id)) {
                const { ok, fail } = pending.get(msg.id);
                pending.delete(msg.id);
                if (msg.error) fail(new Error(msg.error.message)); else ok(msg.result);
            } else if (msg.method) {
                for (const l of listeners) l(msg);
            }
        };
        ws.onerror = () => reject(new Error('cannot connect to Chrome at ' + wsUrl));
        ws.onopen = () => resolve({
            send(method, params = {}, sessionId) {
                return new Promise((ok, fail) => {
                    const id = next++;
                    pending.set(id, { ok, fail });
                    ws.send(JSON.stringify({ id, method, params, sessionId }));
                });
            },
            on(fn) { listeners.push(fn); },
            close() { ws.close(); },
        });
    });
}

/** Starts headless Chrome; null if there is none. */
async function launch() {
    const exe = findChrome();
    if (exe == null) return null;
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'jtree-chrome-'));
    const proc = spawn(exe, ['--headless=new', '--remote-debugging-port=0', '--user-data-dir=' + profile, '--no-first-run',
        '--no-default-browser-check', '--disable-gpu', '--disable-extensions', '--window-size=1200,900',
        // Pages in tabs behind others keep running as in front (as puppeteer has them): Chrome
        // slows hidden tabs' timers, which socket.io's connections depend on.
        '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
        '--disable-background-networking', '--disable-ipc-flooding-protection', 'about:blank'],
    { stdio: 'ignore' });
    // Chrome writes the port it chose to DevToolsActivePort.
    const portFile = path.join(profile, 'DevToolsActivePort');
    for (let i = 0; i < 1200 && !fs.existsSync(portFile); i++) await sleep(50);
    if (!fs.existsSync(portFile)) {
        proc.kill();
        throw new Error('Chrome did not start');
    }
    await sleep(50);
    const [port, wsPath] = fs.readFileSync(portFile, 'utf8').trim().split('\n');
    const cdp = await connect('ws://127.0.0.1:' + port + wsPath);
    const sessions = new Map(); // sessionId -> page
    cdp.on((msg) => {
        const page = sessions.get(msg.sessionId);
        if (page == null) return;
        if (msg.method === 'Runtime.exceptionThrown') {
            page.errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
        } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
            page.errors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
        }
    });

    return {
        /** Opens url in a new tab; its uncaught errors and console.error()s are in page.errors. */
        async open(url) {
            const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
            const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
            const send = (method, params) => cdp.send(method, params, sessionId);
            const page = {
                errors: [],
                /** fn's result in the page (fn: a function, or an expression's text); awaits promises. */
                async eval(fn, ...args) {
                    const expression = typeof fn === 'function' ? '(' + fn + ')(...' + JSON.stringify(args) + ')' : fn;
                    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
                    if (r.exceptionDetails) throw new Error('in the page: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
                    return r.result.value;
                },
                /** Waits until fn is true in the page. */
                async waitFor(fn, { timeout = 60000, what } = {}, ...args) {
                    const end = Date.now() + timeout;
                    for (;;) {
                        try {
                            if (await page.eval(fn, ...args)) return;
                        } catch (err) {
                            // The page may be loading.
                        }
                        if (Date.now() > end) {
                            throw new Error('timed out waiting for ' + (what || String(fn)) + (page.errors.length ? '; page errors: ' + page.errors.join(' | ') : ''));
                        }
                        await sleep(50);
                    }
                },
                /** The visible text of the page. */
                text() { return page.eval(() => document.body.innerText); },
                /** Clicks the first visible element matching selector (or with text, among them). */
                async click(selector, text) {
                    await page.waitFor((s, t) => [...document.querySelectorAll(s)].some((e) => e.offsetParent != null && (t == null || e.textContent.includes(t))),
                        { what: 'a visible ' + selector + (text ? ' with ' + text : '') }, selector, text);
                    await page.eval((s, t) => [...document.querySelectorAll(s)].find((e) => e.offsetParent != null && (t == null || e.textContent.includes(t))).click(), selector, text);
                },
                /** Sets the value of the first visible input matching selector, as typing does. */
                async type(selector, value) {
                    await page.waitFor((s) => [...document.querySelectorAll(s)].some((e) => e.offsetParent != null), { what: 'a visible ' + selector }, selector);
                    await page.eval((s, v) => {
                        const el = [...document.querySelectorAll(s)].find((e) => e.offsetParent != null);
                        el.focus();
                        el.value = v;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                    }, selector, value);
                },
                /** Saves a PNG of the page to file. */
                async screenshot(file) {
                    const { data } = await send('Page.captureScreenshot', { format: 'png' });
                    fs.writeFileSync(file, Buffer.from(data, 'base64'));
                },
                async close() {
                    sessions.delete(sessionId);
                    await cdp.send('Target.closeTarget', { targetId });
                },
            };
            sessions.set(sessionId, page);
            await send('Runtime.enable');
            await send('Page.enable');
            await send('Page.navigate', { url });
            return page;
        },
        async close() {
            try {
                await cdp.send('Browser.close');
            } catch (err) {
                // Closing.
            }
            cdp.close();
            for (let i = 0; i < 40 && proc.exitCode == null; i++) await sleep(50);
            if (proc.exitCode == null) proc.kill();
            fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
        },
    };
}

module.exports = { launch, findChrome };
