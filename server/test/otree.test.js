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
