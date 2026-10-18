// The GIMS app (client/apps/gims): its market engine (market.js), on its own, and sessions of its
// presets played by bots.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { startServer, until, CLIENT } = require('./harness.js');

const GIMS = path.join(CLIENT, 'apps/gims');
const market = require(path.join(GIMS, 'market.js'));
const { PRESETS, DEFAULTS } = require(path.join(GIMS, 'presets.js'));

// The engine

/** A book of traders (accounts by id) with rules over the defaults. */
function makeBook(traders, rules = {}) {
    const book = {
        orders: [],
        trades: [],
        addOrder(row) { row.id = book.orders.length; book.orders.push(row); return row; },
        addTrade(row) { row.id = book.trades.length; book.trades.push(row); return row; },
        trader: (id) => traders[id],
        rules: () => Object.assign({}, market.RULES, { tickSize: 1 }, rules),
        clock: 0,
        now: () => book.clock++,
    };
    return book;
}

const account = (cash, units, role = 'trader') => ({ cash, assets: [units], bought: [0], role });

test('engine: an order must be feasible, must not cross the book, and must improve on it', () => {
    const book = makeBook({ 1: account(100, 2), 2: account(100, 2) });
    assert.match(market.submitOrder(book, 1, { asset: 0, type: 'buy', price: 60, volume: 2 }).error, /enough cash/);
    assert.match(market.submitOrder(book, 1, { asset: 0, type: 'sell', price: 60, volume: 3 }).error, /enough units/);
    assert.match(market.submitOrder(book, 1, { asset: 0, type: 'buy', price: 10.5, volume: 1 }).error, /steps of 1/);
    assert.ok(market.submitOrder(book, 1, { asset: 0, type: 'buy', price: 40, volume: 1 }).order);
    assert.ok(market.submitOrder(book, 2, { asset: 0, type: 'sell', price: 50, volume: 1 }).order);
    assert.match(market.submitOrder(book, 2, { asset: 0, type: 'buy', price: 50, volume: 1 }).error, /below the lowest sell order/);
    assert.match(market.submitOrder(book, 2, { asset: 0, type: 'sell', price: 40, volume: 1 }).error, /above the highest buy order/);
    // GIMS's improvement rule: at least the best bid (equal is allowed), at most the best ask.
    assert.match(market.submitOrder(book, 2, { asset: 0, type: 'buy', price: 39, volume: 1 }).error, /at least the highest buy order/);
    assert.ok(market.submitOrder(book, 2, { asset: 0, type: 'buy', price: 40, volume: 1 }).order);
    assert.match(market.submitOrder(book, 1, { asset: 0, type: 'sell', price: 51, volume: 1 }).error, /at most the lowest sell order/);
    const free = makeBook({ 1: account(100, 2) }, { offerImprovement: false, maxOpenOrders: 1 });
    assert.ok(market.submitOrder(free, 1, { asset: 0, type: 'buy', price: 40, volume: 1 }).order);
    assert.match(market.submitOrder(free, 1, { asset: 0, type: 'buy', price: 30, volume: 1 }).error, /at most 1 open buy/);
});

