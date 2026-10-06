// What participants are paid: show-up fee, plus points times exchange rates.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('./harness.js');

let server;
before(async () => { server = await startServer({ settings: { session: { suggestedNumParticipants: 2, showUpFee: 5, exchangeRate: 0.1, currency: 'EUR' } } }); });
after(async () => { await server.close(); });

// Each player earns 10 points per period, plus 1 more for P2.
const earning = (rate) => `
    app.numPeriods = 2;
    ${rate == null ? '' : 'app.exchangeRate = ' + rate + ';'}
    const s = app.newStage('s');
    s.playerStart = function(player) { player.points = 10 + (player.participant.id === 'P2' ? 1 : 0); };
`;

test("a participant's payment is the show-up fee plus each app's points times its exchange rate", async () => {
    const session = server.createSession([
        server.writeApp('own-rate.jtt', earning(0.5)),
        server.writeApp('session-rate.jtt', earning(null)),
    ], { numParticipants: 2 });
    assert.deepEqual([session.showUpFee, session.exchangeRate, session.currency], [5, 0.1, 'EUR']);
    const bots = await server.connectAll(session);
    session.start();
    for (const app of [0, 1]) {
        for (let period = 1; period <= 2; period++) {
            await Promise.all(bots.map(b => b.waitFor(() => b.player && b.player.app() === session.apps[app] && b.stageId === 's' && b.player.group.period.id === period)));
            bots.forEach(b => b.submit());
        }
    }
    await Promise.all(bots.map(b => b.waitForEnd()));

    // P1: 5 + 20 * 0.5 + 20 * 0.1 = 17. P2: 5 + 22 * 0.5 + 22 * 0.1 = 18.2.
    assert.deepEqual(session.payments(), [
        { id: 'P1', points: 40, payment: 17 },
        { id: 'P2', points: 44, payment: 18.2 },
    ]);
    assert.equal(session.participants.P2.shell().payment, 18.2);
});
