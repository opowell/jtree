// Published oTree experiments (fixtures/otree-published, see its README), each session config
// played in jtree to its end: by its own bots (tests.py) where they work, and otherwise by the
// generic bot, which fills in each page's form (see runBots' generic option). By oTree's rules
// (sessions in mode 'otree'), as they ran.
// Some load Python packages (scipy, Pillow, pandas, openpyxl), which Pyodide fetches.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { startServer } = require('./harness.js');
const python = require('../source/dialects/otree/runtime.js');
const { runBots } = require('../source/dialects/otree/bots.js');

const PUBLISHED = path.join(__dirname, 'fixtures/otree-published');

// Holzmeister's apps, each its own session: app -> participants. Played by their own bots.
const HOLZMEISTER = { bret: 1, cem: 1, eet: 2, icl: 1, mpl: 1, scl: 1 };

// The projects' session configs: [project, config, participants, generic bot].
// generic: 'missing' for apps without bots; 'always' where the project's bots are empty or out of
// date (their pages have changed since); a list for the apps whose bots are broken.
const CONFIGS = [
    ['manydesigns/randomization', 'ManyDesigns', 100, false],
    ['manydesigns/BDQ29-Baseline', 'mds_bs', 4, 'always'],
    ['manydesigns/LGT85', 'manydesigns_comp', 12, 'always'],
    ['manydesigns/LGT85', 'manydesigns_nocomp', 12, 'always'],
    ['manydesigns/NJJ10', 'many_labs', 2, 'always'],
    ['manydesigns/NJJ10', 'many_labs_comp', 2, 'always'],
    ['manydesigns/NJP79', 'ManyDesigns_Competition', 8, 'missing'],
    ['manydesigns/NJP79', 'ManyDesigns_Control', 8, 'missing'],
    ['manydesigns/OUU63', 'manydesings_base', 4, 'missing'],
    ['manydesigns/OUU63', 'manydesings_comp', 4, 'missing'],
    ['manydesigns/PKY70', 'PKY70_control', 2, 'always'],
    ['manydesigns/PKY70', 'PKY70_treatment', 2, 'always'],
    ['manydesigns/PRF65', 'Baseline', 1, 'missing'],
    ['manydesigns/PRF65', 'Competition', 1, 'missing'],
    ['manydesigns/RPZ39', 'individual_treatment', 3, ['production_task']],
    ['manydesigns/RPZ39', 'competition_treatment', 3, ['production_task']],
    ['manydesigns/WDO94', 'no_competition', 2, 'missing'],
    ['manydesigns/WDO94', 'competition', 2, 'missing'],
    ['manydesigns/XZZ66', 'senior_vs_junior_Juniors_Competition', 4, 'missing'],
    ['manydesigns/XZZ66', 'senior_vs_junior_All_Competition', 4, 'missing'],
    ['manydesigns/YPZ45', 'TRA', 1, 'missing'],
    ['manydesigns/YPZ45', 'TR1', 1, 'missing'],
    ['manydesigns/YPZ45', 'slider_test', 1, 'missing'],
    ['delegation', 'FP', 1, 'missing'],
    ['delegation', 'GP', 1, 'missing'],
    ['delegation', 'bot', 1, 'missing'],
];

// XKM55's two apps, without a project (settings.py): app -> participants. Their bots are out of date.
const XKM55 = { ManyDesignM: 4, ManyDesignS: 4 };

let server;
before(async () => {
    server = await startServer();
    await python.ready();
});
after(async () => { await server.close(); });

/** A started session of file, by oTree's rules unless mode says: once Python has the packages its apps import. */
async function sessionOf(file, participants, mode = 'otree') {
    try {
        server.createSession(file, { numParticipants: participants, mode });
    } catch (err) {
        // Loading packages: ready below.
    }
    await python.ready();
    const session = server.createSession(file, { numParticipants: participants, mode });
    session.start();
    return session;
}

for (const [app, participants] of Object.entries(HOLZMEISTER)) {
    test('Holzmeister\'s ' + app + ', played by its bots', async () => {
        const session = await sessionOf(path.join(PUBLISHED, 'holzmeister', app, 'models.py'), participants);
        await runBots(session, { timeout: 60000 });
    });
}

for (const [project, config, participants, generic] of CONFIGS) {
    test(project + ' ' + config + ', played to its end', async () => {
        const session = await sessionOf(path.join(PUBLISHED, project, 'settings.py') + '#' + config, participants);
        await runBots(session, { timeout: 120000, generic });
    });
}

for (const [app, participants] of Object.entries(XKM55)) {
    test('manydesigns/XKM55 ' + app + ', played by the generic bot', async () => {
        const session = await sessionOf(path.join(PUBLISHED, 'manydesigns/XKM55', app, 'models.py'), participants);
        await runBots(session, { timeout: 60000, generic: 'always' });
    });
}

// BDQ29's treatment, as published, cannot show its Results_Part_1 page: its template writes
// {{ if p.rank == 1 && p.role == ... }}, which oTree 5 cannot read either ("Unparsable expression",
// checked with oTree 5.11.5: tools/otree).
test('manydesigns/BDQ29-Treatment mds_tr stops where oTree does: Results_Part_1, a template with &&', async () => {
    const session = await sessionOf(path.join(PUBLISHED, 'manydesigns/BDQ29-Treatment', 'settings.py') + '#mds_tr', 4);
    await assert.rejects(runBots(session, { timeout: 120000, generic: 'always' }),
        (err) => /page Results_Part_1 could not be shown/.test(err.message) && /cannot read .*&&/.test(err.message));
});

// By jtree's rules, a name a Django template (oTree's older apps) cannot find is an error, not
// nothing: Holzmeister's cem shows {{ num_choices }}, which it never defines.
test("Holzmeister's cem, by jtree's rules: its template's undefined name is reported", async () => {
    const session = await sessionOf(path.join(PUBLISHED, 'holzmeister', 'cem', 'models.py'), 1, 'jtree');
    await assert.rejects(runBots(session, { timeout: 60000 }), (err) => /num_choices/.test(err.message));
});
