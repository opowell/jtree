const vm = require('vm');
const Utils = require('../Utils.js');

/*
 * The app description (IR): a plain, JSON-serialisable description of an app, which every
 * dialect's importer produces and from which jtree builds an App (applyIR). jtree apps can
 * be described as one too (appToIR). See plans/ztree-otree-dialects.md §2.1.
 *
 * @typedef {Object} AppIR
 * @property {1} ir                       Version of this format.
 * @property {string} [dialect]           Where the app came from: 'jtree', 'ztree', 'otree', ...
 * @property {string} [title]
 * @property {string} [description]
 * @property {number} [numPeriods]
 * @property {number} [groupSize]
 * @property {number} [numGroups]
 * @property {string} [groupMatchingType] 'STRANGER', 'PARTNER_1122', ... (see App#getGroupIdsForPeriod)
 * @property {number} [suggestedNumPlayers]
 * @property {OptionIR[]} [options]       Treatment options, set when the app is added to a session.
 * @property {Object<string, *>} [values] The app's own fields, e.g. {endowment: 20}: app.endowment.
 * @property {Object<string, Program>} [functions] The app's own methods, e.g. app.payoff(player).
 * @property {Object<string, Program>} [messages]  Messages from participants' pages: app.messages.
 * @property {ScreenIR} [screen]          Screens shared by every stage.
 * @property {StageIR[]} stages
 *
 * @typedef {Object} OptionIR
 * @property {string} name
 * @property {'number'|'text'|'select'} type
 * @property {*} [default]                For 'select', the first of values.
 * @property {number} [min]
 * @property {number} [max]
 * @property {number} [step]
 * @property {Array} [values]             For 'select'.
 * @property {string} [description]
 *
 * @typedef {Object} StageIR
 * @property {string} id
 * @property {number} [duration]          Seconds; the stage times out after them.
 * @property {boolean} [waitToStart]      Wait for the whole group before starting.
 * @property {boolean} [waitToEnd]        Wait for the whole group before ending.
 * @property {boolean} [waitOnTimerEnd]   On timeout, ask pages to submit (true) or end at once.
 * @property {number|null} [timeoutGrace] Seconds pages get to submit on a timeout.
 * @property {Program} [participate]      (player) => whether the player plays this stage.
 * @property {Object<string, Program>} [programs] groupStart, playerStart, groupEnd, playerEnd.
 * @property {ScreenIR} [screen]
 * @property {Object<string, *>} [values] The stage's other fields, e.g. {updateObject: 'group'}.
 *
 * @typedef {Object} ScreenIR
 * @property {string} [renderer]          How pages draw it; 'vue' (the default) is jtree's.
 * @property {string} [active]            What a player playing the stage sees.
 * @property {string} [waiting]           What a player waiting sees.
 * @property {Object<string, Program>} [computed] For 'vue': computed values (app.vueComputed).
 * @property {Object<string, Program>} [methods]  For 'vue': methods (app.vueMethods).
 *
 * A program: code in some language. For 'js', `source` is a function expression; it runs
 * with `app` and `Utils` in scope, and `this` as jtree calls it.
 * @typedef {Object} Program
 * @property {string} lang
 * @property {string} source
 */

const APP_KEYS = ['ir', 'dialect', 'title', 'description', 'numPeriods', 'groupSize', 'numGroups',
    'groupMatchingType', 'suggestedNumPlayers', 'options', 'values', 'functions', 'messages', 'screen', 'stages'];
const STAGE_KEYS = ['id', 'duration', 'waitToStart', 'waitToEnd', 'waitOnTimerEnd', 'timeoutGrace',
    'participate', 'programs', 'screen', 'values'];
const STAGE_PROGRAMS = ['groupStart', 'playerStart', 'groupEnd', 'playerEnd'];
const SCREEN_KEYS = ['renderer', 'active', 'waiting', 'computed', 'methods'];
const OPTION_TYPES = ['number', 'text', 'select'];

