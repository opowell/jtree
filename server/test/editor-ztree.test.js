// The z-Tree admin's treatment editor and what it asks the server (/api/editor/ztree/...):
// treatments in z-Tree's text format as trees, written again as z-Tree writes them; z-Tree's
// binary treatments made text; new treatments; and only text written, where apps are.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { startServer } = require('./harness.js');
const editor = require('../source/editors/ztree.js');
const { readTreatment, decode } = require('../source/dialects/ztree/ztt.js');
const { readTextTreatment } = require('../source/dialects/ztree/ztext.js');
const examples = require('./ztree-examples.js');
const { differences } = examples;

const FIXTURES = path.join(__dirname, 'fixtures');
const EXPORTS = path.join(FIXTURES, 'ztree-examples/ztree5/export');

/** The files in dir that keep(name) keeps; none if there is no dir. */
const filesIn = (dir, keep = () => true) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter(keep).map((f) => path.join(dir, f)) : []);

// Treatments in z-Tree's text format, and in its binary one. z-Tree's examples and GIMS are
// downloaded here first if they can be (as the z-Tree tests do); z-Tree 5's exports of the
// examples are made locally (tools/ztree-wine), and the published treatments are downloaded by
// ztree-published.test.js: those not here are left out. The probes are in the repository.
let TEXTS, BINARIES, GIMS;

let server;
before(async () => {
    await examples.ensureExamples();
    GIMS = await examples.ensureGims();
    TEXTS = [
        ...filesIn(EXPORTS),
        ...(GIMS ? [GIMS] : []),
        // (load.txt is a table to load, not a treatment.)
        ...filesIn(path.join(FIXTURES, 'ztree5-probe'), (f) => f.endsWith('.txt') && f !== 'load.txt'),
    ];
    BINARIES = [
        ...filesIn(path.join(FIXTURES, 'ztree-examples'), (f) => f.endsWith('.ztt')),
        ...filesIn(path.join(FIXTURES, 'ztree-published/duffy-puzzello'), (f) => f.endsWith('.ztt')),
    ];
    server = await startServer({ settings: { appFolders: ['apps'] } });
    fs.mkdirSync(path.join(server.dataDir, 'apps'), { recursive: true });
});
after(async () => { await server.close(); });

