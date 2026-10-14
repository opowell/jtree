// jtree's oTree Studio editor (admin/otree, #/studio) and what it asks the server
// (/api/editor/otree/...): oTree apps and projects read into their parts, edits that change only
// the part they are about, and an app made from oTree Studio's starting point that jtree plays.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { startServer } = require('./harness.js');
const python = require('../source/dialects/otree/runtime.js');
const studio = require('../source/editors/otree.js');

const FIXTURES = path.join(__dirname, 'fixtures');

let server;
before(async () => {
    server = await startServer({ settings: { appFolders: ['apps'] } });
    fs.mkdirSync(path.join(server.dataDir, 'apps'), { recursive: true });
    await python.ready();
});
after(async () => { await server.close(); });

async function post(action, body) {
    const res = await fetch(server.url + '/api/editor/otree/' + action, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.status !== 200) throw new Error(action + ': ' + data.error);
    return data;
}

/** Every oTree app in the fixtures in oTree's current format (an __init__.py). */
function fixtureApps() {
    const out = [];
    const walk = (dir) => {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
            const p = path.join(dir, e.name);
            if (!e.isDirectory() || e.name.startsWith('_') || e.name.startsWith('.')) continue;
            const init = path.join(p, '__init__.py');
            if (fs.existsSync(init) && !fs.existsSync(path.join(p, 'models.py')) && /otree\.api/.test(fs.readFileSync(init, 'utf8'))) out.push(init);
            walk(p);
        }
    };
    ['otree', 'otree-samples', 'otree-published'].forEach((d) => walk(path.join(FIXTURES, d)));
    return out;
}

test("every oTree app in the fixtures is read into its parts: constants, models, pages and their sequence", async () => {
    const apps = fixtureApps();
    assert.ok(apps.length >= 20, apps.length + ' apps');
    for (const file of apps) {
        const m = await studio.appModel(fs.readFileSync(file, 'utf8'));
        const where = path.relative(FIXTURES, file);
        assert.equal(m.error, null, where);
        assert.ok(m.constants, where + ' has its constants');
        assert.ok(m.models.Player, where + ' has its Player');
        assert.ok(m.pageSequence, where + ' has its page sequence');
        // Each page in the sequence is one of the app's pages.
        const pages = new Set(m.pages.map((p) => p.name));
        assert.deepEqual(m.pageSequence.names.filter((n) => !pages.has(n)), [], where);
    }
    const pg = await studio.appModel(fs.readFileSync(path.join(FIXTURES, 'otree/public_goods/__init__.py'), 'utf8'));
    assert.deepEqual(pg.constants.items.map((c) => [c.name, c.code]), [['NAME_IN_URL', "'public_goods'"], ['PLAYERS_PER_GROUP', '3'], ['NUM_ROUNDS', '1'], ['ENDOWMENT', 'cu(100)'], ['MULTIPLIER', '1.8']]);
    assert.deepEqual(pg.models.Player.fields.map((f) => [f.name, f.type, f.args.map((a) => a.name + '=' + a.code).join(', ')]),
        [['contribution', 'CurrencyField', 'min=0, max=C.ENDOWMENT, label="How much will you contribute?"']]);
    assert.deepEqual(pg.pages.map((p) => [p.name, p.kind, p.attrs.map((a) => a.name + '=' + a.code).join('; ')]),
        [['Contribute', 'Page', "form_model='player'; form_fields=['contribution']"], ['ResultsWaitPage', 'WaitPage', 'after_all_players_arrive=set_payoffs'], ['Results', 'Page', '']]);
    assert.deepEqual(pg.functions.map((f) => [f.name, f.params]), [['set_payoffs', ['group: Group']]]);
});

