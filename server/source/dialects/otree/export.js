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

/** The session's "all apps, wide" CSV. */
function wideCSV(session) {
    const participants = Object.values(session.participants);
    const config = session.otreeConfig || {};
    const columns = [
        ['participant.id_in_session', (p, i) => i + 1],
        ['participant.code', (p) => p.id],
        ['participant.label', (p) => p.label != null ? p.label : p.id],
        ['participant.payoff', (p) => p.points()],
        ['participant.payoff_plus_participation_fee', (p) => p.payment()],
        ['session.code', () => session.id],
    ];
    for (const key of Object.keys(config)) {
        if (key !== 'app_sequence') columns.push(['session.config.' + key, () => config[key]]);
    }
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

module.exports = { wideCSV };
