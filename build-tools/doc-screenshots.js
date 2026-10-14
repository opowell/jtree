// The screenshots in jtree's documentation (doc-pages/static/images), taken in headless Chrome
// (server/test/browser.js) from a jtree started with the sample games, z-Tree's pg.ztt and oTree's
// sample apps (the test fixtures; z-Tree's examples are downloaded by the z-Tree tests).
//
//     node build-tools/doc-screenshots.js [<names>...]
//
// takes them all, or only those named (admin, participant, editor, ztree-admin, ztree-participant,
// otree-sessions, otree-session, otree-participant, otree-studio). Then rebuild the docs.
const fs = require('node:fs');
const path = require('node:path');
const REPO = path.join(__dirname, '..');
const T = path.join(REPO, 'server/test');
const { startServer, makeDataDir } = require(path.join(T, 'harness.js'));
const { launch } = require(path.join(T, 'browser.js'));
const python = require(path.join(REPO, 'server/source/dialects/otree/runtime.js'));

const out = path.join(REPO, 'doc-pages/static/images');
const only = process.argv.slice(2);
const want = (n) => only.length === 0 || only.includes(n);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const clickText = (page, selector, pattern) => page.eval((s, r) => {
    const el = [...document.querySelectorAll(s)].find((b) => b.offsetParent != null && new RegExp(r).test(b.innerText.trim()));
    if (!el) throw new Error('nothing to click: ' + s + ' ' + r);
    el.click();
}, selector, pattern);
const fill = (page, selector, value) => page.eval((s, v) => {
    const el = document.querySelector(s);
    el.value = v;
    el.dispatchEvent(new Event('input'));
    el.dispatchEvent(new Event('change'));
}, selector, value);
async function menu(page, top, item) {
    await clickText(page, 'button, [role=menuitem]', '^' + top + '$');
    await sleep(250);
    await clickText(page, '[role=menuitem], button, li', item);
    await sleep(300);
}
let DATA = null;
async function shot(page, name, clip) {
    await sleep(800);
    // The throwaway data folder, as a real install's would read.
    await page.eval((roots) => {
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = w.nextNode());) for (const r of roots) if (n.data.includes(r)) n.data = n.data.split(r).join('/Users/me/jtree/client');
    }, DATA ? [fs.realpathSync(DATA), DATA] : []);
    await page.screenshot(path.join(out, name + '.png'), clip);
    process.stdout.write('wrote ' + name + '.png\n');
}

