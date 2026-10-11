/*
 * z-Tree's text export (File → Export → Treatment…): a treatment as nested blocks,
 *
 *     treatment "pg.ztt"{
 *         background{ table globals{ } … numsubjects = 2; … program{ table = subjects; do{ … } } screen action{ … } }
 *         stage "Contribution Entry"{ startwaitforall = TRUE; … screen action{ standardbox "Standard"{ item{ … } button "OK"{ … } } } }
 *         roles{ role "S 1"{ } }
 *         period "1"{ subject 1{ name = ""; group = 1; } }
 *     }
 *
 * read into the same treatment as ztt.js reads from a .ztt file (so the runtime, the screens and
 * the converter take either). Texts are Windows-1252, strings C-escaped (\" \\ \r \n), values
 * unquoted where they are expressions or names (max = Endowment; hasframe = TRUE; top = 10%;).
 * GIMS (Palan 2015) is published in this form.
 */

const { decode } = require('./ztt.js');

class ZtextError extends Error {}

/** The text, as a tree of blocks: {kind, name, entries: {key: value}, blocks: [...], code (a do block's)}. */
function parse(text) {
    let i = 0;
    const n = text.length;
    const fail = (message) => {
        const line = text.slice(0, i).split('\n').length;
        throw new ZtextError(message + ' (line ' + line + ')');
    };
    const space = () => {
        for (;;) {
            while (i < n && /\s/.test(text[i])) i++;
            if (text.startsWith('//', i)) { while (i < n && text[i] !== '\n') i++; continue; }
            if (text.startsWith('/*', i)) { const e = text.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
            return;
        }
    };
    const string = () => {
        // From an opening quote: the string, unescaped.
        let out = '';
        i++;
        while (i < n && text[i] !== '"') {
            // A line break in the string: the export indents the next line with tabs, not the text's own.
            if (text[i] === '\n') {
                out += '\n';
                i++;
                while (text[i] === '\t') i++;
                continue;
            }
            if (text[i] === '\\' && i + 1 < n) {
                const c = text[i + 1];
                out += { n: '\n', r: '\r', t: '\t' }[c] || c;
                i += 2;
            } else out += text[i++];
        }
        if (i >= n) fail('a string does not end');
        i++;
        return out;
    };
    const word = () => {
        const m = /^[A-Za-z_][\w]*/.exec(text.slice(i, i + 200));
        if (m == null) fail('expected a name');
        i += m[0].length;
        return m[0];
    };
    /** A value: a string (unescaped), or the text up to the ; (an expression, a name, 10%, TRUE). */
    const value = () => {
        space();
        if (text[i] === '"') {
            const s = string();
            space();
            // "a" "b": strings in a row are one.
            let more = s;
            while (text[i] === '"') { more += string(); space(); }
            if (text[i] !== ';') fail('expected ; after a value');
            i++;
            return { string: more };
        }
        const start = i;
        let depth = 0;
        while (i < n) {
            const c = text[i];
            if (c === '"') { string(); continue; }
            if (c === '(' || c === '[') depth++;
            else if (c === ')' || c === ']') depth--;
            else if (c === ';' && depth <= 0) break;
            i++;
        }
        const raw = text.slice(start, i).trim();
        i++;
        return { raw };
    };
    /** A do block's code: from its {, to the matching }, strings and comments taken as they are. */
    const code = () => {
        if (text[i] !== '{') fail('expected {');
        const start = ++i;
        let depth = 1;
        while (i < n) {
            const c = text[i];
            if (c === '"') { string(); continue; }
            if (text.startsWith('//', i)) { while (i < n && text[i] !== '\n') i++; continue; }
            if (text.startsWith('/*', i)) { const e = text.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
            if (c === '{') depth++;
            else if (c === '}' && --depth === 0) break;
            i++;
        }
        if (i >= n) fail('a do block does not end');
        const body = text.slice(start, i);
        i++;
        return body;
    };
    const block = (kind, name) => {
        const out = { kind, name, entries: {}, blocks: [], values: null };
        for (;;) {
            space();
            if (i >= n) fail('the block ' + kind + ' does not end');
            if (text[i] === '}') { i++; return out; }
            // A list of strings (a scale's texts: texts{"left";"right";}).
            if (text[i] === '"') {
                out.values = out.values || [];
                out.values.push(string());
                space();
                if (text[i] === ';') i++;
                continue;
            }
            const key = word();
            space();
            if (text[i] === '=') {
                i++;
                out.entries[key] = value();
                continue;
            }
            let blockName = null;
            if (text[i] === '"') blockName = string();
            else if (/[\w-]/.test(text[i])) { const m = /^[\w.-]+/.exec(text.slice(i)); blockName = m[0]; i += m[0].length; }
            space();
            if (key === 'do') {
                out.blocks.push({ kind: 'do', code: code() });
                continue;
            }
            if (text[i] !== '{') fail('expected { or = after ' + key);
            i++;
            out.blocks.push(block(key, blockName));
        }
    };
    space();
    const kind = word();
    space();
    const name = text[i] === '"' ? string() : null;
    space();
    if (text[i] !== '{') fail('expected {');
    i++;
    return block(kind, name);
}

// --- The tree, as ztt.js's treatment -------------------------------------------------------------

/** An entry's text: a string's, or the raw value's (as it is written), '' if missing. */
const str = (b, key) => {
    const v = b.entries[key];
    if (v == null) return '';
    return v.string != null ? v.string : v.raw;
};
/** z-Tree writes \r\n in texts; the binary file has \r\n too, which the readers keep as \n. */
const text = (b, key) => str(b, key).replace(/\r\n/g, '\n');
const bool = (b, key) => /^true$/i.test(str(b, key));
const num = (b, key, otherwise = 0) => {
    const v = Number(str(b, key));
    return Number.isFinite(v) ? v : otherwise;
};
const children = (b, kind) => b.blocks.filter((c) => c.kind === kind);

/** A program: its table, owner, condition, and code. */
function program(p) {
    const doBlock = p.blocks.find((c) => c.kind === 'do');
    return { table: str(p, 'table'), owner: str(p, 'ownervariable'), condition: text(p, 'condition'), code: doBlock ? normalizeCode(doBlock.code) : '' };
}

/** Code as the binary file has it: the export's indentation (tabs to the block's depth) taken out. */
function normalizeCode(code) {
    const lines = code.replace(/\r\n/g, '\n').split('\n');
    // The first line follows the {; the others are indented by the export.
    const rest = lines.slice(1).filter((l) => l.trim() !== '');
    const indent = rest.length ? Math.min(...rest.map((l) => /^\t*/.exec(l)[0].length)) : 0;
    const out = lines.map((l, k) => (k === 0 ? l : l.slice(Math.min(indent, /^\t*/.exec(l)[0].length))));
    // The export ends the code with a line break and the closing brace's indentation.
    while (out.length && out[out.length - 1].trim() === '') out.pop();
    while (out.length && out[0].trim() === '') out.shift();
    return out.length ? out.join('\n') + '\n' : '';
}

const BOX_TYPES = {
    standardbox: 'standard', headerbox: 'header', helpbox: 'help', containerbox: 'container',
    makecontractbox: 'contractCreation', selectcontractbox: 'contractList', historybox: 'history',
    gridbox: 'grid', chatterbox: 'chat', calulatorbox: 'calculator', calculatorbox: 'calculator', plotbox: 'plot',
};

/**
 * A box's placement flags, as ztt.js has them (options[1..7]; see render.js's place): whether
 * the box takes its part of the room from the left, right, top or bottom of what is left.
 */
function boxOptions(b) {
    const o = [0, 0, 0, 0, 0, 0, 0, 0];
    if (bool(b, 'cutleft')) o[1] = 1;
    if (bool(b, 'cutright')) o[3] = 1;
    if (bool(b, 'cuttop')) o[5] = 1;
    if (bool(b, 'cutbottom')) o[7] = 1;
    return o;
}

function item(b) {
    return {
        kind: 'item', label: text(b, 'label'), variable: str(b, 'variable'), input: bool(b, 'input'),
        min: str(b, 'min'), max: str(b, 'max'), layout: text(b, 'format'),
    };
}

function button(b) {
    // terminatestage: it ends the stage; donotterminatestage: it does not; neither: as its box's kind has it.
    const leaveStage = bool(b, 'terminatestage') ? true : bool(b, 'donotterminatestage') ? false : undefined;
    const out = {
        name: b.name || '',
        checkers: children(b, 'checker').map((c) => ({ kind: 'checker', condition: text(c, 'condition'), message: text(c, 'message') })),
        programs: children(b, 'program').map(program),
    };
    if (leaveStage !== undefined) out.leaveStage = leaveStage;
    // Its own colour (a Windows COLORREF: 0x00BBGGRR), if it has one.
    if (bool(b, 'specialbuttoncolor')) {
        const c = num(b, 'buttoncolor');
        out.color = 'rgb(' + (c & 255) + ',' + ((c >> 8) & 255) + ',' + ((c >> 16) & 255) + ')';
    }
    return out;
}

const PLOT_ITEMS = { plotpoint: 'point', plotline: 'line', plotrect: 'rect', plotpie: 'pie', plottext: 'text', plotaxis: 'axis', plotgraph: 'graph', plotinput: 'input' };

/** A plot input: its action NEW (0, a click makes a record), SELECT (1) or DRAG (2); a drag's start and end in dragsnap*. */
function plotInput(b) {
    return {
        kind: 'input', name: b.name || '', condition: text(b, 'displaycondition') || text(b, 'condition'), count: 0, inputs: [],
        programs: children(b, 'program').map(program), action: { NEW: 0, SELECT: 1, DRAG: 2 }[str(b, 'action').toUpperCase()] ?? num(b, 'action'),
        table: str(b, 'table') || 'subjects', xVar: str(b, 'xvariable'), yVar: str(b, 'yvariable'),
        x0Var: str(b, 'dragsnapx0'), y0Var: str(b, 'dragsnapy0'), x1Var: str(b, 'dragsnapx'), y1Var: str(b, 'dragsnapy'),
        // (Only if it leaves the stage: the binary files are not read for it.)
        ...(bool(b, 'leavestage') ? { leaveStage: true } : {}),
    };
}

function plotItem(b) {
    const kind = PLOT_ITEMS[b.kind];
    if (kind === 'input') return plotInput(b);
    const out = { kind, name: b.name || '', condition: text(b, 'displaycondition') || text(b, 'condition'), count: 0, inputs: children(b, 'plotinput').map(plotInput) };
    const s = (key) => str(b, key);
    switch (kind) {
        case 'point':
            Object.assign(out, { x: s('x'), y: s('y'), size: s('size'), corners: s('numedges'), rotation: s('startat'), spokes: bool(b, 'isstar'),
                lineColor: s('linecolor'), lineWidth: s('linewidth'), fillColor: s('fillcolor') });
            break;
        case 'line':
            Object.assign(out, { x1: s('x1'), y1: s('y1'), x2: s('x2'), y2: s('y2'), arrowStart: s('arrowsize1'), arrowWidth: s('arrowwidth'),
                arrowEnd: s('arrowsize2'), arrowFilled: bool(b, 'arrowclosed'), lineColor: s('linecolor'), lineWidth: s('linewidth') });
            break;
        case 'rect':
            Object.assign(out, { xLeft: s('left'), xRight: s('right'), xCenter: s('x'), width: s('width'), yBottom: s('bottom'), yTop: s('top'),
                yCenter: s('y'), height: s('height'), lineColor: s('linecolor'), lineWidth: s('linewidth'), fillColor: s('fillcolor') });
            break;
        case 'pie':
            Object.assign(out, { x: s('x'), y: s('y'), rx: s('xradius'), ry: s('yradius'), angleStart: s('anglestart'), angleEnd: s('anglesize'),
                lineColor: s('linecolor'), lineWidth: s('linewidth'), fillColor: s('fillcolor') });
            break;
        case 'text':
            // As a .ztt file has them: horizontal LEFT 0, CENTER 1, RIGHT 2; vertical TOP 0, CENTER 2, BOTTOM 3.
            Object.assign(out, { x: s('x'), y: s('y'), text: text(b, 'text'), hAlign: { LEFT: 0, CENTER: 1, RIGHT: 2 }[s('horizontalalignment').toUpperCase()] ?? 1,
                vAlign: { TOP: 0, CENTER: 2, BOTTOM: 3 }[s('verticalalignment').toUpperCase()] ?? 2,
                color: s('textcolor'), fontSize: s('fontsize') });
            break;
        case 'axis':
            Object.assign(out, { horizontal: !/^y/i.test(s('axis')), position: s('position'), from: s('from'), to: s('to'), tickStep: s('tickdistance'),
                labelStep: s('datalabeldistance'), labelLayout: text(b, 'datalabelformat'), caption: text(b, 'caption'), lineColor: s('linecolor'), lineWidth: s('linewidth') });
            break;
        case 'graph':
            // A graph's inputs are among its items (its records' items take them).
            Object.assign(out, { items: b.blocks.filter((c) => PLOT_ITEMS[c.kind]).map(plotItem), table: s('table') || 'globals',
                graphCondition: text(b, 'condition'), lineColor: s('connectioncolor'), lineWidth: s('connectionwidth') });
            out.condition = '';
            out.inputs = [];
            break;
        default:
    }
    return out;
}

function box(b) {
    const type = BOX_TYPES[b.kind] || 'unknown';
    const out = {
        type, name: b.name || '',
        items: children(b, 'item').map(item),
        buttons: children(b, 'button').map(button),
        boxes: b.blocks.filter((c) => BOX_TYPES[c.kind]).map(box),
        programs: children(b, 'program').map(program),
        frame: bool(b, 'hasframe'), options: boxOptions(b), condition: text(b, 'displaycondition'),
        left: str(b, 'left'), right: str(b, 'right'), width: str(b, 'width'), top: str(b, 'top'), bottom: str(b, 'bottom'), height: str(b, 'height'),
    };
    switch (type) {
        case 'header':
            out.texts = { period: text(b, 'periodtext'), of: text(b, 'periodoftext'), trial: text(b, 'practiceperiodprefix'), time: text(b, 'timestr'), timeout: text(b, 'pleasedecidetext') };
            break;
        case 'help':
            out.title = text(b, 'label');
            out.text = text(b, 'help');
            break;
        case 'contractList':
            Object.assign(out, { table: str(b, 'table') || 'contracts', tableCondition: text(b, 'condition'), sorting: text(b, 'sortfields'), owner: str(b, 'ownervariable') });
            break;
        case 'contractCreation':
            out.table = str(b, 'table') || 'contracts';
            break;
        case 'history':
            out.table = 'subjects';
            break;
        case 'grid':
            out.table = 'contracts';
            break;
        case 'chat':
            Object.assign(out, { table: str(b, 'table') || 'contracts', variable: str(b, 'inputvariable'), condition2: text(b, 'condition'),
                outputs: str(b, 'outputtext') ? [text(b, 'outputtext')] : [] });
            break;
        case 'plot':
            out.range = { xLeft: str(b, 'xleft'), xRight: str(b, 'xright'), yBottom: str(b, 'ybottom'), yTop: str(b, 'ytop') };
            out.keepAspect = bool(b, 'maintainaspectratio');
            out.plotItems = b.blocks.filter((c) => PLOT_ITEMS[c.kind]).map(plotItem);
            break;
        default:
    }
    return out;
}

/** A stage's (or the background's) screen: its boxes. */
function screen(stage, which) {
    const s = children(stage, 'screen').find((c) => c.name === which);
    return s == null ? [] : s.blocks.filter((c) => BOX_TYPES[c.kind]).map(box);
}

/** The treatment in a text export (a Buffer, Windows-1252, or a string). */
function readTextTreatment(input) {
    const source = typeof input === 'string' ? input : decode(input);
    const root = parse(source.replace(/^﻿/, ''));
    if (root.kind !== 'treatment') throw new ZtextError('not a z-Tree treatment export (it starts with ' + root.kind + ')');
    const bg = children(root, 'background')[0] || { entries: {}, blocks: [] };
    const actionScreen = (s) => children(s, 'screen').find((c) => c.name === 'action');
    const stages = children(root, 'stage').map((s) => {
        const action = actionScreen(s);
        // As a z-Tree 3 file has them: options[0] bit 0, it starts as each subject gets there (not
        // waiting for all); bit 2, it is left after its timeout always (an auction), not only if
        // there is no input; options[6], it shows the background's boxes.
        const options = [(bool(s, 'startwaitforall') ? 0 : 1) | (str(s, 'timeouttype') === 'always' ? 4 : 0), 0, 0, 0, 0, 0, action == null || bool(action, 'usesbg') ? 1 : 0, 0];
        return {
            name: s.name || '', programs: children(s, 'program').map(program), timeout: str(s, 'timeout'), options,
            showHeader: action == null ? true : bool(action, 'usesbg'),
            startIfPossible: !bool(s, 'startwaitforall'), timeoutAlways: str(s, 'timeouttype') === 'always',
            timeoutType: str(s, 'timeouttype'), startCondition: text(s, 'startConditionStr'),
            active: screen(s, 'action'), waiting: screen(s, 'wait'),
            loaders: children(s, 'tableloader').map((c) => ({ condition: text(c, 'condition'), file: text(c, 'inputreplacefilename') })),
            dumpers: children(s, 'tabledumper').map((c) => ({ condition: text(c, 'condition'), file: text(c, 'outputfilename'), tables: text(c, 'tabledescriptions') })),
        };
    });
    const roles = children(children(root, 'roles')[0] || { blocks: [] }, 'role');
    const subjects = roles.map((r, index) => ({ name: r.name || '', index, program: (r.blocks.find((c) => c.kind === 'do') || {}).code ? normalizeCode(r.blocks.find((c) => c.kind === 'do').code) : '' }));
    const periodBlocks = children(root, 'period');
    const periods = periodBlocks.map((p) => ({ name: p.name || '', program: (p.blocks.find((c) => c.kind === 'do') || {}).code ? normalizeCode(p.blocks.find((c) => c.kind === 'do').code) : '' }));
    const params = [];
    for (const p of periodBlocks) {
        for (const c of children(p, 'subject')) {
            const d = c.blocks.find((x) => x.kind === 'do');
            params.push({ label: text(c, 'name'), group: num(c, 'group', 1), program: d ? normalizeCode(d.code) : '' });
        }
    }
    return {
        version: 'text',
        tables: children(bg, 'table').map((t) => ({ name: t.name, lifetime: str(t, 'lifetime'), execute: str(t, 'execute') })),
        background: {
            name: 'Background', programs: children(bg, 'program').map(program), timeout: '', options: [],
            showHeader: true, startIfPossible: false, timeoutAlways: false, active: screen(bg, 'action'), waiting: screen(bg, 'wait'),
            loaders: children(bg, 'tableloader').map((c) => ({ condition: text(c, 'condition'), file: text(c, 'inputreplacefilename') })),
        },
        stages, periods, subjects, params,
        numSubjects: num(bg, 'numsubjects', subjects.length), numGroups: num(bg, 'numgroups', 1),
        practicePeriods: num(bg, 'numpracticeperiods'),
        texts: ['showupfeeawaytext', 'showupfeeawayyestext', 'showupfeeawaynotext', 'moneyawaytext', 'moneyawayyestext', 'moneyawaynotext', 'bancruptwaittext'].map((k) => text(bg, k)),
        warnings: [],
    };
}

/** Questionnaires in a text export, as ztq.js reads them from a .ztq: {version, questionnaires: [{name, title, items, buttons}]}. */
function readTextQuestionnaires(input) {
    const source = typeof input === 'string' ? input : decode(input);
    const root = parse(source.replace(/^\uFEFF/, ''));
    if (root.kind !== 'questionnaires') throw new ZtextError('not a z-Tree questionnaires export (it starts with ' + root.kind + ')');
    return {
        version: 'text',
        questionnaires: children(root, 'questionnaire').map((q) => ({
            name: q.name || '', title: text(q, 'title'),
            items: children(q, 'item').map((it) => {
                const item = { label: text(it, 'label'), type: str(it, 'type'), variable: str(it, 'variable') };
                if (item.variable) {
                    Object.assign(item, { min: num(it, 'min'), max: num(it, 'max'), step: num(it, 'inc'), layout: num(it, 'numtextlines') });
                    const texts = it.blocks.find((c) => c.kind === 'texts');
                    item.labels = ((texts && texts.values) || []).map((l) => l.trim()).filter(Boolean);
                }
                return item;
            }),
            buttons: children(q, 'button').map((b) => ({ name: b.name || text(b, 'name') })),
        })),
        warnings: [],
    };
}

/** Whether buf (a file's start) is a z-Tree text export: a treatment or questionnaires. */
function isText(buf) {
    const head = (typeof buf === 'string' ? buf : buf.slice(0, 64).toString('latin1')).replace(/^﻿|^\xEF\xBB\xBF/, '').trimStart();
    return /^(treatment|questionnaires)\s*("|\{)/.test(head);
}

/** Whether the file at path is a z-Tree text export (its first bytes say so). */
function isTextFile(file) {
    const fs = require('fs');
    let fd;
    try {
        fd = fs.openSync(file, 'r');
        const buf = Buffer.alloc(64);
        const n = fs.readSync(fd, buf, 0, 64, 0);
        return isText(buf.subarray(0, n));
    } catch (err) {
        return false;
    } finally {
        if (fd != null) fs.closeSync(fd);
    }
}

module.exports = { parse, readTextTreatment, readTextQuestionnaires, isText, isTextFile, normalizeCode, ZtextError };
