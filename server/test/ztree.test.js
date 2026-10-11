// z-Tree treatments in jtree (dialects/ztree): z-Tree's language, its .ztt files (z-Tree's own
// examples, downloaded from its site: see fixtures/ztree-examples), and the examples played by
// participants' bots, through the messages their pages send.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { startServer, until } = require('./harness.js');
const lang = require('../source/dialects/ztree/lang.js');
const { readTreatment } = require('../source/dialects/ztree/ztt.js');

const { ensureExamples, file, NAMES, GRAPHICS } = require('./ztree-examples.js');
const { runZtreeBots } = require('../source/dialects/ztree/bots.js');

let server;
let haveExamples = true;

before(async () => {
    haveExamples = await ensureExamples();
    server = await startServer();
});
after(async () => { await server.close(); });

const examples = (t) => {
    if (!haveExamples) t.skip("z-Tree's examples could not be downloaded");
    return haveExamples;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// --- The language -------------------------------------------------------------------------

/** A runtime of tables for programs: {subjects: [...], globals: {...}, contracts: [...]}. */
function tables(t) {
    const all = { subjects: t.subjects || [], contracts: t.contracts || [], globals: t.globals || {} };
    return {
        records: (name) => (name === 'globals' ? [all.globals] : all[name]),
        globals: () => all.globals,
        isVar: (table, name) => (table === 'globals' ? name in all.globals : (all[table] || []).some((r) => name in r)),
        newRecord: (name) => { const r = {}; all[name].push(r); return r; },
        later: () => {},
        time: () => 0,
    };
}

test('z-Tree programs: arithmetic, conditions, if/elseif, loops, arrays', () => {
    const rt = tables({ globals: { G: 2 } });
    const rec = {};
    lang.run(lang.parse(`
        a = 1 + 2 * 3 ^ 2 / 6;      // 4
        b = if(a > 3 & not(a == 5), 10, 20);
        if (a < 0) { c = 1; } elseif (a == 4) { c = 2; } else { c = 3; }
        i = 0; s = 0;
        while (i < 5) { i = i + 1; s = s + i; }
        repeat { s = s - 1; } while (s > 10);
        array v[3]; v[2] = 7;
        array w[0, 10, 5]; w[10] = 3;
        r = round(2.345, 0.01) + rounddown(2.9) + roundup(2.1, 1) + mod(7, 3) + max(1, 2) + abs(-1);
        h = G * 10;       // a globals variable, read from a subjects record
        \\G = 5;           // set in globals
    `), { rt, table: 'subjects', rec, outer: null });
    assert.equal(rec.a, 4);
    assert.equal(rec.b, 10);
    assert.equal(rec.c, 2);
    assert.equal(rec.s, 10);
    assert.deepEqual(rec.v.values, [0, 7, 0]);
    assert.deepEqual(rec.w.values, [0, 0, 3]);
    assert.equal(rec.r, 2.35 + 2 + 3 + 1 + 2 + 1);
    assert.equal(rec.h, 20);
    assert.equal(rt.globals().G, 5);
    assert.throws(() => lang.parse('x = (1 + ;'), /line 1/);
});

test('z-Tree programs: table functions, same(), :x, do and new', () => {
    const subjects = [
        { Subject: 1, Group: 1, C: 10 }, { Subject: 2, Group: 1, C: 20 }, { Subject: 3, Group: 2, C: 5 },
    ];
    const rt = tables({ subjects, contracts: [], globals: {} });
    for (const rec of subjects) {
        lang.run(lang.parse(`
            SumC = sum(same(Group), C);
            N = count(same(Group));
            Other = find(same(Group) & not(same(Subject)), C);
            Best = maximum(C);
            Avg = subjects.average(Group == 1, C);
        `), { rt, table: 'subjects', rec, outer: null });
    }
    assert.deepEqual(subjects.map((r) => [r.SumC, r.N, r.Other, r.Best, r.Avg]), [[30, 2, 20, 20, 15], [30, 2, 10, 20, 15], [5, 1, 0, 20, 15]]);
    lang.run(lang.parse(`
        contracts.new { Seller = :Subject; Price = 7; }
        subjects.do { if (Subject == :Subject) { C = C + 1; } }
    `), { rt, table: 'subjects', rec: subjects[0], outer: null });
    assert.deepEqual(rt.records('contracts'), [{ Seller: 1, Price: 7 }]);
    assert.equal(subjects[0].C, 11);
    // None to choose from: the lowest is above any offer, the highest below.
    assert.equal(lang.evaluate(lang.parseExpr('contracts.minimum(Price > 100, Price)'), { rt, table: 'subjects', rec: subjects[0] }), Infinity);
});

// --- .ztt files ---------------------------------------------------------------------------

test("z-Tree's examples are read: stages, boxes, items, programs, parameters", (t) => {
    if (!examples(t)) return;
    for (const name of NAMES) {
        const g = readTreatment(fs.readFileSync(file(name)));
        assert.deepEqual(g.warnings, [], name);
        assert.ok(g.stages.length > 0 && g.periods.length > 0 && g.subjects.length > 0, name);
        // Every program and condition parses.
        const codes = [];
        const visit = (b) => {
            b.items.forEach((i) => { if (i.kind === 'checker') codes.push('x = ' + i.condition + ';'); });
            b.buttons.forEach((bt) => { bt.checkers.forEach((c) => codes.push('x = ' + c.condition + ';')); bt.programs.forEach((p) => codes.push(p.code)); });
            b.programs.forEach((p) => codes.push(p.code));
            b.boxes.forEach(visit);
        };
        for (const s of [g.background, ...g.stages]) {
            s.programs.forEach((p) => codes.push(p.code));
            [...s.active, ...s.waiting].forEach(visit);
        }
        g.params.forEach((c) => codes.push(c.program));
        for (const code of codes) lang.parse(code);
    }
    const pg = readTreatment(fs.readFileSync(file('pg')));
    assert.deepEqual(pg.stages.map((s) => s.name), ['Contribution Entry', 'Profit Display']);
    assert.equal(pg.stages[0].timeout, '30');
    const item = pg.stages[0].active[0].items[1];
    assert.deepEqual([item.label, item.variable, item.input, item.min, item.max], ['Your contribution to the project', 'Contribution', true, '0', 'Endowment']);
    assert.match(pg.stages[1].programs[0].code, /SumC = sum \( same\( Group \), Contribution\);/);
    const noda = readTreatment(fs.readFileSync(file('noda')));
    assert.deepEqual(noda.params.map((c) => c.program), [...Array(4).fill('Type = SELLERTYPE;'), ...Array(4).fill('Type = BUYERTYPE;')]);
    const list = noda.stages[0].active[1].boxes[3];
    assert.deepEqual([list.type, list.tableCondition, list.sorting, list.buttons[0].name], ['contractList', 'Seller == -1', 'Price', 'sell']);
});

// --- Playing the examples -------------------------------------------------------------------

/** Plays a treatment: a started session of n participants, their bots, and helpers. */
async function play(name, n) {
    const session = server.createSession(file(name), { numParticipants: n });
    const bots = await server.connectAll(session);
    session.start();
    const run = () => session.apps[0].ztreeRun;
    return {
        session, bots, run,
        subject: (i) => run().periods[bots[i].player.group.period.id - 1].subjects[i],
        /** Bot i presses a button; resolves to the server's message, or null if it accepted. */
        async press(i, stage, box, button, values = {}, extra = {}) {
            const answer = Promise.race([
                bots[i].nextMessage('ztreeMessage', { timeout: 3000 }).then((d) => d.text),
                bots[i].nextMessage('ztreeAccepted', { timeout: 3000 }).then(() => null),
            ]);
            bots[i].send('ztreeButton', { stage, box: String(box), button, values: stringify(values), ...extra });
            return answer;
        },
        /** Ends bot i's stage, as its timeout does. */
        timeout(i) { session.pushMessage(bots[i].player, true, 'endStage'); },
    };
}
const stringify = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)]));

