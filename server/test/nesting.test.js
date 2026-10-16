// Stages with stages of their own, and apps added as stages: an app within an app.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { startServer } = require('./harness.js');

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.close(); });

// Each period of the app: intro, then 3 rounds of decide and results in the app's groups,
// then outro. Records the hooks in app.log.
const ROUNDS_APP = `
app.numPeriods = 2;
app.groupSize = 2;
app.log = [];
app.newStage('intro');
const rounds = app.newStage('rounds');
rounds.numPeriods = 3;
rounds.groupStart = function(group) { app.log.push('rounds groupStart ' + group.period.id + '/' + group.id); };
rounds.groupEnd = function(group) { app.log.push('rounds groupEnd ' + group.period.id + '/' + group.id); };
rounds.periodStart = function(period) { app.log.push('round start ' + period.app.parentPeriod.id + '.' + period.id); };
rounds.periodEnd = function(period) { app.log.push('round end ' + period.app.parentPeriod.id + '.' + period.id); };
const decide = rounds.newStage('decide');
decide.playerEnd = function(player) { player.points = player.x; };
const results = rounds.newStage('results');
results.groupStart = function(group) { group.total = group.sum('x'); };
app.newStage('outro');
`;

async function playRounds(session, bots) {
    for (let period = 1; period <= 2; period++) {
        await Promise.all(bots.map(b => b.play('intro', {}, { period })));
        for (let round = 1; round <= 3; round++) {
            await Promise.all(bots.map((b, i) => b.play('decide', { 'player.x': i + round }, { period: round })));
            await Promise.all(bots.map(b => b.play('results', {}, { period: round })));
        }
        await Promise.all(bots.map(b => b.play('outro', {}, { period })));
    }
    await Promise.all(bots.map(b => b.waitForEnd()));
}

test('a stage with stages: its stages are played numPeriods times, each time its period reaches it, in its groups', async () => {
    const session = server.createSession(server.writeApp('rounds.jtt', ROUNDS_APP), { numParticipants: 4 });
    const bots = await server.connectAll(session);
    session.start();
    await playRounds(session, bots);

    const app = session.apps[0];
    // Each period of the app has the stage's own 3 periods, with the period's groups.
    for (const period of app.periods) {
        const run = app.stages[1].runIn(period);
        assert.equal(run.periods.length, 3);
        for (const round of run.periods) {
            assert.deepEqual(round.groupIds().map(g => g.slice().sort()), period.groupIds().map(g => g.slice().sort()));
            for (const group of round.groups) {
                assert.equal(group.total, group.players.reduce((sum, p) => sum + p.x, 0));
            }
        }
    }
    // The rounds' points are the participants'.
    for (const [i, bot] of bots.entries()) {
        assert.equal(bot.participant.points(), 2 * ((i + 1) + (i + 2) + (i + 3)));
    }
    // The stage's hooks: a group starts it, plays its rounds, and ends it. The rounds are
    // the period's groups', as an app's periods are: each group goes through them at its pace.
    const log = app.log;
    for (const period of [1, 2]) {
        for (const round of [1, 2, 3]) {
            assert.equal(log.filter(e => e === 'round start ' + period + '.' + round).length, 1, JSON.stringify(log));
            assert.equal(log.filter(e => e === 'round end ' + period + '.' + round).length, 1, JSON.stringify(log));
            assert.ok(log.indexOf('round start ' + period + '.' + round) < log.indexOf('round end ' + period + '.' + round));
        }
        for (const group of [1, 2]) {
            const start = log.indexOf('rounds groupStart ' + period + '/' + group);
            const end = log.indexOf('rounds groupEnd ' + period + '/' + group);
            assert.ok(start > -1 && start < log.indexOf('round end ' + period + '.1'), JSON.stringify(log));
            assert.ok(end > log.indexOf('round start ' + period + '.3'), JSON.stringify(log));
        }
    }
    // Their data is in the session's file, after the app's.
    const csv = fs.readFileSync(session.csvFN(), 'utf8');
    const appAt = csv.indexOf('APP 1_');
    assert.ok(appAt > -1);
    for (const period of [1, 2]) {
        assert.ok(csv.indexOf('APP 1_rounds/' + period + '/rounds') > appAt, csv);
    }
});

