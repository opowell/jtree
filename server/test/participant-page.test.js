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
