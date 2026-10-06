// The apps in client/apps/2 features, played by bots.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer, app } = require('./harness.js');

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.close(); });

test('moving slider: the chosen probability picks option A or B, and one period is paid', async () => {
    const session = server.createSession(app('2 features/sliderMoving.jtt'), { numParticipants: 1 });
    const [bot] = await server.connectAll(session);
    session.start();
    const sliderApp = session.apps[0];
    assert.equal(sliderApp.numPeriods, 2);

    // Certain A, then certain B.
    await bot.play('hello', { 'player.slider': 100 }, { period: 1 });
    await bot.play('hello', { 'player.slider': 0 }, { period: 2 });
    await bot.waitForEnd();

    const [p1, p2] = bot.players();
    assert.equal(p1.situationName, 'safe vs risky');
    assert.equal(p1.payoff, '10 EUR for sure');
    assert.equal(p2.payoff, '50 EUR with probability 10%, otherwise 0 EUR');
    const paid = bot.participant.payoffs;
    assert.equal(paid.length, 1);
    assert.equal(paid[0].payoff, [p1.payoff, p2.payoff][paid[0].round]);
});
