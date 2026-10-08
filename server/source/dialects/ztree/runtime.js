/*
 * A z-Tree treatment running in a jtree session (one Run per app of a session): its tables, its
 * programs, its buttons and its screens.
 *
 * Tables, each period: globals (one record), subjects (one per participant: Period, Subject,
 * Group, Profit, TotalProfit, Participate), summary (one per period, all periods'), contracts
 * (created by the programs and contract boxes), session (one per participant, all periods').
 * OLD<table> is the period before's.
 */

const lang = require('./lang.js');
const render = require('./render.js');

const BUILT_IN = {
    globals: ['Period', 'NumPeriods', 'RepeatTreatment'],
    subjects: ['Period', 'Subject', 'Group', 'Profit', 'TotalProfit', 'Participate', 'LeaveStage'],
    summary: ['Period'],
    session: ['Subject', 'FinalProfit', 'ShowUpFee', 'MoneyAdded'],
    contracts: [],
};

/** Parsed programs, by their code. */
const compiled = new Map();
function program(code) {
    if (!compiled.has(code)) compiled.set(code, lang.parse(code || ''));
    return compiled.get(code);
}

class Run {
    /**
     * @param {Object} treatment From ztt.js.
     * @param {App} app The session's app.
     */
    constructor(treatment, app) {
        this.treatment = treatment;
        this.app = app;
        this.periods = [];     // by period index: {globals, subjects, contracts, summary, started}
        this.sessionRecords = []; // by subject index
        this.nextId = 1;
        this.timers = [];
        this.selected = new Map(); // participant id -> {boxPath: record id}
        this.errors = [];
        this.vars = variables(treatment);
    }

    // --- Tables -------------------------------------------------------------------------

    /** The runtime programs see in period p (0-based): tables, and what they call. */
    view(p) {
        const run = this;
        const state = this.periods[p];
        return {
            period: p,
            records(table, { old } = {}) {
                const s = old ? run.periods[p - 1] : state;
                if (s == null) return [];
                switch (table) {
                    case 'subjects': return s.subjects;
                    case 'globals': return [s.globals];
                    case 'contracts': return s.contracts;
                    case 'summary': return run.periods.slice(0, (old ? p - 1 : p) + 1).filter(Boolean).map((x) => x.summary);
                    case 'session': return run.sessionRecords;
                    default: return (s.other[table] = s.other[table] || []);
                }
            },
            globals() { return state.globals; },
            isVar(table, name) { return run.vars[table] != null && run.vars[table].has(name); },
            newRecord(table) { return run.newRecord(p, table); },
            later(seconds, fn) { run.later(seconds, fn); },
            time() { return (Date.now() - state.startedAt) / 1000; },
            history(ctx) {
                const subject = ctx.rec.Subject;
                return run.periods.slice(0, p).filter(Boolean).map((s) => s.subjects.find((r) => r.Subject === subject)).filter(Boolean);
            },
            contractRows(box, ctx) { return run.contractRows(box, ctx, this); },
        };
    }

    newRecord(p, table) {
        const rec = { _id: this.nextId++ };
        for (const name of this.vars[table] || []) rec[name] = 0;
        rec.Period = p + 1;
        const state = this.periods[p];
        if (table === 'contracts') state.contracts.push(rec);
        else if (table !== 'subjects' && table !== 'globals') (state.other[table] = state.other[table] || []).push(rec);
        return rec;
    }

    /** Starts period p (0-based) for the subjects (the session's participants, in order). */
    startPeriod(p, numSubjects) {
        const t = this.treatment;
        const before = this.periods[p - 1];
        const state = {
            globals: { _id: this.nextId++, Period: p + 1, NumPeriods: t.periods.length, RepeatTreatment: 0 },
            subjects: [],
            contracts: [],
            summary: { _id: this.nextId++, Period: p + 1 },
            other: {},
            startedAt: Date.now(),
            globalsRun: new Set(), // stages whose globals programs have run (stages started one by one)
        };
        this.periods[p] = state;
        for (let i = 0; i < numSubjects; i++) {
            const cell = paramCell(t, p, i) || { group: 1, program: '' };
            const rec = { _id: this.nextId++ };
            for (const name of this.vars.subjects) rec[name] = 0;
            Object.assign(rec, {
                Period: p + 1, Subject: i + 1, Group: cell.group == null ? 1 : cell.group, Profit: 0,
                TotalProfit: before != null && before.subjects[i] != null ? before.subjects[i].TotalProfit : 0, Participate: 1,
            });
            state.subjects.push(rec);
            if (this.sessionRecords[i] == null) this.sessionRecords[i] = { _id: this.nextId++, Subject: i + 1 };
        }
        for (const name of this.vars.globals) if (!(name in state.globals)) state.globals[name] = 0;
        const view = this.view(p);
        // The background's programs, then the parameter table's: the period's, the subject's
        // (role's), then the cell's.
        this.runPrograms(t.background.programs, view, state.subjects);
        const periodProgram = (t.periods[p] || {}).program;
        if (periodProgram) this.exec(periodProgram, { rt: view, table: 'globals', rec: state.globals, outer: null });
        state.subjects.forEach((rec, i) => {
            const role = t.subjects[i % Math.max(1, t.subjects.length)];
            if (role && role.program) this.exec(role.program, { rt: view, table: 'subjects', rec, outer: null });
            const cell = paramCell(t, p, i);
            if (cell && cell.program) this.exec(cell.program, { rt: view, table: 'subjects', rec, outer: null });
        });
    }

