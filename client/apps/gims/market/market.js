// The market engine of the GIMS app (app.jtt): a continuous double auction and a call auction,
// with the order rules of GIMS, the Graz-Innsbruck Market System (Palan 2015). It is plain
// functions over plain objects, so that it can be used, and tested, without jtree.
//
// A book is what the engine works on:
//
//     {
//         orders: [],             the open and closed orders, as rows (see newOrder)
//         trades: [],             the trades
//         addOrder(row),          adds a row to orders and returns it, with an id
//         addTrade(row),          the same for trades
//         trader(id),             a trader's account: { cash, assets: [units per asset],
//                                 role: 'trader' | 'buyer' | 'seller', bought: [units bought
//                                 this period, per asset] }, which the engine changes
//         rules(asset),           the market rules for an asset (see RULES)
//         now(),                  seconds since the period's trading started
//     }
//
// Orders: { id, asset, type: 'buy' | 'sell', price (null for a market order), volume,
// transacted, invalidated, status: 'open' | 'traded' | 'cancelled' | 'invalidated' | 'expired',
// maker, time, phase: 'cda' | 'call' }. Trades: { id, asset, price, volume, buyer, seller,
// maker, taker, order, time, phase, bestBid, bestAsk }.

/** The market rules, with GIMS's defaults (v8.4.2, programs P3, P3a, P3b and P7). */
const RULES = {
    multiUnit: true,             // MultiUnitTrading: orders for more than one unit
    tickSize: 0.01,              // TickSize: prices are multiples of it
    offerImprovement: true,      // OfferImprovementRule: a new bid at least the best bid, a new ask at most the best ask
    emptyBookAfterTrade: false,  // EmptyBookAfterTrade: a trade invalidates the asset's other orders
    partialInvalidation: false,  // PartialInvalidation: an order no longer feasible is cut to what is, if anything is
    maxOpenOrders: 0,            // SpamControl: open bids (and asks) per trader and asset; 0 for any number
    makeFee: 0,                  // MakeFee: per unit, paid by an order's maker
    takeFee: 0,                  // TakeFee: per unit, paid by the trader who accepts an order
    shortCash: 0,                // ShortingCapacityCash: how far below zero cash may go
    shortAssets: 0,              // ShortingCapacityAssets: how many units a trader may be short
    shortReserve: 0,             // cash a trader must keep for each unit they are short (Haruvy and Noussair 2006)
    holdingCap: null,            // the most units a trader may hold (Lugovskyy et al. 2014); null for no cap
    purchaseLimit: null,         // the most units a trader may buy in a period; null for no limit
    maxPrice: null,              // the highest price an order may have; null for any
    singleBest: false,           // only the best bid and the best ask stand: a better one replaces it (a book of depth one)
    maxOpenOrdersTotal: 0,       // open orders per trader and asset, bids and asks together; 0 for any number
    callMaxOrders: 0,            // NumTypedOffersCallAuction: bids (and asks) per trader in a call; 0 for any number
    marketOrders: true,          // AllowMarketOrders: market orders in the call auction
    marketOrderPriority: true,   // MarketOrderPriority: market orders before limit orders at the auction price
    rationing: 'time',           // who trades at the auction price when not all can: 'time' (GIMS) or 'random'
    callPrice: 'gims',           // the call auction's price: 'gims' (its five rules) or 'midpoint' of the prices that trade the most
};

const EPS = 1e-9;

function decimals(x) {
    const s = String(x);
    const i = s.indexOf('.');
    return i < 0 ? 0 : s.length - i - 1;
}

/** x rounded to a multiple of tick (half up), without floating-point dust. */
function roundToTick(x, tick) {
    if (!(tick > 0)) return x;
    return Number((Math.round(x / tick + EPS) * tick).toFixed(decimals(tick)));
}

function isTickMultiple(x, tick) {
    if (!(tick > 0)) return true;
    return Math.abs(x / tick - Math.round(x / tick)) < 1e-6;
}

