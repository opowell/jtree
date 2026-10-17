const path = require('path');
const fs = require('fs-extra');
const { pathToFileURL } = require('url');
const { fail, keepingLineEnds } = require('./util.js');
const html = require('./html.js');

/*
 * jtree apps (.jtt) as jtree's app editor shows them: the app's settings (`app.x = value;`),
 * its stages (`let s = app.newStage('name');` and the `s.x = value;` statements about it),
 * and the rest of its code. Every part remembers the stretch of source it came from, and edits
 * change only that stretch, so what the editor does not touch stays as it was written.
 *
 * The source is read with acorn, the copy the admin interfaces use (client/internal/clients/shared).
 */

const ACORN = path.join(__dirname, '../../../client/internal/clients/shared/acorn-8.18.0/acorn.mjs');
let acorn = null;

/** Loads acorn, once (it is an ES module). */
async function ready() {
    if (acorn == null) acorn = await import(pathToFileURL(ACORN).href);
    return acorn;
}

const PARSE_OPTIONS = { ecmaVersion: 'latest', sourceType: 'script', allowReturnOutsideFunction: true, allowAwaitOutsideFunction: true, allowHashBang: true };

/** Stage functions jtree calls, with what they are given, in the order the editor lists them. */
const STAGE_HOOKS = {
    canGroupParticipate: ['group'], canPlayerParticipate: ['player'], groupStart: ['group'], playerStart: ['player'],
    playerEnd: ['player'], groupEnd: ['group'], canGroupStart: ['group'], canGroupEnd: ['group'], getClientDuration: ['player'],
};

/** App functions jtree calls. */
const APP_HOOKS = {
    sessionStart: ['session'], groupStart: ['group'], playerStart: ['player'], groupEnd: ['group'], playerEnd: ['player'],
    periodStart: ['period'], periodEnd: ['period'], appEnd: ['session'], getNumPeriods: [],
};

/** What a value is, for the editor to show it in a field of the right kind. */
function valueKind(node) {
    if (node.type === 'Literal') {
        if (typeof node.value === 'number') return 'number';
        if (typeof node.value === 'boolean') return 'boolean';
        if (typeof node.value === 'string') return 'string';
        if (node.value === null) return 'null';
    }
    if (node.type === 'UnaryExpression' && node.operator === '-' && node.argument.type === 'Literal' && typeof node.argument.value === 'number') return 'number';
    if (node.type === 'TemplateLiteral' && node.expressions.length === 0) return 'text';
    if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') return 'function';
    return 'code';
}

/** Lines with the indentation they share taken out. */
function dedent(text) {
    const lines = text.replace(/\r\n/g, '\n').split('\n');
    while (lines.length && lines[0].trim() === '') lines.shift();
    while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
    const indents = lines.filter((l) => l.trim() !== '').map((l) => /^[ \t]*/.exec(l)[0].length);
    const cut = indents.length ? Math.min(...indents) : 0;
    return lines.map((l) => l.slice(cut)).join('\n');
}

/** A property's value as the editor shows it: its source, and for some kinds what it holds. */
function describeValue(source, node) {
    const out = { kind: valueKind(node), code: source.slice(node.start, node.end) };
    if (out.kind === 'number') out.value = Number(out.code);
    else if (out.kind === 'boolean' || out.kind === 'string') out.value = node.value;
    else if (out.kind === 'text') {
        out.value = node.quasis[0].value.cooked;
        // A screen's elements, for the structured mode (ranges are in value).
        out.nodes = html.describe(html.parse(out.value));
    }
    else if (out.kind === 'function') {
        out.params = node.params.map((p) => source.slice(p.start, p.end));
        out.async = Boolean(node.async);
        out.arrow = node.type === 'ArrowFunctionExpression';
        out.body = node.body.type === 'BlockStatement' ? dedent(source.slice(node.body.start + 1, node.body.end - 1)) : 'return ' + source.slice(node.body.start, node.body.end) + ';';
    }
    return out;
}

