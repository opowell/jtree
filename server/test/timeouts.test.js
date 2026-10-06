// Stages that time out.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer, app } = require('./harness.js');

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.close(); });

/** A started real-effort session (a 1-second work stage) with n bots, recording player.timedOut at the end of work. */
async function realEffort(n, options = {}) {
    const session = server.createSession(app('1 sample games/real-effort-sums.jtt'), {
        numParticipants: n,
        options: { workTime: 1, numTasks: 2, ...options },
    });
    const bots = await server.connectAll(session);
    session.start();
    // After starting, which loads the app again.
    const work = session.apps[0].stages[0];
    const timedOut = {};
    const playerEnd = work.playerEnd;
    work.playerEnd = function(player) {
        timedOut[player.participant.id] = player.timedOut;
        return playerEnd.call(this, player);
    };
    return { session, bots, timedOut };
}

test('a timed-out stage is marked for the players who had not submitted', async () => {
    const { bots, timedOut } = await realEffort(2);
    const [early, late] = bots;
    await early.play('work', {});
    // late leaves it to the timer; its page then submits what it has.
    await Promise.all(bots.map(b => b.waitForStage('results', { timeout: 4000 })));
    assert.deepEqual(timedOut, { P1: undefined, P2: true });
    // Cleared at the next stage.
    assert.equal(late.player.timedOut, false);
});

test('a player whose page does not answer the timeout is ended by the server after the grace period', async () => {
    const { bots, timedOut } = await realEffort(1, { stageTimeoutGrace: 0.3 });
    const [bot] = bots;
    await bot.waitForStage('work');
    bot.answersTimeouts = false;
    bot.fill({ 'player.A0': 1 }); // never sent
    const start = Date.now();
    await bot.waitForStage('results', { timeout: 4000 });
    assert.ok(Date.now() - start >= 1000 + 300 - 50, 'ended after ' + (Date.now() - start) + ' ms');
    assert.equal(timedOut.P1, true);
    assert.equal(bot.players()[0].A0, undefined);
});

test('with timeoutGrace null, the server waits for the page', async () => {
    const { bots } = await realEffort(1, { stageTimeoutGrace: null });
    const [bot] = bots;
    await bot.waitForStage('work');
    bot.answersTimeouts = false;
    await new Promise(r => setTimeout(r, 1500));
    assert.equal(bot.stageId, 'work');
    bot.submit();
    await bot.waitForStage('results');
});
