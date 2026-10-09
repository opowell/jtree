/*
 * What jtree apps converted from z-Tree treatments use (see convert.js): written beside each
 * converted app as ztree.cjs, and required by its app.jtt. z-Tree's tables are jtree's objects:
 * subjects are the period's players, globals period.globals, contracts period.contracts, summary
 * app.summary (a record a period), session each participant's participant.session.
 */

const z = {
    /** The period's players (z-Tree's subjects table), in subject order. */
    subjects: (period) => (period == null ? [] : period.groups.flatMap((g) => g.players).sort((a, b) => a.Subject - b.Subject)),
    /** The period before (for OLDsubjects and the like), or null. */
    before: (period) => (period == null ? null : period.app.periods[period.id - 2] || null),
    globals: (period) => (period == null ? {} : (period.globals = period.globals || {})),
    contracts: (period) => (period == null ? [] : (period.contracts = period.contracts || [])),
    summary: (app) => (app.summary = app.summary || []),
    session: (period) => z.subjects(period).map((p) => (p.participant.session_ = p.participant.session_ || { Subject: p.Subject })),

    /** A new record of a table (contracts, ...), its variables 0. */
    newRecord: (period, table, vars) => {
        const rec = {};
        for (const v of vars) rec[v] = 0;
        if (table === 'contracts') z.contracts(period).push(rec);
        else (period.tables = period.tables || {}, period.tables[table] = period.tables[table] || []).push(rec);
        return rec;
    },
    /** Sets a record's variables to 0 where they are not set. */
    init: (rec, vars) => {
        for (const v of vars) if (rec[v] === undefined) rec[v] = 0;
        return rec;
    },

    // Table functions: over records, those meeting cond, of value.
    count: (records, cond) => records.filter((r) => !cond || cond(r)).length,
    sum: (records, cond, value) => records.filter((r) => !cond || cond(r)).reduce((s, r) => s + Number(value(r)), 0),
    product: (records, cond, value) => records.filter((r) => !cond || cond(r)).reduce((s, r) => s * Number(value(r)), 1),
    average: (records, cond, value) => {
        const xs = records.filter((r) => !cond || cond(r));
        return xs.length === 0 ? 0 : z.sum(xs, null, value) / xs.length;
    },
    minimum: (records, cond, value) => Math.min(...records.filter((r) => !cond || cond(r)).map((r) => Number(value(r)))),
    maximum: (records, cond, value) => Math.max(...records.filter((r) => !cond || cond(r)).map((r) => Number(value(r)))),
    find: (records, cond, value) => {
        const r = records.find((x) => !cond || cond(x));
        return r == null ? 0 : value == null ? 1 : value(r);
    },

    // z-Tree's functions.
    round: (x, step = 1) => {
        step = Math.abs(step) || 1;
        return Number((Math.round(x / step + (x >= 0 ? 1e-9 : -1e-9)) * step).toFixed(12));
    },
    rounddown: (x, step = 1) => Number((Math.floor(x / (Math.abs(step) || 1) + 1e-9) * (Math.abs(step) || 1)).toFixed(12)),
    roundup: (x, step = 1) => Number((Math.ceil(x / (Math.abs(step) || 1) - 1e-9) * (Math.abs(step) || 1)).toFixed(12)),
    mod: (a, b) => ((a % b) + b) % b,

    // Arrays: array x[n] (from 1 to n), array x[from, to(, step)].
    array: (lo, hi, step = 1) => ({ lo, step, values: new Array(Math.max(0, Math.floor((hi - lo) / step + 1e-9) + 1)).fill(0) }),
    at: (arr, i) => arr.values[Math.round((i - arr.lo) / arr.step)],
    put: (arr, i, v) => { arr.values[Math.round((i - arr.lo) / arr.step)] = v; },

    /**
     * Sets a jtree stage up as a z-Tree stage: its screen is a form its button submits, and it
     * waits for all subjects to start (unless it starts as each subject gets there).
     */
    stage: (stage, { waitForAll }) => {
        stage.waitToStart = waitForAll;
        stage.waitForAllGroups = waitForAll;
        stage.waitToEnd = false;
        stage.wrapPlayingScreenInFormTag = 'yes';
        stage.addOKButtonIfNone = false;
        stage.endOnTimeout = true;
    },
};

module.exports = z;
