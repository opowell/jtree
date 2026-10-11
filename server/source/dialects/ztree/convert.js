const fs = require('fs-extra');
const path = require('path');
const lang = require('./lang.js');
const { readTreatment } = require('./ztt.js');
const { variables, arrayDeclarations, leavesStage } = require('./runtime.js');
const { parseLayout } = require('./render.js');

/*
 * Converting a z-Tree treatment (.ztt) to a jtree app (plans/ztree-otree-dialects.md, sections
 * 5.7 and 6): a folder with
 * - app.jtt: the treatment's periods, parameter table, and stages, its programs translated from
 *   z-Tree's language to JS, and its screens as jtree screens (Vue templates);
 * - ztree.cjs: what the translated code uses (convert-runtime.js);
 * - CONVERSION.md: what was converted, and what needs work by hand.
 *
 * A stage whose buttons all end it is a form: its inputs in app.fields (or the stage's own
 * stage.fields), its checkers in stage.validate, its button's programs in stage.playerEnd. Other
 * stages are interactive (contract boxes, chat, plots, buttons that do not end the stage, buttons
 * with different programs): each button is in stage.buttons (its inputs, checkers and programs),
 * run as it is pressed (z.press, from the page's ztButton message, participant/ztree-app.js),
 * and the stage goes on. What a screen shows that the page cannot work out (lists' rows, table
 * functions, plots' shapes) is worked out on the server for each subject (z.refresh), in
 * player.zt_, after anything changes.
 *
 * z-Tree's tables become jtree's objects: subjects the period's players (their variables the
 * players' fields), globals period.globals, contracts period.contracts, other tables
 * period.tables, summary app.summary, session participant.session_. A variable is resolved to
 * its table when converting, as the z-Tree dialect resolves it when running (lang.js): the
 * record's table's, else an enclosing record's, else globals'.
 *
 * From the command line:
 *     node server/source/dialects/ztree/convert.js <treatment.ztt> [<output folder>]
 */

const RUNTIME = path.join(__dirname, 'convert-runtime.js');

class Todo extends Error {}

const js = (s) => JSON.stringify(s);
const indent = (text, by) => text.split('\n').map((l) => (l ? by + l : l)).join('\n');

/** Translates z-Tree code (programs, expressions) to JS, with variables resolved by vars. */
class Translator {
    constructor(vars, report, arrays = {}) {
        this.vars = vars;
        this.report = report;
        this.arrays = arrays; // arrays declared for each table: {table: {name: dimensions}}
        this.n = 0;
    }

    /** The table of a record (JS) in ctx, if known. */
    tableOf(ctx, rec) {
        if (rec === 'g') return 'globals';
        for (let d = ctx; d != null; d = d.outer) if (d.rec === rec) return d.table;
        return null;
    }

    /** rec's array name: through z.arr if its table declares it (made when first used), else as it is. */
    arrayRef(ctx, rec, name) {
        const table = this.tableOf(ctx, rec);
        if (table != null && (this.arrays[table] || {})[name] != null) return `z.arr(${rec}, ${js(name)}, ${js(table)}, period)`;
        return this.prop(rec, name);
    }

    /** JS for the records of a table named in code (OLD<table>: the period before's). */
    records(name) {
        const old = /^OLD/.test(name);
        const table = old ? name.slice(3) : name;
        const period = old ? 'z.before(period)' : 'period';
        switch (table) {
            case 'subjects': return { table, code: `z.subjects(${period})` };
            case 'globals': return { table, code: `[z.globals(${period})]` };
            case 'contracts': return { table, code: `z.contracts(${period})` };
            case 'summary': return { table, code: 'z.summary(app)' };
            case 'session': return { table, code: `z.session(${period})` };
            default: return { table, code: `((${period}.tables || {})[${js(table)}] || [])` };
        }
    }

    has(table, name) {
        return this.vars[table] != null && this.vars[table].has(name);
    }

    /** The record (JS) a variable is read from, looking out from ctx. */
    owner(ctx, name, scope, depth = 1) {
        if (scope === 'globals') return 'g';
        let c = ctx;
        if (scope === 'outer') for (let k = 0; k < (depth || 1) && c != null; k++) c = c.outer;
        if (c == null) throw new Todo(':' + name + ' has no enclosing record here');
        for (let d = c; d != null; d = d.outer) {
            if (this.has(d.table, name) || d.iterVar === name) return d.rec;
        }
        if (this.has('globals', name)) return 'g';
        return c.rec;
    }

    /** The record (JS) a variable is set in. */
    target(ctx, t) {
        if (t.scope === 'globals') return 'g';
        if (t.scope === 'outer') return this.owner(ctx, t.name, 'outer', t.depth);
        if (this.has(ctx.table, t.name)) return ctx.rec;
        for (let d = ctx.outer; d != null; d = d.outer) if (this.has(d.table, t.name)) return d.rec;
        if (ctx.table !== 'globals' && this.has('globals', t.name) && !this.has(ctx.table, t.name)) return 'g';
        return ctx.rec;
    }

    prop(rec, name) {
        return /^[A-Za-z_$][\w$]*$/.test(name) ? `${rec}.${name}` : `${rec}[${js(name)}]`;
    }

    expr(node, ctx) {
        switch (node.k) {
            case 'num': return String(node.v);
            case 'str': return js(node.v);
            case 'var': {
                const rec = this.owner(ctx, node.name, node.scope, node.depth);
                return node.index == null ? this.prop(rec, node.name) : `z.at(${this.arrayRef(ctx, rec, node.name)}, ${this.expr(node.index, ctx)})`;
            }
            case 'neg': return `-${this.atom(node.e, ctx)}`;
            case 'not': return `!(${this.expr(node.e, ctx)})`;
            case 'bin': {
                const op = { '&': '&&', '|': '||', '==': '===', '!=': '!==', '^': '**' }[node.op] || node.op;
                return `${this.atom(node.l, ctx)} ${op} ${this.atom(node.r, ctx)}`;
            }
            case 'call': return this.call(node, ctx);
            case 'agg': return this.aggregate(node, ctx);
            default: throw new Todo('cannot translate ' + node.k);
        }
    }

    /** An expression, in parentheses unless it is one thing. */
    atom(node, ctx) {
        const code = this.expr(node, ctx);
        return ['num', 'str', 'var', 'call', 'agg'].includes(node.k) ? code : `(${code})`;
    }

    call(node, ctx) {
        const a = node.args.map((x) => this.expr(x, ctx));
        switch (node.fn) {
            case 'if': return `(${a[0]} ? ${a[1]} : ${a[2]})`;
            case 'not': return `!(${this.expr(node.args[0], ctx)})`;
            case 'abs': case 'exp': case 'sqrt': case 'sin': case 'cos': case 'tan': case 'atan': case 'trunc': case 'sign':
                return `Math.${node.fn}(${a[0]})`;
            case 'ln': return `Math.log(${a[0]})`;
            case 'log': return `Math.log10(${a[0]})`;
            case 'power': return `Math.pow(${a[0]}, ${a[1]})`;
            case 'min': return `Math.min(${a.join(', ')})`;
            case 'max': return `Math.max(${a.join(', ')})`;
            case 'random': case 'randomgenerator': return 'Math.random()';
            case 'round': case 'rounddown': case 'roundup': case 'mod': return `z.${node.fn}(${a.join(', ')})`;
            case 'gettime': return '(Date.now() / 1000)';
            case 'pi': return 'Math.PI';
            case 'rgb': return `z.rgb(${a.join(', ')})`;
            case 'true': return 'true';
            case 'false': return 'false';
            default: throw new Todo('the function ' + node.fn + ' is not translated');
        }
    }

    aggregate(node, ctx) {
        if (node.fn === 'same') {
            return `(${this.atom(node.args[0], ctx)} === ${this.atom(node.args[0], ctx.outer || ctx)})`;
        }
        const { table, code } = node.table == null ? { table: ctx.table, code: this.records(ctx.table).code } : this.records(node.table);
        const r = 'r' + (++this.n);
        const inner = { table, rec: r, outer: ctx };
        let cond = null;
        let value = null;
        if (node.fn === 'count') cond = node.args[0] || null;
        else if (node.args.length >= 2) [cond, value] = node.args;
        else value = node.args[0];
        const c = cond == null ? 'null' : `(${r}) => ${this.expr(cond, inner)}`;
        const v = value == null ? (node.fn === 'find' ? 'null' : '() => 0') : `(${r}) => ${this.expr(value, inner)}`;
        if (!['count', 'sum', 'product', 'average', 'minimum', 'maximum', 'find'].includes(node.fn)) throw new Todo('the table function ' + node.fn + ' is not translated');
        return node.fn === 'count' ? `z.count(${code}, ${c})` : `z.${node.fn}(${code}, ${c}, ${v})`;
    }

    /** Statements, as JS lines. */
    statements(stmts, ctx, code) {
        const out = [];
        for (const s of stmts) {
            try {
                out.push(...this.statement(s, ctx));
            } catch (err) {
                if (!(err instanceof Todo)) throw err;
                const line = code.split('\n')[s.line - 1] || '';
                this.report.push({ status: 'todo', part: ctx.where, note: err.message + ' (line ' + s.line + ': ' + line.trim() + ')' });
                out.push('// TODO (from z-Tree, line ' + s.line + '): ' + err.message + '.', '//   ' + line.trim());
                if (!(err.skip)) out.push(`throw new Error(${js('Not converted from z-Tree: ' + line.trim())});`);
            }
        }
        return out;
    }

