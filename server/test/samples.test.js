// The samples library (client/apps/samples): each experiment in its three versions, jtree's, oTree's
// and z-Tree's, played in jtree with the same moves, to its end, for the same payoffs. oTree's
// versions are played by their own bots (tests.py), which make the moves described here and check
// the payoffs too; `otree test` plays them in oTree itself (see client/apps/samples/README.md).

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { startServer, until, CLIENT, REPO } = require('./harness.js');
const { differences } = require('./ztree-examples.js');
const { readTreatment } = require('../source/dialects/ztree/ztt.js');
const python = require('../source/dialects/otree/runtime.js');
const { runBots } = require('../source/dialects/otree/bots.js');
const { runZtreeBots, readScreen } = require('../source/dialects/ztree/bots.js');
const { pressButton } = require('../source/dialects/ztree/index.js');

const SAMPLES = path.join(CLIENT, 'apps/samples');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/*
 * Each game: its number of participants; what each participant (i, from 0; the i-th of their
 * group's players, as groups are filled in order) enters at each stage, by the stage's name in
 * jtree (values by field) and in z-Tree (values by variable); and each participant's payoffs, by
 * period. Stages not listed are submitted as they are. Games with live trading or timing play
 * by functions of their own (play.jtree, play.ztree).
 */
