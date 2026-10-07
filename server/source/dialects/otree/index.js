const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const runtime = require('./runtime.js');

/*
 * oTree apps: a folder with an __init__.py in oTree's format (one file: C, Subsession, Group,
 * Player, functions and pages), and its pages' templates. Its Python runs in Pyodide
 * (runtime.js), with jtree's otree.api (python/otree/api.py), whose models stand for jtree's
 * objects. See plans/ztree-otree-dialects.md, section 4.
 *
 * How an oTree app becomes a jtree app:
 * - rounds are periods; PLAYERS_PER_GROUP the group size, grouped in order and kept in later
 *   rounds (oTree's default); creating_session runs when each round starts (app.periodStart).
 * - each Page is a stage players go through on their own: form_fields are its form's fields
 *   (checked as app.fields, with <field>_min/_max/_choices, then <field>_error_message and the
 *   page's error_message), is_displayed who plays it, before_next_page its playerEnd, timeouts
 *   each player's time. Its template is rendered by Python when the player starts it.
 * - each WaitPage is a stage that waits for the group (or all groups, wait_for_all_groups) and
 *   ends straight away, running after_all_players_arrive; group_by_arrival_time groups players
 *   by arrival.
 */

const KINDS = { int: 'int', number: 'number', currency: 'number', string: 'string', bool: 'bool' };

/** The Python package an app's folder is loaded as. */
function packageFor(appPath) {
    return 'otree_' + crypto.createHash('sha1').update(path.resolve(appPath)).digest('hex').substring(0, 12);
}

// Load the app catalogue again once Python has started, for each jtree that waited for it.
const reloaders = new WeakMap();
function reloadWhenReady(jt) {
    if (jt == null || jt.data == null) return;
    if (!reloaders.has(jt)) {
        reloaders.set(jt, () => {
            jt.data.reloadApps();
            if (jt.socketServer != null) jt.socketServer.refreshAdmins();
        });
    }
    runtime.whenReady(reloaders.get(jt));
}

/** Where in the app's files a Python error happened, from its traceback. */
function errorPosition(err, pkg, dir) {
    const re = new RegExp('File "/apps/' + pkg + '/([^"]+)", line (\\d+)', 'g');
    let last = null;
    for (const m of String(err.message || err).matchAll(re)) last = m;
    if (last == null) return null;
    return { file: path.join(dir, last[1]), line: last[2], column: 'unknown' };
}

function fieldFor(model, name, f, pkg) {
    const field = {};
    if (f.label != null) field.label = f.label;
    field.type = KINDS[f.kind] || 'string';
    if (f.choices != null || f.callbacks.includes('choices')) {
        field.type = 'choice';
        field.choices = f.choices;
    }
    for (const k of ['min', 'max']) {
        if (f[k] != null) field[k] = f[k];
    }
    if (f.blank) field.blank = true;
    for (const cb of ['min', 'max', 'choices']) {
        if (f.callbacks.includes(cb)) {
            field[cb] = (player) => runtime.getBridge().field_callback(pkg, model, name, cb, player);
        }
    }
    return field;
}

/** End player's (wait) stage, after what is running now. */
function endSoon(player) {
    player.session().pushMessage(player, true, 'endStage');
}

function definePage(app, page, pkg) {
    const stage = app.newStage(page.name);
    const has = (m) => page.methods.includes(m);
    const call = (method, player, ...args) => runtime.getBridge().call_page(pkg, page.name, method, player, ...args);
    if (has('is_displayed')) {
        stage.canPlayerParticipate = (player) => !!call('is_displayed', player);
    }

    // Pages have their own Next button (next_button), wait pages none.
    stage.addOKButtonIfNone = false;

    if (page.kind === 'wait') {
        stage.wrapPlayingScreenInFormTag = 'no';
        stage.waitToStart = true;
        stage.waitToEnd = true;
        stage.activeScreen = '<h4>' + page.title_text + '</h4><p>' + page.body_text + '</p>';
        if (page.group_by_arrival_time) {
            app.groupByArrival = true;
        }
        if (page.wait_for_all_groups) {
            stage.waitForAllGroups = true;
            if (page.after_all_players_arrive) {
                stage.allGroupsStart = (period) => runtime.getBridge().after_all_players_arrive(pkg, page.name, period, 'subsession');
            }
        } else if (page.after_all_players_arrive) {
            stage.groupStart = (group) => runtime.getBridge().after_all_players_arrive(pkg, page.name, group, 'group');
        }
        stage.playerStart = endSoon;
        return;
    }

    // A page: each player on their own.
    stage.wrapPlayingScreenInFormTag = 'yes';
    stage.waitToStart = false;
    stage.waitToEnd = false;
    const model = page.form_model || 'player';
    stage.formFields = page.form_fields.map((f) => model + '.' + f);
    if (page.timeout_seconds != null) stage.clientDuration = page.timeout_seconds;
    if (has('get_timeout_seconds')) stage.getClientDuration = (player) => call('get_timeout_seconds', player) || 0;
    stage.validate = (player, values) => runtime.getBridge().validate(pkg, page.name, player, values) || undefined;
    stage.playerStart = (player) => {
        player.otreeHtml = runtime.getBridge().render(pkg, page.name, player);
    };
    if (has('before_next_page')) {
        stage.playerEnd = (player) => call('before_next_page', player, !!player.timedOut);
    }
    stage.activeScreen = '<div class="otree-page" v-html="player.otreeHtml"></div>';
}

module.exports = {
    name: 'otree',

    detect(appPath) {
        if (path.basename(appPath) !== '__init__.py') return false;
        try {
            return /\bfrom\s+otree\.api\s+import\b|\bimport\s+otree\.api\b/.test(fs.readFileSync(appPath, 'utf8'));
        } catch (err) {
            return false;
        }
    },

    /** Makes app the oTree app in appPath's folder. */
    define(app) {
        app.appjs = fs.readFileSync(app.appPath, 'utf8');
        let bridge;
        try {
            bridge = runtime.getBridge();
        } catch (err) {
            reloadWhenReady(app.jt);
            throw err;
        }
        const dir = path.dirname(app.appPath);
        const pkg = packageFor(app.appPath);
        runtime.putApp(pkg, dir);
        let info;
        try {
            info = JSON.parse(bridge.load(pkg));
        } catch (err) {
            err.jtreePosition = errorPosition(err, pkg, dir) || undefined;
            throw err;
        }
        app.otree = { pkg, constants: info.constants, roles: info.roles };
        app.shortId = info.name || path.basename(dir);
        app.title = info.name || path.basename(dir);
        if (info.doc) app.description = info.doc;
        app.numPeriods = info.num_rounds;
        if (info.players_per_group != null) app.groupSize = info.players_per_group;
        app.groupMatchingType = 'PARTNER_1122';
        app.fields = {};
        for (const model of ['player', 'group']) {
            for (const [name, f] of Object.entries(info.fields[model])) {
                app.fields[model + '.' + name] = fieldFor(model, name, f, pkg);
            }
        }
        if (info.creating_session) {
            app.periodStart = (period) => runtime.getBridge().creating_session(pkg, period);
        }
        for (const page of info.pages) {
            definePage(app, page, pkg);
        }
    },
};
