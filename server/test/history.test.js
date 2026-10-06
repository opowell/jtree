// A player's and a group's earlier periods: inPeriod, inAllPeriods, inPreviousPeriods, old.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('./harness.js');

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.close(); });

const APP = `
app.numPeriods = 3;
app.groupMatchingType = 'PARTNER_1122';
app.groupSize = 2;
app.newStage('decide');
const sum = app.newStage('sum');
sum.playerStart = function(player) {
    player.before = player.inPreviousPeriods().map(p => p.x);
    player.all = player.inAllPeriods().map(p => p.x);
    player.first = player.inPeriod(1).x;
    player.last = player.old() == null ? null : player.old().x;
};
sum.groupStart = function(group) {
    group.total = group.players.reduce((s, p) => s + p.x, 0);
    group.totals = group.inAllPeriods().map(g => g.total);
    group.lastTotal = group.old() == null ? null : group.old().total;
};
`;

test("players and groups read their earlier periods", async () => {
    const session = server.createSession(server.writeApp('history.jtt', APP), { numParticipants: 2 });
    const bots = await server.connectAll(session);
    session.start();
    for (let period = 1; period <= 3; period++) {
        await Promise.all(bots.map((b, i) => b.play('decide', { 'player.x': period * 10 + i }, { period })));
        await Promise.all(bots.map(b => b.play('sum', {}, { period })));
    }
    await Promise.all(bots.map(b => b.waitForEnd()));

    const [p1] = bots[0].players().slice(2);
    assert.deepEqual(p1.before, [10, 20]);
    assert.deepEqual(p1.all, [10, 20, 30]);
    assert.equal(p1.first, 10);
    assert.equal(p1.last, 20);
    assert.equal(bots[0].players()[0].last, null);

    const group3 = p1.group;
    assert.deepEqual(group3.totals, [21, 41, 61]);
    assert.equal(group3.lastTotal, 41);
    assert.equal(group3.inPeriod(4), null);
});