const GAMES = {
    dictator: {
        n: 2,
        jtree: { decide: () => ({ 'player.keep': 70 }) },
        ztree: { Decision: () => ({ Keep: 70 }) },
        payoffs: [[70], [30]],
    },
    ultimatum: {
        n: 2,
        jtree: { offer: () => ({ 'player.offer': 30 }), respond: () => ({ 'player.accept': true }) },
        ztree: { Offer: () => ({ Offer: 30 }), Response: () => ({ Accept: 1 }) },
        payoffs: [[70], [30]],
    },
    trust: {
        n: 2,
        jtree: { send: () => ({ 'player.sent': 40 }), return: () => ({ 'player.returned': 50 }) },
        ztree: { Send: () => ({ Sent: 40 }), 'Send back': () => ({ Returned: 50 }) },
        // 40 sent became 120; 50 of it came back.
        payoffs: [[110], [70]],
    },
    bargaining: {
        n: 2,
        jtree: { request: (i) => ({ 'player.request': [60, 30][i] }) },
        ztree: { Request: (i) => ({ Request: [60, 30][i] }) },
        payoffs: [[60], [30]],
    },
    'public-goods': {
        n: 4,
        jtree: { decide: (i) => ({ 'player.contribution': [0, 5, 10, 20][i] }) },
        ztree: { Contribution: (i) => ({ Contribution: [0, 5, 10, 20][i] }) },
        // 35 contributed, doubled and shared among 4: 17.5 each.
        payoffs: [0, 5, 10, 20].map((c) => Array(10).fill(20 - c + 17.5)),
    },
    'public-goods-punishment': {
        n: 4,
        jtree: {
            decide: () => ({ 'player.contribution': 10 }),
            punish: (i) => Object.fromEntries([1, 2, 3, 4].filter((o) => o !== i + 1).map((o) => ['player.pun' + o, i === 0 && o === 2 ? 3 : 0])),
        },
        ztree: {
            Contribution: () => ({ Contribution: 10 }),
            Punishment: (i) => Object.fromEntries([1, 2, 3, 4].filter((o) => o !== i + 1).map((o) => ['Pun' + o, i === 0 && o === 2 ? 3 : 0])),
        },
        // Each: 20 - 10 + 40 * 2 / 4 = 30. Player 1 pays 3 to take 6 from player 2.
        payoffs: [27, 24, 30, 30].map((p) => Array(10).fill(p)),
    },
    'prisoners-dilemma': {
        n: 2,
        jtree: { decide: (i) => ({ 'player.cooperate': i === 0 }) },
        ztree: { Decision: (i) => ({ Cooperate: i === 0 ? 1 : 0 }) },
        payoffs: [[0], [300]],
    },
    'volunteers-dilemma': {
        n: 3,
        jtree: { decide: (i) => ({ 'player.volunteer': i === 0 }) },
        ztree: { Decision: (i) => ({ Volunteer: i === 0 ? 1 : 0 }) },
        payoffs: [[60], [100], [100]],
    },
    'travelers-dilemma': {
        n: 2,
        jtree: { claim: (i) => ({ 'player.claim': [50, 80][i] }) },
        ztree: { Claim: (i) => ({ Claim: [50, 80][i] }) },
        payoffs: [[52], [48]],
    },
    'stag-hunt': {
        n: 2,
        jtree: { decide: (i) => ({ 'player.stag': i === 0 }) },
        ztree: { Decision: (i) => ({ Stag: i === 0 ? 1 : 0 }) },
        payoffs: [[0], [60]],
    },
    'battle-of-the-sexes': {
        n: 2,
        jtree: { decide: () => ({ 'player.choice': 1 }) },
        ztree: { Decision: () => ({ Choice: 1 }) },
        payoffs: [[300], [200]],
    },
    'matching-pennies': {
        n: 2,
        jtree: { decide: () => ({ 'player.side': 'Heads' }) },
        ztree: { Decision: () => ({ Side: 1 }) },
        // Both choose heads: the matcher wins, player 1 in periods 1 and 2, player 2 after.
        payoffs: [[100, 100, 0, 0], [0, 0, 100, 100]],
    },
    'beauty-contest': {
        n: 3,
        jtree: { guess: (i) => ({ 'player.guess': [20, 40, 60][i] }) },
        ztree: { Guess: (i) => ({ Guess: [20, 40, 60][i] }) },
        // 2/3 of the average (40) is 26.67: 20 is closest.
        payoffs: [[100, 100, 100], [0, 0, 0], [0, 0, 0]],
    },
    'market-entry': {
        n: 4,
        jtree: { decide: (i) => ({ 'player.enter': i === 0 }) },
        ztree: { Decision: (i) => ({ Enter: i === 0 ? 1 : 0 }) },
        // One entrant: 10 + 20 × (2 − 1) = 30; staying out pays 10.
        payoffs: [30, 10, 10, 10].map((p) => Array(5).fill(p)),
    },
    centipede: {
        n: 2,
        // Player 1 passes (the pot doubles to 20), player 2 passes (40), player 1 takes: 32 and 8.
        jtree: { move1: () => ({ 'player.take': false }), move2: () => ({ 'player.take': false }), move3: () => ({ 'player.take': true }) },
        ztree: { 'Move 1': () => ({ Take: 0 }), 'Move 2': () => ({ Take: 0 }), 'Move 3': () => ({ Take: 1 }) },
        payoffs: [[32], [8]],
    },
    cournot: {
        n: 2,
        jtree: { decide: (i) => ({ 'player.units': [20, 10][i] }) },
        ztree: { Production: (i) => ({ Units: [20, 10][i] }) },
        // The price is 60 − 30 = 30.
        payoffs: [[600], [300]],
    },
    bertrand: {
        n: 2,
        jtree: { decide: (i) => ({ 'player.price': [40, 60][i] }) },
        ztree: { Price: (i) => ({ Price: [40, 60][i] }) },
        payoffs: [[40], [0]],
    },
    'common-value-auction': {
        n: 3,
        jtree: { bid: (i) => ({ 'player.bid': [30, 50, 70][i] }) },
        ztree: { Bid: (i) => ({ Bid: [30, 50, 70][i] }) },
        // Player 3 bids highest, and pays 70 for an item worth the group's value.
        payoffs: (i, period, player, value) => (i === 2 ? value(player, { jtree: 'group.value', otree: 'group.value', ztree: 'Value' }) - 70 : 0),
    },
    survey: {
        n: 1,
        jtree: { demographics: () => ({ 'player.age': 30, 'player.gender': 'Female' }), crt: () => ({ 'player.crtBat': 2, 'player.crtWidget': 5, 'player.crtLake': 47 }) },
        ztree: { 'About you': () => ({ Age: 30, Gender: 2 }), 'Three questions': () => ({ CrtBat: 2, CrtWidget: 5, CrtLake: 47 }) },
        payoffs: [[0]],
        check: (players, value) => assert.equal(value(players[0][0], { jtree: 'crtScore', otree: 'crt_score', ztree: 'CrtScore' }), 2),
    },

    'dutch-auction': {
        n: 3,
        // Player 1 buys at once, at the starting price of 100.
        play: {
            async jtree({ bots, app }) {
                for (let period = 1; period <= app.numPeriods; period++) {
                    await Promise.all(bots.map((b) => b.waitForStage('auction', { period })));
                    bots[0].send('buy', null);
                    await Promise.all(bots.map((b) => b.play('results', {}, { period })));
                }
            },
            async ztree({ session, app }) {
                await playZtree(session, app, async (i, stage, player) => {
                    if (stage === 'Auction') {
                        if (i === 0) press(app, player, {});
                        return;
                    }
                    press(app, player, {});
                });
            },
        },
        payoffs: (i, period, player, value) => (i === 0 ? value(player, { jtree: 'value', otree: 'value', ztree: 'Value' }) - 100 : 0),
    },
    'double-auction': {
        n: 8,
        // Seller 5 asks 100, and buyer 1 takes it: the buyer earns 400 − 100, the seller 100 − 20.
        play: {
            async jtree({ bots, app }) {
                for (let period = 1; period <= app.numPeriods; period++) {
                    await Promise.all(bots.map((b) => b.waitForStage('trading', { period })));
                    const group = bots[0].player.group;
                    bots[4].send('offer', 100);
                    await until(() => group.offers.rows.length === 1, { what: 'the ask' });
                    bots[0].send('accept', null);
                    await until(() => bots[0].player.unitsTraded === 1, { what: 'the trade' });
                    await Promise.all(bots.map((b) => b.play('trading', {}, { period })));
                    await Promise.all(bots.map((b) => b.play('results', {}, { period })));
                }
            },
            async ztree({ session, app }) {
                await playZtree(session, app, async (i, stage, player) => {
                    if (stage === 'Sellers') {
                        if (i === 4) {
                            press(app, player, { Price: 100 }, { box: 1 });
                        }
                        await wait(300);
                        session.pushMessage(player, true, 'endStage');
                    } else if (stage === 'Buyers') {
                        if (i === 0) {
                            const ask = await until(() => readScreen(player.ztreeHtml || '').boxes.get('2').records[0], { what: 'the ask' });
                            press(app, player, {}, { box: 2, record: ask });
                        }
                        await wait(600);
                        session.pushMessage(player, true, 'endStage');
                    } else {
                        press(app, player, {});
                    }
                });
            },
        },
        payoffs: [300, 0, 0, 0, 80, 0, 0, 0].map((p) => [p, p]),
    },
    'asset-market': {
        n: 4,
        // In period 1, player 1 offers a share for 50, and player 2 buys it.
        play: {
            async jtree({ bots, app }) {
                for (let period = 1; period <= app.numPeriods; period++) {
                    await Promise.all(bots.map((b) => b.waitForStage('trading', { period })));
                    if (period === 1) {
                        const group = bots[0].player.group;
                        bots[0].send('makeOfferToSell', 50);
                        const offer = await until(() => group.offers.rows.find((o) => o.open), { what: 'the offer' });
                        bots[1].send('acceptOTS', offer.id);
                        await until(() => !offer.open, { what: 'the trade' });
                    }
                    await Promise.all(bots.map((b) => b.play('trading', {}, { period })));
                    await Promise.all(bots.map((b) => b.play('results', {}, { period })));
                }
            },
            async ztree({ session, app }) {
                await playZtree(session, app, async (i, stage, player, period) => {
                    if (stage === 'Trading') {
                        if (period === 1 && i === 0) press(app, player, { Price: 50 }, { box: 1, button: 1 });
                        if (period === 1 && i === 1) {
                            const offer = await until(() => readScreen(player.ztreeHtml || '').boxes.get('3').records[0], { what: 'the offer' });
                            press(app, player, {}, { box: 3, record: offer });
                        }
                        await wait(period === 1 ? 600 : 0);
                        session.pushMessage(player, true, 'endStage');
                    } else {
                        press(app, player, {});
                    }
                });
            },
        },
        // The cash at the end: 720, the trade's 50 one way, and the dividends on the shares held.
        payoffs: (i, period, player, value, players) => {
            if (period < 10) return 0;
            const dividends = players[i].reduce((sum, pl) => sum + value(pl, { jtree: 'dividends', otree: 'dividends', ztree: 'Dividends' }), 0);
            assert.equal(value(player, { jtree: 'shares', otree: 'shares', ztree: 'Shares' }), [2, 4, 3, 3][i]);
            return 720 + [50, -50, 0, 0][i] + dividends;
        },
    },
    'real-effort': {
        n: 1,
        // Two sums right, one wrong.
        play: {
            async jtree({ bots }) {
                const [bot] = bots;
                await bot.waitForStage('work');
                for (const right of [true, true, false]) {
                    const attempted = bot.player.attempted;
                    const sum = bot.player.numbers.reduce((a, b) => a + b, 0);
                    bot.send('answer', right ? sum : sum + 1);
                    await bot.waitFor(() => bot.player.attempted === attempted + 1);
                }
                await bot.play('work', {});
                await bot.play('results', {});
            },
            async ztree({ session, app }) {
                await playZtree(session, app, async (i, stage, player) => {
                    if (stage === 'Work') {
                        for (const right of [true, true, false]) {
                            // The sum, as the screen shows it.
                            const sum = /(\d+) \+ (\d+) \+ (\d+) =/.exec(player.ztreeHtml).slice(1).reduce((a, b) => a + Number(b), 0);
                            press(app, player, { Answer: right ? sum : sum + 1 });
                        }
                        session.pushMessage(player, true, 'endStage');
                    } else {
                        press(app, player, {});
                    }
                });
            },
        },
        payoffs: [[2]],
    },
};

