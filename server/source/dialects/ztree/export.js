/*
 * A z-Tree treatment's tables as z-Tree writes them (its .xls file: tab-separated text): for each
 * period and table, a line of the table's variables, then a line for each record, each line
 * starting with the session, the treatment's number, the table and the period.
 */

/** The run's tables as text. */
function exportTables(run, session) {
    const lines = [];
    const cell = (v) => (v == null ? '' : typeof v === 'object' ? (v.zArray ? v.values.join(' ') : '') : String(v).replace(/[\t\n\r]/g, ' '));
    run.periods.forEach((state, p) => {
        if (state == null) return;
        const tables = [['globals', [state.globals]], ['subjects', state.subjects], ['summary', [state.summary]], ['contracts', state.contracts]];
        for (const [name, other] of Object.entries(state.other)) tables.push([name, other]);
        if (p === run.periods.length - 1) tables.push(['session', run.sessionRecords]);
        for (const [name, records] of tables) {
            const vars = [];
            for (const rec of records) {
                for (const k of Object.keys(rec)) {
                    if (k !== '_id' && k !== 'Period' && !vars.includes(k)) vars.push(k);
                }
            }
            lines.push([session.id, 1, name, 'Period', ...vars].join('\t'));
            for (const rec of records) lines.push([session.id, 1, name, p + 1, ...vars.map((k) => cell(rec[k]))].join('\t'));
        }
    });
    return lines.join('\r\n') + '\r\n';
}

module.exports = exportTables;
