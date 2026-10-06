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

// Per-player time (stage.clientDuration, oTree's page timeout) and stages that stay open.

/** A started 1-participant session of an app with a 'work' stage, set up by code; returns the bot. */
async function oneStage(name, setup) {
    const session = server.createSession(server.writeApp(name, `
        app.stageTimeoutGrace = 0.3;
        app.seen = {};
        const work = app.newStage('work');
        work.playerEnd = function(player) { app.seen[player.participant.id] = player.timedOut; };
        ${setup}
        app.newStage('next');
    `), { numParticipants: 2 });
    const bots = await server.connectAll(session);
    session.start();
    return { session, bots };
}

test("a player's own time: the server ends the stage for a silent page after the grace period", async () => {
    const { session, bots } = await oneStage('player-time.jtt', `work.clientDuration = 1; work.waitToEnd = false; app.stageWaitToStart = false;`);
    const [answering, silent] = bots;
    await Promise.all(bots.map(b => b.waitForStage('work')));
    silent.answersTimeouts = false;
    const start = Date.now();
    await answering.waitForStage('next', { timeout: 4000 });
    const answered = Date.now() - start;
    await silent.waitForStage('next', { timeout: 4000 });
    const ended = Date.now() - start;
    assert.ok(answered >= 900 && answered < 1250, 'answering page done after ' + answered + ' ms');
    assert.ok(ended >= 1250, 'silent page ended after ' + ended + ' ms');
    assert.deepEqual(session.apps[0].seen, { P1: true, P2: true });
});

test("a player's own time can differ per player", async () => {
    const { session, bots } = await oneStage('player-time-each.jtt', `
        work.waitToEnd = false;
        app.stageWaitToStart = false;
        work.getClientDuration = function(player) { return player.participant.id === 'P1' ? 0.5 : 0; };
    `);
    await Promise.all(bots.map(b => b.waitForStage('work')));
    await bots[0].waitForStage('next', { timeout: 3000 });
    // P2 has no time limit: still working.
    assert.equal(bots[1].stageId, 'work');
    bots[1].submit();
    await bots[1].waitForStage('next');
    assert.deepEqual(session.apps[0].seen, { P1: true, P2: undefined });
});

test('with endOnTimeout false, a timed-out stage stays open until the players submit', async () => {
    const { session, bots } = await oneStage('stays-open.jtt', `work.duration = 0.5; work.endOnTimeout = false;`);
    await Promise.all(bots.map(b => b.waitForStage('work')));
    await new Promise(r => setTimeout(r, 1200));
    for (const b of bots) {
        assert.equal(b.stageId, 'work');
        assert.equal(b.player.timedOut, true);
    }
    bots.forEach(b => b.submit());
    await Promise.all(bots.map(b => b.waitForStage('next')));
    assert.deepEqual(session.apps[0].seen, { P1: true, P2: true });
});