    statement(s, ctx) {
        const block = (body, c = ctx) => this.statements(body, c, ctx.code).map((l) => '    ' + l);
        switch (s.k) {
            case 'set': {
                const rec = this.target(ctx, s.target);
                const value = this.expr(s.value, ctx);
                if (s.target.index != null) return [`z.put(${this.arrayRef(ctx, rec, s.target.name)}, ${this.expr(s.target.index, ctx)}, ${value});`];
                return [`${this.prop(rec, s.target.name)} = ${value};`];
            }
            case 'if': {
                const out = [];
                s.branches.forEach((b, i) => {
                    out.push(`${i === 0 ? 'if' : '} else if'} (${this.expr(b.cond, ctx)}) {`, ...block(b.body));
                });
                if (s.otherwise) out.push('} else {', ...block(s.otherwise));
                out.push('}');
                return out;
            }
            case 'while':
                return [`while (${this.expr(s.cond, ctx)}) {`, ...block(s.body), '}'];
            case 'repeat':
                return ['do {', ...block(s.body), `} while (${this.expr(s.cond, ctx)});`];
            case 'array': {
                const d = s.dims.map((x) => this.expr(x, ctx));
                return [`${this.prop(ctx.rec, s.name)} = ${d.length === 1 ? `z.array(1, ${d[0]})` : `z.array(${d.join(', ')})`};`];
            }
            case 'do': {
                const { table, code } = this.records(s.table);
                const r = 'r' + (++this.n);
                return [`for (const ${r} of ${code}) {`, ...block(s.body, { ...ctx, table, rec: r, outer: ctx, iterVar: undefined }), '}'];
            }
            case 'for': {
                // for (i, ...) { }: i set as it goes, a variable of the record (or \\i of globals).
                const a = s.args.map((x) => this.expr(x, ctx));
                const range = a.length === 1 ? `z.range(1, ${a[0]})` : `z.range(${a.join(', ')})`;
                const v = 'v' + (++this.n);
                return [`for (const ${v} of ${range}) {`, `    ${this.prop(this.target(ctx, s.target), s.target.name)} = ${v};`, ...block(s.body), '}'];
            }
            case 'iter': {
                const r = 'r' + (++this.n);
                const a = s.args.map((x) => this.expr(x, ctx));
                const range = a.length === 1 ? `z.range(1, ${a[0]})` : `z.range(${a.join(', ')})`;
                return [`for (const ${r} of ${range}.map((v) => ({ ${s.name}: v }))) {`,
                    ...block(s.body, { ...ctx, table: '__iterator', rec: r, outer: ctx, iterVar: s.name }), '}'];
            }
            case 'new': {
                const r = 'r' + (++this.n);
                return [`{`, `    const ${r} = z.newRecord(period, ${js(s.table)}, VARS[${js(s.table)}] || []);`,
                    ...block(s.body, { ...ctx, table: s.table, rec: r, outer: ctx, iterVar: undefined }), '}'];
            }
            case 'later': {
                // Its delay again after each run, for repeat (evaluated where the statement is).
                const delay = this.expr(s.delay, ctx);
                return [`z.later(period, ${delay}, () => {`, ...block(s.body), ...(s.repeat ? [`    return ${delay};`] : []), `}${s.repeat ? ', true' : ''});`];
            }
            case 'exit':
                return ['return;'];
            default:
                throw new Todo('cannot translate ' + s.k);
        }
    }

    /**
     * A program on its table's records: subjects (the players given, as player), globals (g),
     * the others' records. Lines of JS, in a function that has period, g, app, and players.
     */
    program(p, where, players = 'players') {
        const code = p.code || '';
        let parsed;
        try {
            parsed = lang.parse(code);
        } catch (err) {
            this.report.push({ status: 'todo', part: where, note: 'the program does not parse: ' + err.message });
            return ['// TODO: a program that does not parse: ' + err.message, ...code.split('\n').map((l) => '//   ' + l)];
        }
        const table = p.table || 'subjects';
        const rec = table === 'subjects' ? 'player' : table === 'globals' ? 'g' : 'rec';
        const ctx = { table, rec, outer: null, where, code };
        const cond = p.condition ? (() => {
            try { return this.expr(lang.parseExpr(p.condition), ctx); } catch (err) {
                if (!(err instanceof Todo)) throw err;
                this.report.push({ status: 'todo', part: where, note: 'its condition: ' + err.message });
                return 'false';
            }
        })() : null;
        const body = this.statements(parsed.body, ctx, code);
        const guarded = cond ? [`if (${cond}) {`, ...body.map((l) => '    ' + l), '}'] : body;
        const head = `// ${table}.do { … }${p.condition ? ' (if ' + p.condition + ')' : ''}${p.owner ? ' (owner ' + p.owner + ')' : ''}`;
        if (table === 'globals') return [head, '{', ...guarded.map((l) => '    ' + l), '}'];
        const records = table === 'subjects' ? players : table === 'summary' ? '[z.summary(app)[period.id - 1]]' : this.records(table).code;
        return [head, `for (const ${rec} of ${records}) {`, ...guarded.map((l) => '    ' + l), '}'];
    }

    /**
     * A program run on one record (ctx: its table and the JS of it, and the records around it), or,
     * with records (JS), on each of them: lines of JS.
     */
    programOn(p, where, ctx, records = null) {
        const code = p.code || '';
        let parsed;
        try {
            parsed = lang.parse(code);
        } catch (err) {
            this.report.push({ status: 'todo', part: where, note: 'the program does not parse: ' + err.message });
            return ['// TODO: a program that does not parse: ' + err.message, ...code.split('\n').map((l) => '//   ' + l)];
        }
        const c = { ...ctx, where, code };
        const cond = p.condition ? this.exprOr(p.condition, c, where, 'false') : null;
        const body = this.statements(parsed.body, c, code);
        const guarded = cond ? [`if (${cond}) {`, ...body.map((l) => '    ' + l), '}'] : body;
        const head = `// ${ctx.table}${records ? '.do' : ''} { … }${p.condition ? ' (if ' + p.condition + ')' : ''}`;
        if (records) return [head, `for (const ${ctx.rec} of ${records}) {`, ...guarded.map((l) => '    ' + l), '}'];
        return [head, '{', ...guarded.map((l) => '    ' + l), '}'];
    }

    /** An expression (z-Tree's code) in ctx as JS; if it cannot be, otherwise, and a TODO. */
    exprOr(code, ctx, where, otherwise) {
        try {
            return this.expr(lang.parseExpr(code), { ...ctx, where, code });
        } catch (err) {
            if (!(err instanceof Todo) && !(err instanceof lang.ZtreeSyntaxError)) throw err;
            this.report.push({ status: 'todo', part: where, note: code + ': ' + err.message });
            return otherwise;
        }
    }

    /**
     * A layout as JS, for z.fmt: {step} (a number: "1", "0.01", or a variable's), or {options}
     * (!text: 1 = "yes"; 0 = "no", the values numbers or variables').
     */
    layout(layout, ctx, where) {
        const text = String(layout || '').trim().replace(/^<>/, '').trim();
        const m = /^!(\w+)\s*:(.*)$/s.exec(text);
        if (m == null) {
            if (text === '') return '{ step: 1 }';
            if (/^-?[\d.]+$/.test(text)) return `{ step: ${Number(text)} }`;
            return `{ step: ${this.exprOr(text, ctx, where, '1')} }`;
        }
        const options = [];
        for (const part of m[2].split(';')) {
            const opt = /^([^=]+?)\s*=\s*"([^"]*)"$/s.exec(part.trim());
            if (opt == null) continue;
            const key = /^-?[\d.]+$/.test(opt[1].trim()) ? String(Number(opt[1])) : this.exprOr(opt[1], ctx, where, 'NaN');
            options.push(`[${key}, ${js(opt[2])}]`);
        }
        return `{ options: [${options.join(', ')}] }`;
    }

    /** A text (a checker's message, a label) as a JS string expression: "<>" texts with their <var|layout> values. */
    text(text, ctx, where) {
        const s = String(text == null ? '' : text);
        if (!s.startsWith('<>')) return js(s);
        const parts = [];
        const re = /<([^<>|]*)\|([^<>]*)>/g;
        let last = 0;
        let m;
        while ((m = re.exec(s.slice(2))) != null) {
            parts.push(js(s.slice(2).slice(last, m.index)));
            if (m[1].trim()) parts.push(`z.fmt(${this.exprOr(m[1], ctx, where, "''")}, ${this.layout(m[2], ctx, where)})`);
            last = re.lastIndex;
        }
        parts.push(js(s.slice(2).slice(last)));
        return parts.filter((p) => p !== '""').join(' + ') || '""';
    }

    /** An expression of a subject's (a timeout, an input's minimum), with player and its period in scope. */
    subjectExpr(code, where) {
        try {
            return this.expr(lang.parseExpr(code), { table: 'subjects', rec: 'player', outer: null, where, code });
        } catch (err) {
            if (!(err instanceof Todo)) throw err;
            this.report.push({ status: 'todo', part: where, note: code + ': ' + err.message });
            return '0';
        }
    }
}

// --- Screens --------------------------------------------------------------------------------

