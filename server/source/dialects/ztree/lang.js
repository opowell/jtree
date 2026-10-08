/*
 * z-Tree's programming language: parse(code) gives a program, run(program, ctx) runs it.
 * Written from z-Tree's manual and example treatments.
 *
 * Programs run on a record of a table (subjects, globals, contracts, summary, session, ...). A
 * variable is the record's, else (in a contract or a table function's record) the enclosing
 * records', else the globals table's; one that was never set is 0. `:x` is the enclosing record's
 * (the record whose program called a table function, or ran a do block), `\x` the globals'.
 *
 *   x = 1; a[i] = 2; array a[10]; array b[0, 10, 2];
 *   if (c) { ... } elseif (c) { ... } else { ... }
 *   while (c) { ... }   repeat { ... } while (c);
 *   subjects.do { ... }   contracts.new { ... }   later (seconds) do { ... }   later (s) repeat { ... }
 *   expressions: + - * / ^, == != <> < <= > >=, & |, not(), if(c, a, b), numbers, "strings",
 *   table functions [T.]sum/count/average/minimum/maximum/product/median/stddev/find([cond,] expr),
 *   same(x), and abs exp ln log sqrt round rounddown roundup trunc mod min max random power ...
 */

class ZtreeSyntaxError extends Error {
    constructor(message, line) {
        super(message + (line != null ? ' (line ' + line + ')' : ''));
        this.line = line;
    }
}

// --- Tokens -------------------------------------------------------------------------------

function tokenize(code) {
    const tokens = [];
    let i = 0;
    let line = 1;
    while (i < code.length) {
        const c = code[i];
        if (c === '\n') { line++; i++; continue; }
        if (/\s/.test(c)) { i++; continue; }
        if (c === '/' && code[i + 1] === '/') {
            while (i < code.length && code[i] !== '\n') i++;
            continue;
        }
        if (c === '/' && code[i + 1] === '*') {
            const end = code.indexOf('*/', i + 2);
            const text = code.slice(i, end < 0 ? code.length : end + 2);
            line += (text.match(/\n/g) || []).length;
            i += text.length;
            continue;
        }
        if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(code[i + 1] || ''))) {
            const m = /^(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?/.exec(code.slice(i));
            tokens.push({ t: 'num', v: Number(m[0]), line });
            i += m[0].length;
            continue;
        }
        if (/[A-Za-z_]/.test(c)) {
            const m = /^[A-Za-z_][A-Za-z_0-9]*/.exec(code.slice(i));
            tokens.push({ t: 'id', v: m[0], line });
            i += m[0].length;
            continue;
        }
        if (c === '"') {
            let j = i + 1;
            let s = '';
            while (j < code.length && code[j] !== '"') {
                if (code[j] === '\\' && j + 1 < code.length) { s += code[j + 1]; j += 2; continue; }
                s += code[j++];
            }
            tokens.push({ t: 'str', v: s, line });
            i = j + 1;
            continue;
        }
        const two = code.slice(i, i + 2);
        if (['==', '!=', '<>', '<=', '>=', '&&', '||'].includes(two)) {
            tokens.push({ t: 'op', v: two === '<>' ? '!=' : two === '&&' ? '&' : two === '||' ? '|' : two, line });
            i += 2;
            continue;
        }
        if ('+-*/^<>=&|!(){}[],;.:\\'.includes(c)) {
            tokens.push({ t: 'op', v: c, line });
            i++;
            continue;
        }
        throw new ZtreeSyntaxError('unexpected character ' + JSON.stringify(c), line);
    }
    tokens.push({ t: 'end', v: '', line });
    return tokens;
}

// --- Parser -------------------------------------------------------------------------------

const AGGREGATES = new Set(['sum', 'count', 'average', 'minimum', 'maximum', 'product', 'median', 'stddev', 'find', 'same']);