test('engine: accepting takes the best order of others, with fees, and invalidates what is no longer feasible', () => {
    // Trader 2 has 10 in cash, for the fee on their sell order.
    const traders = { 1: account(100, 0), 2: account(10, 3), 3: account(1000, 0) };
    const book = makeBook(traders, { makeFee: 1, takeFee: 2 });
    market.submitOrder(book, 1, { asset: 0, type: 'buy', price: 45, volume: 2 }); // 2 × 46 = 92 ≤ 100
    const ask = market.submitOrder(book, 2, { asset: 0, type: 'sell', price: 60, volume: 3 }).order;
    assert.match(market.acceptOrder(book, 2, { asset: 0, side: 'sell', volume: 1, orderId: 99 }).error, /has changed/);
    // Trader 3 buys 2 of trader 2's 3 at 60: pays 62 a unit; trader 2 gets 59.
    const { trade } = market.acceptOrder(book, 3, { asset: 0, side: 'buy', volume: 2, orderId: ask.id });
    assert.deepEqual([trade.price, trade.volume, trade.buyer, trade.seller], [60, 2, 3, 2]);
    assert.deepEqual([traders[3].cash, traders[3].assets[0], traders[2].cash, traders[2].assets[0]], [1000 - 124, 2, 10 + 118, 1]);
    assert.equal(market.remaining(ask), 1);
    // Trader 2 sells their last unit to trader 1's bid of 45; trader 1 (the maker) pays 46.
    market.acceptOrder(book, 2, { asset: 0, side: 'sell', volume: 1 });
    assert.deepEqual([traders[1].cash, traders[1].assets[0]], [54, 1]);
    // Trader 1's bid has 1 unit left, which 54 still pays for; trader 2's last ask, with no units
    // left to sell, is invalidated.
    assert.deepEqual(book.orders.map((o) => o.status), ['open', 'invalidated']);
    // Trader 1 spends cash elsewhere: their bid is invalidated.
    traders[1].cash = 40;
    market.invalidateInfeasible(book);
    assert.equal(book.orders[0].status, 'invalidated');
});

test('engine: partial invalidation cuts an order to what is feasible; a trade can empty the book', () => {
    const traders = { 1: account(100, 0), 2: account(0, 5), 3: account(100, 0) };
    const book = makeBook(traders, { partialInvalidation: true });
    const bid = market.submitOrder(book, 1, { asset: 0, type: 'buy', price: 20, volume: 5 }).order;
    traders[1].cash = 50;
    market.invalidateInfeasible(book);
    assert.deepEqual([bid.status, market.remaining(bid), bid.invalidated], ['open', 2, 3]);
    const empty = makeBook({ 1: account(100, 0), 2: account(0, 5), 3: account(100, 0) }, { emptyBookAfterTrade: true });
    market.submitOrder(empty, 1, { asset: 0, type: 'buy', price: 10, volume: 1 });
    market.submitOrder(empty, 2, { asset: 0, type: 'sell', price: 30, volume: 2 });
    market.acceptOrder(empty, 3, { asset: 0, side: 'buy', volume: 1 });
    assert.deepEqual(empty.orders.map((o) => o.status), ['invalidated', 'invalidated']);
});

test('engine: roles, holding caps, purchase limits and short selling', () => {
    const traders = { 1: account(1000, 0, 'buyer'), 2: account(0, 10, 'seller'), 3: account(1000, 17) };
    const book = makeBook(traders, { holdingCap: 18, purchaseLimit: 2, shortAssets: 2 });
    assert.match(market.submitOrder(book, 1, { asset: 0, type: 'sell', price: 10, volume: 1 }).error, /buyer/);
    assert.match(market.submitOrder(book, 2, { asset: 0, type: 'buy', price: 10, volume: 1 }).error, /seller/);
    assert.match(market.submitOrder(book, 3, { asset: 0, type: 'buy', price: 10, volume: 2 }).error, /hold at most 18/);
    assert.match(market.submitOrder(book, 1, { asset: 0, type: 'buy', price: 10, volume: 3 }).error, /at most 2 units in a period/);
    // Short selling: trader 2 may sell 12 (10 held, 2 short).
    assert.ok(market.submitOrder(book, 2, { asset: 0, type: 'sell', price: 50, volume: 12 }).order);
    assert.match(market.submitOrder(book, 2, { asset: 0, type: 'sell', price: 50, volume: 13 }).error, /enough units/);
});

/** Call orders: [type, price or null, volume, maker]. */
const calls = (list) => list.map(([type, price, volume, maker], i) => ({ id: i + 1, asset: 0, type, price, volume, maker: maker || i + 1, time: i }));

