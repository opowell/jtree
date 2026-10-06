// Stages that wait for every group of the period (stage.waitForAllGroups).

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer, until } = require('./harness.js');

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.close(); });

const APP = `
app.groupSize = 2;
app.log = [];
app.newStage('intro');
const together = app.newStage('together');
together.waitForAllGroups = true;
together.allGroupsStart = function(period) {
    app.log.push('allGroupsStart groups=' + period.groups.length);
    period.total = period.groups.reduce((sum, g) => sum + g.players.length, 0);
};
together.groupStart = function(group) { app.log.push('groupStart ' + group.id + ' total=' + group.period.total); };
app.newStage('after');
`;

async function check(appPath) {
    const session = server.createSession(appPath, { numParticipants: 4 });
    const bots = await server.connectAll(session);
    session.start();
    const groupOf = (b) => b.players()[0].group.id;
    await Promise.all(bots.map(b => b.waitForStage('intro')));
    const [g1, g2] = [bots.filter(b => groupOf(b) === 1), bots.filter(b => groupOf(b) === 2)];

    // Group 1 arrives, and waits.
    await Promise.all(g1.map(b => b.play('intro', {})));
    await until(() => g1.every(b => b.player.stage.id === 'together' && b.player.status === 'ready'));
    await new Promise(r => setTimeout(r, 100));
    assert.ok(g1.every(b => b.stageId === null), 'group 1 started without group 2');
    assert.deepEqual(session.apps[0].log, []);

    // Group 2 arrives: everyone starts, allGroupsStart first.
    await Promise.all(g2.map(b => b.play('intro', {})));
    await Promise.all(bots.map(b => b.waitForStage('together')));
    assert.deepEqual(session.apps[0].log, ['allGroupsStart groups=2', 'groupStart 1 total=4', 'groupStart 2 total=4']);

    await Promise.all(bots.map(b => b.play('together', {})));
    await Promise.all(bots.map(b => b.play('after', {})));
    await Promise.all(bots.map(b => b.waitForEnd()));
}

test('no group starts a stage that waits for all groups until every group has arrived', async () => {
    await check(server.writeApp('together.jtt', APP));
});

test('waiting for all groups survives being described as an IR', async () => {
    const loaded = server.jt.data.loadApp('x', {}, server.writeApp('together2.jtt', APP), {});
    const ir = loaded.toIR();
    assert.equal(ir.stages[1].waitForAllGroups, true);
    assert.ok(ir.stages[1].programs.allGroupsStart);
    await check(server.writeIR('together2', loaded));
});