function parse(code) {
    const tokens = tokenize(code);
    let p = 0;
    const peek = (o = 0) => tokens[p + o];
    const next = () => tokens[p++];
    const is = (v, o = 0) => peek(o).t === 'op' && peek(o).v === v;
    const isId = (v, o = 0) => peek(o).t === 'id' && peek(o).v.toLowerCase() === v;
    const expect = (v) => {
        const t = next();
        if (t.t !== 'op' || t.v !== v) throw new ZtreeSyntaxError('expected ' + v + ' but found ' + (t.v || 'the end'), t.line);
        return t;
    };

    function statements(until) {
        const out = [];
        while (peek().t !== 'end' && !(until && is(until))) {
            if (is(';')) { next(); continue; }
            out.push(statement());
        }
        return out;
    }

    function block() {
        expect('{');
        const body = statements('}');
        expect('}');
        return body;
    }

    function statement() {
        const t = peek();
        if (isId('if')) {
            next();
            const branches = [];
            expect('(');
            branches.push({ cond: expr(), body: (expect(')'), block()) });
            let otherwise = null;
            for (;;) {
                if (isId('elseif')) {
                    next(); expect('(');
                    branches.push({ cond: expr(), body: (expect(')'), block()) });
                } else if (isId('else')) {
                    next();
                    if (isId('if')) {
                        otherwise = [statement()];
                    } else {
                        otherwise = block();
                    }
                    break;
                } else {
                    break;
                }
            }
            return { k: 'if', branches, otherwise, line: t.line };
        }
        if (isId('while')) {
            next(); expect('(');
            const cond = expr();
            expect(')');
            return { k: 'while', cond, body: block(), line: t.line };
        }
        if (isId('repeat')) {
            next();
            const body = block();
            if (!isId('while')) throw new ZtreeSyntaxError('expected while after repeat { }', peek().line);
            next(); expect('(');
            const cond = expr();
            expect(')');
            if (is(';')) next();
            return { k: 'repeat', cond, body, line: t.line };
        }
        if (isId('array')) {
            next();
            const name = next();
            expect('[');
            const dims = [expr()];
            while (is(',')) { next(); dims.push(expr()); }
            expect(']');
            if (is(';')) next();
            return { k: 'array', name: name.v, dims, line: t.line };
        }
        if (isId('later')) {
            next(); expect('(');
            const delay = expr();
            expect(')');
            const kind = next();
            if (kind.t !== 'id' || !['do', 'repeat'].includes(kind.v.toLowerCase())) {
                throw new ZtreeSyntaxError('expected do or repeat after later ( )', kind.line);
            }
            return { k: 'later', delay, repeat: kind.v.toLowerCase() === 'repeat', body: block(), line: t.line };
        }
        if (isId('exit')) {
            next();
            if (is(';')) next();
            return { k: 'exit', line: t.line };
        }
        // table.do { } / table.new { }
        if (t.t === 'id' && is('.', 1) && peek(2).t === 'id' && ['do', 'new'].includes(peek(2).v.toLowerCase()) && is('{', 3)) {
            next(); next();
            const kind = next().v.toLowerCase();
            return { k: kind, table: t.v, body: block(), line: t.line };
        }
        // An assignment.
        const target = lvalue();
        expect('=');
        const value = expr();
        if (!is('}')) expect(';');
        return { k: 'set', target, value, line: t.line };
    }

    function lvalue() {
        let scope = 'own';
        if (is(':')) { next(); scope = 'outer'; } else if (is('\\')) { next(); scope = 'globals'; }
        const name = next();
        if (name.t !== 'id') throw new ZtreeSyntaxError('expected a variable but found ' + (name.v || 'the end'), name.line);
        let index = null;
        if (is('[')) { next(); index = expr(); expect(']'); }
        return { name: name.v, scope, index };
    }

    // Precedence, lowest first: | & comparisons + - * / ^ unary.
    function expr() { return or(); }
    function or() {
        let l = and();
        while (is('|')) { next(); l = { k: 'bin', op: '|', l, r: and() }; }
        return l;
    }
    function and() {
        let l = cmp();
        while (is('&')) { next(); l = { k: 'bin', op: '&', l, r: cmp() }; }
        return l;
    }
    function cmp() {
        let l = add();
        while (['==', '!=', '<', '<=', '>', '>=', '='].some((o) => is(o))) {
            const op = next().v;
            l = { k: 'bin', op: op === '=' ? '==' : op, l, r: add() };
        }
        return l;
    }
    function add() {
        let l = mul();
        while (is('+') || is('-')) { const op = next().v; l = { k: 'bin', op, l, r: mul() }; }
        return l;
    }
    function mul() {
        let l = pow();
        while (is('*') || is('/')) { const op = next().v; l = { k: 'bin', op, l, r: pow() }; }
        return l;
    }
    function pow() {
        const l = unary();
        if (is('^')) { next(); return { k: 'bin', op: '^', l, r: pow() }; }
        return l;
    }
    function unary() {
        if (is('-')) { next(); return { k: 'neg', e: unary() }; }
        if (is('+')) { next(); return unary(); }
        if (is('!')) { next(); return { k: 'not', e: unary() }; }
        return primary();
    }
    function args() {
        expect('(');
        const out = [];
        if (!is(')')) {
            out.push(expr());
            while (is(',')) { next(); out.push(expr()); }
        }
        expect(')');
        return out;
    }
    function primary() {
        const t = peek();
        if (t.t === 'num') { next(); return { k: 'num', v: t.v }; }
        if (t.t === 'str') { next(); return { k: 'str', v: t.v }; }
        if (is('(')) { next(); const e = expr(); expect(')'); return e; }
        if (is(':') || is('\\')) {
            const scope = next().v === ':' ? 'outer' : 'globals';
            const name = next();
            let index = null;
            if (is('[')) { next(); index = expr(); expect(']'); }
            return { k: 'var', name: name.v, scope, index };
        }
        if (t.t === 'id') {
            next();
            // table.function(...)
            if (is('.') && peek(1).t === 'id' && is('(', 2)) {
                next();
                const fn = next().v.toLowerCase();
                return { k: 'agg', table: t.v, fn, args: args(), line: t.line };
            }
            if (is('(')) {
                const fn = t.v.toLowerCase();
                const a = args();
                if (AGGREGATES.has(fn)) return { k: 'agg', table: null, fn, args: a, line: t.line };
                return { k: 'call', fn, args: a, line: t.line };
            }
            let index = null;
            if (is('[')) { next(); index = expr(); expect(']'); }
            if (/^(true|false)$/i.test(t.v) && index == null) return { k: 'num', v: /^true$/i.test(t.v) ? 1 : 0 };
            return { k: 'var', name: t.v, scope: 'own', index };
        }
        throw new ZtreeSyntaxError('unexpected ' + (t.v || 'end of program'), t.line);
    }

    const body = statements(null);
    return { body };
}

