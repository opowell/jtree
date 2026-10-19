// The apps GIMS (client/apps/gims) is made of, each played on its own: the market, with its
// rounds paid; the chat, bonds, forecasts, lottery tickets, account status and rating; the control
// questions, the CRT and the lottery choices; and the payment of the session's apps.
// gims.test.js plays them together, as GIMS's studies have them.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { startServer, CLIENT } = require('./harness.js');

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.close(); });

const app = (name) => path.join(CLIENT, 'apps/gims', name, 'app.jtt');

/** A session of one app of GIMS's folder, with a preset and changes to it. */
function session(name, preset, changes, n) {
    return server.createSession(app(name), { numParticipants: n, options: { preset, changes: JSON.stringify(changes || {}) } });
}

test('every app loads on its own, with each of its presets', () => {
    for (const name of ['market', 'chat', 'bonds', 'forecasts', 'lottery-ticket', 'account-status', 'rating', 'payment', 'control-questions', 'crt', 'holt-laury']) {
        const { PRESETS } = require(path.join(CLIENT, 'apps/gims', name, 'presets.js'));
        for (const id of Object.keys(PRESETS)) {
            const s = session(name, id, {}, 2);
            assert.ok(s.apps[0].stages.length > 0, name + ' ' + id);
        }
    }
});

test('the market alone pays each round as its points', async () => {
    const s = session('market', 'ssw', { traders: 2, rounds: 2, periods: 1, tradingTime: 30, resultsTime: 0, assignment: 'order', endowments: [{ cash: 100, assets: 1 }], assets: [{ name: 'Asset', dividends: [10] }] }, 2);
    assert.deepEqual(s.apps[0].stages.map((st) => st.id), ['trading', 'results']);
    const bots = await server.connectAll(s);
    s.start();
    for (const period of [1, 2]) {
        for (const stage of ['trading', 'results']) await Promise.all(bots.map((b) => b.play(stage, {}, { period })));
    }
    await Promise.all(bots.map((b) => b.waitForEnd()));
    // Each round: 100 and a unit that pays 10.
    assert.deepEqual(s.payments().map((p) => p.points), [220, 220]);
});

test('control questions, the CRT and the lottery choices, one after another, each paid in its own points', async () => {
    const questions = [{ question: 'Yes?', options: ['No', 'Yes'], answer: 1 }, { question: 'How many?', answer: 3 }];
    const s = server.createSession([app('control-questions'), app('crt'), app('holt-laury')], { numParticipants: 2 });
    for (const [i, changes] of [[0, { controlQuestions: questions }], [1, { crtPay: 10 }]]) {
        s.apps[i].setOptionValue('changes', JSON.stringify(changes));
        s.apps[i] = s.apps[i].reload();
    }
    assert.deepEqual(s.apps.map((a) => a.stages.map((st) => st.id)), [['questions'], ['crt', 'crtResult'], ['lotteries', 'lotteryResult']]);
    const bots = await server.connectAll(s);
    s.start();
    // Each plays alone (groups of one): P1 goes on while P2 has not answered.
    await bots[0].play('questions', { 'player.cq1': 1, 'player.cq2': 4 });
    assert.deepEqual(Object.keys(await bots[0].waitForFormErrors()), ['player.cq2']);
    bots[0].submit({ 'player.cq2': 3 });
    await bots[0].play('crt', { 'player.crt1': 5, 'player.crt2': 100, 'player.crt3': 47 });
    await bots[0].play('crtResult', {});
    await bots[1].play('questions', { 'player.cq1': 1, 'player.cq2': 3 });
    await bots[1].play('crt', {});
    await bots[1].play('crtResult', {});
    const all = {};
    for (let i = 1; i <= 10; i++) all['player.hl' + i] = i <= 4 ? 'A' : 'B';
    await Promise.all(bots.map((b) => b.play('lotteries', all)));
    await Promise.all(bots.map((b) => b.play('lotteryResult', {})));
    await Promise.all(bots.map((b) => b.waitForEnd()));
    const crt = bots.map((b) => b.players(s.apps[1])[0]);
    assert.deepEqual(crt.map((p) => [p.crtScore, p.crtEarnings]), [[2, 20], [0, 0]]);
    for (const b of bots) {
        const p = b.players(s.apps[2])[0];
        assert.equal(p.hlSafeChoices, 4);
        assert.equal(p.hlChoice, p.hlRow <= 4 ? 'A' : 'B');
        const high = p.hlDie <= p.hlRow;
        assert.equal(p.hlEarnings, p.hlChoice === 'A' ? (high ? 2 : 1.6) : (high ? 3.85 : 0.1));
        assert.ok(Math.abs(b.participant.points() - (p.hlEarnings + (b === bots[0] ? 20 : 0))) < 1e-9);
    }
});