test('pg (public goods): contributions, checked; profits from the group', async (t) => {
    if (!examples(t)) return;
    const g = await play('pg', 2);
    for (const b of g.bots) await b.waitForStage('stage1');
    assert.equal(await g.press(0, 'stage1', 0, 0, { Contribution: 25 }), 'Please enter a number from 0 to 20.');
    assert.equal(await g.press(0, 'stage1', 0, 0, { Contribution: '' }), 'Please enter a value for "Your contribution to the project".');
    assert.equal(await g.press(0, 'stage1', 0, 0, { Contribution: 5 }), null);
    assert.equal(await g.press(1, 'stage1', 0, 0, { Contribution: 10 }), null);
    for (const b of g.bots) await b.waitForStage('stage2');
    // 20 - own + 1.6 * 15 / 2
    assert.deepEqual([g.subject(0).Profit, g.subject(1).Profit], [27, 22]);
    assert.match(g.bots[0].player.ztreeHtml, /Your Income in this period<\/div><div class="ztree-value">27\.0</);
    await g.press(0, 'stage2', 0, 0);
    await g.press(1, 'stage2', 0, 0);
    await g.bots[0].waitForEnd();
    assert.equal(g.session.participants.P1.points(), 27);
    // The tables, as z-Tree writes them.
    const text = g.session.apps[0].exporters(g.session)[0].write();
    assert.match(text, /\tsubjects\tPeriod\t.*Profit/);
    assert.match(text, /\tsubjects\t1\t.*\t27\t/);
});

test('ug (ultimatum): only A offers, only B answers; profits by the answer', async (t) => {
    if (!examples(t)) return;
    const g = await play('ug', 2);
    await g.bots[0].waitForStage('stage1');
    // B (Participate = 0) skips A's stage, and waits for B's.
    await g.bots[1].waitFor(() => g.bots[1].player.stage.id === 'stage2' && g.bots[1].player.status !== 'playing');
    assert.equal(await g.press(0, 'stage1', 0, 0, { Offer: 30 }), null);
    await g.bots[1].waitForStage('stage2');
    assert.match(g.bots[1].player.ztreeHtml, /type="radio" name="Accept" value="1"/);
    assert.equal(await g.press(1, 'stage2', 0, 0, { Accept: 1 }), null);
    await g.bots[0].waitForStage('stage3');
    assert.deepEqual([g.subject(0).Profit, g.subject(1).Profit], [70, 30]);
});

test('game222 and pd: choices, and payoffs from the other player’s', async (t) => {
    if (!examples(t)) return;
    const g = await play('game222', 2);
    for (const b of g.bots) await b.waitForStage('stage1');
    await g.press(0, 'stage1', 0, 0, { Choice: 1 });
    await g.press(1, 'stage1', 0, 0, { Choice: 2 });
    for (const b of g.bots) await b.waitForStage('stage2');
    // Player 1 (prefers 1): Pi12 = 1; player 2 (prefers 2): Pi21 = 1.
    assert.deepEqual([g.subject(0).Profit, g.subject(1).Profit, g.subject(0).OthersChoice], [1, 1, 2]);

    const pd = await play('pd', 2);
    for (const b of pd.bots) await b.waitForStage('stage1');
    await pd.press(0, 'stage1', 0, 0, { Decision: 1 });
    await pd.press(1, 'stage1', 0, 0, { Decision: 2 });
    for (const b of pd.bots) await b.waitForStage('stage2');
    assert.deepEqual([pd.subject(0).Profit, pd.subject(1).Profit], [1, 4]);
});

test('noda (double auction): offers, checkers, a trade, and both sides’ profits', async (t) => {
    if (!examples(t)) return;
    const g = await play('noda', 8);
    await g.bots[0].waitForStage('stage1');
    // Buyers do not take part in the sellers' stage: they trade in theirs, at the same time.
    await g.bots[4].waitForStage('stage2');
    assert.equal(await g.press(0, 'stage1', '1.1', 0, { Price: 150 }), null);
    assert.equal(await g.press(1, 'stage1', '1.1', 0, { Price: 160 }), 'You must make a lower offer than current standing offer');
    const offer = g.run().periods[0].contracts.find((c) => c.Price === 150);
    assert.equal(offer.Seller, 1);
    // A buyer sees the offer, and buys it.
    assert.match(g.bots[4].player.ztreeHtml, new RegExp('data-record="' + offer._id + '"'));
    assert.equal(await g.press(4, 'stage2', '1.2', 0, {}, { record: String(offer._id) }), null);
    assert.equal(offer.Buyer, 5);
    // Seller: 150 - cost 20; buyer: value 400 - 150.
    assert.deepEqual([g.subject(0).Profit, g.subject(4).Profit, g.subject(0).NumTrades], [130, 250, 1]);
    // Sold: no longer among the offers, but among the trades.
    assert.equal(await g.press(5, 'stage2', '1.2', 0, {}, { record: String(offer._id) }), 'There is nothing to choose.');
    assert.deepEqual(g.run().errors, []);
});

