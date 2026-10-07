/*
 * The formats a session's data can be downloaded in (/session-download/<session>/<id>). Each:
 * - id, name: how it is asked for, and shown
 * - appliesTo(session): whether it is offered for a session
 * - filename(session), contentType
 * - write(session): the file's contents
 */
const path = require('path');
const otreeExport = require('../dialects/otree/export.js');

const EXPORTERS = [
    {
        id: 'jtree',
        name: 'jtree CSV',
        appliesTo: () => true,
        filename: (session) => path.basename(session.csvFN()),
        contentType: 'text/csv',
        write: (session) => session.saveOutput(),
    },
    {
        id: 'otree-wide',
        name: 'oTree CSV (all apps, wide)',
        appliesTo: (session) => session.apps.some((app) => app.otree != null),
        filename: (session) => 'all_apps_wide-' + session.id + '.csv',
        contentType: 'text/csv',
        write: (session) => otreeExport.wideCSV(session),
    },
];

/** The exporters offered for session. */
function exportersFor(session) {
    return EXPORTERS.filter((e) => e.appliesTo(session));
}

/** The exporter with id, if it is offered for session; else null. */
function exporter(session, id) {
    return exportersFor(session).find((e) => e.id === id) || null;
}

module.exports = { EXPORTERS, exportersFor, exporter };