test("engine: the call auction's price follows GIMS's five rules", () => {
    // 0: no trade.
    assert.deepEqual(market.auctionPrice(calls([['buy', 40, 1], ['sell', 50, 1]]), 1).rule, 0);
    // 1: one price maximizes volume (2 units at 55, 1 at 50).
    let a = market.auctionPrice(calls([['buy', 55, 2], ['sell', 55, 1], ['sell', 50, 1]]), 1);
    assert.deepEqual([a.price, a.volume, a.rule], [55, 2, 1]);
    // 2: 1 unit at 50 and at 60; the surplus is 2 at 50, 1 at 60.
    a = market.auctionPrice(calls([['buy', 60, 1], ['buy', 50, 2], ['sell', 50, 1], ['sell', 60, 1]]), 1);
    assert.deepEqual([a.price, a.volume, a.rule], [60, 1, 2]);
    // 3: 2 units at 50 and 60, a buy surplus of 1 at both: the higher.
    a = market.auctionPrice(calls([['buy', 60, 3], ['sell', 40, 1], ['sell', 50, 1]]), 1);
    assert.deepEqual([a.price, a.volume, a.rule], [60, 2, 3]);
    // 4: 2 units at 40 and 50, a sell surplus of 1 at both: the lower.
    a = market.auctionPrice(calls([['sell', 40, 3], ['buy', 60, 1], ['buy', 50, 1]]), 1);
    assert.deepEqual([a.price, a.volume, a.rule], [40, 2, 4]);
    // 5: no surplus at either: the average, rounded down when halfway.
    a = market.auctionPrice(calls([['buy', 60, 1], ['sell', 40, 1]]), 1);
    assert.deepEqual([a.price, a.rule], [50, 5]);
    a = market.auctionPrice(calls([['buy', 61, 1], ['sell', 40, 1]]), 1);
    assert.deepEqual([a.price, a.rule], [50, 5]);
});

test('engine: call auction settlement by price and time, market orders, and what traders can afford', () => {
    const traders = { 1: account(1000, 0), 2: account(1000, 0), 3: account(0, 2), 4: account(30, 0) };
    const book = makeBook(traders);
    // Two bids at 50 for one unit each, the earlier first; only 1 unit for sale at 50 or less.
    let auction = market.runCallAuction(book, 0, calls([['buy', 50, 1, 1], ['buy', 50, 1, 2], ['sell', 50, 1, 3]]));
    assert.deepEqual([auction.price, auction.volume], [50, 1]);
    assert.deepEqual([traders[1].assets[0], traders[2].assets[0], traders[3].cash], [1, 0, 50]);
    assert.deepEqual(book.orders.map((o) => o.status), ['traded', 'expired', 'traded']);
    // A market bid trades at the price, but only for what its trader's cash buys (30 at 25: 1 unit).
    const t2 = { 1: account(0, 3), 4: account(30, 0), 2: account(1000, 0) };
    const b2 = makeBook(t2);
    auction = market.runCallAuction(b2, 0, calls([['sell', 25, 3, 1], ['buy', null, 3, 4], ['buy', 25, 2, 2]]));
    assert.equal(auction.price, 25);
    assert.deepEqual([t2[4].assets[0], t2[2].assets[0], t2[1].assets[0]], [1, 2, 0]);
    assert.equal(t2[4].cash, 5);
});

test('engine: call orders are checked together', () => {
    const rules = Object.assign({}, market.RULES, { tickSize: 1, callMaxOrders: 1 });
    const t = account(100, 2);
    assert.match(market.checkCallOrders(t, rules, 0, [{ type: 'buy', price: 30, volume: 2 }, { type: 'buy', price: 20, volume: 1 }]).error, /at most 1 buy/);
    const any = Object.assign({}, rules, { callMaxOrders: 0 });
    assert.match(market.checkCallOrders(t, any, 0, [{ type: 'buy', price: 30, volume: 2 }, { type: 'buy', price: 50, volume: 1 }]).error, /cost more than your cash/);
    assert.match(market.checkCallOrders(t, any, 0, [{ type: 'buy', price: 30, volume: 1 }, { type: 'sell', price: 30, volume: 1 }]).error, /buy prices must be below/);
    assert.deepEqual(market.checkCallOrders(t, any, 0, [{ type: 'buy', price: 30, volume: 1 }, { type: 'sell', price: 31, volume: 2 }]), {});
});