/** What is left to trade of an order. */
function remaining(order) {
    return order.volume - order.transacted - order.invalidated;
}

function openOrders(book, asset, type) {
    return book.orders.filter((o) => o.status === 'open' && o.asset === asset && (type == null || o.type === type));
}

/** Orders by priority: best price first, then earliest. */
function byPriority(a, b) {
    if (a.price !== b.price) return a.type === 'buy' ? b.price - a.price : a.price - b.price;
    return a.time - b.time || a.id - b.id;
}

/** The best open order of a type in an asset, optionally not one of trader's; null if none. */
function bestOrder(book, asset, type, notOf) {
    const orders = openOrders(book, asset, type).filter((o) => notOf == null || o.maker !== notOf);
    orders.sort(byPriority);
    return orders[0] || null;
}

function bestPrice(book, asset, type) {
    const o = bestOrder(book, asset, type);
    return o == null ? null : o.price;
}

/**
 * Whether trader, after a trade that changes their units of asset by dUnits and their cash by
 * dCash, still has the cash reserve for their short position (rules.shortReserve a unit short).
 */
function reserveKept(trader, rules, asset, dUnits, dCash) {
    if (!(rules.shortReserve > 0)) return true;
    const short = Math.max(0, -(trader.assets[asset] + dUnits));
    return trader.cash + dCash + rules.shortCash + EPS >= rules.shortReserve * short;
}

/** How many units trader can buy at price (plus fee per unit), by cash, cap, purchase limit and reserve. */
function unitsBuyable(trader, rules, asset, price, fee) {
    let units = Infinity;
    const cost = price + fee;
    if (cost > 0) units = Math.floor((trader.cash + rules.shortCash) / cost + EPS);
    if (rules.holdingCap != null) units = Math.min(units, rules.holdingCap - trader.assets[asset]);
    if (rules.purchaseLimit != null) units = Math.min(units, rules.purchaseLimit - (trader.bought[asset] || 0));
    // A trader who is short and buys back fewer units than they are short keeps a reserve for the rest.
    if (units >= 1 && units < Infinity && !reserveKept(trader, rules, asset, units, -cost * units)) {
        const r = rules.shortReserve;
        const short = -trader.assets[asset];
        units = cost > r ? Math.floor((trader.cash + rules.shortCash - r * short) / (cost - r) + EPS) : 0;
    }
    return Math.max(0, units);
}

/**
 * How many units trader can sell, by holdings and shorting capacity (and cash for a fee), and,
 * at price, by the cash reserve their short position needs.
 */
function unitsSellable(trader, rules, asset, fee, price) {
    let units = trader.assets[asset] + rules.shortAssets;
    if (fee > 0) units = Math.min(units, Math.floor((trader.cash + rules.shortCash) / fee + EPS));
    const net = (price == null ? 0 : price) - fee;
    if (rules.shortReserve > net) {
        const r = rules.shortReserve;
        units = Math.min(units, Math.floor((trader.cash + rules.shortCash + r * trader.assets[asset]) / (r - net) + EPS));
    }
    return Math.max(0, units);
}

/** Why trader cannot buy volume units at price (with fee), or null if they can. */
function whyNotBuy(trader, rules, asset, price, volume, fee) {
    if (trader.role === 'seller') return 'You are a seller: you can only sell.';
    if ((price + fee) * volume > trader.cash + rules.shortCash + EPS) return 'You do not have enough cash for this.';
    if (rules.holdingCap != null && trader.assets[asset] + volume > rules.holdingCap) {
        return 'You may hold at most ' + rules.holdingCap + ' units.';
    }
    if (rules.purchaseLimit != null && (trader.bought[asset] || 0) + volume > rules.purchaseLimit) {
        return 'You may buy at most ' + rules.purchaseLimit + ' units in a period.';
    }
    if (!reserveKept(trader, rules, asset, volume, -(price + fee) * volume)) return RESERVE_ERROR;
    return null;
}