test('asset_da (asset market): money and stock carry over to the next period', async (t) => {
    if (!examples(t)) return;
    const g = await play('asset_da', 2);
    for (const b of g.bots) await b.waitForStage('stage1');
    // Subject 1 offers a share at 50; subject 2 buys it.
    assert.equal(await g.press(0, 'stage1', '2.1.0', 0, { p: 50 }), null);
    const offer = g.run().periods[0].contracts.find((c) => c.p === 50);
    assert.equal(await g.press(1, 'stage1', '2.1.0', 0, { p: 60 }), null);
    assert.equal(await g.press(1, 'stage1', '2.1.1', 0, {}, { record: String(offer._id) }), null);
    assert.deepEqual([g.subject(0).Money, g.subject(0).Stock, g.subject(1).Money, g.subject(1).Stock], [275, 2, 175, 4]);
    for (let i = 0; i < 2; i++) g.timeout(i);
    for (const b of g.bots) await b.waitForStage('stage2');
    const dividend = g.run().periods[0].globals.Dividende;
    assert.equal(g.subject(1).Money, 175 + 4 * dividend);
    for (const [i, b] of g.bots.entries()) { await g.press(i, 'stage2', 0, 0); await b.waitForStage('stage1', { period: 2 }); }
    // Period 2 starts from period 1's money and stock (OLDsubjects.find).
    assert.deepEqual([g.subject(1).Money, g.subject(1).Stock], [175 + 4 * dividend, 4]);
});

test('chatdemo: entries go to the chat boxes that show them', async (t) => {
    if (!examples(t)) return;
    const g = await play('chatdemo', 2);
    for (const b of g.bots) await b.waitForStage('stage1');
    g.bots[0].send('ztreeChat', { stage: 'stage1', box: '1', text: 'hello from the left' });
    g.bots[1].send('ztreeChat', { stage: 'stage1', box: '2', text: 'hi from the right' });
    await g.bots[1].waitFor(() => /hello from the left/.test(g.bots[1].player.ztreeHtml) && /hi from the right/.test(g.bots[1].player.ztreeHtml));
    const html = g.bots[1].player.ztreeHtml;
    assert.match(html, /S1, Box 1: hello from the left/);
    assert.match(html, /S2, Box 2: hi from the right/);
});

test("ifelems_e (z-Tree's boxes and items): every stage, with its inputs and checkers", async (t) => {
    if (!examples(t)) return;
    const g = await play('ifelems_e', 1);
    const at = (s) => g.bots[0].waitForStage('stage' + s);
    for (const s of [1, 2, 3]) { await at(s); g.timeout(0); } // no buttons: they end when their time is up
    for (const s of [4]) { await at(s); assert.equal(await g.press(0, 'stage' + s, 1, 0), null); }
    await at(5);
    assert.match(g.bots[0].player.ztreeHtml, /<div class="ztree-value">17<\/div>/);
    assert.equal(await g.press(0, 'stage5', 1, 0, { inVar: 11 }), 'Please enter a number from 1 to 10.');
    assert.equal(await g.press(0, 'stage5', 1, 0, { inVar: 3 }), null);
    for (const s of [6, 7, 8, 9, 10]) { await at(s); assert.equal(await g.press(0, 'stage' + s, 1, 0), null); }
    // Item types: inputs in a box without buttons, sent with the button item of the other box.
    await at(11);
    const html = g.bots[0].player.ztreeHtml;
    for (const control of ['type="radio" name="radio"', 'type="checkbox" name="capito"', 'type="range" name="slider"', '<select name="number"', 'class="ztree-item-button" name="button"']) {
        assert.ok(html.includes(control), control);
    }
    assert.equal(await g.press(0, 'stage11', 2, 0, { button: 3 }, { itemButton: true, others: { 1: { even: 3 } } }), 'Please enter a multiple of 2.');
    assert.equal(await g.press(0, 'stage11', 2, 0, { button: 3 }, {
        itemButton: true, others: { 1: { even: 4, radio: 24, linie: 5, capito: 1, slider: 50, scrollbar: 1, number: 7, n2: 2.5 } },
    }), null);
    assert.deepEqual(['even', 'radio', 'button', 'n2'].map((k) => g.subject(0)[k]), [4, 24, 3, 2.5]);
    await at(12);
    assert.match(g.bots[0].player.ztreeHtml, /<div class="ztree-value">sieben<\/div>/);
    assert.equal(await g.press(0, 'stage12', 2, 0), null);
    // Checkers.
    await at(13);
    assert.equal(await g.press(0, 'stage13', 1, 0, { n: 3, n2: 10, CX: 1, CY: 1 }), 'Wrong calculation of the square.');
    assert.equal(await g.press(0, 'stage13', 1, 0, { n: 3, n2: 9, CX: 60, CY: 50 }), 'You cannot distribute more than 100 points');
    assert.equal(await g.press(0, 'stage13', 1, 0, { n: 3, n2: 9, CX: 60, CY: 40 }), null);
    await at(14);
    assert.equal(await g.press(0, 'stage14', 1, 0, { expx: 162755 }), null);
    // History: the periods before (none yet); grid: inputs in columns.
    await at(15);
    assert.equal(await g.press(0, 'stage15', 2, 0), null);
    await at(16);
    const grid = { z1s1: 1, z2s1: 2, z3s1: 3, z1s2: 4, z2s2: 5, z3s2: 6 };
    assert.equal(await g.press(0, 'stage16', 1, 0, {}, { others: { 2: grid, 3: grid } }), null);
    assert.equal(g.subject(0).z2s2, 5);
    await at(17);
    assert.match(g.bots[0].player.ztreeHtml, /data-box="2\.2"/); // a box in a container in a container
    assert.equal(await g.press(0, 'stage17', '2.2', 0), null);
    await g.bots[0].waitForEnd();
    assert.deepEqual(g.run().errors, []);
});