test('a stage with stages and groupSize regroups its players, among those of its period', async () => {
    const session = server.createSession(server.writeApp('regroup.jtt', `
        app.newStage('intro');
        const pairs = app.newStage('pairs');
        pairs.numPeriods = 2;
        pairs.groupSize = 2;
        pairs.groupMatchingType = 'PARTNER_1122';
        pairs.newStage('decide');
    `), { numParticipants: 4 });
    const bots = await server.connectAll(session);
    session.start();
    await Promise.all(bots.map(b => b.play('intro', {})));
    for (const round of [1, 2]) await Promise.all(bots.map(b => b.play('decide', {}, { period: round })));
    await Promise.all(bots.map(b => b.waitForEnd()));
    const app = session.apps[0];
    assert.equal(app.periods[0].groups.length, 1);
    const run = app.stages[1].runIn(app.periods[0]);
    for (const round of run.periods) {
        assert.deepEqual(round.groupIds(), [['P1', 'P2'], ['P3', 'P4']]);
    }
});

test('a player who does not play a stage with stages is not in its groups, and does not hold them up', async () => {
    const session = server.createSession(server.writeApp('skip.jtt', `
        // Groups by id: P1 and P2, P3 and P4.
        app.groupSize = 2;
        app.groupMatchingType = 'PARTNER_1122';
        app.newStage('intro');
        const rounds = app.newStage('rounds');
        rounds.numPeriods = 2;
        rounds.canPlayerParticipate = function(player) { return player.participant.id !== 'P4'; };
        rounds.newStage('decide');
        app.newStage('outro');
    `), { numParticipants: 4 });
    const bots = await server.connectAll(session);
    session.start();
    await Promise.all(bots.map(b => b.play('intro', {})));
    // P4 goes past the stage, to wait for P3 at the next, while P3 plays it alone.
    await bots[3].waitFor(() => bots[3].player.stage.id === 'outro', { what: 'to wait at outro' });
    for (const round of [1, 2]) await Promise.all(bots.slice(0, 3).map(b => b.play('decide', {}, { period: round })));
    await Promise.all(bots.map(b => b.play('outro', {})));
    assert.equal(bots[3].participant.players.length, 1);
    await Promise.all(bots.map(b => b.waitForEnd()));
    const app = session.apps[0];
    const run = app.stages[1].runIn(app.periods[0]);
    for (const round of run.periods) {
        assert.deepEqual(round.groupIds(), [['P1', 'P2'], ['P3']]);
    }
});

test('an app added as a stage is played, loaded afresh, each time its period reaches it, with a page of its own', async () => {
    server.writeApp('nested/quiz.jtt', `
        app.numPeriods = 2;
        app.log = [];
        app.appStart = function() { app.log.push('appStart'); };
        app.end = function() { app.log.push('end'); };
        const q = app.newStage('q');
        q.playerEnd = function(player) { player.points = 1; };
    `);
    const session = server.createSession(server.writeApp('nested/main.jtt', `
        app.numPeriods = 2;
        app.newStage('a');
        const quiz = app.addApp('quiz.jtt');
        quiz.playerEnd = function(player) { player.quizDone = true; };
        app.newStage('b');
    `), { numParticipants: 2 });
    const app = session.apps[0];
    assert.deepEqual(app.stages.map(s => s.id), ['a', 'quiz', 'b']);
    const bots = await server.connectAll(session);
    session.start();
    for (const period of [1, 2]) {
        await Promise.all(bots.map(b => b.play('a', {}, { period })));
        // The participant's page changes to the quiz's.
        const reloads = bots.map(b => b.nextMessage('start-new-app'));
        for (const q of [1, 2]) await Promise.all(bots.map(b => b.play('q', {}, { period: q })));
        await Promise.all(reloads);
        await Promise.all(bots.map(b => b.play('b', {}, { period })));
    }
    await Promise.all(bots.map(b => b.waitForEnd()));
    const quizStage = session.apps[0].stages[1];
    const runs = session.apps[0].periods.map(period => quizStage.runIn(period));
    assert.notEqual(runs[0], runs[1]);
    for (const run of runs) {
        assert.equal(run.periods.length, 2);
        assert.deepEqual(run.log, ['appStart', 'end']);
    }
    for (const bot of bots) {
        assert.equal(bot.participant.points(), 4);
        assert.ok(bot.players(session.apps[0]).every(p => p.quizDone));
        // Its points count as the session's app's.
        assert.equal(bot.participant.payment(), 4 * session.exchangeRate + (Number(session.showUpFee) || 0));
    }
});