    /** Ends period p: profits added up. */
    endPeriod(p) {
        const state = this.periods[p];
        if (state == null || state.ended) return;
        state.ended = true;
        for (const rec of state.subjects) rec.TotalProfit = lang.num(rec.TotalProfit) + lang.num(rec.Profit);
        this.clearTimers();
    }

    /**
     * Runs programs (a stage's, the background's) for the subjects starting it: each program, in
     * order, on its table's records (subjects: those starting; globals: once).
     */
    runPrograms(programs, view, subjects, { globalsOnce } = {}) {
        for (const pr of programs) {
            const table = pr.table || 'subjects';
            let records;
            if (table === 'subjects') records = subjects;
            else if (table === 'globals') {
                if (globalsOnce != null) {
                    if (globalsOnce.has(pr)) continue;
                    globalsOnce.add(pr);
                }
                records = [view.globals()];
            } else if (table === 'summary') records = [view.records('summary').slice(-1)[0]];
            else if (table === 'session') records = subjects.map((s) => this.sessionRecords[s.Subject - 1]).filter(Boolean);
            else records = view.records(table);
            for (const rec of records.slice()) {
                const ctx = { rt: view, table, rec, outer: null };
                if (pr.condition && !lang.bool(this.value(pr.condition, ctx))) continue;
                this.exec(pr.code, ctx);
            }
        }
    }

    /** Runs code in ctx; an error is noted (and logged), not thrown. */
    exec(code, ctx) {
        try {
            lang.run(program(code), ctx);
        } catch (err) {
            this.note('in a program on ' + ctx.table + ': ' + err.message);
        }
    }

    value(code, ctx) {
        try {
            return lang.evaluate(render.expression(code), ctx);
        } catch (err) {
            this.note(code + ': ' + err.message);
            return 0;
        }
    }

    note(message) {
        this.errors.push(message);
        if (this.app.jt != null) this.app.jt.log('z-Tree: ' + message);
    }

    later(seconds, fn) {
        const timer = setTimeout(() => {
            this.timers = this.timers.filter((t) => t !== timer);
            try {
                fn();
            } catch (err) {
                this.note('in a later block: ' + err.message);
            }
            this.onChange();
        }, seconds * 1000);
        if (timer.unref) timer.unref();
        this.timers.push(timer);
    }

    clearTimers() {
        this.timers.forEach(clearTimeout);
        this.timers = [];
    }

    /** Called when the tables change outside a participant's action (later blocks). */
    onChange() {}

    /** A contract list's rows: the box table's records that meet its condition, sorted. */
    contractRows(box, ctx, view) {
        const table = box.table || 'contracts';
        let records = view.records(table).filter((rec) => !box.tableCondition ||
            lang.bool(this.value(box.tableCondition, { rt: view, table, rec, outer: ctx })));
        if (box.sorting) {
            // Keys separated by ;, each descending with a - before it: "-p; -contractID".
            const keys = box.sorting.split(';').map((k) => k.trim()).filter(Boolean).map((k) => ({
                desc: k.startsWith('-'), code: k.replace(/^[-+]\s*/, ''),
            }));
            const k = (rec, key) => lang.num(this.value(key.code, { rt: view, table, rec, outer: ctx }));
            records = records.slice().sort((a, b) => {
                for (const key of keys) {
                    const d = k(a, key) - k(b, key);
                    if (Math.abs(d) > 1e-12) return key.desc ? -d : d;
                }
                return 0;
            });
        }
        return records;
    }

    // --- Buttons ------------------------------------------------------------------------