test('engine: the fundamental value, with interest, is that of Giusti, Jiang and Xu (table 1)', () => {
    const fv = (d, r, K, left) => Math.round(market.fundamentalValue({ meanDividend: d, interest: r, buyback: K, periodsLeft: left }));
    assert.deepEqual([fv(24, 0.1, 72, 15), fv(24, 0.1, 72, 1)], [200, 87]);
    assert.deepEqual([fv(24, 0.1, 720, 15), fv(24, 0.1, 720, 1)], [355, 676]);
    assert.deepEqual([fv(-24, -0.1, 500, 15), fv(-24, -0.1, 500, 1)], [1503, 529]);
    assert.deepEqual([fv(24, 0, 0, 15), fv(0, 0, 360, 15), fv(1.4, 0.05, 28, 20)], [360, 360, 28]);
});

// Sessions

let server;
before(async () => { server = await startServer(); });
after(async () => { await server.close(); });

const APP = path.join(GIMS, 'app.jtt');

function gimsSession(preset, changes, n) {
    return server.createSession(APP, { numParticipants: n, options: { preset, changes: JSON.stringify(changes) } });
}

test('every preset loads, with its periods and stages', () => {
    assert.ok(Object.keys(PRESETS).length >= 20);
    for (const [id, preset] of Object.entries(PRESETS)) {
        const session = gimsSession(id, {}, preset.traders || 3);
        const app = session.apps[0];
        const s = Object.assign({}, DEFAULTS, preset);
        assert.equal(app.config.preset, id);
        assert.equal(app.numPeriods, s.practicePeriods + s.rounds * s.periods, id);
        const stages = app.stages.map((st) => st.id);
        assert.equal(stages.includes('trading'), s.mechanism !== 'call', id);
        assert.equal(stages.includes('callAuction'), s.mechanism !== 'cda', id);
        assert.equal(stages.includes('forecast'), s.forecasts != null, id);
        assert.ok(preset.reference && preset.notes, id + ' cites its source');
    }
});

/** Plays every period's stages that need nothing but OK, until test() says to act; returns. */
async function playThrough(bots, stage, period) {
    await Promise.all(bots.map((b) => b.play(stage, {}, { period })));
}

test('the SSW design: a trade, dividends and payoffs', async () => {
    const session = gimsSession('ssw', {
        traders: 3, periods: 2, tradingTime: 30, resultsTime: 0, assignment: 'order',
        assets: [{ name: 'Asset', dividends: [0, 8, 28, 60], dividendSequence: [8, 28] }],
    }, 3);
    const bots = await server.connectAll(session);
    session.start();
    const app = session.apps[0];
    await Promise.all(bots.map((b) => b.waitForStage('trading', { period: 1 })));
    const group = bots[0].player.group;
    // Types in order: P1 has 225 and 3 units, P2 585 and 2, P3 945 and 1.
    assert.deepEqual(bots.map((b) => [b.player.cash, b.player.assets[0]]), [[225, 3], [585, 2], [945, 1]]);
    assert.equal(group.value[0], 48);
    bots[0].send('gimsOrder', { asset: 0, type: 'sell', price: 50, volume: 1 });
    const ask = await until(() => group.orders.rows.find((o) => o.status === 'open'), { what: 'the ask' });
    // A bid of 60 would cross the ask: to buy at 50, a trader accepts it.
    bots[2].send('gimsOrder', { asset: 0, type: 'buy', price: 60, volume: 1 });
    await until(() => bots[2].player.notice != null, { what: 'the refusal' });
    assert.match(bots[2].player.notice.text, /below the lowest sell order/);
    bots[1].send('gimsAccept', { asset: 0, side: 'buy', volume: 1, orderId: ask.id });
    await until(() => group.trades.rows.length === 1, { what: 'the trade' });
    await playThrough(bots, 'trading', 1);
    await playThrough(bots, 'results', 1);
    await playThrough(bots, 'trading', 2);
    await playThrough(bots, 'results', 2);
    await playThrough(bots, 'payment', 2);
    await Promise.all(bots.map((b) => b.waitForEnd()));
    // P1: 225 + 50, then 2 units × (8 + 28); P2: 585 − 50 + 3 × 36; P3: 945 + 36.
    assert.deepEqual(session.payments().map((p) => p.points), [225 + 50 + 72, 585 - 50 + 108, 945 + 36]);
    assert.equal(app.exchangeRate, 0.01);
});