/** `let x = app.newStage('name')`, or the call alone: {name, varName, nameNode, call}. */
function stageDeclaration(statement) {
    let call = null;
    let varName = '';
    if (statement.type === 'VariableDeclaration' && statement.declarations.length === 1) {
        const d = statement.declarations[0];
        if (d.id.type !== 'Identifier') return null;
        varName = d.id.name;
        call = d.init;
    } else if (statement.type === 'ExpressionStatement') {
        call = statement.expression;
    }
    if (!call || call.type !== 'CallExpression') return null;
    const callee = call.callee;
    if (callee.type !== 'MemberExpression' || callee.object.type !== 'Identifier' || callee.object.name !== 'app') return null;
    if (propertyName(callee) !== 'newStage') return null;
    const arg = call.arguments[0];
    if (!arg || arg.type !== 'Literal' || typeof arg.value !== 'string') return null;
    return { name: arg.value, varName, nameNode: arg };
}

/** `object.property = value;`: {object, property, value}. */
function memberAssignment(statement) {
    if (statement.type !== 'ExpressionStatement') return null;
    const e = statement.expression;
    if (e.type !== 'AssignmentExpression' || e.operator !== '=') return null;
    const left = e.left;
    if (left.type !== 'MemberExpression' || left.object.type !== 'Identifier') return null;
    const property = propertyName(left);
    if (property == null) return null;
    return { object: left.object.name, property, value: e.right };
}

function propertyName(member) {
    if (!member.computed && member.property.type === 'Identifier') return member.property.name;
    if (member.computed && member.property.type === 'Literal') return String(member.property.value);
    return null;
}