const RESERVE_ERROR = 'You would not have the cash you must keep for the units you are short.';

/** Why trader cannot sell volume units at price (paying fee per unit), or null if they can. */
function whyNotSell(trader, rules, asset, volume, fee, price) {
    if (trader.role === 'buyer') return 'You are a buyer: you can only buy.';
    if (volume > trader.assets[asset] + rules.shortAssets) return 'You do not have enough units for this.';
    if (fee * volume > trader.cash + rules.shortCash + EPS) return 'You do not have enough cash for the fee.';
    if (!reserveKept(trader, rules, asset, -volume, ((price == null ? 0 : price) - fee) * volume)) return RESERVE_ERROR;
    return null;
}

/** A price and volume as entered, checked: { price, volume } or { error }. */
function readOrder(rules, price, volume, { market = false } = {}) {
    if (!market) {
        price = Number(price);
        if (!(price > 0) || !isFinite(price)) return { error: 'Enter a price above 0.' };
        if (!isTickMultiple(price, rules.tickSize)) return { error: 'Prices are in steps of ' + rules.tickSize + '.' };
        if (rules.maxPrice != null && price > rules.maxPrice) return { error: 'Prices are at most ' + rules.maxPrice + '.' };
        price = roundToTick(price, rules.tickSize);
    } else {
        price = null;
    }
    volume = rules.multiUnit ? Number(volume) : 1;
    if (!(volume >= 1) || !Number.isInteger(volume)) return { error: 'Enter a whole number of units.' };
    return { price, volume };
}

// The continuous double auction

/**
 * trader submits a limit order in the continuous double auction: { asset, type, price, volume }.
 * It must be feasible on its own (GIMS's order validation), must not cross the book (a bid below
 * the best ask, an ask above the best bid), and must improve on the book if the rules say so.
 * Returns { order } or { error }.
 */
function submitOrder(book, traderId, { asset, type, price, volume }) {
    const rules = book.rules(asset);
    const trader = book.trader(traderId);
    if (type !== 'buy' && type !== 'sell') return { error: 'Unknown order type.' };
    const read = readOrder(rules, price, volume);
    if (read.error) return read;
    ({ price, volume } = read);
    const why = type === 'buy'
        ? whyNotBuy(trader, rules, asset, price, volume, rules.makeFee)
        : whyNotSell(trader, rules, asset, volume, rules.makeFee, price);
    if (why) return { error: why };
    const bestBid = bestPrice(book, asset, 'buy');
    const bestAsk = bestPrice(book, asset, 'sell');
    if (type === 'buy') {
        if (bestAsk != null && price >= bestAsk) {
            return { error: 'A new buy order must be below the lowest sell order (' + bestAsk + '). To buy at that price, use Buy.' };
        }
        if (rules.offerImprovement && bestBid != null && price < bestBid) {
            return { error: 'A new buy order must be at least the highest buy order (' + bestBid + ').' };
        }
        if (rules.singleBest && bestBid != null && price <= bestBid) {
            return { error: 'A new buy order must be above the standing one (' + bestBid + ').' };
        }
    } else {
        if (bestBid != null && price <= bestBid) {
            return { error: 'A new sell order must be above the highest buy order (' + bestBid + '). To sell at that price, use Sell.' };
        }
        if (rules.offerImprovement && bestAsk != null && price > bestAsk) {
            return { error: 'A new sell order must be at most the lowest sell order (' + bestAsk + ').' };
        }
        if (rules.singleBest && bestAsk != null && price >= bestAsk) {
            return { error: 'A new sell order must be below the standing one (' + bestAsk + ').' };
        }
    }
    if (rules.maxOpenOrders > 0 && openOrders(book, asset, type).filter((o) => o.maker === traderId).length >= rules.maxOpenOrders) {
        return { error: 'You may have at most ' + rules.maxOpenOrders + ' open ' + (type === 'buy' ? 'buy' : 'sell') + ' order(s). Cancel one first.' };
    }
    if (rules.maxOpenOrdersTotal > 0 && openOrders(book, asset).filter((o) => o.maker === traderId).length >= rules.maxOpenOrdersTotal) {
        return { error: 'You may have at most ' + rules.maxOpenOrdersTotal + ' open order(s) in this asset. Cancel one first.' };
    }
    // With a book of depth one, the new order replaces the standing one.
    if (rules.singleBest) {
        for (const o of openOrders(book, asset, type)) {
            o.status = 'cancelled';
            o.statusTime = book.now();
        }
    }
    const order = book.addOrder({
        asset, type, price, volume, transacted: 0, invalidated: 0, status: 'open',
        maker: traderId, time: book.now(), statusTime: book.now(), phase: 'cda',
    });
    return { order };
}