/** The problems with ir, as messages naming where they are; empty if there are none. */
function validate(ir) {
    const problems = [];
    const isObject = (v) => v != null && typeof v === 'object' && !Array.isArray(v);
    const keys = (obj, allowed, where) => {
        for (const k of Object.keys(obj)) {
            if (!allowed.includes(k)) problems.push(where + ': unknown field "' + k + '"');
        }
    };
    const type = (v, t, where) => {
        if (v !== undefined && typeof v !== t) problems.push(where + ': should be a ' + t);
    };
    const program = (p, where) => {
        if (!isObject(p) || typeof p.lang !== 'string' || typeof p.source !== 'string') {
            problems.push(where + ': should be a program, {lang, source}');
        }
    };
    const programs = (obj, where, names) => {
        if (obj === undefined) return;
        if (!isObject(obj)) return problems.push(where + ': should be an object');
        for (const [k, p] of Object.entries(obj)) {
            if (names && !names.includes(k)) problems.push(where + ': unknown program "' + k + '"');
            program(p, where + '.' + k);
        }
    };
    const screen = (s, where) => {
        if (s === undefined) return;
        if (!isObject(s)) return problems.push(where + ': should be an object');
        keys(s, SCREEN_KEYS, where);
        for (const k of ['renderer', 'active', 'waiting']) type(s[k], 'string', where + '.' + k);
        programs(s.computed, where + '.computed');
        programs(s.methods, where + '.methods');
    };

    if (!isObject(ir)) return ['the app description should be an object'];
    keys(ir, APP_KEYS, 'app');
    if (ir.ir !== 1) problems.push('app.ir: should be 1, the version of this format');
    for (const k of ['dialect', 'title', 'description', 'groupMatchingType']) type(ir[k], 'string', 'app.' + k);
    for (const k of ['numPeriods', 'groupSize', 'numGroups', 'suggestedNumPlayers']) type(ir[k], 'number', 'app.' + k);
    if (ir.options !== undefined) {
        if (!Array.isArray(ir.options)) problems.push('app.options: should be a list');
        else ir.options.forEach((o, i) => {
            const where = 'app.options[' + i + ']';
            if (!isObject(o) || typeof o.name !== 'string') return problems.push(where + ': should have a name');
            if (!OPTION_TYPES.includes(o.type)) problems.push(where + '.type: should be one of ' + OPTION_TYPES.join(', '));
            if (o.type === 'select' && !Array.isArray(o.values)) problems.push(where + '.values: should be a list');
        });
    }
    if (ir.values !== undefined && !isObject(ir.values)) problems.push('app.values: should be an object');
    programs(ir.functions, 'app.functions');
    programs(ir.messages, 'app.messages');
    screen(ir.screen, 'app.screen');
    if (!Array.isArray(ir.stages)) {
        problems.push('app.stages: should be a list');
    } else {
        const ids = new Set();
        ir.stages.forEach((s, i) => {
            const where = 'app.stages[' + i + ']';
            if (!isObject(s)) return problems.push(where + ': should be an object');
            keys(s, STAGE_KEYS, where);
            if (typeof s.id !== 'string' || s.id === '') problems.push(where + '.id: should be a name');
            else if (ids.has(s.id)) problems.push(where + '.id: "' + s.id + '" is used by an earlier stage');
            ids.add(s.id);
            type(s.duration, 'number', where + '.duration');
            for (const k of ['waitToStart', 'waitToEnd', 'waitOnTimerEnd']) type(s[k], 'boolean', where + '.' + k);
            if (s.timeoutGrace !== undefined && s.timeoutGrace !== null) type(s.timeoutGrace, 'number', where + '.timeoutGrace');
            if (s.participate !== undefined) program(s.participate, where + '.participate');
            programs(s.programs, where + '.programs', STAGE_PROGRAMS);
            screen(s.screen, where + '.screen');
            if (s.values !== undefined && !isObject(s.values)) problems.push(where + '.values: should be an object');
        });
    }
    return problems;
}

/**
 * Compiles program into a JS function, run with `app` and `Utils` in scope. Languages other
 * than JS come with their dialects.
 * @param {Program} program
 * @param {App} app
 * @param {string} where Names the program in errors, e.g. "stages.results.groupStart".
 */
