const fs = require('fs-extra');
const path = require('path');
const { readTreatment } = require('./ztt.js');
const { Run } = require('./runtime.js');
const exportTables = require('./export.js');

/*
 * z-Tree treatments (.ztt files) as jtree apps: read by ztt.js, their programs run by lang.js
 * over z-Tree's tables (runtime.js), their screens drawn by render.js and shown by
 * participant/ztree.js. See plans/ztree-otree-dialects.md, section 5.
 *
 * How a treatment becomes a jtree app:
 * - its periods are periods; all its subjects are one jtree group (z-Tree's Group is a variable);
 * - each stage is a stage: "wait for all" stages start when every subject is there, the others as
 *   each subject gets there; their programs run then, and Participate decides who takes part;
 * - a stage's timeout is each subject's time on it: shown in the header box, and ending the stage
 *   if the stage leaves after its timeout;
 * - buttons are handled by the server (ztreeButton): inputs, checkers, programs, leaving the stage;
 *   every subject's screen is drawn again after anything changes.
 */

const SCREEN_ASSETS = '<link rel="stylesheet" href="/participant/ztree.css"><script src="/participant/ztree.js"></script>';

/** Ends player's stage after what is running now. */
function endSoon(player) {
    player.session().pushMessage(player, true, 'endStage');
}

/** The treatment's run in app (a session's app): made when it starts. */
function runOf(app) {
    if (app.ztreeRun == null) {
        app.ztreeRun = new Run(app.ztree.treatment, app);
        app.ztreeRun.onChange = () => refresh(app);
    }
    return app.ztreeRun;
}

/** The subject index of player (their participant's place in the session). */
function subjectIndex(player) {
    return Object.keys(player.session().participants).indexOf(String(player.participant.id));
}

/** Draws again the screen of each of app's players who is in it, and sends it if it changed. */
function refresh(app) {
    const session = app.session;
    if (session == null) return;
    for (const participant of Object.values(session.participants)) {
        const player = participant.player;
        if (player == null || player.app() !== app || player.stage == null || player.stage.ztree == null) continue;
        draw(player);
    }
}

/** Draws player's screen (their stage's active screen, or the waiting screen they are on). */
function draw(player, which) {
    const app = player.app();
    const run = runOf(app);
    const stage = player.stage;
    if (which == null) which = player.ztreeWhich || (player.status === 'playing' ? 'active' : 'waiting');
    player.ztreeWhich = which;
    const shown = which === 'active' || player.ztreeWaitingStage == null ? stage : app.stages[player.ztreeWaitingStage];
    let html;
    try {
        html = run.screen(player.group.period.id - 1, subjectIndex(player), shown.ztree, which, player.participant.id,
            which === 'active' ? player.ztreeDeadline : null);
    } catch (err) {
        run.note('drawing a screen: ' + err.message);
        html = '<div class="ztree-error">This screen could not be shown: ' + String(err.message).replace(/</g, '&lt;') + '</div>';
    }
    if (html !== player.ztreeHtml) {
        player.ztreeHtml = html;
        const io = player.session().io();
        if (io != null) io.to(player.participant.roomId()).emit('ztreeScreen', { html, stage: player.stage.id });
    }
}

function defineStage(app, zstage, index, treatment) {
    const stage = app.newStage('stage' + (index + 1));
    stage.ztree = zstage;
    stage.title = zstage.name;
    const startIfPossible = (zstage.options[0] & 1) === 1;
    // Leaving the stage when its time is up is z-Tree's default. (The options' bit 2, set on the
    // examples' market stages, is not known yet.)
    const leaveAfterTimeout = true;
    stage.wrapPlayingScreenInFormTag = 'no';
    stage.addOKButtonIfNone = false;
    stage.waitToEnd = false;
    stage.waitToStart = !startIfPossible;
    stage.waitForAllGroups = !startIfPossible;
    stage.endOnTimeout = leaveAfterTimeout;
    stage.useAppWaitingScreen = false;
    const id = stage.id;
    stage.activeScreen = SCREEN_ASSETS + '<div class="ztree-page" v-if="stage.id == \'' + id + '\' && player.status == \'playing\'" v-html="player.ztreeHtml"></div>';
    stage.waitingScreen = '<div class="ztree-page" v-if="stage.id == \'' + id + '\' && player.status != \'playing\'" v-html="player.ztreeHtml"></div>';

    const started = new Set(); // period/participant: programs run
    const startSubjects = (period, players) => {
        const run = runOf(app);
        const p = period.id - 1;
        const view = run.view(p);
        const subjects = players.map((pl) => run.periods[p].subjects[subjectIndex(pl)]).filter(Boolean);
        for (const rec of subjects) rec.Participate = 1;
        run.runPrograms(zstage.programs, view, subjects, { globalsOnce: startIfPossible ? run.periods[p].globalsRun : null });
    };
    if (!startIfPossible) {
        stage.allGroupsStart = (period) => {
            const players = period.groups.flatMap((g) => g.players);
            players.forEach((pl) => started.add(period.id + '/' + pl.participant.id));
            startSubjects(period, players);
            refresh(app);
        };
    }
    stage.canPlayerParticipate = (player) => {
        const key = player.group.period.id + '/' + player.participant.id;
        if (!started.has(key)) {
            started.add(key);
            startSubjects(player.group.period, [player]);
        }
        const rec = runOf(app).periods[player.group.period.id - 1].subjects[subjectIndex(player)];
        return rec == null || lang().num(rec.Participate) !== 0;
    };
    // The stage's timeout: an expression, for each subject (0 or less: none).
    stage.getClientDuration = (player) => {
        const run = runOf(app);
        const p = player.group.period.id - 1;
        const rec = run.periods[p].subjects[subjectIndex(player)];
        const seconds = zstage.timeout ? lang().num(run.value(zstage.timeout, { rt: run.view(p), table: 'subjects', rec, outer: null })) : 0;
        return seconds > 0 ? seconds : 0;
    };
    stage.playerStart = (player) => {
        const seconds = stage.getClientDuration(player);
        player.ztreeDeadline = seconds > 0 ? Date.now() + seconds * 1000 : null;
        draw(player, 'active');
    };
    stage.playerEnd = (player) => {
        // Until the next stage, the subject sees this stage's waiting screen.
        player.ztreeWaitingStage = stage.indexInApp();
        copyToPlayer(player);
        draw(player, 'waiting');
        refresh(app);
    };
    return stage;
}