/** trader cancels one of their open orders. Returns { order } or { error }. */
function cancelOrder(book, traderId, orderId) {
    const order = book.orders.find((o) => o.id === orderId);
    if (order == null || order.status !== 'open') return { error: 'That order is no longer open.' };
    if (order.maker !== traderId) return { error: 'You can only cancel your own orders.' };
    order.status = 'cancelled';
    order.statusTime = book.now();
    return { order };
}

/**
 * trader accepts the best order on the other side of an asset's book that is not their own:
 * side 'buy' takes the best sell order, 'sell' the best buy order, for volume units (1 in
 * single-unit markets). orderId, if given, is the order the trader saw as the best: if it is not
 * the best any more, nothing is traded. Returns { trade } or { error }.
 */
function acceptOrder(book, traderId, { asset, side, volume, orderId }) {
    const rules = book.rules(asset);
    const taker = book.trader(traderId);
    if (side !== 'buy' && side !== 'sell') return { error: 'Unknown side.' };
    const order = bestOrder(book, asset, side === 'buy' ? 'sell' : 'buy', traderId);
    if (order == null) return { error: side === 'buy' ? 'There is no sell order to accept.' : 'There is no buy order to accept.' };
    if (orderId != null && order.id !== orderId) return { error: 'The best order has changed. Please look again.' };
    volume = rules.multiUnit ? Number(volume == null ? 1 : volume) : 1;
    if (!(volume >= 1) || !Number.isInteger(volume)) return { error: 'Enter a whole number of units.' };
    if (volume > remaining(order)) return { error: 'That order is for ' + remaining(order) + ' unit(s) only.' };
    const maker = book.trader(order.maker);
    const price = order.price;
    let why;
    if (side === 'buy') {
        why = whyNotBuy(taker, rules, asset, price, volume, rules.takeFee) || (whyNotSell(maker, rules, asset, volume, rules.makeFee, price) && 'The seller cannot deliver.');
    } else {
        why = whyNotSell(taker, rules, asset, volume, rules.takeFee, price) || (whyNotBuy(maker, rules, asset, price, volume, rules.makeFee) && 'The buyer cannot pay.');
    }
    if (why) return { error: why };
    const bestBid = bestPrice(book, asset, 'buy');
    const bestAsk = bestPrice(book, asset, 'sell');
    const buyer = side === 'buy' ? taker : maker;
    const seller = side === 'buy' ? maker : taker;
    const buyerFee = side === 'buy' ? rules.takeFee : rules.makeFee;
    const sellerFee = side === 'buy' ? rules.makeFee : rules.takeFee;
    buyer.cash -= (price + buyerFee) * volume;
    seller.cash += (price - sellerFee) * volume;
    buyer.assets[asset] += volume;
    seller.assets[asset] -= volume;
    buyer.bought[asset] = (buyer.bought[asset] || 0) + volume;
    order.transacted += volume;
    order.statusTime = book.now();
    if (remaining(order) === 0) order.status = 'traded';
    const trade = book.addTrade({
        asset, price, volume,
        buyer: side === 'buy' ? traderId : order.maker,
        seller: side === 'buy' ? order.maker : traderId,
        maker: order.maker, taker: traderId, order: order.id,
        time: book.now(), phase: 'cda', bestBid, bestAsk,
    });
    if (rules.emptyBookAfterTrade) {
        for (const o of openOrders(book, asset)) invalidate(book, o, remaining(o));
    }
    invalidateInfeasible(book);
    return { trade };
}