const html = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Every box of boxes, with its path ("1", "1.0" in a container): [box, path]. */
function allBoxes(boxes, prefix = '') {
    const out = [];
    boxes.forEach((box, i) => {
        const path = prefix + i;
        out.push([box, path]);
        out.push(...allBoxes(box.boxes || [], path + '.'));
    });
    return out;
}

/**
 * Whether a stage is interactive: its buttons send messages, run their programs and the stage
 * goes on (contract boxes, chat; a button that does not leave; buttons with different programs).
 * Otherwise its screen is a form, sent by its button, which ends the stage.
 */
function isInteractive(stage) {
    const boxes = allBoxes(stage.active).map(([b]) => b);
    if (boxes.some((b) => ['contractCreation', 'chat', 'plot'].includes(b.type) || (b.type === 'contractList' && b.buttons.length))) return true;
    const buttons = boxes.flatMap((b) => b.buttons.map((button) => ({ box: b, button })));
    if (buttons.some(({ box, button }) => !leavesStage(button, box, stage))) return true;
    return buttons.filter(({ button }) => button.programs.length).length > 1;
}

/**
 * A stage's screens as Vue templates (on the participant's page, where player, period and app
 * are the participant's), and what they need from the server: the values the page cannot work
 * out (table functions, layouts that are variables), lists' rows, boxes' display conditions,
 * and, for an interactive stage, its buttons. z-Tree's placement of boxes is not kept: they
 * follow one another.
 */
class Screens {
    constructor(t, vars, tr, report) {
        this.t = t;
        this.vars = vars;
        this.tr = tr;
        this.report = report;
    }

    /** What a stage's screens collect: s. */
    start(stageId, where, interactive, active, zstage = {}) {
        // The inputs of the boxes without buttons: sent with a standard box's button.
        const loose = allBoxes(active).filter(([b]) => ['standard', 'grid'].includes(b.type) && b.buttons.length === 0)
            .flatMap(([b, path]) => b.items.filter((i) => i.kind === 'item' && i.input && /^\w+$/.test(i.variable || '')).map((item) => ({ item, path })));
        return {
            stageId, where, interactive, loose, n: 0, zstage,
            subject: { table: 'subjects', rec: 'player', outer: null },
            form: { inputs: [], buttons: [] },
            values: [], shows: [], lists: [], buttons: [], chats: [], plots: [],
        };
    }

    /** A screen's boxes (the header first, if the stage shows it). */
    screen(boxes, s, { header = null, prefix = '' } = {}) {
        let out = header ? this.box(header, 'h', s) : '';
        boxes.forEach((b, i) => { out += this.box(b, prefix + i, s); });
        return out;
    }

    /** A value only the server can work out (JS of player, period, g): put in player.zt_.v. */
    serverValue(s, code) {
        const key = 'v' + (++s.n);
        s.values.push(`${key}: (player, period, g) => ${code},`);
        return `{{ player.zt_ && player.zt_.v.${key} }}`;
    }

    /** A subject's expression on the participant's page: player.X, period.globals.X; else null. */
    vue(code) {
        const vars = this.vars;
        let node;
        try {
            node = lang.parseExpr(code);
        } catch (err) {
            return null;
        }
        const go = (n) => {
            switch (n.k) {
                case 'num': return String(n.v);
                case 'str': return js(n.v).replace(/"/g, "'");
                case 'var':
                    if (n.index != null || n.scope === 'outer') return null;
                    if (n.scope === 'globals' || (!vars.subjects.has(n.name) && vars.globals.has(n.name))) return `period.globals.${n.name}`;
                    return `player.${n.name}`;
                case 'neg': { const e = go(n.e); return e == null ? null : `-(${e})`; }
                case 'not': { const e = go(n.e); return e == null ? null : `!(${e})`; }
                case 'bin': {
                    const l = go(n.l); const r = go(n.r);
                    if (l == null || r == null) return null;
                    const op = { '&': '&&', '|': '||', '==': '==', '!=': '!=', '^': '**' }[n.op] || n.op;
                    return `(${l} ${op} ${r})`;
                }
                case 'call':
                    if (n.fn === 'if') { const a = n.args.map(go); return a.includes(null) ? null : `(${a[0]} ? ${a[1]} : ${a[2]})`; }
                    if (['abs', 'sqrt', 'exp', 'min', 'max'].includes(n.fn)) { const a = n.args.map(go); return a.includes(null) ? null : `Math.${n.fn}(${a.join(', ')})`; }
                    return null;
                default: return null;
            }
        };
        return go(node);
    }

    /** A value shown with a layout ("1", "0.01", !text: ...): on the page if it can be, else from the server. */
    shown(code, layout, s, where) {
        const v = this.vue(code);
        const plain = /^\s*(-?[\d.]+)?\s*$/.test(String(layout || ''));
        if (v != null && plain) {
            const step = String(layout || '').trim() === '' ? 1 : Number(layout);
            const d = Math.max(0, -Math.floor(Math.log10(step > 0 ? step : 1) + 1e-9));
            return `{{ ${v} | round(${d}) }}`;
        }
        const ctx = s.subject;
        return this.serverValue(s, `z.fmt(${this.tr.exprOr(code, ctx, where, "''")}, ${this.tr.layout(layout, ctx, where)})`);
    }

    /** A label: its text, z-Tree's <var|layout> as values. */
    label(text, s, where) {
        let str = String(text || '');
        if (str.startsWith('{\\rtf')) str = str.replace(/\\par[d]?/g, '\n').replace(/\{\\\*[^}]*\}/g, '').replace(/\\[a-z]+-?\d* ?/g, '').replace(/[{}]/g, '').trim();
        if (!str.startsWith('<>')) return html(str).replace(/\n/g, '<br>');
        str = str.slice(2);
        let out = '';
        let last = 0;
        const re = /<([^<>|]*)\|([^<>]*)>/g;
        let m;
        while ((m = re.exec(str)) != null) {
            out += html(str.slice(last, m.index));
            out += m[1].trim() ? this.shown(m[1], m[2], s, where) : '';
            last = re.lastIndex;
        }
        return out + html(str.slice(last)).replace(/\n/g, '<br>');
    }

    /** An item: text, a value, or an input (named player.X in a form, X otherwise); bare: without its label (a grid's cell). */
    item(item, s, where, inputs, bare = false) {
        if (item.kind !== 'item') return '';
        const label = this.label(item.label, s, where);
        if (!item.variable) return bare ? label : `    <p class="zt-text">${label}</p>\n`;
        if (!item.input) {
            const value = this.shown(item.variable, item.layout, s, where);
            return bare ? value : `    <p class="zt-item"><span class="zt-label">${label}</span> <span class="zt-value">${value}</span></p>\n`;
        }
        if (!/^\w+$/.test(item.variable)) {
            this.report.push({ status: 'todo', part: where, note: 'an input into ' + item.variable + ' (not a variable)' });
            return '';
        }
        if (inputs) inputs.push(item);
        const name = s.interactive ? item.variable : 'player.' + item.variable;
        const l = parseLayout(item.layout, { rt: null });
        let control;
        if (l.kind === 'radio' || l.kind === 'text' || l.kind === 'button') {
            control = l.options.map(([v, t]) => `<label class="zt-choice"><input type="radio" name="${name}" value="${v}"> ${html(t)}</label>`).join(' ');
        } else if (l.kind === 'radioline' && l.options.length >= 2) {
            const [lo, hi] = [l.options[0], l.options[l.options.length - 1]];
            const n = l.count || 2;
            const values = Array.from({ length: n }, (_, k) => lo[0] + (hi[0] - lo[0]) * k / (n - 1));
            control = `${html(lo[1])} ${values.map((v) => `<input type="radio" name="${name}" value="${v}">`).join(' ')} ${html(hi[1])}`;
        } else if (l.kind === 'checkbox') {
            const [v, t] = l.options[0] || [1, ''];
            control = `<label class="zt-choice"><input type="checkbox" name="${name}" value="${v}"> ${html(t)}</label>`;
        } else if (l.kind === 'slider' || l.kind === 'scrollbar') {
            control = `<input type="range" name="${name}" min="${l.options[0] ? l.options[0][0] : 0}" max="${l.options[1] ? l.options[1][0] : 100}">`;
        } else if (s.interactive) {
            control = `<input type="text" inputmode="decimal" autocomplete="off" name="${name}">`;
        } else {
            control = `<input type="number" name="${name}" step="${l.step}">`;
        }
        return bare ? control : `    <p class="zt-item"><span class="zt-label">${label}</span> <span class="zt-input">${control}</span></p>\n`;
    }

    /** A box's buttons: in a form, they send it; else each is one of the stage's buttons (stage.buttons). */
    buttons(box, path, s, where, inputs) {
        if (box.buttons.length === 0) return '';
        if (!s.interactive) {
            s.form.buttons.push(...box.buttons.map((b) => ({ ...b, box })));
            return '    <p class="zt-buttons">' + box.buttons.map((b) => `<button>${html(b.name)}</button>`).join(' ') + '</p>\n';
        }
        box.buttons.forEach((button, i) => s.buttons.push(this.button(box, path, button, i, s, where, inputs)));
        return '    <p class="zt-buttons">' + box.buttons.map((b, i) => `<button type="button" class="zt-button" data-zt-button="${i}">${html(b.name)}</button>`).join(' ') + '</p>\n';
    }