test('dutchauction: the price falls every 3 seconds (later ... repeat); the first to accept gets it', async (t) => {
    if (!examples(t)) return;
    const g = await play('dutchauction', 2);
    for (const b of g.bots) await b.waitForStage('stage1');
    const globals = () => g.run().periods[0].globals;
    assert.equal(globals().Price, 100);
    await g.bots[0].waitFor(() => globals().Price === 95, { timeout: 5000, what: 'the price to fall' });
    assert.match(g.bots[0].player.ztreeHtml, /<div class="ztree-value">95<\/div>/);
    assert.equal(await g.press(0, 'stage1', 0, 0), null);
    assert.equal(g.subject(0).myPrice, 95);
    assert.equal(await g.press(1, 'stage1', 0, 0), 'Another participant was quicker');
    // The button stopped the clock (Delay = -1).
    await wait(3500);
    assert.equal(globals().Price, 95);
    g.timeout(1);
    for (const b of g.bots) await b.waitForStage('stage2');
    assert.match(g.bots[0].player.ztreeHtml, /Your Price was 95/);
    assert.match(g.bots[1].player.ztreeHtml, /You did not trade/);
});

test("admins get a session's z-Tree tables (ztreeTables), and word when they change", async (t) => {
    if (!examples(t)) return;
    const { io: ioClient } = require('socket.io-client');
    const admin = ioClient(server.url, { path: '/socket.io', transports: ['websocket'], forceNew: true,
        query: { id: '', type: 'ADMIN', sessionId: '', roomId: 'null' } });
    try {
        await new Promise((resolve, reject) => { admin.once('connect', resolve); admin.once('connect_error', reject); });
        const g = await play('pg', 2);
        for (const b of g.bots) await b.waitForStage('stage1');
        // Word that this session's tables changed (other tests' sessions may say so too).
        const changed = new Promise((resolve) => admin.on('ztreeTablesChanged', (d) => { if (d.sessionId === g.session.id) resolve(d); }));
        await g.press(0, 'stage1', 0, 0, { Contribution: 5 });
        await changed;
        const tables = new Promise((resolve) => admin.once('ztreeTables', resolve));
        admin.emit('ztreeTables', g.session.id);
        const d = await tables;
        const pg = d.apps[1];
        assert.deepEqual(pg.periods[0].subjects.map((s) => [s.Subject, s.Contribution]), [[1, 5], [2, 0]]);
        assert.equal(pg.periods[0].globals[0].Period, 1);
        assert.equal(pg.session.length, 2);
    } finally {
        admin.close();
    }
});

test('a .ztt treatment comes with its description in the app catalogue (for admin-ztree)', (t) => {
    if (!examples(t)) return;
    const app = server.jt.data.loadApp('pg', null, file('pg'), {});
    const meta = app.metaData();
    assert.equal(meta.ztree.stages[0].name, 'Contribution Entry');
    assert.equal(meta.ztree.params.length, 2);
});

test('brand16.ztq (a questionnaire): its scales, answered and checked; then its last page', async (t) => {
    if (!examples(t)) return;
    const { readQuestionnaires } = require('../source/dialects/ztree/ztq.js');
    const q = readQuestionnaires(fs.readFileSync(file('brand16.ztq')));
    assert.deepEqual(q.questionnaires.map((x) => [x.title, x.items.length]), [['Persönlichkeitsfragebogen', 37], ['', 0]]);
    const scales = q.questionnaires[0].items.filter((i) => i.variable);
    assert.equal(scales.length, 34);
    assert.deepEqual([scales[0].variable, scales[0].min, scales[0].max, scales[0].labels], ['bs01', 1, 9, ['sachbezogen', 'kontaktfreudig']]);

    const g = await play('brand16.ztq', 2);
    for (const b of g.bots) await b.waitForStage('stage1');
    assert.match(g.bots[0].player.ztreeHtml, /sachbezogen.*type="radio" name="bs01" value="1".*kontaktfreudig/s);
    const answers = Object.fromEntries(scales.map((s, i) => [s.variable, (i % 9) + 1]));
    assert.match(await g.press(0, 'stage1', 0, 0, { ...answers, bs07: '' }), /Please enter a value/);
    assert.equal(await g.press(0, 'stage1', 0, 0, answers), null);
    // Each answers at their own pace: subject 1 goes on while subject 2 is still answering.
    await g.bots[0].waitForStage('stage2');
    assert.equal(g.bots[1].player.stage.id, 'stage1');
    assert.equal(g.subject(0).bs01, 1);
    assert.equal(g.subject(0).bs10, 1);
    assert.equal(g.subject(0).bs34, 7);
});

// --- Converting treatments to jtree apps ---------------------------------------------------------

test('z-Tree treatments converted to jtree apps (dialects/ztree/convert.js), played: the same results', async (t) => {
    if (!examples(t)) return;
    const os = require('node:os');
    const path = require('node:path');
    const { convertTreatmentFile } = require('../source/dialects/ztree/convert.js');
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'jtree-ztree-converted-'));
    try {
        const convert = async (name) => {
            const r = await convertTreatmentFile(file(name), path.join(out, name));
            assert.equal(r.level, 'Converts', name + ': ' + JSON.stringify(r.report.filter((i) => i.status === 'todo')));
            return path.join(out, name, 'app.jtt');
        };
        const start = async (name, n) => {
            const session = server.createSession(await convert(name), { numParticipants: n });
            const bots = await server.connectAll(session);
            session.start();
            return { session, bots };
        };

        // pg: contributions, checked against the endowment; profits from the group.
        let { bots } = await start('pg', 2);
        await bots[0].play('stage1', { 'player.Contribution': 25 });
        assert.deepEqual(await bots[0].waitForFormErrors(), { 'player.Contribution': 'Please enter a value of at most 20.' });
        await bots[0].play('stage1', { 'player.Contribution': 5 });
        await bots[1].play('stage1', { 'player.Contribution': 10 });
        for (const b of bots) await b.waitForStage('stage2');
        assert.deepEqual(bots.map((b) => b.player.Profit), [27, 22]);
        assert.deepEqual(bots.map((b) => b.player.SumC), [15, 15]);

        // ug: Participate (only A offers, only B answers), and profits by the answer.
        ({ bots } = await start('ug', 2));
        await bots[0].play('stage1', { 'player.Offer': 30 });
        await bots[1].play('stage2', { 'player.Accept': 1 });
        await bots[0].waitForStage('stage3');
        assert.deepEqual(bots.map((b) => b.player.Profit), [70, 30]);

        // game222: the parameter table's programs (each player's payoffs).
        ({ bots } = await start('game222', 2));
        await bots[0].play('stage1', { 'player.Choice': 1 });
        await bots[1].play('stage1', { 'player.Choice': 2 });
        for (const b of bots) await b.waitForStage('stage2');
        assert.deepEqual(bots.map((b) => [b.player.Profit, b.player.OthersChoice]), [[1, 2], [1, 1]]);

        // pd: globals' constants, read by the subjects.
        ({ bots } = await start('pd', 2));
        await bots[0].play('stage1', { 'player.Decision': 1 });
        await bots[1].play('stage1', { 'player.Decision': 2 });
        for (const b of bots) await b.waitForStage('stage2');
        assert.deepEqual(bots.map((b) => b.player.Profit), [1, 4]);

        // All of z-Tree's examples convert, with nothing left to do by hand; the code compiles.
        const { NAMES, GRAPHICS } = require('./ztree-examples.js');
        for (const name of [...NAMES, ...GRAPHICS]) {
            const r = await convertTreatmentFile(file(name), path.join(out, name));
            assert.equal(r.level, 'Converts', name + ': ' + JSON.stringify(r.report.filter((i) => i.status === 'todo')));
            const code = fs.readFileSync(path.join(out, name, 'app.jtt'), 'utf8');
            new (require('node:vm').Script)('(function (app, path, fs, require) {\n' + code + '\n})');
        }
    } finally {
        fs.rmSync(out, { recursive: true, force: true });
    }
});