test('KHS T2: practice periods, a separate dividend account, cash inflows and a buyback value', async () => {
    const session = gimsSession('kirchler-huber-stockl-2012-t2', {
        traders: 2, periods: 2, practicePeriods: 1, tradingTime: 30, resultsTime: 0, assignment: 'order',
        assets: [{ name: 'Stock', dividends: [-5, 5], buyback: 50, dividendSequence: [5, -5] }],
    }, 2);
    const bots = await server.connectAll(session);
    session.start();
    // The practice period: a trade that does not count.
    await Promise.all(bots.map((b) => b.waitForStage('trading', { period: 1 })));
    const g1 = bots[0].player.group;
    assert.equal(g1.practice, true);
    bots[0].send('gimsOrder', { asset: 0, type: 'sell', price: 40, volume: 5 });
    const ask = await until(() => g1.orders.rows.find((o) => o.status === 'open'), { what: 'the ask' });
    bots[1].send('gimsAccept', { asset: 0, side: 'buy', volume: 5, orderId: ask.id });
    await until(() => g1.trades.rows.length === 1, { what: 'the trade' });
    assert.ok(bots[1].player.tasks.acceptSell);
    for (const stage of ['trading', 'results']) await playThrough(bots, stage, 1);
    // Round 1 starts again from the endowments.
    await Promise.all(bots.map((b) => b.waitForStage('trading', { period: 2 })));
    assert.deepEqual(bots.map((b) => [b.player.cash, b.player.assets[0], b.player.account]), [[3000, 20, 0], [1000, 60, 0]]);
    for (const stage of ['trading', 'results']) await playThrough(bots, stage, 2);
    for (const stage of ['trading', 'results', 'payment']) await playThrough(bots, stage, 3);
    await Promise.all(bots.map((b) => b.waitForEnd()));
    // Dividends 5 then −5 into the account (0 in all); inflows 444 and 556; 50 a unit at the end.
    assert.deepEqual(session.payments().map((p) => p.points), [3000 + 444 + 556 + 20 * 50, 1000 + 444 + 556 + 60 * 50]);
    const last = bots[0].players().pop();
    assert.deepEqual([last.cash, last.account, last.buybackValue], [4000, 0, 1000]);
});

test("HLN's call market: one bid and one ask each, forecasts paid on the market price", async () => {
    const session = gimsSession('haruvy-lahav-noussair-2007', {
        traders: 3, rounds: 1, periods: 1, resultsTime: 0, assignment: 'order',
        assets: [{ name: 'Asset', dividends: [0, 4, 14, 30], dividendSequence: [14] }],
    }, 3);
    const bots = await server.connectAll(session);
    session.start();
    for (const [i, b] of bots.entries()) await b.play('forecast', { 'player.forecast1': [50, 100, 45][i] }, { period: 1 });
    await Promise.all(bots.map((b) => b.waitForStage('callAuction', { period: 1 })));
    // P1 (472, 1 unit) bids 60 for 1; P3 (112, 3 units) asks 40 for 1, and cannot also bid 45.
    bots[0].send('gimsCallOrder', { asset: 0, type: 'buy', price: 60, volume: 1 });
    bots[2].send('gimsCallOrder', { asset: 0, type: 'sell', price: 40, volume: 1 });
    await until(() => bots[0].player.callOrders.length === 1 && bots[2].player.callOrders.length === 1, { what: 'the orders' });
    bots[2].send('gimsCallOrder', { asset: 0, type: 'buy', price: 45, volume: 1 });
    await until(() => bots[2].player.notice != null, { what: 'the refusal' });
    assert.match(bots[2].player.notice.text, /at most 1 buy and 1 sell|below your sell prices/);
    bots[2].send('gimsCallOrder', { asset: 0, type: 'sell', price: 41, volume: 1 });
    await until(() => bots[2].player.notice && /at most 1/.test(bots[2].player.notice.text), { what: 'the second refusal' });
    await playThrough(bots, 'callAuction', 1);
    await Promise.all(bots.map((b) => b.waitForStage('callResults', { period: 1 })));
    const group = bots[0].player.group;
    assert.deepEqual(group.auction[0], { price: 50, volume: 1, rule: 5 });
    for (const stage of ['callResults', 'results', 'payment']) await playThrough(bots, stage, 1);
    await Promise.all(bots.map((b) => b.waitForEnd()));
    // Forecasts of 50, 100 and 45 for a price of 50: within 10% (50), outside 50% (0), within 10%.
    assert.deepEqual(bots.map((b) => b.players()[0].forecastEarnings), [50, 0, 50]);
    // P1: 472 − 50 + 2 units × 14 + 50; P2: 292 + 2 × 14; P3: 112 + 50 + 2 × 14 + 50.
    assert.deepEqual(session.payments().map((p) => p.points), [472 - 50 + 28 + 50, 292 + 28, 112 + 50 + 28 + 50]);
});