/** The subject's variables as the player's fields (for jtree's data), and Profit as points. */
function copyToPlayer(player) {
    const run = runOf(player.app());
    const rec = run.periods[player.group.period.id - 1].subjects[subjectIndex(player)];
    if (rec == null) return;
    for (const [k, v] of Object.entries(rec)) {
        if (k === '_id' || (v != null && typeof v === 'object')) continue;
        if (!/^[A-Z]/.test(k) && Object.prototype.hasOwnProperty.call(player, k) && !(k in (player.ztreeFields || {}))) continue;
        (player.ztreeFields = player.ztreeFields || {})[k] = true;
        player[k] = v;
    }
    player.points = lang().num(rec.Profit);
}

let langModule = null;
const lang = () => (langModule = langModule || require('./lang.js'));

module.exports = {
    name: 'ztree',

    detect(appPath) {
        return appPath.toLowerCase().endsWith('.ztt');
    },

    /** Makes app the z-Tree treatment in appPath. */
    define(app) {
        const buf = fs.readFileSync(app.appPath);
        const treatment = readTreatment(buf);
        app.ztree = { treatment };
        // Not sent to pages, nor saved with the app.
        app.outputHideAuto.push('ztree', 'ztreeRun');
        app.appjs = '';
        app.shortId = path.basename(app.appPath, path.extname(app.appPath));
        app.title = app.shortId;
        app.description = 'z-Tree treatment, ' + treatment.subjects.length + ' subjects, ' + treatment.periods.length + ' period' +
            (treatment.periods.length === 1 ? '' : 's') + ', ' + treatment.stages.length + ' stages.';
        app.numPeriods = Math.max(1, treatment.periods.length);
        app.suggestedNumParticipants = treatment.subjects.length;
        app.playerFieldsNotInOutput = ['ztreeHtml', 'ztreeWhich', 'ztreeWaitingStage', 'ztreeDeadline', 'ztreeFields'];
        app.waitingScreen = SCREEN_ASSETS + '<div class="ztree-page" v-if="player.stage == null || player.stage.ztree == null" v-html="player.ztreeHtml"></div>';
        if (treatment.warnings.length) app.ztree.warnings = treatment.warnings;

        app.periodStart = (period) => {
            const run = runOf(app);
            run.startPeriod(period.id - 1, Object.keys(app.session.participants).length);
        };
        app.periodEnd = (period) => {
            const run = runOf(app);
            run.endPeriod(period.id - 1);
            for (const group of period.groups) for (const player of group.players) copyToPlayer(player);
        };
        treatment.stages.forEach((s, i) => defineStage(app, s, i, treatment));

        // A button pressed: {stage, box, button, values, record}.
        app.messages.ztreeButton = function(data) {
            const player = this.participant.player;
            if (player == null || player.app() !== app || player.stage == null || player.stage.ztree == null || player.status !== 'playing') return;
            if (data == null || data.stage !== player.stage.id) return;
            const run = runOf(app);
            if (data.record != null) {
                const sel = run.selected.get(player.participant.id) || {};
                sel[data.box] = data.record;
                run.selected.set(player.participant.id, sel);
            }
            const result = run.press(player.group.period.id - 1, subjectIndex(player), player.stage.ztree, data);
            const io = player.session().io();
            if (result.error) {
                io.to(player.participant.roomId()).emit('ztreeMessage', { text: result.error, box: data.box });
                return;
            }
            io.to(player.participant.roomId()).emit('ztreeAccepted', { box: data.box });
            if (result.leave) endSoon(player);
            refresh(app);
        };
        app.messages.ztreeButton.convertsOwnValues = true;
        // A row chosen in a contract list: {stage, box, record}.
        app.messages.ztreeSelect = function(data) {
            const player = this.participant.player;
            if (player == null || player.app() !== app || data == null) return;
            const run = runOf(app);
            const sel = run.selected.get(player.participant.id) || {};
            sel[data.box] = data.record;
            run.selected.set(player.participant.id, sel);
            draw(player);
        };
        app.messages.ztreeSelect.convertsOwnValues = true;
        // A chat entry: {stage, box, text}.
        app.messages.ztreeChat = function(data) {
            const player = this.participant.player;
            if (player == null || player.app() !== app || player.stage == null || player.stage.ztree == null || data == null || data.stage !== player.stage.id) return;
            runOf(app).chat(player.group.period.id - 1, subjectIndex(player), player.stage.ztree, data);
            refresh(app);
        };
        app.messages.ztreeChat.convertsOwnValues = true;

        // Downloads: the treatment's tables, as z-Tree writes them.
        app.exporters = (session) => [{
            id: 'ztree-tables-' + app.shortId,
            name: 'z-Tree tables of ' + app.shortId,
            filename: () => app.shortId + '-' + session.id + '.xls',
            contentType: 'text/tab-separated-values',
            write: () => {
                const own = session.apps.find((a) => a.ztree != null && a.appPath === app.appPath) || app;
                return own.ztreeRun == null ? '' : exportTables(own.ztreeRun, session);
            },
        }];
    },

    runOf,
    draw,
    refresh,
};