const OTREE_APP = (game) => game.replace(/-/g, '_');

let server;
before(async () => {
    server = await startServer();
    await python.ready();
});
after(async () => { await server.close(); });

/** The value of a player's field, by engine ({jtree: 'group.x', ...}). */
function valueIn(engine) {
    return (player, names) => names[engine].split('.').reduce((o, k) => o[k], player);
}

/** Each participant's players, by period (participants in order). */
function playersOf(session) {
    const app = session.apps[0];
    return Object.values(session.participants).map((part) => app.periods.map((period) =>
        period.groups.flatMap((g) => g.players).find((pl) => pl.participant === part)));
}

function checkPayoffs(name, engine, session) {
    const game = GAMES[name];
    const players = playersOf(session);
    const value = valueIn(engine);
    players.forEach((periods, i) => periods.forEach((pl, p) => {
        const expected = typeof game.payoffs === 'function' ? game.payoffs(i, p + 1, pl, value, players) : game.payoffs[i][p];
        assert.ok(Math.abs(pl.points - expected) < 1e-9, engine + ': participant ' + (i + 1) + ', period ' + (p + 1) + ': ' + pl.points + ', not ' + expected);
    }));
    if (game.check) game.check(players, value);
}

/** Presses a button on player's z-Tree screen, with values for its inputs: the first box with buttons, or opts.box. */
function press(app, player, values, { box, button = 0, record } = {}) {
    const screen = readScreen(player.ztreeHtml || '');
    const boxes = [...screen.boxes.values()].filter((b) => b.buttons.length);
    const b = box != null ? screen.boxes.get(String(box)) : boxes[0];
    assert.ok(b, 'no box to press a button in, on ' + player.stage.ztree.name);
    const result = pressButton(app, player, { stage: player.stage.id, box: b.path, button: b.buttons[button], values, others: {}, record });
    assert.ok(result != null && !result.error, 'pressing in ' + player.stage.ztree.name + ': ' + JSON.stringify(result));
    return result;
}

