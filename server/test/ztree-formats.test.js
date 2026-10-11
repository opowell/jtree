// z-Tree's file formats, checked against z-Tree itself: its text export (ztext.js), its binary
// format as z-Tree 5 saves it (file version 46), and the older ones (ztt.js) must describe the
// same treatment. A probe treatment made for this (fixtures/ztree5-probe) runs in CI; z-Tree's
// examples as z-Tree 5 exports and saves them are compared where they have been made
// (tools/ztree-wine). And GIMS, a large market treatment published as a text export, runs.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { startServer } = require('./harness.js');
const { readTreatment } = require('../source/dialects/ztree/ztt.js');
const { readTextTreatment, readTextQuestionnaires } = require('../source/dialects/ztree/ztext.js');
const { readQuestionnaires } = require('../source/dialects/ztree/ztq.js');
const lang = require('../source/dialects/ztree/lang.js');
const examples = require('./ztree-examples.js');

const PROBE = path.join(__dirname, 'fixtures/ztree5-probe');

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.close(); });

/**
 * Where two readings of a treatment differ, as "path: a | b" (at most 20). What the formats
 * write differently and mean the same is not a difference: whitespace, '' and missing, [] and
 * missing, an item's min and max if it is not an input (the binary files keep old ones), the
 * raw option bytes (their meanings are compared), and fields one reader has for itself.
 */
function differences(a, b) {
    const ONLY_ONE = new Set(['version', 'tables', 'cls', 'warnings', 'texts', 'timeoutType', 'startCondition', 'loaders', 'dumpers',
        'numSubjects', 'numGroups', 'practicePeriods', 'first', 'count', 'options', 'plotCount', 'childCount', 'label', 'button']);
    const norm = (v, key, parent) => {
        if ((key === 'min' || key === 'max') && parent && parent.kind === 'item' && !parent.input) return undefined;
        if (key === 'layout' && parent && parent.kind === 'item' && !parent.variable) return undefined;
        if (typeof v === 'string') v = key === 'code' ? v.split('\n').map((l) => l.trimEnd()).join('\n').trim() : v.trim();
        if (Array.isArray(v) && v.length === 0) return undefined;
        if (v === '') return undefined;
        return v;
    };
    const out = [];
    const diff = (x, y, at, key, px, py) => {
        if (out.length >= 20) return;
        x = norm(x, key, px);
        y = norm(y, key, py);
        if (x === y) return;
        if (typeof x !== typeof y || x == null || y == null || typeof x !== 'object') {
            out.push(at + ': ' + JSON.stringify(x) + ' | ' + JSON.stringify(y));
            return;
        }
        if (Array.isArray(x) && x.length !== y.length) out.push(at + ': length ' + x.length + ' | ' + y.length);
        for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
            if (!ONLY_ONE.has(k)) diff(x[k], y[k], at + '.' + k, k, x, y);
        }
    };
    diff(a, b, 'treatment');
    return out;
}

/** All of a treatment's programs, conditions and expressions, as [code, 'program' or 'expression', where]. */
function allCode(t) {
    const out = [];
    const add = (code, kind, where) => { if (code != null && String(code).trim() !== '') out.push([code, kind, where]); };
    const prog = (p, where) => { add(p.code, 'program', where); add(p.condition, 'expression', where + ', its condition'); };
    const box = (b, where) => {
        const w = where + ', ' + b.name;
        add(b.condition, 'expression', w + ', display condition');
        for (const it of b.items) {
            if (it.kind !== 'item') continue;
            if (it.variable) add(it.variable, 'expression', w + ', item');
            if (it.input) { add(it.min, 'expression', w + ', min'); add(it.max, 'expression', w + ', max'); }
        }
        for (const bt of b.buttons) { bt.programs.forEach((p) => prog(p, w + ', ' + bt.name)); bt.checkers.forEach((c) => add(c.condition, 'expression', w + ', checker')); }
        (b.programs || []).forEach((p) => prog(p, w));
        if (b.tableCondition) add(b.tableCondition, 'expression', w + ', its condition');
        (b.boxes || []).forEach((c) => box(c, w));
    };
    for (const s of [t.background, ...t.stages]) {
        s.programs.forEach((p) => prog(p, s.name));
        if (s.timeout) add(s.timeout, 'expression', s.name + ', timeout');
        [...s.active, ...s.waiting].forEach((b) => box(b, s.name));
    }
    t.params.forEach((p, i) => add(p.program, 'program', 'parameter ' + i));
    return out;
}

