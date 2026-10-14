const fs = require('fs-extra');
const path = require('path');
const runtime = require('../dialects/otree/runtime.js');
const { fail } = require('./util.js');

/*
 * oTree projects as jtree's oTree Studio editor (admin/otree, #/studio) shows them, after oTree
 * Studio: a project's session configs and settings (settings.py), and each app's constants,
 * Subsession, Group and Player fields, functions, pages (with their templates) and page sequence
 * (its __init__.py). Python reads the files (dialects/otree/python/otree_studio.py), saying where
 * each part is; an edit rewrites only that part, so code written by hand stays as it was, and the
 * app is still the oTree app it was, to run in oTree too.
 */

/** The studio's Python, once Python has started. */
async function py() {
    await runtime.start();
    return runtime.py.pyimport('otree_studio');
}

const appModel = async (source) => JSON.parse((await py()).model(String(source)));
const settingsModel = async (source) => JSON.parse((await py()).settings_model(String(source)));

// --- Edits on source -----------------------------------------------------------------------------

const splice = (source, start, end, text) => source.slice(0, start) + text + source.slice(end);

/** A statement's whole lines: from its line's start (if only spaces are before it) past its line end. */
function lines(source, r) {
    let start = r.start;
    const lineStart = source.lastIndexOf('\n', start - 1) + 1;
    if (source.slice(lineStart, start).trim() === '') start = lineStart;
    let end = r.end;
    const rest = /^[ \t]*(#[^\n]*)?(\r?\n|$)/.exec(source.slice(end));
    if (rest) end += rest[0].length;
    return { start, end };
}

/** Takes out the statement at r, with its lines, and blank lines after it that would double up. */
function cut(source, r, blankAfter = 0) {
    const { start, end } = lines(source, r);
    let e = end;
    for (let i = 0; i < blankAfter; i++) {
        const m = /^[ \t]*\r?\n/.exec(source.slice(e));
        if (!m) break;
        e += m[0].length;
    }
    return splice(source, start, e, '');
}

/** Code with each line indented by indent (blank lines left blank). */
const indentBy = (code, indent) => String(code).replace(/\r\n/g, '\n').split('\n').map((l) => (l.trim() === '' ? '' : indent + l)).join('\n');

/** Inserts lines (no trailing newline) as statements after the line r ends on. */
function insertAfter(source, r, text) {
    const { end } = lines(source, r);
    const lead = end > 0 && source[end - 1] !== '\n' ? '\n' : '';
    return splice(source, end, end, lead + text + '\n');
}

/** A statement in a class: replaces its `pass`, or goes after the last of afterRanges (else at the class's end). */
function addToClass(source, cls, text, afterRanges) {
    const body = indentBy(text, cls.indent);
    if (cls.passRange) return splice(source, ...Object.values(lines(source, cls.passRange)), body + '\n');
    const after = afterRanges.length ? afterRanges.reduce((a, b) => (a.end > b.end ? a : b)) : cls.range;
    return insertAfter(source, after, body);
}

const isName = (s) => /^[A-Za-z_]\w*$/.test(String(s || ''));

function fieldSource(name, f, indent) {
    const args = [...(f.posargs || []), ...(f.args || []).filter((a) => a.code !== '' && a.code != null).map((a) => a.name + '=' + a.code)];
    const one = name + ' = models.' + f.type + '(' + args.join(', ') + ')';
    if (indent.length + one.length <= 88 || !args.length) return one;
    return name + ' = models.' + f.type + '(\n    ' + args.join(',\n    ') + ',\n)';
}

function defSource(name, params, body, decorators = []) {
    const b = String(body || '').trim() === '' ? 'pass' : String(body).replace(/\s+$/, '');
    return [...decorators.map((d) => '@' + d), 'def ' + name + '(' + params.join(', ') + '):', indentBy(b, '    ')].join('\n');
}

/** Where top-level code of a kind goes: functions before the pages, pages before the page sequence. */
function topInsert(m, kind) {
    const last = (list) => (list.length ? list[list.length - 1].range : null);
    if (kind === 'function') return last(m.functions) || (m.pages[0] && { before: m.pages[0].range }) || (m.pageSequence && { before: m.pageSequence.range }) || null;
    return last(m.pages) || (m.pageSequence && { before: m.pageSequence.range }) || last(m.functions) || null;
}

function addTop(source, m, kind, text) {
    const at = topInsert(m, kind);
    if (at == null) return source.replace(/\s*$/, '') + '\n\n\n' + text + '\n';
    if (at.before) {
        const { start } = lines(source, at.before);
        return splice(source, start, start, text + '\n\n\n');
    }
    const { end } = lines(source, at);
    return splice(source, end, end, '\n\n' + text + '\n');
}

const findPage = (m, name) => m.pages.find((p) => p.name === name) || fail('no page ' + name);
const findModel = (m, name) => m.models[name] || fail('no class ' + name + ' in the app');

/**
 * The app's source with op done. Ops (code: Python source):
 * - {op: 'setConstant', name, code}, {op: 'removeConstant', name}
 * - {op: 'setField', model, name, field: {type, args: [{name, code}]}, to?}, {op: 'removeField', model, name}
 * - {op: 'setFunction', name, params, body}, {op: 'removeFunction', name}
 * - {op: 'addPage', name, kind: 'Page'|'WaitPage', after?}, {op: 'removePage', name}, {op: 'renamePage', name, to}
 * - {op: 'setPageSequence', names}
 * - {op: 'setPageAttr', page, name, code}, {op: 'removePageAttr', page, name}
 * - {op: 'setPageMethod', page, name, params, body}, {op: 'removePageMethod', page, name}
 */
async function apply(source, op) {
    const m = await appModel(source);
    if (m.error) fail('the app does not parse (line ' + m.error.line + '): ' + m.error.message);
    switch (op.op) {
        case 'setConstant': {
            if (!isName(op.name)) fail('a constant needs a name (letters, digits, _)');
            const c = m.constants || fail('the app has no class C (its constants)');
            const item = c.items.find((i) => i.name === op.name);
            if (item) return splice(source, item.valueRange.start, item.valueRange.end, op.code);
            return addToClass(source, c, op.name + ' = ' + op.code, c.items.map((i) => i.range));
        }
        case 'removeConstant': {
            const item = (m.constants?.items || []).find((i) => i.name === op.name);
            if (!item) return source;
            if (m.constants.items.length === 1 && !m.constants.other.length && !m.constants.docstring) return splice(source, ...Object.values(lines(source, item.range)), m.constants.indent + 'pass\n');
            return cut(source, item.range);
        }
        case 'setField': {
            const cls = findModel(m, op.model);
            const name = op.to || op.name;
            if (!isName(name)) fail('a field needs a name (letters, digits, _)');
            const existing = cls.fields.find((f) => f.name === op.name);
            if (op.to && op.to !== op.name && cls.fields.some((f) => f.name === op.to)) fail(op.model + ' already has a field ' + op.to);
            const text = fieldSource(name, op.field, cls.indent);
            if (existing) {
                const r = lines(source, existing.range);
                return splice(source, r.start, r.end, indentBy(text, cls.indent) + '\n');
            }
            return addToClass(source, cls, text, cls.fields.map((f) => f.range));
        }
        case 'removeField': {
            const cls = findModel(m, op.model);
            const f = cls.fields.find((x) => x.name === op.name);
            if (!f) return source;
            if (cls.fields.length === 1 && !cls.other.length && !cls.docstring) return splice(source, ...Object.values(lines(source, f.range)), cls.indent + 'pass\n');
            return cut(source, f.range);
        }
        case 'setFunction': {
            if (!isName(op.name)) fail('a function needs a name (letters, digits, _)');
            const fn = m.functions.find((f) => f.name === op.name);
            const text = defSource(op.name, op.params || [], op.body, fn ? fn.decorators : []);
            if (fn) {
                const r = lines(source, fn.range);
                return splice(source, r.start, r.end, text + '\n');
            }
            return addTop(source, m, 'function', text);
        }
        case 'removeFunction': {
            const fn = m.functions.find((f) => f.name === op.name);
            return fn ? cut(source, fn.range, 2) : source;
        }
        case 'addPage': {
            if (!isName(op.name)) fail('a page needs a name (letters, digits, _)');
            if (m.pages.some((p) => p.name === op.name) || m.functions.some((f) => f.name === op.name)) fail('there is already a ' + op.name);
            const kind = op.kind === 'WaitPage' ? 'WaitPage' : 'Page';
            let out = addTop(source, m, 'page', 'class ' + op.name + '(' + kind + '):\n    pass');
            const m2 = await appModel(out);
            const names = m2.pageSequence ? m2.pageSequence.names.slice() : [];
            const at = op.after != null && names.includes(op.after) ? names.indexOf(op.after) + 1 : names.length;
            names.splice(at, 0, op.name);
            return setSequence(out, m2, names);
        }
        case 'removePage': {
            const page = findPage(m, op.name);
            let out = cut(source, page.range, 2);
            const m2 = await appModel(out);
            return m2.pageSequence ? setSequence(out, m2, m2.pageSequence.names.filter((n) => n !== op.name)) : out;
        }
        case 'renamePage': {
            const page = findPage(m, op.name);
            if (!isName(op.to)) fail('a page needs a name (letters, digits, _)');
            if (m.pages.some((p) => p.name === op.to)) fail('there is already a page ' + op.to);
            const head = source.slice(page.range.start, page.range.end);
            const renamed = head.replace(new RegExp('^(\\s*class\\s+)' + op.name + '\\b'), '$1' + op.to);
            let out = splice(source, page.range.start, page.range.end, renamed);
            const m2 = await appModel(out);
            return m2.pageSequence ? setSequence(out, m2, m2.pageSequence.names.map((n) => (n === op.name ? op.to : n))) : out;
        }
        case 'setPageSequence':
            return setSequence(source, m, op.names);
        case 'setPageAttr': {
            const page = findPage(m, op.page);
            if (!isName(op.name)) fail('not a name: ' + op.name);
            const attr = page.attrs.find((a) => a.name === op.name);
            if (attr) return splice(source, attr.valueRange.start, attr.valueRange.end, op.code);
            return addToClass(source, page, op.name + ' = ' + op.code, page.attrs.map((a) => a.range));
        }
        case 'removePageAttr': {
            const page = findPage(m, op.page);
            const attr = page.attrs.find((a) => a.name === op.name);
            if (!attr) return source;
            if (page.attrs.length === 1 && !page.methods.length && !page.other.length && !page.docstring) return splice(source, ...Object.values(lines(source, attr.range)), page.indent + 'pass\n');
            return cut(source, attr.range);
        }
        case 'setPageMethod': {
            const page = findPage(m, op.page);
            if (!isName(op.name)) fail('not a name: ' + op.name);
            const method = page.methods.find((x) => x.name === op.name);
            const text = defSource(op.name, op.params || [], op.body, method ? method.decorators : ['staticmethod']);
            if (method) {
                const r = lines(source, method.range);
                return splice(source, r.start, r.end, indentBy(text, page.indent) + '\n');
            }
            // After the attributes and methods, with a blank line before it, as oTree's apps have them.
            return addToClass(source, page, (page.passRange ? '' : '\n') + text, [...page.attrs, ...page.methods, ...page.other].map((x) => x.range));
        }
        case 'removePageMethod': {
            const page = findPage(m, op.page);
            const method = page.methods.find((x) => x.name === op.name);
            if (!method) return source;
            if (page.methods.length === 1 && !page.attrs.length && !page.other.length && !page.docstring) return splice(source, ...Object.values(lines(source, method.range)), page.indent + 'pass\n');
            return cut(source, method.range, 1);
        }
        default:
            fail('unknown edit: ' + op.op);
    }
}

function setSequence(source, m, names) {
    for (const n of names) if (!isName(n)) fail('not a page: ' + n);
    const text = '[' + names.join(', ') + ']';
    if (m.pageSequence) return splice(source, m.pageSequence.valueRange.start, m.pageSequence.valueRange.end, text);
    return source.replace(/\s*$/, '') + '\n\n\npage_sequence = ' + text + '\n';
}

// --- Settings ------------------------------------------------------------------------------------

function configSource(entries, style, indent) {
    const inner = indent + '    ';
    if (style === 'literal') return '{\n' + entries.map((e) => inner + JSON.stringify(e.key) + ': ' + e.code + ',').join('\n') + '\n' + indent + '}';
    return 'dict(\n' + entries.map((e) => inner + e.key + '=' + e.code + ',').join('\n') + '\n' + indent + ')';
}

/**
 * The settings' source with op done:
 * - {op: 'setConfig', index, entries: [{key, code}]}, {op: 'addConfig', entries}, {op: 'removeConfig', index}
 * - {op: 'setSetting', name, code}, {op: 'removeSetting', name}
 */
async function applySettings(source, op) {
    const m = await settingsModel(source);
    if (m.error) fail('settings.py does not parse (line ' + m.error.line + '): ' + m.error.message);
    for (const e of op.entries || []) if (!isName(e.key)) fail('not a name: ' + e.key);
    switch (op.op) {
        case 'setConfig': {
            const c = (m.configs?.items || [])[op.index] || fail('no session config ' + op.index);
            return splice(source, c.range.start, c.range.end, configSource(op.entries, c.style || 'call', m.configs.indent));
        }
        case 'addConfig': {
            if (!m.configs) return source.replace(/\s*$/, '') + '\n\nSESSION_CONFIGS = [\n    ' + configSource(op.entries, 'call', '    ') + ',\n]\n';
            const items = m.configs.items;
            const indent = m.configs.indent;
            const text = configSource(op.entries, items[0]?.style || 'call', indent);
            if (!items.length) return splice(source, m.configs.valueRange.start, m.configs.valueRange.end, '[\n' + indent + text + ',\n]');
            const last = items[items.length - 1].range;
            const comma = /^\s*,/.exec(source.slice(last.end));
            const at = last.end + (comma ? comma[0].length : 0);
            return splice(source, at, at, (comma ? '' : ',') + '\n' + indent + text + ',');
        }
        case 'removeConfig': {
            const c = (m.configs?.items || [])[op.index] || fail('no session config ' + op.index);
            const comma = /^\s*,/.exec(source.slice(c.range.end));
            const r = lines(source, { start: c.range.start, end: c.range.end + (comma ? comma[0].length : 0) });
            return splice(source, r.start, r.end, '');
        }
        case 'setSetting': {
            if (!isName(op.name)) fail('not a name: ' + op.name);
            const s = m.settings.find((x) => x.name === op.name);
            if (s) return splice(source, s.valueRange.start, s.valueRange.end, op.code);
            return source.replace(/\s*$/, '') + '\n' + op.name + ' = ' + op.code + '\n';
        }
        case 'removeSetting': {
            const s = m.settings.find((x) => x.name === op.name);
            return s ? cut(source, s.range) : source;
        }
        default:
            fail('unknown edit: ' + op.op);
    }
}

// --- Templates -----------------------------------------------------------------------------------

const BLOCK = (name) => new RegExp('(\\{[{%]-?\\s*block\\s+' + name + '\\s*-?[}%]\\})([\\s\\S]*?)(\\{[{%]-?\\s*endblock\\s*-?[}%]\\})');

/** A page's template as the editor shows it: its title and content blocks, if it has them as oTree's do. */
function template(text) {
    const title = BLOCK('title').exec(text);
    const content = BLOCK('content').exec(text);
    if (!title || !content) return { text, title: null, content: null };
    const strip = (s) => s.replace(/^\s*\n/, '').replace(/\n\s*$/, '');
    const dedent = (s) => {
        const ls = strip(s).split('\n');
        const cut_ = Math.min(...ls.filter((l) => l.trim()).map((l) => /^[ \t]*/.exec(l)[0].length).concat([1e9]));
        return ls.map((l) => l.slice(cut_ === 1e9 ? 0 : cut_)).join('\n');
    };
    return { text, title: strip(title[2]).trim(), content: dedent(content[2]) };
}

/** A template with its title and content set: in the blocks it has, else a new oTree template. */
function withBlocks(text, title, content) {
    const body = '\n    ' + String(content).replace(/\r\n/g, '\n').split('\n').join('\n    ').replace(/[ \t]+\n/g, '\n') + '\n\n';
    if (text && BLOCK('title').test(text) && BLOCK('content').test(text)) {
        // Only a block that changed is written again; the rest stays as it was written.
        const before = template(text);
        let out = text;
        if (before.title !== String(title).trim()) out = out.replace(BLOCK('title'), (m, a, b, c) => a + '\n    ' + title + '\n' + c);
        if (before.content !== String(content).replace(/\r\n/g, '\n')) out = out.replace(BLOCK('content'), (m, a, b, c) => a + '\n' + body + c);
        return out;
    }
    return '{{ block title }}\n    ' + title + '\n{{ endblock }}\n{{ block content }}\n' + body + '{{ endblock }}\n';
}

// --- Files ---------------------------------------------------------------------------------------

/** The projects (folders with an oTree settings.py) and apps in the app folders. */
function scan(roots) {
    const projects = [];
    const loose = [];
    const seen = new Set();
    const isApp = (dir) => ['__init__.py', 'models.py'].some((f) => {
        try { return /\bfrom\s+otree\.api\s+import\b|\bimport\s+otree\.api\b/.test(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { return false; }
    });
    const appInfo = (dir) => ({ name: path.basename(dir), dir, format: fs.existsSync(path.join(dir, '__init__.py')) && isAppFile(path.join(dir, '__init__.py')) ? 'current' : 'old' });
    const isAppFile = (f) => { try { return /otree\.api/.test(fs.readFileSync(f, 'utf8')); } catch (e) { return false; } };
    const walk = (dir, depth) => {
        let entries;
        try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
        const settings = path.join(dir, 'settings.py');
        if (entries.some((e) => e.name === 'settings.py') && /\bSESSION_CONFIGS\b/.test(fs.readFileSync(settings, 'utf8'))) {
            const apps = entries.filter((e) => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.') && isApp(path.join(dir, e.name)))
                .map((e) => appInfo(path.join(dir, e.name))).sort((a, b) => a.name.localeCompare(b.name));
            apps.forEach((a) => seen.add(a.dir));
            projects.push({ name: path.basename(dir), dir, settingsPath: settings, apps });
        }
        if (depth >= 5) return;
        for (const e of entries) {
            if (!e.isDirectory() || e.name.startsWith('.') || e.name === 'node_modules' || e.name === '__pycache__') continue;
            const sub = path.join(dir, e.name);
            if (!seen.has(sub) && isApp(sub) && !fs.existsSync(path.join(dir, 'settings.py'))) loose.push(appInfo(sub));
            walk(sub, depth + 1);
        }
    };
    roots.forEach((r) => walk(r, 0));
    return { projects: projects.sort((a, b) => a.dir.localeCompare(b.dir)), apps: loose.filter((a) => !seen.has(a.dir)) };
}

/** A new app's __init__.py, as oTree Studio starts one. */
function appTemplate(name) {
    return `from otree.api import *


doc = """
Your app description
"""


class C(BaseConstants):
    NAME_IN_URL = '${name}'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    pass


# PAGES
class MyPage(Page):
    pass


class ResultsWaitPage(WaitPage):
    pass


class Results(Page):
    pass


page_sequence = [MyPage, ResultsWaitPage, Results]
`;
}

const SETTINGS_TEMPLATE = `from os import environ

SESSION_CONFIGS = [
]

# if you set a property in SESSION_CONFIG_DEFAULTS, it will be inherited by all configs
# in SESSION_CONFIGS, except those that explicitly override it.
# the session config can be accessed from methods in your apps as self.session.config,
# e.g. self.session.config['participation_fee']

SESSION_CONFIG_DEFAULTS = dict(
    real_world_currency_per_point=1.00, participation_fee=0.00, doc=""
)

PARTICIPANT_FIELDS = []
SESSION_FIELDS = []

# ISO-639 code
# for example: de, fr, ja, ko, zh-hans
LANGUAGE_CODE = 'en'

# e.g. EUR, GBP, CNY, JPY
REAL_WORLD_CURRENCY_CODE = 'USD'
USE_POINTS = True

ADMIN_USERNAME = 'admin'
# for security, best to set admin password in an environment variable
ADMIN_PASSWORD = environ.get('OTREE_ADMIN_PASSWORD')

DEMO_PAGE_INTRO_HTML = """ """

SECRET_KEY = '${'{SECRET}'}'
`;

/** The page templates in an app's folder, by page name. */
function templates(dir, pages) {
    const out = {};
    for (const p of pages) {
        const file = path.join(dir, p.name + '.html');
        if (fs.existsSync(file)) out[p.name] = template(fs.readFileSync(file, 'utf8'));
    }
    return out;
}

function appDir(ctx, dir) {
    const d = ctx.resolve(dir);
    if (!fs.existsSync(path.join(d, '__init__.py')) && !fs.existsSync(path.join(d, 'models.py'))) fail('not an oTree app: ' + dir);
    return d;
}

const actions = {
    /** {} → {projects, apps}: what the studio lists. */
    async list(body, ctx) {
        return scan(ctx.roots());
    },
    /** {settingsPath} → {settingsPath, source, model} */
    async openProject({ settingsPath }, ctx) {
        const file = ctx.resolve(settingsPath);
        if (path.basename(file) !== 'settings.py' || !fs.existsSync(file)) fail('not a project\'s settings.py: ' + settingsPath);
        const source = fs.readFileSync(file, 'utf8');
        return { settingsPath: file, source, model: await settingsModel(source) };
    },
    /** {dir} → {dir, name, format, source, model, templates}: an app; one in oTree's older format (models.py) has no model. */
    async openApp({ dir }, ctx) {
        const d = appDir(ctx, dir);
        const init = path.join(d, '__init__.py');
        if (!fs.existsSync(init) || fs.existsSync(path.join(d, 'models.py'))) {
            return { dir: d, name: path.basename(d), format: 'old', source: null, model: null, templates: {} };
        }
        const source = fs.readFileSync(init, 'utf8');
        const model = await appModel(source);
        return { dir: d, name: path.basename(d), format: 'current', source, model, templates: model.error ? {} : templates(d, model.pages) };
    },
    /** {source} → {model} */
    async model({ source }) {
        return { model: await appModel(source) };
    },
    /** {source, op | ops} → {source, model} */
    async apply({ source, op, ops }) {
        let out = String(source);
        for (const o of ops || [op]) out = await apply(out, o);
        return { source: out, model: await appModel(out) };
    },
    /** {source, op | ops} → {source, model}, for settings.py */
    async applySettings({ source, op, ops }) {
        let out = String(source);
        for (const o of ops || [op]) out = await applySettings(out, o);
        return { source: out, model: await settingsModel(out) };
    },
    /** {source} → {model}, for settings.py */
    async settingsModel({ source }) {
        return { model: await settingsModel(source) };
    },
    /**
     * {dir, source, templates: {Page: {title, content} | {text} | null}} → {dir}: writes the app's
     * __init__.py and its pages' templates (null: the template goes).
     */
    async saveApp({ dir, source, templates: pages = {} }, ctx) {
        const d = appDir(ctx, dir);
        const error = (await py()).check(String(source));
        if (error) fail('__init__.py does not parse, ' + error);
        ctx.write(path.join(d, '__init__.py'), String(source));
        for (const [name, t] of Object.entries(pages)) {
            if (!isName(name)) fail('not a page: ' + name);
            const file = path.join(d, name + '.html');
            if (t == null) { fs.removeSync(file); continue; }
            const text = t.text != null && t.title == null ? t.text : withBlocks(fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '', t.title || '', t.content || '');
            ctx.write(file, text);
        }
        ctx.reload();
        return { dir: d };
    },
    /** {settingsPath, source} → {settingsPath} */
    async saveProject({ settingsPath, source }, ctx) {
        const file = ctx.resolve(settingsPath);
        if (path.basename(file) !== 'settings.py') fail('not a settings.py: ' + settingsPath);
        const error = (await py()).check(String(source));
        if (error) fail('settings.py does not parse, ' + error);
        ctx.write(file, String(source));
        ctx.reload();
        return { settingsPath: file };
    },
    /** {projectDir, name} → what openApp gives: a new app in a project, as oTree Studio starts one. */
    async createApp({ projectDir, name }, ctx) {
        if (!/^[a-z_][a-z0-9_]*$/.test(String(name || ''))) fail('an app\'s name is lower case letters, digits and _, as a Python package\'s');
        const d = path.join(ctx.resolve(projectDir), name);
        if (fs.existsSync(d)) fail('there is already a folder ' + name);
        ctx.write(path.join(d, '__init__.py'), appTemplate(name));
        ctx.write(path.join(d, 'MyPage.html'), withBlocks('', 'Page title', ''));
        ctx.write(path.join(d, 'Results.html'), withBlocks('', 'Results', ''));
        ctx.reload();
        return actions.openApp({ dir: d }, ctx);
    },
    /** {name} → {settingsPath, dir}: a new project (a folder with a settings.py) in the first app folder. */
    async createProject({ name }, ctx) {
        if (!/^[A-Za-z_][\w-]*$/.test(String(name || ''))) fail('a project\'s name is letters, digits, - and _');
        const d = ctx.resolve(name);
        if (fs.existsSync(d)) fail('there is already a folder ' + name);
        const secret = require('crypto').randomBytes(16).toString('hex');
        ctx.write(path.join(d, 'settings.py'), SETTINGS_TEMPLATE.replace('{SECRET}', secret));
        ctx.write(path.join(d, 'requirements.txt'), 'otree>=5.4.0\n');
        ctx.reload();
        return { settingsPath: path.join(d, 'settings.py'), dir: d };
    },
};

module.exports = { apply, applySettings, appModel, settingsModel, template, withBlocks, scan, appTemplate, actions };