test('trader roles, holding caps that end, and the vote to end a period', async () => {
    const session = gimsSession('tucker-xu-2024-nospec', {
        traders: 2, periods: 2, tradingTime: 60, resultsTime: 0, assignment: 'order', earlyEndingVote: true,
        holdingCap: 1, holdingCapUntil: 1,
    }, 2);
    const bots = await server.connectAll(session);
    session.start();
    await Promise.all(bots.map((b) => b.waitForStage('trading', { period: 1 })));
    const [buyer, seller] = bots;
    assert.deepEqual([buyer.player.role, seller.player.role], ['buyer', 'seller']);
    buyer.send('gimsOrder', { asset: 0, type: 'sell', price: 10, volume: 1 });
    await until(() => buyer.player.notice != null, { what: 'the refusal' });
    assert.match(buyer.player.notice.text, /buyer/);
    buyer.send('gimsOrder', { asset: 0, type: 'buy', price: 10, volume: 2 });
    await until(() => /hold at most 1/.test(buyer.player.notice.text), { what: 'the cap' });
    // Both vote: the period ends at once.
    buyer.send('gimsVote', { vote: true });
    await until(() => buyer.player.voted, { what: 'the vote' });
    assert.equal(buyer.stageId, 'trading');
    seller.send('gimsVote', { vote: true });
    await Promise.all(bots.map((b) => b.waitForStage('results', { period: 1 })));
    await playThrough(bots, 'results', 1);
    // In period 2 the cap is gone.
    await Promise.all(bots.map((b) => b.waitForStage('trading', { period: 2 })));
    buyer.send('gimsOrder', { asset: 0, type: 'buy', price: 10, volume: 2 });
    await until(() => buyer.player.group.orders.rows.length === 1, { what: 'the bid' });
});

