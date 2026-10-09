// jtree in a real browser (headless Chrome, test/browser.js): participants' pages and the admins,
// with their scripts and sockets. Skipped where there is no Chrome.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { startServer } = require('./harness.js');
const { launch, findChrome } = require('./browser.js');
const python = require('../source/dialects/otree/runtime.js');
const { convertApp } = require('../source/dialects/otree/convert.js');
const ztree = require('./ztree-examples.js');

const skip = findChrome() == null ? 'no Chrome here' : false;
let server, browser, apps;

before(async () => {
    if (skip) return;
    // The test oTree project and samples, copied (converting writes beside them), as the apps folder.
    apps = fs.mkdtempSync(path.join(os.tmpdir(), 'jtree-browser-'));
    fs.cpSync(path.join(__dirname, 'fixtures/otree'), path.join(apps, 'project'), { recursive: true });
    for (const name of ['public_goods_simple', 'prisoner', '_templates']) {
        fs.cpSync(path.join(__dirname, 'fixtures/otree-samples', name), path.join(apps, 'samples', name), { recursive: true });
    }
    await python.ready();
    server = await startServer({ settings: { appFolders: [apps] } });
    browser = await launch();
});
after(async () => {
    if (skip) return;
    await browser.close();
    await server.close();
    fs.rmSync(apps, { recursive: true, force: true });
});

/** Opens each participant's page of session, in its own tab. */
function openParticipants(session) {
    return Promise.all(Object.keys(session.participants).map((id) => browser.open(server.url + '/session/' + session.id + '/' + id)));
}

const visibleText = (page) => page.eval(() => document.body.innerText);

test('a jtree app converted from an oTree app, played in browsers', { skip }, async () => {
    const out = path.join(apps, 'converted/public_goods_simple');
    await convertApp(path.join(apps, 'samples/public_goods_simple'), out);
    const session = server.createSession(path.join(out, 'app.jtt'), { numParticipants: 3 });
    session.start();
    const pages = await openParticipants(session);
    for (const [i, page] of pages.entries()) {
        await page.waitFor(() => /This is a public goods game with\s+3 players per group/.test(document.body.innerText),
            { what: 'the Contribute page' });
        await page.type('input[name="player.contribution"]', String(10 * (i + 1)));
        await page.click('button', 'Next');
    }
    for (const [i, page] of pages.entries()) {
        await page.waitFor(() => /Your profit is therefore/.test(document.body.innerText), { what: 'the Results page' });
        const text = await visibleText(page);
        assert.match(text, new RegExp('of which you contributed ' + 10 * (i + 1) + '\\.'));
        assert.match(text, /Your group contributed 60,/);
        // 100 - contribution + 60 * 1.8 / 3
        assert.match(text, new RegExp('Your profit is therefore ' + (100 - 10 * (i + 1) + 36) + '\\.'));
        assert.deepEqual(page.errors, []);
        await page.close();
    }
});

test("oTree's chat, between a group's participants' pages", { skip }, async () => {
    const session = server.createSession(path.join(apps, 'samples/prisoner/__init__.py'), { numParticipants: 2 });
    session.start();
    const [p1, p2] = await openParticipants(session);
    for (const page of [p1, p2]) {
        await page.waitFor(() => /Introduction/.test(document.body.innerText), { what: 'the Introduction page' });
        await page.click('button', 'Next');
        await page.waitFor(() => document.querySelector('.otree-chat__input') != null && document.querySelector('.otree-chat__input').offsetParent != null,
            { what: 'the chat on the Decision page' });
    }
    await p1.type('.otree-chat__input', 'Shall we cooperate?');
    await p1.click('.otree-chat__send');
    for (const page of [p1, p2]) {
        await page.waitFor(() => /Shall we cooperate\?/.test(document.querySelector('.otree-chat__messages').innerText),
            { what: 'the message in the chat' });
    }
    assert.match(await p2.eval(() => document.querySelector('.otree-chat__messages').innerText), /Player 1/);
    assert.deepEqual([...p1.errors, ...p2.errors], []);
    await p1.close();
    await p2.close();
});

