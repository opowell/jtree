// The games in client/apps/1 sample games, as scripts for bots: each starts from a started
// session of the game with its bots connected, plays it and checks the results. Run on the
// games' own files (sample-games.test.js) and on descriptions of them (ir-roundtrip.test.js).

const assert = require('node:assert/strict');

module.exports = [
    {
        name: 'public good: payoffs follow contributions, in every period',
        file: 'public-good.jtt',
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
        file: 'dictator-game.jtt',
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
        participants: 4,
        async play({ bots, app }) {
            const guesses = [20, 40, 60, 100]; // average 55, target 36.67: 40 wins.
            for (let period = 1; period <= app.numPeriods; period++) {
                await Promise.all(bots.map((b, i) => b.play('decide', { 'player.guess': guesses[i] }, { period })));
                await Promise.all(bots.map(b => b.play('results', {}, { period })));
            }
            await Promise.all(bots.map(b => b.waitForEnd()));
            for (const [i, b] of bots.entries()) {
                for (const pl of b.players()) assert.equal(pl.points, i === 1 ? app.prize : 0);
            }
        },
    },
    {
        name: 'market entry: entrants share the market, the rest take the outside option',
        file: 'market-entry.jtt',
        participants: 4,
        async play({ bots, app }) {
            const enters = [true, true, false, false];
            for (let period = 1; period <= app.numPeriods; period++) {
                await Promise.all(bots.map((b, i) => b.play('decide', { 'player.enter': enters[i] }, { period })));
                await Promise.all(bots.map(b => b.play('results', {}, { period })));
            }
            await Promise.all(bots.map(b => b.waitForEnd()));
            // 1 + 2*(capacity 4 - 2 entrants) = 5 for entrants; outside option 1.
            for (const [i, b] of bots.entries()) {
                for (const pl of b.players()) {
                    assert.equal(pl.enter, enters[i]);
                    assert.equal(pl.points, enters[i] ? 5 : 1);
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
            assert.equal(p0.points, 1 + 2 * (10 - 1));
            assert.equal(p1.points, 3);
        },
    },
    {
        name: 'public good with punishment: punishment costs the punisher 1 and the target 2',
        file: 'public-good-w-punish.jtt',
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
        name: 'centipede: taking at the first move ends the game for that pair',
        file: 'centipede.jtt',
        participants: 2,
        async play({ bots }) {
            // Everyone is player A of one pair (pA_*) and player B of another (pB_*).
            await Promise.all(bots.map(b => b.play('pA_0', { 'player.choice1': 'TAKE' }, { period: 1 })));
            await Promise.all(bots.map(b => b.waitForStage('results', { period: 1 })));
            for (const b of bots) {
                const pl = b.players()[0];
                assert.equal(pl.passes1, 0);
                // 0.8 of the pie of 5 as taker, 0.2 of 5 as the other.
                assert.equal(pl.points, 0.8 * 5 + 0.2 * 5);
            }
        },
    },
    {
        name: 'real effort: correct sums score a point each, and the stage ends on time',
        file: 'real-effort-sums.jtt',
        participants: 1,
        options: { workTime: 1, numTasks: 3 },
        async play({ bots, app }) {
            const [bot] = bots;
            await bot.waitForStage('work');
            const sums = app.tasks.map(t => t.reduce((a, b) => a + b, 0));
            // Two right, one wrong, not submitted: the stage's 1-second timer submits them.
            bot.fill({ 'player.A0': sums[0], 'player.A1': sums[1], 'player.A2': sums[2] + 1 });
            await bot.waitForStage('results', { timeout: 4000 });
            assert.equal(bot.player.points, 2);
            assert.equal(bot.participant.score, 2);
        },
    },
    {
        name: 'double auction: a trade moves a share and its price between players',
        file: 'double-auction.jtt',
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