test('stages with stages within stages with stages', async () => {
    const session = server.createSession(server.writeApp('deep.jtt', `
        const outer = app.newStage('outer');
        outer.numPeriods = 2;
        const inner = outer.newStage('inner');
        inner.numPeriods = 3;
        inner.newStage('x');
        outer.newStage('y');
    `), { numParticipants: 2 });
    const bots = await server.connectAll(session);
    session.start();
    for (const o of [1, 2]) {
        for (const i of [1, 2, 3]) await Promise.all(bots.map(b => b.play('x', {}, { period: i })));
        await Promise.all(bots.map(b => b.play('y', {}, { period: o })));
    }
    await Promise.all(bots.map(b => b.waitForEnd()));
    const outerRun = session.apps[0].stages[0].runIn(session.apps[0].periods[0]);
    assert.equal(outerRun.periods.length, 2);
    for (const period of outerRun.periods) {
        assert.equal(outerRun.stages[0].runIn(period).periods.length, 3);
    }
});

test('apps without stages with stages are as they were: their data and records have nothing new', async () => {
    const session = server.createSession(server.writeApp('flat.jtt', `
        app.newStage('s1');
    `), { numParticipants: 1 });
    const [bot] = await server.connectAll(session);
    session.start();
    await bot.play('s1', {});
    await bot.waitForEnd();
    const csv = fs.readFileSync(session.csvFN(), 'utf8');
    assert.doesNotMatch(csv, /appAddress|parentStage|leftIds|runs|frames/);
    assert.equal((csv.match(/^APP /gm) || []).length, 1);
    const gsf = fs.readFileSync(session.getOutputDir() + '/' + session.id + '.gsf', 'utf8');
    assert.doesNotMatch(gsf, /appAddress|leftIds|"frames"/);
});

test('stages with stages, and apps added as stages, survive being described as an IR', async () => {
    const loaded = server.jt.data.loadApp('x', {}, server.writeApp('rounds-ir.jtt', ROUNDS_APP), {});
    const ir = loaded.toIR();
    const rounds = ir.stages[1];
    assert.equal(rounds.id, 'rounds');
    assert.equal(rounds.numPeriods, 3);
    assert.deepEqual(rounds.stages.map(s => s.id), ['decide', 'results']);
    assert.deepEqual(Object.keys(rounds.programs).sort(), ['groupEnd', 'groupStart', 'periodEnd', 'periodStart']);
    const session = server.createSession(server.writeIR('rounds-ir', loaded), { numParticipants: 4 });
    const bots = await server.connectAll(session);
    session.start();
    await playRounds(session, bots);
    assert.equal(session.apps[0].log.filter(e => e.startsWith('round start')).length, 6);

    server.writeApp('nested-ir/quiz.jtt', `app.newStage('q');`);
    const main = server.jt.data.loadApp('y', {}, server.writeApp('nested-ir/main.jtt', `
        app.newStage('a');
        const quiz = app.addApp('quiz.jtt');
        quiz.waitToEnd = false;
    `), {});
    const mainIR = main.toIR();
    assert.deepEqual(mainIR.stages[1], { id: 'quiz', app: 'quiz.jtt', waitToEnd: false });
    const again = server.jt.data.loadApp('z', {}, server.writeApp('nested-ir/main2.app.json', JSON.stringify(mainIR)), {});
    assert.deepEqual(again.toIR().stages, mainIR.stages);
});

test('an IR with the same stage id inside a stage and out is refused', () => {
    const { validate } = require('../source/ir/ir.js');
    const problems = validate({ ir: 1, stages: [{ id: 'a', stages: [{ id: 'b' }] }, { id: 'b' }] });
    assert.deepEqual(problems, ['app.stages[1].id: "b" is used by an earlier stage']);
});
