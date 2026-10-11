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
    /** The subject's records (their players) in the periods before player's, as a history box shows them. */
    history: (player) => {
        const period = player.group.period;
        return period.app.periods.slice(0, period.id - 1)
            .map((p) => z.subjects(p).find((x) => x.participant === player.participant)).filter(Boolean)
            .map((x) => Object.assign(Object.create(x), { _id: x.Period }));
    },
    globals: (period) => (period == null ? {} : (period.globals = period.globals || {})),
    contracts: (period) => (period == null ? [] : (period.contracts = period.contracts || [])),
    summary: (app) => (app.summary = app.summary || []),
    session: (period) => z.subjects(period).map((p) => (p.participant.session_ = p.participant.session_ || { Subject: p.Subject })),

    /** A table's records (contracts, or another of the treatment's). */
    table: (period, table) => {
        if (period == null) return [];
        if (table === 'contracts') return z.contracts(period);
        // A table that lasts the treatment: the app's (app.ztLasting).
        if ((period.app.ztLasting || []).includes(table)) {
            const lasting = period.app.lasting_ || (Object.defineProperty(period.app, 'lasting_', { value: {}, enumerable: false }), period.app.lasting_);
            return (lasting[table] = lasting[table] || []);
        }
        period.tables = period.tables || {};
        return (period.tables[table] = period.tables[table] || []);
    },
    /** A new record of a table (contracts, ...), its variables 0, with an id (_id) in its table; then the background's programs for its table. */
    newRecord: (period, table, vars) => z.initRecord(period, table, z.add(period, table, z.blank(period, vars))),
    /** A new record gets the background's programs for its table (app.ztInits), as in z-Tree. */
    initRecord: (period, table, rec) => {
        const init = (period.app.ztInits || {})[table];
        if (init) init(rec, period, z.globals(period));
        return rec;
    },
    /** rec's array name, made as its table declares it (app.ztArrays) if it is not there yet. */
    arr: (rec, name, table, period) => {
        if (rec[name] != null && rec[name].values) return rec[name];
        const make = ((period.app.ztArrays || {})[table] || {})[name];
        if (make == null) return rec[name];
        return (rec[name] = make(rec, period, z.globals(period)));
    },
    /** A record not yet in a table: its variables 0, Period the period's. */
    blank: (period, vars) => {
        const rec = {};
        for (const v of vars) rec[v] = 0;
        rec.Period = period.id;
        return rec;
    },
    /** Puts rec in table, with an id. */
    add: (period, table, rec) => {
        const records = z.table(period, table);
        rec._id = records.reduce((m, r) => Math.max(m, r._id || 0), 0) + 1;
        records.push(rec);
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
    median: (records, cond, value) => {
        const xs = records.filter((r) => !cond || cond(r)).map((r) => Number(value(r))).sort((a, b) => a - b);
        if (xs.length === 0) return 0;
        const m = Math.floor(xs.length / 2);
        return xs.length % 2 ? xs[m] : (xs[m - 1] + xs[m]) / 2;
    },
    maximum: (records, cond, value) => Math.max(...records.filter((r) => !cond || cond(r)).map((r) => Number(value(r)))),
    find: (records, cond, value) => {
        const r = records.find((x) => !cond || cond(x));
        return r == null ? 0 : value == null ? 1 : value(r);
    },

    /** Records sorted by keys: [[key (a function of a record), descending], ...], as a contract list's sorting. */
    sort: (records, keys) => (keys.length === 0 ? records.slice() : records.slice().sort((a, b) => {
        for (const [key, desc] of keys) {
            const d = Number(key(a)) - Number(key(b));
            if (Math.abs(d) > 1e-12) return desc ? -d : d;
        }
        return 0;
    })),

    // z-Tree's functions.
    round: (x, step = 1) => {
        step = Math.abs(step) || 1;
        return Number((Math.round(x / step + (x >= 0 ? 1e-9 : -1e-9)) * step).toFixed(12));
    },
    rounddown: (x, step = 1) => Number((Math.floor(x / (Math.abs(step) || 1) + 1e-9) * (Math.abs(step) || 1)).toFixed(12)),
    roundup: (x, step = 1) => Number((Math.ceil(x / (Math.abs(step) || 1) - 1e-9) * (Math.abs(step) || 1)).toFixed(12)),
    mod: (a, b) => ((a % b) + b) % b,
    /** A color, from red, green and blue between 0 and 1. */
    rgb: (r, g, b) => 'rgb(' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255)).join(',') + ')',

    /** iterator(i, from, to, step)'s values. */
    range: (from, to, step = 1) => {
        const out = [];
        for (let v = from; step > 0 ? v <= to + 1e-9 : v >= to - 1e-9; v += step) out.push(Number(v.toFixed(12)));
        return out;
    },

    // Arrays: array x[n] (from 1 to n), array x[from, to(, step)].
    array: (lo, hi, step = 1) => ({ lo, step, values: new Array(Math.max(0, Math.floor((hi - lo) / step + 1e-9) + 1)).fill(0) }),
    at: (arr, i, period) => arr.values[z.index(arr, i, period)],
    put: (arr, i, v, period) => { arr.values[z.index(arr, i, period)] = v; },
    /**
     * The position in arr of index i (rounded to its nearest). Out of range: by z-Tree's rules
     * (the session's mode is 'ztree'), the first or last element, as z-Tree 5 does; by jtree's, an error.
     */
    index: (arr, i, period) => {
        const k = Math.round((i - arr.lo) / arr.step);
        if (k >= 0 && k < arr.values.length) return k;
        if (z.mode(period) === 'ztree' && arr.values.length > 0) return k < 0 ? 0 : arr.values.length - 1;
        throw new Error('array index ' + i + ' out of range');
    },
    /** a / b; by z-Tree's rules, dividing by 0 gives an infinity (or NaN), as in z-Tree 5; by jtree's, an error. */
    div: (a, b, period) => {
        if (Number(b) === 0 && z.mode(period) !== 'ztree') throw new Error('division by zero');
        return a / b;
    },
    /** Whose rules the session runs by (see Session#engineMode). */
    mode: (period) => {
        const session = period && period.app && period.app.session;
        return session != null && typeof session.engineMode === 'function' ? session.engineMode() : 'jtree';
    },

    /** RTF's text (a label or a value's text made as RTF): its control words and groups taken out. */
    rtf: (text) => {
        const s = String(text);
        if (!s.trimStart().startsWith('{\\rtf')) return s;
        const cp1252 = '€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008dŽ\u008f\u0090‘’“”•–—˜™š›œ\u009džŸ';
        const char = (b) => (b >= 0x80 && b <= 0x9f ? cp1252[b - 0x80] : String.fromCharCode(b));
        return s.trimStart().replace(/\\'([0-9a-fA-F]{2})/g, (all, hex) => char(parseInt(hex, 16)))
            .replace(/\\([{}\\])/g, (all, c) => ({ '{': '\ue000', '}': '\ue001', '\\': '\ue002' })[c])
            .replace(/\\par[d]? ?/g, '\n').replace(/\{\\\*[^}]*\}/g, '')
            .replace(/\\[a-z]+-?\d* ?/g, '').replace(/[{}]/g, '')
            .replace(/[\ue000-\ue002]/g, (c) => ({ '\ue000': '{', '\ue001': '}', '\ue002': '\\' })[c]).trim();
    },

    /**
     * A value shown with a layout: {step} (a number, rounded to it) or {options} ([value, text]:
     * the text of the value, else of the largest value below it; <|1> in it, the value).
     */
    fmt: (v, layout = { step: 1 }) => {
        if (v == null) return '';
        if (typeof v === 'string') return v;
        if (v.values) return v.values.join(', ');
        if (layout.options == null) {
            const step = layout.step > 0 ? layout.step : 1;
            const decimals = Math.max(0, Math.min(10, -Math.floor(Math.log10(step) + 1e-9)));
            return z.round(Number(v), step).toFixed(decimals);
        }
        let best = null;
        for (const [k, text] of layout.options) {
            if (Math.abs(k - v) < 1e-9) { best = { k, text }; break; }
            if (k <= v && (best == null || k > best.k)) best = { k, text };
        }
        const text = best == null ? String(v) : typeof best.text === 'function' ? String(best.text()) : best.text;
        return z.rtf(text.replace(/<\|([^>]*)>/g, (all, step) => z.fmt(v, { step: Number(step) || 1 })));
    },

    /**
     * Sets a jtree stage up as a z-Tree stage. It waits for all subjects to start (unless it
     * starts as each subject gets there). Its screen is a form its button sends, or, if
     * interactive (its buttons need not end it: contract lists, chat, ...), its buttons send
     * messages (ztButton, ztChat) that run their programs (z.press), while it goes on.
     */
    stage: (stage, { waitForAll, interactive = false }) => {
        stage.waitToStart = waitForAll;
        stage.waitForAllGroups = waitForAll;
        stage.waitToEnd = false;
        stage.wrapPlayingScreenInFormTag = interactive ? 'no' : 'yes';
        stage.addOKButtonIfNone = false;
        stage.endOnTimeout = true;
        stage.playerStart = (player) => z.refresh(player);
    },

    /**
     * What a subject's screen shows that the page cannot work out (it has the subject, globals,
     * and contracts, not the other subjects): the stage's values, lists' rows and boxes'
     * display conditions, worked out here as player.zt_.
     */
    refresh: (player) => {
        const stage = player.stage;
        if (stage == null) return;
        const period = player.group.period;
        const g = z.globals(period);
        const out = { v: {}, lists: {}, show: {} };
        const safe = (f, otherwise) => {
            try { return f(); } catch (err) { z.log(player, err); return otherwise; }
        };
        for (const [k, f] of Object.entries(stage.values || {})) out.v[k] = safe(() => f(player, period, g), '');
        for (const [k, f] of Object.entries(stage.shows || {})) out.show[k] = safe(() => !!f(player, period, g), true);
        for (const [k, list] of Object.entries(stage.lists || {})) {
            out.lists[k] = safe(() => list.rows(player, period, g).map((rec) => ({
                id: rec._id, cells: list.cells(rec, player, period, g), own: list.own ? !!list.own(rec, player) : false,
            })), []);
        }
        out.plots = {};
        for (const [k, plot] of Object.entries(stage.plots || {})) out.plots[k] = safe(() => JSON.stringify(z.plot(plot, player, period, g)), '');
        player.zt_ = out;
    },

    // --- Plot boxes ---------------------------------------------------------------------------

    /** A plot box's shapes for a subject: {range, shapes, inputs, boxInputs}, as participant/ztree-plot.js draws them. */
    plot: (box, player, period, g) => {
        const data = { range: null, shapes: [], inputs: [], boxInputs: [] };
        const plot = {
            shapes: data.shapes,
            boxInputs: data.boxInputs,
            range: (x1, x2, y1, y2, keepAspect) => { data.range = { x1, x2, y1, y2, keepAspect }; },
            /** A shape, drawn for records (its graphs', innermost first). */
            add: (shape, records) => {
                shape.records = records;
                if (shape.kind === 'axis') {
                    if (shape.label > 0) {
                        shape.labels = [];
                        for (let v = Math.ceil(shape.from / shape.label - 1e-9) * shape.label; v <= shape.to + 1e-9 && shape.labels.length < 200; v += shape.label) {
                            shape.labels.push([v, z.fmt(v, shape.layout)]);
                        }
                    }
                    delete shape.layout;
                }
                data.shapes.push(shape);
                return shape;
            },
            /** An input that applies now: its id (its place in the box, then @ and the records it is drawn for). */
            input: (id, action) => {
                data.inputs.push({ id, action });
                return id;
            },
            /** A graph's line, joining its points record by record (drawn under them). */
            joined: (points, color, width) => {
                if (color && points.length > 1) data.shapes.unshift({ kind: 'polyline', points, color, width });
            },
        };
        box.draw(plot, player, period, g);
        return data;
    },
    num: (v) => (typeof v === 'number' ? v : typeof v === 'boolean' ? Number(v) : Number(v) || 0),
    color: (v) => (typeof v === 'string' ? v : null),
    /** A record's id in a plot input's (a subject's: their Subject; globals: g). */
    idOf: (rec) => (rec._id != null ? rec._id : rec.Subject != null ? rec.Subject : 'g'),
    ids: (records) => records.map((r) => r.table + ':' + r.id).join(','),
    /** An axis of a rectangle from an edge (at: 0 the low one, 1 the high one, 0.5 the centre) and its size. */
    span: (edge, size, at) => (at === 0 ? [edge, edge + size] : at === 1 ? [edge - size, edge] : [edge - size / 2, edge + size / 2]),
    rect: ([x1, x2], [y1, y2]) => ({ x1, x2, y1, y2 }),

    /**
     * A subject used a plot input (d: {stage, box, input (its id), x, y (where), x0, y0, x1, y1
     * (a drag's start and end)}): a click (action 0) makes a record of the input's table at the
     * point (or, for subjects, moves the subject's), a click on an item (1) or a drag (2) is its
     * record's; then the input's programs run (stage.plots[box].inputs).
     */
    plotInput: (player, d) => {
        if (player == null || player.stage == null || d == null || player.stage.id !== d.stage || player.status !== 'playing') return;
        const box = (player.stage.plots || {})[d.box];
        const [path, recordsText] = String(d.input || '').split('@');
        const input = box == null ? null : box.inputs[path];
        if (input == null) return z.message(player, 'There is no such input.');
        const period = player.group.period;
        const g = z.globals(period);
        // The records it was drawn for, innermost first.
        const recs = [];
        for (const ref of recordsText ? recordsText.split(',') : []) {
            const table = ref.slice(0, ref.lastIndexOf(':'));
            const id = ref.slice(ref.lastIndexOf(':') + 1);
            const records = table === 'subjects' ? z.subjects(period) : table === 'globals' ? [g] : z.table(period, table);
            const rec = records.find((r) => String(z.idOf(r)) === id);
            if (rec == null) return z.message(player, 'That is gone.');
            recs.push(rec);
        }
        if (input.ok && !input.ok(player, period, g, recs)) return;
        const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
        const coords = {};
        if (input.vars.x) coords[input.vars.x] = input.action === 2 ? n(d.x1) - n(d.x0) : n(d.x);
        if (input.vars.y) coords[input.vars.y] = input.action === 2 ? n(d.y1) - n(d.y0) : n(d.y);
        if (input.action === 2) for (const k of ['x0', 'y0', 'x1', 'y1']) if (input.vars[k]) coords[input.vars[k]] = n(d[k]);
        const rec = input.action === 0 && input.table !== 'subjects' ? z.initRecord(period, input.table, z.add(period, input.table, z.blank(period, input.tableVars || []))) : null;
        try {
            input.run(player, rec, period, g, recs, coords);
        } catch (err) {
            z.log(player, err);
        }
        z.changed(period);
    },

    /** After a change to the tables: each subject's screen is worked out again and sent. */
    changed: (period) => {
        for (const player of z.subjects(period)) {
            // LeaveStage set to 1 by a program (z-Tree's): the subject leaves the stage; it is 0 again.
            if (Number(player.LeaveStage) === 1 && player.status === 'playing') {
                player.LeaveStage = 0;
                z.endStage(player);
            }
            z.refresh(player);
            player.participant.emitUpdate();
        }
    },

    /** A message to a subject, in a box they close (as z-Leaf shows a checker's). */
    message: (player, text) => z.send(player, 'ztMessage', { text }),
    send: (player, name, data) => {
        const io = player.session().io();
        if (io != null) io.to(player.participant.roomId()).emit(name, data);
    },
    log: (player, err) => {
        const jt = player.session().jt;
        if (jt != null) jt.log('z-Tree app: ' + (err && err.stack ? err.stack : err));
    },

    /**
     * A subject pressed a button of their stage's screen: d is {stage, box (its path), button
     * (its index), values (the box's inputs, by variable), others ({box: values} of the screen's
     * boxes without buttons), record (the row chosen in a list)}. As in z-Tree: the inputs are
     * checked and set in the button's record (the subject's; a new one of a contract creation
     * box; the chosen one of a contract list), the checkers checked, the programs run, and the
     * subject leaves the stage if the button says so.
     */
    press: (player, d) => {
        if (player == null || player.stage == null || d == null || player.stage.id !== d.stage || player.status !== 'playing') return;
        const stage = player.stage;
        const button = (stage.buttons || {})[d.box + '/' + d.button];
        if (button == null) return z.message(player, 'There is no such button.');
        const period = player.group.period;
        const g = z.globals(period);
        let rec = player;
        if (button.kind === 'new') {
            rec = z.initRecord(period, button.table, z.blank(period, button.vars));
        } else if (button.kind === 'list') {
            const rows = stage.lists[d.box].rows(player, period, g);
            rec = rows.find((r) => String(r._id) === String(d.record));
            if (rec == null) return z.message(player, rows.length === 0 ? 'There is nothing to choose.' : 'Please choose a row first.');
        }
        // Inputs: checked, then set (undone if a checker says no).
        const updates = {};
        for (const input of button.inputs) {
            if (input.shown && !input.shown(player, rec, period, g)) continue;
            const from = input.box == null ? d.values : ((d.others || {})[input.box] || {});
            const raw = from == null ? undefined : from[input.name];
            const text = raw == null ? '' : String(raw).trim();
            if (text === '') {
                if (input.checkbox) { updates[input.name] = { input, v: 0 }; continue; }
                return z.message(player, 'Please enter a value for "' + input.label + '".');
            }
            const v = Number(text.replace(',', '.'));
            if (!Number.isFinite(v)) return z.message(player, '"' + text + '" is not a number.');
            const step = typeof input.step === 'function' ? Number(input.step(player, rec, period, g)) : input.step;
            const min = input.min == null ? null : Number(input.min(player, rec, period, g));
            const max = input.max == null ? null : Number(input.max(player, rec, period, g));
            if ((min != null && v < min - 1e-9) || (max != null && v > max + 1e-9)) {
                return z.message(player, 'Please enter a number from ' + z.fmt(min, { step: step || 1 }) + ' to ' + z.fmt(max, { step: step || 1 }) + '.');
            }
            if (step > 0 && input.numeric && Math.abs(v / step - Math.round(v / step)) > 1e-6) {
                return z.message(player, 'Please enter a multiple of ' + step + '.');
            }
            updates[input.name] = { input, v };
        }
        // Set (an array's element through its input's set), undone if a checker says no.
        const saved = [];
        for (const { input, v } of Object.values(updates)) {
            if (input.set) {
                const old = input.get(player, rec, period, g);
                saved.push(() => input.set(player, rec, period, g, old));
                input.set(player, rec, period, g, v);
            } else {
                const k = input.name;
                const old = Object.prototype.hasOwnProperty.call(rec, k) ? rec[k] : undefined;
                saved.push(() => { if (old === undefined) delete rec[k]; else rec[k] = old; });
                rec[k] = v;
            }
        }
        const no = button.check ? button.check(player, rec, period, g) : null;
        if (no != null) {
            for (const undo of saved.reverse()) undo();
            return z.message(player, no);
        }
        if (button.kind === 'new') z.add(period, button.table, rec);
        try {
            if (button.run) button.run(player, rec, period, g);
        } catch (err) {
            z.log(player, err);
        }
        z.send(player, 'ztAccepted', { box: d.box });
        z.changed(period);
        if (button.leaves) z.endStage(player);
    },

    /** A subject's chat entry (d: {stage, box, text}): a new record of the chat box's table. */
    chat: (player, d) => {
        if (player == null || player.stage == null || d == null || player.stage.id !== d.stage) return;
        const chat = (player.stage.chats || {})[d.box];
        const text = String((d && d.text) || '').slice(0, 1000);
        if (chat == null || text.trim() === '') return;
        const period = player.group.period;
        const rec = z.initRecord(period, chat.table, z.blank(period, chat.vars));
        rec[chat.variable] = text;
        z.add(period, chat.table, rec);
        try {
            if (chat.run) chat.run(player, rec, period, z.globals(period));
        } catch (err) {
            z.log(player, err);
        }
        z.changed(period);
    },

    /** Ends a subject's stage, after what is running now. */
    endStage: (player) => player.session().pushMessage(player, true, 'endStage'),

    /**
     * later (seconds) do { } (repeat: again after the seconds fn returns, while they are more
     * than 0): fn runs after seconds, and the screens are sent again; until the period ends.
     */
    later: (period, seconds, fn, repeat = false) => {
        const timers = period.timers_ || (Object.defineProperty(period, 'timers_', { value: new Set(), enumerable: false }), period.timers_);
        const after = (s) => {
            if (!(Number(s) > 0)) return;
            const timer = setTimeout(() => {
                timers.delete(timer);
                if (period.ended_) return;
                let again = null;
                try {
                    again = fn();
                } catch (err) {
                    const p = z.subjects(period)[0];
                    if (p) z.log(p, err);
                }
                z.changed(period);
                const session = period.app.session;
                if (session != null) session.emitParticipantUpdates();
                if (repeat) after(again);
            }, Number(s) * 1000);
            if (timer.unref) timer.unref();
            timers.add(timer);
        };
        after(seconds);
    },
    /** The period is over: its later blocks stop. */
    endPeriod: (period) => {
        Object.defineProperty(period, 'ended_', { value: true, enumerable: false, configurable: true });
        for (const t of period.timers_ || []) clearTimeout(t);
    },
};

module.exports = z;
