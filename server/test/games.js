// jtree's versions of the samples library's games (client/apps/samples/jtree), as scripts for bots: each starts from a started
// session of the game with its bots connected, plays it and checks the results. Run on the
// games' own files (sample-games.test.js) and on descriptions of them (ir-roundtrip.test.js).

const assert = require('node:assert/strict');

module.exports = [
    {
        name: 'public good: payoffs follow contributions, in every period',
        file: 'public-goods.jtt',
        participants: 4,
        async play({ bots, app }) {
            const contributions = [0, 5, 10, 20];
            for (let period = 1; period <= app.numPeriods; period++) {
                await Promise.all(bots.map((b, i) => b.play('decide', { 'player.contribution': contributions[i] }, { period })));
                await Promise.all(bots.map(b => b.play('results', {}, { period })));
            }
            await Promise.all(bots.map(b => b.waitForEnd()));

            // 35 contributed, doubled and shared among 4: 17.5 each, plus what each kept.
            for (const [i, b] of bots.entries()) {
                const players = b.players();
                assert.equal(players.length, 10);
                for (const pl of players) {
                    assert.equal(pl.contribution, contributions[i]);
                    assert.equal(pl.points, 20 - contributions[i] + 17.5);
                }
            }
        },
    },
    {
        name: 'dictator game: only player 1 decides, player 2 gets the rest',
        file: 'dictator.jtt',
        participants: 4,
        async play({ bots, app }) {
            for (let period = 1; period <= app.numPeriods; period++) {
                // Groups for the period exist once any bot has started it.
                await Promise.all(bots.map(b => b.waitFor(() => b.players()[period - 1] != null)));
                const firsts = bots.filter(b => b.players()[period - 1].idInGroup === 1);
                assert.equal(firsts.length, 2);
                await Promise.all(firsts.map(b => b.play('decide', { 'player.keep': 70 }, { period })));
                await Promise.all(bots.map(b => b.play('results', {}, { period })));
            }
            await Promise.all(bots.map(b => b.waitForEnd()));
            for (const b of bots) {
                for (const pl of b.players()) {
                    assert.equal(pl.points, pl.idInGroup === 1 ? 70 : 30);
                }
            }
        },
    },
    {
        name: 'beauty contest: the guess closest to 2/3 of the average wins',
        file: 'beauty-contest.jtt',
        participants: 3,
        async play({ bots, app }) {
            const guesses = [20, 40, 60]; // average 40, target 26.67: 20 wins.
            for (let period = 1; period <= app.numPeriods; period++) {
                await Promise.all(bots.map((b, i) => b.play('guess', { 'player.guess': guesses[i] }, { period })));
                await Promise.all(bots.map(b => b.play('results', {}, { period })));
            }
            await Promise.all(bots.map(b => b.waitForEnd()));
            for (const [i, b] of bots.entries()) {
                for (const pl of b.players()) assert.equal(pl.points, i === 0 ? app.prize : 0);
            }
        },
    },
    {
        name: 'market entry: entrants share the market, the rest take the outside option',
        file: 'market-entry.jtt',
        participants: 4,
        async play({ bots, app }) {
            const enters = [true, false, false, false];
            for (let period = 1; period <= app.numPeriods; period++) {
                await Promise.all(bots.map((b, i) => b.play('decide', { 'player.enter': enters[i] }, { period })));
                await Promise.all(bots.map(b => b.play('results', {}, { period })));
            }
            await Promise.all(bots.map(b => b.waitForEnd()));
            // 10 + 20 * (capacity 2 - 1 entrant) = 30 for the entrant; outside option 10.
            for (const [i, b] of bots.entries()) {
                for (const pl of b.players()) {
                    assert.equal(pl.enter, enters[i]);
                    assert.equal(pl.points, enters[i] ? 30 : 10);
                }
            }
        },
    },
    {
        name: 'market entry: treatment options change the payoff',
        file: 'market-entry.jtt',
        participants: 2,
        options: { capacity: 10, outsideOption: 3 },
        async play({ bots, app }) {
            assert.equal(app.capacity, 10);
            await Promise.all(bots.map((b, i) => b.play('decide', { 'player.enter': i === 0 }, { period: 1 })));
            await Promise.all(bots.map(b => b.waitForStage('results', { period: 1 })));
            const [p0, p1] = bots.map(b => b.players()[0]);
            assert.equal(p0.points, 3 + 20 * (10 - 1));
            assert.equal(p1.points, 3);
        },
    },
    {
        name: 'public good with punishment: punishment costs the punisher 1 and the target 2',
        file: 'public-goods-punishment.jtt',
        participants: 4,
        async play({ bots }) {
            await Promise.all(bots.map(b => b.play('decide', { 'player.contribution': 10 }, { period: 1 })));
            // Player 1 punishes player 2 by 3; nobody else punishes.
            await Promise.all(bots.map(b => b.waitForStage('punish', { period: 1 })));
            await Promise.all(bots.map(b => {
                const me = b.players()[0].idInGroup;
                const values = {};
                for (let id = 1; id <= 4; id++) if (id !== me) values['player.pun' + id] = (me === 1 && id === 2) ? 3 : 0;
                b.submit(values);
            }));
            await Promise.all(bots.map(b => b.waitForStage('results', { period: 1 })));
            // Each: 20 - 10 + 40*2/4 = 30.
            for (const b of bots) {
                const pl = b.players()[0];
                const expected = 30 + (pl.idInGroup === 1 ? -3 : 0) + (pl.idInGroup === 2 ? -6 : 0);
                assert.equal(pl.points, expected, 'player ' + pl.idInGroup);
            }
        },
    },
    {
        name: 'centipede: a pass doubles the pot, and the taker gets 80% of it',
        file: 'centipede.jtt',
        participants: 2,
        async play({ bots }) {
            const [p1, p2] = bots;
            await p1.play('move1', { 'player.take': false });
            await p2.play('move2', { 'player.take': false });
            await p1.play('move3', { 'player.take': true });
            await Promise.all(bots.map(b => b.waitForStage('results')));
            // Player 1 took the pot of 40 at move 3: 32, and 8 for player 2.
            assert.equal(p1.player.group.takenAt, 3);
            assert.equal(p1.player.points, 32);
            assert.equal(p2.player.points, 8);
        },
    },
    {
        name: 'real effort: correct sums score a point each, and the stage ends on time',
        file: 'real-effort.jtt',
        participants: 1,
        options: { workTime: 1 },
        async play({ bots }) {
            const [bot] = bots;
            await bot.waitForStage('work');
            // Two right, one wrong; the stage's 1-second timer ends it.
            for (const right of [true, true, false]) {
                const attempted = bot.player.attempted;
                const sum = bot.player.numbers.reduce((a, b) => a + b, 0);
                bot.send('answer', right ? sum : sum + 1);
                await bot.waitFor(() => bot.player.attempted === attempted + 1);
            }
            await bot.waitForStage('results', { timeout: 4000 });
            assert.equal(bot.player.points, 2);
        },
    },
    {
        name: 'asset market: a trade moves a share and its price between players',
        file: 'asset-market.jtt',
        participants: 2,
        options: { tradingTime: 60 },
        async play({ bots, app }) {
            const [buyer, seller] = bots;
            await Promise.all(bots.map(b => b.waitForStage('trading', { period: 1 })));
            const cash = buyer.player.cash;
            const shares = buyer.player.shares;

            buyer.send('makeOfferToBuy', 25);
            const offer = await buyer.waitFor(() => buyer.player.group.offers.rows.find(o => o.open));
            assert.equal(buyer.player.cashAvailable, cash - 25);

            seller.send('acceptOTB', offer.id);
            await seller.waitFor(() => !offer.open);
            assert.equal(buyer.player.cash, cash - 25);
            assert.equal(buyer.player.shares, shares + 1);
            assert.equal(seller.player.cash, cash + 25);
            assert.equal(seller.player.shares, shares - 1);
            void app;
        },
    },
];
