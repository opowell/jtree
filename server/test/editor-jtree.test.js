// jtree's app editor (admin/v2's App editor panel) and what it asks the server
// (/api/editor/jtree/...): an app's settings, stages and code read from its source, edits that
// change only what they are about, and apps written and loaded again.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { startServer, app: sampleApp } = require('./harness.js');
const editor = require('../source/editors/jtree.js');

let server;
before(async () => {
    await editor.ready();
    server = await startServer({ settings: { appFolders: ['apps'] } });
    fs.mkdirSync(path.join(server.dataDir, 'apps'), { recursive: true });
});
after(async () => { await server.close(); });

/** Posts to the editor API; resolves to [status, body]. */
async function post(action, body) {
    const res = await fetch(server.url + '/api/editor/jtree/' + action, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    return [res.status, await res.json()];
}

/** The stages jtree itself makes of source. */
function stagesJtreeMakes(source, name = 'check.jtt') {
    const file = path.join(server.dataDir, 'apps', name);
    fs.writeFileSync(file, source);
    const app = server.jt.data.loadApp(file, null, file, {});
    assert.equal(app.hasError, false, 'jtree loads the edited app');
    return app.stages.map((s) => s.id);
}

const SAMPLES = ['1 sample games', '2 features'].flatMap((dir) =>
    fs.readdirSync(sampleApp(dir)).filter((f) => f.endsWith('.jtt') && !/^error-/.test(f)).map((f) => dir + '/' + f));

test('the editor finds the stages jtree makes, in every sample app', () => {
    assert.equal(editor.model(fs.readFileSync(sampleApp('1 sample games/centipede.jtt'), 'utf8')).otherStages, true);
    for (const rel of SAMPLES) {
        const source = fs.readFileSync(sampleApp(rel), 'utf8');
        const m = editor.model(source);
        assert.equal(m.error, null, rel);
        // Stages made by other code (in a loop, ...) are jtree's to find; the editor says there are some.
        if (m.otherStages) assert.ok(stagesJtreeMakes(source).length > m.stages.length, rel);
        else assert.deepEqual(m.stages.map((s) => s.name), stagesJtreeMakes(source), rel);
    }
});

test("a sample app's settings, screens and functions, as the editor shows them", () => {
    const m = editor.model(fs.readFileSync(sampleApp('1 sample games/public-good.jtt'), 'utf8'));
    const prop = (list, name) => list.find((p) => p.name === name);
    assert.deepEqual([prop(m.app, 'numPeriods').kind, prop(m.app, 'numPeriods').value], ['number', 10]);
    assert.equal(prop(m.app, 'description').kind, 'string');
    const [decide, results] = m.stages;
    assert.equal(prop(decide.props, 'activeScreen').kind, 'text');
    assert.match(prop(decide.props, 'activeScreen').value, /<input name='player.contribution'/);
    const groupStart = prop(results.props, 'groupStart');
    assert.equal(groupStart.kind, 'function');
    assert.deepEqual(groupStart.params, ['group']);
    assert.match(groupStart.body, /^group\.contributions = group\.sum\('contribution'\);/);
});

test('edits change only what they are about, and jtree runs the result', () => {
    const original = fs.readFileSync(sampleApp('1 sample games/public-good.jtt'), 'utf8');
    let source = editor.apply(original, { op: 'setAppProp', name: 'numPeriods', value: { kind: 'number', value: 3 } });
    assert.equal(source, original.replace('app.numPeriods  = 10;', 'app.numPeriods  = 3;'));

    source = editor.apply(source, { op: 'addStage', name: 'questionnaire' });
    source = editor.apply(source, { op: 'setStageProp', stage: 'questionnaire', name: 'playerStart',
        value: { kind: 'function', params: ['player'], body: "player.asked = true;\nif (player.points > 10) {\n    player.rich = 1;\n}" } });
    source = editor.apply(source, { op: 'setStageProp', stage: 'questionnaire', name: 'duration', value: { kind: 'number', value: 30 } });
    assert.ok(source.startsWith(original.replace('app.numPeriods  = 10;', 'app.numPeriods  = 3;').trimEnd()), 'the rest is as it was');
    assert.match(source, /let questionnaireStage = app\.newStage\('questionnaire'\);\nquestionnaireStage\.activeScreen = `[\s\S]*`;\nquestionnaireStage\.playerStart = function\(player\) \{\n {4}player\.asked = true;\n {4}if \(player\.points > 10\) \{\n {8}player\.rich = 1;\n {4}\}\n\};\nquestionnaireStage\.duration = 30;\n$/);
    assert.deepEqual(stagesJtreeMakes(source), ['decide', 'results', 'questionnaire']);

    // Moved first, renamed, then gone again.
    source = editor.apply(source, { op: 'moveStage', name: 'questionnaire', to: 0 });
    assert.deepEqual(stagesJtreeMakes(source), ['questionnaire', 'decide', 'results']);
    source = editor.apply(source, { op: 'moveStage', name: 'questionnaire', to: 2 });
    assert.deepEqual(stagesJtreeMakes(source), ['decide', 'results', 'questionnaire']);
    source = editor.apply(source, { op: 'moveStage', name: 'decide', to: 1 });
    assert.deepEqual(stagesJtreeMakes(source), ['results', 'decide', 'questionnaire']);
    source = editor.apply(source, { op: 'moveStage', name: 'decide', to: 0 });
    source = editor.apply(source, { op: 'renameStage', name: 'questionnaire', to: "survey's end" });
    assert.deepEqual(stagesJtreeMakes(source), ['decide', 'results', "survey's end"]);
    source = editor.apply(source, { op: 'deleteStage', name: "survey's end" });
    assert.equal(source.trimEnd(), original.replace('app.numPeriods  = 10;', 'app.numPeriods  = 3;').trimEnd());

    // A screen, written as a template literal; a setting taken out.
    source = editor.apply(source, { op: 'setStageProp', stage: 'decide', name: 'activeScreen', value: { kind: 'text', value: '<p>Give `some` ${x}</p>' } });
    assert.equal(editor.model(source).stages[0].props.find((p) => p.name === 'activeScreen').value, '\n<p>Give `some` ${x}</p>\n');
    source = editor.apply(source, { op: 'removeAppProp', name: 'factor' });
    assert.doesNotMatch(source, /^app\.factor/m);
    source = editor.apply(source, { op: 'setAppProp', name: 'factor', value: { kind: 'number', value: 1.5 } });
    assert.match(source, /app\.endowment {3}= 20;\napp\.factor = 1\.5;\n\nlet decideStage/);
});

test('a stage made without a variable gets one when something is set on it', () => {
    const source = editor.apply("app.newStage('a');\napp.newStage('b');\n", { op: 'setStageProp', stage: 'b', name: 'duration', value: { kind: 'number', value: 5 } });
    assert.equal(source, "app.newStage('a');\nlet bStage = app.newStage('b');\nbStage.duration = 5;\n");
});

test('source that does not parse says where', () => {
    const m = editor.model('app.numPeriods = ;\n');
    assert.equal(m.error.line, 1);
    assert.throws(() => editor.apply('app.x = (;', { op: 'addStage', name: 'a' }), /does not parse/);
});

test('admins create, open, edit and save apps over HTTP; the catalogue has them', async () => {
    let [status, body] = await post('create', { appPath: 'mine/trust', description: 'Trust game.' });
    assert.equal(status, 200, JSON.stringify(body));
    const file = path.join(server.dataDir, 'apps', 'mine', 'trust.jtt');
    assert.equal(body.appPath, file);
    assert.deepEqual(body.model.stages.map((s) => s.name), ['decide']);
    assert.ok(server.jt.data.appsMetaData[file], 'the catalogue has the new app');
    assert.equal((await post('create', { appPath: 'mine/trust.jtt' }))[0], 400, 'not over an app that is there');

    [status, body] = await post('apply', { source: body.source, ops: [{ op: 'addStage', name: 'return' }, { op: 'setAppProp', name: 'groupSize', value: { kind: 'number', value: 2 } }] });
    assert.equal(status, 200, JSON.stringify(body));
    assert.deepEqual(body.model.stages.map((s) => s.name), ['decide', 'return']);
    assert.equal((await post('save', { appPath: file, source: body.source }))[0], 200);
    assert.deepEqual(server.jt.data.app(file).stages.map((s) => s.id), ['decide', 'return']);
    assert.equal(server.jt.data.app(file).groupSize, 2);

    [status, body] = await post('open', { appPath: file });
    assert.equal(body.source, fs.readFileSync(file, 'utf8'));

    [status, body] = await post('apply', { source: 'app.x = 1;', op: { op: 'renameStage', name: 'nope', to: 'x' } });
    assert.deepEqual([status, body.error], [400, 'no stage "nope"']);
});

test('the editor reads and writes only in the app folders, and only apps', async () => {
    for (const p of ['../settings.json', path.join(server.dataDir, 'settings.json'), '/etc/passwd']) {
        const [status, body] = await post('open', { appPath: p });
        assert.equal(status, 400, p);
        assert.match(body.error, /not in an app folder/);
    }
    assert.match((await post('save', { appPath: 'notes.txt', source: 'x' }))[1].error, /not a jtree app/);
    assert.equal(fs.existsSync(path.join(server.dataDir, 'apps', 'notes.txt')), false);
});