test('edits leave the rest of an app as it was written', async () => {
    const original = fs.readFileSync(path.join(FIXTURES, 'otree/public_goods/__init__.py'), 'utf8');
    let source = await studio.apply(original, { op: 'setConstant', name: 'MULTIPLIER', code: '2' });
    assert.equal(source, original.replace('MULTIPLIER = 1.8', 'MULTIPLIER = 2'));
    source = await studio.apply(source, { op: 'setField', model: 'Player', name: 'age', field: { type: 'IntegerField', args: [{ name: 'label', code: '"Your age"' }, { name: 'min', code: '18' }] } });
    assert.match(source, /label="How much will you contribute\?"\n {4}\)\n {4}age = models\.IntegerField\(label="Your age", min=18\)\n/);
    source = await studio.apply(source, { op: 'setPageMethod', page: 'Results', name: 'is_displayed', params: ['player: Player'], body: 'return player.round_number == C.NUM_ROUNDS' });
    assert.match(source, /class Results\(Page\):\n {4}@staticmethod\n {4}def is_displayed\(player: Player\):\n {8}return player\.round_number == C\.NUM_ROUNDS\n/);
    source = await studio.apply(source, { op: 'removePageMethod', page: 'Results', name: 'is_displayed' });
    source = await studio.apply(source, { op: 'removeField', model: 'Player', name: 'age' });
    assert.equal(source, original.replace('MULTIPLIER = 1.8', 'MULTIPLIER = 2'));

    // Pages: added after one, renamed, taken out; the sequence follows.
    source = await studio.apply(source, { op: 'addPage', name: 'Survey', kind: 'Page', after: 'Contribute' });
    let m = await studio.appModel(source);
    assert.deepEqual(m.pageSequence.names, ['Contribute', 'Survey', 'ResultsWaitPage', 'Results']);
    source = await studio.apply(source, { op: 'renamePage', name: 'Survey', to: 'Questions' });
    m = await studio.appModel(source);
    assert.deepEqual(m.pages.map((p) => p.name), ['Contribute', 'ResultsWaitPage', 'Results', 'Questions']);
    assert.deepEqual(m.pageSequence.names, ['Contribute', 'Questions', 'ResultsWaitPage', 'Results']);
    source = await studio.apply(source, { op: 'removePage', name: 'Questions' });
    assert.equal(source, original.replace('MULTIPLIER = 1.8', 'MULTIPLIER = 2'));

    await assert.rejects(studio.apply('class C(BaseConstants:\n', { op: 'setConstant', name: 'X', code: '1' }), /does not parse/);
    await assert.rejects(studio.apply(original, { op: 'addPage', name: 'set_payoffs', kind: 'Page' }), /already/);
});

test("a project's session configs and settings, edited", async () => {
    const original = fs.readFileSync(path.join(FIXTURES, 'otree/settings.py'), 'utf8');
    const before = await studio.settingsModel(original);
    assert.equal(before.error, null);
    const n = before.configs.items.length;
    let source = await studio.applySettings(original, { op: 'addConfig', entries: [{ key: 'name', code: "'mine'" }, { key: 'app_sequence', code: "['trust']" }, { key: 'num_demo_participants', code: '2' }] });
    let m = await studio.settingsModel(source);
    assert.equal(m.configs.items.length, n + 1);
    assert.deepEqual(m.configs.items[n].entries.map((e) => [e.key, e.code]), [['name', "'mine'"], ['app_sequence', "['trust']"], ['num_demo_participants', '2']]);
    source = await studio.applySettings(source, { op: 'setConfig', index: n, entries: [{ key: 'name', code: "'mine'" }, { key: 'app_sequence', code: "['trust', 'guess']" }] });
    m = await studio.settingsModel(source);
    assert.equal(m.configs.items[n].entries[1].code, "['trust', 'guess']");
    source = await studio.applySettings(source, { op: 'removeConfig', index: n });
    assert.equal(source, original);
    source = await studio.applySettings(source, { op: 'setSetting', name: 'REAL_WORLD_CURRENCY_CODE', code: "'EUR'" });
    assert.equal((await studio.settingsModel(source)).settings.find((s) => s.name === 'REAL_WORLD_CURRENCY_CODE').code, "'EUR'");
});