/** An expression (a condition, a timeout, a variable in a layout) parsed. */
function parseExpr(code) {
    const program = parse('__value = ' + code + ';');
    return program.body[0].value;
}

// --- Running ------------------------------------------------------------------------------

/**
 * Where a program runs: a table's record, in a runtime.
 * - rt.records(table, {old}): the table's records (in the current period, or the one before);
 *   rt.globals(): the globals record; rt.isVar(table, name): whether the table has the variable;
 *   rt.newRecord(table): a new record; rt.later(seconds, fn): runs fn later.
 * - ctx: {rt, table, rec, outer}: outer is the enclosing context (for :x).
 */
class Exit extends Error {}

function isArray(v) { return v != null && typeof v === 'object' && v.zArray === true; }
function newArray(dims) {
    let [lo, hi, step] = dims.length === 1 ? [1, dims[0], 1] : [dims[0], dims[1], dims[2] == null ? 1 : dims[2]];
    const n = Math.max(0, Math.floor((hi - lo) / step + 1e-9) + 1);
    return { zArray: true, lo, step, values: new Array(n).fill(0) };
}
function arrayIndex(arr, i) {
    const k = Math.round((i - arr.lo) / arr.step);
    if (k < 0 || k >= arr.values.length) throw new Error('array index ' + i + ' out of range');
    return k;
}