function invalidate(book, order, units) {
    order.invalidated += units;
    order.statusTime = book.now();
    if (remaining(order) === 0) order.status = 'invalidated';
}

/**
 * After a trade, every open order is checked again on its own: one its maker can no longer fill
 * is invalidated, or with partial invalidation cut to what they can (GIMS's automatic
 * invalidation of orders).
 */
function invalidateInfeasible(book) {
    for (const order of book.orders) {
        if (order.status !== 'open' || order.phase !== 'cda') continue;
        const rules = book.rules(order.asset);
        const trader = book.trader(order.maker);
        const units = order.type === 'buy'
            ? unitsBuyable(trader, rules, order.asset, order.price, rules.makeFee)
            : unitsSellable(trader, rules, order.asset, rules.makeFee, order.price);
        const left = remaining(order);
        if (units >= left) continue;
        invalidate(book, order, rules.partialInvalidation && units > 0 ? left - units : left);
    }
}

/** At the end of trading, open orders expire. */
function expireOrders(book) {
    for (const order of book.orders) {
        if (order.status === 'open') {
            order.status = 'expired';
            order.statusTime = book.now();
        }
    }
}

// The call auction

/**
 * Checks a trader's call auction orders for an asset, all together: { error } or {}. Orders:
 * [{ type, price (null for a market order), volume }]. Bids together must be affordable (a
 * market bid counted at one tick a unit, as GIMS does), asks together deliverable; each of the
 * trader's bids must be below each of their asks, so that they cannot trade with themselves.
 */
function checkCallOrders(trader, rules, asset, orders) {
    const bids = orders.filter((o) => o.type === 'buy');
    const asks = orders.filter((o) => o.type === 'sell');
    if (rules.callMaxOrders > 0 && (bids.length > rules.callMaxOrders || asks.length > rules.callMaxOrders)) {
        return { error: 'You may submit at most ' + rules.callMaxOrders + ' buy and ' + rules.callMaxOrders + ' sell order(s).' };
    }
    if (bids.length > 0 && trader.role === 'seller') return { error: 'You are a seller: you can only sell.' };
    if (asks.length > 0 && trader.role === 'buyer') return { error: 'You are a buyer: you can only buy.' };
    const cost = bids.reduce((s, o) => s + (o.price == null ? rules.tickSize : o.price) * o.volume, 0);
    if (cost > trader.cash + rules.shortCash + EPS) return { error: 'Your buy orders together cost more than your cash.' };
    const bidUnits = bids.reduce((s, o) => s + o.volume, 0);
    const askUnits = asks.reduce((s, o) => s + o.volume, 0);
    if (askUnits > trader.assets[asset] + rules.shortAssets) return { error: 'Your sell orders together are for more units than you have.' };
    if (rules.holdingCap != null && trader.assets[asset] + bidUnits > rules.holdingCap) {
        return { error: 'You may hold at most ' + rules.holdingCap + ' units.' };
    }
    if (rules.purchaseLimit != null && (trader.bought[asset] || 0) + bidUnits > rules.purchaseLimit) {
        return { error: 'You may buy at most ' + rules.purchaseLimit + ' units in a period.' };
    }
    if (bids.length > 0 && asks.length > 0) {
        if (bids.some((o) => o.price == null) || asks.some((o) => o.price == null)) {
            return { error: 'With a market order on one side, you cannot also have orders on the other.' };
        }
        const highBid = Math.max(...bids.map((o) => o.price));
        const lowAsk = Math.min(...asks.map((o) => o.price));
        if (highBid >= lowAsk) return { error: 'Your buy prices must be below your sell prices.' };
    }
    return {};
}

