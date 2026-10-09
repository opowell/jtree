// z-Tree treatments in jtree (dialects/ztree): z-Tree's language, its .ztt files (z-Tree's own
// examples, downloaded from its site: see fixtures/ztree-examples), and the examples played by
// participants' bots, through the messages their pages send.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { startServer } = require('./harness.js');
const lang = require('../source/dialects/ztree/lang.js');
const { readTreatment } = require('../source/dialects/ztree/ztt.js');

const { ensureExamples, file, NAMES } = require('./ztree-examples.js');

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
