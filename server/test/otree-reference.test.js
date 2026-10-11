// oTree's sample games, played in jtree by their bots by oTree's rules, record what oTree 5.11.5
// itself recorded (fixtures/otree-reference, made with tools/otree/compare.js): the "all apps,
// wide" CSV's values in every column but those that depend on the moment, with Python's random
// seeded as oTree's was, so random draws too.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { startServer } = require('./harness.js');
const python = require('../source/dialects/otree/runtime.js');
const { runBots } = require('../source/dialects/otree/bots.js');
const { exporter } = require('../source/exporters/index.js');
const { bySession, same } = require('../../tools/otree/compare.js');

const REFERENCE = path.join(__dirname, 'fixtures/otree-reference');
const SAMPLES = path.join(__dirname, 'fixtures/otree-samples');

let server;
before(async () => {
    server = await startServer();
    await python.ready();
});
after(async () => { await server.close(); });

for (const name of fs.readdirSync(REFERENCE).filter((f) => f.endsWith('.json'))) {
    const ref = JSON.parse(fs.readFileSync(path.join(REFERENCE, name), 'utf8'));
    test(`oTree's ${ref.config}: jtree records what oTree ${ref.otree} recorded`, async () => {
        // A sample game, or (project) a config of a project of the fixtures.
        const file = ref.project != null ? path.join(__dirname, 'fixtures', ref.project, 'settings.py') + '#' + ref.config : path.join(SAMPLES, ref.config, '__init__.py');
        // Once Python has the packages its apps import (scipy, ...).
        try { server.createSession(file, { numParticipants: ref.participants, mode: 'otree' }); } catch (err) { /* loading them */ }
        await python.ready();
        // Seeded as oTree was (tools/otree/compare.js --seed): the same draws, in the same order.
        if (ref.seed != null) python.py.runPython('import random\nrandom.seed(' + JSON.stringify(String(ref.seed)) + ')');
        for (const [caseIndex, rows] of ref.cases.entries()) {
            const session = server.createSession(file, { numParticipants: ref.participants, mode: 'otree' });
            session.start();
            await runBots(session, { timeout: 120000, caseIndex });
            const jt = bySession(exporter(session, 'otree-wide').write(session))[0];
            const differ = [];
            for (const row of rows) {
                const mine = jt.get(row['participant.id_in_session']);
                // session.config.*: a sample game's are its project's (a config named after it), not the game's.
                for (const [column, value] of Object.entries(row)) {
                    if (column.startsWith('session.config.')) continue;
                    const j = mine == null ? undefined : mine[column];
                    if (j === undefined || !same(value, j)) differ.push(`${column} (participant ${row['participant.id_in_session']}): oTree ${value}, jtree ${j}`);
                }
            }
            assert.deepEqual(differ, [], `case ${caseIndex}`);
        }
    });
}