function compileProgram(program, app, where) {
    if (program.lang !== 'js') {
        throw new Error(where + ': programs in "' + program.lang + '" cannot run yet');
    }
    // Method shorthand, as Function.prototype.toString gives for `{ f(x) {...} }`, is not an expression.
    let source = program.source.trim();
    if (/^(async\s+)?[A-Za-z_$][\w$]*\s*\(/.test(source) && !/^(async\s+)?function\b/.test(source)) {
        source = source.replace(/^(async\s+)?/, (m) => m + 'function ');
    }
    const filename = (app.appPath || 'app') + '#' + where;
    const fn = vm.compileFunction('return (' + source + '\n);', ['app', 'Utils'], { filename })(app, Utils);
    if (typeof fn !== 'function') {
        throw new Error(where + ': is not a function');
    }
    return fn;
}

/**
 * Makes app (a new App, with any options given to it already set) the app ir describes.
 * Throws an Error listing ir's problems if it is not valid.
 */
function applyIR(app, ir) {
    const problems = validate(ir);
    if (problems.length > 0) {
        throw new Error('The app description has problems:\n- ' + problems.join('\n- '));
    }
    for (const k of ['title', 'description', 'numPeriods', 'groupSize', 'numGroups', 'groupMatchingType', 'suggestedNumPlayers']) {
        if (ir[k] !== undefined) app[k] = ir[k];
    }
    for (const [k, v] of Object.entries(ir.values || {})) app[k] = v;
    for (const o of ir.options || []) {
        if (o.type === 'number') app.addNumberOption(o.name, o.default, o.min, o.max, o.step, o.description);
        else if (o.type === 'text') app.addTextOption(o.name, o.default, o.description);
        else app.addSelectOption(o.name, o.values, o.description);
    }
    for (const [k, p] of Object.entries(ir.functions || {})) app[k] = compileProgram(p, app, 'functions.' + k);
    for (const [k, p] of Object.entries(ir.messages || {})) app.messages[k] = compileProgram(p, app, 'messages.' + k);
    applyScreen(app, ir.screen || {}, app, 'screen');
    for (const s of ir.stages) {
        const stage = app.newStage(s.id);
        for (const k of ['duration', 'waitToStart', 'waitToEnd', 'waitOnTimerEnd', 'timeoutGrace']) {
            if (s[k] !== undefined) stage[k] = s[k];
        }
        for (const [k, v] of Object.entries(s.values || {})) stage[k] = v;
        const where = 'stages.' + s.id;
        if (s.participate !== undefined) stage.canPlayerParticipate = compileProgram(s.participate, app, where + '.participate');
        for (const [k, p] of Object.entries(s.programs || {})) stage[k] = compileProgram(p, app, where + '.' + k);
        applyScreen(app, s.screen || {}, stage, where + '.screen');
    }
    return app;
}

function applyScreen(app, screen, target, where) {
    if (screen.renderer !== undefined) target.renderer = screen.renderer;
    if (screen.active !== undefined) target.activeScreen = screen.active;
    if (screen.waiting !== undefined) target.waitingScreen = screen.waiting;
    for (const [k, p] of Object.entries(screen.computed || {})) app.vueComputed[k] = compileProgram(p, app, where + '.computed.' + k);
    for (const [k, p] of Object.entries(screen.methods || {})) app.vueMethods[k] = compileProgram(p, app, where + '.methods.' + k);
}

// Fields of App and Stage that are jtree's own workings, not part of what an app describes.
const APP_INTERNAL = ['id', 'shortId', 'appDir', 'appFilename', 'appPath', 'jt', 'session', 'stages', 'periods',
    'options', 'optionValues', 'givenOptions', 'appjs', 'messages', 'vueComputed', 'vueMethods', 'started',
    'finished', 'hasError', 'errorFile', 'errorLine', 'errorPosition', 'outputDelimiter', 'keyComparisons',
    'activeScreen', 'waitingScreen', 'renderer', 'indexInSession', 'groups'];
const STAGE_INTERNAL = ['id', 'name', 'app', 'sourceFile', 'activeScreen', 'waitingScreen', 'renderer',
    'duration', 'waitToStart', 'waitToEnd', 'waitOnTimerEnd', 'timeoutGrace'];

const js = (fn) => ({ lang: 'js', source: fn.toString() });
const isJSON = (v) => {
    try {
        return JSON.stringify(v) !== undefined && !Utils.isFunction(v);
    } catch (err) {
        return false;
    }
};

/**
 * Describes a loaded jtree app as an IR. Programs are the source of its functions: one
 * that uses names from its app file other than app and Utils (a helper function defined
 * there, say) will not run from the IR.
 * @param {App} app
 * @param {App} fresh A new App for the same file, whose code has not run: what is the default.
 */
function appToIR(app, fresh) {
    const ir = { ir: 1, dialect: 'jtree' };
    for (const k of ['title', 'description', 'numPeriods', 'groupSize', 'numGroups', 'groupMatchingType', 'suggestedNumPlayers']) {
        if (app[k] !== undefined && app[k] !== fresh[k]) ir[k] = app[k];
    }
    const optionNames = app.options.map((o) => o.name);
    if (app.options.length > 0) {
        ir.options = app.options.map((o) => {
            const out = { name: o.name, type: o.type };
            if (o.type === 'select') out.values = o.values;
            else out.default = o.defaultVal;
            for (const k of ['min', 'max', 'step', 'description']) if (o[k] != null) out[k] = o[k];
            return out;
        });
    }
    const values = {};
    const functions = {};
    for (const k of Object.keys(app)) {
        if (APP_INTERNAL.includes(k) || optionNames.includes(k) || ir[k] !== undefined) continue;
        const v = app[k];
        if (Utils.isFunction(v)) {
            if (v !== fresh[k]) functions[k] = js(v);
        } else if (isJSON(v) && JSON.stringify(v) !== JSON.stringify(fresh[k])) {
            values[k] = v;
        }
    }
    if (Object.keys(values).length > 0) ir.values = values;
    if (Object.keys(functions).length > 0) ir.functions = functions;
    if (Object.keys(app.messages).length > 0) {
        ir.messages = Object.fromEntries(Object.entries(app.messages).map(([k, f]) => [k, js(f)]));
    }
    const screen = screenToIR(app, fresh);
    if (Object.keys(app.vueComputed).length > 0) screen.computed = Object.fromEntries(Object.entries(app.vueComputed).map(([k, f]) => [k, js(f)]));
    if (Object.keys(app.vueMethods).length > 0) screen.methods = Object.fromEntries(Object.entries(app.vueMethods).map(([k, f]) => [k, js(f)]));
    if (Object.keys(screen).length > 0) ir.screen = screen;

    const freshStage = fresh.newStage('x');
    ir.stages = app.stages.map((stage) => {
        const s = { id: stage.id };
        for (const k of ['duration', 'waitToStart', 'waitToEnd', 'waitOnTimerEnd', 'timeoutGrace']) {
            if (stage[k] !== freshStage[k]) s[k] = stage[k];
        }
        if (Object.prototype.hasOwnProperty.call(stage, 'canPlayerParticipate')) s.participate = js(stage.canPlayerParticipate);
        const programs = {};
        for (const k of STAGE_PROGRAMS) {
            if (Object.prototype.hasOwnProperty.call(stage, k)) programs[k] = js(stage[k]);
        }
        if (Object.keys(programs).length > 0) s.programs = programs;
        const stageScreen = screenToIR(stage, freshStage);
        if (Object.keys(stageScreen).length > 0) s.screen = stageScreen;
        const stageValues = {};
        for (const k of Object.keys(stage)) {
            if (STAGE_INTERNAL.includes(k) || STAGE_PROGRAMS.includes(k) || k === 'canPlayerParticipate') continue;
            const v = stage[k];
            if (!Utils.isFunction(v) && isJSON(v) && JSON.stringify(v) !== JSON.stringify(freshStage[k])) stageValues[k] = v;
        }
        if (Object.keys(stageValues).length > 0) s.values = stageValues;
        return s;
    });
    return ir;
}

function screenToIR(obj, fresh) {
    const screen = {};
    if (obj.renderer !== undefined && obj.renderer !== fresh.renderer) screen.renderer = obj.renderer;
    if (obj.activeScreen != null && obj.activeScreen !== fresh.activeScreen) screen.active = obj.activeScreen;
    if (obj.waitingScreen != null && obj.waitingScreen !== fresh.waitingScreen) screen.waiting = obj.waitingScreen;
    return screen;
}

module.exports = { validate, applyIR, appToIR, compileProgram };
