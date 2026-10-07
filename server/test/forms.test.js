// Forms checked by the server: app.fields, stage.formFields, stage.validate (forms.js).

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('./harness.js');
const { checkField } = require('../source/forms.js');

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.close(); });

const APP = `
app.fields = {
    'player.contribution': { type: 'int', min: 0, max: function(player) { return player.endowment; } },
    'player.color': { type: 'choice', choices: ['red', 'blue'] },
    'player.comment': { type: 'string', blank: true },
    'player.agree': { type: 'bool' },
};
const decide = app.newStage('decide');
decide.playerStart = function(player) { player.endowment = 20; };
decide.formFields = ['player.contribution', 'player.color', 'player.comment', 'player.agree'];
decide.validate = function(player, values) {
    if (values['player.color'] === 'red' && values['player.contribution'] > 10) {
        return 'Red allows at most 10.';
    }
};
app.newStage('next');
`;

async function check(appPath) {
    const session = server.createSession(appPath, { numParticipants: 1 });
    const [bot] = await server.connectAll(session);
    session.start();
    await bot.waitForStage('decide');
    const good = { 'player.contribution': '07', 'player.color': 'blue', 'player.comment': '007', 'player.agree': 'true' };

    const refused = async (values, expected) => {
        bot.form = {};
        bot.submit(values);
        assert.deepEqual(await bot.waitForFormErrors(), expected);
        assert.equal(bot.stageId, 'decide');
        assert.equal(bot.player.contribution, undefined, 'nothing is stored');
    };
    await refused({ ...good, 'player.contribution': 'abc' }, { 'player.contribution': 'Please enter a whole number.' });
    await refused({ ...good, 'player.contribution': '25' }, { 'player.contribution': 'Please enter a value of at most 20.' });
    await refused({ ...good, 'player.contribution': '-1', 'player.agree': 'maybe' }, {
        'player.contribution': 'Please enter a value of at least 0.',
        'player.agree': 'Please choose yes or no.',
    });
    const { 'player.color': _, ...noColor } = good;
    await refused(noColor, { 'player.color': 'Please fill in this field.' });
    await refused({ ...good, 'player.color': 'green' }, { 'player.color': 'Please choose one of the options.' });
    await refused({ ...good, 'player.color': 'red', 'player.contribution': '15' }, { '': 'Red allows at most 10.' });

    bot.form = {};
    bot.submit({ ...good, 'player.undeclared': '5' });
    await bot.waitForStage('next');
    const player = bot.player;
    assert.deepEqual(
        [player.contribution, player.color, player.comment, player.agree, player.undeclared],
        [7, 'blue', '007', true, 5]);
}

test('the server refuses a form with wrong values, says why, and converts a right one by type', async () => {
    await check(server.writeApp('form.jtt', APP));
});

test('fields, formFields and validate survive being described as an IR', async () => {
    const loaded = server.jt.data.loadApp('x', {}, server.writeApp('form2.jtt', APP), {});
    const ir = loaded.toIR();
    assert.equal(ir.fields['player.contribution'].max.lang, 'js');
    assert.deepEqual(ir.stages[0].formFields, ['player.contribution', 'player.color', 'player.comment', 'player.agree']);
    assert.ok(ir.stages[0].programs.validate);
    await check(server.writeIR('form2', loaded));
});

test('a blank field that may be blank is stored as null', () => {
    assert.deepEqual(checkField({ type: 'int', blank: true }, '', {}), { value: null });
    assert.deepEqual(checkField({ type: 'number' }, ' 2.5 ', {}), { value: 2.5 });
    assert.deepEqual(checkField({ type: 'choice', choices: [[1, 'One'], [2, 'Two']] }, '2', {}), { value: 2 });
});

test("when a player's time is up, what they submit is taken without the form's checks", async () => {
    const session = server.createSession(server.writeApp('form-timeout.jtt', `
        app.fields = { 'player.a': { type: 'int', max: 10 }, 'player.b': { type: 'int' } };
        const s = app.newStage('s');
        s.clientDuration = 0.5;
        s.formFields = ['player.a', 'player.b'];
        app.newStage('next');
    `), { numParticipants: 1 });
    const [bot] = await server.connectAll(session);
    session.start();
    await bot.waitForStage('s');
    // b is missing: refused while there is time; taken, as far as it goes, when it is up.
    bot.fill({ 'player.a': '3' });
    await bot.waitForStage('next', { timeout: 3000 });
    assert.deepEqual([bot.players()[0].a, bot.players()[0].b], [3, undefined]);
});

test('yes/no choices take True and False as oTree pages write them', () => {
    const field = { type: 'choice', choices: [[true, 'Cooperate'], [false, 'Defect']] };
    assert.deepEqual(checkField(field, 'True', {}), { value: true });
    assert.deepEqual(checkField(field, 'False', {}), { value: false });
    assert.deepEqual(checkField({ type: 'bool' }, 'True', {}), { value: true });
});
