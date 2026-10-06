// How participants are put into groups, period by period (app.groupMatchingType).

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('./harness.js');

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.close(); });

/** The groups of each period, as sorted lists of participant ids, sorted. */
async function groupsByPeriod(type) {
    const session = server.createSession(server.writeApp(type + '.jtt', `
        app.numPeriods = 3;
        app.groupSize = 2;
        app.groupMatchingType = '${type}';
        app.newStage('s');
    `), { numParticipants: 6 });
    const bots = await server.connectAll(session);
    session.start();
    for (let period = 1; period <= 3; period++) await Promise.all(bots.map(b => b.play('s', {}, { period })));
    await Promise.all(bots.map(b => b.waitForEnd()));
    return session.apps[0].periods.map(p => p.groups.map(g => g.players.map(pl => pl.participant.id).sort()).sort());
}

test('PARTNER_1122: consecutive participants together, every period', async () => {
    const periods = await groupsByPeriod('PARTNER_1122');
    for (const groups of periods) assert.deepEqual(groups, [['P1', 'P2'], ['P3', 'P4'], ['P5', 'P6']]);
});

test('PARTNER_1212: participants dealt round the groups, every period', async () => {
    const periods = await groupsByPeriod('PARTNER_1212');
    for (const groups of periods) assert.deepEqual(groups, [['P1', 'P4'], ['P2', 'P5'], ['P3', 'P6']]);
});

test('PARTNER_RANDOM: random groups, kept every period', async () => {
    const periods = await groupsByPeriod('PARTNER_RANDOM');
    assert.equal(periods[0].flat().length, 6);
    assert.deepEqual(periods[1], periods[0]);
    assert.deepEqual(periods[2], periods[0]);
});

test('STRANGER: random groups of 2 of all 6, every period', async () => {
    const periods = await groupsByPeriod('STRANGER');
    for (const groups of periods) {
        assert.equal(groups.length, 3);
        assert.deepEqual(groups.flat().sort(), ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']);
    }
});
