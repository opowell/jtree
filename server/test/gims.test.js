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

test('engine: a cash reserve for short positions (Haruvy and Noussair 2006)', () => {
    // A reserve of 100 a unit short; trader 1 has 50 cash and 1 unit.
    const traders = { 1: account(50, 1), 2: account(1000, 0) };
    const book = makeBook(traders, { shortAssets: 1e9, shortReserve: 100 });
    // Selling 3 at 60 leaves 2 units short and 230 in cash, at least the 200 to keep: allowed.
    // Selling 4 leaves 3 short and 290, less than 300: refused.
    assert.match(market.submitOrder(book, 1, { asset: 0, type: 'sell', price: 60, volume: 4 }).error, /must keep/);
    const ask = market.submitOrder(book, 1, { asset: 0, type: 'sell', price: 60, volume: 3 }).order;
    assert.ok(ask);
    assert.equal(market.unitsSellable(traders[1], book.rules(0), 0, 0, 60), 3);
    market.acceptOrder(book, 2, { asset: 0, side: 'buy', volume: 3, orderId: ask.id });
    assert.deepEqual([traders[1].cash, traders[1].assets[0]], [230, -2]);
    // Buying back: with 230 cash, buying 1 at 100 leaves 130 for 1 unit short: allowed; at 200, 30 < 100: refused.
    assert.equal(market.unitsBuyable(traders[1], book.rules(0), 0, 100, 0), 2);
    assert.equal(market.unitsBuyable(traders[1], book.rules(0), 0, 200, 0), 0);
});

test('engine: a book of depth one, one order at a time, a price ceiling, and the midpoint call price', () => {
    const book = makeBook({ 1: account(500, 2), 2: account(500, 2) }, { singleBest: true, maxOpenOrdersTotal: 1, maxPrice: 100 });
    assert.match(market.submitOrder(book, 1, { asset: 0, type: 'buy', price: 101, volume: 1 }).error, /at most 100/);
    const first = market.submitOrder(book, 1, { asset: 0, type: 'buy', price: 40, volume: 1 }).order;
    assert.match(market.submitOrder(book, 1, { asset: 0, type: 'sell', price: 60, volume: 1 }).error, /at most 1 open order/);
    assert.match(market.submitOrder(book, 2, { asset: 0, type: 'buy', price: 40, volume: 1 }).error, /above the standing one/);
    // A better bid replaces the standing one.
    assert.ok(market.submitOrder(book, 2, { asset: 0, type: 'buy', price: 45, volume: 1 }).order);
    assert.equal(first.status, 'cancelled');
    assert.equal(book.orders.filter((o) => o.status === 'open').length, 1);
    // The most units trade at prices from 20 to 30: the midpoint is 25 (GIMS's rules say 20 or 30 by surplus).
    const orders = [
        { type: 'buy', price: 30, volume: 2 }, { type: 'sell', price: 20, volume: 2 }, { type: 'buy', price: 10, volume: 1 },
    ];
    assert.equal(market.auctionPrice(orders, 1, 'midpoint').price, 25);
});

test('engine: present values with holding taxes (Noussair and Powell 2010)', () => {
    const value = (tax, final, t) => market.presentValue(tax.slice(t - 1).map((x) => 24 - x), final);
    const peak = [48, 48, 48, 48, 48, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0];
    const valley = [0, 0, 0, 0, 0, 0, 0, 48, 48, 48, 48, 48, 48, 48, 48];
    assert.deepEqual([1, 8, 15].map((t) => value(peak, 0, t)), [24, 192, 24]);
    assert.deepEqual([1, 8, 15].map((t) => value(valley, 216, t)), [192, 24, 192]);
    // With interest, as fundamentalValue.
    assert.ok(Math.abs(market.presentValue([24, 24, 24], 72, 0.1) - market.fundamentalValue({ meanDividend: 24, buyback: 72, interest: 0.1, periodsLeft: 3 })) < 1e-9);
    assert.equal(market.drawDividend({ uniform: [50, 50] }), 50);
    assert.equal(market.meanDividend({ uniform: [50, 90] }), 70);
});

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
        assert.equal(stages.includes('controlQuestions'), s.controlQuestions.length > 0, id);
        assert.equal(stages.includes('crtBefore') || stages.includes('crtAfter'), s.crt != null, id);
        assert.equal(stages.includes('riskBefore') || stages.includes('riskAfter'), s.holtLaury != null, id);
        assert.ok(preset.reference && preset.notes, id + ' cites its source');
    }
});

