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
const { differences } = examples;

const PROBE = path.join(__dirname, 'fixtures/ztree5-probe');

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.close(); });

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

test("texts with values, as GIMS writes them: values in a value's text, > in an expression, RTF made with values", () => {
    const render = require('../source/dialects/ztree/render.js');
    const layout = String.raw`!text: 1="Market<if(\N>1,1,0)|!text: 0="";1=" <D[1]|1>">" 2="Markt"`;
    assert.deepEqual(render.layoutParts(layout.slice(7)).map((p) => p.key), ['1', '2']);
    assert.deepEqual(render.textParts(String.raw`a < b, <\N|1>.`).map((p) => p.text || p.expr), ['a < b, ', '\\N', '.']);
    const rec = {};
    const rt = { globals: () => ({ Language: 1, N: 2 }), isVar: () => false, records: () => [] };
    lang.run(lang.parse('array D[2]; D[1] = 4;'), { rt, table: 'subjects', rec, outer: null });
    const ctx = { rt, table: 'subjects', rec, outer: null, errors: [] };
    assert.equal(render.formatText(String.raw`<>{\rtf \fs18 \qc \b <\Language|${layout}>}`, ctx), 'Market 4');
    assert.equal(render.formatText(String.raw`{\rtf F\'fcr \{x\}\par Zeile}`, ctx), 'Für {x}<br>Zeile');
});

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

test('a contract list with an input in each row: the chosen row\'s record takes it, in the dialect and converted', async () => {
    const os = require('node:os');
    const { convertTreatmentFile } = require('../source/dialects/ztree/convert.js');
    const file = path.join(PROBE, 'rowinputs.txt');
    // The dialect: the page sends the chosen row's input (ztreeButton), its record takes it.
    const session = server.createSession(file, { numParticipants: 2 });
    const bots = await server.connectAll(session);
    session.start();
    for (const b of bots) await b.waitForStage('stage1');
    assert.match(bots[0].player.ztreeHtml, /<td><div class="ztree-input" data-prefix="record"><input type="text"[^>]*name="Qty"/);
    const run = session.apps[0].ztreeRun;
    const row = run.periods[0].other.offers.filter((o) => o.Market === 1)[1];
    const press = async (qty) => {
        const answer = Promise.race([
            bots[0].nextMessage('ztreeMessage', { timeout: 3000 }).then((d) => d.text),
            bots[0].nextMessage('ztreeAccepted', { timeout: 3000 }).then(() => null),
        ]);
        bots[0].send('ztreeButton', { stage: 'stage1', box: '0', button: 0, values: { Qty: String(qty) }, record: row._id });
        return answer;
    };
    assert.equal(await press(9), 'Please enter a number from 1 to 5.');
    assert.equal(await press(3), null);
    assert.deepEqual([row.Qty, row.Taken, row.Buyer], [3, 3, 1]);
    assert.deepEqual(run.errors, []);

    // Converted: the same (ztButton, with the chosen row's values).
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'jtree-ztree-rowinputs-'));
    try {
        const r = await convertTreatmentFile(file, path.join(out, 'rows'));
        assert.equal(r.level, 'Converts', JSON.stringify(r.report.filter((i) => i.status === 'todo')));
        const screen = fs.readFileSync(path.join(out, 'rows', 'app.jtt'), 'utf8');
        assert.match(screen, /class="zt-row-input" name="Qty"/);
        const converted = server.createSession(path.join(out, 'rows', 'app.jtt'), { numParticipants: 2 });
        const cbots = await server.connectAll(converted);
        converted.start();
        for (const b of cbots) await b.waitForStage('stage1');
        const period = Object.values(converted.participants)[0].player.group.period;
        const crow = period.tables.offers.filter((o) => o.Market === 1)[1];
        cbots[0].send('ztButton', { stage: 'stage1', box: 'b0', button: 0, values: { Qty: '4' }, record: crow._id });
        await cbots[0].waitFor(() => crow.Taken === 4, { what: 'the row taken' });
        assert.deepEqual([crow.Qty, crow.Buyer], [4, 1]);
    } finally {
        fs.rmSync(out, { recursive: true, force: true });
    }
});

test('GIMS (a market treatment published as a text export): read, every program parses, played to its market; and converted', async (t) => {
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
    // A session, played to its market (a continuous double auction): the experimenter (subject
    // 3) starts it from the Settings stage (START NOW: the hidden boxes' inputs are not asked
    // for), and moves everybody past the control questions (LeaveStage: LeaveStage = 1).
    const os = require('node:os');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jtree-gims-'));
    const toMarket = async (app, press) => {
        const session = server.createSession(app, { numParticipants: 3 });
        const bots = await server.connectAll(session);
        session.start();
        await bots[2].waitForStage('stage1');
        press(bots[2], 'stage1', '0.0', 1);
        await bots[2].waitForStage('stage2');
        press(bots[2], 'stage2', '2', 2);
        for (const b of bots) await b.waitForStage('stage8');
        return { session, bots };
    };
    try {
        fs.copyFileSync(file, path.join(dir, 'GIMS.txt'));
        const g = await toMarket(path.join(dir, 'GIMS.txt'), (bot, stage, box, button) => bot.send('ztreeButton', { stage, box, button, values: {} }));
        assert.deepEqual(g.session.apps[0].ztreeRun.errors, []);
        const screen = g.bots[0].player.ztreeHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
        assert.match(screen, /Cash: 2340\.00 Assets: 2 Last price: No trade/);
        assert.doesNotMatch(screen, /\\rtf/);

        // Converted: all of it, its multi-unit orders (inputs in a contract list's rows) too, but
        // its table loaders and dumpers (its settings file, its backups), which the dialect runs.
        const { convertTreatmentFile } = require('../source/dialects/ztree/convert.js');
        const r = await convertTreatmentFile(path.join(dir, 'GIMS.txt'), path.join(dir, 'GIMS-jtree'));
        const todos = [...new Set(r.report.filter((i) => i.status === 'todo').map((i) => i.note))];
        assert.ok(todos.length > 0 && todos.every((n) => /^a table (loader|dumper) \(.*\) is not converted/.test(n)), JSON.stringify(todos));
        const c = await toMarket(path.join(dir, 'GIMS-jtree', 'app.jtt'), (bot, stage, box, button) => bot.send('ztButton', { stage, box: 'b' + box, button, values: {}, others: {} }));
        await c.bots[0].waitFor(() => c.bots[0].player.zt_ != null, { what: 'the market screen\'s values' });
        assert.match(Object.values(c.bots[0].player.zt_.v).join(' | '), /Cash: \| 2340\.00 \| Assets: \| 2 \| Last price: \| No trade/);
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