/**
 * The call auction's price for a set of orders (GIMS's price determination, after NASDAQ's):
 * the price that maximizes the volume traded; among those, the one with the smallest surplus of
 * one side over the other; if they all have a buy surplus the highest, if all a sell surplus
 * the lowest; otherwise the average of them, rounded to the tick (down when halfway).
 * Returns { price (null if nothing can trade), volume, rule (GIMS's PriceDeterminationRule,
 * 0 to 5), schedule: [{ price, buy, sell, feasible, surplus }] }.
 */
function auctionPrice(orders, tickSize, rule = 'gims') {
    const limits = orders.filter((o) => o.price != null);
    const marketBuy = orders.filter((o) => o.price == null && o.type === 'buy').reduce((s, o) => s + o.volume, 0);
    const marketSell = orders.filter((o) => o.price == null && o.type === 'sell').reduce((s, o) => s + o.volume, 0);
    const prices = [...new Set(limits.map((o) => o.price))].sort((a, b) => a - b);
    const schedule = prices.map((price) => {
        const buy = limits.filter((o) => o.type === 'buy' && o.price >= price).reduce((s, o) => s + o.volume, 0) + marketBuy;
        const sell = limits.filter((o) => o.type === 'sell' && o.price <= price).reduce((s, o) => s + o.volume, 0) + marketSell;
        return { price, buy, sell, feasible: Math.min(buy, sell), surplus: buy - sell };
    });
    const volume = Math.max(0, ...schedule.map((r) => r.feasible));
    if (volume === 0) return { price: null, volume: 0, rule: 0, schedule };
    const maxing = schedule.filter((r) => r.feasible === volume);
    if (rule === 'midpoint') {
        // The middle of the prices at which the most units trade (Lahav 2011), down to the tick.
        const mid = (maxing[0].price + maxing[maxing.length - 1].price) / 2;
        return { price: roundToTick(mid - 1e-7, tickSize), volume, rule: 6, schedule };
    }
    if (maxing.length === 1) return { price: maxing[0].price, volume, rule: 1, schedule };
    const least = Math.min(...maxing.map((r) => Math.abs(r.surplus)));
    const balanced = maxing.filter((r) => Math.abs(r.surplus) === least);
    if (balanced.length === 1) return { price: balanced[0].price, volume, rule: 2, schedule };
    if (balanced.every((r) => r.surplus > 0)) return { price: balanced[balanced.length - 1].price, volume, rule: 3, schedule };
    if (balanced.every((r) => r.surplus < 0)) return { price: balanced[0].price, volume, rule: 4, schedule };
    const average = balanced.reduce((s, r) => s + r.price, 0) / balanced.length;
    // Rounded to the nearest tick, and down when it is halfway.
    let price = roundToTick(average - 1e-7, tickSize);
    return { price, volume, rule: 5, schedule };
}

function shuffled(list, rng) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

/**
 * Orders of one side in settlement priority (GIMS's trade settlement): limit orders better than
 * the auction price, by price and then time; then market orders and limit orders at the auction
 * price (market orders first if rules.marketOrderPriority), each by time. With rationing
 * 'random', orders at the same price (and market orders) are in a random order instead.
 */
function settlementOrder(orders, type, price, rules, rng) {
    const side = orders.filter((o) => o.type === type && (o.price == null || (type === 'buy' ? o.price >= price : o.price <= price)));
    const byTime = (a, b) => a.time - b.time || a.id - b.id;
    const better = side.filter((o) => o.price != null && o.price !== price);
    const at = side.filter((o) => o.price === price).sort(byTime);
    const market = side.filter((o) => o.price == null).sort(byTime);
    const prices = [...new Set(better.map((o) => o.price))].sort((a, b) => (type === 'buy' ? b - a : a - b));
    const tier = (list) => (rules.rationing === 'random' ? shuffled(list, rng) : list);
    const out = [];
    for (const p of prices) out.push(...tier(better.filter((o) => o.price === p).sort(byTime)));
    const last = rules.marketOrderPriority ? [market, at] : [at, market];
    for (const list of last) out.push(...tier(list));
    return out;
}