/**
 * Plays a session of a z-Tree treatment: act(i, stage name, player, period) for each participant at
 * each stage they are shown, once.
 */
async function playZtree(session, app, act) {
    const done = new Set();
    const parts = Object.values(session.participants);
    await until(() => {
        for (const [i, part] of parts.entries()) {
            const player = part.player;
            if (player == null || player.status !== 'playing' || player.stage.ztree == null || !player.ztreeHtml) continue;
            const key = part.id + '/' + player.group.period.id + '/' + player.stage.id;
            if (done.has(key)) continue;
            done.add(key);
            act(i, player.stage.ztree.name, player, player.group.period.id);
        }
        return parts.every((p) => p.isFinishedSession());
    }, { timeout: 60000, what: 'the z-Tree session to end' });
}

for (const [name, game] of Object.entries(GAMES)) {
    test(name + ': jtree', async () => {
        const session = server.createSession(path.join(SAMPLES, 'jtree', name + '.jtt'), { numParticipants: game.n });
        const bots = await server.connectAll(session);
        session.start();
        const app = session.apps[0];
        if (game.play) {
            await game.play.jtree({ session, bots, app });
        } else {
            const done = new Set();
            await until(() => {
                for (const [i, b] of bots.entries()) {
                    const stage = b.stageId;
                    if (stage == null) continue;
                    const key = b.player.group.period.id + '/' + stage;
                    if (done.has(key + '/' + i)) continue;
                    done.add(key + '/' + i);
                    b.submit(game.jtree[stage] ? game.jtree[stage](i, b.player.group.period.id) : {});
                }
                return bots.every((b) => b.participant.isFinishedSession());
            }, { timeout: 20000, what: 'the session to end' });
        }
        await Promise.all(bots.map((b) => b.waitForEnd({ timeout: 10000 })));
        checkPayoffs(name, 'jtree', session);
    });

    test(name + ': oTree, played by its bots', async () => {
        const session = server.createSession(path.join(SAMPLES, 'otree', OTREE_APP(name), '__init__.py'), { numParticipants: game.n });
        session.start();
        await runBots(session, { timeout: 30000 });
        checkPayoffs(name, 'otree', session);
    });

    test(name + ': z-Tree', async () => {
        const session = server.createSession(path.join(SAMPLES, 'ztree', name + '.ztt'), { numParticipants: game.n });
        session.start();
        const app = session.apps[0];
        if (game.play) {
            await game.play.ztree({ session, app });
        } else {
            await playZtree(session, app, (i, stage, player, period) => press(app, player, game.ztree[stage] ? game.ztree[stage](i, period) : {}));
        }
        checkPayoffs(name, 'ztree', session);
    });
}

