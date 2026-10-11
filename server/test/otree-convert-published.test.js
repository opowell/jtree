// The published oTree experiments (fixtures/otree-published), converted to jtree apps
// (dialects/otree/convert.js): every app in oTree's current format converts (with TODOs where it
// must), those that convert fully still do, and session configs whose apps convert play, as
// jtree apps, to their end, by the oTree apps' bots (or the generic bot, as otree-published.test.js
// plays them), their pages rendered by Vue as participants' pages render them.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { startServer } = require('./harness.js');
const python = require('../source/dialects/otree/runtime.js');
const { runBots } = require('../source/dialects/otree/bots.js');
const { convertApp } = require('../source/dialects/otree/convert.js');
const { packageFor } = require('../source/dialects/otree/index.js');
const project = require('../source/dialects/otree/project.js');
const { render } = require('./vue2.js');

const PUBLISHED = path.join(__dirname, 'fixtures/otree-published');

// The apps that convert with no TODOs.
const CONVERT_FULLY = [
    'manydesigns/OUU63/promises', 'manydesigns/PRF65/Baseline', 'manydesigns/PRF65/Competition',
    'manydesigns/RPZ39/production_task_start', 'manydesigns/RPZ39/prolific_id', 'manydesigns/RPZ39/welcome',
    'manydesigns/RPZ39/welcome_competition', 'manydesigns/YPZ45/completion_code', 'manydesigns/YPZ45/compqs',
    'manydesigns/YPZ45/payment_instructions', 'manydesigns/YPZ45/prolific_id',
];

// Session configs played converted: [project, config, participants, generic bot] (as in otree-published.test.js).
const PLAYED = [
    ['manydesigns/PRF65', 'Baseline', 1, 'missing'],
    ['manydesigns/PRF65', 'Competition', 1, 'missing'],
    ['manydesigns/NJP79', 'ManyDesigns_Competition', 8, 'missing'],
    ['manydesigns/NJP79', 'ManyDesigns_Control', 8, 'missing'],
    ['manydesigns/RPZ39', 'individual_treatment', 3, ['production_task']],
    ['manydesigns/YPZ45', 'TR1', 1, 'missing'],
];

let server;
let out;
before(async () => {
    server = await startServer();
    await python.ready();
    out = fs.mkdtempSync(path.join(os.tmpdir(), 'jtree-converted-published-'));
});
after(async () => {
    await server.close();
    fs.rmSync(out, { recursive: true, force: true });
});

/** The converted app's page the player is on, as Vue renders it (see otree-convert.test.js). */
function screenHtml(player) {
    let screen = player.stage.activeScreen;
    for (const tag of ['script', 'style', 'link']) {
        screen = player.app().stripTag(tag, screen)[1];
    }
    return render(screen, JSON.parse(JSON.stringify({ stage: { id: player.stage.id }, player: { page: player.page } })));
}

/** Converts the app in dir (once Python has the packages it imports). */
async function convert(dir, dest) {
    try {
        return await convertApp(dir, dest);
    } catch (err) {
        if (!/loading|starting/i.test(err.message)) throw err;
        await python.ready();
        return convertApp(dir, dest);
    }
}

test("the published apps in oTree's current format convert; those with no TODOs still have none", async () => {
    const full = [];
    for (const proj of fs.readdirSync(path.join(PUBLISHED, 'manydesigns')).map((p) => 'manydesigns/' + p)) {
        const dir = path.join(PUBLISHED, proj);
        for (const app of fs.readdirSync(dir)) {
            const file = path.join(dir, app, '__init__.py');
            if (!fs.existsSync(file) || fs.existsSync(path.join(dir, app, 'models.py'))) continue;
            if (!/\b(Page|WaitPage)\b/.test(fs.readFileSync(file, 'utf8'))) continue;
            const result = await convert(path.join(dir, app), path.join(out, proj, app));
            if (result.level === 'Converts') full.push(proj + '/' + app);
        }
    }
    assert.deepEqual(CONVERT_FULLY.filter((a) => !full.includes(a)), []);
});

for (const [proj, config, participants, generic] of PLAYED) {
    test(proj + ' ' + config + ', converted to jtree apps, played to its end', async () => {
        const settings = path.join(PUBLISHED, proj, 'settings.py');
        const cfg = project.sessionConfigs(settings).find((c) => c.name === config);
        const paths = [];
        const pkgs = {};
        for (const app of cfg.app_sequence) {
            const dir = path.join(PUBLISHED, proj, app);
            await convert(dir, path.join(out, proj, app));
            paths.push(path.join(out, proj, app, 'app.jtt'));
            pkgs[app] = packageFor(path.join(dir, '__init__.py'));
        }
        const session = server.createSession(paths, { numParticipants: participants, mode: 'otree' });
        // What the oTree apps read as session.config.
        session.otreeConfig = cfg;
        session.start();
        await runBots(session, { timeout: 120000, generic, htmlFor: screenHtml,
            botsFor: (app) => pkgs[path.basename(path.dirname(app.appPath))] });
    });
}
