// Converting oTree apps to jtree apps (dialects/otree/convert.js): oTree's sample games, converted,
// and played as jtree apps by the oTree apps' own bots, in every case they have. The bots check
// the converted code's results (payoffs, fields), and their pages: the converted screens, rendered
// by Vue as participants' pages render them.

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { startServer } = require('./harness.js');
const python = require('../source/dialects/otree/runtime.js');
const { runBots, botCases } = require('../source/dialects/otree/bots.js');
const { convertApp } = require('../source/dialects/otree/convert.js');
const { packageFor } = require('../source/dialects/otree/index.js');
const { render } = require('./vue2.js');

const SAMPLES = path.join(__dirname, 'fixtures/otree-samples');
const FIXTURES = path.join(__dirname, 'fixtures/otree');

// Each app, and how many participants its session has (as in otree-samples.test.js).
const APPS = {
    bargaining: 2, bertrand: 2, common_value_auction: 3, cournot: 2, dictator: 2, guess_two_thirds: 3,
    matching_pennies: 2, prisoner: 2, public_goods_simple: 3, survey: 1, traveler_dilemma: 2, trust: 2,
    trust_simple: 2, volunteer_dilemma: 3,
};

let server;
let out;
before(async () => {
    server = await startServer();
    await python.ready();
    out = fs.mkdtempSync(path.join(os.tmpdir(), 'jtree-converted-'));
});
after(async () => {
    await server.close();
    fs.rmSync(out, { recursive: true, force: true });
});

/**
 * The page player is on, as the converted app's screen shows it: its scripts, styles and links
 * moved out first, as jtree moves them to the page's head (App#stripTag).
 */
function screenHtml(player) {
    let screen = player.stage.activeScreen;
    for (const tag of ['script', 'style', 'link']) {
        screen = player.app().stripTag(tag, screen)[1];
    }
    const data = JSON.parse(JSON.stringify({ stage: { id: player.stage.id }, player: { page: player.page } }));
    return render(screen, data);
}

/** Converts the oTree app in dir; plays the converted app with the oTree app's bots, in each case. */
async function convertAndPlay(dir, participants) {
    const name = path.basename(dir);
    const result = await convertApp(dir, path.join(out, name));
    const pkg = packageFor(path.join(dir, '__init__.py'));
    const appPath = path.join(out, name, 'app.jtt');
    for (let caseIndex = 0; caseIndex < botCases(pkg); caseIndex++) {
        const session = server.createSession(appPath, { numParticipants: participants });
        session.start();
        await runBots(session, { timeout: 30000, caseIndex, botsFor: () => pkg, htmlFor: screenHtml });
    }
    return result;
}

for (const [name, participants] of Object.entries(APPS)) {
    test('oTree sample ' + name + ', converted to jtree, played by its bots', async () => {
        const result = await convertAndPlay(path.join(SAMPLES, name), participants);
        const todos = result.report.filter((i) => i.status === 'todo').map((i) => i.part + ': ' + i.note);
        // prisoner's results page has a chat, which converted apps do not.
        assert.deepStrictEqual(todos, name === 'prisoner' ? [todos[0]] : []);
        if (name === 'prisoner') assert.match(todos[0], /^Page Decision: \{\{ chat \}\}/);
        assert.strictEqual(result.level, name === 'prisoner' ? 'Converts with TODOs' : 'Converts');
    });
}

test('Python the converter translates: what its bots check, as the oTree app and converted', async () => {
    const dir = path.join(FIXTURES, 'convert_features');
    // The oTree app itself passes its bots...
    const original = server.createSession(path.join(dir, '__init__.py'), { numParticipants: 3 });
    original.start();
    await runBots(original, { timeout: 30000 });
    // ...and so does the converted app.
    const result = await convertAndPlay(dir, 3);
    // What it cannot translate is a TODO, with its line, in the code (throwing if it runs) and the report.
    const todo = result.report.find((i) => i.status === 'todo');
    assert.ok(todo != null && /str\.format/.test(todo.note) && todo.line != null, JSON.stringify(result.report));
    const code = fs.readFileSync(path.join(out, 'convert_features', 'app.jtt'), 'utf8');
    assert.match(code, /\/\/ TODO \(from Python, line \d+\): str\.format\./);
    assert.match(code, /throw new Error\('Not converted from Python: line \d+'\)/);
    const report = fs.readFileSync(path.join(out, 'convert_features', 'CONVERSION.md'), 'utf8');
    assert.match(report, /\*\*Converts with TODOs\.\*\*/);
    assert.match(report, /## Needs work by hand/);
});

test("Converting puts the project's static files in the pages; an older-format app is refused", async () => {
    const result = await convertApp(path.join(FIXTURES, 'public_goods'), path.join(out, 'public_goods'));
    const screen = fs.readFileSync(path.join(out, 'public_goods', 'pages', 'Contribute.html'), 'utf8');
    assert.match(screen, /href="data:text\/css;base64,/);
    assert.ok(result.report.some((i) => i.status === 'converted' && /global\/site\.css/.test(i.note)));
    await assert.rejects(convertApp(path.join(FIXTURES, 'public_goods_old'), path.join(out, 'old')),
        /older format/);
});