test("z-Tree's text export is read: the probe's tables, stages, boxes, plot items and parameter table", () => {
    const t = readTextTreatment(fs.readFileSync(path.join(PROBE, 'probe.txt')));
    assert.deepEqual(t.tables.filter((x) => x.lifetime).map((x) => [x.name, x.lifetime]), [['offers', 'PERIOD'], ['settings', 'TREATMENT']]);
    assert.deepEqual(t.stages.map((s) => [s.name, s.startIfPossible, s.timeoutAlways, s.showHeader, s.timeout]),
        [['Market', true, true, false, '60'], ['Settings', false, false, true, '-1']]);
    const [list, plot, leave] = t.stages[0].active;
    assert.deepEqual([list.type, list.table, list.tableCondition, list.sorting, list.owner, list.options], ['contractList', 'offers', 'Market == 1', '-Price; Market', 'Seller', [0, 1, 0, 0, 0, 0, 0, 0]]);
    assert.deepEqual([list.buttons[0].leaveStage, leave.buttons[0].leaveStage], [false, true]);
    assert.deepEqual(list.buttons[0].checkers.map((c) => [c.condition, c.message]), [['Seller != :Subject', 'Not your own.']]);
    const [line, text, graph] = plot.plotItems;
    assert.deepEqual([line.arrowStart, line.arrowEnd, line.arrowWidth, line.arrowFilled], ['0', '4', '2', true]);
    assert.deepEqual([text.hAlign, text.vAlign], [2, 0]);
    assert.deepEqual([graph.table, graph.graphCondition, graph.items[0].kind, graph.items[0].inputs[0].action, graph.items[0].inputs[0].x1Var], ['offers', 'Market == 2', 'point', 2, 'tox']);
    assert.equal(t.stages[1].active[0].items[0].max, '\\Rate * 2');
    assert.deepEqual(t.params.map((p) => [p.label, p.group, p.program.trim()]), [['s', 1, 'Type = 1;'], ['b', 1, 'Type = 2;'], ['', 1, ''], ['', 2, '']]);
});

test('a treatment saved by z-Tree 5 (file version 46) reads as its text says', () => {
    const binary = readTreatment(fs.readFileSync(path.join(PROBE, 'probe.ztt')));
    assert.equal(binary.version, 46);
    assert.deepEqual(binary.warnings, []);
    assert.deepEqual(differences(binary, readTextTreatment(fs.readFileSync(path.join(PROBE, 'probe.txt')))), []);
});

test("z-Tree's examples, as z-Tree 5 exports and saves them (tools/ztree-wine): each reading the same", (t) => {
    const dir = examples.ZTREE5;
    if (!fs.existsSync(path.join(dir, 'export'))) return t.skip('no exports of the examples made here (see tools/ztree-wine)');
    let compared = 0;
    for (const f of fs.readdirSync(path.join(dir, 'export')).sort()) {
        const name = f.replace(/\.txt$/, '');
        const text = fs.readFileSync(path.join(dir, 'export', f));
        if (name === 'brand16') {
            const plain = (q) => q.questionnaires.map((x) => ({ title: x.title, buttons: x.buttons, items: x.items.map((i) => ({ label: i.label.trim(), variable: i.variable, min: i.min, max: i.max, step: i.step, labels: i.labels })) }));
            for (const other of [examples.file('brand16.ztq'), path.join(dir, 'saved', 'brand16.ztq')]) {
                if (fs.existsSync(other)) assert.deepEqual(plain(readQuestionnaires(fs.readFileSync(other))), plain(readTextQuestionnaires(text)), other);
            }
            continue;
        }
        const fromText = readTextTreatment(text);
        for (const other of [examples.file(name), path.join(dir, 'saved', name + '.ztt')]) {
            if (!fs.existsSync(other)) continue;
            assert.deepEqual(differences(readTreatment(fs.readFileSync(other)), fromText), [], other);
            compared++;
        }
    }
    assert.ok(compared > 0);
});

