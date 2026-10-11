#!/usr/bin/env node
/*
 * Compares jtree's data with oTree's for a session config, both played by the project's bots.
 *
 *   node tools/otree/compare.js PROJECT CONFIG [N] [--otree=5.11.5] [--runs=3] [--seed=S] [--save=DIR]
 *
 * oTree (tools/otree/<version>, see setup.sh) runs the config RUNS times (`otree test CONFIG N
 * --export`, in a copy of PROJECT); jtree once, by oTree's rules (mode 'otree'). Their "all apps,
 * wide" CSVs are compared on the columns every oTree run gave the same values in: what does not
 * depend on chance (random roles, draws) or on the moment (codes, times). It prints the columns
 * that differ (and those only one has), and exits 1 if any do. --save=DIR keeps, in
 * DIR/<config>.json, oTree's values in the columns compared.
 *
 * --seed=S seeds Python's random with S in both, before the session is made (oTree draws its
 * codes and random groups from its own generator, as jtree does): an app that draws in the same
 * order then draws the same numbers, and every column is compared but those that depend on the
 * moment (two seeded runs of oTree's tell them).
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO = path.join(__dirname, '..', '..');

// Columns that are oTree's own bookkeeping, not the experiment's data (codes, bots, pages, times).
const BOOKKEEPING = /^(participant\.(code|label|_is_bot|_index_in_pages|_max_page_index|_current_app_name|_current_page_name|time_started_utc|time_started|visited|mturk_worker_id|mturk_assignment_id)|session\.(code|label|mturk_HITId|mturk_HITGroupId|comment|is_demo))$/;

function parseArgs(argv) {
    const opts = { otree: '5.11.5', runs: 3, save: null, seed: null };
    const rest = [];
    for (const a of argv) {
        const m = /^--(\w+)=(.*)$/.exec(a);
        if (m) opts[m[1]] = m[2];
        else rest.push(a);
    }
    [opts.project, opts.config, opts.n] = rest;
    opts.runs = Number(opts.runs);
    if (!opts.project || !opts.config) {
        console.error('usage: node tools/otree/compare.js PROJECT CONFIG [N] [--otree=5.11.5] [--runs=3] [--seed=S] [--save=DIR]');
        process.exit(2);
    }
    opts.project = path.resolve(opts.project);
    // Seeded, two runs are enough to tell the columns that depend on the moment (times).
    if (opts.seed != null && !argv.some((a) => a.startsWith('--runs='))) opts.runs = 2;
    return opts;
}

/** Rows of a CSV (oTree's: commas, double quotes). */
function parseCSV(text) {
    const rows = [];
    let row = [], cell = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (quoted) {
            if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
            else if (c === '"') quoted = false;
            else cell += c;
        } else if (c === '"') quoted = true;
        else if (c === ',') { row.push(cell); cell = ''; }
        else if (c === '\n' || c === '\r') {
            if (c === '\r' && text[i + 1] === '\n') i++;
            row.push(cell); rows.push(row); row = []; cell = '';
        } else cell += c;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((r) => r.length > 1 || r[0] !== '');
}

/**
 * A CSV's rows as {column: value}: a Map by participant.id_in_session for each session, in the
 * order they come (oTree's test runs one session for each of its bots' cases).
 */
function bySession(text) {
    const [head, ...rows] = parseCSV(text);
    const sessions = new Map();
    for (const r of rows) {
        const rec = {};
        head.forEach((h, i) => { rec[h] = r[i] == null ? '' : r[i]; });
        const code = rec['session.code'] || '';
        if (!sessions.has(code)) sessions.set(code, new Map());
        sessions.get(code).set(rec['participant.id_in_session'], rec);
    }
    return [...sessions.values()];
}

/** Whether two cells hold the same value: numbers as numbers (10 and 10.0), else as text. */
function same(a, b) {
    if (a === b) return true;
    const x = Number(a), y = Number(b);
    if (a !== '' && b !== '' && !Number.isNaN(x) && !Number.isNaN(y)) return Math.abs(x - y) < 1e-9;
    // oTree writes booleans as 1/0 and None as ''.
    const norm = (v) => ({ True: '1', False: '0', true: '1', false: '0', None: '' }[v] ?? v);
    return norm(a) === norm(b);
}

/** oTree's wide CSV of `runs` runs of the config, each in a fresh copy of the project. */
function runOtree(opts) {
    const otree = path.join(__dirname, opts.otree, 'venv', 'bin', 'otree');
    if (!fs.existsSync(otree)) throw new Error('no oTree ' + opts.otree + ': run tools/otree/setup.sh ' + opts.otree);
    const out = [];
    for (let k = 0; k < opts.runs; k++) {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'otree-compare-'));
        const copy = path.join(dir, 'project');
        fs.cpSync(opts.project, copy, { recursive: true, filter: (src) => !/(^|\/)(\.git|venv|\.venv|__pycache__|db\.sqlite3)$/.test(src) });
        // oTree 5 will not start without one (jtree's fixtures leave out the files that were there).
        fs.mkdirSync(path.join(copy, '_static'), { recursive: true });
        const args = ['test', opts.config, ...(opts.n ? [String(opts.n)] : []), '--export', path.join(dir, 'export')];
        const env = { ...process.env };
        if (opts.seed != null) {
            // Python's random seeded as it starts (sitecustomize), before oTree makes the session.
            fs.mkdirSync(path.join(dir, 'seed'));
            fs.writeFileSync(path.join(dir, 'seed', 'sitecustomize.py'), 'import random\nrandom.seed(' + JSON.stringify(String(opts.seed)) + ')\n');
            env.PYTHONPATH = path.join(dir, 'seed') + (env.PYTHONPATH ? path.delimiter + env.PYTHONPATH : '');
        }
        try {
            execFileSync(otree, args, { cwd: copy, stdio: 'pipe', timeout: 600000, env });
        } catch (err) {
            throw new Error('oTree failed: ' + String(err.stdout || '').split('\n').slice(-15).join('\n') + String(err.stderr || '').split('\n').slice(-15).join('\n'));
        }
        out.push(fs.readFileSync(path.join(dir, 'export', 'all_apps_wide.csv'), 'utf8'));
        fs.rmSync(dir, { recursive: true, force: true });
    }
    return out;
}