/** The record (and its table) a variable is in, looking out from ctx; null if none. */
function owner(ctx, name, scope) {
    const rt = ctx.rt;
    if (scope === 'globals') return { rec: rt.globals(), table: 'globals' };
    let c = scope === 'outer' ? ctx.outer : ctx;
    if (c == null) throw new Error(':' + name + ' has no enclosing record here');
    for (let d = c; d != null; d = d.outer) {
        if (d.rec != null && (Object.prototype.hasOwnProperty.call(d.rec, name) || rt.isVar(d.table, name))) {
            return { rec: d.rec, table: d.table };
        }
    }
    if (rt.isVar('globals', name) || Object.prototype.hasOwnProperty.call(rt.globals(), name)) {
        return { rec: rt.globals(), table: 'globals' };
    }
    return null;
}

function readVar(ctx, node) {
    const o = owner(ctx, node.name, node.scope);
    let v = o == null ? 0 : o.rec[node.name];
    if (v === undefined) v = 0;
    if (node.index != null) {
        if (!isArray(v)) throw new Error(node.name + ' is not an array');
        return v.values[arrayIndex(v, num(evaluate(node.index, ctx)))];
    }
    return v;
}

function writeVar(ctx, target, value) {
    let rec;
    if (target.scope === 'globals') {
        rec = ctx.rt.globals();
    } else if (target.scope === 'outer') {
        const o = owner(ctx, target.name, 'outer');
        rec = o != null ? o.rec : ctx.outer.rec;
    } else {
        // A variable of this record's table, else of an enclosing record that has it, else new here.
        const o = owner(ctx, target.name, 'own');
        rec = o != null && !ctx.rt.isVar(ctx.table, target.name) && !Object.prototype.hasOwnProperty.call(ctx.rec, target.name) ? o.rec : ctx.rec;
    }
    if (target.index != null) {
        const arr = rec[target.name];
        if (!isArray(arr)) throw new Error(target.name + ' is not an array');
        arr.values[arrayIndex(arr, num(evaluate(target.index, ctx)))] = value;
    } else {
        rec[target.name] = value;
    }
}

const num = (v) => (typeof v === 'string' ? (v.trim() === '' || isNaN(v) ? 0 : Number(v)) : typeof v === 'boolean' ? (v ? 1 : 0) : v == null ? 0 : Number(v));
const bool = (v) => (typeof v === 'string' ? v !== '' : num(v) !== 0);

function roundTo(x, step, mode) {
    step = step == null || num(step) === 0 ? 1 : Math.abs(num(step));
    const q = x / step;
    const r = mode === 'down' ? Math.floor(q + 1e-9) : mode === 'up' ? Math.ceil(q - 1e-9) : Math.round(q + (q >= 0 ? 1e-9 : -1e-9));
    // Avoid 0.30000000000000004.
    const decimals = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
    return Number((r * step).toFixed(Math.min(decimals + 2, 12)));
}

const FUNCTIONS = {
    if: (a) => (bool(a[0]) ? a[1] : a[2]),
    not: (a) => (bool(a[0]) ? 0 : 1),
    abs: (a) => Math.abs(num(a[0])),
    exp: (a) => Math.exp(num(a[0])),
    ln: (a) => Math.log(num(a[0])),
    log: (a) => Math.log10(num(a[0])),
    sqrt: (a) => Math.sqrt(num(a[0])),
    sin: (a) => Math.sin(num(a[0])),
    cos: (a) => Math.cos(num(a[0])),
    tan: (a) => Math.tan(num(a[0])),
    atan: (a) => Math.atan(num(a[0])),
    power: (a) => Math.pow(num(a[0]), num(a[1])),
    round: (a) => roundTo(num(a[0]), a[1]),
    rounddown: (a) => roundTo(num(a[0]), a[1], 'down'),
    roundup: (a) => roundTo(num(a[0]), a[1], 'up'),
    trunc: (a) => Math.trunc(num(a[0])),
    sign: (a) => Math.sign(num(a[0])),
    mod: (a) => { const m = num(a[1]); return ((num(a[0]) % m) + m) % m; },
    min: (a) => Math.min(...a.map(num)),
    max: (a) => Math.max(...a.map(num)),
    random: () => Math.random(),
    randomgenerator: () => Math.random(),
    gettime: (a, ctx) => ctx.rt.time(),
    true: () => 1,
    false: () => 0,
};