/** A converted treatment's session, started, with bots; press as in play(), by ztButton. */
async function playConverted(name, n, out) {
    const path = require('node:path');
    const { convertTreatmentFile } = require('../source/dialects/ztree/convert.js');
    const r = await convertTreatmentFile(file(name), path.join(out, name));
    const session = server.createSession(path.join(out, name, 'app.jtt'), { numParticipants: n });
    const bots = await server.connectAll(session);
    session.start();
    const player = (i) => Object.values(session.participants)[i].player;
    return {
        report: r, session, bots, player,
        period: () => player(0).group.period,
        async press(i, stage, box, button, values = {}, extra = {}) {
            const answer = Promise.race([
                bots[i].nextMessage('ztMessage', { timeout: 3000 }).then((d) => d.text),
                bots[i].nextMessage('ztAccepted', { timeout: 3000 }).then(() => null),
            ]);
            bots[i].send('ztButton', { stage, box: 'b' + box, button, values: stringify(values), ...extra });
            return answer;
        },
        timeout(i) { session.pushMessage(player(i), true, 'endStage'); },
    };
}

test('converted markets (noda, asset_da): contract boxes as interactive stages, the same results as in the dialect', async (t) => {
    if (!examples(t)) return;
    const os = require('node:os');
    const path = require('node:path');
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'jtree-ztree-markets-'));
    try {
        // noda: offers, checkers, a trade, and both sides' profits.
        let g = await playConverted('noda', 8, out);
        assert.equal(g.report.level, 'Converts', JSON.stringify(g.report.report.filter((i) => i.status === 'todo')));
        await g.bots[0].waitForStage('stage1');
        await g.bots[4].waitForStage('stage2');
        assert.equal(await g.press(0, 'stage1', '1.1', 0, { Price: 150 }), null);
        assert.equal(await g.press(1, 'stage1', '1.1', 0, { Price: 160 }), 'You must make a lower offer than current standing offer');
        const offer = g.period().contracts.find((c) => c.Price === 150);
        assert.equal(offer.Seller, 1);
        // A buyer sees the offer (worked out for their screen), and buys it.
        await g.bots[4].waitFor(() => (g.bots[4].player.zt_.lists['b1.2'] || []).some((row) => row.id === offer._id), { what: 'the offer on the buyer\'s screen' });
        assert.deepEqual(g.bots[4].player.zt_.lists['b1.2'].map((row) => row.cells), [['150']]);
        assert.equal(await g.press(4, 'stage2', '1.2', 0, {}, { record: String(offer._id) }), null);
        assert.equal(offer.Buyer, 5);
        assert.deepEqual([g.player(0).Profit, g.player(4).Profit, g.player(0).NumTrades], [130, 250, 1]);
        assert.equal(await g.press(5, 'stage2', '1.2', 0, {}, { record: String(offer._id) }), 'There is nothing to choose.');

        // asset_da: money and stock carry over to the next period.
        g = await playConverted('asset_da', 2, out);
        assert.equal(g.report.level, 'Converts', JSON.stringify(g.report.report.filter((i) => i.status === 'todo')));
        for (const b of g.bots) await b.waitForStage('stage1');
        assert.equal(await g.press(0, 'stage1', '2.1.0', 0, { p: 50 }), null);
        const ask = g.period().contracts.find((c) => c.p === 50);
        assert.equal(await g.press(1, 'stage1', '2.1.0', 0, { p: 60 }), null);
        assert.equal(await g.press(1, 'stage1', '2.1.1', 0, {}, { record: String(ask._id) }), null);
        assert.deepEqual([g.player(0).Money, g.player(0).Stock, g.player(1).Money, g.player(1).Stock], [275, 2, 175, 4]);
        for (let i = 0; i < 2; i++) g.timeout(i);
        for (const b of g.bots) await b.waitForStage('stage2');
        const dividend = g.period().globals.Dividende;
        assert.equal(g.player(1).Money, 175 + 4 * dividend);
        // Its results stage is a form (a button with nothing else to do), sent as one.
        for (const b of g.bots) { b.submit({}); await b.waitForStage('stage1', { period: 2 }); }
        assert.deepEqual([g.player(1).Money, g.player(1).Stock], [175 + 4 * dividend, 4]);
    } finally {
        fs.rmSync(out, { recursive: true, force: true });
    }
});