test('control questions, a paid CRT, lottery choices, short selling, interest, a random market paid and a minimum payment', async () => {
    const session = gimsSession('giusti-jiang-xu-2014-negative', {
        traders: 2, rounds: 2, periods: 1, practicePeriods: 0, tradingTime: 30, resultsTime: 0,
        mechanism: 'call+cda', multiUnit: true, shortAssets: 1, crt: 'before', crtPay: 10, holtLaury: 'after',
        controlQuestions: [{ question: 'Does a unit pay 500 after the last period?', options: ['No', 'Yes'], answer: 1 }],
        payment: 'random', minPayoff: 47000,
        assets: [{ name: 'Shares', dividends: [0, -8, -28, -60], buyback: 500, dividendSequence: [-8] }],
    }, 2);
    const app = session.apps[0];
    assert.deepEqual(app.stages.map((s) => s.id), ['controlQuestions', 'crtBefore', 'callAuction', 'callResults', 'trading', 'results', 'riskAfter', 'payment']);
    const bots = await server.connectAll(session);
    session.start();
    const [p1, p2] = bots;
    await p1.play('controlQuestions', { 'player.cq1': 0 });
    assert.match((await p1.waitForFormErrors())['player.cq1'], /not right/);
    for (const b of bots) b.submit({ 'player.cq1': 1 });
    await p1.play('crtBefore', { 'player.crt1': 5, 'player.crt2': 5, 'player.crt3': 47 });
    await p2.play('crtBefore', { 'player.crt1': 10, 'player.crt2': 100, 'player.crt3': 24 });
    await playThrough(bots, 'callAuction', 1);
    await playThrough(bots, 'callResults', 1);
    // P1 sells 5 units, one more than they have.
    await Promise.all(bots.map((b) => b.waitForStage('trading', { period: 1 })));
    p1.send('gimsOrder', { asset: 0, type: 'sell', price: 400, volume: 5 });
    const ask = await until(() => p1.player.group.orders.rows.find((o) => o.status === 'open' && o.phase === 'cda'), { what: 'the ask' });
    p2.send('gimsAccept', { asset: 0, side: 'buy', volume: 5, orderId: ask.id });
    await until(() => p1.player.assets[0] === -1, { what: 'the short sale' });
    await playThrough(bots, 'trading', 1);
    await playThrough(bots, 'results', 1);
    for (const stage of ['callAuction', 'callResults', 'trading', 'results']) await playThrough(bots, stage, 2);
    const lotteries = {};
    for (let i = 1; i <= 10; i++) lotteries['player.hl' + i] = 'A';
    await Promise.all(bots.map((b) => b.play('riskAfter', lotteries, { period: 2 })));
    await playThrough(bots, 'payment', 2);
    await Promise.all(bots.map((b) => b.waitForEnd()));
    const players = bots.map((b) => b.players());
    assert.deepEqual(players.map((ps) => ps[0].crtEarnings), [30, 0]);
    // Round 1: P1 has 52,000, less 10%, plus 8 for the unit they are short, less 500 for it:
    // 46,308. P2: 48,000 less 10%, 9 units × −8, plus 9 × 500: 47,628. Round 2: no trades,
    // 50,000 less 10%, 4 × −8, plus 4 × 500: 46,968.
    assert.deepEqual(players.map((ps) => ps[1].roundPayoffs), [[46308, 46968], [47628, 46968]]);
    const paid = players[0][1].group.paidRound;
    assert.ok(paid === 1 || paid === 2);
    session.payments().forEach((p, i) => {
        const last = players[i][1];
        assert.ok([1.6, 2].includes(last.hlEarnings));
        const earned = players[i][0].crtEarnings + last.hlEarnings + last.roundPayoffs[paid - 1];
        assert.ok(Math.abs(p.points - Math.max(47000, earned)) < 1e-6, p.id + ': ' + p.points);
    });
});

test('signals by trader, and indicative prices in the call auction', async () => {
    const session = gimsSession('haruvy-lahav-noussair-2007', {
        traders: 2, rounds: 1, periods: 1, resultsTime: 0, forecasts: null, indicativePriceInterval: 0.1,
        assets: [{ name: 'Asset', dividends: [0, 4, 14, 30], signals: [[[10, 11], [20, 21]]] }],
    }, 2);
    const bots = await server.connectAll(session);
    session.start();
    await Promise.all(bots.map((b) => b.waitForStage('callAuction', { period: 1 })));
    assert.deepEqual(bots.map((b) => b.player.signals[0]), [[10, 11], [20, 21]]);
    const group = bots[0].player.group;
    assert.equal(group.indicative[0], null);
    bots[0].send('gimsCallOrder', { asset: 0, type: 'buy', price: 30, volume: 1 });
    bots[1].send('gimsCallOrder', { asset: 0, type: 'sell', price: 20, volume: 1 });
    await until(() => group.indicative[0] === 25, { what: 'the indicative price' });
    for (const stage of ['callAuction', 'callResults', 'results', 'payment']) await playThrough(bots, stage, 1);
    await Promise.all(bots.map((b) => b.waitForEnd()));
    assert.equal(group.auction[0].price, 25);
});
