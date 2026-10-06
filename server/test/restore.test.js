// Sessions saved by one jtree and loaded by the next (the loadSessions setting).

const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { startServer, makeDataDir, app } = require('./harness.js');
const Session = require('../source/Session.js').new;

/** Plays period 1 of a public good game up to its results, then stops jtree; returns the session's id. */
async function playAndStop(data, appPath) {
    const server = await startServer({ data });
    try {
        const session = server.createSession(appPath, { numParticipants: 2 });
        const bots = await server.connectAll(session);
        session.start();
        await Promise.all(bots.map((b, i) => b.play('decide', { 'player.contribution': 5 * (i + 1) }, { period: 1 })));
        await Promise.all(bots.map(b => b.waitForStage('results', { period: 1 })));
        return session.id;
    } finally {
        await server.close();
    }
}

/** The session with id, as the next jtree on data loads it. */
async function restore(data, id) {
    const server = await startServer({ data, settings: { loadSessions: true } });
    return { server, session: server.jt.data.sessions.find(s => s.id === id) };
}

for (const [name, appPath] of [
    ['an app', app('1 sample games/public-good.jtt')],
    ['a folder app', app('1 sample games/public-good-v2/app.jtt')],
]) {
    test('a saved session comes back with ' + name + ', its stages, players and their data', async () => {
        const data = makeDataDir();
        try {
            const id = await playAndStop(data, appPath);
            const { server, session } = await restore(data, id);
            try {
                assert.ok(session, 'session ' + id + ' was not loaded');
                assert.equal(session.apps.length, 1);
                const pgApp = session.apps[0];
                assert.deepEqual(pgApp.stages.map(s => s.id), ['decide', 'results']);
                // The app's code ran again: its functions are back.
                assert.equal(typeof pgApp.stages[1].groupStart, 'function');
                assert.equal(pgApp.endowment, 20);

                const players = pgApp.periods[0].groups.flatMap(g => g.players);
                const byId = Object.fromEntries(players.map(p => [p.participant.id, p]));
                assert.equal(byId.P1.contribution, 5);
                assert.equal(byId.P2.contribution, 10);
                // 15 contributed, doubled, shared by 2: 15 each.
                assert.equal(byId.P1.points, 30);
                assert.equal(byId.P2.points, 25);
                for (const p of players) {
                    assert.equal(p.stage.id, 'results');
                    assert.equal(p.participant.player, p);
                }
            } finally {
                await server.close();
            }
        } finally {
            data.remove();
        }
    });
}

test('a loaded session continues where it stopped, to its end', async () => {
    const data = makeDataDir();
    try {
        const id = await playAndStop(data, app('1 sample games/public-good.jtt'));
        const { server, session } = await restore(data, id);
        try {
            // Created with 4 (the default), then cut to 2: the 2 removed stay removed.
            assert.deepEqual(Object.keys(session.participants).sort(), ['P1', 'P2']);
            const bots = [await server.connect(session, 'P1'), await server.connect(session, 'P2')];
            await Promise.all(bots.map(b => b.play('results', {}, { period: 1 })));
            const pgApp = session.apps[0];
            for (let period = 2; period <= pgApp.numPeriods; period++) {
                await Promise.all(bots.map(b => b.play('decide', { 'player.contribution': 1 }, { period })));
                await Promise.all(bots.map(b => b.play('results', {}, { period })));
            }
            await Promise.all(bots.map(b => b.waitForEnd()));
            for (const b of bots) {
                const players = b.players(pgApp);
                assert.equal(players.length, 10);
                // From period 2: kept 19, plus 2 contributed, doubled, shared by 2.
                for (const pl of players.slice(1)) assert.equal(pl.points, 21);
            }
        } finally {
            await server.close();
        }
    } finally {
        data.remove();
    }
});

test('a loaded session that had started is not started again', async () => {
    const data = makeDataDir();
    try {
        const id = await playAndStop(data, app('1 sample games/public-good.jtt'));
        const { server, session } = await restore(data, id);
        try {
            assert.equal(session.started, true);
            session.start();
            for (const p of Object.values(session.participants)) {
                assert.equal(p.player.stage.id, 'results');
                assert.equal(p.player.group.period.id, 1);
            }
        } finally {
            await server.close();
        }
    } finally {
        data.remove();
    }
});

