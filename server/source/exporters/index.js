/*
 * The formats a session's data can be downloaded in (/session-download/<session>/<id>). Each:
 * - id, name: how it is asked for, and shown
 * - appliesTo(session): whether it is offered for a session (not for apps' own)
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
    {
        id: 'otree-page-times',
        name: 'oTree page times',
        appliesTo: (session) => session.apps.some((app) => app.otree != null),
        filename: (session) => 'PageTimes-' + session.id + '.csv',
        contentType: 'text/csv',
        write: (session) => otreeExport.pageTimesCSV(session),
    },
];

/** The exporters offered for session: the ones above, and its apps' own (app.exporters(session)). */
function exportersFor(session) {
    const own = [];
    for (const app of session.apps) {
        if (typeof app.exporters === 'function') {
            for (const e of app.exporters(session)) {
                if (!own.some((o) => o.id === e.id)) own.push(e);
            }
        }
    }
    return EXPORTERS.filter((e) => e.appliesTo(session)).concat(own);
}

/** The exporter with id, if it is offered for session; else null. */
function exporter(session, id) {
    return exportersFor(session).find((e) => e.id === id) || null;
}

module.exports = { EXPORTERS, exportersFor, exporter };
