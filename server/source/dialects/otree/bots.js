const runtime = require('./runtime.js');

/*
 * oTree apps' bots (their tests.py, a PlayerBot whose play_round yields each page it fills in),
 * run by jtree's server for a session's participants: no pages or browsers involved.
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Plays session with its apps' bots until every participant has finished it. Rejects on the
 * first problem: a bot expecting another page than its player's, a form refused (or accepted,
 * for SubmissionMustFail), an app without bots, or an error in a bot (e.g. a failed expect).
 * @param {Session} session A started session.
 * @param {Object} [opts]
 * @param {number} [opts.timeout=60000] ms to finish in.
 * @param {number} [opts.caseIndex=0] Which of a PlayerBot's cases to play.
 * @param {function(App): ?string} [opts.botsFor] The Python package whose bots play an app: by
 * default the app's own, for an oTree app. (A jtree app converted from an oTree app is played by
 * the oTree app's bots.)
 * @param {function(Player): string} [opts.htmlFor] The page a player is on, as the bots see it
 * (self.html): by default what the oTree app rendered.
 * @param {false|'missing'|'always'|string[]} [opts.generic=false] Whether a generic bot plays (it
 * fills in each page's form with valid values): for apps without bots, for all, or for apps without
 * bots and the apps named (those whose own bots are broken).
 */
async function runBots(session, { timeout = 60000, caseIndex = 0, botsFor = (app) => (app.otree == null ? null : app.otree.pkg),
    htmlFor = (player) => player.otreeHtml || '', generic = false } = {}) {
    const bridge = runtime.getBridge();
    const bots = new Map(); // participant id -> {round, handle, done}
    // Participants whose bots have played every page, up to the session's last, which they stay on.
    const finished = new Set();
    // The groups' live pages whose bots' call_live_method has run (once per group and page, as in oTree).
    const liveCalled = new Set();
    const end = Date.now() + timeout;
    for (;;) {
        const participants = Object.values(session.participants);
        if (participants.every((p) => p.isFinishedSession() || finished.has(p.id))) {
            return;
        }
        if (Date.now() > end) {
            throw new Error('bots did not finish in ' + timeout + ' ms');
        }
        for (const participant of participants) {
            if (finished.has(participant.id)) continue;
            const player = participant.player;
            if (player == null || player.status !== 'playing') continue;
            const app = player.app();
            const stage = player.stage;
            const pkg = botsFor(app);
            if (pkg == null) {
                throw new Error(participant.id + ' is in ' + app.shortId + ', which has no bots (not an oTree app)');
            }
            if (stage.playerStart == null || stage.formFields == null) continue; // a wait page, ending by itself
            let bot = bots.get(participant.id);
            const round = player.roomId();
            // The generic bot: for apps without bots (generic: 'missing'), for all ('always'), or for
            // those and the apps named.
            if (generic === 'always' || (generic && !bridge.has_bots(pkg))
                || (Array.isArray(generic) && generic.includes(app.shortId))) {
                const at = round + '/' + stage.id;
                if (bot != null && bot.done === at) continue;
                if (player.otreeError) {
                    throw new Error(participant.id + ': page ' + stage.id + ' could not be shown: ' + player.otreeError);
                }
                submitGeneric(session, app, player, stage);
                bots.set(participant.id, { round, handle: null, done: at });
                continue;
            }
            if (bot == null || bot.round !== round) {
                if (!bridge.has_bots(pkg)) {
                    throw new Error(app.shortId + ' has no bots (a tests.py with a PlayerBot)');
                }
                bot = { round, handle: bridge.bot_start(pkg, player, caseIndex), done: null };
                bots.set(participant.id, bot);
            }
            const at = round + '/' + stage.id;
            if (bot.done === at) continue; // submitted; the server has yet to move them on
            if (player.otreeError) {
                throw new Error(participant.id + ': page ' + stage.id + ' could not be shown: ' + player.otreeError);
            }
            const html = String(htmlFor(player));
            const next = bridge.bot_next(bot.handle, html);
            const step = next == null ? null : JSON.parse(next);
            const where = participant.id + ', round ' + player.group.period.id + ' of ' + app.shortId;
            if (step == null) {
                if (isSessionsLastPage(session, player)) {
                    finished.add(participant.id);
                    continue;
                }
                throw new Error(where + ': the bot has finished its round, but the player is on ' + stage.id);
            }
            if (step.page !== stage.id) {
                throw new Error(where + ': the bot expects page ' + step.page + ', but the player is on ' + stage.id);
            }
            if (stage.otreeLive && !liveCalled.has(player.group.roomId() + '/' + stage.id)) {
                liveCalled.add(player.group.roomId() + '/' + stage.id);
                callLive(bridge, pkg, player, caseIndex);
            }
            const values = {};
            for (const [name, value] of Object.entries(step.data)) {
                const full = stage.formFields.find((f) => f.endsWith('.' + name)) || 'player.' + name;
                // As oTree's bots do (unless check_html=False): what they fill in is on the page.
                if (step.check_html && !step.timeout_happened && !html.includes('name="' + full + '"') && !html.includes('name="' + name + '"')) {
                    throw new Error(where + ': the bot fills in ' + name + ', which page ' + stage.id + ' does not have');
                }
                // As a browser sends oTree's pages' values (True and False as Python writes them).
                values[full] = value === true ? 'True' : value === false ? 'False' : String(value);
            }
            if (step.timeout_happened) {
                player.timedOut = true;
            }
            const errors = app.submitStage(player, values);
            session.emitParticipantUpdates();
            if (step.must_fail) {
                if (errors == null) {
                    throw new Error(where + ': page ' + stage.id + ' accepted what the bot said it must refuse');
                }
                continue;
            }
            if (errors != null) {
                throw new Error(where + ': page ' + stage.id + ' refused the bot\'s ' + JSON.stringify(step.data) + ': ' + JSON.stringify(errors));
            }
            bot.done = at;
        }
        await sleep(5);
    }
}

