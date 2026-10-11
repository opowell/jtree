const Utils = require('../../Utils.js');

/*
 * A session's data as oTree exports it, its "all apps, wide" CSV: one row per participant;
 * participant and session columns, then for each oTree app and round
 * <app>.<round>.player.<field>, <app>.<round>.group.<field> and <app>.<round>.subsession.<field>.
 * Booleans are 1 and 0, and missing values empty, as oTree writes them.
 */

function cell(value) {
    if (value === undefined || value === null) return '';
    if (value === true) return '1';
    if (value === false) return '0';
    if (typeof value === 'object') value = JSON.stringify(value);
    const text = String(value);
    return /[",\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

// A session config's keys oTree 5 does not export (otree/session.py's NON_EDITABLE_FIELDS).
const NOT_EXPORTED = ['name', 'display_name', 'app_sequence', 'num_demo_participants', 'doc'];

/**
 * The session's "all apps, wide" CSV, with oTree 5's columns (otree/export.py): the participant's,
 * its PARTICIPANT_FIELDS, the session's, its config's (name, participation_fee,
 * real_world_currency_per_point if the project uses points, and the config's own keys), its
 * SESSION_FIELDS; then the apps'.
 */
function wideCSV(session) {
    const participants = Object.values(session.participants);
    const config = session.otreeConfig || {};
    const project = session.otreeProject || { participant_fields: [], session_fields: [], use_points: true };
    const own = (obj, f) => (obj == null ? undefined : obj[f] !== undefined ? obj[f] : obj.vars != null ? obj.vars[f] : undefined);
    const columns = [
        ['participant.id_in_session', (p, i) => i + 1],
        ['participant.code', (p) => p.id],
        ['participant.label', (p) => p.label],
        ['participant.payoff', (p) => p.points()],
    ];
    for (const f of project.participant_fields) columns.push(['participant.' + f, (p) => own(p, f)]);
    columns.push(['session.code', () => session.id]);
    const configKeys = ['name', 'participation_fee', ...(project.use_points ? ['real_world_currency_per_point'] : []),
        ...Object.keys(config).filter((k) => !NOT_EXPORTED.includes(k) && k !== 'participation_fee' && k !== 'real_world_currency_per_point')];
    for (const key of configKeys) columns.push(['session.config.' + key, () => config[key]]);
    for (const f of project.session_fields) columns.push(['session.' + f, () => own(session, f)]);
    for (const app of session.apps) {
        if (app.otree == null) continue;
        const name = app.shortId;
        const fields = app.otree.fields;
        for (let round = 1; round <= app.numPeriods; round++) {
            const period = app.periods[round - 1];
            const playerOf = (p) => (period == null ? null : period.playerByParticipantId(p.id));
            const prefix = name + '.' + round + '.';
            const roles = app.otree.roles || [];
            columns.push([prefix + 'player.id_in_group', (p) => playerOf(p) && playerOf(p).idInGroup]);
            columns.push([prefix + 'player.role', (p) => playerOf(p) && (roles[playerOf(p).idInGroup - 1] || '')]);
            columns.push([prefix + 'player.payoff', (p) => playerOf(p) && (playerOf(p).points || 0)]);
            for (const f of Object.keys(fields.player)) {
                columns.push([prefix + 'player.' + f, (p) => playerOf(p) && playerOf(p)[f]]);
            }
            columns.push([prefix + 'group.id_in_subsession', (p) => playerOf(p) && playerOf(p).group.id]);
            for (const f of Object.keys(fields.group)) {
                columns.push([prefix + 'group.' + f, (p) => playerOf(p) && playerOf(p).group[f]]);
            }
            columns.push([prefix + 'subsession.round_number', () => round]);
            for (const f of Object.keys(fields.subsession)) {
                columns.push([prefix + 'subsession.' + f, () => period && period[f]]);
            }
        }
    }
    const lines = [columns.map(([name]) => cell(name)).join(',')];
    participants.forEach((p, i) => {
        lines.push(columns.map(([, value]) => cell(value(p, i))).join(','));
    });
    return lines.join('\n') + '\n';
}

function csv(rows) {
    return rows.map((row) => row.map(cell).join(',')).join('\n') + '\n';
}

/** One oTree app's data, as oTree exports it per app: a row per player and round. */
function appCSV(session, app) {
    const fields = app.otree.fields;
    const roles = app.otree.roles || [];
    const header = ['participant.id_in_session', 'participant.code', 'participant.label', 'participant.payoff',
        'player.id_in_group', 'player.role', 'player.payoff']
        .concat(Object.keys(fields.player).map((f) => 'player.' + f))
        .concat(['group.id_in_subsession'], Object.keys(fields.group).map((f) => 'group.' + f))
        .concat(['subsession.round_number'], Object.keys(fields.subsession).map((f) => 'subsession.' + f))
        .concat(['session.code']);
    const ids = Object.keys(session.participants);
    const rows = [header];
    app.periods.forEach((period, i) => {
        if (period == null) return;
        for (const group of period.groups) {
            for (const player of group.players) {
                const p = player.participant;
                rows.push([ids.indexOf(p.id) + 1, p.id, p.label != null ? p.label : p.id, p.points(),
                    player.idInGroup, roles[player.idInGroup - 1] || '', player.points || 0]
                    .concat(Object.keys(fields.player).map((f) => player[f]))
                    .concat([group.id], Object.keys(fields.group).map((f) => group[f]))
                    .concat([i + 1], Object.keys(fields.subsession).map((f) => period[f]))
                    .concat([session.id]));
            }
        }
    });
    return csv(rows);
}

/**
 * When each participant finished each page of the session's oTree apps, as oTree's page times:
 * from the times jtree records (player.timeEnd_<stage>).
 */
function pageTimesCSV(session) {
    const rows = [['session_code', 'participant_id_in_session', 'participant_code', 'page_index', 'app_name',
        'page_name', 'epoch_time_completed', 'round_number', 'timeout_happened', 'is_wait_page']];
    const ids = Object.keys(session.participants);
    for (const participant of Object.values(session.participants)) {
        const done = [];
        for (const app of session.apps) {
            if (app.otree == null) continue;
            app.periods.forEach((period, i) => {
                const player = period == null ? null : period.playerByParticipantId(participant.id);
                if (player == null) return;
                app.stages.forEach((stage, s) => {
                    const end = player['timeEnd_' + stage.id];
                    if (end == null) return;
                    done.push([session.id, ids.indexOf(participant.id) + 1, participant.id, null, app.shortId, stage.id,
                        Utils.dateFromStr(end).getTime() / 1000, i + 1, !!player['timedOut_' + stage.id],
                        stage.formFields == null]);
                });
            });
        }
        done.sort((a, b) => a[6] - b[6]);
        done.forEach((row, i) => { row[3] = i + 1; rows.push(row); });
    }
    return csv(rows);
}

module.exports = { wideCSV, appCSV, pageTimesCSV, csv };
