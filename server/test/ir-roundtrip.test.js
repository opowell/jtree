// Each sample game described as an app description (IR), written as an .app.json, and
// played by the same script as the game itself (games.js): the description loses nothing
// the game needs.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { startServer, app } = require('./harness.js');
const games = require('./games.js');
const { validate } = require('../source/ir/ir.js');

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.close(); });

// What a description of a jtree app cannot carry: functions that use names from their app
// file other than app and Utils (see appToIR).
// Nor values the app file computes from options when it runs: those are described as they
// came out with the options' defaults.
const CANNOT = {
    'centipede.jtt': 'its first stage calls getAnonymousPartnerIds, a function of the app file',
    'real-effort-sums.jtt': "its work stage's duration is computed from the workTime option",
};

/** The description of the game in file, as a .app.json in the test's data folder. */
function describe(file) {
    const loaded = server.jt.data.loadApp('x', {}, app('1 sample games/' + file), {});
    assert.ok(loaded && !loaded.hasError, 'could not load ' + file);
    const ir = loaded.toIR();
    assert.deepEqual(validate(ir), []);
    // Written and read back as JSON, as a file would be.
    const out = path.join(server.dataDir, file.replace(/\.jtt$/, '') + '.app.json');
    fs.writeFileSync(out, JSON.stringify(ir, null, 2));
    return out;
}

for (const game of games) {
    test('described: ' + game.name, CANNOT[game.file] ? { todo: CANNOT[game.file] } : {}, async () => {
        const session = server.createSession(describe(game.file), { numParticipants: game.participants, options: game.options });
        assert.equal(session.apps[0].appPath.endsWith('.app.json'), true);
        const bots = await server.connectAll(session);
        session.start();
        await game.play({ session, bots, app: session.apps[0] });
    });
}

test('a description with problems is reported, not loaded', () => {
    const file = path.join(server.dataDir, 'broken.app.json');
    fs.writeFileSync(file, JSON.stringify({ ir: 1, stages: [{ id: 'a' }, { id: 'a', duratoin: 5 }] }));
    const broken = server.jt.data.loadApp('x', {}, file, {});
    assert.ok(broken.hasError);
    assert.equal(broken.errorFile, file);
});

test('a description that is not JSON is reported with its line', () => {
    const file = path.join(server.dataDir, 'notjson.app.json');
    fs.writeFileSync(file, '{\n  "ir": 1,\n  "stages": [,]\n}');
    const broken = server.jt.data.loadApp('x', {}, file, {});
    assert.ok(broken.hasError);
    assert.deepEqual([broken.errorLine, broken.errorPosition], ['3', '14']);
});

test('validate names every problem', () => {
    assert.deepEqual(validate({ ir: 1, stages: [{ id: 'a' }, { id: 'a', duratoin: 5, programs: { groupStrat: { lang: 'js', source: '' } } }] }), [
        'app.stages[1]: unknown field "duratoin"',
        'app.stages[1].id: "a" is used by an earlier stage',
        'app.stages[1].programs: unknown program "groupStrat"',
    ]);
});