test('converted dutchauction: later ... repeat lowers the price every 3 seconds; the first to accept gets it', async (t) => {
    if (!examples(t)) return;
    const os = require('node:os');
    const path = require('node:path');
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'jtree-ztree-later-'));
    try {
        const g = await playConverted('dutchauction', 2, out);
        assert.equal(g.report.level, 'Converts', JSON.stringify(g.report.report.filter((i) => i.status === 'todo')));
        for (const b of g.bots) await b.waitForStage('stage1');
        const globals = () => g.period().globals;
        assert.equal(globals().Price, 100);
        // The pages get the new price as it falls.
        await g.bots[0].waitFor(() => g.bots[0].player.group.period.globals.Price === 95, { timeout: 5000, what: 'the price to fall, on the page' });
        g.bots[0].submit({});
        await g.bots[0].waitFor(() => g.player(0).myPrice === 95, { what: 'the first to accept to get it' });
        g.bots[1].submit({});
        assert.deepEqual(await g.bots[1].waitForFormErrors(), { '': 'Another participant was quicker' });
        // Accepting stopped the clock (Delay = -1).
        await wait(3500);
        assert.equal(globals().Price, 95);
    } finally {
        fs.rmSync(out, { recursive: true, force: true });
    }
});

test('converted chatdemo: entries go to the chat boxes that show them', async (t) => {
    if (!examples(t)) return;
    const os = require('node:os');
    const path = require('node:path');
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'jtree-ztree-chat-'));
    try {
        const g = await playConverted('chatdemo', 2, out);
        assert.equal(g.report.level, 'Converts', JSON.stringify(g.report.report.filter((i) => i.status === 'todo')));
        for (const b of g.bots) await b.waitForStage('stage1');
        g.bots[0].send('ztChat', { stage: 'stage1', box: 'b1', text: 'hello from the left' });
        g.bots[1].send('ztChat', { stage: 'stage1', box: 'b2', text: 'hi from the right' });
        const lines = (box) => ((g.bots[1].player.zt_ || { lists: {} }).lists[box] || []).map((row) => row.cells[0]);
        await g.bots[1].waitFor(() => lines('b6').length === 1 && lines('b4').length === 1, { what: 'both entries on the page' });
        assert.deepEqual(lines('b4'), ['S1, Box 1: hello from the left']);
        assert.deepEqual(lines('b6'), ['S2, Box 2: hi from the right']);
        assert.deepEqual(lines('b1'), ['S1, Box 1: hello from the left', 'S2, Box 2: hi from the right']);
    } finally {
        fs.rmSync(out, { recursive: true, force: true });
    }
});

test("converted ifelems_e (z-Tree's boxes and items): every stage, as forms, with z-Tree's checks", async (t) => {
    if (!examples(t)) return;
    const os = require('node:os');
    const path = require('node:path');
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'jtree-ztree-items-'));
    try {
        const g = await playConverted('ifelems_e', 1, out);
        assert.equal(g.report.level, 'Converts', JSON.stringify(g.report.report.filter((i) => i.status === 'todo')));
        const bot = g.bots[0];
        const at = (s) => bot.waitForStage('stage' + s);
        const refused = async (values) => { bot.submit(values); const e = await bot.waitForFormErrors(); bot.formErrors = null; return e; };
        for (const s of [1, 2, 3]) { await at(s); g.timeout(0); }
        await at(4); bot.submit({});
        await at(5);
        assert.equal(g.player(0).outVar, 17);
        assert.deepEqual(await refused({ 'player.inVar': 11 }), { 'player.inVar': 'Please enter a value of at most 10.' });
        bot.submit({ 'player.inVar': 3 });
        for (const s of [6, 7, 8, 9, 10]) { await at(s); bot.submit({}); }
        // Item types; a number's layout is its step.
        await at(11);
        const items = { 'player.even': 4, 'player.radio': 24, 'player.linie': 5, 'player.capito': 1, 'player.slider': 50, 'player.scrollbar': 1, 'player.number': 7, 'player.n2': 2.5, 'player.button': 3 };
        assert.deepEqual(await refused({ ...items, 'player.even': 3 }), { 'player.even': 'Please enter a multiple of 2.' });
        bot.submit(items);
        await at(12);
        assert.deepEqual(['even', 'radio', 'button', 'n2'].map((k) => g.player(0)[k]), [4, 24, 3, 2.5]);
        bot.submit({});
        // Checkers (n2 is a whole number here: this stage's own field).
        await at(13);
        assert.deepEqual(await refused({ 'player.n': 3, 'player.n2': 10, 'player.CX': 1, 'player.CY': 1 }), { '': 'Wrong calculation of the square.' });
        assert.deepEqual(await refused({ 'player.n': 3, 'player.n2': 9, 'player.CX': 60, 'player.CY': 50 }), { '': 'You cannot distribute more than 100 points' });
        bot.submit({ 'player.n': 3, 'player.n2': 9, 'player.CX': 60, 'player.CY': 40 });
        await at(14); bot.submit({ 'player.expx': 162755 });
        // History: the periods before (none yet); grid: inputs in columns.
        await at(15);
        assert.deepEqual(g.player(0).zt_.lists, { b1: [] });
        bot.submit({});
        await at(16);
        bot.submit({ 'player.z1s1': 1, 'player.z2s1': 2, 'player.z3s1': 3, 'player.z1s2': 4, 'player.z2s2': 5, 'player.z3s2': 6 });
        await at(17);
        assert.equal(g.player(0).z2s2, 5);
        bot.submit({});
        await bot.waitForEnd();
    } finally {
        fs.rmSync(out, { recursive: true, force: true });
    }
});

