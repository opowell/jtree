// The oTree admin (/admin/otree/) and the messages it uses: session configs, creating a session
// from one, the monitor.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { io: ioClient } = require('socket.io-client');
const { startServer } = require('./harness.js');
const python = require('../source/dialects/otree/runtime.js');
const { runBots } = require('../source/dialects/otree/bots.js');

const SETTINGS = path.join(__dirname, 'fixtures/otree/settings.py');
let server, admin;

before(async () => {
    server = await startServer();
    await python.ready();
    server.jt.data.loadAppDir(path.join(__dirname, 'fixtures/otree'));
    // An admin's socket, as the admin pages open (allowed from this computer without a password).
    admin = ioClient(server.url, { path: '/socket.io', transports: ['websocket'], forceNew: true,
        query: { id: '', type: 'ADMIN', sessionId: '', roomId: 'null' } });
    await new Promise((resolve, reject) => { admin.once('connect', resolve); admin.once('connect_error', reject); });
});
after(async () => { admin.close(); await server.close(); });

const next = (name) => new Promise((resolve) => admin.once(name, resolve));

test('the oTree admin is served at /admin/otree/, its source too', async () => {
    const page = await fetch(server.url + '/admin/otree/');
    assert.equal(page.status, 200);
    assert.match(await page.text(), /boot\.js/);
    for (const file of ['boot.js', 'src/App.vue', 'src/server.ts', 'src/views/Session.vue']) {
        assert.equal((await fetch(server.url + '/admin/otree/' + file)).status, 200, file);
    }
});

test("admins get an oTree project's session configs, and create a session from one", async () => {
    const refreshed = next('refreshAdmin');
    admin.emit('refreshAdmin', { userId: '' });
    const configs = Object.values((await refreshed).apps).filter((a) => a.otreeConfig).map((a) => a.otreeConfig.name);
    assert.ok(configs.includes('trust_then_guess'), configs.join(', '));

    const opened = next('openSession');
    admin.emit('otreeCreateSession', { configId: SETTINGS + '#trust_then_guess', numParticipants: 4,
        config: { bonus: 7, participation_fee: 2 } });
    const shell = await opened;
    const session = server.jt.data.session(shell.id);
    assert.deepEqual([Object.keys(session.participants).length, session.started], [4, true]);
    assert.deepEqual([session.otreeConfig.bonus, session.showUpFee], [7, 2]);
    assert.equal(shell.otreeConfig.bonus, 7);

    let monitor = next('otreeMonitor');
    admin.emit('otreeMonitor', session.id);
    let rows = (await monitor).rows;
    // Trustors send; trustees, who do not, wait for them.
    assert.deepEqual(rows.map(r => [r.code, r.app, r.round, r.page, r.status]), [
        ['P1', 'trust', 1, 'Send', 'playing'], ['P2', 'trust', 1, 'SendBackWaitPage', 'ready'],
        ['P3', 'trust', 1, 'Send', 'playing'], ['P4', 'trust', 1, 'SendBackWaitPage', 'ready'],
    ]);

    await runBots(session);
    monitor = next('otreeMonitor');
    admin.emit('otreeMonitor', session.id);
    rows = (await monitor).rows;
    assert.ok(rows.every(r => r.status === 'finished'), JSON.stringify(rows));
    // 2 + points * 0.5 each.
    assert.deepEqual(rows.map(r => r.payment), rows.map(r => 2 + r.payoff * 0.5));
});
