// oTree's own sample games (fixtures/otree-samples), each played in jtree by its own bots
// (tests.py): their pages, forms, wait pages and payoffs, and their bots' checks.

const { test, before, after } = require('node:test');
const path = require('node:path');
const { startServer } = require('./harness.js');
const python = require('../source/dialects/otree/runtime.js');
const { runBots } = require('../source/dialects/otree/bots.js');

const SAMPLES = path.join(__dirname, 'fixtures/otree-samples');

// Each app, and how many participants its session has (as oTree's sample project has them).
const APPS = {
    bargaining: 2, bertrand: 2, common_value_auction: 3, cournot: 2, dictator: 2, guess_two_thirds: 3,
    matching_pennies: 2, prisoner: 2, public_goods_simple: 3, survey: 1, traveler_dilemma: 2, trust: 2,
    trust_simple: 2, volunteer_dilemma: 3,
};

let server;
before(async () => {
    server = await startServer();
    await python.ready();
});
after(async () => { await server.close(); });

for (const [name, participants] of Object.entries(APPS)) {
    test('oTree sample ' + name + ', played by its bots', async () => {
        const session = server.createSession(path.join(SAMPLES, name, '__init__.py'), { numParticipants: participants });
        session.start();
        await runBots(session, { timeout: 30000 });
    });
}

test("oTree's sample project's session configs, played by their bots", async () => {
    for (const [config, participants] of [['guess_two_thirds', 3], ['survey', 1]]) {
        const session = server.createSession(path.join(SAMPLES, 'settings.py') + '#' + config, { numParticipants: participants });
        session.start();
        await runBots(session, { timeout: 30000 });
    }
});
