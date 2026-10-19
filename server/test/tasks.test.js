// The apps for tasks before or after another app: control questions, the cognitive reflection
// test and Holt and Laury's lottery choices (client/apps/control-questions, crt, holt-laury), on
// their own. The GIMS app adds them as stages (gims.test.js).

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { startServer, CLIENT } = require('./harness.js');

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.close(); });

const app = (name) => path.join(CLIENT, 'apps', name, 'app.jtt');

test('control questions, the CRT and the lottery choices, one after another, each paid in its own points', async () => {
    const questions = JSON.stringify([{ question: 'Yes?', options: ['No', 'Yes'], answer: 1 }, { question: 'How many?', answer: 3 }]);
    const session = server.createSession([app('control-questions'), app('crt'), app('holt-laury')], { numParticipants: 2 });
    session.apps[0].setOptionValue('questions', questions);
    session.apps[0] = session.apps[0].reload();
    session.apps[1].setOptionValue('pay', 10);
    session.apps[1] = session.apps[1].reload();
    assert.deepEqual(session.apps.map((a) => a.stages.map((s) => s.id)), [['questions'], ['crt', 'crtResult'], ['lotteries', 'lotteryResult']]);
    const bots = await server.connectAll(session);
    session.start();
    // Each plays alone (groups of one): P1 goes on while P2 has not answered.
    await bots[0].play('questions', { 'player.cq1': 1, 'player.cq2': 4 });
    assert.deepEqual(Object.keys(await bots[0].waitForFormErrors()), ['player.cq2']);
    bots[0].submit({ 'player.cq2': 3 });
    await bots[0].play('crt', { 'player.crt1': 5, 'player.crt2': 100, 'player.crt3': 47 });
    await bots[0].play('crtResult', {});
    await bots[1].play('questions', { 'player.cq1': 1, 'player.cq2': 3 });
    await bots[1].play('crt', {});
    await bots[1].play('crtResult', {});
    const all = { };
    for (let i = 1; i <= 10; i++) all['player.hl' + i] = i <= 4 ? 'A' : 'B';
    await Promise.all(bots.map((b) => b.play('lotteries', all)));
    await Promise.all(bots.map((b) => b.play('lotteryResult', {})));
    await Promise.all(bots.map((b) => b.waitForEnd()));
    const crt = bots.map((b) => b.players(session.apps[1])[0]);
    assert.deepEqual(crt.map((p) => [p.crtScore, p.crtEarnings]), [[2, 20], [0, 0]]);
    for (const b of bots) {
        const p = b.players(session.apps[2])[0];
        assert.equal(p.hlSafeChoices, 4);
        assert.equal(p.hlChoice, p.hlRow <= 4 ? 'A' : 'B');
        const high = p.hlDie <= p.hlRow;
        assert.equal(p.hlEarnings, p.hlChoice === 'A' ? (high ? 2 : 1.6) : (high ? 3.85 : 0.1));
        assert.ok(Math.abs(b.participant.points() - (p.hlEarnings + (b === bots[0] ? 20 : 0))) < 1e-9);
    }
});
