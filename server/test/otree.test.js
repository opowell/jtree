// oTree apps, run by jtree (dialects/otree): their Python in Pyodide, their pages' templates.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { startServer } = require('./harness.js');
const python = require('../source/dialects/otree/runtime.js');

const FIXTURES = path.join(__dirname, 'fixtures/otree');
const otreeApp = (name) => path.join(FIXTURES, name, '__init__.py');

let server;
before(async () => {
    server = await startServer();
    await python.ready();
});
after(async () => { await server.close(); });

test('an oTree app loads: rounds, group size, fields and pages', () => {
    const app = server.jt.data.loadApp('x', {}, otreeApp('public_goods'), {});
    assert.ok(app && !app.hasError, app && app.hasError ? 'error at line ' + app.errorLine : 'not loaded');
    assert.equal(app.numPeriods, 1);
    assert.equal(app.groupSize, 3);
    assert.deepEqual(app.stages.map(s => s.id), ['Contribute', 'ResultsWaitPage', 'Results']);
    assert.deepEqual(app.stages[0].formFields, ['player.contribution']);
    assert.equal(app.fields['player.contribution'].max, 100);
});

test('public goods, in oTree: pages rendered, contributions checked, payoffs set by the wait page', async () => {
    const session = server.createSession(otreeApp('public_goods'), { numParticipants: 3 });
    const bots = await server.connectAll(session);
    session.start();
    await Promise.all(bots.map(b => b.waitForStage('Contribute')));

    const html = bots[0].player.otreeHtml;
    assert.match(html, /<h2 class="otree-title">Contribute<\/h2>/);
    assert.match(html, /You have 100\. You are in a group of 3\./);
    assert.match(html, /name="player\.contribution"/);
    assert.match(html, /How much will you contribute\?/);

    bots[0].submit({ 'player.contribution': 150 });
    assert.deepEqual(await bots[0].waitForFormErrors(), { 'player.contribution': 'Please enter a value of at most 100.' });

    const contributions = [10, 20, 30];
    bots.forEach((b, i) => { b.form = {}; b.submit({ 'player.contribution': contributions[i] }); });
    await Promise.all(bots.map(b => b.waitForStage('Results')));

    // 60 contributed, times 1.8, shared by 3: 36 each.
    for (const [i, b] of bots.entries()) {
        assert.equal(b.player.points, 100 - contributions[i] + 36);
        assert.match(b.player.otreeHtml, new RegExp('Your payoff: ' + (100 - contributions[i] + 36)));
    }
    assert.match(bots[0].player.otreeHtml, /Player 1: 10<\/li><li>Player 2: 20<\/li><li>Player 3: 30/);
    assert.equal(bots[0].player.group.total_contribution, 60);

    bots.forEach(b => b.submit());
    await Promise.all(bots.map(b => b.waitForEnd()));
});

test('trust, in oTree: roles, group fields with a dynamic max, pages by role, rounds', async () => {
    const session = server.createSession(otreeApp('trust'), { numParticipants: 2 });
    const [trustor, trustee] = await server.connectAll(session);
    session.start();

    const round = async (n, sent, back) => {
        await trustor.waitForStage('Send', { period: n });
        assert.match(trustor.player.otreeHtml, /How much do you send\?/);
        trustor.submit({ 'group.sent_amount': sent });
        await trustee.waitForStage('SendBack', { period: n });
        assert.match(trustee.player.otreeHtml, new RegExp('You are the Trustee. You received ' + sent * 3 + '\\.'));
        if (n === 1) {
            trustee.submit({ 'group.sent_back_amount': sent * 3 + 1 });
            assert.deepEqual(await trustee.waitForFormErrors(), { 'group.sent_back_amount': 'Please enter a value of at most ' + sent * 3 + '.' });
            trustee.form = {};
        }
        trustee.submit({ 'group.sent_back_amount': back });
        await Promise.all([trustor, trustee].map(b => b.waitForStage('Results', { period: n })));
    };

    await round(1, 4, 5);
    assert.equal(trustor.player.points, 11);
    assert.equal(trustee.player.points, 7);
    assert.match(trustor.player.otreeHtml, /You sent 4\./);
    assert.match(trustee.player.otreeHtml, /You sent back 5\./);
    [trustor, trustee].forEach(b => b.submit());

    await round(2, 10, 0);
    assert.match(trustor.player.otreeHtml, /Payoff: 0; in all rounds so far: 11\./);
    assert.match(trustee.player.otreeHtml, /Payoff: 30; in all rounds so far: 37\./);
    [trustor, trustee].forEach(b => b.submit());
    await Promise.all([trustor, trustee].map(b => b.waitForEnd()));
    assert.deepEqual(session.payments().map(p => p.points), [11, 37]);
});