    /**
     * One of an interactive stage's buttons, as JS: what it is pressed on (the subject, a new
     * record, or the chosen row of a list), its inputs, its checkers, its programs, whether it
     * leaves the stage. Its functions have player, rec (the record), period and g (globals).
     */
    button(box, path, button, i, s, where, inputs) {
        const w = where + ', button ' + button.name;
        const tr = this.tr;
        const kind = box.type === 'contractCreation' ? 'new' : box.type === 'contractList' ? 'list' : 'subject';
        const table = kind === 'subject' ? 'subjects' : (box.table || 'contracts');
        const ctx = kind === 'subject' ? s.subject : { table, rec: 'rec', outer: s.subject };
        const leaves = leavesStage(button, box, s.zstage);
        const fn = (body) => `(player, rec, period, g) => ${body}`;
        const lines = [`// Box ${js(box.name || box.type)}, button ${js(button.name)}: ` +
            { new: `a new ${table} record`, list: `the chosen ${table} record`, subject: 'the subject' }[kind] + (leaves ? '; it ends the stage.' : '.')];
        lines.push(`${js('b' + path + '/' + i)}: {`);
        lines.push(`    kind: ${js(kind)}, table: ${js(table)}, vars: VARS[${js(table)}] || [], leaves: ${leaves},`);
        // Inputs: the box's; a standard box's button also sends those of the boxes without buttons.
        const all = (inputs || []).map((item) => ({ item, path: null }));
        if (kind === 'subject') all.push(...s.loose.filter((x) => x.path !== path));
        lines.push('    inputs: [');
        for (const { item, path: from } of all) {
            const l = parseLayout(item.layout, { rt: null });
            const literal = (code) => /^-?[\d.]+$/.test(String(code).trim());
            const bound = (code) => (literal(code) ? `() => ${Number(code)}` : fn(tr.exprOr(code, ctx, w, '0')));
            const stepText = String(item.layout || '').trim();
            const step = l.kind !== 'number' ? 'null' : stepText === '' ? '1' : literal(stepText) ? String(Number(stepText)) : fn(tr.exprOr(stepText, ctx, w, '1'));
            const parts = [`name: ${js(item.variable)}`, `label: ${js(String(item.label || item.variable).replace(/^<>/, '').replace(/<[^>]*>/g, ''))}`];
            if (from != null) parts.push(`box: ${js('b' + from)}`);
            if (item.min) parts.push(`min: ${bound(item.min)}`);
            if (item.max) parts.push(`max: ${bound(item.max)}`);
            parts.push(`step: ${step}`, `numeric: ${l.kind === 'number'}`);
            if (l.kind === 'checkbox') parts.push('checkbox: true');
            lines.push(`        { ${parts.join(', ')} },`);
        }
        lines.push('    ],');
        // Checkers: the box's, then the button's.
        const checkers = [...box.items.filter((x) => x.kind === 'checker'), ...button.checkers];
        if (checkers.length) {
            lines.push('    check(player, rec, period, g) {');
            for (const c of checkers) lines.push(`        if (!(${tr.exprOr(c.condition, ctx, w, 'true')})) return ${tr.text(c.message || 'Not allowed.', ctx, w)};`);
            lines.push('        return null;', '    },');
        }
        // Programs: on the box's record for its table, the subject's, the globals', or each of another table's.
        if (button.programs.length) {
            lines.push('    run(player, rec, period, g) {');
            for (const p of button.programs) {
                const pt = p.table || 'subjects';
                let code;
                if (pt === table && kind !== 'subject') code = tr.programOn(p, w, ctx);
                else if (pt === 'subjects') code = tr.programOn(p, w, s.subject);
                else if (pt === 'globals') code = tr.programOn(p, w, { table: 'globals', rec: 'g', outer: s.subject });
                else {
                    const r = 'r' + (++tr.n);
                    code = tr.programOn(p, w, { table: pt, rec: r, outer: s.subject }, tr.records(pt).code);
                }
                lines.push(...code.map((l) => '        ' + l));
            }
            lines.push('    },');
        }
        lines.push('},');
        this.report.push({ status: 'converted', part: w, note: { new: 'makes a ' + table + ' record', list: 'on the chosen ' + table + ' record', subject: 'on the subject' }[kind] });
        return lines.join('\n');
    }

    /** A contract list: its table's records that meet its condition, sorted, worked out on the server (stage.lists). */
    list(box, path, s, where) {
        const tr = this.tr;
        const table = box.table || 'contracts';
        const ctx = { table, rec: 'rec', outer: s.subject };
        const items = box.items.filter((x) => x.kind === 'item');
        const cond = box.tableCondition ? tr.exprOr(box.tableCondition, ctx, where, 'false') : null;
        const keys = String(box.sorting || '').split(';').map((k) => k.trim()).filter(Boolean)
            .map((k) => `[(rec) => ${tr.exprOr(k.replace(/^[-+]\s*/, ''), ctx, where, '0')}, ${k.startsWith('-')}]`);
        const key = 'b' + path;
        const lines = [`// Box ${js(box.name || box.type)}: the ${table} records${box.tableCondition ? ' where ' + box.tableCondition.trim() : ''}${box.sorting ? ', by ' + box.sorting.trim() : ''}.`,
            `${js(key)}: {`,
            `    rows: (player, period, g) => z.sort(z.table(period, ${js(table)})${cond ? `.filter((rec) => ${cond})` : ''}, [${keys.join(', ')}]),`,
            `    cells: (rec, player, period, g) => [${items.map((it) => (it.variable ? `z.fmt(${tr.exprOr(it.variable, ctx, where, "''")}, ${tr.layout(it.layout, ctx, where)})` : js(''))).join(', ')}],`];
        if (box.owner) lines.push(`    own: (rec, player) => rec.${box.owner.trim()} === player.Subject,`);
        lines.push('},');
        s.lists.push(lines.join('\n'));
        if (items.some((it) => it.input)) this.report.push({ status: 'todo', part: where, note: 'inputs in a contract list\'s rows are not converted' });
        const choose = box.buttons.length > 0;
        let out = `<table class="zt-list">\n    <thead><tr>${choose ? '<th></th>' : ''}${items.map((it) => `<th>${this.label(it.label, s, where)}</th>`).join('')}</tr></thead>\n`;
        out += `    <tbody><tr v-for="row in (player.zt_ ? player.zt_.lists['${key}'] : [])" :key="row.id" :class="{ 'zt-own': row.own }">` +
            (choose ? `<td><input type="radio" name="zt-row-${key}" :value="row.id"></td>` : '') +
            '<td v-for="(cell, k) in row.cells" :key="k">{{ cell }}</td></tr></tbody>\n</table>\n';
        return out;
    }

    /**
     * A chat box: its table's entries that meet its condition, each in its format (worked out on
     * the server, as a list's rows), and an input for a new entry (stage.chats: the entry's
     * table and variable, and the box's programs, run on it).
     */
    chat(box, path, s, where) {
        const tr = this.tr;
        const table = box.table || 'contracts';
        const ctx = { table, rec: 'rec', outer: s.subject };
        const key = 'b' + path;
        let out = '';
        if (box.outputs && box.outputs.length) {
            let cond = box.condition2 && box.condition2.trim() ? tr.exprOr(box.condition2, ctx, where, 'false') : null;
            if (cond === '1' || cond === 'true') cond = null;
            // <|-1>: the entry's text.
            const format = box.outputs[0].replace(/<\|-1>/g, '<' + (box.variable || 'Text') + '|-1>');
            s.lists.push([`// Box ${js(box.name || box.type)}: the chat's entries${box.condition2 ? ' where ' + box.condition2.trim() : ''}.`,
                `${js(key)}: {`,
                `    rows: (player, period, g) => z.table(period, ${js(table)})${cond ? `.filter((rec) => ${cond})` : ''},`,
                `    cells: (rec, player, period, g) => [${tr.text(format.startsWith('<>') ? format : '<>' + format, ctx, where)}],`,
                '},'].join('\n'));
            out += `<div class="zt-chat-log"><div v-for="row in (player.zt_ ? player.zt_.lists['${key}'] : [])" :key="row.id" class="zt-chat-line">{{ row.cells[0] }}</div></div>\n`;
        }
        if (box.variable) {
            const run = box.programs.flatMap((p) => tr.programOn(p, where, (p.table || table) === table ? ctx : { table: p.table, rec: 'g', outer: s.subject }));
            s.chats.push([`// Box ${js(box.name || box.type)}: an entry is a new ${table} record, its text in ${box.variable}.`,
                `${js(key)}: {`,
                `    table: ${js(table)}, variable: ${js(box.variable)}, vars: VARS[${js(table)}] || [],`,
                ...(run.length ? ['    run(player, rec, period, g) {', ...run.map((l) => '        ' + l), '    },'] : []),
                '},'].join('\n'));
            out += '<input type="text" class="zt-chat-input" autocomplete="off">\n';
        }
        this.report.push({ status: 'converted', part: where, note: 'chat box' });
        return out;
    }