test('the oTree admin: a session from a config, opened in a room a participant waits in; converting an app', { skip }, async () => {
    const admin = await browser.open(server.url + '/admin/otree/#/sessions');
    await admin.waitFor(() => [...document.querySelectorAll('#config option')].some((o) => /public_goods/.test(o.value)),
        // The admin compiles its source in the browser first: slow in a new profile.
        { what: "the project's session configs", timeout: 240000 });
    const configId = await admin.eval(() => [...document.querySelectorAll('#config option')].find((o) => /public_goods$/.test(o.value)).value);
    await admin.type('#config', configId);
    await admin.type('#participants', '3');
    await admin.click('button', 'Create');
    await admin.waitFor(() => /Participant links/.test(document.body.innerText) && document.querySelectorAll('td a[href*="/session/"]').length === 3,
        { what: "the new session's links" });
    const sessionId = decodeURIComponent(await admin.eval(() => location.hash.split('/')[2]));

    // A participant waits in the lab, by their label; the admin opens the session there.
    const seat = await browser.open(server.url + '/room/lab/seat1');
    await seat.waitFor(() => document.readyState === 'complete' && document.body.innerText.length > 0, { what: 'the room page' });
    await admin.eval(() => { location.hash = '#/rooms'; });
    await admin.waitFor(() => /The lab/.test(document.body.innerText), { what: 'the rooms' });
    await admin.eval((id) => {
        const select = [...document.querySelectorAll('.card')].find((c) => /The lab/.test(c.innerText)).querySelector('select');
        select.value = id;
        select.dispatchEvent(new Event('change'));
    }, sessionId);
    await admin.eval(() => [...document.querySelectorAll('.card')].find((c) => /The lab/.test(c.innerText)).querySelector('button').click());
    await seat.waitFor(() => location.pathname.includes('/session/') && /Contribute|contribut/i.test(document.body.innerText),
        { what: "the session's first page, in the room's participant", timeout: 60000 });
    assert.equal(server.jt.data.session(sessionId).participants.P1.label, 'seat1');
    await seat.close();

    // Converting an app: a jtree app beside it, and its report.
    await admin.eval(() => { location.hash = '#/apps'; });
    await admin.waitFor(() => [...document.querySelectorAll('.card h2')].some((h) => h.textContent === 'public_goods'), { what: 'the apps' });
    await admin.eval(() => [...document.querySelectorAll('.card')].find((c) => c.querySelector('h2').textContent === 'public_goods').querySelector('button').click());
    const card = () => [...document.querySelectorAll('.card')].find((c) => c.querySelector('h2').textContent === 'public_goods').innerText;
    try {
        await admin.waitFor((f) => /Converts/.test(eval(f)()), { what: 'the conversion report', timeout: 60000 }, String(card));
    } catch (err) {
        throw new Error(err.message + '; the card says: ' + await admin.eval(card));
    }
    assert.ok(fs.existsSync(path.join(apps, 'project/public_goods-jtree/app.jtt')));
    assert.ok(Object.keys(server.jt.data.apps).includes(path.join(apps, 'project/public_goods-jtree/app.jtt')));
    assert.deepEqual(admin.errors, []);
    await admin.close();
});

test("admin v2: a session's rooms, and opening it in one", { skip }, async () => {
    const session = server.createSession(path.join(apps, 'samples/public_goods_simple/__init__.py'), { numParticipants: 3 });
    const admin = await browser.open(server.url + '/admin/');
    await admin.waitFor(() => document.body.innerText.length > 0, { what: 'admin v2', timeout: 240000 });
    // The session it last had open, opened again.
    await admin.eval((id) => { localStorage.setItem('jtree-admin2-session', id); location.reload(); }, session.id);
    await admin.waitFor(() => /Online/.test(document.body.innerText) && /The lab/.test(document.body.innerText),
        { what: "the session panel's rooms", timeout: 240000 });
    await admin.eval(() => [...document.querySelectorAll('li')].find((l) => /Online/.test(l.innerText)).querySelector('button').click());
    await admin.waitFor(() => /this session is open here/.test([...document.querySelectorAll('li')].find((l) => /Online/.test(l.innerText)).innerText),
        { what: 'the room with the session' });
    assert.equal(server.jt.data.room('online').shell().sessionId, session.id);
    assert.deepEqual(admin.errors, []);
    await admin.close();
});