(async () => {
    fs.mkdirSync(out, { recursive: true });
    const data = makeDataDir({ settings: { appFolders: ['apps'] } });
    DATA = data.path;
    const apps = path.join(data.path, 'apps');
    fs.mkdirSync(apps);
    fs.cpSync(path.join(REPO, 'client/apps/1 sample games'), path.join(apps, '1 sample games'), { recursive: true });
    fs.mkdirSync(path.join(apps, 'ztree'));
    fs.copyFileSync(path.join(T, 'fixtures/ztree-examples/pg.ztt'), path.join(apps, 'ztree/pg.ztt'));
    for (const name of ['public_goods_simple', 'prisoner', 'trust_simple', '_templates', '_static', 'settings.py']) {
        const from = path.join(T, 'fixtures/otree-samples', name);
        if (fs.existsSync(from)) fs.cpSync(from, path.join(apps, 'otree', name), { recursive: true });
    }
    // The sample project's settings name apps this copy may not have: a project of the three.
    fs.writeFileSync(path.join(apps, 'otree/settings.py'), `from os import environ
SESSION_CONFIGS = [
    dict(name='public_goods_simple', display_name='Public goods (simple version)', app_sequence=['public_goods_simple'], num_demo_participants=3),
    dict(name='prisoner', display_name="Prisoner's Dilemma", app_sequence=['prisoner'], num_demo_participants=2),
    dict(name='trust_simple', display_name='Trust Game (simple version)', app_sequence=['trust_simple'], num_demo_participants=2),
]
SESSION_CONFIG_DEFAULTS = dict(real_world_currency_per_point=1.00, participation_fee=0.00, doc="")
PARTICIPANT_FIELDS = []
SESSION_FIELDS = []
LANGUAGE_CODE = 'en'
REAL_WORLD_CURRENCY_CODE = 'USD'
USE_POINTS = True
ROOMS = []
ADMIN_USERNAME = 'admin'
DEMO_PAGE_INTRO_HTML = ''
SECRET_KEY = 'x'
`);
    await python.ready();
    const server = await startServer({ data });
    const browser = await launch();
    const url = server.url;
    try {
        // jtree's admin, a running public goods session.
        if (want('admin') || want('participant')) {
            const s = server.createSession(path.join(apps, '1 sample games/public-good.jtt'), { numParticipants: 4 });
            s.start();
            const parts = [];
            for (const id of Object.keys(s.participants)) parts.push(await browser.open(url + '/session/' + s.id + '/' + id));
            for (const [i, p] of parts.entries()) {
                await p.waitFor(() => /DECISION/.test(document.body.innerText), { what: 'decide' });
                if (i < 2) {
                    await p.type('input[name="player.contribution"]', String(5 + 7 * i));
                    await p.click('button', 'OK');
                }
            }
            if (want('participant')) await shot(parts[2], 'participant', { x: 280, y: 190, width: 640, height: 440 });
            if (want('admin')) {
                const admin = await browser.open(url + '/admin/');
                await admin.waitFor(() => document.body.innerText.length > 0, { what: 'admin v2', timeout: 240000 });
                await admin.eval((id) => { localStorage.setItem('jtree-admin2-session', id); location.reload(); }, s.id);
                await admin.waitFor((id) => document.body.innerText.includes('Session ' + id), { what: 'the session', timeout: 240000 }, s.id);
                await shot(admin, 'admin');
                await admin.close();
            }
            for (const p of parts) await p.close();
        }

        // jtree's App editor, with the tutorial's app.
        if (want('editor')) {
            const page = await browser.open(url + '/admin/');
            await page.waitFor(() => document.querySelector('.admin__status[data-connected=true]'), { what: 'admin v2', timeout: 240000 });
            await menu(page, 'File', '^New app');
            await page.waitFor(() => document.querySelector('#new-name'), { what: 'the new app form' });
            await fill(page, '#new-name', 'my-public-goods');
            await fill(page, '#new-desc', 'A public goods game.');
            await clickText(page, 'button', '^Create$');
            await page.waitFor(() => document.querySelector('.ed__nav'), { what: 'the editor' });
            const src = fs.readFileSync(path.join(apps, '1 sample games/public-good.jtt'), 'utf8').replace(/^app\.description = .*\n\n/, "app.description = 'A public goods game.';\n\n");
            await clickText(page, '.ed__link', '^Source');
            await page.waitFor(() => document.querySelector('.ed__source'), { what: 'source' });
            await fill(page, '.ed__source', src);
            await clickText(page, '.btn', '^Apply$');
            await sleep(800);
            await clickText(page, '.btn', '^Save$');
            await page.waitFor(() => !/not saved/.test(document.body.innerText), { what: 'saved' });
            await clickText(page, '.ed__link', 'decide');
            await shot(page, 'editor', { x: 0, y: 0, width: 508, height: 813 });
            await page.close();
        }

        // The z-Tree admin and a z-Leaf screen.
        if (want('ztree-admin') || want('ztree-participant')) {
            const s = server.createSession(path.join(apps, 'ztree/pg.ztt'), { numParticipants: 4 });
            s.start();
            const parts = [];
            for (const id of Object.keys(s.participants)) parts.push(await browser.open(url + '/session/' + s.id + '/' + id));
            await parts[0].waitFor(() => /contribution/i.test(document.body.innerText), { what: 'the z-Tree screen', timeout: 60000 });
            if (want('ztree-participant')) await shot(parts[0], 'ztree-participant');
            if (want('ztree-admin')) {
                const admin = await browser.open(url + '/participant/ztree.css');
                await admin.eval((id) => { localStorage.setItem('jtree-ztree-session', id); location.href = '/admin/ztree/'; }, s.id);
                await admin.waitFor(() => /Connection Monitor/.test(document.body.innerText), { what: 'admin-ztree', timeout: 240000 });
                await sleep(1000);
                // Its first window, a new treatment, out of the way.
                await admin.eval(() => {
                    const t = [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && /^Untitled Treatment/.test(e.textContent.trim()));
                    if (!t) return 'none';
                    let w = t, close = null;
                    while (w && !close) {
                        close = [...w.querySelectorAll('button')].find((b) => /close/i.test((b.getAttribute('aria-label') || '') + (b.title || '')));
                        w = w.parentElement;
                    }
                    if (close) close.click();
                });
                await sleep(500);
                await clickText(admin, '.zt-dialog button', "^Don.t save$").catch(() => {});
                await sleep(500);
                await menu(admin, 'File', '^Open');
                await admin.waitFor(() => document.querySelector('#open-look'), { what: 'the Open dialog' });
                await admin.eval(() => {
                    const input = document.querySelector('#open-name');
                    input.value = 'ztree/pg.ztt';
                    input.dispatchEvent(new Event('input'));
                });
                await clickText(admin, '.zt-dialog button', '^Open$');
                await admin.waitFor(() => document.querySelector('.zt-tree [data-kind=stage]'), { what: 'the stage tree' });
                await shot(admin, 'ztree-admin');
                await admin.close();
            }
            for (const p of parts) await p.close();
        }

        // The oTree admin, its Studio, and an oTree page.
        if (want('otree-session') || want('otree-participant') || want('otree-studio') || want('otree-sessions')) {
            if (want('otree-sessions')) {
                const page = await browser.open(url + '/admin/otree/#/sessions');
                await page.waitFor(() => [...document.querySelectorAll('option')].some((o) => /Public goods/.test(o.textContent)), { what: 'sessions', timeout: 240000 });
                await page.eval(() => {
                    const sel = document.querySelector('select');
                    sel.value = [...sel.options].find((o) => /Public goods/.test(o.textContent)).value;
                    sel.dispatchEvent(new Event('change'));
                });
                await sleep(500);
                await shot(page, 'otree-sessions');
                await page.close();
            }
            const s = server.createSession(path.join(apps, 'otree/public_goods_simple/__init__.py'), { numParticipants: 3 });
            s.start();
            const parts = [];
            for (const id of Object.keys(s.participants)) parts.push(await browser.open(url + '/session/' + s.id + '/' + id));
            await parts[0].waitFor(() => /public goods game/.test(document.body.innerText), { what: 'the oTree page', timeout: 60000 });
            await parts[0].type('input[name="contribution"], input[name="player.contribution"]', '40');
            await parts[0].click('button', 'Next');
            if (want('otree-participant')) await shot(parts[1], 'otree-participant', { x: 0, y: 0, width: 1200, height: 320 });
            if (want('otree-session')) {
                const page = await browser.open(url + '/admin/otree/#/session/' + encodeURIComponent(s.id) + '/monitor');
                await page.waitFor(() => /P1/.test(document.body.innerText), { what: 'monitor', timeout: 240000 });
                await shot(page, 'otree-session');
                await page.close();
            }
            for (const p of parts) await p.close();
            if (want('otree-studio')) {
                const dir = path.join(apps, 'otree/public_goods_simple');
                const page = await browser.open(url + '/admin/otree/#/studio');
                await page.waitFor(() => [...document.querySelectorAll('a')].some((a) => /public_goods_simple/.test(a.innerText)), { what: 'the studio list', timeout: 240000 });
                await page.eval(() => [...document.querySelectorAll('a')].find((a) => /public_goods_simple/.test(a.innerText) && /studio\/app/.test(a.getAttribute('href'))).click());
                await page.waitFor(() => /Constants/.test(document.body.innerText) && document.querySelector('table'), { what: 'the studio', timeout: 240000 });
                await clickText(page, '.list-group-item', '^Player');
                await shot(page, 'otree-studio');
                await page.close();
            }
        }
    } catch (err) {
        console.error(err);
        process.exitCode = 1;
    } finally {
        await browser.close();
        await server.close();
        data.remove();
    }
})();