/**
 * The bots' call_live_method (tests.py) for player's group on the live page player is on: what
 * the live_method calls send goes to the group's pages, as a page's liveSend would.
 */
function callLive(bridge, pkg, player, caseIndex) {
    const sends = bridge.bot_call_live(pkg, player.stage.id, player, caseIndex);
    const io = player.session().io();
    for (const [id, value] of sends || []) {
        for (const p of player.group.players) {
            if (io != null && (id === 0 || p.idInGroup === id)) io.to(p.participant.roomId()).emit('liveRecv', value);
        }
    }
    player.session().emitParticipantUpdates();
}

/**
 * The generic bot's submission of the page player is on: a valid value for each of its form's
 * fields (their declarations, app.fields: a choice, a number from min to max, yes or no, a word);
 * if the page refuses (its error_message, say), other values, up to 30 times.
 */
function submitGeneric(session, app, player, stage) {
    const declared = { ...(app.fields || {}), ...(stage.fields || {}) };
    const of = (v) => (typeof v === 'function' ? v(player) : v);
    const pick = (list) => list[Math.floor(Math.random() * list.length)];
    const valueFor = (field) => {
        if (field == null) return TEXTS[textIndex % TEXTS.length];
        const choices = of(field.choices);
        if (Array.isArray(choices) && choices.length) {
            const c = pick(choices);
            return Array.isArray(c) ? c[0] : c;
        }
        const lo = of(field.min);
        const hi = of(field.max);
        switch (field.type) {
            case 'bool': return pick([true, false]);
            case 'int': {
                if ((lo == null || hi == null) && attempt > 0) return unbounded(lo, hi);
                const a = lo != null ? Math.ceil(lo) : 0;
                const b = hi != null ? Math.floor(hi) : a + 10;
                return a + Math.floor(Math.random() * (b - a + 1));
            }
            case 'number': {
                if ((lo == null || hi == null) && attempt > 0) return unbounded(lo, hi);
                const a = lo != null ? lo : 0;
                const b = hi != null ? hi : a + 10;
                return Math.round((a + Math.random() * (b - a)) * 100) / 100;
            }
            default: return TEXTS[textIndex % TEXTS.length];
        }
    };
    // Texts to try in turn, if a page refuses one (a Prolific ID's 24 letters and digits, ...).
    const TEXTS = ['text', '5f2b9c3d4e5f60718293a4b5', 'bot@example.com', '42', 'yes'];
    // Numbers to try in turn, for a field with no min or max that a page refuses (an age, a year, ...).
    const NUMBERS = [25, 1, 50, 100, 1990, 5, 1000, 2000, 10000, 0];
    const unbounded = (lo, hi) => {
        const n = NUMBERS[(attempt - 1) % NUMBERS.length];
        return Math.min(hi != null ? hi : n, Math.max(lo != null ? lo : n, n));
    };
    let textIndex = 0;
    let attempt = 0;
    let errors = null;
    for (attempt = 0; attempt < 30; attempt++) {
        textIndex = attempt;
        const values = {};
        for (const name of stage.formFields) {
            const v = valueFor(declared[name]);
            values[name] = v === true ? 'True' : v === false ? 'False' : String(v);
        }
        errors = app.submitStage(player, values);
        session.emitParticipantUpdates();
        if (errors == null) return;
    }
    throw new Error(player.participant.id + ', round ' + player.group.period.id + ' of ' + app.shortId + ': page ' + stage.id +
        ' refused the generic bot\'s values: ' + JSON.stringify(errors));
}

/** Whether player is on the last page of the session: its last app's last round and stage. */
function isSessionsLastPage(session, player) {
    const app = player.app();
    return app === session.apps[session.apps.length - 1] &&
        player.group.period.id === app.numPeriods &&
        player.stage === app.stages[app.stages.length - 1];
}

/** How many cases the bots of package pkg have (their PlayerBot's cases; 1 if none). */
function botCases(pkg) {
    return runtime.getBridge().bot_case_count(pkg);
}

module.exports = { runBots, botCases };