test('z-Tree: a public goods game in browsers, with z-Leaf\'s messages and waiting screen', { skip }, async (t) => {
    if (!(await ztree.ensureExamples())) return t.skip("z-Tree's examples could not be downloaded");
    const session = server.createSession(ztree.file('pg'), { numParticipants: 2 });
    session.start();
    const pages = await openParticipants(session);
    for (const page of pages) {
        await page.waitFor(() => /Your contribution to the project/.test(document.body.innerText), { what: 'the contribution screen' });
    }
    const [p1, p2] = pages;
    assert.match(await p1.text(), /Period 1 of 1/);
    await p1.waitFor(() => /Remaining time \[sec\]: \d+/.test(document.body.innerText), { what: 'the time left' });
    await p1.type('input[name="Contribution"]', '25');
    await p1.click('.ztree-button', 'OK');
    await p1.waitFor(() => /Please enter a number from 0 to 20/.test(document.body.innerText), { what: "z-Leaf's message" });
    await p1.click('.ztree-message-ok');
    await p1.type('input[name="Contribution"]', '5');
    await p1.click('.ztree-button', 'OK');
    await p1.waitFor(() => /Please wait until the experiment continues/.test(document.body.innerText), { what: 'the waiting screen' });
    await p2.type('input[name="Contribution"]', '10');
    await p2.click('.ztree-button', 'OK');
    await p1.waitFor(() => /Your Income in this period\s*27\.0/.test(document.body.innerText), { what: 'the profit' });
    await p2.waitFor(() => /Your Income in this period\s*22\.0/.test(document.body.innerText), { what: 'the profit' });
    assert.deepEqual([...p1.errors, ...p2.errors], []);
    for (const page of pages) await page.close();
});

test('z-Tree: a double auction in browsers: an offer shows at once on a buyer\'s screen, who buys it', { skip }, async (t) => {
    if (!(await ztree.ensureExamples())) return t.skip("z-Tree's examples could not be downloaded");
    const session = server.createSession(ztree.file('noda'), { numParticipants: 8 });
    session.start();
    const seller = await browser.open(server.url + '/session/' + session.id + '/P1');
    const buyer = await browser.open(server.url + '/session/' + session.id + '/P5');
    await seller.waitFor(() => /Make offer/.test(document.body.innerText), { what: "the seller's market" });
    await buyer.waitFor(() => /buy/.test(document.body.innerText), { what: "the buyer's market" });
    // The buyer starts typing an offer of their own: kept while the screen changes.
    await buyer.type('input[name="Price"]', '42');
    await seller.type('input[name="Price"]', '150');
    await seller.click('.ztree-button', 'Make offer');
    try {
        await buyer.waitFor(() => [...document.querySelectorAll('.ztree-row')].some((r) => /150/.test(r.innerText)), { what: 'the offer on the buyer\'s screen' });
    } catch (err) {
        // What the server has, and what each page shows.
        const run = session.apps[0].ztreeRun;
        const state = (page) => page.eval(() => ({
            text: document.body.innerText.slice(0, 600),
            pages: document.querySelectorAll('.ztree-page').length,
            versions: [...document.querySelectorAll('.ztree-screen')].map((e) => e.getAttribute('data-version')),
            stage: window.jt && jt.data && jt.data.player && jt.data.player.stage && jt.data.player.stage.id,
            status: window.jt && jt.data && jt.data.player && jt.data.player.status,
        }));
        throw new Error(err.message + '\ncontracts: ' + JSON.stringify(run.periods[0].contracts) + '\nerrors: ' + JSON.stringify(run.errors) +
            '\nserver, buyer: version ' + session.participants.P5.player.ztreeVersion + ', ' + session.participants.P5.player.status +
            '\nbuyer page: ' + JSON.stringify(await state(buyer)) + '\nseller page: ' + JSON.stringify(await state(seller)) +
            '\nseller errors: ' + seller.errors.join(' | '));
    }
    assert.equal(await buyer.eval(() => document.querySelector('input[name="Price"]').value), '42');
    await buyer.eval(() => [...document.querySelectorAll('.ztree-row')].find((r) => /150/.test(r.innerText)).click());
    await buyer.click('.ztree-button', 'buy');
    await buyer.waitFor(() => /Current Profit\s*250/.test(document.body.innerText), { what: "the buyer's profit" });
    try {
        await seller.waitFor(() => /Current Profit\s*130/.test(document.body.innerText), { what: "the seller's profit" });
    } catch (err) {
        const p1 = session.participants.P1.player;
        throw new Error(err.message + '\nserver, seller: version ' + p1.ztreeVersion + ', ' + p1.status + ', profit ' + session.apps[0].ztreeRun.periods[0].subjects[0].Profit +
            '\nseller page: ' + JSON.stringify(await seller.eval(() => ({
                text: document.body.innerText.slice(0, 400),
                versions: [...document.querySelectorAll('.ztree-screen')].map((e) => e.getAttribute('data-version')),
            }))));
    }
    assert.deepEqual([...seller.errors, ...buyer.errors], []);
    await seller.close();
    await buyer.close();
});
