// The page a participant's browser loads.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { startServer, app } = require('./harness.js');

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.close(); });

test("a folder app's participant page has the screens of its stage files", async () => {
    const session = server.createSession(app('2 features/public-good-v2/app.jtt'), { numParticipants: 1 });
    await server.connectAll(session);
    session.start();
    const res = await fetch(server.url + '/session/' + session.id + '/P1');
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.match(html, /<p>DECISION<\/p>/);
    assert.match(html, /<p>RESULTS<\/p>/);
    assert.match(html, /name='player\.contribution'/);
});

test('socket.io answers its own requests (polling, as browsers start with)', async () => {
    const res = await fetch(server.url + '/socket.io/?EIO=4&transport=polling');
    assert.equal(res.status, 200);
    assert.match(await res.text(), /"sid"/);
    // The server is still up. (shared.js is made when jtree starts, and not in the repo.)
    assert.equal((await fetch(server.url + '/shared/popups.css')).status, 200);
});

test('shared.js is served from where jtree made it (clientJSFile), with jt in it', async () => {
    const res = await fetch(server.url + '/shared/shared.js');
    assert.equal(res.status, 200);
    assert.match(await res.text(), /\bjt\b/);
});

test('participant pages ask before leaving, unless askBeforeLeaving is false', async () => {
    assert.match(await (await fetch(server.url + '/shared/shared.js')).text(), /jt\.askBeforeLeaving = 'true'/);
    const quiet = await startServer({ settings: { askBeforeLeaving: false } });
    try {
        assert.match(await (await fetch(quiet.url + '/shared/shared.js')).text(), /jt\.askBeforeLeaving = 'false'/);
        // Saving a setting from the admin keeps the others in settings.json.
        quiet.jt.settings.setMultipleUsers(true);
        const json = JSON.parse(fs.readFileSync(path.join(quiet.jt.path, 'settings.json'), 'utf8'));
        assert.equal(json.askBeforeLeaving, false);
        assert.equal(json.multipleUsers, true);
    } finally {
        await quiet.close();
    }
});