function evaluate(node, ctx) {
    switch (node.k) {
        case 'num':
        case 'str':
            return node.v;
        case 'var':
            return readVar(ctx, node);
        case 'neg':
            return -num(evaluate(node.e, ctx));
        case 'not':
            return bool(evaluate(node.e, ctx)) ? 0 : 1;
        case 'bin': {
            if (node.op === '&') return bool(evaluate(node.l, ctx)) && bool(evaluate(node.r, ctx)) ? 1 : 0;
            if (node.op === '|') return bool(evaluate(node.l, ctx)) || bool(evaluate(node.r, ctx)) ? 1 : 0;
            const l = evaluate(node.l, ctx);
            const r = evaluate(node.r, ctx);
            if (typeof l === 'string' || typeof r === 'string') {
                switch (node.op) {
                    case '+': return String(l) + String(r);
                    case '==': return String(l) === String(r) ? 1 : 0;
                    case '!=': return String(l) !== String(r) ? 1 : 0;
                    default: break;
                }
            }
            const a = num(l);
            const b = num(r);
            switch (node.op) {
                case '+': return a + b;
                case '-': return a - b;
                case '*': return a * b;
                case '/':
                    if (b === 0) throw new Error('division by zero');
                    return a / b;
                case '^': return Math.pow(a, b);
                // Comparisons allow for rounding errors, as z-Tree's do.
                case '==': return Math.abs(a - b) < 1e-9 ? 1 : 0;
                case '!=': return Math.abs(a - b) >= 1e-9 ? 1 : 0;
                case '<': return a < b - 1e-9 ? 1 : 0;
                case '<=': return a <= b + 1e-9 ? 1 : 0;
                case '>': return a > b + 1e-9 ? 1 : 0;
                case '>=': return a >= b - 1e-9 ? 1 : 0;
                default: throw new Error('unknown operator ' + node.op);
            }
        }
        case 'call': {
            const fn = FUNCTIONS[node.fn];
            if (fn == null) throw new Error('unknown function ' + node.fn + ' (line ' + node.line + ')');
            if (node.fn === 'if') return bool(evaluate(node.args[0], ctx)) ? evaluate(node.args[1], ctx) : evaluate(node.args[2], ctx);
            return fn(node.args.map((a) => evaluate(a, ctx)), ctx);
        }
        case 'agg':
            return aggregate(node, ctx);
        default:
            throw new Error('cannot evaluate ' + node.k);
    }
}

/** The records of a table named in a program (OLDsubjects: the period before's). */
function tableRecords(ctx, name) {
    const old = /^OLD/.test(name);
    const table = old ? name.slice(3) : name;
    return { table, records: ctx.rt.records(table, { old }) };
}

function aggregate(node, ctx) {
    if (node.fn === 'same') {
        // same(x): x here is x in the enclosing record.
        const here = evaluate(node.args[0], ctx);
        const there = evaluate(node.args[0], ctx.outer || ctx);
        return (typeof here === 'string' ? here === there : Math.abs(num(here) - num(there)) < 1e-9) ? 1 : 0;
    }
    const { table, records } = node.table == null ? { table: ctx.table, records: ctx.rt.records(ctx.table, {}) } : tableRecords(ctx, node.table);
    const each = (r) => ({ rt: ctx.rt, table, rec: r, outer: ctx });
    let cond = null;
    let value = null;
    if (node.fn === 'count') {
        cond = node.args[0] || null;
    } else if (node.args.length >= 2) {
        cond = node.args[0];
        value = node.args[1];
    } else {
        value = node.args[0];
    }
    const chosen = cond == null ? records : records.filter((r) => bool(evaluate(cond, each(r))));
    if (node.fn === 'count') return chosen.length;
    if (node.fn === 'find') {
        if (chosen.length === 0) return 0;
        return value == null ? 1 : evaluate(value, each(chosen[0]));
    }
    const values = chosen.map((r) => num(evaluate(value, each(r))));
    switch (node.fn) {
        case 'sum': return values.reduce((a, b) => a + b, 0);
        case 'product': return values.reduce((a, b) => a * b, 1);
        case 'average': return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
        case 'minimum': return values.length === 0 ? Infinity : Math.min(...values); // none: no offer is lower
        case 'maximum': return values.length === 0 ? -Infinity : Math.max(...values);
        case 'median': {
            if (values.length === 0) return 0;
            const s = values.slice().sort((a, b) => a - b);
            const m = Math.floor(s.length / 2);
            return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
        }
        case 'stddev': {
            if (values.length === 0) return 0;
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            return Math.sqrt(values.reduce((a, b) => a + (b - mean) * (b - mean), 0) / values.length);
        }
        default: throw new Error('unknown table function ' + node.fn);
    }
}