test("the oTree project's session configs list every game", () => {
    const settings = fs.readFileSync(path.join(SAMPLES, 'otree/settings.py'), 'utf8');
    for (const name of Object.keys(GAMES)) assert.match(settings, new RegExp("app_sequence=\\['" + OTREE_APP(name) + "'\\]"));
    for (const dir of ['jtree', 'ztree']) {
        const files = fs.readdirSync(path.join(SAMPLES, dir)).filter((f) => /\.(jtt|ztt)$/.test(f)).map((f) => f.replace(/\.\w+$/, ''));
        assert.deepEqual(files.sort(), Object.keys(GAMES).sort(), dir);
    }
});

test("each z-Tree treatment as text (in the docs, z-Tree's text format) is the treatment", () => {
    for (const name of Object.keys(GAMES)) {
        const ztt = readTreatment(fs.readFileSync(path.join(SAMPLES, 'ztree', name + '.ztt')));
        const text = readTreatment(fs.readFileSync(path.join(REPO, 'doc-pages/static/samples/ztree', name + '.txt')));
        assert.deepEqual(differences(ztt, text), [], name);
    }
});

test("the z-Tree versions, played by jtree's generic z-Tree bot", async () => {
    for (const name of Object.keys(GAMES)) {
        const session = server.createSession(path.join(SAMPLES, 'ztree', name + '.ztt'), { numParticipants: GAMES[name].n });
        session.start();
        await runZtreeBots(session, { timeout: 60000 });
    }
});