test("converted plot boxes: the same shapes as the dialect draws, for z-Tree's graphics examples; their inputs", async (t) => {
    if (!examples(t)) return;
    const os = require('node:os');
    const path = require('node:path');
    const { GRAPHICS } = require('./ztree-examples.js');
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'jtree-ztree-plots-'));
    const dialectPlot = (html) => JSON.parse(html.match(/data-plot="([^"]*)"/)[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
    // Records' ids are each runtime's own: shapes compared without them, inputs by number.
    const comparable = (data) => ({
        range: data.range,
        shapes: data.shapes.map(({ records, inputs, layout, ...shape }) => ({ ...shape, inputs: (inputs || []).length })), // (an axis's layout: its labels' own)
        inputs: data.inputs.map((i) => i.action),
        boxInputs: data.boxInputs.length,
    });
    try {
        // The same random numbers for both (boxplotdemo's bars are random).
        const random = Math.random;
        const seed = () => { let x = 12345; Math.random = () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648); };
        t.after(() => { Math.random = random; });
        for (const name of GRAPHICS) {
            seed();
            const d = await play(name, 1);
            await d.bots[0].waitForStage('stage1');
            seed();
            const c = await playConverted(name, 1, out);
            assert.equal(c.report.level, 'Converts', name + ': ' + JSON.stringify(c.report.report.filter((i) => i.status === 'todo')));
            await c.bots[0].waitForStage('stage1');
            const key = Object.keys(c.player(0).zt_.plots)[0];
            assert.deepEqual(comparable(JSON.parse(c.player(0).zt_.plots[key])), comparable(dialectPlot(d.bots[0].player.ztreeHtml)), name);
        }
        Math.random = random;

        // Move the point: a click puts the subject's x and y there; the page gets it drawn there.
        let g = await playConverted('movepointdemo', 1, out);
        await g.bots[0].waitForStage('stage1');
        let data = JSON.parse(g.player(0).zt_.plots.b1);
        g.bots[0].send('ztPlot', { stage: 'stage1', box: 'b1', input: data.boxInputs[0], x: 40, y: -25 });
        await g.bots[0].waitFor(() => g.player(0).x === 40 && g.player(0).y === -25, { what: 'the point to move' });
        await g.bots[0].waitFor(() => JSON.parse(g.bots[0].player.zt_.plots.b1).shapes[0].x === 40, { what: 'the point drawn there, on the page' });

        // z-draw: a click adds a point; the Del Pt button (it does not leave the stage), then a click on the point, deletes it.
        g = await playConverted('z-draw', 1, out);
        await g.bots[0].waitForStage('stage1');
        data = JSON.parse(g.player(0).zt_.plots.b0);
        g.bots[0].send('ztPlot', { stage: 'stage1', box: 'b0', input: data.inputs.find((i) => i.action === 0).id, x: 10, y: 20 });
        const points = () => (g.period().tables || {}).points || [];
        await g.bots[0].waitFor(() => points().length === 1, { what: 'a new point' });
        assert.deepEqual([points()[0].x, points()[0].y, points()[0].ObjID], [10, 20, 1]);
        assert.equal(await g.press(0, 'stage1', 1, 1), null);
        data = JSON.parse(g.player(0).zt_.plots.b0);
        const point = data.shapes.find((s) => s.kind === 'point');
        const del = data.inputs.find((i) => point.inputs.includes(i.id) && i.action === 1);
        g.bots[0].send('ztPlot', { stage: 'stage1', box: 'b0', input: del.id, x: 10, y: 20 });
        await g.bots[0].waitFor(() => points()[0].Deleted === 1, { what: 'the point deleted' });
    } finally {
        fs.rmSync(out, { recursive: true, force: true });
    }
});