function exec(stmts, ctx) {
    for (const s of stmts) {
        switch (s.k) {
            case 'set':
                writeVar(ctx, s.target, evaluate(s.value, ctx));
                break;
            case 'if': {
                const branch = s.branches.find((b) => bool(evaluate(b.cond, ctx)));
                if (branch) exec(branch.body, ctx);
                else if (s.otherwise) exec(s.otherwise, ctx);
                break;
            }
            case 'while': {
                let n = 0;
                while (bool(evaluate(s.cond, ctx))) {
                    if (++n > 1e6) throw new Error('a while loop ran a million times (line ' + s.line + ')');
                    exec(s.body, ctx);
                }
                break;
            }
            case 'repeat': {
                let n = 0;
                do {
                    if (++n > 1e6) throw new Error('a repeat loop ran a million times (line ' + s.line + ')');
                    exec(s.body, ctx);
                } while (bool(evaluate(s.cond, ctx)));
                break;
            }
            case 'array': {
                const dims = s.dims.map((d) => num(evaluate(d, ctx)));
                const o = owner(ctx, s.name, 'own');
                const rec = o != null && o.rec === ctx.rt.globals() && ctx.table !== 'globals' && !ctx.rt.isVar(ctx.table, s.name) ? o.rec : ctx.rec;
                rec[s.name] = newArray(dims);
                break;
            }
            case 'do': {
                const { table, records } = tableRecords(ctx, s.table);
                for (const r of records.slice()) exec(s.body, { rt: ctx.rt, table, rec: r, outer: ctx });
                break;
            }
            case 'new': {
                const rec = ctx.rt.newRecord(s.table);
                exec(s.body, { rt: ctx.rt, table: s.table, rec, outer: ctx });
                break;
            }
            case 'later': {
                const delay = num(evaluate(s.delay, ctx));
                if (delay <= 0) break;
                const tick = () => {
                    exec(s.body, ctx);
                    if (s.repeat) {
                        const again = num(evaluate(s.delay, ctx));
                        if (again > 0) ctx.rt.later(again, tick);
                    }
                };
                ctx.rt.later(delay, tick);
                break;
            }
            case 'exit':
                throw new Exit();
            default:
                throw new Error('cannot run ' + s.k);
        }
    }
}

/** Runs a parsed program in ctx ({rt, table, rec, outer}). */
function run(program, ctx) {
    try {
        exec(program.body, ctx);
    } catch (err) {
        if (!(err instanceof Exit)) throw err;
    }
}

/** The variables a program sets, by table (its own table's, and do/new blocks' tables'). */
function assignedVariables(program, table, out = {}) {
    const add = (t, name) => { (out[t] = out[t] || new Set()).add(name); };
    const visit = (stmts, t) => {
        for (const s of stmts) {
            if (s.k === 'set' && s.target.scope === 'own') add(t, s.target.name);
            if (s.k === 'set' && s.target.scope === 'globals') add('globals', s.target.name);
            if (s.k === 'array') add(t, s.name);
            if (s.k === 'if') { s.branches.forEach((b) => visit(b.body, t)); if (s.otherwise) visit(s.otherwise, t); }
            if (s.k === 'while' || s.k === 'repeat' || s.k === 'later') visit(s.body, t);
            if (s.k === 'do' || s.k === 'new') visit(s.body, s.table.replace(/^OLD/, ''));
        }
    };
    visit(program.body, table);
    return out;
}

module.exports = { parse, parseExpr, run, evaluate, assignedVariables, num, bool, roundTo, isArray, ZtreeSyntaxError };