test('z-Tree 4 and 5 programs: for loops (their variable is the record\'s), elsif, \\\\x, arrays declared for a table', () => {
    const g = { N: 2, Big: 10 };
    const subjects = [{ Subject: 1 }];
    const made = [];
    const rt = {
        globals: () => g,
        isVar: (t, n) => (t === 'subjects' && ['Subject', 'm', 'Kind'].includes(n)) || (t === 'rows' && ['M', 'Units'].includes(n)),
        records: (t) => (t === 'subjects' ? subjects : t === 'rows' ? made : [g]),
        newRecord: () => { const r = {}; made.push(r); return r; },
        // array Units[\N]; declared for rows somewhere else (in a program that need not run).
        declaredArray: (t, n) => (t === 'rows' && n === 'Units' ? [lang.parseExpr('\\N')] : null),
    };
    lang.run(lang.parse(`
        for (m, \\\\N) { rows.new { M = :m; Units[:m] = :m * 10; } }
        if (\\Big < 5) { Kind = 1; } elsif (\\Big < 50) { Kind = 2; } else { Kind = 3; }
    `), { rt, table: 'subjects', rec: subjects[0], outer: null });
    assert.deepEqual(made.map((r) => [r.M, r.Units.values]), [[1, [10, 0]], [2, [0, 20]]]);
    assert.equal(subjects[0].m, 2);
    assert.equal(subjects[0].Kind, 2);
});

test('the probe runs: new records get their table\'s background programs; tables that last the treatment keep their records', async () => {
    const session = server.createSession(path.join(PROBE, 'probe.ztt'), { numParticipants: 2 });
    const bots = await server.connectAll(session);
    session.start();
    for (const b of bots) await b.waitForStage('stage1');
    const run = session.apps[0].ztreeRun;
    const offers = run.periods[0].other.offers;
    // Each subject's for loop made an offer for each market; the background's offers program ran
    // on each (Fresh = 7; not the one with condition FALSE, which declares Units).
    assert.deepEqual(offers.map((o) => [o.Market, o.Fresh, o.Units.values]), [[1, 7, [10, 0]], [2, 7, [0, 20]], [1, 7, [10, 0]], [2, 7, [0, 20]]]);
    assert.deepEqual(run.errors, []);
    assert.ok(run.lasting.settings != null && run.lasting.offers == null);
});

test('the probe converted to a jtree app: the same records, initialised the same way', async () => {
    const os = require('node:os');
    const { convertTreatmentFile } = require('../source/dialects/ztree/convert.js');
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'jtree-ztree-probe-'));
    try {
        const r = await convertTreatmentFile(path.join(PROBE, 'probe.ztt'), path.join(out, 'probe'));
        assert.equal(r.level, 'Converts', JSON.stringify(r.report.filter((i) => i.status === 'todo')));
        const session = server.createSession(path.join(out, 'probe', 'app.jtt'), { numParticipants: 2 });
        const bots = await server.connectAll(session);
        session.start();
        for (const b of bots) await b.waitForStage('stage1');
        const period = Object.values(session.participants)[0].player.group.period;
        assert.deepEqual(period.tables.offers.map((o) => [o.Market, o.Fresh, o.Units.values]), [[1, 7, [10, 0]], [2, 7, [0, 20]], [1, 7, [10, 0]], [2, 7, [0, 20]]]);
        assert.deepEqual(period.app.ztLasting, ['settings']);
    } finally {
        fs.rmSync(out, { recursive: true, force: true });
    }
});

test('GIMS (a market treatment published as a text export): read, every program parses, and a session starts', async (t) => {
    const file = await examples.ensureGims();
    if (file == null) return t.skip('GIMS could not be downloaded');
    const gims = readTextTreatment(fs.readFileSync(file));
    assert.equal(gims.stages.length, 31);
    assert.ok(gims.tables.length >= 20);
    const failed = [];
    const code = allCode(gims);
    for (const [c, kind, where] of code) {
        try { kind === 'program' ? lang.parse(c) : lang.parseExpr(c); } catch (err) { failed.push(where + ': ' + err.message); }
    }
    assert.deepEqual(failed, []);
    assert.ok(code.length > 2000);
    // A session: the experimenter (subject 3) gets the Settings stage; the others wait.
    const dir = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'jtree-gims-'));
    try {
        fs.copyFileSync(file, path.join(dir, 'GIMS.txt'));
        const session = server.createSession(path.join(dir, 'GIMS.txt'), { numParticipants: 3 });
        const bots = await server.connectAll(session);
        session.start();
        await bots[2].waitForStage('stage1');
        assert.equal(bots[2].player.status, 'playing');
        assert.deepEqual(session.apps[0].ztreeRun.errors, []);
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