/**
 * Runs the call auction of an asset on its call orders, and settles it: every trade is at the
 * auction price. Orders: [{ id, asset, type, price, volume, maker, time }]. Each trader trades
 * only what they still can (a market bid at most what their cash buys). The orders are added to
 * the book as rows (phase 'call'), and the trades too, a trade for each buyer and seller
 * matched in priority order. Returns the auction: { price, volume, rule, schedule, trades }.
 */
function runCallAuction(book, asset, orders, { rng = Math.random } = {}) {
    const rules = book.rules(asset);
    const auction = auctionPrice(orders, rules.tickSize, rules.callPrice);
    const fills = new Map(orders.map((o) => [o, 0]));
    const trades = [];
    if (auction.price != null) {
        const price = auction.price;
        // Fills orders in priority up to target, each by what its trader can still do given
        // their fills so far (units(trader, filled)); returns the total filled.
        const fill = (list, target, units) => {
            const filled = new Map();
            let total = 0;
            for (const o of list) {
                const so = filled.get(o.maker) || 0;
                const q = Math.max(0, Math.min(o.volume, target - total, units(book.trader(o.maker), so)));
                fills.set(o, q);
                filled.set(o.maker, so + q);
                total += q;
            }
            return total;
        };
        const buys = settlementOrder(orders, 'buy', price, rules, rng);
        const sells = settlementOrder(orders, 'sell', price, rules, rng);
        const bought = fill(buys, auction.volume, (t, so) => unitsBuyable({
            cash: t.cash - price * so,
            assets: t.assets.map((a, i) => (i === asset ? a + so : a)),
            bought: t.bought.map((b, i) => (i === asset ? (b || 0) + so : b)),
        }, rules, asset, price, 0));
        const total = fill(sells, bought, (t, so) => unitsSellable({
            cash: t.cash + price * so, assets: t.assets.map((a, i) => (i === asset ? a - so : a)),
        }, rules, asset, 0, price));
        // If fewer units are sold than bought, the last buys in priority are cut.
        let extra = bought - total;
        for (let i = buys.length - 1; i >= 0 && extra > 0; i--) {
            const cut = Math.min(fills.get(buys[i]), extra);
            fills.set(buys[i], fills.get(buys[i]) - cut);
            extra -= cut;
        }
        auction.volume = total;
        // Buyers and sellers matched in priority order.
        const queue = (list) => list.filter((o) => fills.get(o) > 0).map((o) => ({ o, left: fills.get(o) }));
        const bq = queue(buys);
        const sq = queue(sells);
        while (bq.length > 0 && sq.length > 0) {
            const b = bq[0];
            const s = sq[0];
            const q = Math.min(b.left, s.left);
            const buyer = book.trader(b.o.maker);
            const seller = book.trader(s.o.maker);
            buyer.cash -= price * q;
            seller.cash += price * q;
            buyer.assets[asset] += q;
            seller.assets[asset] -= q;
            buyer.bought[asset] = (buyer.bought[asset] || 0) + q;
            trades.push({ buyOrder: b.o, sellOrder: s.o, volume: q });
            b.left -= q;
            s.left -= q;
            if (b.left === 0) bq.shift();
            if (s.left === 0) sq.shift();
        }
    }
    // The orders, and the trades, in the book.
    const rows = new Map();
    for (const o of orders) {
        const filled = fills.get(o);
        rows.set(o, book.addOrder({
            asset, type: o.type, price: o.price, volume: o.volume, transacted: filled,
            invalidated: o.volume - filled, status: filled > 0 ? 'traded' : 'expired',
            maker: o.maker, time: o.time, statusTime: book.now(), phase: 'call',
        }));
    }
    auction.trades = trades.map((t) => book.addTrade({
        asset, price: auction.price, volume: t.volume,
        buyer: t.buyOrder.maker, seller: t.sellOrder.maker,
        maker: null, taker: null, order: rows.get(t.buyOrder).id, sellOrder: rows.get(t.sellOrder).id,
        time: book.now(), phase: 'call', bestBid: null, bestAsk: null,
    }));
    return auction;
}