/** Starts real effort's timed work stage (3 s), stops jtree after 1 s of it; returns the session's id. */
async function stopDuringWork(data, { pause = false } = {}) {
    const server = await startServer({ data });
    try {
        const session = server.createSession(app('1 sample games/real-effort-sums.jtt'), {
            numParticipants: 1, options: { workTime: 3, numTasks: 1 },
        });
        const [bot] = await server.connectAll(session);
        session.start();
        await bot.waitForStage('work');
        await new Promise(r => setTimeout(r, 1000));
        if (pause) session.pause();
        return session.id;
    } finally {
        await server.close();
    }
}

test("a loaded stage's timer runs on with the time it had left, not counting the time jtree was off", async () => {
    const data = makeDataDir();
    try {
        const id = await stopDuringWork(data);
        await new Promise(r => setTimeout(r, 1500)); // off
        const { server, session } = await restore(data, id);
        try {
            const bot = await server.connect(session, 'P1');
            assert.equal(bot.stageId, 'work');
            const start = Date.now();
            await bot.waitForStage('results', { timeout: 5000 });
            const took = Date.now() - start;
            // About 2 s were left; the 1.5 s off do not count.
            assert.ok(took > 1300 && took < 2800, 'ended after ' + took + ' ms');
            assert.equal(bot.players()[0].timedOut, false); // cleared: the next stage has started
        } finally {
            await server.close();
        }
    } finally {
        data.remove();
    }
});

test("a paused session's stage timer stays paused when loaded, and runs on when resumed", async () => {
    const data = makeDataDir();
    try {
        const id = await stopDuringWork(data, { pause: true });
        const { server, session } = await restore(data, id);
        try {
            const bot = await server.connect(session, 'P1');
            await new Promise(r => setTimeout(r, 2500));
            assert.equal(bot.stageId, 'work');
            session.resume();
            await bot.waitForStage('results', { timeout: 3500 });
        } finally {
            await server.close();
        }
    } finally {
        data.remove();
    }
});

test("a loaded session has its groups' tables, and trading goes on", async () => {
    const data = makeDataDir();
    try {
        let id;
        const first = await startServer({ data });
        try {
            const session = first.createSession(app('1 sample games/double-auction.jtt'), { numParticipants: 2 });
            const bots = await first.connectAll(session);
            session.start();
            await Promise.all(bots.map(b => b.waitForStage('trading', { period: 1 })));
            bots[0].send('makeOfferToBuy', 25);
            await bots[0].waitFor(() => bots[0].player.group.offers.rows.length > 0);
            id = session.id;
        } finally {
            await first.close();
        }

        const { server, session } = await restore(data, id);
        try {
            const group = session.apps[0].periods[0].groups[0];
            assert.deepEqual(group.offers.rows.map(o => [o.price, o.buyer, o.open]), [[25, 'P1', true]]);
            const buyer = group.players.find(p => p.participant.id === 'P1');
            const seller = group.players.find(p => p.participant.id === 'P2');
            const shares = seller.shares;
            await server.connect(session, 'P1');
            const sellerBot = await server.connect(session, 'P2');
            sellerBot.send('acceptOTB', group.offers.rows[0].id);
            await sellerBot.waitFor(() => !group.offers.rows[0].open);
            assert.equal(buyer.shares, shares + 1);
            assert.equal(seller.shares, shares - 1);
        } finally {
            await server.close();
        }
    } finally {
        data.remove();
    }
});

test('a session is saved as one JSON object per line, its type first', async () => {
    const data = makeDataDir();
    try {
        const id = await playAndStop(data, app('1 sample games/public-good.jtt'));
        const lines = fs.readFileSync(path.join(data.path, 'sessions', id, id + '.gsf'), 'utf8').split('\n').filter(Boolean);
        assert.ok(lines.length > 10);
        for (const line of lines) {
            assert.match(line, /^\{"type":"[A-Z_]+",/);
            JSON.parse(line);
        }
    } finally {
        data.remove();
    }
});

test('session files written by jtree 0.9.0 and earlier, with ; after the type, are read', () => {
    assert.deepEqual(Session.parseDataLine('{"type":"APP";"id":"a","n":1}'), { type: 'APP', id: 'a', n: 1 });
    assert.deepEqual(Session.parseDataLine('{"type":"APP","id":"a"}'), { type: 'APP', id: 'a' });
});