/** A statement's stretch, with the comments just above it and the rest of its last line. */
function statementRange(source, node) {
    let start = node.start;
    // Comment lines right above it go with it.
    for (;;) {
        const lineStart = source.lastIndexOf('\n', start - 1) + 1;
        if (source.slice(lineStart, start).trim() !== '') break;
        const prevEnd = lineStart - 1;
        if (prevEnd < 0) { start = lineStart; break; }
        const prevStart = source.lastIndexOf('\n', prevEnd - 1) + 1;
        const prev = source.slice(prevStart, prevEnd).trim();
        if (/^\/\//.test(prev)) { start = prevStart; continue; }
        start = lineStart;
        break;
    }
    let end = node.end;
    const rest = /^[ \t]*(\/\/[^\n]*)?\r?\n?/.exec(source.slice(end));
    end += rest[0].length;
    return { start, end };
}

/**
 * The app in source, as the editor shows it:
 * - app: its settings and functions, [{name, kind, code, value?, ..., range, valueRange}]
 * - stages: [{name, varName, nameRange, declRange, props: [...], ranges: [...]}]
 * - other: the statements that are neither, [{code, range}]; otherStages: whether they make stages
 * - error: {message, line, column} if the source does not parse (and nothing else then).
 */
function model(source) {
    if (acorn == null) throw new Error('call ready() first');
    const out = { error: null, app: [], stages: [], other: [], stageHooks: STAGE_HOOKS, appHooks: APP_HOOKS };
    let program;
    try {
        program = acorn.parse(source, PARSE_OPTIONS);
    } catch (err) {
        out.error = { message: err.message, line: err.loc ? err.loc.line : 0, column: err.loc ? err.loc.column : 0 };
        return out;
    }
    const byVar = new Map();
    for (const statement of program.body) {
        const range = statementRange(source, statement);
        const declared = stageDeclaration(statement);
        if (declared) {
            const stage = {
                name: declared.name, varName: declared.varName,
                nameRange: { start: declared.nameNode.start, end: declared.nameNode.end },
                declRange: { start: statement.start, end: statement.end },
                props: [], ranges: [range],
            };
            out.stages.push(stage);
            if (declared.varName) byVar.set(declared.varName, stage);
            continue;
        }
        const assignment = memberAssignment(statement);
        if (assignment && assignment.object === 'app') {
            out.app.push({ name: assignment.property, ...describeValue(source, assignment.value), range, valueRange: { start: assignment.value.start, end: assignment.value.end } });
            continue;
        }
        if (assignment && byVar.has(assignment.object)) {
            const stage = byVar.get(assignment.object);
            stage.props.push({ name: assignment.property, ...describeValue(source, assignment.value), range, valueRange: { start: assignment.value.start, end: assignment.value.end } });
            stage.ranges.push(range);
            continue;
        }
        out.other.push({ code: source.slice(statement.start, statement.end), range });
    }
    // Stages that other code makes (in a loop, a function): jtree has them, the editor cannot list them.
    out.otherStages = out.other.some((o) => /\bnewStage\s*\(/.test(o.code));
    return out;
}

// --- Edits: each takes the source and returns it changed ----------------------------------------

function replace(source, range, text) {
    return source.slice(0, range.start) + text + source.slice(range.end);
}

/** Text as a template literal's source. */
function templateLiteral(text) {
    return '`' + String(text).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`';
}

/** Code indented by one step (4 spaces), each line. */
function indent(code, by = '    ') {
    return String(code).replace(/\r\n/g, '\n').split('\n').map((l) => (l.trim() === '' ? '' : by + l)).join('\n');
}

/**
 * A value's source from what the editor sends: {kind, value} for number, boolean, string, text
 * (a template literal, for screens), {kind: 'function', params, body}, or {kind: 'code', code}.
 */
function valueSource(v) {
    switch (v.kind) {
        case 'number': {
            const n = Number(v.value);
            if (!Number.isFinite(n)) fail('not a number: ' + v.value);
            return String(n);
        }
        case 'boolean': return v.value ? 'true' : 'false';
        case 'string': return "'" + String(v.value).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r/g, '\\r').replace(/\n/g, '\\n') + "'";
        case 'text': return templateLiteral('\n' + dedent(v.value) + '\n');
        case 'function': {
            const body = String(v.body || '').replace(/\s+$/, '');
            return 'function(' + (v.params || []).join(', ') + ') {\n' + (body ? indent(body) + '\n' : '') + '}';
        }
        case 'code': return String(v.code);
        default: fail('unknown kind of value: ' + v.kind);
    }
}

/** Where a new statement about the app goes: after the last app setting, or at the top. */
function appInsertAt(m) {
    if (m.app.length) return m.app[m.app.length - 1].range.end;
    const firstStage = m.stages[0];
    return firstStage ? firstStage.ranges[0].start : 0;
}

/** A variable name for a stage, from its name, not one of taken. */
function stageVariable(name, taken) {
    let base = String(name).replace(/[^\w$]+(.)?/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/^\d/, '_$&') || 'stage';
    base = base[0].toLowerCase() + base.slice(1) + 'Stage';
    let candidate = base;
    for (let i = 2; taken.has(candidate); i++) candidate = base + i;
    return candidate;
}

function newStageSource(name, varName) {
    return 'let ' + varName + ' = app.newStage(' + valueSource({ kind: 'string', value: name }) + ');\n' +
        varName + '.activeScreen = `\n    <p>' + String(name).replace(/[<&]/g, (c) => (c === '<' ? '&lt;' : '&amp;')) + '</p>\n`;\n';
}

function findStage(m, name) {
    const stage = m.stages.find((s) => s.name === name);
    if (stage == null) fail('no stage ' + JSON.stringify(name));
    return stage;
}

/** Every identifier in node that names a variable (not `x` in `a.x` or `{x: 1}`). */
function identifiers(node, out = []) {
    if (!node || typeof node.type !== 'string') return out;
    if (node.type === 'Identifier') out.push(node);
    for (const key of Object.keys(node)) {
        if (key === 'property' && node.type === 'MemberExpression' && !node.computed) continue;
        if (key === 'key' && /^(Property|MethodDefinition|PropertyDefinition)$/.test(node.type) && !node.computed && !node.shorthand) continue;
        const v = node[key];
        if (Array.isArray(v)) v.forEach((c) => identifiers(c, out));
        else if (v && typeof v === 'object') identifiers(v, out);
    }
    return out;
}

/** A screen of the stage (of the app, with no stage) that is HTML, or fails. */
function screenProp(m, stage, name) {
    const props = stage != null ? findStage(m, stage).props : m.app;
    const prop = props.find((p) => p.name === name);
    if (!prop) fail('there is no ' + name);
    if (prop.kind !== 'text') fail(name + ' is made by code: change it as code');
    return prop;
}

/** The stage's statements, end of the source first (to cut them without moving the others). */
const lastFirst = (ranges) => ranges.slice().sort((a, b) => b.start - a.start);

/**
 * The source with op done. Ops:
 * - {op: 'setAppProp', name, value}, {op: 'removeAppProp', name}
 * - {op: 'addStage', name, after?}, {op: 'renameStage', name, to}, {op: 'deleteStage', name}
 * - {op: 'moveStage', name, to} (to: the stage's new index)
 * - {op: 'setStageProp', stage, name, value}, {op: 'removeStageProp', stage, name}
 * - {op: 'editScreen', stage?, name, edit}: a screen of the stage (of the app, with no stage),
 *   changed by edit, as html.js's edit takes it; the rest of the screen stays as it was.
 * - {op: 'moveElement', from: {stage?, name, path}, to: {stage?, name, path?, where}}: an
 *   element of one screen moved to another place, in that screen or another one (where and path
 *   as html.js's moveTo takes them).
 * Values are as valueSource takes them.
 */
function apply(source, op) {
    return keepingLineEnds(source, (s) => applyToLF(s, op));
}

function applyToLF(source, op) {
    let m = model(source);
    if (m.error) fail('the app does not parse: ' + m.error.message);
    switch (op.op) {
        case 'setAppProp': {
            const prop = m.app.find((p) => p.name === op.name);
            const text = valueSource(op.value);
            if (prop) return replace(source, prop.valueRange, text);
            const at = appInsertAt(m);
            const before = at > 0 && source[at - 1] !== '\n' ? '\n' : '';
            return source.slice(0, at) + before + 'app.' + op.name + ' = ' + text + ';\n' + (m.app.length || !m.stages.length ? '' : '\n') + source.slice(at);
        }
        case 'removeAppProp': {
            const prop = m.app.find((p) => p.name === op.name);
            return prop ? replace(source, prop.range, '') : source;
        }
        case 'addStage': {
            const name = String(op.name || '').trim();
            if (!name) fail('a stage needs a name');
            if (m.stages.some((s) => s.name === name)) fail('there is already a stage ' + JSON.stringify(name));
            const taken = new Set(m.stages.map((s) => s.varName));
            const code = newStageSource(name, stageVariable(name, taken));
            const after = op.after != null ? findStage(m, op.after) : m.stages[m.stages.length - 1];
            let at = after ? Math.max(...after.ranges.map((r) => r.end)) : source.length;
            if (!after && m.other.length) at = Math.max(at, ...m.other.map((o) => o.range.end));
            const lead = at === 0 ? '' : source[at - 1] === '\n' ? '\n' : '\n\n';
            return source.slice(0, at) + lead + code + (at < source.length && after ? '\n' : '') + source.slice(at);
        }
        case 'renameStage': {
            const stage = findStage(m, op.name);
            const to = String(op.to || '').trim();
            if (!to) fail('a stage needs a name');
            if (to !== op.name && m.stages.some((s) => s.name === to)) fail('there is already a stage ' + JSON.stringify(to));
            source = replace(source, stage.nameRange, valueSource({ kind: 'string', value: to }));
            // A variable the editor named after the stage is named after its new name.
            const others = new Set(m.stages.filter((s) => s !== stage).map((s) => s.varName));
            if (stage.varName && stage.varName === stageVariable(op.name, others)) {
                const program = acorn.parse(source, PARSE_OPTIONS);
                const names = identifiers(program);
                const varName = stageVariable(to, new Set([...others, ...names.map((n) => n.name)]));
                for (const n of names.filter((x) => x.name === stage.varName).sort((a, b) => b.start - a.start)) source = replace(source, n, varName);
            }
            return source;
        }
        case 'deleteStage': {
            const stage = findStage(m, op.name);
            for (const r of lastFirst(stage.ranges)) source = replace(source, r, '');
            return source.replace(/\n{3,}/g, '\n\n');
        }
        case 'moveStage': {
            const stage = findStage(m, op.name);
            const from = m.stages.indexOf(stage);
            const to = Math.max(0, Math.min(m.stages.length - 1, Number(op.to)));
            if (to === from) return source;
            const ordered = stage.ranges.slice().sort((a, b) => a.start - b.start);
            const text = ordered.map((r) => source.slice(r.start, r.end)).join('').replace(/\s*$/, '\n');
            // Where it goes, measured before it is cut: before the stage now at its new place, or after it.
            const target = m.stages.filter((s) => s !== stage)[to > from ? to - 1 : to];
            const at = to > from ? Math.max(...target.ranges.map((r) => r.end)) : Math.min(...target.ranges.map((r) => r.start));
            const cut = (s) => { for (const r of lastFirst(ordered)) s = replace(s, r, ''); return s; };
            const removedBefore = ordered.filter((r) => r.end <= at).reduce((n, r) => n + r.end - r.start, 0);
            source = cut(source);
            const pos = at - removedBefore;
            const insert = to > from ? (source[pos - 1] === '\n' ? '\n' : '\n\n') + text : text + '\n';
            return (source.slice(0, pos) + insert + source.slice(pos)).replace(/\n{3,}/g, '\n\n');
        }
        case 'setStageProp': {
            let stage = findStage(m, op.stage);
            const text = valueSource(op.value);
            const prop = stage.props.find((p) => p.name === op.name);
            if (prop) return replace(source, prop.valueRange, text);
            if (!stage.varName) {
                // `app.newStage('x');` alone: give it a variable to set things on.
                const varName = stageVariable(stage.name, new Set(m.stages.map((s) => s.varName)));
                source = replace(source, stage.declRange, 'let ' + varName + ' = ' + source.slice(stage.declRange.start, stage.declRange.end));
                m = model(source);
                stage = findStage(m, op.stage);
            }
            const at = Math.max(...stage.ranges.map((r) => r.end));
            const lead = source[at - 1] === '\n' ? '' : '\n';
            return source.slice(0, at) + lead + stage.varName + '.' + op.name + ' = ' + text + ';\n' + source.slice(at);
        }
        case 'removeStageProp': {
            const stage = findStage(m, op.stage);
            const prop = stage.props.find((p) => p.name === op.name);
            return prop ? replace(source, prop.range, '') : source;
        }
        case 'editScreen': {
            const prop = screenProp(m, op.stage, op.name);
            return replace(source, prop.valueRange, templateLiteral(html.edit(prop.value, op.edit || {})));
        }
        case 'moveElement': {
            const from = op.from || {};
            const to = op.to || {};
            const same = (from.stage ?? null) === (to.stage ?? null) && from.name === to.name;
            if (same) return apply(source, { op: 'editScreen', stage: from.stage, name: from.name, edit: { do: 'moveTo', path: from.path, to: to.path, where: to.where } });
            // From one screen to another: put in there, then taken out here.
            const screen = screenProp(m, from.stage, from.name).value;
            const code = html.written(screen, html.nodeAt(html.parse(screen), from.path || []).node);
            screenProp(m, to.stage, to.name);
            const insert = to.path && to.path.length ? { do: 'insert', path: to.path, where: to.where, html: code } : { do: 'insert', html: code };
            source = apply(source, { op: 'editScreen', stage: to.stage, name: to.name, edit: insert });
            return apply(source, { op: 'editScreen', stage: from.stage, name: from.name, edit: { do: 'remove', path: from.path } });
        }
        default:
            fail('unknown edit: ' + op.op);
    }
}

/** A new app's source. */
function template(description) {
    return "app.description = " + valueSource({ kind: 'string', value: description || 'A new app.' }) + ";\n" +
        "app.numPeriods = 1;\n" +
        "app.groupSize = 1;\n\n" +
        newStageSource('decide', 'decideStage');
}

/** A jtree app's file: one the jtree dialect reads (.jtt, .js). */
function appFile(ctx, appPath) {
    const file = ctx.resolve(appPath);
    if (!/\.(jtt|js)$/i.test(file)) fail('not a jtree app (.jtt): ' + appPath);
    return file;
}

const actions = {
    /** {appPath} → {appPath, source, model} */
    async open({ appPath }, ctx) {
        await ready();
        const file = appFile(ctx, appPath);
        if (!fs.existsSync(file)) fail('there is no file ' + appPath);
        const source = fs.readFileSync(file, 'utf8');
        return { appPath: file, source, model: model(source) };
    },
    /** {source} → {model} */
    async model({ source }) {
        await ready();
        return { model: model(String(source)) };
    },
    /** {source, op} or {source, ops: [...]} → {source, model}: the source with the edits made. */
    async apply({ source, op, ops }) {
        await ready();
        let out = String(source);
        for (const o of ops || [op]) out = apply(out, o);
        return { source: out, model: model(out) };
    },
    /** {appPath, source} → {appPath}: writes the app. */
    async save({ appPath, source }, ctx) {
        const file = appFile(ctx, appPath);
        ctx.write(file, String(source));
        ctx.reload();
        return { appPath: file };
    },
    /** {appPath, description?} → {appPath, source, model}: a new app, written. */
    async create({ appPath, description }, ctx) {
        await ready();
        let file = ctx.resolve(appPath);
        if (!/\.(jtt|js)$/i.test(file)) file += '.jtt';
        if (fs.existsSync(file)) fail('there is already a file ' + path.basename(file));
        const source = template(description);
        ctx.write(file, source);
        ctx.reload();
        return { appPath: file, source, model: model(source) };
    },
};

module.exports = { ready, model, apply, template, valueSource, actions, STAGE_HOOKS, APP_HOOKS };