/** A bot's player in the app that is stage stageId of the session's first app (its one run). */
function taskPlayer(bot, stageId) {
    return Object.values(bot.participant.players).find((p) => p.app().parentStage != null && p.app().parentStage.id === stageId);
}

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
    // The control questions, the CRT and the lottery choices are apps of their own, as stages.
    assert.deepEqual(['controlQuestions', 'crtBefore', 'riskAfter'].map((id) => path.basename(path.dirname(app.stages.find((s) => s.id === id).appFile))), ['control-questions', 'crt', 'holt-laury']);
    await p1.play('questions', { 'player.cq1': 0 });
    assert.match((await p1.waitForFormErrors())['player.cq1'], /not right/);
    for (const b of bots) b.submit({ 'player.cq1': 1 });
    await p1.play('crt', { 'player.crt1': 5, 'player.crt2': 5, 'player.crt3': 47 });
    await p2.play('crt', { 'player.crt1': 10, 'player.crt2': 100, 'player.crt3': 24 });
    await playThrough(bots, 'crtResult');
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
    await Promise.all(bots.map((b) => b.play('lotteries', lotteries)));
    await playThrough(bots, 'lotteryResult');
    await playThrough(bots, 'payment', 2);
    await Promise.all(bots.map((b) => b.waitForEnd()));
    const players = bots.map((b) => b.players());
    const crt = bots.map((b) => taskPlayer(b, 'crtBefore'));
    const lottery = bots.map((b) => taskPlayer(b, 'riskAfter'));
    assert.deepEqual(crt.map((p) => p.crtEarnings), [30, 0]);
    // Round 1: P1 has 52,000, less 10%, plus 8 for the unit they are short, less 500 for it:
    // 46,308. P2: 48,000 less 10%, 9 units × −8, plus 9 × 500: 47,628. Round 2: no trades,
    // 50,000 less 10%, 4 × −8, plus 4 × 500: 46,968.
    assert.deepEqual(players.map((ps) => ps[1].roundPayoffs), [[46308, 46968], [47628, 46968]]);
    const paid = players[0][1].group.paidRound;
    assert.ok(paid === 1 || paid === 2);
    session.payments().forEach((p, i) => {
        const last = players[i][1];
        assert.ok([1.6, 2].includes(lottery[i].hlEarnings));
        assert.deepEqual(last.taskEarnings, [{ label: 'The three questions', points: crt[i].crtEarnings }, { label: 'The lottery choices', points: lottery[i].hlEarnings }].filter((t) => t.points !== 0));
        const earned = crt[i].crtEarnings + lottery[i].hlEarnings + last.roundPayoffs[paid - 1];
        assert.ok(Math.abs(p.points - Math.max(47000, earned)) < 1e-6, p.id + ': ' + p.points);
        assert.ok(Math.abs(last.totalPoints - p.points) < 1e-6);
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

/** Plays stages in order through a period, each with the same values for every bot. */
async function playStages(bots, stages, period, values = {}) {
    for (const stage of stages) await Promise.all(bots.map((b) => b.play(stage, values, { period })));
}

test('holding taxes, announcements (drawn, by the market), and a period length by round', async () => {
    const session = gimsSession('noussair-powell-2010-peak', {
        traders: 2, rounds: 2, periods: 2, practicePeriods: 0, tradingTime: [30, 20], resultsTime: 0, assignment: 'order',
        assets: [{ name: 'Shares', dividends: [0, 8, 28, 60], dividendSequence: [8, 8], tax: [48, 0] }],
        endowments: [{ cash: 1000, assets: 2 }, { cash: 1000, assets: 1 }],
        announcements: [{ periods: [1], text: { draw: ['A', 'B'] } }, { periods: [2], text: { above: 'High', below: 'Low' } }],
    }, 2);
    const app = session.apps[0];
    const bots = await server.connectAll(session);
    session.start();
    await Promise.all(bots.map((b) => b.waitForStage('trading', { period: 1 })));
    const g1 = bots[0].player.group;
    // The value: 24 − 48 + 24 in period 1, 24 in period 2.
    assert.deepEqual([g1.value[0], g1.valueTable[0].map((r) => r.value)], [0, [0, 24]]);
    assert.equal(app.stages.find((s) => s.id === 'trading').getGroupDuration(g1), 30);
    const drawn = g1.announcements[0];
    assert.ok(['A', 'B'].includes(drawn));
    // A trade at 30, above the value of 0.
    bots[0].send('gimsOrder', { asset: 0, type: 'sell', price: 30, volume: 1 });
    const ask = await until(() => g1.orders.rows.find((o) => o.status === 'open'), { what: 'the ask' });
    bots[1].send('gimsAccept', { asset: 0, side: 'buy', volume: 1, orderId: ask.id });
    await until(() => g1.trades.rows.length === 1, { what: 'the trade' });
    await playStages(bots, ['trading', 'results'], 1);
    await Promise.all(bots.map((b) => b.waitForStage('trading', { period: 2 })));
    assert.deepEqual(bots[0].player.group.announcements, ['High']);
    // Taxes: 48 a unit after period 1. P1: 1000 + 30 + 8 − 48, then + 8; P2: 1000 − 30 + 2 × (8 − 48), then 2 × 8.
    assert.deepEqual(bots.map((b) => b.player.cash), [990, 890]);
    await playStages(bots, ['trading', 'results'], 2);
    await Promise.all(bots.map((b) => b.waitForStage('trading', { period: 3 })));
    const g3 = bots[0].player.group;
    assert.equal(app.stages.find((s) => s.id === 'trading').getGroupDuration(g3), 20);
    // The drawn announcement is the same in every market of the session.
    assert.deepEqual(g3.announcements, [drawn]);
    await playStages(bots, ['trading', 'results'], 3);
    await playStages(bots, ['trading', 'results', 'payment'], 4);
    await Promise.all(bots.map((b) => b.waitForEnd()));
    assert.deepEqual(bots.map((b) => b.players().pop().roundPayoffs[0]), [998, 906]);
});

test("Fellner and Theissen: drawn values, private signals, profits, short selling by block, a market from each block paid", async () => {
    const session = gimsSession('fellner-theissen-2014-pa80', {
        rounds: 4, tradingTime: 30, resultsTime: 0, paymentBlocks: [2, 2],
        byRound: [{ from: 1, to: 2, shortAssets: 0 }, { from: 3, to: 4, shortAssets: 1e9 }],
    }, 10);
    const bots = await server.connectAll(session);
    session.start();
    await Promise.all(bots.map((b) => b.waitForStage('trading', { period: 1 })));
    const players = bots.map((b) => b.player);
    // In each endowment group of 5, 4 signals say the right value.
    const group = players[0].group;
    for (const type of [1, 2]) {
        const signals = players.filter((p) => p.type === type).map((p) => p.signal);
        assert.equal(signals.length, 5);
        const counts = ['high', 'low'].map((l) => signals.filter((x) => x === l).length).sort();
        assert.deepEqual(counts, [1, 4]);
    }
    // A trader with 1 unit sells it, and cannot sell another: no short selling in round 1.
    const sell = async (round) => {
        await Promise.all(bots.map((b) => b.waitForStage('trading', { period: round })));
        const seller = bots.find((b) => b.player.assets[0] === 1);
        const buyer = bots.find((b) => b !== seller);
        const g = seller.player.group;
        seller.send('gimsOrder', { asset: 0, type: 'sell', price: 150, volume: 1 });
        const ask = await until(() => g.orders.rows.find((o) => o.status === 'open'), { what: 'the ask' });
        buyer.send('gimsAccept', { asset: 0, side: 'buy', volume: 1, orderId: ask.id });
        await until(() => seller.player.assets[0] === 0, { what: 'the sale' });
        seller.send('gimsOrder', { asset: 0, type: 'sell', price: 150, volume: 1 });
        return { seller, buyer, g };
    };
    const r1 = await sell(1);
    await until(() => r1.seller.player.notice != null, { what: 'the refusal' });
    assert.match(r1.seller.player.notice.text, /enough units/);
    for (let r = 1; r <= 2; r++) await playStages(bots, ['trading', 'results'], r);
    // Round 3 allows short selling: the second ask stands.
    const r3 = await sell(3);
    await until(() => r3.g.orders.rows.filter((o) => o.status === 'open').length === 1, { what: 'the short ask' });
    for (let r = 3; r <= 4; r++) await playStages(bots, ['trading', 'results'], r);
    await playStages(bots, ['payment'], 4);
    await Promise.all(bots.map((b) => b.waitForEnd()));
    const last = bots.map((b) => b.players().pop());
    // A trade at 150: the seller's profit is 150 less the value, the buyer's the value less 150.
    for (const [r, x] of [[1, r1], [3, r3]]) {
        const v = x.g.final ? x.g.final[0] : bots[0].players()[r - 1].group.final[0];
        const profit = (b) => b.players().pop().roundPayoffs[r - 1];
        assert.equal(profit(x.seller), 150 - v);
        assert.equal(profit(x.buyer), v - 150);
    }
    assert.equal(last.reduce((s, p) => s + p.roundPayoffs[1], 0), 0);
    const paid = last[0].group.paidRounds;
    assert.ok(paid.length === 2 && paid[0] <= 2 && paid[1] >= 3, String(paid));
    const values = bots[0].players().map((p) => p.group.final && p.group.final[0]).filter((x) => x != null);
    assert.ok(values.length === 4 && values.every((v) => v === 100 || v === 200), String(values));
});

test('Palfrey and Wang: a drawn value, public news, cash carried from market to market, and a loan', async () => {
    const session = gimsSession('palfrey-wang-2012', {
        traders: 2, practicePeriods: 0, rounds: 2, periods: 3, tradingTime: 30, resultsTime: 0, assignment: 'order',
    }, 2);
    const bots = await server.connectAll(session);
    session.start();
    await Promise.all(bots.map((b) => b.waitForStage('trading', { period: 1 })));
    const g1 = bots[0].player.group;
    bots[0].send('gimsOrder', { asset: 0, type: 'sell', price: 60, volume: 1 });
    const ask = await until(() => g1.orders.rows.find((o) => o.status === 'open'), { what: 'the ask' });
    bots[1].send('gimsAccept', { asset: 0, side: 'buy', volume: 1, orderId: ask.id });
    await until(() => g1.trades.rows.length === 1, { what: 'the trade' });
    await playStages(bots, ['trading', 'results'], 1);
    // News after periods 1 and 2, not after the last.
    for (const t of [2, 3]) await playStages(bots, ['trading', 'results'], t);
    const round1 = bots[0].players()[2];
    assert.deepEqual(round1.carried.past.map((r) => r.news != null), [true, true, false]);
    assert.ok(round1.carried.past.slice(0, 2).every((r) => ['good news', 'bad news'].includes(r.news)));
    const v = round1.group.final[0];
    assert.ok(v === 100 || v === 20);
    // Market 2 starts with the cash market 1 ended with, and 3 units.
    await Promise.all(bots.map((b) => b.waitForStage('trading', { period: 4 })));
    assert.deepEqual(bots.map((b) => [b.player.cash, b.player.assets[0]]), [[860 + 2 * v, 3], [740 + 4 * v, 3]]);
    for (const t of [4, 5, 6]) await playStages(bots, ['trading', 'results'], t);
    await playStages(bots, ['payment'], 6);
    await Promise.all(bots.map((b) => b.waitForEnd()));
    const v2 = bots[0].players()[5].group.final[0];
    // Earnings: final cash less the 800 loan.
    // P1 sold a unit at 60 and held 2; P2 bought it and held 4; both held 3 in market 2.
    assert.deepEqual(bots.map((b) => b.players().pop().totalPoints), [60 + 2 * v + 3 * v2, -60 + 4 * v + 3 * v2]);
});

test('Schoenberg and Haruvy: lottery tickets, the account status with the largest account, and a rating', async () => {
    const session = gimsSession('schoenberg-haruvy-2012-up', {
        traders: 2, practicePeriods: 0, periods: 1, tradingTime: 30, assignment: 'order', lottery: { price: 6, prize: 120, chance: 1 },
    }, 2);
    const app = session.apps[0];
    assert.deepEqual(app.stages.map((s) => s.id), ['trading', 'lottery', 'results', 'payment']);
    const bots = await server.connectAll(session);
    session.start();
    await Promise.all(bots.map((b) => b.waitForStage('trading', { period: 1 })));
    const g = bots[0].player.group;
    bots[1].send('gimsOrder', { asset: 0, type: 'buy', price: 100, volume: 1 });
    await until(() => g.orders.rows.length === 1, { what: 'the bid' });
    await playStages(bots, ['trading'], 1);
    await bots[0].play('lottery', { 'player.lotteryTicket': 'yes' });
    await bots[1].play('lottery', { 'player.lotteryTicket': 'no' });
    await Promise.all(bots.map((b) => b.waitForStage('results', { period: 1 })));
    // Two traders are both of the filler type, 585 and 2 units. P1 won 120 for a ticket of 6.
    // Units at the best bid, 100.
    const d = g.dividend[0];
    assert.deepEqual(bots.map((b) => b.player.accountTotal), [585 + 2 * d + 114 + 200, 585 + 2 * d + 200]);
    assert.equal(g.reference, Math.max(...bots.map((b) => b.player.accountTotal)));
    await bots[0].play('results', {});
    assert.ok((await bots[0].waitForFormErrors())['player.rating']);
    for (const b of bots) b.submit({ 'player.rating': 5 });
    await playStages(bots, ['payment'], 1);
    await Promise.all(bots.map((b) => b.waitForEnd()));
    assert.deepEqual(bots.map((b) => b.players()[0].rating), [5, 5]);
    assert.deepEqual(session.payments().map((p) => p.points), [585 + 2 * d + 114, 585 + 2 * d]);
});

test('Haruvy, Noussair and Powell: a computerized firm buys back its target of shares', async () => {
    const session = gimsSession('haruvy-noussair-powell-2014-repurchase', {
        traders: 2, practicePeriods: 0, periods: 2, tradingTime: 30, resultsTime: 0, assignment: 'order',
        endowments: [{ cash: 1000, assets: 2 }], firm: { period: 2, side: 'buy', units: 2, interval: 0.05, threshold: 10 },
    }, 2);
    const bots = await server.connectAll(session);
    session.start();
    await Promise.all(bots.map((b) => b.waitForStage('trading', { period: 1 })));
    await playStages(bots, ['trading', 'results'], 1);
    await Promise.all(bots.map((b) => b.waitForStage('trading', { period: 2 })));
    const g = bots[0].player.group;
    // An ask of 50 and no bids: the firm bids 40, 10 below it; then, the spread being 10, it buys at the ask.
    bots[0].send('gimsOrder', { asset: 0, type: 'sell', price: 50, volume: 1 });
    await until(() => g.trades.rows.length === 1, { what: "the firm's first purchase" });
    assert.deepEqual([g.trades.rows[0].buyer, g.trades.rows[0].price], [0, 50]);
    bots[1].send('gimsOrder', { asset: 0, type: 'sell', price: 70, volume: 1 });
    await until(() => g.trades.rows.length === 2, { what: "the firm's second purchase" });
    // Its target reached, it has no open orders, and buys no more.
    bots[1].send('gimsOrder', { asset: 0, type: 'sell', price: 70, volume: 1 });
    await new Promise((r) => setTimeout(r, 300));
    assert.equal(g.trades.rows.length, 2);
    assert.ok(!g.orders.rows.some((o) => o.maker === 0 && o.status === 'open'));
    await playStages(bots, ['trading', 'results', 'payment'], 2);
    await Promise.all(bots.map((b) => b.waitForEnd()));
    assert.deepEqual(bots.map((b) => b.players().pop().assets[0]), [1, 1]);
});

test('Stöckl, Huber and Kirchler: a value that follows a random path, shown after each period and paid at the end', async () => {
    const session = gimsSession('stockl-huber-kirchler-2014-trimodal', {
        traders: 2, practicePeriods: 0, periods: 3, tradingTime: 30, resultsTime: 0,
    }, 2);
    const bots = await server.connectAll(session);
    session.start();
    const values = [];
    for (let t = 1; t <= 3; t++) {
        await Promise.all(bots.map((b) => b.waitForStage('trading', { period: t })));
        const g = bots[0].player.group;
        values.push(g.value[0]);
        assert.deepEqual(g.valueTable[0].map((r) => r.value), values);
        await playStages(bots, ['trading', 'results'], t);
    }
    await playStages(bots, ['payment'], 3);
    await Promise.all(bots.map((b) => b.waitForEnd()));
    const last = bots[0].players().pop();
    const final = last.group.final[0];
    assert.equal(values[0], 45);
    for (const [a, b] of [[values[0], values[1]], [values[1], values[2]], [values[2], final]]) assert.ok([-3, 0, 3].includes(b - a));
    assert.deepEqual(session.payments().map((p) => p.points), [3600 + 40 * final, 3600 + 40 * final]);
});

test('Oechssler, Schmidt and Schnedler: final values with supplements, an insider, and a chat', async () => {
    const session = gimsSession('oechssler-schmidt-schnedler-2011-infchat', {
        traders: 2, practicePeriods: 0, rounds: 1, periods: 2, tradingTime: 30, resultsTime: 0, chatTime: 30,
        supplements: { amounts: [80, 40], insider: 1 },
    }, 2);
    const app = session.apps[0];
    assert.deepEqual(app.stages.map((s) => s.id), ['chat', 'trading', 'results', 'payment']);
    const bots = await server.connectAll(session);
    session.start();
    await Promise.all(bots.map((b) => b.waitForStage('trading', { period: 1 })));
    // One trader is told one supplement; the group does not show the values.
    const insiders = bots.filter((b) => b.player.insider != null);
    assert.equal(insiders.length, 1);
    const g1 = bots[0].player.group;
    assert.equal(g1.final, null);
    await playStages(bots, ['trading', 'results'], 1);
    // The chat, from day 2.
    await Promise.all(bots.map((b) => b.waitForStage('chat', { period: 2 })));
    bots[0].send('gimsChat', { text: 'Hello' });
    const g2 = bots[0].player.group;
    await until(() => g2.chat.rows.length === 1, { what: 'the message' });
    // Wealth: cash, and 50 units not yet traded at their value, 94.
    assert.deepEqual([g2.chat.rows[0].text, g2.chat.rows[0].from, g2.chat.rows[0].wealth], ['Hello', 1, 10000 + 50 * 94]);
    await playStages(bots, ['chat', 'trading', 'results', 'payment'], 2);
    await Promise.all(bots.map((b) => b.waitForEnd()));
    const final = bots[0].players().pop().group.final;
    const { amount, asset } = insiders[0].players()[0].insider;
    assert.ok(final[asset] - amount >= 50 && final[asset] - amount <= 90);
    assert.equal(final.filter((v) => v > 90).length >= 1, true);
    // Cash less the 5000 loan, and 10 units of each asset at its final value.
    const units = final.reduce((s, v) => s + 10 * v, 0);
    assert.deepEqual(session.payments().map((p) => p.points), [5000 + units, 5000 + units]);
});

test('Fischbacher, Hens and Zeisberger: bonds, and a rate that rises in its periods', async () => {
    const session = gimsSession('fischbacher-hens-zeisberger-2013-exogenous', {
        traders: 2, periods: 5, tradingTime: 30, resultsTime: 0,
        assets: [{ name: 'Shares', dividends: [0, 8, 28, 60], dividendSequence: [0, 0, 0, 0, 0] }],
    }, 2);
    const app = session.apps[0];
    assert.deepEqual(app.stages.map((s) => s.id), ['bonds', 'trading', 'results', 'payment']);
    const bots = await server.connectAll(session);
    session.start();
    const rates = [];
    for (let t = 1; t <= 5; t++) {
        await Promise.all(bots.map((b) => b.waitForStage('bonds', { period: t })));
        rates.push(bots[0].player.group.bondRate);
        await bots[0].play('bonds', { 'player.bondInput': t === 1 ? 5000 : 1000 }, { period: t });
        if (t === 1) {
            assert.match((await bots[0].waitForFormErrors())['player.bondInput'], /from 0 to your cash/);
            bots[0].submit({ 'player.bondInput': 1000 });
        }
        await bots[1].play('bonds', { 'player.bondInput': 0 }, { period: t });
        await Promise.all(bots.map((b) => b.waitForStage('trading', { period: t })));
        assert.equal(bots[0].player.cash, 2600);
        await playStages(bots, ['trading', 'results'], t);
    }
    await playStages(bots, ['payment'], 5);
    await Promise.all(bots.map((b) => b.waitForEnd()));
    assert.deepEqual(rates, [0.05, 0.05, 0.05, 0.11, 0.11]);
    // Interest paid at the end, into the account: 1000 × (0.05 × 3 + 0.11 × 2) = 370.
    const last = bots[0].players().pop();
    assert.deepEqual([last.cash, last.account], [3600, 370]);
});

test('dividends drawn at the end for the units held each period, a truncated asset, and questions with numbers for answers', async () => {
    const session = gimsSession('ackert-charupat-deaves-kluger-2009', {
        traders: 2, periods: 4, tradingTime: 30, resultsTime: 0, dividendTiming: 'end',
        assets: [
            { name: 'Stock A', dividends: [20] },
            { name: 'Stock B', dividends: [20], maxPayouts: 3 },
        ],
        controlQuestions: [{ question: 'What does a unit of A pay in all, at most?', answer: 80 }],
    }, 2);
    const bots = await server.connectAll(session);
    session.start();
    await bots[0].play('questions', { 'player.cq1': 60 });
    assert.match((await bots[0].waitForFormErrors())['player.cq1'], /not right/);
    for (const b of bots) b.submit({ 'player.cq1': 80 });
    // In period 2, P1 sells P2 a unit of A at 10.
    await playStages(bots, ['trading', 'results'], 1);
    await Promise.all(bots.map((b) => b.waitForStage('trading', { period: 2 })));
    const g = bots[0].player.group;
    bots[0].send('gimsOrder', { asset: 0, type: 'sell', price: 10, volume: 1 });
    const ask = await until(() => g.orders.rows.find((o) => o.status === 'open'), { what: 'the ask' });
    bots[1].send('gimsAccept', { asset: 0, side: 'buy', volume: 1, orderId: ask.id });
    await until(() => g.trades.rows.length === 1, { what: 'the trade' });
    await playStages(bots, ['trading', 'results'], 2);
    assert.equal(bots[0].players()[1].dividends, 0);
    for (const t of [3, 4]) await playStages(bots, ['trading', 'results'], t);
    await playStages(bots, ['payment'], 4);
    await Promise.all(bots.map((b) => b.waitForEnd()));
    // A pays 20 a period for the units held then: P1 held 2, 1, 1 and 1 units, P2 2, 3, 3 and 3.
    // B pays 20 for its first three periods only, on 2 units each.
    const last = bots.map((b) => b.players().pop());
    assert.deepEqual(last[0].group.endDividends, [[20, 20, 20, 20], [20, 20, 20, 0]]);
    assert.deepEqual(last.map((p) => p.dividends), [5 * 20 + 2 * 3 * 20, 11 * 20 + 2 * 3 * 20]);
});

test('subsidies (negative taxes) and a maximum payment', async () => {
    const session = gimsSession('breaban-noussair-2015-bear', {
        traders: 2, rounds: 1, periods: 2, tradingTime: 30, resultsTime: 0, crt: null, holtLaury: null, maxPayoff: 4000,
        assets: [{ name: 'Asset', dividends: [10, -10], dividendSequence: [10, -10], tax: [0, -10], buyback: 40 }],
    }, 2);
    const bots = await server.connectAll(session);
    session.start();
    await Promise.all(bots.map((b) => b.waitForStage('trading', { period: 1 })));
    // The value: 10 (subsidy) + 40 (buyback) in period 1.
    assert.equal(bots[0].player.group.value[0], 50);
    await playStages(bots, ['trading', 'results'], 1);
    await playStages(bots, ['trading', 'results', 'payment'], 2);
    await Promise.all(bots.map((b) => b.waitForEnd()));
    const last = bots[0].players().pop();
    // 3600 + 10 × 10, then 10 × (−10) and a subsidy of 10 × 10, then 40 a unit: 4100, cut to 4000.
    assert.deepEqual([last.tax, last.roundPayoffs[0], last.topUp, last.totalPoints], [-100, 4100, -100, 4000]);
});