    /** A history box: the subject's records of the periods before, a row each (worked out on the server, as a list's rows). */
    history(box, path, s, where) {
        const tr = this.tr;
        const ctx = { table: 'subjects', rec: 'rec', outer: null };
        const items = box.items.filter((x) => x.kind === 'item');
        const key = 'b' + path;
        s.lists.push([`// Box ${js(box.name || box.type)}: the subject's records of the periods before.`,
            `${js(key)}: {`,
            '    rows: (player, period, g) => z.history(player),',
            `    cells: (rec, player, period, g) => [${items.map((it) => (it.variable ? `z.fmt(${tr.exprOr(it.variable, ctx, where, "''")}, ${tr.layout(it.layout, ctx, where)})` : js(''))).join(', ')}],`,
            '},'].join('\n'));
        this.report.push({ status: 'converted', part: where, note: 'history box' });
        return `<table class="zt-list">\n    <thead><tr>${items.map((it) => `<th>${this.label(it.label, s, where)}</th>`).join('')}</tr></thead>\n` +
            `    <tbody><tr v-for="row in (player.zt_ ? player.zt_.lists['${key}'] : [])" :key="row.id"><td v-for="(cell, k) in row.cells" :key="k">{{ cell }}</td></tr></tbody>\n</table>\n`;
    }

    /** A grid box: its items in columns of equal length (the first holds the rows' labels), as z-Leaf shows it. */
    grid(box, s, where, inputs) {
        const items = box.items.filter((it) => it.kind === 'item');
        let rowsPerColumn = items.length;
        for (let r = 2; r < items.length; r++) {
            if (items.length % r === 0 && items.slice(0, r).every((it) => !it.variable) && !items[r].variable && items[r + 1] && items[r + 1].variable) {
                rowsPerColumn = r;
                break;
            }
        }
        const columns = [];
        for (let i = 0; i < items.length; i += rowsPerColumn) columns.push(items.slice(i, i + rowsPerColumn));
        let out = '<table class="zt-grid">\n';
        for (let r = 0; r < rowsPerColumn; r++) {
            out += '    <tr>' + columns.map((col) => `<td>${col[r] ? this.item(col[r], s, where, inputs, true) : ''}</td>`).join('') + '</tr>\n';
        }
        this.report.push({ status: 'converted', part: where, note: 'grid box' });
        return out + '</table>\n';
    }

    /**
     * A plot box (stage.plots): draw, its items as shapes in the plot's coordinates for the
     * subject (graphs' items for each of their table's records), as the z-Tree dialect draws
     * them; and inputs, what each plot input does (by its place in the box: "1", "2.0", "2:0"
     * the first input of item 2), given the records it was drawn for (innermost first).
     */
    plot(box, path, s, where) {
        const tr = this.tr;
        const key = 'b' + path;
        const has = (code) => code != null && String(code).trim() !== '';
        // A number (fallback if not given), a colour (null if not given), in ctx.
        const num = (code, ctx, fallback = 0) => (!has(code) ? String(fallback)
            : /^-?[\d.]+$/.test(String(code).trim()) ? String(Number(code)) : `z.num(${tr.exprOr(code, ctx, where, String(fallback))})`);
        const color = (code, ctx) => (!has(code) ? 'null' : `z.color(${tr.exprOr(code, ctx, where, 'null')})`);
        const cond = (code, ctx) => (has(code) ? tr.exprOr(code, ctx, where, 'false') : null);
        const draw = [];
        const inputs = [];
        // The records a level is drawn for, as JS: [{table, id}], innermost first.
        const recsOf = (chain) => '[' + chain.slice().reverse().map((c) => `{ table: ${js(c.table)}, id: z.idOf(${c.rec}) }`).join(', ') + ']';
        const idOf = (id, chain) => `${js(id + '@')} + z.ids(${recsOf(chain)})`;

        /** What an input does, as JS (in inputs): chain is the graphs' records around it. */
        const handler = (inp, id, chain) => {
            const inner = chain.length ? chain[chain.length - 1] : s.subject;
            const table = inp.table || 'subjects';
            const target = inp.action === 0 ? (table === 'subjects' ? s.subject : { table, rec: 'rec', outer: inner })
                : (chain.slice().reverse().find((c) => c.table === table) || inner);
            const unpack = chain.length ? [`const [${chain.slice().reverse().map((c) => c.rec).join(', ')}] = recs;`] : [];
            const vars = {};
            for (const [k, v] of [['x', inp.xVar], ['y', inp.yVar], ['x0', inp.x0Var], ['y0', inp.y0Var], ['x1', inp.x1Var], ['y1', inp.y1Var]]) if (/^\w+$/.test(v || '')) vars[k] = v;
            const lines = [`${js(id)}: {`, `    action: ${inp.action || 0}, table: ${js(table)}, tableVars: VARS[${js(table)}] || [], vars: ${JSON.stringify(vars).replace(/"(\w+)":/g, '$1: ')},`];
            const c = cond(inp.condition, inner);
            if (c) lines.push(`    ok(player, period, g, recs) {`, ...unpack.map((l) => '        ' + l), `        return ${c};`, '    },');
            lines.push('    run(player, rec, period, g, recs, coords) {', ...unpack.map((l) => '        ' + l), `        Object.assign(${target.rec}, coords);`);
            for (const p of inp.programs || []) {
                const pt = p.table || 'subjects';
                let pc = pt === target.table ? target : chain.slice().reverse().find((x) => x.table === pt);
                if (pc == null) {
                    if (pt === 'subjects') pc = s.subject;
                    else if (pt === 'globals') pc = { table: 'globals', rec: 'g', outer: inner };
                    else {
                        this.report.push({ status: 'todo', part: where, note: 'a plot input\'s program on ' + pt + ', which it is not drawn for' });
                        continue;
                    }
                }
                // A drag's start and end are the program's record's too (its programs read them there).
                if (inp.action === 2 && pc !== target) lines.push(`        Object.assign(${pc.rec}, coords);`);
                lines.push(...tr.programOn(p, where + ', plot input', pc).map((l) => '        ' + l));
            }
            lines.push('    },', '},');
            inputs.push(lines.join('\n'));
        };

        /** Lines drawing items at a level: ctx their record's, chain the graphs' records, collected the JS array of the level's inputs. */
        const visit = (items, prefix, ctx, chain, collected, ind) => {
            const out = [];
            const at = (l) => out.push(ind + l);
            items.forEach((item, i) => {
                const id = prefix + i;
                if (item.kind === 'graph') {
                    const q = 'q' + (chain.length + 1);
                    const t = item.table || 'globals';
                    const inner = { table: t, rec: q, outer: ctx };
                    const gc = cond(item.graphCondition, inner);
                    const level = 'level' + (chain.length + 1);
                    const joined = 'joined' + (chain.length + 1);
                    at(`// A graph: its items for each ${t} record${has(item.graphCondition) ? ' where ' + item.graphCondition.trim() : ''}.`);
                    at('{');
                    at(`    const ${joined} = [];`);
                    at(`    for (const ${q} of ${tr.records(t).code}${gc && gc !== '1' ? `.filter((${q}) => ${gc})` : ''}) {`);
                    at(`        const ${level} = [];`);
                    at('        const before = plot.shapes.length;');
                    out.push(...visit(item.items || [], id + '.', inner, [...chain, inner], level, ind + '        '));
                    at(`        plot.shapes.slice(before).forEach((sh) => sh.inputs && sh.inputs.push(...${level}));`);
                    at(`        plot.shapes.slice(before).filter((sh) => sh.kind === 'point').forEach((sh) => ${joined}.push([sh.x, sh.y]));`);
                    at('    }');
                    at(`    plot.joined(${joined}, ${color(item.lineColor, ctx)}, ${num(item.lineWidth, ctx, 1)});`);
                    at('}');
                    return;
                }
                if (item.kind === 'input') {
                    // In a graph: its record's items take it; in the box: a click anywhere.
                    handler(item, id, chain);
                    const c = cond(item.condition, ctx);
                    at(`${c ? `if (${c}) ` : ''}${collected}.push(plot.input(${idOf(id, chain)}, ${item.action || 0}));`);
                    return;
                }
                const c = cond(item.condition, ctx);
                const props = [`kind: ${js(item.kind)}`, 'inputs: []'];
                const p = (k, v) => props.push(`${k}: ${v}`);
                switch (item.kind) {
                    case 'point':
                        p('x', num(item.x, ctx)); p('y', num(item.y, ctx)); p('size', num(item.size, ctx, 5)); p('corners', num(item.corners, ctx, 4));
                        p('rotation', num(item.rotation, ctx)); p('spokes', !!item.spokes); p('color', color(item.lineColor, ctx)); p('width', num(item.lineWidth, ctx, 1));
                        p('fill', color(item.fillColor, ctx));
                        break;
                    case 'line':
                        p('x1', num(item.x1, ctx)); p('y1', num(item.y1, ctx)); p('x2', num(item.x2, ctx)); p('y2', num(item.y2, ctx));
                        // An arrow's start: none if not given (0, given: a bar).
                        p('arrowStart', has(item.arrowStart) ? num(item.arrowStart, ctx) : 'null'); p('arrowWidth', num(item.arrowWidth, ctx)); p('arrowEnd', has(item.arrowEnd) ? num(item.arrowEnd, ctx) : 'null');
                        p('arrowFilled', !!item.arrowFilled); p('color', `${color(item.lineColor, ctx)} || 'rgb(0,0,0)'`); p('width', num(item.lineWidth, ctx, 1));
                        break;
                    case 'rect': {
                        // Each axis from its two edges, an edge and the size, or the centre and the size.
                        const axis = (lo, hi, center, size) => {
                            if (has(lo) && has(hi)) return `[${num(lo, ctx)}, ${num(hi, ctx)}]`;
                            if (has(lo)) return `z.span(${num(lo, ctx)}, ${num(size, ctx)}, 0)`;
                            if (has(hi)) return `z.span(${num(hi, ctx)}, ${num(size, ctx)}, 1)`;
                            return `z.span(${num(center, ctx)}, ${num(size, ctx)}, 0.5)`;
                        };
                        props.push(`...z.rect(${axis(item.xLeft, item.xRight, item.xCenter, item.width)}, ${axis(item.yBottom, item.yTop, item.yCenter, item.height)})`);
                        p('color', color(item.lineColor, ctx)); p('width', num(item.lineWidth, ctx, 1)); p('fill', color(item.fillColor, ctx));
                        break;
                    }
                    case 'pie':
                        p('x', num(item.x, ctx)); p('y', num(item.y, ctx)); p('rx', num(item.rx, ctx, 1)); p('ry', num(item.ry, ctx, 1));
                        p('a1', num(item.angleStart, ctx)); p('a2', num(item.angleEnd, ctx, 360)); p('color', color(item.lineColor, ctx)); p('width', num(item.lineWidth, ctx, 1));
                        p('fill', color(item.fillColor, ctx));
                        break;
                    case 'text':
                        p('x', num(item.x, ctx)); p('y', num(item.y, ctx)); p('text', tr.text(item.text, ctx, where));
                        p('hAlign', JSON.stringify(item.hAlign)); p('vAlign', JSON.stringify(item.vAlign)); p('color', `${color(item.color, ctx)} || 'rgb(0,0,0)'`); p('size', num(item.fontSize, ctx, 12));
                        break;
                    case 'axis':
                        p('horizontal', !!item.horizontal); p('position', num(item.position, ctx)); p('from', num(item.from, ctx)); p('to', num(item.to, ctx, 1));
                        p('tick', num(item.tickStep, ctx)); p('label', num(item.labelStep, ctx)); p('caption', js(item.caption || ''));
                        p('color', `${color(item.lineColor, ctx)} || 'rgb(0,0,0)'`); p('width', num(item.lineWidth, ctx, 1));
                        p('layout', tr.layout(item.labelLayout || '1', ctx, where));
                        break;
                    default:
                        this.report.push({ status: 'todo', part: where, note: 'a plot item of kind ' + item.kind });
                        return;
                }
                at(`${c ? `if (${c}) ` : ''}{`);
                at(`    const shape = plot.add({ ${props.join(', ')} }, ${recsOf(chain)});`);
                (item.inputs || []).forEach((inp, k) => {
                    handler(inp, id + ':' + k, chain);
                    const ic = cond(inp.condition, ctx);
                    at(`    ${ic ? `if (${ic}) ` : ''}shape.inputs.push(plot.input(${idOf(id + ':' + k, chain)}, ${inp.action || 0}));`);
                });
                at('}');
            });
            return out;
        };

        const r = box.range || {};
        draw.push(`plot.range(${num(r.xLeft, s.subject)}, ${num(r.xRight, s.subject, 100)}, ${num(r.yBottom, s.subject)}, ${num(r.yTop, s.subject, 100)}, ${box.keepAspect === true});`);
        draw.push(...visit(box.plotItems || [], '', s.subject, [], 'plot.boxInputs', ''));
        s.plots.push([`// Box ${js(box.name || box.type)}.`, `${js(key)}: {`,
            '    draw(plot, player, period, g) {', ...draw.map((l) => '        ' + l), '    },',
            '    inputs: {', ...inputs.join('\n').split('\n').filter(Boolean).map((l) => '        ' + l), '    },',
            '},'].join('\n'));
        this.report.push({ status: 'converted', part: where, note: 'plot box' });
        return `<div class="ztree-plot" data-box="${key}" :data-plot="player.zt_ && player.zt_.plots['${key}']"></div>\n`;
    }