    /**
     * A subject pressed a button of a box of their stage's screen: its inputs are checked and put
     * in their record (or a new one, or the chosen one, for contract boxes), its checkers are
     * checked, and its programs run. Returns {error} (a message for the subject), or {leave}
     * (whether the subject leaves the stage).
     * @param {Object} d {box (path), button (index), values (by input name), record (chosen)}
     */
    press(p, subjectIndex, stage, d) {
        const view = this.view(p);
        const state = this.periods[p];
        const subject = state.subjects[subjectIndex];
        const box = findBox(stage, d.box);
        if (box == null) return { error: 'There is no such box.' };
        // An item with buttons (layout !button) leaves the stage, as a button with no checkers.
        const button = d.itemButton ? { name: '', checkers: [], programs: [] } : box.buttons[Number(d.button)];
        if (button == null) return { error: 'There is no such button.' };
        const own = { rt: view, table: 'subjects', rec: subject, outer: null };
        let target = subject;
        let targetTable = 'subjects';
        let isNew = false;
        if (box.type === 'contractCreation') {
            targetTable = box.table || 'contracts';
            target = { _id: null };
            for (const name of this.vars[targetTable] || []) target[name] = 0;
            target.Period = p + 1;
            isNew = true;
        } else if (box.type === 'contractList') {
            targetTable = box.table || 'contracts';
            const rows = this.contractRows(box, own, view);
            target = rows.find((r) => String(r._id) === String(d.record));
            if (target == null) {
                return { error: rows.length === 0 ? 'There is nothing to choose.' : 'Please choose a row first.' };
            }
        }
        const ctx = targetTable === 'subjects' ? own : { rt: view, table: targetTable, rec: target, outer: own };

        // Inputs: the box's, and (for a standard box's button) those of the screen's boxes that
        // have no buttons of their own; checked, then set (on a copy until the checkers pass).
        const inputs = box.items.map((item) => [item, d.values || {}]);
        if (!['contractCreation', 'contractList', 'chat'].includes(box.type)) {
            const visit = (b, path) => {
                if (path !== String(d.box) && ['standard', 'grid'].includes(b.type) && b.buttons.length === 0) {
                    for (const item of b.items) inputs.push([item, (d.others || {})[path] || {}]);
                }
                b.boxes.forEach((c, i) => visit(c, path + '.' + i));
            };
            stage.active.forEach((b, i) => visit(b, String(i)));
        }
        const updates = {};
        for (const [item, values] of inputs) {
            if (item.kind !== 'item' || !item.input || !item.variable) continue;
            const raw = values[item.variable];
            const text = raw == null ? '' : String(raw).trim();
            const layout = render.parseLayout(item.layout, ctx);
            if (text === '') {
                if (layout.kind === 'checkbox') { updates[item.variable] = 0; continue; }
                return { error: 'Please enter a value for "' + plain(item.label || item.variable) + '".' };
            }
            const v = Number(text.replace(',', '.'));
            if (!Number.isFinite(v)) return { error: '"' + text + '" is not a number.' };
            const min = item.min ? lang.num(this.value(item.min, ctx)) : null;
            const max = item.max ? lang.num(this.value(item.max, ctx)) : null;
            if ((min != null && v < min - 1e-9) || (max != null && v > max + 1e-9)) {
                return { error: 'Please enter a number from ' + render.formatValue(min, layout, ctx) + ' to ' + render.formatValue(max, layout, ctx) + '.' };
            }
            if (layout.kind === 'number' && layout.step > 0 && Math.abs(v / layout.step - Math.round(v / layout.step)) > 1e-6) {
                return { error: 'Please enter a multiple of ' + layout.step + '.' };
            }
            updates[item.variable] = v;
        }
        const saved = {};
        for (const [k, v] of Object.entries(updates)) {
            saved[k] = Object.prototype.hasOwnProperty.call(target, k) ? target[k] : undefined;
            target[k] = v;
        }
        // Checkers: the box's, then the button's.
        for (const checker of [...box.items.filter((i) => i.kind === 'checker'), ...button.checkers]) {
            if (!lang.bool(this.value(checker.condition, ctx))) {
                for (const [k, v] of Object.entries(saved)) {
                    if (v === undefined) delete target[k]; else target[k] = v;
                }
                return { error: render.formatText(checker.message, ctx).replace(/<br>/g, '\n') || 'Not allowed.' };
            }
        }
        if (isNew) {
            target._id = this.nextId++;
            if (targetTable === 'contracts') state.contracts.push(target);
            else (state.other[targetTable] = state.other[targetTable] || []).push(target);
        }
        // The button's programs: on the box's record for its table, the subject's, the globals'.
        for (const pr of button.programs) {
            const table = pr.table || 'subjects';
            let records;
            if (table === targetTable && targetTable !== 'subjects') records = [target];
            else if (table === 'subjects') records = [subject];
            else if (table === 'globals') records = [state.globals];
            else records = view.records(table);
            for (const rec of records) {
                const c = { rt: view, table, rec, outer: table === 'subjects' && rec === subject ? null : own };
                if (pr.condition && !lang.bool(this.value(pr.condition, c))) continue;
                this.exec(pr.code, c);
            }
        }
        const leaves = d.itemButton || ['standard', 'help', 'header', 'grid', 'history', 'calculator', 'unknown'].includes(box.type);
        return { leave: leaves };
    }