/** jtree's wide CSV of the config for each of its bots' cases, by oTree's rules, played by the project's bots. */
async function runJtree(opts, cases) {
    const { startServer } = require(path.join(REPO, 'server/test/harness.js'));
    const python = require(path.join(REPO, 'server/source/dialects/otree/runtime.js'));
    const { runBots } = require(path.join(REPO, 'server/source/dialects/otree/bots.js'));
    const { exporter } = require(path.join(REPO, 'server/source/exporters/index.js'));
    const server = await startServer();
    try {
        await python.ready();
        const file = path.join(opts.project, 'settings.py') + '#' + opts.config;
        const n = opts.n ? Number(opts.n) : undefined;
        try { server.createSession(file, { numParticipants: n, mode: 'otree' }); } catch (err) { /* packages loading */ }
        await python.ready();
        if (opts.seed != null) python.py.runPython('import random\nrandom.seed(' + JSON.stringify(String(opts.seed)) + ')');
        const out = [];
        for (let caseIndex = 0; caseIndex < cases; caseIndex++) {
            const session = server.createSession(file, { numParticipants: n, mode: 'otree' });
            session.start();
            await runBots(session, { timeout: 300000, caseIndex });
            out.push(exporter(session, 'otree-wide').write(session));
        }
        return out;
    } finally {
        await server.close();
    }
}

/**
 * The comparison of one session (one bots' case): {compared, differ: [{column, participant,
 * otree, jtree}], onlyOtree, onlyJtree, random}. otreeRuns: that session in each run of oTree's
 * (Maps by participant); jt: jtree's.
 */
function compare(runs, jt) {
    const first = runs[0];
    const columns = Object.keys(first.values().next().value || {}).filter((c) => !BOOKKEEPING.test(c));
    // Columns every run gave the same values in, for every participant.
    const steady = columns.filter((c) => [...first.keys()].every((p) => runs.every((r) => r.get(p) != null && same(r.get(p)[c], first.get(p)[c]))));
    // (With a seed, one run: every column.)
    const jtColumns = new Set(Object.keys(jt.values().next().value || {}));
    const onlyOtree = steady.filter((c) => !jtColumns.has(c));
    const onlyJtree = [...jtColumns].filter((c) => !BOOKKEEPING.test(c) && !columns.includes(c));
    const differ = [];
    for (const c of steady) {
        if (!jtColumns.has(c)) continue;
        for (const p of first.keys()) {
            const o = first.get(p)[c];
            const j = jt.get(p) == null ? undefined : jt.get(p)[c];
            if (j === undefined || !same(o, j)) differ.push({ column: c, participant: p, otree: o, jtree: j });
        }
    }
    return { columns: columns.length, compared: steady.filter((c) => jtColumns.has(c)), differ, onlyOtree, onlyJtree, random: columns.filter((c) => !steady.includes(c)) };
}

async function main() {
    const opts = parseArgs(process.argv.slice(2));
    const otreeRuns = runOtree(opts).map(bySession);
    const cases = otreeRuns[0].length;
    const jtreeRuns = (await runJtree(opts, cases)).map((text) => bySession(text)[0]);
    let failed = false;
    const saved = [];
    for (let k = 0; k < cases; k++) {
        const r = compare(otreeRuns.map((run) => run[k]), jtreeRuns[k]);
        const name = opts.config + (cases > 1 ? ' (case ' + k + ')' : '');
        console.log(`${name}: ${r.compared.length} columns compared (of ${r.columns}; ${r.random.length} differ between oTree's runs)`);
        for (const d of r.differ) console.log(`  differ  ${d.column} (participant ${d.participant}): oTree ${JSON.stringify(d.otree)}, jtree ${JSON.stringify(d.jtree)}`);
        for (const c of r.onlyOtree) console.log(`  only in oTree's  ${c}`);
        for (const c of r.onlyJtree) console.log(`  only in jtree's  ${c}`);
        failed = failed || r.differ.length > 0 || r.onlyOtree.length > 0;
        saved.push(r.compared);
    }
    if (opts.save) {
        fs.mkdirSync(opts.save, { recursive: true });
        fs.writeFileSync(path.join(opts.save, opts.config + '.json'), JSON.stringify({
            config: opts.config, participants: opts.n ? Number(opts.n) : null, otree: opts.otree, seed: opts.seed,
            // For each bots' case: its rows' values in the columns oTree's runs agreed on.
            cases: otreeRuns[0].map((session, k) => [...session.values()].map((rec) => Object.fromEntries(saved[k].map((c) => [c, rec[c]])))),
        }, null, 1) + '\n');
    }
    process.exit(failed ? 1 : 0);
}

if (require.main === module) {
    main().catch((err) => { console.error(err.stack || err); process.exit(2); });
}

module.exports = { compare, bySession, same, parseCSV };