    /** A box: its display condition (if any), then its items, rows, inputs and buttons. */
    box(box, path, s) {
        const where = s.where + ', box ' + (box.name || box.type);
        const key = 'b' + path;
        let cond = '';
        if (box.condition && box.condition.trim()) {
            const v = this.vue(box.condition);
            if (v != null) cond = ` v-if="${html(v)}"`;
            else {
                s.shows.push(`${js(key)}: (player, period, g) => ${this.tr.exprOr(box.condition, s.subject, where, 'true')},`);
                cond = ` v-if="!player.zt_ || player.zt_.show['${key}']"`;
            }
        }
        const open = (cls, extra = '') => `<div class="zt-box ${cls}" data-zt-box="${key}"${extra}${cond}>\n`;
        switch (box.type) {
            case 'container':
                return open('zt-container') + this.screen(box.boxes, s, { prefix: path + '.' }) + '</div>\n';
            case 'header':
                return `<div class="zt-header"${cond}>Period {{ period.id }} of ${Math.max(1, this.t.periods.length)}` +
                    ' <span v-if="hasTimeoutClient">Remaining time [sec]: {{ Math.ceil(timeLeftClient / 1000) }}</span></div>\n';
            case 'help':
                return `<div class="zt-help"${cond}><b>${html(box.title)}</b><br>${html(box.text).replace(/\n/g, '<br>')}</div>\n`;
            case 'standard':
            case 'contractCreation': {
                const inputs = [];
                const loose = s.interactive && box.buttons.length === 0 && box.items.some((i) => i.kind === 'item' && i.input);
                let out = open(box.type === 'standard' ? 'zt-standard' : 'zt-creation', loose ? ' data-zt-loose' : '');
                for (const item of box.items) out += this.item(item, s, where, inputs);
                if (!s.interactive) s.form.inputs.push(...inputs);
                out += this.buttons(box, path, s, where, inputs);
                return out + '</div>\n';
            }
            case 'contractList':
                return open('zt-list-box') + this.list(box, path, s, where) + this.buttons(box, path, s, where, []) + '</div>\n';
            case 'chat':
                return open('zt-chat') + this.chat(box, path, s, where) + '</div>\n';
            case 'history':
                return open('zt-history') + this.history(box, path, s, where) + '</div>\n';
            case 'grid': {
                const inputs = [];
                const loose = s.interactive && box.buttons.length === 0 && box.items.some((i) => i.kind === 'item' && i.input);
                let out = open('zt-grid-box', loose ? ' data-zt-loose' : '') + this.grid(box, s, where, inputs);
                if (!s.interactive) s.form.inputs.push(...inputs);
                out += this.buttons(box, path, s, where, inputs);
                return out + '</div>\n';
            }
            case 'plot':
                return open('zt-plot') + this.plot(box, path, s, where) + this.buttons(box, path, s, where, []) + '</div>\n';
            case 'calculator':
                // As in the z-Tree dialect: an empty box (z-Leaf's calculator is not offered).
                this.report.push({ status: 'converted', part: where, note: 'an empty box: z-Leaf\'s calculator is not offered' });
                return open('zt-calculator') + '</div>\n';
            default:
                this.report.push({ status: 'todo', part: where, note: 'a ' + box.type + ' box is not converted (it runs in the z-Tree dialect)' });
                return `<!-- TODO: the ${html(box.type)} box ${html(box.name)} -->\n`;
        }
    }
}

// --- The app ----------------------------------------------------------------------------------