test('guess, in oTree: creating_session, vars, a timeout, error messages, a wait for all groups, a survey', async () => {
    const session = server.createSession(otreeApp('guess'), { numParticipants: 3 });
    const bots = await server.connectAll(session);
    const [p1, p2, p3] = bots;
    session.start();

    // Round 1: P1 reads the intro; for P2 and P3 its 1 second runs out.
    await Promise.all(bots.map(b => b.waitForStage('Intro')));
    p1.submit();
    await Promise.all(bots.map(b => b.waitForStage('Guess', { period: 1, timeout: 4000 })));
    assert.deepEqual(bots.map(b => b.player.intro_timed_out), [false, true, true]);
    assert.deepEqual(bots.map(b => b.player.treatment), ['high', 'low', 'high']);
    assert.equal(session.vars.created, 1);
    assert.equal(session.vars.bonus, 0);

    p1.submit({ 'player.guess': 50 });
    assert.deepEqual(await p1.waitForFormErrors(), { 'player.guess': 'Not 50, please.' });
    p1.form = {};
    // Average 40, two thirds 26.7: 20 is closest.
    [[p1, 20], [p2, 40], [p3, 60]].forEach(([b, g]) => b.submit({ 'player.guess': g }));
    await Promise.all(bots.map(b => b.waitForStage('Guess', { period: 2 })));
    assert.deepEqual(bots.map(b => b.players()[0].points), [10, 0, 0]);

    // Round 2: no intro; everyone guesses 30, and all win.
    bots.forEach(b => b.submit({ 'player.guess': 30 }));
    await Promise.all(bots.map(b => b.waitForStage('Survey')));
    const html = p1.player.otreeHtml;
    assert.match(html, /Treatment: high\. Two thirds of the average was 20\.0\./);
    assert.match(html, /<input type="radio" name="player\.likes" value="y"> Yes/);
    assert.match(html, /<label class="form-label">Happy\?<\/label>/);
    assert.match(html, /<textarea name="player\.comment"/);

    const answers = { 'player.age': 30, 'player.likes': 'y', 'player.happy': 'true', 'player.comment': '' };
    p1.submit({ ...answers, 'player.likes': 'n' });
    assert.deepEqual(await p1.waitForFormErrors(), { '': 'You said you did not like it but are happy?' });
    p2.submit({ ...answers, 'player.age': 12 });
    assert.deepEqual(await p2.waitForFormErrors(), { 'player.age': 'Please enter a value of at least 13.' });
    bots.forEach(b => { b.form = {}; b.submit(answers); });
    await Promise.all(bots.map(b => b.waitForEnd()));
    assert.deepEqual(session.payments().map(p => p.points), [20, 10, 10]);
    const survey = p1.players()[1];
    assert.deepEqual([survey.age, survey.likes, survey.happy, survey.comment], [30, 'y', true, null]);
});

test("an oTree project's session configs are queues: their apps, config, fee and exchange rate", async () => {
    const settings = path.join(FIXTURES, 'settings.py');
    server.jt.data.loadAppDir(FIXTURES);
    const id = settings + '#trust_then_guess';
    const queue = server.jt.data.apps[id];
    assert.ok(queue && !queue.hasError, queue && queue.errorMessage);
    assert.equal(queue.displayName, 'Trust, then guess');
    assert.equal(queue.description, 'A test project.');
    assert.ok(server.jt.data.apps[settings + '#public_goods']);
    // The project's apps are in the catalogue too.
    assert.ok(server.jt.data.apps[otreeApp('trust')]);

    const session = server.createSession(id, { numParticipants: 2 });
    assert.deepEqual(session.apps.map(a => a.shortId), ['trust', 'guess']);
    assert.equal(session.otreeConfig.bonus, 3);
    assert.deepEqual([session.showUpFee, session.exchangeRate], [5, 0.5]);
});