    /** A subject's chat entry: a new record of the chat box's table, with its programs run. */
    chat(p, subjectIndex, stage, d) {
        const view = this.view(p);
        const subject = this.periods[p].subjects[subjectIndex];
        const box = findBox(stage, d.box);
        if (box == null || box.type !== 'chat' || !box.variable) return;
        const text = String(d.text || '').slice(0, 1000);
        if (text.trim() === '') return;
        const rec = this.newRecord(p, box.table || 'contracts');
        rec[box.variable] = text;
        const own = { rt: view, table: 'subjects', rec: subject, outer: null };
        for (const pr of box.programs) this.exec(pr.code, { rt: view, table: box.table || 'contracts', rec, outer: own });
    }

    // --- Screens ------------------------------------------------------------------------

    /** The screen a subject sees: stage's active or waiting screen (the background's, if it has none). */
    screen(p, subjectIndex, stage, which, participantId, deadline) {
        const t = this.treatment;
        const view = this.view(p);
        const state = this.periods[p];
        if (state == null) return '';
        const ctx = { rt: view, table: 'subjects', rec: state.subjects[subjectIndex], outer: null, errors: [] };
        const boxes = which === 'active' ? stage.active : (stage.waiting.length ? stage.waiting : t.background.waiting);
        const header = stage.showHeader ? t.background.active.find((b) => b.type === 'header') : null;
        const html = render.renderScreen(boxes, {
            ctx, screen: which, header, period: p + 1, numPeriods: t.periods.length,
            selected: this.selected.get(participantId) || {}, rt: this,
        });
        if (ctx.errors.length) ctx.errors.forEach((e) => this.note('on a screen: ' + e));
        return '<div class="ztree-screen" data-which="' + which + '"' + (deadline ? ' data-deadline="' + deadline + '"' : '') + '>' + html + '</div>';
    }
}

/**
 * The parameter table's cell of subject i in period p; for subjects beyond the treatment's (a
 * session with more participants), the treatment's subjects' cells in turn.
 */
function paramCell(t, p, i) {
    const n = Math.max(1, t.subjects.length);
    return t.params[p * n + (i % n)] || null;
}

/** The box at path ("2", "1.0" in a container) of a stage's active screen. */
function findBox(stage, path) {
    const parts = String(path).split('.').map(Number);
    let list = stage.active;
    let box = null;
    for (const i of parts) {
        box = list[i];
        if (box == null) return null;
        list = box.boxes;
    }
    return box;
}

const plain = (s) => String(s).replace(/^<>/, '').replace(/<[^>]*>/g, '');

/** The variables of each table: built in, set by the treatment's programs, or by inputs. */
function variables(t) {
    const out = {};
    for (const [table, names] of Object.entries(BUILT_IN)) out[table] = new Set(names);
    const add = (code, table) => {
        let assigned;
        try {
            assigned = lang.assignedVariables(program(code), table);
        } catch (err) {
            return;
        }
        for (const [tb, names] of Object.entries(assigned)) {
            out[tb] = out[tb] || new Set();
            names.forEach((n) => out[tb].add(n));
        }
    };
    const visitBox = (box) => {
        const table = ['contractCreation', 'contractList', 'chat'].includes(box.type) ? (box.table || 'contracts') : 'subjects';
        for (const item of box.items) {
            if (item.kind === 'item' && item.input && /^\w+$/.test(item.variable || '')) {
                out[table] = out[table] || new Set();
                out[table].add(item.variable);
            }
        }
        for (const b of box.buttons) b.programs.forEach((pr) => add(pr.code, pr.table || 'subjects'));
        box.programs.forEach((pr) => add(pr.code, pr.table || 'contracts'));
        if (box.type === 'chat' && box.variable) {
            out[box.table || 'contracts'] = out[box.table || 'contracts'] || new Set();
            out[box.table || 'contracts'].add(box.variable);
        }
        box.boxes.forEach(visitBox);
    };
    for (const stage of [t.background, ...t.stages]) {
        stage.programs.forEach((pr) => add(pr.code, pr.table || 'subjects'));
        [...stage.active, ...stage.waiting].forEach(visitBox);
    }
    t.periods.forEach((pp) => add(pp.program || '', 'globals'));
    t.params.forEach((cell) => add(cell.program || '', 'subjects'));
    t.subjects.forEach((role) => add(role.program || '', 'subjects'));
    return out;
}

module.exports = { Run, findBox, variables, program };