test("an app made in the studio from oTree Studio's starting point plays in jtree", async () => {
    const project = await post('createProject', { name: 'studio_project' });
    let app = await post('createApp', { projectDir: project.dir, name: 'pgg' });
    assert.deepEqual(app.model.pageSequence.names, ['MyPage', 'ResultsWaitPage', 'Results']);
    const ops = [
        { op: 'setConstant', name: 'PLAYERS_PER_GROUP', code: '3' },
        { op: 'setConstant', name: 'ENDOWMENT', code: 'cu(100)' },
        { op: 'setField', model: 'Group', name: 'total', field: { type: 'CurrencyField', args: [] } },
        { op: 'setField', model: 'Player', name: 'contribution', field: { type: 'CurrencyField', args: [{ name: 'min', code: '0' }, { name: 'max', code: 'C.ENDOWMENT' }, { name: 'label', code: '"How much will you contribute?"' }] } },
        { op: 'setFunction', name: 'set_payoffs', params: ['group: Group'], body: 'players = group.get_players()\ngroup.total = sum(p.contribution for p in players)\nfor p in players:\n    p.payoff = C.ENDOWMENT - p.contribution + group.total * 2 / C.PLAYERS_PER_GROUP' },
        { op: 'renamePage', name: 'MyPage', to: 'Contribute' },
        { op: 'setPageAttr', page: 'Contribute', name: 'form_model', code: "'player'" },
        { op: 'setPageAttr', page: 'Contribute', name: 'form_fields', code: "['contribution']" },
        { op: 'setPageAttr', page: 'ResultsWaitPage', name: 'after_all_players_arrive', code: 'set_payoffs' },
    ];
    const edited = await post('apply', { source: app.source, ops });
    assert.equal(edited.model.error, null);
    await post('saveApp', {
        dir: app.dir, source: edited.source,
        templates: { Contribute: { title: 'Contribute', content: '{{ formfields }}\n{{ next_button }}' }, MyPage: null, Results: { title: 'Results', content: '<p>You earned {{ player.payoff }}.</p>' } },
    });
    assert.equal(fs.existsSync(path.join(app.dir, 'MyPage.html')), false);
    assert.match(fs.readFileSync(path.join(app.dir, 'Contribute.html'), 'utf8'), /^\{\{ block title \}\}\n {4}Contribute\n\{\{ endblock \}\}\n\{\{ block content \}\}\n\n {4}\{\{ formfields \}\}\n {4}\{\{ next_button \}\}\n\n\{\{ endblock \}\}\n$/);

    const settings = await post('openProject', { settingsPath: project.settingsPath });
    const withConfig = await post('applySettings', { source: settings.source, op: { op: 'addConfig', entries: [{ key: 'name', code: "'pgg'" }, { key: 'app_sequence', code: "['pgg']" }, { key: 'num_demo_participants', code: '3' }] } });
    await post('saveProject', { settingsPath: project.settingsPath, source: withConfig.source });
    const listed = await post('list', {});
    assert.deepEqual(listed.projects.map((p) => [p.name, p.apps.map((a) => a.name)]), [['studio_project', ['pgg']]]);

    // Opened again, the templates are the blocks written.
    app = await post('openApp', { dir: app.dir });
    assert.deepEqual(app.templates.Contribute, { text: fs.readFileSync(path.join(app.dir, 'Contribute.html'), 'utf8'), title: 'Contribute', content: '{{ formfields }}\n{{ next_button }}' });

    // Played: 3 players contribute 10, 20 and 30; 60 doubled, shared by 3.
    const appPath = path.join(app.dir, '__init__.py');
    const loaded = server.jt.data.loadApp('x', {}, appPath, {});
    assert.ok(loaded && !loaded.hasError, loaded && loaded.hasError ? 'error at line ' + loaded.errorLine : 'not loaded');
    assert.deepEqual(loaded.stages.map((s) => s.id), ['Contribute', 'ResultsWaitPage', 'Results']);
    const session = server.createSession(appPath, { numParticipants: 3 });
    const bots = await server.connectAll(session);
    session.start();
    await Promise.all(bots.map((b) => b.waitForStage('Contribute')));
    assert.match(bots[0].player.otreeHtml, /How much will you contribute\?/);
    bots.forEach((b, i) => b.submit({ 'player.contribution': (i + 1) * 10 }));
    await Promise.all(bots.map((b) => b.waitForStage('Results')));
    assert.deepEqual(bots.map((b) => b.player.points), [130, 120, 110]);
    assert.match(bots[0].player.otreeHtml, /You earned 130/);
});

test('the studio writes only in the app folders, and only Python that parses', async () => {
    await assert.rejects(post('openProject', { settingsPath: path.join(FIXTURES, 'otree/settings.py') }), /not in an app folder/);
    const project = await post('createProject', { name: 'checked' });
    await assert.rejects(post('saveProject', { settingsPath: project.settingsPath, source: 'SESSION_CONFIGS = [\n' }), /does not parse/);
    await assert.rejects(post('createApp', { projectDir: project.dir, name: 'Bad-Name' }), /lower case/);
});

test("a template's blocks are written again only if they changed; its other blocks stay", () => {
    const text = '{{ block title }}Contribute{{ endblock }}\n{{ block content }}\n<p>Hi</p>\n{{ endblock }}\n{{ block scripts }}<script>x()</script>{{ endblock }}\n';
    assert.equal(studio.withBlocks(text, 'Contribute', '<p>Hi</p>'), text);
    assert.equal(studio.withBlocks(text, 'Contribute', '<p>Bye</p>'), '{{ block title }}Contribute{{ endblock }}\n{{ block content }}\n\n    <p>Bye</p>\n\n{{ endblock }}\n{{ block scripts }}<script>x()</script>{{ endblock }}\n');
    assert.deepEqual(studio.template(text), { text, title: 'Contribute', content: '<p>Hi</p>' });
});
