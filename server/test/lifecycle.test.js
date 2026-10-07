// The app's lifecycle hooks: appStart, periodStart, periodEnd, end.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { startServer } = require('./harness.js');

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.close(); });

// Records every hook and stage call, in order, in app.log.
const LOGGING_APP = `
app.numPeriods = 2;
app.groupSize = 2;
app.log = [];
app.appStart = function() { app.log.push('appStart'); };
app.periodStart = function(period) {
    app.log.push('periodStart ' + period.id + ' groups=' + period.groups.length + ' players=' + period.groups.map(g => g.players.length).join(','));
};
app.periodEnd = function(period) { app.log.push('periodEnd ' + period.id); };
app.end = function() { app.log.push('end'); };
// this.id, not a variable of this file, so that the functions also run from an IR.
for (const id of ['s1', 's2']) {
    const stage = app.newStage(id);
    stage.groupStart = function(group) { app.log.push(this.id + ' groupStart ' + group.period.id + '/' + group.id); };
    stage.groupEnd = function(group) { app.log.push(this.id + ' groupEnd ' + group.period.id + '/' + group.id); };
}
`;

async function playLogged(appPath) {
    const session = server.createSession(appPath, { numParticipants: 4 });
    const bots = await server.connectAll(session);
    session.start();
    for (let period = 1; period <= 2; period++) {
        for (const stage of ['s1', 's2']) await Promise.all(bots.map(b => b.play(stage, {}, { period })));
    }
    await Promise.all(bots.map(b => b.waitForEnd()));
    // Ending the app writes its data to the session's CSV file.
    const csv = fs.readFileSync(session.csvFN(), 'utf8');
    assert.match(csv, /s1/);
    return session.apps[0].log;
}

function checkOrder(log) {
    const once = (entry) => assert.equal(log.filter(e => e === entry).length, 1, entry + ' in ' + JSON.stringify(log));
    once('appStart');
    once('end');
    assert.equal(log[0], 'appStart');
    assert.equal(log[log.length - 1], 'end');
    for (const period of [1, 2]) {
        const start = log.findIndex(e => e.startsWith('periodStart ' + period));
        // The period's 2 groups of 2 exist when it starts.
        assert.equal(log[start], 'periodStart ' + period + ' groups=2 players=2,2');
        once('periodEnd ' + period);
        const end = log.indexOf('periodEnd ' + period);
        const inPeriod = log.map((e, i) => [e, i]).filter(([e]) => / (\d)\/\d$/.exec(e)?.[1] === String(period));
        assert.equal(inPeriod.length, 8); // 2 stages x 2 groups x start and end
        for (const [, i] of inPeriod) assert.ok(start < i && i < end, JSON.stringify(log));
    }
}

test('hooks: appStart first, periodStart before the period\'s stages, periodEnd after them, end last', async () => {
    checkOrder(await playLogged(server.writeApp('logging.jtt', LOGGING_APP)));
});

test('hooks survive being described as an IR', async () => {
    const loaded = server.jt.data.loadApp('x', {}, server.writeApp('logging2.jtt', LOGGING_APP), {});
    const ir = loaded.toIR();
    assert.deepEqual(Object.keys(ir.hooks).sort(), ['appEnd', 'appStart', 'periodEnd', 'periodStart']);
    assert.equal(ir.functions, undefined);
    checkOrder(await playLogged(server.writeIR('logging2', loaded)));
});

test('an error in groupEnd or playerEnd is logged, and the session goes on', async () => {
    const session = server.createSession(server.writeApp('throws.jtt', `
        const stage = app.newStage('s1');
        stage.playerEnd = function(player) { throw new Error('in playerEnd'); };
        stage.groupEnd = function(group) { throw new Error('in groupEnd'); };
        app.newStage('s2');
    `), { numParticipants: 2 });
    const bots = await server.connectAll(session);
    session.start();
    await Promise.all(bots.map(b => b.play('s1', {})));
    await Promise.all(bots.map(b => b.play('s2', {})));
    await Promise.all(bots.map(b => b.waitForEnd()));
});

test('players skip stages they do not play, also the first stage of a period', async () => {
    const session = server.createSession(server.writeApp('skips.jtt', `
        app.numPeriods = 2;
        app.stageWaitToStart = false;
        app.stageWaitToEnd = false;
        const intro = app.newStage('intro');
        intro.canPlayerParticipate = function(player) { return player.group.period.id === 1; };
        app.newStage('guess');
        const all = app.newStage('all');
        all.waitToStart = true;
        all.waitToEnd = true;
        all.playerStart = function(player) { player.session().pushMessage(player, true, 'endStage'); };
        const last = app.newStage('last');
        last.canPlayerParticipate = function(player) { return player.group.period.id === 2; };
    `), { numParticipants: 3 });
    const bots = await server.connectAll(session);
    session.start();
    await Promise.all(bots.map(b => b.play('intro', {})));
    await Promise.all(bots.map(b => b.play('guess', {}, { period: 1 })));
    // all ends by itself, last is not played in period 1, nor intro in period 2.
    await Promise.all(bots.map(b => b.play('guess', {}, { period: 2 })));
    await Promise.all(bots.map(b => b.play('last', {}, { period: 2 })));
    await Promise.all(bots.map(b => b.waitForEnd()));
});