test('the lottery choices without the screen of their result', () => {
    const s = session('holt-laury', 'breaban-noussair-2015-bull', {}, 1);
    assert.deepEqual(s.apps[0].stages.map((st) => st.id), ['lotteries']);
    assert.deepEqual(session('holt-laury', 'example', { holtLauryResult: false }, 1).apps[0].stages.map((st) => st.id), ['lotteries']);
});

test('bonds, forecasts, a lottery ticket, a chat, an account status, a rating and the payment, each alone', async () => {
    const s = server.createSession(['bonds', 'forecasts', 'lottery-ticket', 'chat', 'account-status', 'rating', 'payment'].map(app), { numParticipants: 2 });
    const set = (i, changes) => {
        s.apps[i].setOptionValue('changes', JSON.stringify(changes));
        s.apps[i] = s.apps[i].reload();
    };
    set(2, { lottery: { price: 6, prize: 120, chance: 1 } });
    set(3, { chatTime: 1 });
    set(6, { minPayoff: 300 });
    const bots = await server.connectAll(s);
    s.start();
    // Bonds: 1000 of cash; P1 puts 400 into bonds at 5%.
    await Promise.all(bots.map((b, i) => b.play('bonds', { 'player.bondInput': [400, 0][i] })));
    await Promise.all(bots.map((b) => b.play('bondsBack', {})));
    // A forecast of 100 and of 300, scored against 100.
    await Promise.all(bots.map((b, i) => b.play('forecast', { 'player.forecast1': [100, 300][i] })));
    await Promise.all(bots.map((b) => b.play('forecastResults', {})));
    // A ticket for P1, which wins.
    await Promise.all(bots.map((b, i) => b.play('ticket', { 'player.lotteryTicket': ['yes', 'no'][i] })));
    await Promise.all(bots.map((b) => b.play('ticketResult', {})));
    await bots[0].waitForStage('chat');
    bots[0].send('chatMessage', { text: 'Hi' });
    await bots[0].waitFor(() => bots[0].player.group.chat.rows.length === 1, { what: 'the message' });
    await Promise.all(bots.map((b) => b.waitForStage('accountStatus')));
    // Points so far: P1 20 + 50 + 114, P2 nothing.
    assert.deepEqual(bots.map((b) => b.player.accountTotal), [184, 0]);
    assert.equal(bots[1].player.group.reference, 184);
    await Promise.all(bots.map((b) => b.play('accountStatus', {})));
    await Promise.all(bots.map((b) => b.play('rating', { 'player.rating': 3 })));
    await Promise.all(bots.map((b) => b.waitForStage('payment')));
    const pay = bots.map((b) => b.player);
    assert.deepEqual(pay[0].otherEarnings.map((r) => r.points), [20, 50, 114]);
    assert.deepEqual(pay.map((p) => [p.topUp, p.totalPoints]), [[116, 300], [300, 300]]);
    await Promise.all(bots.map((b) => b.play('payment', {})));
    await Promise.all(bots.map((b) => b.waitForEnd()));
    assert.deepEqual(s.payments().map((p) => p.points), [300, 300]);
    assert.equal(bots[0].players(s.apps[3])[0].group.chat.rows[0].wealth, null);
});