// Values

/**
 * The fundamental value of a unit at the start of a period, for a risk-neutral trader: the
 * expected dividends of the periods left and the buyback value, discounted at the interest rate
 * on cash (Giusti, Jiang and Xu 2016): d(T - t + 1) + K without interest, and
 * d/r + (K - d/r)(1 + r)^-(T - t + 1) with it.
 */
function fundamentalValue({ meanDividend, buyback = 0, interest = 0, periodsLeft }) {
    if (!interest) return meanDividend * periodsLeft + buyback;
    const r = interest;
    return meanDividend / r + (buyback - meanDividend / r) * Math.pow(1 + r, -periodsLeft);
}

/**
 * The value now of a unit that pays flows[0] after this period, flows[1] after the next, and
 * so on, and final after the last, discounted at the interest rate on cash: the fundamental
 * value when flows are the expected dividends less any holding taxes.
 */
function presentValue(flows, final = 0, interest = 0) {
    let v = final;
    for (let i = flows.length - 1; i >= 0; i--) v = (flows[i] + v) / (1 + interest);
    return v;
}

/** The mean of a dividend process: values equally likely, or { values, probabilities }. */
function meanDividend(dividends) {
    if (typeof dividends === 'number') return dividends;
    if (dividends && dividends.uniform) return (dividends.uniform[0] + dividends.uniform[1]) / 2;
    const { values, probabilities } = dividendProcess(dividends);
    return values.reduce((s, v, i) => s + v * probabilities[i], 0);
}

/** A dividend process as { values, probabilities }. */
function dividendProcess(dividends) {
    if (Array.isArray(dividends)) return { values: dividends, probabilities: dividends.map(() => 1 / dividends.length) };
    const values = dividends.values;
    const probabilities = dividends.probabilities || values.map(() => 1 / values.length);
    return { values, probabilities };
}

/** A value drawn from a process: values equally likely, { values, probabilities }, or { uniform: [low, high] } (whole numbers). */
function drawDividend(dividends, rng = Math.random) {
    if (typeof dividends === 'number') return dividends;
    if (dividends && dividends.uniform) {
        const [low, high] = dividends.uniform;
        return low + Math.floor(rng() * (high - low + 1));
    }
    const { values, probabilities } = dividendProcess(dividends);
    let u = rng();
    for (let i = 0; i < values.length; i++) {
        u -= probabilities[i];
        if (u < 0) return values[i];
    }
    return values[values.length - 1];
}

/** Summary statistics of a list of trades: { trades, volume, mean (volume-weighted), median, last, low, high }. */
function priceStats(trades) {
    const volume = trades.reduce((s, t) => s + t.volume, 0);
    if (trades.length === 0) return { trades: 0, volume: 0, mean: null, median: null, last: null, low: null, high: null };
    const prices = [];
    for (const t of trades) for (let i = 0; i < t.volume; i++) prices.push(t.price);
    prices.sort((a, b) => a - b);
    const n = prices.length;
    const median = n % 2 ? prices[(n - 1) / 2] : (prices[n / 2 - 1] + prices[n / 2]) / 2;
    const ordered = trades.slice().sort((a, b) => a.time - b.time || a.id - b.id);
    return {
        trades: trades.length, volume,
        mean: trades.reduce((s, t) => s + t.price * t.volume, 0) / volume,
        median, last: ordered[ordered.length - 1].price, low: prices[0], high: prices[n - 1],
    };
}

module.exports = {
    RULES, roundToTick, remaining, bestOrder, unitsBuyable, unitsSellable, readOrder,
    submitOrder, cancelOrder, acceptOrder, invalidateInfeasible, expireOrders,
    checkCallOrders, auctionPrice, runCallAuction,
    fundamentalValue, presentValue, meanDividend, dividendProcess, drawDividend, priceStats,
};