/** app.jtt for treatment t, and the report: [{status, part, note}]. */
function convertTreatment(t, name) {
    const report = [];
    const vars = variables(t);
    const arrays = arrayDeclarations(t);
    const tr = new Translator(vars, report, arrays);
    const screens = new Screens(t, vars, tr, report);
    let interactiveStages = 0;
    // The inputs of each stage's form, by stage: in app.fields, unless another stage's differ (then in stage.fields).
    const stageFields = {};
    const out = [];
    const w = (s = '') => out.push(s);
    const numSubjects = Math.max(1, t.subjects.length);

    w(`// ${name}: converted by jtree from the z-Tree treatment ${name}.ztt (see CONVERSION.md).`);
    w('// z-Tree\'s tables are jtree\'s: subjects the players, globals period.globals, contracts');
    w('// period.contracts, summary app.summary; Profit is points.');
    w();
    w("const z = require(path.join(path.dirname(app.appPath), 'ztree.cjs'));");
    w();
    w(`app.title = ${js(name)};`);
    w(`app.numPeriods = ${Math.max(1, t.periods.length)};`);
    w(`app.suggestedNumParticipants = ${numSubjects};`);
    w();
    w('// The tables\' variables, set to 0 in new records.');
    w('const VARS = {');
    for (const [table, names] of Object.entries(vars)) w(`    ${table}: ${js([...names])},`);
    w('};');
    w();

    // Tables' arrays, tables that last, new records' programs.
    const declared = Object.entries(arrays).filter(([, names]) => Object.keys(names).length);
    if (declared.length) {
        w('// Arrays declared for each table (array X[n]; in any of its programs, even one that does not run):');
        w('// made in a record when it first uses them.');
        w('app.ztArrays = {');
        for (const [table, names] of declared) {
            w(`    ${js(table)}: {`);
            for (const [name, dims] of Object.entries(names)) {
                const ctx = { table, rec: 'rec', outer: null, where: 'Arrays', code: '' };
                const d = dims.map((x) => { try { return tr.expr(x, ctx); } catch (err) { return '1'; } });
                w(`        ${js(name)}: (rec, period, g) => ${d.length === 1 ? `z.array(1, ${d[0]})` : `z.array(${d.join(', ')})`},`);
            }
            w('    },');
        }
        w('};');
        w();
    }
    const lasting = (t.tables || []).filter((x) => /^(TREATMENT|SESSION)$/i.test(x.lifetime || '') && !['globals', 'subjects', 'summary', 'contracts', 'session', 'clients', 'treatments', 'sessionglobals', 'participations', 'logfile'].includes(x.name)).map((x) => x.name);
    if (lasting.length) {
        w('// Tables that last the treatment (or the session): their records are kept from period to period.');
        w(`app.ztLasting = ${js(lasting)};`);
        w();
    }
    const initTables = [...new Set(t.background.programs.map((p) => p.table || 'subjects'))].filter((x) => !['subjects', 'globals', 'summary', 'session'].includes(x));
    if (initTables.length) {
        w('// A new record of a table gets the background\'s programs for it, as in z-Tree.');
        w('app.ztInits = {');
        for (const table of initTables) {
            w(`    ${js(table)}(rec, period, g) {`);
            for (const p of t.background.programs.filter((x) => (x.table || 'subjects') === table)) {
                w(indent(tr.programOn(p, 'Background, new ' + table + ' records', { table, rec: 'rec', outer: null }).join('\n'), '        '));
            }
            w('    },');
        }
        w('};');
        w();
    }

    // The parameter table.
    w('// The parameter table: each subject\'s group, by period and subject (z-Tree\'s Group).');
    const groups = t.periods.map((_, p) => Array.from({ length: numSubjects }, (__, i) => {
        const cell = t.params[p * numSubjects + i];
        return cell && cell.group != null ? cell.group : 1;
    }));
    w(`const GROUPS = ${js(groups.length ? groups : [[1]])};`);
    w();
    w('/** The parameter table\'s programs for a period: the period\'s, then each subject\'s and its cell\'s. */');
    w('function parameters(period, players) {');
    w('    const g = z.globals(period);');
    const periodPrograms = t.periods.map((pp, p) => [p, pp.program]).filter(([, c]) => c);
    for (const [p, code] of periodPrograms) {
        w(`    if (period.id === ${p + 1}) {`);
        w(indent(tr.program({ table: 'globals', code }, 'Parameter table, period ' + (p + 1)).join('\n'), '        '));
        w('    }');
    }
    const cells = [];
    t.subjects.forEach((s, i) => { if (s.program) cells.push([`player.Subject === ${i + 1}`, s.program, 'subject ' + s.name]); });
    t.params.forEach((c, k) => {
        if (c.program) cells.push([`period.id === ${Math.floor(k / numSubjects) + 1} && player.Subject === ${(k % numSubjects) + 1}`, c.program, 'period ' + (Math.floor(k / numSubjects) + 1) + ', subject ' + ((k % numSubjects) + 1)]);
    });
    if (cells.length) w('    for (const player of players) {');
    for (const [cond, code, where] of cells) {
        w(`        if (${cond}) {`);
        const lines = tr.program({ table: 'subjects', code }, 'Parameter table, ' + where, '[player]');
        // A loop over [player] of one: its body.
        w(indent(lines.slice(2, -1).map((l) => l.replace(/^ {4}/, '')).join('\n'), '            '));
        w('        }');
    }
    if (cells.length) w('    }');
    w('}');
    w();

    // Periods.
    w('app.periodStart = function (period) {');
    w('    const order = Object.keys(app.session.participants);');
    w('    const players = period.groups.flatMap((group) => group.players);');
    w('    const before = z.before(period);');
    w('    for (const player of players) {');
    w('        const subject = order.indexOf(String(player.participant.id)) + 1;');
    w('        const last = before == null ? null : z.subjects(before).find((p) => p.participant === player.participant);');
    w('        Object.assign(player, { Period: period.id, Subject: subject, Group: (GROUPS[period.id - 1] || GROUPS[0])[(subject - 1) % ' + numSubjects + '],');
    w('            Profit: 0, TotalProfit: last == null ? 0 : last.TotalProfit, Participate: 1 });');
    w('        z.init(player, VARS.subjects);');
    w('    }');
    w('    const g = z.init(Object.assign(z.globals(period), { Period: period.id, NumPeriods: app.numPeriods, RepeatTreatment: 0 }), VARS.globals);');
    w('    z.summary(app)[period.id - 1] = z.init({ Period: period.id }, VARS.summary);');
    if (t.background.programs.length) w('    // The background\'s programs.');
    for (const p of t.background.programs) w(indent(tr.program(p, 'Background').join('\n'), '    '));
    w('    parameters(period, z.subjects(period));');
    w('};');
    w();
    w('// At the end of each period: Profit is the period\'s points, added to TotalProfit.');
    w('app.periodEnd = function (period) {');
    w('    for (const player of z.subjects(period)) {');
    w('        player.TotalProfit += player.Profit;');
    w('        player.points = player.Profit;');
    w('    }');
    w('    z.endPeriod(period);');
    w('};');
    report.push({ status: 'converted', part: 'Periods and parameter table', note: t.periods.length + ' period(s), ' + numSubjects + ' subject(s)' });
    if (t.background.programs.length) report.push({ status: 'converted', part: 'Background', note: t.background.programs.length + ' program(s)' });

    // The waiting screen between stages: the background's.
    const bg = screens.start(null, 'Background, waiting screen', false, []);
    const waiting = screens.screen(t.background.waiting, bg);
    if (bg.values.length || bg.shows.length || bg.lists.length) {
        report.push({ status: 'todo', part: 'Background, waiting screen', note: 'values only the server can work out (table functions) are not shown on it' });
    }
    if (waiting) {
        w();
        w('// The waiting screen (the background\'s).');
        w('app.waitingScreen = `\n' + waiting.replace(/`/g, '\\`') + '`;');
    }

    // Stages.
    t.stages.forEach((stage, i) => {
        const where = 'Stage ' + stage.name;
        const before = report.filter((x) => x.status === 'todo').length;
        const waitForAll = stage.startIfPossible !== true;
        const interactive = isInteractive(stage);
        w();
        w(`// Stage ${i + 1}: ${stage.name}${waitForAll ? ' (waits for all subjects)' : ' (starts as each subject gets there)'}.`);
        w('{');
        w(`    const stage = app.newStage(${js('stage' + (i + 1))});`);
        w(`    stage.title = ${js(stage.name)};`);
        w(`    z.stage(stage, { waitForAll: ${waitForAll}${interactive ? ', interactive: true' : ''} });`);
        const programs = stage.programs.map((p) => tr.program(p, where).join('\n')).join('\n');
        if (waitForAll) {
            w('    // When all subjects are there: Participate, then the stage\'s programs.');
            w('    stage.allGroupsStart = function (period) {');
            w('        const g = z.globals(period);');
            w('        const players = z.subjects(period);');
            w('        for (const player of players) player.Participate = 1;');
            if (programs) w(indent(programs, '        '));
            w('    };');
            w('    stage.canPlayerParticipate = (player) => player.Participate !== 0;');
        } else {
            w('    // As each subject gets here: Participate, then the stage\'s programs (globals\' once).');
            w('    const started = new WeakSet();');
            w('    stage.canPlayerParticipate = function (player) {');
            w('        if (!started.has(player)) {');
            w('            started.add(player);');
            w('            const period = player.group.period;');
            w('            const g = z.globals(period);');
            w('            const players = [player];');
            w('            player.Participate = 1;');
            const once = stage.programs.map((p) => {
                const lines = tr.program(p, where).join('\n');
                return p.table === 'globals' ? `if (!(g.started_ || (g.started_ = {}))[stage.id + '/' + ${js(p.code.length)}]) {\n    g.started_[stage.id + '/' + ${js(p.code.length)}] = true;\n${indent(lines, '    ')}\n}` : lines;
            }).join('\n');
            if (once) w(indent(once, '            '));
            w('            z.changed(period);');
            w('        }');
            w('        return player.Participate !== 0;');
            w('    };');
        }
        if (stage.timeout && stage.timeout.trim() !== '' && stage.timeout.trim() !== '-1') {
            w(`    // Timeout: ${stage.timeout.trim()} seconds.`);
            w(`    stage.getClientDuration = (player) => { const period = player.group.period; const g = z.globals(period); return Math.max(0, ${tr.subjectExpr(stage.timeout, where)}); };`);
        }
        // Screens.
        const s = screens.start('stage' + (i + 1), where, interactive, stage.active, stage);
        const header = stage.showHeader ? t.background.active.find((b) => b.type === 'header') : null;
        let active = screens.screen(stage.active, s, { header });
        if (interactive) {
            active = '<link rel="stylesheet" href="/participant/ztree-app.css"><script src="/participant/ztree-plot.js"></script><script src="/participant/ztree-app.js"></script>\n' +
                `<div class="zt-screen" data-zt-stage="${s.stageId}">\n${active}</div>\n`;
        }
        w('    stage.activeScreen = `\n' + active.replace(/`/g, '\\`') + '`;');
        if (stage.waiting.length) {
            const wait = screens.screen(stage.waiting, { ...s, where: where + ', waiting screen', interactive: false, form: { inputs: [], buttons: [] } });
            w('    stage.waitingScreen = `\n' + wait.replace(/`/g, '\\`') + '`;');
        }
        // What only the server can work out for the screens (in player.zt_, as z.refresh has it).
        const table = (name, comment, entries) => {
            if (entries.length === 0) return;
            w(`    // ${comment}`);
            w(`    stage.${name} = {`);
            w(indent(entries.join('\n'), '        '));
            w('    };');
        };
        table('values', 'Values on the screens the page cannot work out (table functions, layouts that are variables).', s.values);
        table('shows', 'Boxes\' display conditions the page cannot work out.', s.shows);
        table('lists', 'Contract lists: their rows (each with its cells, worked out for the subject).', s.lists);
        table('buttons', 'The buttons, by box and button: what pressing one does (z.press, from a ztButton message).', s.buttons);
        table('chats', 'Chat boxes: what an entry is (z.chat, from a ztChat message).', s.chats);
        table('plots', 'Plot boxes: their shapes, worked out for the subject (draw), and their inputs (z.plotInput, from a ztPlot message).', s.plots);
        if (interactive) {
            interactiveStages++;
            report.push({ status: 'converted', part: where, note: 'interactive: its buttons run their programs as they are pressed' });
        }

        // A form's inputs: their checks.
        const inputs = s.form.inputs;
        const buttons = s.form.buttons;
        for (const item of inputs) {
            const l = parseLayout(item.layout, { rt: null });
            const field = { type: 'number' };
            const bound = (code) => (/^-?[\d.]+$/.test(code.trim()) ? code.trim() : `(player) => { const period = player.group.period; const g = z.globals(period); return ${tr.subjectExpr(code, where)}; }`);
            if (item.min) field.min = bound(item.min);
            if (item.max) field.max = bound(item.max);
            // A number's layout is its step: what is entered must be a multiple of it.
            const stepText = String(item.layout || '').trim();
            if (l.kind === 'number' && stepText !== '') field.step = bound(stepText);
            if (l.kind === 'checkbox') field.blank = 'true';
            (stageFields[s.stageId] = stageFields[s.stageId] || {})['player.' + item.variable] = field;
        }
        w(`    // FIELDS ${s.stageId}`);
        if (inputs.length) w(`    stage.formFields = ${js([...new Set(inputs.map((x) => 'player.' + x.variable))])};`);
        if (!interactive) {
            // Checkers: the boxes' and their buttons'.
            const checkers = [];
            for (const b of stage.active) {
                const visit = (box) => {
                    checkers.push(...box.items.filter((x) => x.kind === 'checker'));
                    box.boxes.forEach(visit);
                };
                visit(b);
            }
            for (const b of buttons) checkers.push(...b.checkers);
            if (checkers.length) {
                w('    // Checkers: each condition, on what was entered; else its message.');
                w('    stage.validate = function (player, values) {');
                w('        const period = player.group.period;');
                w('        const g = z.globals(period);');
                w('        const entered = Object.create(player);');
                w("        for (const [name, value] of Object.entries(values)) entered[name.replace(/^player\\./, '')] = value;");
                for (const c of checkers) {
                    const cond = tr.subjectExpr(c.condition, where).replace(/\bplayer\./g, 'entered.');
                    w(`        if (!(${cond})) return ${tr.text(c.message || 'Not allowed.', s.subject, where).replace(/\bplayer\./g, 'entered.')};`);
                }
                w('    };');
            }
            // The button's programs: when the subject leaves the stage.
            const withPrograms = buttons.filter((b) => b.programs.length);
            if (withPrograms.length) {
                w('    // The button\'s programs, as the subject leaves the stage.');
                w('    stage.playerEnd = function (player) {');
                w('        const period = player.group.period;');
                w('        const g = z.globals(period);');
                w('        const players = [player];');
                w(indent(withPrograms[0].programs.map((p) => tr.program(p, where + ', button ' + withPrograms[0].name).join('\n')).join('\n'), '        '));
                w('    };');
            }
        }
        w('}');
        if (report.filter((x) => x.status === 'todo').length === before) report.push({ status: 'converted', part: where, note: '' });
    });

    if (interactiveStages) {
        w();
        w('// Messages from the pages of interactive stages (participant/ztree-app.js): a button pressed.');
        w('// They convert their own values (box paths such as "1.0" are not numbers).');
        w('app.messages.ztButton = function (d) { z.press(this.player(), d); };');
        w('app.messages.ztButton.convertsOwnValues = true;');
        w('app.messages.ztChat = function (d) { z.chat(this.player(), d); };');
        w('app.messages.ztChat.convertsOwnValues = true;');
        w('app.messages.ztPlot = function (d) { z.plotInput(this.player(), d); };');
        w('app.messages.ztPlot.convertsOwnValues = true;');
    }

    // Inputs' checks: those that are the same on every stage together, in app.fields.
    const fieldCode = (f) => `{ ${Object.entries(f).map(([a, b]) => `${a}: ${a === 'type' ? js(b) : b}`).join(', ')} }`;
    const byName = {};
    for (const fields of Object.values(stageFields)) {
        for (const [k, f] of Object.entries(fields)) (byName[k] = byName[k] || new Set()).add(fieldCode(f));
    }
    const shared = Object.keys(byName).filter((k) => byName[k].size === 1);
    const fieldLines = shared.map((k) => `    ${js(k)}: ${[...byName[k]][0]},`);
    for (let k = 0; k < out.length; k++) {
        const m = /^ {4}\/\/ FIELDS (\S+)$/.exec(out[k]);
        if (m == null) continue;
        const own = Object.entries(stageFields[m[1]] || {}).filter(([name]) => !shared.includes(name));
        out.splice(k, 1, ...(own.length ? ['    // Its inputs\' checks, which differ from another stage\'s.', '    stage.fields = {', ...own.map(([name, f]) => `        ${js(name)}: ${fieldCode(f)},`), '    };'] : []));
    }
    const at = out.findIndex((l) => l.startsWith('// The parameter table'));
    out.splice(at, 0, '// The inputs: numbers, from their minimum to their maximum.', 'app.fields = {', ...fieldLines, '};', '');
    return { code: out.join('\n') + '\n', report };
}

/** CONVERSION.md. */
function reportMarkdown(name, level, report) {
    const lines = [`# ${name}: converted from z-Tree`, '', `**${level}.** jtree converted the z-Tree treatment ${name}.ztt to this jtree app:`, '',
        '- `app.jtt`: its periods, parameter table and stages, its programs translated from z-Tree\'s language,',
        '  its boxes as screens (a form\'s inputs in `app.fields`, checkers in `stage.validate`; an interactive',
        '  stage\'s buttons in `stage.buttons`, its lists, chats and plots worked out on the server);',
        '- `ztree.cjs`: what the translated code uses for z-Tree\'s tables and functions.', ''];
    const todos = report.filter((i) => i.status === 'todo');
    if (todos.length) {
        lines.push('## Needs work by hand', '', 'Each is a `TODO` in the code (which throws if it runs, unless it says it is skipped) or in a screen.', '');
        for (const i of todos) lines.push(`- **${i.part}**: ${i.note}`);
        lines.push('');
    }
    lines.push('## Converted', '');
    for (const i of report.filter((x) => x.status === 'converted')) lines.push(`- ${i.part}${i.note ? ': ' + i.note : ''}`);
    lines.push('', '## Differences from z-Tree', '',
        '- Boxes follow one another on the screen: z-Tree\'s placement is not kept.',
        '- Comparisons are exact (z-Tree allows for rounding errors), and conditions are true or false rather than 1 or 0.',
        '- A stage whose buttons all end it is a form, sent by its button; on the others (contract lists, chat, plots, ...),',
        '  buttons send messages and the stage goes on, as in z-Tree.',
        '- z-Leaf\'s calculator is not offered (its box is empty).', '');
    return lines.join('\n');
}

/** Converts the treatment in file to a jtree app in outDir; {name, level, report, files}. */
async function convertTreatmentFile(file, outDir) {
    const t = readTreatment(fs.readFileSync(file));
    const name = path.basename(file, path.extname(file));
    const { code, report } = convertTreatment(t, name);
    fs.outputFileSync(path.join(outDir, 'app.jtt'), code);
    fs.copyFileSync(RUNTIME, path.join(outDir, 'ztree.cjs'));
    const level = report.some((i) => i.status === 'todo') ? 'Converts with TODOs' : 'Converts';
    fs.outputFileSync(path.join(outDir, 'CONVERSION.md'), reportMarkdown(name, level, report));
    return { name, level, report, files: ['app.jtt', 'ztree.cjs', 'CONVERSION.md'] };
}

module.exports = { convertTreatment, convertTreatmentFile };

if (require.main === module) {
    const [file, outArg] = process.argv.slice(2);
    if (file == null) {
        console.log('Usage: node convert.js <treatment.ztt> [<output folder>]');
        process.exit(1);
    }
    const outDir = outArg || file.replace(/\.ztt$/i, '') + '-jtree';
    convertTreatmentFile(file, outDir).then((r) => {
        console.log(r.name + ': ' + r.level + ', in ' + outDir);
        for (const i of r.report.filter((x) => x.status === 'todo')) console.log('  TODO ' + i.part + ': ' + i.note);
    }, (err) => {
        console.log(String(err.message || err));
        process.exit(1);
    });
}
