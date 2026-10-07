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
 */
async function runBots(session, { timeout = 60000, caseIndex = 0 } = {}) {
    const bridge = runtime.getBridge();
    const bots = new Map(); // participant id -> {round, handle, done}
    const end = Date.now() + timeout;
    for (;;) {
        const participants = Object.values(session.participants);
        if (participants.every((p) => p.isFinishedSession())) {
            return;
        }
        if (Date.now() > end) {
            throw new Error('bots did not finish in ' + timeout + ' ms');
        }
        for (const participant of participants) {
            const player = participant.player;
            if (player == null || player.status !== 'playing') continue;
            const app = player.app();
            const stage = player.stage;
            if (app.otree == null) {
                throw new Error(participant.id + ' is in ' + app.shortId + ', which has no bots (not an oTree app)');
            }
            if (stage.playerStart == null || stage.formFields == null) continue; // a wait page, ending by itself
            let bot = bots.get(participant.id);
            const round = player.roomId();
            if (bot == null || bot.round !== round) {
                if (!bridge.has_bots(app.otree.pkg)) {
                    throw new Error(app.shortId + ' has no bots (a tests.py with a PlayerBot)');
                }
                bot = { round, handle: bridge.bot_start(app.otree.pkg, player, caseIndex), done: null };
                bots.set(participant.id, bot);
            }
            const at = round + '/' + stage.id;
            if (bot.done === at) continue; // submitted; the server has yet to move them on
            const next = bridge.bot_next(bot.handle);
            const step = next == null ? null : JSON.parse(next);
            const where = participant.id + ', round ' + player.group.period.id + ' of ' + app.shortId;
            if (step == null) {
                throw new Error(where + ': the bot has finished its round, but the player is on ' + stage.id);
            }
            if (step.page !== stage.id) {
                throw new Error(where + ': the bot expects page ' + step.page + ', but the player is on ' + stage.id);
            }
            const values = {};
            for (const [name, value] of Object.entries(step.data)) {
                const full = stage.formFields.find((f) => f.endsWith('.' + name)) || 'player.' + name;
                values[full] = value === true ? 'true' : value === false ? 'false' : String(value);
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

module.exports = { runBots };
