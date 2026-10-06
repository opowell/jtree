// The games in client/apps/1 sample games, played by bots from start to end (games.js).

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { startServer, app } = require('./harness.js');
const games = require('./games.js');

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.close(); });

for (const game of games) {
    test(game.name, async () => {
        const session = server.createSession(app('1 sample games/' + game.file), { numParticipants: game.participants, options: game.options });
        const bots = await server.connectAll(session);
        session.start();
        await game.play({ session, bots, app: session.apps[0] });
    });
}

test('public good, as a folder with one file per stage', async () => {
    const session = server.createSession(app('1 sample games/public-good-v2/app.jtt'), { numParticipants: 4 });
    const bots = await server.connectAll(session);
    session.start();
    const pgApp = session.apps[0];
    assert.deepEqual(pgApp.stages.map(s => s.id), ['decide', 'results']);
    for (let period = 1; period <= pgApp.numPeriods; period++) {
        await Promise.all(bots.map((b, i) => b.play('decide', { 'player.contribution': i * 5 }, { period })));
        await Promise.all(bots.map(b => b.play('results', {}, { period })));
    }
    await Promise.all(bots.map(b => b.waitForEnd()));
    // 30 contributed, doubled and shared among 4: 15 each.
    for (const [i, b] of bots.entries()) {
        for (const pl of b.players()) assert.equal(pl.points, 20 - i * 5 + 15);
    }
    // The session's copy of the app has its stage files.
    const copied = fs.readdirSync(pgApp.getOutputFN()).sort();
    assert.deepEqual(copied, ['1_decide.jtt', '2_results.jtt', 'app.jtt']);
});
