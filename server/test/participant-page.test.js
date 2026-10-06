// The page a participant's browser loads.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer, app } = require('./harness.js');

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.close(); });

test("a folder app's participant page has the screens of its stage files", async () => {
    const session = server.createSession(app('1 sample games/public-good-v2/app.jtt'), { numParticipants: 1 });
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