async function post(action, body) {
    const res = await fetch(server.url + '/api/editor/ztree/' + action, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    return [res.status, await res.json()];
}

test("z-Tree's text exports are written again byte for byte: z-Tree's examples, GIMS, the probes", () => {
    assert.ok(TEXTS.length >= 5);
    for (const file of TEXTS) {
        const bytes = fs.readFileSync(file);
        const written = editor.encode(editor.write(editor.parse(decode(bytes))));
        assert.ok(written.equals(bytes), path.basename(file) + ' is not written as it was');
    }
});

test("z-Tree's binary treatments, made text, are the treatments jtree reads from them", () => {
    for (const file of BINARIES) {
        const binary = readTreatment(fs.readFileSync(file));
        const { root } = editor.fromDescription(binary, path.basename(file));
        const text = editor.write(root);
        assert.deepEqual(differences(binary, readTextTreatment(text)), [], path.basename(file));
    }
});

/** The node of kind (and name) among node's items. */
const find = (node, kind, name) => node.items.map((i) => i.node).find((n) => n && n.kind === kind && (name === undefined || n.name === name));

test('a new treatment, given a stage with a box, an input and a program, runs in jtree', () => {
    const root = editor.newTreatment('mine.ztt');
    assert.ok(find(find(root, 'background'), 'screen', 'action'), 'the background has its header box');
    root.items.splice(1, 0, { node: { kind: 'stage', name: 'Contribution', quoted: true, items: [
        { key: 'startwaitforall', value: { raw: 'TRUE' } }, { key: 'timeout', value: { raw: '30' } },
        { node: { kind: 'program', name: null, items: [{ key: 'table', value: { raw: 'subjects' } }, { code: 'Endowment = 20;\n' }] } },
        { node: { kind: 'screen', name: 'action', items: [{ key: 'usesbg', value: { raw: 'TRUE' } },
            { node: { kind: 'standardbox', name: 'Standard', quoted: true, items: [
                { node: { kind: 'item', name: null, items: [{ key: 'label', value: { string: 'Your contribution' } }, { key: 'variable', value: { raw: 'Contribution' } },
                    { key: 'input', value: { raw: 'TRUE' } }, { key: 'min', value: { raw: '0' } }, { key: 'max', value: { raw: 'Endowment' } }] } },
                { node: { kind: 'button', name: 'OK', quoted: true, items: [] } },
            ] } }] } },
        { node: { kind: 'screen', name: 'wait', items: [] } },
    ] } });
    const t = readTextTreatment(editor.check(root));
    assert.deepEqual(t.stages.map((s) => [s.name, s.timeout, s.programs[0].code]), [['Contribution', '30', 'Endowment = 20;\n']]);
    const [box] = t.stages[0].active;
    assert.deepEqual(box.items.map((i) => [i.label, i.variable, i.input, i.max]), [['Your contribution', 'Contribution', true, 'Endowment']]);

    const file = path.join(server.dataDir, 'apps', 'mine.txt');
    fs.writeFileSync(file, editor.encode(editor.write(root)));
    const app = server.jt.data.loadApp(file, null, file, {});
    assert.equal(app.hasError, false);
    assert.equal(app.stages.length, 1);
});

test('texts keep their line breaks, quotes, backslashes and accents', () => {
    const root = editor.newTreatment('t.ztt');
    const bg = find(root, 'background');
    find(find(find(bg, 'screen', 'wait'), 'standardbox'), 'item').items[0].value = { string: 'Bitte "warten",\nGrüße \\ €' };
    const back = editor.parse(decode(editor.encode(editor.write(root))));
    assert.equal(find(find(find(find(back, 'background'), 'screen', 'wait'), 'standardbox'), 'item').items[0].value.string, 'Bitte "warten",\nGrüße \\ €');
});

test('a treatment jtree cannot read is not saved', async () => {
    const root = editor.newTreatment('t.ztt');
    find(root, 'background').items.push({ node: { kind: 'stage', name: 'x', quoted: true, items: [{ key: 'timeout', value: { raw: '1; x = (' } }] } });
    const [status, body] = await post('save', { appPath: 'broken.txt', root: { kind: 'questionnaire', name: null, items: [] } });
    assert.equal(status, 400);
    assert.match(body.error, /jtree cannot read the treatment/);
    assert.equal(fs.existsSync(path.join(server.dataDir, 'apps', 'broken.txt')), false);
});

test('admins open binary treatments as text, save them beside them, create and save text ones', async () => {
    const apps = path.join(server.dataDir, 'apps');
    fs.copyFileSync(path.join(FIXTURES, 'ztree-examples/pg.ztt'), path.join(apps, 'pg.ztt'));
    let [status, body] = await post('open', { appPath: 'pg.ztt' });
    assert.equal(status, 200, body.error);
    assert.deepEqual([body.format, path.basename(body.savePath)], ['binary', 'pg.txt']);
    assert.equal((await post('save', { appPath: 'pg.ztt', root: body.root }))[1].error, "will not write over z-Tree's binary file pg.ztt; save it as a .txt");
    [status, body] = await post('save', { appPath: body.savePath, root: body.root });
    assert.equal(status, 200, body.error);
    const saved = path.join(apps, 'pg.txt');
    assert.deepEqual(differences(readTreatment(fs.readFileSync(path.join(apps, 'pg.ztt'))), readTextTreatment(fs.readFileSync(saved))), []);
    assert.ok(server.jt.data.appsMetaData[saved], 'the catalogue has the saved treatment');

    [status, body] = await post('create', { appPath: 'lab/new' });
    assert.equal(status, 200, body.error);
    assert.equal(body.appPath, path.join(apps, 'lab/new.txt'));
    [status, body] = await post('open', { appPath: 'lab/new.txt' });
    assert.equal(body.format, 'text');
    assert.equal(editor.write(body.root), decode(fs.readFileSync(path.join(apps, 'lab/new.txt'))));
    assert.match((await post('open', { appPath: '../settings.json' }))[1].error, /not in an app folder|not a z-Tree treatment/);
});

test('Treatment → Check finds programs and expressions that do not parse, and where', async () => {
    const root = editor.newTreatment('t.ztt');
    const program = find(find(root, 'background'), 'program');
    program.items[1].code = 'x = 1;\ny = (2 + ;\n';
    const [status, body] = await post('check', { root });
    assert.equal(status, 200, body.error);
    assert.equal(body.errors.length, 1);
    assert.match(body.errors[0].where, /^Background, program on globals/);
    program.items[1].code = 'x = 1;\n';
    assert.deepEqual((await post('check', { root }))[1], { errors: [], stages: 0 });
    // GIMS, a large treatment, has none.
    if (GIMS != null) {
        const gims = editor.parse(decode(fs.readFileSync(GIMS)));
        assert.deepEqual(editor.syntaxErrors(readTextTreatment(editor.write(gims))), []);
    }
});
