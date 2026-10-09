const fs = require('fs-extra');
const path = require('path');
const lang = require('./lang.js');
const { readTreatment } = require('./ztt.js');
const { variables } = require('./runtime.js');
const { parseLayout } = require('./render.js');

/*
 * Converting a z-Tree treatment (.ztt) to a jtree app (plans/ztree-otree-dialects.md, sections
 * 5.7 and 6): a folder with
 * - app.jtt: the treatment's periods, parameter table, and stages, its programs translated from
 *   z-Tree's language to JS, its standard boxes as jtree screens (inputs in app.fields, checkers
 *   in stage.validate, buttons' programs in stage.playerEnd);
 * - ztree.cjs: what the translated code uses (convert-runtime.js);
 * - CONVERSION.md: what was converted, and what needs work by hand.
 *
 * z-Tree's tables become jtree's objects: subjects the period's players (their variables the
 * players' fields), globals period.globals, contracts period.contracts, summary app.summary,
 * session participant.session_. A variable is resolved to its table when converting, as the
 * z-Tree dialect resolves it when running (lang.js): the record's table's, else an enclosing
 * record's, else globals'.
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
    constructor(vars, report) {
        this.vars = vars;
        this.report = report;
        this.n = 0;
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
    owner(ctx, name, scope) {
        if (scope === 'globals') return 'g';
        let c = scope === 'outer' ? ctx.outer : ctx;
        if (c == null) throw new Todo(':' + name + ' has no enclosing record here');
        for (let d = c; d != null; d = d.outer) {
            if (this.has(d.table, name)) return d.rec;
        }
        if (this.has('globals', name)) return 'g';
        return c.rec;
    }

    /** The record (JS) a variable is set in. */
    target(ctx, t) {
        if (t.scope === 'globals') return 'g';
        if (t.scope === 'outer') return this.owner(ctx, t.name, 'outer');
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
                const ref = this.prop(this.owner(ctx, node.name, node.scope), node.name);
                return node.index == null ? ref : `z.at(${ref}, ${this.expr(node.index, ctx)})`;
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
                if (s.target.index != null) return [`z.put(${this.prop(rec, s.target.name)}, ${this.expr(s.target.index, ctx)}, ${value});`];
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
                return [`for (const ${r} of ${code}) {`, ...block(s.body, { ...ctx, table, rec: r, outer: ctx }), '}'];
            }
            case 'new': {
                const r = 'r' + (++this.n);
                return [`{`, `    const ${r} = z.newRecord(period, ${js(s.table)}, VARS[${js(s.table)}] || []);`,
                    ...block(s.body, { ...ctx, table: s.table, rec: r, outer: ctx }), '}'];
            }
            case 'later': {
                const err = new Todo('later ( ) ' + (s.repeat ? 'repeat' : 'do') + ' { } (code run later) is not converted; this statement is skipped');
                err.skip = true;
                throw err;
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

/**
 * The screen of boxes, as a jtree screen (a Vue template on the participant's page, where player,
 * period and app are the participant's): items, inputs (in app.fields) and buttons; z-Tree's
 * placement of boxes is not kept (they follow one another).
 */
class Screens {
    constructor(t, report) {
        this.t = t;
        this.report = report;
        this.fields = {};
    }

    /** A subject's expression on the participant's page: player.X, period.globals.X; else null. */
    vue(code, vars) {
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
                    if (n.index != null) return null;
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

    /** A value shown with a layout ("1", "0.01", or !text: ...). */
    shown(code, layout, vars, where) {
        const v = this.vue(code, vars);
        if (v == null) {
            this.report.push({ status: 'todo', part: where, note: 'the item ' + code + ' (table functions, arrays) is not shown' });
            return `<!-- TODO: ${html(code)} -->`;
        }
        const l = parseLayout(layout, { rt: null });
        if (l.kind === 'number') {
            const step = /^[\d.]+$/.test(String(layout).trim()) ? Number(layout) : 1;
            const d = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
            return `{{ ${v} | round(${d}) }}`;
        }
        const map = '{' + l.options.map(([k, s]) => `${js(String(k))}: ${js(s.replace(/<\|[^>]*>/g, ''))}`).join(', ').replace(/"/g, "'") + '}';
        return `{{ ${map.replace(/"/g, "'")}[${v}] }}`;
    }

    /** A label: its text, z-Tree's <var|layout> as values. */
    label(text, vars, where) {
        let s = String(text || '');
        if (!s.startsWith('<>')) return html(s).replace(/\n/g, '<br>');
        s = s.slice(2);
        let out = '';
        let last = 0;
        const re = /<([^<>|]*)\|([^<>]*)>/g;
        let m;
        while ((m = re.exec(s)) != null) {
            out += html(s.slice(last, m.index));
            out += m[1].trim() ? this.shown(m[1], m[2], vars, where) : '';
            last = re.lastIndex;
        }
        return out + html(s.slice(last));
    }

    item(item, vars, where, inputs) {
        if (item.kind === 'checker') return '';
        const label = this.label(item.label, vars, where);
        if (!item.variable) return `    <p class="zt-text">${label}</p>\n`;
        if (!item.input) return `    <p class="zt-item"><span class="zt-label">${label}</span> <span class="zt-value">${this.shown(item.variable, item.layout, vars, where)}</span></p>\n`;
        if (!/^\w+$/.test(item.variable)) {
            this.report.push({ status: 'todo', part: where, note: 'an input into ' + item.variable + ' (not a variable)' });
            return '';
        }
        inputs.push(item);
        const name = 'player.' + item.variable;
        const l = parseLayout(item.layout, { rt: null });
        let control;
        if (l.kind === 'radio' || l.kind === 'text' || l.kind === 'button') {
            control = l.options.map(([v, s]) => `<label class="zt-choice"><input type="radio" name="${name}" value="${v}"> ${html(s)}</label>`).join(' ');
        } else if (l.kind === 'radioline' && l.options.length >= 2) {
            const [lo, hi] = [l.options[0], l.options[l.options.length - 1]];
            const n = l.count || 2;
            const values = Array.from({ length: n }, (_, k) => lo[0] + (hi[0] - lo[0]) * k / (n - 1));
            control = `${html(lo[1])} ${values.map((v) => `<input type="radio" name="${name}" value="${v}">`).join(' ')} ${html(hi[1])}`;
        } else if (l.kind === 'checkbox') {
            const [v, s] = l.options[0] || [1, ''];
            control = `<label class="zt-choice"><input type="checkbox" name="${name}" value="${v}"> ${html(s)}</label>`;
        } else if (l.kind === 'slider' || l.kind === 'scrollbar') {
            control = `<input type="range" name="${name}" min="${l.options[0] ? l.options[0][0] : 0}" max="${l.options[1] ? l.options[1][0] : 100}">`;
        } else {
            control = `<input type="number" name="${name}" step="${l.step}">`;
        }
        return `    <p class="zt-item"><span class="zt-label">${label}</span> <span class="zt-input">${control}</span></p>\n`;
    }

    box(box, vars, where, inputs, buttons) {
        const w = where + ', box ' + (box.name || box.type);
        switch (box.type) {
            case 'container':
                return box.boxes.map((b) => this.box(b, vars, where, inputs, buttons)).join('');
            case 'header':
                return '<div class="zt-header">Period {{ period.id }} of ' + Math.max(1, this.t.periods.length) +
                    ' <span v-if="hasTimeoutClient">Remaining time [sec]: {{ timeLeftClient }}</span></div>\n';
            case 'help':
                return `<div class="zt-help"><b>${html(box.title)}</b><br>${html(box.text).replace(/\n/g, '<br>')}</div>\n`;
            case 'standard': {
                let out = '<div class="zt-box">\n';
                for (const item of box.items) out += this.item(item, vars, w, inputs);
                if (box.buttons.length) {
                    out += '    <p class="zt-buttons">' + box.buttons.map((b) => `<button>${html(b.name)}</button>`).join(' ') + '</p>\n';
                    buttons.push(...box.buttons.map((b) => ({ ...b, box })));
                }
                return out + '</div>\n';
            }
            default:
                this.report.push({ status: 'todo', part: w, note: 'a ' + box.type + ' box is not converted (it runs in the z-Tree dialect)' });
                return `<!-- TODO: the ${html(box.type)} box ${html(box.name)} -->\n`;
        }
    }
}

// --- The app ----------------------------------------------------------------------------------

/** app.jtt for treatment t, and the report: [{status, part, note}]. */
function convertTreatment(t, name) {
    const report = [];
    const vars = variables(t);
    const tr = new Translator(vars, report);
    const screens = new Screens(t, report);
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
    w('};');
    report.push({ status: 'converted', part: 'Periods and parameter table', note: t.periods.length + ' period(s), ' + numSubjects + ' subject(s)' });
    if (t.background.programs.length) report.push({ status: 'converted', part: 'Background', note: t.background.programs.length + ' program(s)' });

    // The waiting screen between stages: the background's.
    const bgInputs = [];
    const waiting = t.background.waiting.map((b) => screens.box(b, vars, 'Background, waiting screen', bgInputs, [])).join('');
    if (waiting) {
        w();
        w('// The waiting screen (the background\'s).');
        w('app.waitingScreen = `\n' + waiting.replace(/`/g, '\\`') + '`;');
    }

    // Stages.
    t.stages.forEach((stage, i) => {
        const where = 'Stage ' + stage.name;
        const before = report.filter((x) => x.status === 'todo').length;
        const waitForAll = (stage.options[0] & 1) !== 1;
        w();
        w(`// Stage ${i + 1}: ${stage.name}${waitForAll ? ' (waits for all subjects)' : ' (starts as each subject gets there)'}.`);
        w('{');
        w(`    const stage = app.newStage(${js('stage' + (i + 1))});`);
        w(`    stage.title = ${js(stage.name)};`);
        w(`    z.stage(stage, { waitForAll: ${waitForAll} });`);
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
            w('        }');
            w('        return player.Participate !== 0;');
            w('    };');
        }
        if (stage.timeout && stage.timeout.trim() !== '' && stage.timeout.trim() !== '-1') {
            w(`    // Timeout: ${stage.timeout.trim()} seconds.`);
            w(`    stage.getClientDuration = (player) => { const period = player.group.period; const g = z.globals(period); return Math.max(0, ${tr.subjectExpr(stage.timeout, where)}); };`);
        }
        // Screens.
        const inputs = [];
        const buttons = [];
        const header = stage.showHeader ? t.background.active.filter((b) => b.type === 'header') : [];
        const active = [...header, ...stage.active].map((b) => screens.box(b, vars, where, inputs, buttons)).join('');
        w('    stage.activeScreen = `\n' + active.replace(/`/g, '\\`') + '`;');
        if (stage.waiting.length) {
            const wait = stage.waiting.map((b) => screens.box(b, vars, where + ', waiting screen', [], [])).join('');
            w('    stage.waitingScreen = `\n' + wait.replace(/`/g, '\\`') + '`;');
        }
        // Inputs: their checks.
        for (const item of inputs) {
            const l = parseLayout(item.layout, { rt: null });
            const field = { type: 'number' };
            const bound = (code) => (/^-?[\d.]+$/.test(code.trim()) ? code.trim() : `(player) => { const period = player.group.period; const g = z.globals(period); return ${tr.subjectExpr(code, where)}; }`);
            if (item.min) field.min = bound(item.min);
            if (item.max) field.max = bound(item.max);
            if (l.kind === 'checkbox') field.blank = 'true';
            screens.fields['player.' + item.variable] = field;
        }
        if (inputs.length) w(`    stage.formFields = ${js(inputs.map((x) => 'player.' + x.variable))};`);
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
                w(`        if (!(${cond})) return ${js(c.message || 'Not allowed.')};`);
            }
            w('    };');
        }
        // Buttons' programs: when the subject leaves the stage.
        const withPrograms = buttons.filter((b) => b.programs.length);
        if (withPrograms.length > 1) {
            report.push({ status: 'todo', part: where, note: 'buttons with different programs: only the first\'s are converted' });
        }
        if (withPrograms.length) {
            w('    // The button\'s programs, as the subject leaves the stage.');
            w('    stage.playerEnd = function (player) {');
            w('        const period = player.group.period;');
            w('        const g = z.globals(period);');
            w('        const players = [player];');
            w(indent(withPrograms[0].programs.map((p) => tr.program(p, where + ', button ' + withPrograms[0].name).join('\n')).join('\n'), '        '));
            w('    };');
        }
        w('}');
        if (report.filter((x) => x.status === 'todo').length === before) report.push({ status: 'converted', part: where, note: '' });
    });

    // Inputs' checks, all together.
    const fieldLines = Object.entries(screens.fields).map(([k, f]) => `    ${js(k)}: { ${Object.entries(f).map(([a, b]) => `${a}: ${a === 'type' ? js(b) : b}`).join(', ')} },`);
    const at = out.findIndex((l) => l.startsWith('// The parameter table'));
    out.splice(at, 0, '// The inputs: numbers, from their minimum to their maximum.', 'app.fields = {', ...fieldLines, '};', '');
    return { code: out.join('\n') + '\n', report };
}

/** CONVERSION.md. */
function reportMarkdown(name, level, report) {
    const lines = [`# ${name}: converted from z-Tree`, '', `**${level}.** jtree converted the z-Tree treatment ${name}.ztt to this jtree app:`, '',
        '- `app.jtt`: its periods, parameter table and stages, its programs translated from z-Tree\'s language,',
        '  its standard boxes as screens (inputs in `app.fields`, checkers in `stage.validate`);',
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
        '- A stage\'s inputs are a form, sent by its button.', '');
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