test('admins convert a z-Tree treatment of the catalogue to a jtree app beside it (ztreeConvertApp)', async (t) => {
    if (!examples(t)) return;
    const os = require('node:os');
    const path = require('node:path');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jtree-ztree-catalogue-'));
    try {
        fs.copyFileSync(file('pg'), path.join(dir, 'pg.ztt'));
        server.jt.data.loadAppDir(dir);
        const result = await server.jt.socketServer.msgs.ztreeConvertApp({ appPath: path.join(dir, 'pg.ztt') }, null);
        assert.equal(result.level, 'Converts');
        assert.equal(result.outPath, path.join(dir, 'pg-jtree'));
        assert.ok(server.jt.data.apps[path.join(dir, 'pg-jtree', 'app.jtt')] != null);
        const refused = await server.jt.socketServer.msgs.ztreeConvertApp({ appPath: path.join(dir, 'nothing.ztt') }, null);
        assert.match(refused.error, /not a z-Tree treatment/);
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});

// --- Plot boxes (z-Tree's graphics examples) -------------------------------------------------------

test("z-Tree's graphics examples: plot boxes and their items are read", (t) => {
    if (!examples(t)) return;
    const { GRAPHICS } = require('./ztree-examples.js');
    const plotsOf = (name) => {
        const g = readTreatment(fs.readFileSync(file(name)));
        assert.deepEqual(g.warnings, [], name);
        const out = [];
        const walk = (b) => { if (b.type === 'plot') out.push(b); b.boxes.forEach(walk); };
        g.stages.forEach((s) => [...s.active, ...s.waiting].forEach(walk));
        return out;
    };
    for (const name of GRAPHICS) assert.equal(plotsOf(name).length, 1, name);
    const [smiley] = plotsOf('smiley');
    assert.deepEqual(smiley.plotItems.map((i) => i.kind), ['pie', 'point', 'point', 'line', 'line', 'line']);
    assert.deepEqual(smiley.range, { xLeft: '-100', xRight: '100', yBottom: '-100', yTop: '100' });
    assert.equal(smiley.keepAspect, true);
    assert.deepEqual([smiley.plotItems[3].x1, smiley.plotItems[3].lineWidth], ['-MouthXOut', '22']);
    const [triangle] = plotsOf('colortriangle');
    const inner = triangle.plotItems[0].items[0];
    assert.deepEqual([inner.kind, inner.table, inner.graphCondition, inner.items[0].kind], ['graph', 'dim', 'i+:i<=1', 'rect']);
    const [select] = plotsOf('selectlinkdemo');
    const line = select.plotItems[0].items[0];
    assert.deepEqual([line.kind, line.inputs[0].action, line.inputs[0].programs[0].table, line.lineColor], ['line', 1, 'lines', 'rgb(R,G,B)']);
    const [draw] = plotsOf('z-draw');
    assert.deepEqual(draw.plotItems[1], { ...draw.plotItems[1], kind: 'input', condition: 'State== AddPoint', action: 0, table: 'points', xVar: 'x', yVar: 'y' });
    assert.equal(plotsOf('boxplotdemo')[0].keepAspect, false);
});

test('plot boxes drawn (as shapes for the page), and their inputs: a click moves a point, adds one, selects one', async (t) => {
    if (!examples(t)) return;
    const plotData = (html) => JSON.parse(html.match(/data-plot="([^"]*)"/)[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));

    // The colour triangle: a square cell for each pair (i, j) with i + j <= 1, coloured by both.
    let g = await play('colortriangle', 1);
    await g.bots[0].waitForStage('stage1');
    let data = plotData(g.bots[0].player.ztreeHtml);
    assert.equal(data.shapes.length, 55);
    assert.ok(data.shapes.every((s) => s.kind === 'rect' && Math.abs((s.x2 - s.x1) - 0.1) < 1e-9 && Math.abs((s.y2 - s.y1) - 0.1) < 1e-9));
    assert.equal(data.range.keepAspect, true);
    assert.match(data.shapes[0].fill, /^rgb\(\d+,\d+,\d+\)$/);

    // Move the point: a click (its subjects input) puts the subject's x and y there.
    g = await play('movepointdemo', 1);
    await g.bots[0].waitForStage('stage1');
    data = plotData(g.bots[0].player.ztreeHtml);
    assert.deepEqual(data.shapes.map((s) => [s.kind, s.x, s.y]), [['point', 0, 0]]);
    g.bots[0].send('ztreePlot', { stage: 'stage1', box: '1', input: data.boxInputs[0], x: 40, y: -25 });
    await g.bots[0].waitFor(() => g.subject(0).x === 40 && g.subject(0).y === -25, { what: 'the point to move' });
    await g.bots[0].waitFor(() => /&quot;x&quot;:40,&quot;y&quot;:-25/.test(g.bots[0].player.ztreeHtml), { what: 'the point drawn there' });

    // z-draw: a click adds a point (of the object being drawn); a click on it, deleting points, deletes it.
    g = await play('z-draw', 1);
    await g.bots[0].waitForStage('stage1');
    data = plotData(g.bots[0].player.ztreeHtml);
    const add = data.inputs.find((i) => i.action === 0);
    g.bots[0].send('ztreePlot', { stage: 'stage1', box: '0', input: add.id, x: 10, y: 20 });
    const points = () => g.run().periods[0].other.points || [];
    await g.bots[0].waitFor(() => points().length === 1, { what: 'a new point' });
    assert.deepEqual([points()[0].x, points()[0].y, points()[0].ObjID], [10, 20, 1]);
    // The Del Pt button (which does not leave the stage), then a click on the point.
    assert.equal(await g.press(0, 'stage1', 1, 1), null);
    await g.bots[0].waitFor(() => /&quot;inputs&quot;:\[&quot;2\.0\.2:0@/.test(g.bots[0].player.ztreeHtml), { what: 'the point to take clicks' });
    data = plotData(g.bots[0].player.ztreeHtml);
    const point = data.shapes.find((s) => s.kind === 'point');
    const del = data.inputs.find((i) => point.inputs.includes(i.id) && i.action === 1);
    g.bots[0].send('ztreePlot', { stage: 'stage1', box: '0', input: del.id, x: 10, y: 20 });
    await g.bots[0].waitFor(() => points()[0].Deleted === 1, { what: 'the point deleted' });
    assert.deepEqual(g.run().errors, []);
});

test("every example, played to its end by the generic bot (each subject presses what their screen offers)", async (t) => {
    if (!examples(t)) return;
    for (const name of [...NAMES, ...GRAPHICS, 'brand16.ztq']) {
        const n = name.endsWith('.ztq') ? 2 : Math.max(2, readTreatment(fs.readFileSync(file(name))).subjects.length);
        const session = server.createSession(file(name), { numParticipants: n });
        session.start();
        const stats = await runZtreeBots(session, { timeout: 30000 });
        assert.ok(stats.pressed > 0, name);
        assert.deepEqual(session.apps[0].ztreeRun.errors, [], name);
        assert.ok(Object.values(session.participants).every((p) => p.isFinishedSession()), name);
    }
});

// --- Whose rules: the session's mode --------------------------------------------------------

const RULES = path.join(__dirname, 'fixtures/ztree5-probe/rules.txt');

/** The globals of a session of rules.txt in mode, once its programs have run; and its errors. */
async function rulesIn(mode) {
    const session = server.createSession(RULES, { numParticipants: 1, mode });
    session.start();
    const run = () => session.apps[0].ztreeRun;
    await until(() => run() != null && run().periods[0] != null && 'F' in run().periods[0].subjects[0] && run().periods[0].subjects[0].F === 1, { what: 'the programs run' });
    return { g: run().periods[0].globals, errors: run().errors, session };
}

test("by z-Tree's rules (mode ztree), arrays and arithmetic as z-Tree 5 does them (fixtures/ztree5-probe/rules.txt)", async () => {
    const { g, errors, session } = await rulesIn('ztree');
    assert.deepEqual(errors, []);
    // Indexes rounded to the nearest element; out of range, the first or last one.
    assert.deepEqual([g.R1, g.R2, g.R3, g.R4, g.R5, g.R6], [9, 1, 1, 9, 2, 2]);
    assert.deepEqual([g.c.values, g.d.values, g.e.values, g.f.values], [[4, 0, 0], [6, 0, 0], [0, 0, 7], [8, 0, 0]]);
    assert.deepEqual([g.W1, g.W2], [0, 1]);
    // 1/0 and the like: infinities and NaN, and the program goes on.
    assert.deepEqual([g.D1, g.D2], [Infinity, -Infinity]);
    assert.ok([g.D3, g.D4, g.D5, g.D6].every(Number.isNaN));
    assert.equal(g.D7, 2);
    // Written as z-Tree writes them.
    const text = session.apps[0].exporters(session)[0].write();
    assert.match(text, /\tinf\t-inf\t-nan\(ind\)\t-nan\(ind\)\t-nan\(ind\)\t-nan\(ind\)\t2/);
});

test("by jtree's rules (mode jtree, and otree), they are errors, and the program stops there", async () => {
    for (const mode of ['jtree', 'otree']) {
        const { g, errors } = await rulesIn(mode);
        assert.deepEqual(errors.map((e) => e.replace(/^in a program on (\w+) \(.*?\): /, '$1: ')), [
            'globals: array index 7 out of range',
            'globals: array index 0 out of range',
            'globals: division by zero',
        ], mode);
        assert.equal(g.k, 7, mode);
        assert.ok(!('R1' in g) || g.R1 === 0, mode);
        assert.ok(!('D1' in g) || g.D1 === 0, mode);
        assert.equal(g.F, undefined, mode); // a subjects variable
    }
});

test("the session's mode is the server's unless it has its own", async () => {
    const session = server.createSession(RULES, { numParticipants: 1 });
    assert.equal(session.engineMode(), server.jt.settings.mode);
    session.setMode('ztree');
    assert.equal(session.engineMode(), 'ztree');
    session.setMode(null);
    assert.equal(session.engineMode(), 'jtree');
    assert.throws(() => session.setMode('qualtrics'), /unknown mode/);
});
