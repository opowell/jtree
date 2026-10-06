// Regrouping in periodStart (period.setGroups) and grouping by arrival (app.groupByArrival).

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer, until } = require('./harness.js');

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.close(); });

const members = (period) => period.groups.map(g => g.players.map(p => p.participant.id + '#' + p.idInGroup));

test('periodStart can regroup the period before it starts', async () => {
    const session = server.createSession(server.writeApp('regroup.jtt', `
        app.groupSize = 2;
        app.groupMatchingType = 'PARTNER_1122';
        app.periodStart = function(period) {
            period.setGroups([['P4', 'P1'], ['P3', 'P2']]);
        };
        const s = app.newStage('s');
        s.groupStart = function(group) { group.ids = group.players.map(p => p.participant.id).join(''); };
    `), { numParticipants: 4 });
    const bots = await server.connectAll(session);
    session.start();
    await Promise.all(bots.map(b => b.waitForStage('s')));
    const period = session.apps[0].periods[0];
    assert.deepEqual(members(period), [['P4#1', 'P1#2'], ['P3#1', 'P2#2']]);
    assert.deepEqual(period.groups.map(g => g.ids), ['P4P1', 'P3P2']);
    assert.equal(bots[0].player.group.id, 1);
    await Promise.all(bots.map(b => b.play('s', {})));
    await Promise.all(bots.map(b => b.waitForEnd()));
});

test('setGroups refuses a matrix that does not list each player once, and after the start', async () => {
    const session = server.createSession(server.writeApp('regroup-bad.jtt', `
        app.groupSize = 2;
        app.errors = [];
        const tryIt = (period, m) => { try { period.setGroups(m); } catch (e) { app.errors.push(e.message); } };
        app.periodStart = function(period) {
            tryIt(period, [['P1', 'P2'], ['P9']]);
            tryIt(period, [['P1', 'P1'], ['P3', 'P2']]);
        };
        const s = app.newStage('s');
        s.groupStart = function(group) { tryIt(group.period, [['P1', 'P2']]); };
    `), { numParticipants: 3 });
    const bots = await server.connectAll(session);
    session.start();
    await Promise.all(bots.map(b => b.waitForStage('s')));
    const errors = session.apps[0].errors;
    assert.match(errors[0], /each of P1, P2, P3 once/);
    assert.match(errors[1], /each of P1, P2, P3 once/);
    // Once from each group's groupStart.
    assert.equal(errors.length, 4);
    assert.match(errors[2], /already started/);
    assert.match(errors[3], /already started/);
});

test('grouping by arrival: groups fill in the order participants arrive, and start when full', async () => {
    const intro = server.writeApp('intro.jtt', `
        app.groupSize = 1;
        app.newStage('intro');
    `);
    const game = server.writeApp('arrival.jtt', `
        app.groupSize = 2;
        app.groupByArrival = true;
        app.newStage('play');
    `);
    const session = server.createSession([intro, game], { numParticipants: 4 });
    const bots = Object.fromEntries((await server.connectAll(session)).map(b => [b.id, b]));
    session.start();
    const inGame = (b) => b.player != null && b.player.app() === session.apps[1];

    await bots.P3.play('intro', {});
    await until(() => inGame(bots.P3));
    await new Promise(r => setTimeout(r, 100));
    assert.equal(bots.P3.stageId, null, 'P3 started alone');

    await bots.P1.play('intro', {});
    await Promise.all([bots.P3, bots.P1].map(b => b.waitForStage('play')));

    await bots.P4.play('intro', {});
    await until(() => inGame(bots.P4));
    await new Promise(r => setTimeout(r, 100));
    assert.equal(bots.P4.stageId, null, 'P4 started alone');
    await bots.P2.play('intro', {});
    await Promise.all([bots.P4, bots.P2].map(b => b.waitForStage('play')));

    assert.deepEqual(members(session.apps[1].periods[0]), [['P3#1', 'P1#2'], ['P4#1', 'P2#2']]);
    await Promise.all(Object.values(bots).map(b => b.play('play', {})));
    await Promise.all(Object.values(bots).map(b => b.waitForEnd()));
});
