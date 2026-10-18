// Settings of the GIMS app (app.jtt), and presets: configurations of published experiments.
//
// DEFAULTS are every setting, with GIMS's defaults where GIMS has the setting (GIMS v8.4.2's
// parameter programs P1 to P10, in brackets the GIMS variable). A preset sets what differs from
// them. When a session starts, the app's "settings" option can change any setting of the preset
// chosen, as JSON: {"tradingTime": 120, "traders": 8}.
//
// Money is in points, which the app's exchange rate (or the session's, if exchangeRate is null)
// turns into money. Periods are counted within a round (a market from its first period to its
// last); arrays by period (cashInflow, dividendSequence) list a round's periods in order.

const DEFAULTS = {
    title: 'Asset market',
    reference: '',
    notes: '',

    // Who and how long
    traders: 0,                  // traders per market (group size); 0 puts all participants in one market
    rounds: 1,                   // markets one after another, each with fresh endowments
    periods: 10,                 // trading periods in a round [NumPeriods]
    practicePeriods: 0,          // unpaid periods before the first round [PracticePeriod]
    practiceEndowment: null,     // { cash, assets } for the practice periods (GIMS's: 5000 and 100); null for the usual endowments
    practiceTasks: true,         // in practice, a list of things to try [PracticeTasks]

    // Payment
    payment: 'all',              // 'all' rounds, or one 'random' round [RandomPeriodPayoff]
    exchangeRate: null,          // money per point; null for the session's [ExchangeRate]
    minPayoff: 0,                // the fewest points paid in all [MinPayoffECU]
    maxPayoff: null,             // the most points paid in all
    bonus: 0,                    // points added to each round's earnings
    loan: false,                 // whether the initial cash is a loan, paid back from a round's earnings
    cashName: 'points',          // what cash is called on the screens

    // The market
    mechanism: 'cda',            // 'cda' (continuous double auction), 'call' (call auction) or 'call+cda' [CallAuction, ContinuousDoubleAuction]
    tradingTime: 180,            // seconds of continuous double auction, or an array: seconds by round [TimeContinuousDoubleAuction]
    callTime: 0,                 // seconds to submit call auction orders; 0 for no limit [TimeCallAuction]
    resultsTime: 30,             // seconds the results of a period are shown; 0 until all have read them [TimeContinuousDoubleAuctionResults]
    assets: [                    // the assets traded, each in its own market [NumMarkets]
        {
            name: 'Asset',
            description: '',     // shown under the name, e.g. what the asset is
            dividends: [0, 8, 28, 60],   // equally likely values, or { values, probabilities } [dividends]
            dividendSequence: null,      // dividends drawn in advance, by period, in place of draws [PresetDividends]
            buyback: 0,                  // what a unit is worth after a round's last period [BBV]; or drawn for each round, unknown
                                         // to the traders until then: { values, probabilities } or { uniform: [low, high] }
            signals: null,               // signals, by period: [[set 1's values, set 2's, ...], ...]; trader k sees set k (in turn) [signals]
            tax: 0,                      // a holding tax a unit pays after each period: a number, or an array by period
            walk: null,                  // a value that follows a random path, in place of dividends: { start, steps: [...] } (each
                                         // equally likely) or { start, sd } (normal steps); a step after each period, shown then; a
                                         // unit pays the value after the last step
            maxPayouts: null,            // dividends stop after this many that are not zero in a round (a truncated asset)
            // Any market rule below can also be set for an asset alone.
        },
    ],
    supplements: null,           // { amounts: [80, 40], insider: 0.5 }: each round, the amounts are added to the final values of
                                 // as many different assets drawn at random; with probability insider, one trader is told one
    stateSignals: null,          // signals of a drawn final value (buyback with two values): { asset, accuracy, when: 'start'
                                 // (each trader's own, private), or 'end' (public news after each period but the last),
                                 // exact: the number right fixed by endowment type (with 'start'), labels: [high's, low's] }
    endowments: [                // endowment types, assigned in equal numbers [endowments]
        { cash: 225, assets: 3 },        // assets: units of each asset (a number for all, or an array)
        { cash: 585, assets: 2 },        // role: 'trader' (default), 'buyer' (buys only) or 'seller' (sells only)
        { cash: 945, assets: 1 },
    ],
    fillerType: 2,               // the type (from 1) of traders left over when the types do not divide them [EndowmentFillerType]
    assignment: 'random',        // types assigned to traders at 'random' (GIMS) or in 'order' of their place in the market
    reassignTypes: false,        // endowment types drawn again at the start of each round
    dividendAccount: 'cash',     // dividends paid into 'cash', or a 'separate' account not used for trading
    dividendTiming: 'period',    // dividends paid after each 'period', or all drawn and paid at the 'end' of a round
    interest: 0,                 // interest per period on cash held after trading (negative: a charge)
    cashInflow: 0,               // cash given to each trader after each period: a number, or an array by period
    carryCash: false,            // cash carries over from one round to the next (units are given anew); a round's
                                 // earnings are then what it added to the cash it began with
    payoff: 'wealth',            // a round's earnings: its final 'wealth' (cash, account and units at their final value),
                                 // or the 'profit' over what the endowment would have paid had it been kept
    paymentBlocks: null,         // with payment 'random', one round paid from each block of rounds: e.g. [10, 10]
    bonds: null,                 // one-period bonds before each period: { rate (a number, or an array by period), payAtEnd
                                 // (interest paid at the end, not into cash), policy: { levels: [rates], periods: [when it may
                                 // rise], threshold, exogenous } }

    // Market rules (see market.js)
    multiUnit: true,             // [MultiUnitTrading]
    tickSize: 1,                 // [TickSize] (GIMS's 0.01 in the 'gims' preset)
    offerImprovement: true,      // [OfferImprovementRule]
    emptyBookAfterTrade: false,  // [EmptyBookAfterTrade]
    partialInvalidation: false,  // [PartialInvalidation]
    maxOpenOrders: 0,            // [SpamControl]
    makeFee: 0,                  // [MakeFee]
    takeFee: 0,                  // [TakeFee]
    shortCash: 0,                // [ShortingCapacityCash]
    shortAssets: 0,              // [ShortingCapacityAssets]
    shortReserve: 0,             // cash a trader must keep for each unit they are short, as a multiple of a unit's value
    shortReserveBelow: null,     // that multiple when the last price is below the value (Haruvy and Noussair's FLX)
    holdingCap: null,            // the most units a trader may hold
    holdingCapUntil: null,       // the last period of a round the cap holds in; null for all
    purchaseLimit: null,         // the most units a trader may buy in a period
    callMaxOrders: 0,            // [NumTypedOffersCallAuction]
    marketOrders: true,          // [AllowMarketOrders]
    marketOrderPriority: true,   // [MarketOrderPriority]
    rationing: 'time',           // 'time' (GIMS) or 'random'
    callPrice: 'gims',           // the call auction's price: 'gims' (its five rules) or the 'midpoint' of the prices that trade the most
    maxPrice: null,              // the highest price an order may have
    singleBest: false,           // only the best bid and the best ask stand, and a better one replaces it (a book of depth one)
    maxOpenOrdersTotal: 0,       // open orders per trader and asset, bids and asks together; 0 for any number
    byRound: [],                 // market rules for blocks of rounds: [{ from, to, shortAssets: ... }, ...]

    // The trading screen
    orderBookDepth: -1,          // orders shown on each side, besides one's own; -1 for all [OrderBookDepth]
    priceListDepth: 0,           // prices in the list of trades; 0 for all [PriceListDepth]
    showPriceList: true,         // [ShowPricelist]
    showChart: true,             // [ShowChart]
    showFundamentalValue: false, // a table of the asset's value by period, and its value now
    earlyEndingVote: false,      // traders can vote to end a period early; it ends when all have [EarlyEndingVote]
    indicativePriceInterval: 0,  // seconds between indicative prices in the call auction; 0 for none [IndicativePriceInterval]
    showCallOrders: false,       // after a call auction, all its orders, without who made them
    showHistory: false,          // a table of the earlier periods of the round: prices, values (shown even without
                                 // showFundamentalValue), dividends, news
    announcements: [],           // messages on the trading screen: [{ periods: [3, 7], text }]; text is a string, { draw: [texts] }
                                 // (one drawn for the session), or { above, below } (by last period's mean price against the value)
    accountStatus: null,         // after each period, cash and units at the period's best bid, and the market's
                                 // { reference: 'highest' } or 'lowest' such total
    rating: null,                // after each period, a rating: { question, labels: [...] }
    lottery: null,               // after each period, a lottery ticket: { price, prize, chance }, one draw for all
    chatTime: 0,                 // seconds of chat before trading, from period chatFrom of each round
    chatFrom: 2,
    firm: null,                  // a computerized firm that buys ('buy') or sells ('sell') units from period on: { period, side,
                                 // share (of the units given out) or units, interval (seconds), threshold }

    // Price forecasts: null, or { horizon: periods ahead (1 for this period's, or 'all' for every
    // period left), rewards: [[relative error at most, points], ...], target: 'mean' (trade
    // price), 'median', 'last' or 'call' (the call auction price) }. They are paid into the
    // separate account.
    forecasts: null,

    // Before and after the market [ControlQuestions, CRTBefore, CRTAfter, HLBefore, HLAfter]
    controlQuestions: [],        // [{ question, options: [...], answer: index of the right option }], or { question, answer: a number }
    controlQuestionsIntro: '',   // text shown above them
    crt: null,                   // the cognitive reflection test (Frederick 2005): 'before', 'after' or null
    crtPay: 0,                   // points per right answer
    holtLaury: null,             // the Holt and Laury (2002) lottery choices: 'before', 'after' or null
    holtLauryPayoffs: { aHigh: 2, aLow: 1.6, bHigh: 3.85, bLow: 0.1 },   // in points [PayoffAHigh, ...]
};

// The dividends of Smith, Suchanek and Williams (1988), used by many of the studies below.
const SSW_DIVIDENDS = [0, 8, 28, 60];
// The forecast rewards of Haruvy, Lahav and Noussair (2007), as later studies describe them.
const HLN_REWARDS = [[0.10, 50], [0.25, 20], [0.50, 10]];
// The endowments of Smith, Suchanek and Williams's design 4, and those doubled (Haruvy, Noussair and Powell 2014).
const SSW_ENDOWMENTS = [{ cash: 225, assets: 3 }, { cash: 585, assets: 2 }, { cash: 945, assets: 1 }];
const SSW_DOUBLED = [{ cash: 450, assets: 6 }, { cash: 1170, assets: 4 }, { cash: 1890, assets: 2 }];

// Haruvy and Noussair (2006): SSW's market with a short-selling rule.
function haruvyNoussair(title, notes, rules) {
    return Object.assign({
        title: 'Haruvy and Noussair (2006): ' + title,
        reference: 'Haruvy, E. and Noussair, C. N. (2006). The effect of short selling on bubbles and crashes in experimental spot asset markets. Journal of Finance 61(3), 1119–1157.',
        notes: '9 traders with the endowments of Smith, Suchanek and Williams (225, 585 or 945 tokens and 3, 2 or 1 units); a practice, then 15 periods of 4 minutes; dividends of 0, 8, 28 or 60 tokens; a cent a token. Traders who are short pay the dividends of the units they are short. ' + notes,
        traders: 9, practicePeriods: 1, periods: 15, tradingTime: 240, multiUnit: false,
        assets: [{ name: 'Asset', dividends: SSW_DIVIDENDS }],
        endowments: SSW_ENDOWMENTS, exchangeRate: 0.01, showFundamentalValue: true, cashName: 'tokens',
    }, rules);
}

// Noussair and Powell (2010): values that rise and then fall (peak), or fall and then rise (valley).
function noussairPowell(title, notes, settings) {
    return Object.assign({
        title: 'Noussair and Powell (2010): ' + title,
        reference: 'Noussair, C. N. and Powell, O. (2010). Peaks and valleys: price discovery in experimental asset markets with non-monotonic fundamentals. Journal of Economic Studies 37(2), 152–180.',
        notes: '9 traders with 1, 2 or 3 units, three of each; a practice period (10 minutes in the paper), then four markets of 15 periods of 2 minutes; dividends of 0, 8, 28 or 60 francs into cash, and a holding tax of 48 francs a unit after the tax periods, so that the value rises by 24 a period while there are taxes and falls by 24 when there are none. Each type starts with 1305 francs at the value; every market is paid, 200 francs to the euro. ' + notes,
        traders: 9, practicePeriods: 1, rounds: 4, periods: 15, tradingTime: 120, multiUnit: false,
        exchangeRate: 1 / 200, showFundamentalValue: true, cashName: 'francs',
    }, settings);
}

// Corgnet, Kujal and Porter (2010): public messages in periods 3, 7 and 12.
const TOO_HIGH = 'The price is too high.';
const TOO_LOW = 'The price is too low.';
function corgnetKujalPorter(title, notes, message) {
    const announcements = [{ periods: [10], text: 'There are only five periods remaining.' }];
    if (message != null) announcements.unshift({ periods: [3, 7, 12], text: message });
    return {
        title: 'Corgnet, Kujal and Porter (2010): ' + title,
        reference: 'Corgnet, B., Kujal, P. and Porter, D. (2010). The effect of reliability, content and timing of public announcements on asset trading behavior. Journal of Economic Behavior & Organization 76(2), 254–266.',
        notes: '9 traders, five with 2 units and 550 cents, four with 4 units and 180 cents; two markets of 15 periods, 180 seconds each in the first and 160 in the second; dividends of 0, 8, 28 or 60 cents. In period 10 of each market, a message says that five periods remain. ' + notes + ' A unit at a time is assumed here.',
        traders: 9, rounds: 2, periods: 15, tradingTime: [180, 160], multiUnit: false,
        assets: [{ name: 'Asset', dividends: SSW_DIVIDENDS }],
        endowments: [{ cash: 550, assets: 2 }, { cash: 180, assets: 4 }], fillerType: 1,
        announcements, exchangeRate: 0.01, showFundamentalValue: true, cashName: 'cents',
    };
}

// Schoenberg and Haruvy (2012): relative performance after each period.
function schoenbergHaruvy(title, reference, notes) {
    return {
        title: 'Schoenberg and Haruvy (2012): ' + title,
        reference: 'Schoenberg, E. J. and Haruvy, E. (2012). Relative performance information in asset markets: an experimental approach. Journal of Economic Psychology 33(6), 1143–1155.',
        notes: '10 traders (8 to 10) with the endowments of Smith, Suchanek and Williams; two practice periods, then 15 periods of 180 seconds; dividends of 0, 8, 28 or 60 cents. After each period, a lottery ticket (6 cents for a 5% chance of 120, one draw for all), then an account status: cash and units at the period\'s best bid, and ' + notes + ' Then a rating of how one feels about one\'s account, on a 7-point scale. A cent a unit of currency.',
        traders: 10, practicePeriods: 2, periods: 15, tradingTime: 180, multiUnit: false,
        assets: [{ name: 'Shares', dividends: SSW_DIVIDENDS }],
        endowments: SSW_ENDOWMENTS,
        lottery: { price: 6, prize: 120, chance: 0.05 },
        accountStatus: { reference },
        rating: { question: 'How do you feel about your current account total?', labels: ['Very negatively', 'Negatively', 'Somewhat negatively', 'Neutral', 'Somewhat positively', 'Positively', 'Very positively'] },
        resultsTime: 0, exchangeRate: 0.01, showFundamentalValue: true, cashName: 'cents',
    };
}

// Haruvy, Noussair and Powell (2014): a computerized firm buys back or issues half the shares from period 6.
function haruvyNoussairPowell(title, notes, firm) {
    return {
        title: 'Haruvy, Noussair and Powell (2014): ' + title,
        reference: 'Haruvy, E., Noussair, C. N. and Powell, O. (2014). The impact of asset repurchases and issues in an experimental market. Review of Finance 18(2), 681–713.',
        notes: '9 traders with twice the endowments of Smith, Suchanek and Williams (6, 4 or 2 units and 450, 1170 or 1890 francs); a practice, then 15 periods of 240 seconds; dividends of 0, 8, 28 or 60 francs; 170 francs to the euro (150 to the dollar in Dallas). ' + notes + ' A unit at a time is assumed here.',
        traders: 9, practicePeriods: 1, periods: 15, tradingTime: 240, multiUnit: false,
        assets: [{ name: 'Shares', dividends: SSW_DIVIDENDS }],
        endowments: SSW_DOUBLED, firm, exchangeRate: 1 / 170, showFundamentalValue: true, cashName: 'francs',
    };
}

// Fellner and Theissen (2014): one-period markets, short selling allowed in one block of ten and not the other.
function fellnerTheissen(order, precision) {
    const allowedFirst = order === 'AP';
    const free = { shortAssets: 1e9 };
    const none = { shortAssets: 0 };
    return {
        title: 'Fellner and Theissen (2014): ' + order + (precision ? precision * 100 : 0) + (precision ? ', signals right with probability ' + precision : ', no signals') + (allowedFirst ? ', short selling first' : ', short selling second'),
        reference: 'Fellner, G. and Theissen, E. (2014). Short sale constraints, divergence of opinion and asset prices: evidence from the laboratory. Journal of Economic Behavior & Organization 101, 113–127.',
        notes: '10 traders; 20 one-period markets of 150 seconds, each with an asset worth 200 or 100 (equally likely), shown after trading. Each market, half the traders, drawn anew, have 4 units and 150 ECU, half 1 unit and 600. Credit is unlimited, at no interest. ' +
            (precision ? 'Each trader gets a private signal of the value, right with probability ' + precision + ', with the number of right signals fixed at ' + precision + ' of each endowment group. ' : 'No signals (the benchmark). ') +
            'Short selling, without limit, is allowed in markets ' + (allowedFirst ? '1 to 10' : '11 to 20') + ' and not in the others. A market\'s earnings are its profit: wealth at the value, less the endowment at the value. One market of each block is paid, 20 ECU to the euro. A unit at a time. (Their three training periods are not included.)',
        traders: 10, rounds: 20, periods: 1, tradingTime: 150, multiUnit: false,
        assets: [{ name: 'Asset', description: 'Worth 200 or 100, equally likely, drawn for each market and shown after trading.', dividends: [0], buyback: { values: [200, 100] } }],
        endowments: [{ cash: 150, assets: 4 }, { cash: 600, assets: 1 }], reassignTypes: true,
        shortCash: 1e9, byRound: [Object.assign({ from: 1, to: 10 }, allowedFirst ? free : none), Object.assign({ from: 11, to: 20 }, allowedFirst ? none : free)],
        stateSignals: precision ? { accuracy: precision, when: 'start', exact: true, labels: ['high', 'low'] } : null,
        payoff: 'profit', payment: 'random', paymentBlocks: [10, 10], resultsTime: 15,
        exchangeRate: 1 / 20, cashName: 'ECU',
    };
}

// Stöckl, Huber and Kirchler (2014): five ways for the value to change.
function stocklHuberKirchler(title, notes, asset) {
    return {
        title: 'Stöckl, Huber and Kirchler (2014): ' + title,
        reference: 'Stöckl, T., Huber, J. and Kirchler, M. (2014). Multi-period experimental asset markets with distinct fundamental value regimes. Experimental Economics (2014), doi:10.1007/s10683-014-9404-1.',
        notes: '10 traders, each with 40 units and 3600 Taler (a value of 5400 at the start value of 45); two practice periods, then 15 periods of 150 seconds; orders of any size, market orders first; a history screen of 15 seconds after each period with the prices and values so far. 400 Taler to the euro. ' + notes,
        traders: 10, practicePeriods: 2, periods: 15, tradingTime: 150, resultsTime: 15,
        assets: [Object.assign({ name: 'Asset' }, asset)],
        endowments: [{ cash: 3600, assets: 40 }],
        showHistory: true, exchangeRate: 1 / 400, showFundamentalValue: true, cashName: 'Taler',
    };
}

// Oechssler, Schmidt and Schnedler (2011): five assets with final dividends only.
function oechsslerSchmidtSchnedler(title, notes, settings) {
    return Object.assign({
        title: 'Oechssler, Schmidt and Schnedler (2011): ' + title,
        reference: 'Oechssler, J., Schmidt, C. and Schnedler, W. (2011). On the ingredients for bubble formation: informed traders and communication. Journal of Economic Dynamics and Control 35(11), 1831–1851.',
        notes: '10 traders trade 5 assets at once, each starting with 10 units of each and 10,000 Taler, 5000 of it a loan paid back after each round; a practice round of 3 days (periods), then three rounds of 10 days of 120 seconds. Only the best bid and ask are shown. An asset pays one dividend, after the last day: a base value from 50 to 90 (whole numbers, equally likely), and each round one asset, drawn at random, gets a supplement of 80 and another one of 40. ' + notes + ' 1000 Taler to the euro. A unit at a time is assumed here; their price and dividend forecasts on days 4, 6 and 8 (unpaid) are not included.',
        traders: 10, practicePeriods: 3, rounds: 3, periods: 10, tradingTime: 120, multiUnit: false, orderBookDepth: 1,
        assets: ['Blue', 'Green', 'Red', 'Yellow', 'Purple'].map((name) => ({
            name, description: 'Pays one dividend, after the last day: a base value from 50 to 90, and any supplement.', dividends: [0], buyback: { uniform: [50, 90] },
        })),
        endowments: [{ cash: 10000, assets: 10 }], bonus: -5000,
        exchangeRate: 1 / 1000, showFundamentalValue: true, cashName: 'Taler',
    }, settings);
}

// Breaban and Noussair (2015): a constant value that then rises (taxes) or falls (subsidies).
function breabanNoussair(title, notes, tax, buyback) {
    return {
        title: 'Breaban and Noussair (2015): ' + title,
        reference: 'Breaban, A. and Noussair, C. N. (2015). Trader characteristics and fundamental value trajectories in an asset market experiment. Journal of Behavioral and Experimental Finance 8, 1–17.',
        notes: '8 traders (7 to 9), each with 10 units and 3600 ECU; two markets of 15 periods of 2 minutes, each starting afresh; after each period, a dividend of +10 or −10 ECU (a coin flip). ' + notes + ' Before the market, the cognitive reflection test (1 euro a right answer) and Holt and Laury\'s lotteries (in euros: 2.00 or 1.60, and 3.85 or 0.10); 500 ECU to the euro. Their loss aversion task (on paper) and three questions on the value are not included. A unit at a time is assumed here.',
        traders: 8, rounds: 2, periods: 15, tradingTime: 120, multiUnit: false,
        assets: [{ name: 'Asset', dividends: [10, -10], tax, buyback }],
        endowments: [{ cash: 3600, assets: 10 }],
        crt: 'before', crtPay: 500, holtLaury: 'before', holtLauryPayoffs: { aHigh: 1000, aLow: 800, bHigh: 1925, bLow: 50 },
        exchangeRate: 1 / 500, showFundamentalValue: true, cashName: 'ECU',
    };
}

// Cason and Samek (2015): trade prices as text or as a chart.
function casonSamek(title, notes, settings) {
    return Object.assign({
        title: 'Cason and Samek (2015): ' + title,
        reference: 'Cason, T. N. and Samek, A. (2015). Learning through passive participation in asset market bubbles. Journal of the Economic Science Association, doi:10.1007/s40881-015-0013-3.',
        notes: '10 traders; three markets of 12 periods of 2 minutes, all paid; at the start of each market, half the traders, drawn anew, get 3 shares and 1080, half 5 shares and 504; dividends of 0, 8, 28 or 60 after each period, so that a share is worth 288 at first and nothing after the last period. 150 experimental dollars to the US dollar. ' + notes + ' In their Pre- treatments the first market is watched, not traded: each trader sees the trades of a trader of an earlier session and is paid as they were; that is not included here. A unit at a time is assumed here.',
        traders: 10, rounds: 3, periods: 12, tradingTime: 120, multiUnit: false,
        assets: [{ name: 'Shares', dividends: SSW_DIVIDENDS }],
        endowments: [{ cash: 1080, assets: 3 }, { cash: 504, assets: 5 }], reassignTypes: true,
        exchangeRate: 1 / 150, showFundamentalValue: true, cashName: 'experimental dollars',
    }, settings);
}

// Huber, Kirchler and Stöckl (2015): Stöckl, Huber and Kirchler's falling value, with the value shown or not while trading.
function huberKirchlerStockl(title, notes, settings) {
    return Object.assign({
        title: 'Huber, Kirchler and Stöckl (2015): ' + title,
        reference: 'Huber, J., Kirchler, M. and Stöckl, T. (2015). The influence of investment experience on market prices: laboratory evidence. Experimental Economics, doi:10.1007/s10683-015-9445-0.',
        notes: '10 traders, each with 40 units and 3600 Taler; two practice periods, then 15 periods of 150 seconds; a dividend of 0, 3 or 6 Taler after each, so that the value falls from 45 by 3 a period; orders of any size, market orders first; a history screen of 15 seconds after each period, with the prices and values so far. 400 Taler to the euro. ' + notes + ' Their treatments with an investment game before the market (positive or negative experience, T3 to T6) and their robustness checks (T7, T8) are not included.',
        traders: 10, practicePeriods: 2, periods: 15, tradingTime: 150, resultsTime: 15,
        assets: [{ name: 'Asset', dividends: [0, 3, 6] }],
        endowments: [{ cash: 3600, assets: 40 }],
        showHistory: true, exchangeRate: 1 / 400, cashName: 'Taler',
    }, settings);
}

// Cheung, Hedegaard and Palan (2014): training in the value, and whether it is public knowledge.
const CHP_QUESTIONS = [];
for (let t = 15; t >= 1; t--) CHP_QUESTIONS.push({ question: 'Suppose that you buy one share in period ' + t + ' and that you keep it until the end of the market (until period 15). What is the average total dividend that you will receive from this share?', answer: 24 * (16 - t) });
for (let t = 15; t >= 1; t--) CHP_QUESTIONS.push({ question: 'Suppose that you sell one share in period ' + t + ' and that you do not buy it back. What is the average total dividend that you give up on this share?', answer: 24 * (16 - t) });
function cheungHedegaardPalan(title, notes, settings) {
    return Object.assign({
        title: 'Cheung, Hedegaard and Palan (2014): ' + title,
        reference: 'Cheung, S. L., Hedegaard, M. and Palan, S. (2014). To see is to believe: common expectations in experimental asset markets. European Economic Review 66, 84–96.',
        notes: '10 traders: three with 2 units and 1890 ECU, four with 4 units and 1170, three with 6 units and 450 (2610 each at the value); a practice period, then 15 periods of 4 minutes; dividends of 0, 8, 28 or 60 ECU; the CRT afterwards (unpaid). 11 ECU to the Danish krone. ' + notes + ' A unit at a time is assumed here.',
        traders: 10, practicePeriods: 1, periods: 15, tradingTime: 240, multiUnit: false,
        assets: [{ name: 'Shares', dividends: SSW_DIVIDENDS }],
        endowments: [{ cash: 1890, assets: 2 }, { cash: 1170, assets: 4 }, { cash: 450, assets: 6 }], fillerType: 2,
        crt: 'after', exchangeRate: 1 / 11, showFundamentalValue: true, cashName: 'ECU',
    }, settings);
}

// Ackert, Charupat, Church and Deaves (2006): a standard asset and a lottery asset.
const ACCD_ASSETS = [
    { name: 'Stock A', description: 'Pays 0.50 or 0.90 a period (48% each), or 1.20 (4%).', dividends: { values: [0.5, 0.9, 1.2], probabilities: [0.48, 0.48, 0.04] } },
    { name: 'Stock B', description: 'Pays 0 a period (96%), or 18 (4%).', dividends: { values: [0, 18], probabilities: [0.96, 0.04] } },
];
function ackertCharupatChurchDeaves(title, notes, settings) {
    return Object.assign({
        title: 'Ackert, Charupat, Church and Deaves (2006): ' + title,
        reference: 'Ackert, L. F., Charupat, N., Church, B. K. and Deaves, R. (2006). Margin, short selling, and lotteries in experimental asset markets. Southern Economic Journal 73(2), 419–436.',
        notes: '9 traders (7 to 9), each with 2 units of two assets with the same expected dividend, 0.72 dollars a period: a standard asset and a lottery asset; 12 periods of 5 minutes; a unit at a time; only the best bid and ask stand (a book of depth one). In Canadian dollars. ' + notes + ' Their closing-price forecasts (a $20 prize for the best) are not included.',
        traders: 9, periods: 12, tradingTime: 300, multiUnit: false, tickSize: 0.01, orderBookDepth: 1, singleBest: true,
        assets: ACCD_ASSETS, exchangeRate: 1, showFundamentalValue: true, cashName: 'dollars',
    }, settings);
}

// Fischbacher, Hens and Zeisberger (2013): bonds, and an interest rate that leans against bubbles.
const FHZ_POLICY = { levels: [0.05, 0.11, 0.15, 0.21], periods: [4, 8, 12], threshold: 1.35 };
function fischbacherHensZeisberger(title, notes, bonds) {
    return {
        title: 'Fischbacher, Hens and Zeisberger (2013): ' + title,
        reference: 'Fischbacher, U., Hens, T. and Zeisberger, S. (2013). The impact of monetary policy on stock market bubbles and trading behavior: evidence from the lab. Journal of Economic Dynamics and Control 37(10), 2104–2122.',
        notes: '8 traders, each with 10 shares and 3600 Gulden; 15 periods with the dividends of Smith, Suchanek and Williams. Before each period, each trader puts some of their money into a one-period bond, which earns interest but cannot be used to buy shares; then 150 seconds of trading. ' + notes + ' The exchange rate (to Swiss francs) is not given here; a unit at a time is assumed.',
        traders: 8, periods: 15, tradingTime: 150, multiUnit: false,
        assets: [{ name: 'Shares', dividends: SSW_DIVIDENDS }],
        endowments: [{ cash: 3600, assets: 10 }], bonds,
        showFundamentalValue: true, cashName: 'Gulden',
    };
}

const PRESETS = {
    ssw: {
        title: 'Smith, Suchanek and Williams (1988)',
        reference: 'Smith, V. L., Suchanek, G. L. and Williams, A. W. (1988). Bubbles, crashes, and endogenous expectations in experimental spot asset markets. Econometrica 56(5), 1119–1151.',
        notes: 'The standard design: 9 traders of three endowment types (225, 585 or 945 cents and 3, 2 or 1 units; each worth 1305 at the start), 15 periods, a dividend of 0, 8, 28 or 60 cents each period and no value after the last, so that the fundamental value falls from 360 to 24. A unit at a time, and a period ends early if all vote to end it. The endowments and dividends are those GIMS takes as its defaults; the period length here (240 seconds) is that of later studies of this design (e.g. Eckel and Füllbrunn 2015).',
        traders: 9, periods: 15, tradingTime: 240, multiUnit: false, earlyEndingVote: true,
        showFundamentalValue: true, exchangeRate: 0.01, cashName: 'cents',
        assets: [{ name: 'Asset', dividends: SSW_DIVIDENDS }],
    },
    gims: {
        title: "GIMS's defaults",
        reference: 'Palan, S. (2015). GIMS — Software for asset market experiments. Journal of Behavioral and Experimental Finance 5, 1–14.',
        notes: "GIMS v8.4.2 as it comes: four assets traded at once, each with the dividends of Smith, Suchanek and Williams; three endowment types (225, 585 or 945 cash per asset, and 3, 2 or 1 units of each); multi-unit orders in steps of 0.01; 180 seconds of trading; the 3 best orders on each side and the last 4 prices shown. GIMS's treatment file has 1 period.",
        traders: 0, periods: 1, tickSize: 0.01, tradingTime: 180, resultsTime: 30,
        orderBookDepth: 3, priceListDepth: 4, cashName: 'ECU',
        assets: ['A', 'B', 'C', 'D'].map((name) => ({ name: 'Asset ' + name, dividends: SSW_DIVIDENDS })),
        endowments: [
            { cash: 225 * 4, assets: 3 },
            { cash: 585 * 4, assets: 2 },
            { cash: 945 * 4, assets: 1 },
        ],
    },
    'noussair-robin-ruffieux-2001': {
        title: 'Noussair, Robin and Ruffieux (2001): constant fundamental value',
        reference: 'Noussair, C., Robin, S. and Ruffieux, B. (2001). Price bubbles in laboratory asset markets with constant fundamental values. Experimental Economics 4, 87–105.',
        notes: 'The Purdue sessions: 10 traders (8 to 10), each with 10 units and 10,000; a practice period, then 15 periods of 3 to 5 minutes (240 seconds here). After each period a unit pays 36 or 4, or costs 24 or 16, equally likely, into an account apart from cash; after the last, a unit is worth 360, so the value is 360 throughout. Earnings: cash, 360 a unit, the dividend account, and 5400; 800 to the dollar. Trading was MUDA\'s, a unit at a time.',
        traders: 10, practicePeriods: 1, periods: 15, tradingTime: 240, multiUnit: false,
        assets: [{ name: 'X', dividends: [36, 4, -24, -16], buyback: 360 }],
        endowments: [{ cash: 10000, assets: 10 }],
        dividendAccount: 'separate', bonus: 5400, exchangeRate: 1 / 800, showFundamentalValue: true, cashName: 'francs',
    },
    'lei-noussair-plott-2001-nospec': {
        title: 'Lei, Noussair and Plott (2001): no speculation',
        reference: 'Lei, V., Noussair, C. N. and Plott, C. R. (2001). Nonspeculative bubbles in experimental asset markets: lack of common knowledge of rationality vs. actual irrationality. Econometrica 69(4), 831–859.',
        notes: 'The NoSpec sessions (as Tucker and Xu 2024 list them): 8 traders, half buyers with 7,200 francs and no units, who can only buy, and half sellers with 20 units and no cash, who can only sell; a practice period, then 12 periods of 4 minutes; dividends of 20 or 40, equally likely; 300 francs to the dollar. Dividends go to an account apart from cash, as in Tucker and Xu\'s replication; the paper\'s own bookkeeping of them is not reproduced from it.',
        traders: 8, practicePeriods: 1, periods: 12, tradingTime: 240, multiUnit: false,
        assets: [{ name: 'X', dividends: [20, 40] }],
        endowments: [{ cash: 7200, assets: 0, role: 'buyer' }, { cash: 0, assets: 20, role: 'seller' }],
        dividendAccount: 'separate', exchangeRate: 1 / 300, showFundamentalValue: true, cashName: 'francs',
    },
    'dufwenberg-lindqvist-moore-2005': {
        title: 'Dufwenberg, Lindqvist and Moore (2005)',
        reference: 'Dufwenberg, M., Lindqvist, T. and Moore, E. (2005). Bubbles and experience: an experiment. American Economic Review 95(5), 1731–1737.',
        notes: 'Working paper 588 (IUI, 2003): 6 traders, half with 6 units and 200 cents, half with 2 units and 600 cents; a two-minute practice period, then four rounds (markets) of 10 two-minute periods, each paying a dividend of 0 or 20 cents, equally likely. Every round is paid. (In the paper, two or four traders of the fourth round are newcomers; here the same traders play all four.)',
        traders: 6, practicePeriods: 1, rounds: 4, periods: 10, tradingTime: 120, multiUnit: false,
        assets: [{ name: 'X', dividends: [0, 20] }],
        endowments: [{ cash: 200, assets: 6 }, { cash: 600, assets: 2 }],
        exchangeRate: 0.01, showFundamentalValue: true, cashName: 'cents',
    },
    'haruvy-lahav-noussair-2007': {
        title: 'Haruvy, Lahav and Noussair (2007): call market and forecasts',
        reference: 'Haruvy, E., Lahav, Y. and Noussair, C. N. (2007). Traders\' expectations in asset markets: experimental evidence. American Economic Review 97(5), 1901–1920.',
        notes: 'As Carlé, Lahav, Neugebauer and Noussair (2019) describe it: 9 traders, with 1, 2 or 3 units (three of each) and the rest of 652 francs in cash; four rounds of 15 periods, each a call market where each trader submits one bid and one ask (price and quantity), bids below asks; dividends of 0, 4, 14 or 30, equally likely (a value of 180 at the start). Before each period, traders forecast the price of every period left, paid for each forecast within 10, 25 or 50% of the price (50, 20 or 10, as Baghestanian et al. give HLN\'s rewards). The exchange rate is not given here.',
        traders: 9, rounds: 4, periods: 15, mechanism: 'call', callMaxOrders: 1, marketOrders: false,
        assets: [{ name: 'Asset', dividends: [0, 4, 14, 30] }],
        endowments: [{ cash: 472, assets: 1 }, { cash: 292, assets: 2 }, { cash: 112, assets: 3 }],
        forecasts: { horizon: 'all', rewards: HLN_REWARDS, target: 'call' },
        showFundamentalValue: true, cashName: 'francs',
    },
    'kirchler-huber-stockl-2012-declining': {
        title: 'Kirchler, Huber and Stöckl (2012): declining value',
        reference: 'Kirchler, M., Huber, J. and Stöckl, T. (2012). Thar she bursts: reducing confusion reduces bubbles. American Economic Review 102(2), 865–883.',
        notes: 'The SSW markets of their working paper (Innsbruck 2009-26), the declining value of the study: 10 traders, half with 60 units and 1000 Taler, half with 20 units and 3000; two practice periods, then 10 periods of 120 seconds; a dividend of 0 or 10, equally likely, into cash, so that the value falls from 50 by 5 a period; orders of any size; 400 Taler to the euro. (The paper draws one dividend sequence in advance for all sessions; here they are drawn.)',
        traders: 10, practicePeriods: 2, periods: 10, tradingTime: 120,
        assets: [{ name: 'Stock', dividends: [0, 10] }],
        endowments: [{ cash: 1000, assets: 60 }, { cash: 3000, assets: 20 }],
        exchangeRate: 1 / 400, showFundamentalValue: true, cashName: 'Taler',
    },
    'kirchler-huber-stockl-2012-goldmine': {
        title: 'Kirchler, Huber and Stöckl (2012): declining value, gold mine',
        reference: 'Kirchler, M., Huber, J. and Stöckl, T. (2012). Thar she bursts: reducing confusion reduces bubbles. American Economic Review 102(2), 865–883.',
        notes: 'The declining-value market, with the asset called stocks of a depletable gold mine, the framing that reduced confusion and mispricing in the paper.',
        traders: 10, practicePeriods: 2, periods: 10, tradingTime: 120,
        assets: [{ name: 'Gold mine', description: 'Stocks of a depletable gold mine: its gold runs out after the last period, and the stock is then worth nothing.', dividends: [0, 10] }],
        endowments: [{ cash: 1000, assets: 60 }, { cash: 3000, assets: 20 }],
        exchangeRate: 1 / 400, showFundamentalValue: true, cashName: 'Taler',
    },
    'kirchler-huber-stockl-2012-t4': {
        title: 'Kirchler, Huber and Stöckl (2012): constant value and cash (T4)',
        reference: 'Kirchler, M., Huber, J. and Stöckl, T. (2012). Thar she bursts: reducing confusion reduces bubbles. American Economic Review 102(2), 865–883.',
        notes: 'Treatment T4, as Noussair and Tucker (2014) replicate it with KHS\'s program: 10 traders, half with 20 units and 3,000 Taler, half with 60 and 1,000; two practice periods, then 10 periods of 120 seconds; a dividend of −5 or +5, equally likely, into an account apart from cash, and 50 a unit after the last period, so the value is 50 throughout and the cash-to-asset ratio stays 1. No shorting or borrowing; 400 Taler to the euro.',
        traders: 10, practicePeriods: 2, periods: 10, tradingTime: 120,
        assets: [{ name: 'Stock', dividends: [-5, 5], buyback: 50 }],
        endowments: [{ cash: 3000, assets: 20 }, { cash: 1000, assets: 60 }],
        dividendAccount: 'separate', exchangeRate: 1 / 400, showFundamentalValue: true, cashName: 'Taler',
    },
    'kirchler-huber-stockl-2012-t2': {
        title: 'Kirchler, Huber and Stöckl (2012): constant value, rising cash (T2)',
        reference: 'Kirchler, M., Huber, J. and Stöckl, T. (2012). Thar she bursts: reducing confusion reduces bubbles. American Economic Review 102(2), 865–883.',
        notes: 'Treatment T2: as T4, with cash given to each trader after each period (444, 556, 714, 953, 1333, 2000, 3333, 6667, 20000 and 0), so that the cash-to-asset ratio rises from 1 to 19 (Noussair and Tucker 2014, table 2).',
        traders: 10, practicePeriods: 2, periods: 10, tradingTime: 120,
        assets: [{ name: 'Stock', dividends: [-5, 5], buyback: 50 }],
        endowments: [{ cash: 3000, assets: 20 }, { cash: 1000, assets: 60 }],
        cashInflow: [444, 556, 714, 953, 1333, 2000, 3333, 6667, 20000, 0],
        dividendAccount: 'separate', exchangeRate: 1 / 400, showFundamentalValue: true, cashName: 'Taler',
    },
    'noussair-tucker-2014-20x': {
        title: 'Noussair and Tucker (2014): constant value, 20 times the cash',
        reference: 'Noussair, C. N. and Tucker, S. (2014). Cash inflows and bubbles in asset markets with constant fundamental values. University of Waikato working paper 03/14 (2014).',
        notes: 'Treatment T4_20x: KHS\'s T4 with 20 times the cash, a cash-to-asset ratio of 20 throughout: half the traders with 20 units and 41,000 Taler, half with 60 units and 39,000. Paid in New Zealand dollars; the rate is not given here.',
        traders: 10, practicePeriods: 2, periods: 10, tradingTime: 120,
        assets: [{ name: 'Stock', dividends: [-5, 5], buyback: 50 }],
        endowments: [{ cash: 41000, assets: 20 }, { cash: 39000, assets: 60 }],
        dividendAccount: 'separate', showFundamentalValue: true, cashName: 'Taler',
    },
    'lugovskyy-puzzello-tucker-williams-2014': {
        title: 'Lugovskyy, Puzzello, Tucker and Williams (2014): no cap',
        reference: 'Lugovskyy, V., Puzzello, D., Tucker, S. and Williams, A. (2014). Asset-holdings caps and bubbles in experimental asset markets. Journal of Economic Behavior & Organization (Waikato working paper 13/12, 2012).',
        notes: 'The Unconstrained treatment: 9 traders (7 to 12), each with 10 units and 10,000 francs; 15 periods (120 or 180 seconds; 180 here) with the dividends of Smith, Suchanek and Williams; a cognitive reflection test first, $2 a right answer; before each period, a forecast of the period\'s mean price, paid into an account apart from cash (at HLN\'s rewards, assumed here); 600 francs to the dollar (the US sessions).',
        traders: 9, periods: 15, tradingTime: 180,
        assets: [{ name: 'Asset', dividends: SSW_DIVIDENDS }],
        endowments: [{ cash: 10000, assets: 10 }],
        forecasts: { horizon: 1, rewards: HLN_REWARDS, target: 'mean' },
        crt: 'before', crtPay: 1200, exchangeRate: 1 / 600, showFundamentalValue: true, cashName: 'francs',
    },
    'lugovskyy-puzzello-tucker-williams-2014-cap': {
        title: 'Lugovskyy, Puzzello, Tucker and Williams (2014): permanent cap',
        reference: 'Lugovskyy, V., Puzzello, D., Tucker, S. and Williams, A. (2014). Asset-holdings caps and bubbles in experimental asset markets. Journal of Economic Behavior & Organization.',
        notes: 'The Permanent Cap treatment: no trader may hold more than 18 units (1.8 times the endowment), in every period. Otherwise as the Unconstrained treatment.',
        traders: 9, periods: 15, tradingTime: 180, holdingCap: 18,
        assets: [{ name: 'Asset', dividends: SSW_DIVIDENDS }],
        endowments: [{ cash: 10000, assets: 10 }],
        forecasts: { horizon: 1, rewards: HLN_REWARDS, target: 'mean' },
        crt: 'before', crtPay: 1200, exchangeRate: 1 / 600, showFundamentalValue: true, cashName: 'francs',
    },
    'lugovskyy-puzzello-tucker-williams-2014-short-cap': {
        title: 'Lugovskyy, Puzzello, Tucker and Williams (2014): short-term cap',
        reference: 'Lugovskyy, V., Puzzello, D., Tucker, S. and Williams, A. (2014). Asset-holdings caps and bubbles in experimental asset markets. Journal of Economic Behavior & Organization.',
        notes: 'The Short-Term Cap treatment: the cap of 18 units is lifted at the start of period 9.',
        traders: 9, periods: 15, tradingTime: 180, holdingCap: 18, holdingCapUntil: 8,
        assets: [{ name: 'Asset', dividends: SSW_DIVIDENDS }],
        endowments: [{ cash: 10000, assets: 10 }],
        forecasts: { horizon: 1, rewards: HLN_REWARDS, target: 'mean' },
        crt: 'before', crtPay: 1200, exchangeRate: 1 / 600, showFundamentalValue: true, cashName: 'francs',
    },
    'eckel-fullbrunn-2015': {
        title: 'Eckel and Füllbrunn (2015)',
        reference: 'Eckel, C. C. and Füllbrunn, S. C. (2015). Thar SHE blows? Gender, competition, and bubbles in experimental asset markets. American Economic Review 105(2), 906–920.',
        notes: 'From the instructions in the online appendix: 9 traders, 18 units in all; a practice period, then 15 periods of 240 seconds; dividends of 0, 8, 28 or 60 tokens into cash; a unit at a time; before each period, forecasts of the price of every period left, 5 tokens for each within 10% of the price, 2 within 25%, 1 within 50%; 100 tokens to the dollar. The endowments are those of Smith, Suchanek and Williams (3, 2 or 1 units), assumed here; the appendix does not give the cash.',
        traders: 9, practicePeriods: 1, periods: 15, tradingTime: 240, multiUnit: false,
        assets: [{ name: 'Shares', dividends: SSW_DIVIDENDS }],
        forecasts: { horizon: 'all', rewards: [[0.10, 5], [0.25, 2], [0.50, 1]], target: 'mean' },
        exchangeRate: 0.01, showFundamentalValue: true, cashName: 'tokens',
    },
    'giusti-jiang-xu-2014-falling': {
        title: 'Giusti, Jiang and Xu (2014): interest on cash, falling value',
        reference: 'Giusti, G., Jiang, J. H. and Xu, Y. (2014). Interest on cash, fundamental value process and bubble formation: an experimental study. Bank of Canada staff working paper 2014-18.',
        notes: 'Treatment F (sessions F1, F2): 10 traders, each with 4 units and 2000; 15 periods of 150 seconds; dividends of Smith, Suchanek and Williams; 10% interest on cash each period, and 72 a unit after the last period, so the value falls from 200 to 87. A unit at a time; a practice period. The exchange rate is not given here.',
        traders: 10, practicePeriods: 1, periods: 15, tradingTime: 150, multiUnit: false,
        assets: [{ name: 'Shares', dividends: SSW_DIVIDENDS, buyback: 72 }],
        endowments: [{ cash: 2000, assets: 4 }],
        interest: 0.10, showFundamentalValue: true,
    },
    'giusti-jiang-xu-2014-rising': {
        title: 'Giusti, Jiang and Xu (2014): interest on cash, rising value',
        reference: 'Giusti, G., Jiang, J. H. and Xu, Y. (2014). Interest on cash, fundamental value process and bubble formation: an experimental study. Bank of Canada staff working paper 2014-18.',
        notes: 'Treatment R (sessions R1 to R3): as F, with 720 a unit after the last period, so the value rises from 355 to 676.',
        traders: 10, practicePeriods: 1, periods: 15, tradingTime: 150, multiUnit: false,
        assets: [{ name: 'Shares', dividends: SSW_DIVIDENDS, buyback: 720 }],
        endowments: [{ cash: 2000, assets: 4 }],
        interest: 0.10, showFundamentalValue: true,
    },
    'giusti-jiang-xu-2014-negative': {
        title: 'Giusti, Jiang and Xu (2014): negative dividends and interest',
        reference: 'Giusti, G., Jiang, J. H. and Xu, Y. (2014). Interest on cash, fundamental value process and bubble formation: an experimental study. Bank of Canada staff working paper 2014-18.',
        notes: 'Treatment N (sessions N1 to N3): a holding cost of 0, 8, 28 or 60 a unit each period, a charge of 10% on cash, 500 a unit after the last period, and 50,000 in cash each: the value falls from 1503 to 529.',
        traders: 10, practicePeriods: 1, periods: 15, tradingTime: 150, multiUnit: false,
        assets: [{ name: 'Shares', dividends: [0, -8, -28, -60], buyback: 500 }],
        endowments: [{ cash: 50000, assets: 4 }],
        interest: -0.10, showFundamentalValue: true,
    },
    'huber-bindra-kleinlercher-2019': {
        title: 'Huber, Bindra and Kleinlercher (2019): constant value, rising cash',
        reference: 'Huber, J., Bindra, P. C. and Kleinlercher, D. (2019). Design-features of bubble-prone experimental asset markets with a constant FV. Journal of the Economic Science Association.',
        notes: 'The BASE treatment, run with GIMS: 8 traders, each with 20 units and 560 Taler; two practice periods, then 20 periods of 120 seconds; dividends of 1.20 or 1.60, equally likely, 5% interest on cash after trading, 100 Taler to each trader after each period, and 28 a unit after the last period, so the value is 28 throughout. Before each period, forecasts of the mean price this period and the next two, 50 Taler for each within 5%. 400 Taler to the euro. The chart\'s scale (their treatment variable) is not reproduced.',
        traders: 8, practicePeriods: 2, periods: 20, tradingTime: 120, tickSize: 0.01,
        assets: [{ name: 'Asset', dividends: [1.2, 1.6], buyback: 28 }],
        endowments: [{ cash: 560, assets: 20 }],
        interest: 0.05, cashInflow: 100,
        forecasts: { horizon: 3, rewards: [[0.05, 50]], target: 'mean' },
        exchangeRate: 1 / 400, showFundamentalValue: true, cashName: 'Taler',
    },
    'baghestanian-lugovskyy-puzzello-tucker-da': {
        title: 'Baghestanian, Lugovskyy, Puzzello and Tucker: double auction',
        reference: 'Baghestanian, S., Lugovskyy, V., Puzzello, D. and Tucker, S. Trading institutions in experimental asset markets: theory and evidence (working paper).',
        notes: 'The Double Auction treatment: 9 traders, each with 10 units and 10,000 francs; 15 periods of 3 minutes with the dividends of Smith, Suchanek and Williams; a unit at a time, at most 10 units bought a period; a cognitive reflection test first ($2 a right answer); before each period, a forecast of its mean price (50, 20 or 10 francs within 10, 25 or 50%), paid apart from cash. The exchange rate (not given) is that of related US sessions, 600 francs to the dollar.',
        traders: 9, periods: 15, tradingTime: 180, multiUnit: false, purchaseLimit: 10,
        assets: [{ name: 'Asset', dividends: SSW_DIVIDENDS }],
        endowments: [{ cash: 10000, assets: 10 }],
        forecasts: { horizon: 1, rewards: HLN_REWARDS, target: 'mean' },
        crt: 'before', crtPay: 1200, exchangeRate: 1 / 600, showFundamentalValue: true, cashName: 'francs',
    },
    'baghestanian-lugovskyy-puzzello-tucker-call': {
        title: 'Baghestanian, Lugovskyy, Puzzello and Tucker: call market',
        reference: 'Baghestanian, S., Lugovskyy, V., Puzzello, D. and Tucker, S. Trading institutions in experimental asset markets: theory and evidence (working paper).',
        notes: 'The Call Market treatment: as the double auction, with a closed-book call market each period: one buy and one sell order each (a quantity and a price), buy prices below sell prices; ties for the last units broken at random. Forecasts are of the market price. (Their price is the lowest that clears the market; GIMS\'s rule, used here, picks among the clearing prices by its own steps.)',
        traders: 9, periods: 15, mechanism: 'call', callMaxOrders: 1, marketOrders: false, rationing: 'random', purchaseLimit: 10,
        assets: [{ name: 'Asset', dividends: SSW_DIVIDENDS }],
        endowments: [{ cash: 10000, assets: 10 }],
        forecasts: { horizon: 1, rewards: HLN_REWARDS, target: 'call' },
        crt: 'before', crtPay: 1200, exchangeRate: 1 / 600, showFundamentalValue: true, cashName: 'francs',
    },
    'tucker-xu-2024-onemkt': {
        title: 'Tucker and Xu (2024): one market',
        reference: 'Tucker, S. and Xu, Y. (2024). Nonspeculative bubbles revisited. Journal of Behavioral and Experimental Finance (Waikato working paper 1/24).',
        notes: 'The OneMkt baseline of their replication of Lei, Noussair and Plott: 8 traders, each with 10 units and 10,000 francs; 15 periods of 3 minutes; the dividends of Smith, Suchanek and Williams, into an account apart from cash. Paid in New Zealand dollars; the rate is not given here.',
        traders: 8, periods: 15, tradingTime: 180,
        assets: [{ name: 'X', dividends: SSW_DIVIDENDS }],
        endowments: [{ cash: 10000, assets: 10 }],
        dividendAccount: 'separate', showFundamentalValue: true, cashName: 'francs',
    },
    'tucker-xu-2024-nospec': {
        title: 'Tucker and Xu (2024): no speculation',
        reference: 'Tucker, S. and Xu, Y. (2024). Nonspeculative bubbles revisited. Journal of Behavioral and Experimental Finance (Waikato working paper 1/24).',
        notes: 'Their NoSpec treatment: half the traders are buyers with 10,000 francs and no units, who can only buy; half are sellers with 10 units and no cash, who can only sell. Otherwise as OneMkt.',
        traders: 8, periods: 15, tradingTime: 180,
        assets: [{ name: 'X', dividends: SSW_DIVIDENDS }],
        endowments: [{ cash: 10000, assets: 0, role: 'buyer' }, { cash: 0, assets: 10, role: 'seller' }],
        dividendAccount: 'separate', showFundamentalValue: true, cashName: 'francs',
    },

    // From the studies of the asset market experiments list (sites.google.com/site/opowell/assetmarketexperiments).
    'haruvy-noussair-2006-nss': haruvyNoussair('no short selling (NSS)', 'No short sales.', { shortAssets: 0 }),
    'haruvy-noussair-2006-ql3': haruvyNoussair('short up to 3 units (QL3)', 'A trader may be short at most 3 units.', { shortAssets: 3 }),
    'haruvy-noussair-2006-ql6': haruvyNoussair('short up to 6 units (QL6)', 'A trader may be short at most 6 units.', { shortAssets: 6 }),
    'haruvy-noussair-2006-cr100': haruvyNoussair('cash reserve of 100% (CR100)', 'Short positions of any size, as long as the trader keeps cash of the value of the units they are short, 24 × (16 − t) a unit.', { shortAssets: 1e9, shortReserve: 1 }),
    'haruvy-noussair-2006-cr150': haruvyNoussair('cash reserve of 150% (CR150)', 'Short positions of any size, as long as the trader keeps cash of 150% of the value of the units they are short.', { shortAssets: 1e9, shortReserve: 1.5 }),
    'haruvy-noussair-2006-flx': haruvyNoussair('flexible cash reserve (FLX)', 'As CR100, but the reserve is 200% of the value when the last trade price was below the value.', { shortAssets: 1e9, shortReserve: 1, shortReserveBelow: 2 }),
    'noussair-powell-2010-peak': noussairPowell('peak', 'Peak: taxes after periods 1 to 7, so the value rises from 24 to 192 in period 8 and then falls; endowments of 1281, 1257 and 1233 francs with 1, 2 and 3 units. (The paper\'s instructions say eight tax periods; the text, the formula and the endowments say seven.)', {
        assets: [{ name: 'Shares', dividends: SSW_DIVIDENDS, tax: [48, 48, 48, 48, 48, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0] }],
        endowments: [{ cash: 1281, assets: 1 }, { cash: 1257, assets: 2 }, { cash: 1233, assets: 3 }],
    }),
    'noussair-powell-2010-valley': noussairPowell('valley', 'Valley (sessions V3 to V5): taxes after periods 8 to 15, and 216 francs a unit after the last period, so the value falls from 192 to 24 in period 8 and then rises to 240; endowments of 1113, 921 and 729 francs with 1, 2 and 3 units.', {
        assets: [{ name: 'Shares', dividends: SSW_DIVIDENDS, tax: [0, 0, 0, 0, 0, 0, 0, 48, 48, 48, 48, 48, 48, 48, 48], buyback: 216 }],
        endowments: [{ cash: 1113, assets: 1 }, { cash: 921, assets: 2 }, { cash: 729, assets: 3 }],
    }),
    'corgnet-kujal-porter-2010-base': corgnetKujalPorter('no messages (N)', 'No other messages (the baseline).', null),
    'corgnet-kujal-porter-2010-random': corgnetKujalPorter('random message (RH, RL)', 'In periods 3, 7 and 12, the message "The price is too high" or "The price is too low", one of them drawn (by a die in the paper) for the session.', { draw: [TOO_HIGH, TOO_LOW] }),
    'corgnet-kujal-porter-2010-high': corgnetKujalPorter('preset message, too high (H)', 'In periods 3, 7 and 12, the message "The price is too high".', TOO_HIGH),
    'corgnet-kujal-porter-2010-low': corgnetKujalPorter('preset message, too low (L)', 'In periods 3, 7 and 12, the message "The price is too low".', TOO_LOW),
    'corgnet-kujal-porter-2010-market': corgnetKujalPorter('market-based message (A)', 'In periods 3, 7 and 12, "The price is too high" if the mean price of the period before was above the value, "The price is too low" if below.', { above: TOO_HIGH, below: TOO_LOW }),
    'fiedler-2011': {
        title: 'Fiedler (2011): an internet-based market',
        reference: 'Fiedler, M. (2011). Experience and confidence in an internet-based asset market experiment. Southern Economic Journal 78(1), 30–52.',
        notes: 'Run in Second Life, with Haruvy and Noussair\'s design and twice the endowments of Smith, Suchanek and Williams (6, 4 or 2 units and 450, 1170 or 1890 Linden dollars): 9 traders (8 or 9), 15 periods of 2 minutes, dividends of 0, 8, 28 or 60. 267 Linden dollars to the US dollar. A unit at a time is assumed here.',
        traders: 9, periods: 15, tradingTime: 120, multiUnit: false,
        assets: [{ name: 'Shares', dividends: SSW_DIVIDENDS }],
        endowments: SSW_DOUBLED, exchangeRate: 1 / 267, showFundamentalValue: true, cashName: 'Linden dollars',
    },
    'lahav-2011': {
        title: 'Lahav (2011): a 200-period call market',
        reference: 'Lahav, Y. (2011). Price patterns in experimental asset markets with long horizon. Journal of Behavioral Finance 12(1), 20–28.',
        notes: '9 traders, each with 6 units and 150 francs; 200 periods of a call market in which each trader submits one buy and one sell order (a price and a quantity); a dividend of 0 or 0.30, equally likely, so that the value falls from 30 by 0.15 a period. The price is the middle of the prices at which the most units trade (the median of the crossing of demand and supply in the paper); ties for the last units are broken at random; all orders are shown afterwards. 10 francs to the dollar. The time to submit orders and to see the results (30 and 8 seconds) is assumed here.',
        traders: 9, periods: 200, mechanism: 'call', callMaxOrders: 1, marketOrders: false, callPrice: 'midpoint', rationing: 'random',
        callTime: 30, resultsTime: 8, tickSize: 0.01, showCallOrders: true,
        assets: [{ name: 'Asset', dividends: [0, 0.3] }],
        endowments: [{ cash: 150, assets: 6 }], exchangeRate: 0.1, showFundamentalValue: true, cashName: 'francs',
    },
    'schoenberg-haruvy-2012-up': schoenbergHaruvy('upward reference (AllUp)', 'highest', 'the largest account total in the market (upward reference).'),
    'schoenberg-haruvy-2012-down': schoenbergHaruvy('downward reference (AllDown)', 'lowest', 'the smallest account total in the market (downward reference).'),
    'ackert-kluger-qi-2012': {
        title: 'Ackert, Kluger and Qi (2012): the traded lottery asset',
        reference: 'Ackert, L. F., Kluger, B. D. and Qi, L. (2012). Irrationality and beliefs in a laboratory asset market: advancing the case for probability judgment error. Journal of Economic Behavior & Organization 84(1), 278–291.',
        notes: 'The double auction of each period only: 12 traders, each with 3 units of a lottery asset and a $40 loan; 12 periods of 3 minutes. A unit pays $20 after a period with probability 2% (a chip numbered 99 or 100 of 100), and nothing otherwise; all dividends are drawn at the end of the session, for the units held in each period. The second-price auctions for two assets that are not traded, and the price predictions, which came before trading in each period, are not included. A unit at a time is assumed here.',
        traders: 12, periods: 12, tradingTime: 180, multiUnit: false, tickSize: 0.01,
        assets: [{ name: 'Asset', dividends: { values: [0, 20], probabilities: [0.98, 0.02] } }],
        endowments: [{ cash: 40, assets: 3 }], loan: true, dividendTiming: 'end',
        exchangeRate: 1, showFundamentalValue: true, cashName: 'dollars',
    },
    'haruvy-noussair-powell-2014-benchmark': haruvyNoussairPowell('benchmark', 'No intervention.', null),
    'haruvy-noussair-powell-2014-repurchase': haruvyNoussairPowell('repurchase', 'From period 6, a computerized firm buys back half the shares (18 units): every 5 seconds, if the spread is more than 10 francs, it bids 10 above the best bid; if not, it buys at the best ask. Its new bid replaces its old one.', { period: 6, side: 'buy', share: 0.5, interval: 5, threshold: 10 }),
    'haruvy-noussair-powell-2014-issue': haruvyNoussairPowell('share issue', 'From period 6, a computerized firm sells new shares, half as many as there are (18 units): every 5 seconds, if the spread is more than 10 francs, it asks 10 below the best ask; if not, it sells at the best bid. Its new ask replaces its old one.', { period: 6, side: 'sell', share: 0.5, interval: 5, threshold: 10 }),
    'corgnet-hernan-kujal-porter-2014': {
        title: 'Corgnet, Hernán-González, Kujal and Porter (2014): house money',
        reference: 'Corgnet, B., Hernán-González, R., Kujal, P. and Porter, D. (2014). The effect of earned versus house money on price bubble formation in experimental asset markets. Review of Finance (2014), doi:10.1093/rof/rfu031.',
        notes: 'The house money treatment: 9 traders with 4, 5 or 6 units and 1710, 1350 or 990 cents ($31.50 each at the value); 15 periods of 4 minutes; a certain dividend of 24 cents a period; the CRT afterwards (unpaid). In the earned money treatment, the same market was played with $31.50 earned in a two-hour task three days before. A unit at a time is assumed here.',
        traders: 9, periods: 15, tradingTime: 240, multiUnit: false,
        assets: [{ name: 'Shares', dividends: [24] }],
        endowments: [{ cash: 1710, assets: 4 }, { cash: 1350, assets: 5 }, { cash: 990, assets: 6 }],
        crt: 'after', exchangeRate: 0.01, showFundamentalValue: true, cashName: 'cents',
    },
    'fellner-theissen-2014-pa0': fellnerTheissen('PA', 0),
    'fellner-theissen-2014-pa60': fellnerTheissen('PA', 0.6),
    'fellner-theissen-2014-pa80': fellnerTheissen('PA', 0.8),
    'fellner-theissen-2014-ap0': fellnerTheissen('AP', 0),
    'fellner-theissen-2014-ap60': fellnerTheissen('AP', 0.6),
    'fellner-theissen-2014-ap80': fellnerTheissen('AP', 0.8),
    'stockl-huber-kirchler-2014-falling': stocklHuberKirchler('falling value (R1)', 'R1: a dividend of 0, 3 or 6 Taler after each period, so that the value falls from 45 by 3 a period.', { dividends: [0, 3, 6] }),
    'stockl-huber-kirchler-2014-constant': stocklHuberKirchler('constant value (R2)', 'R2: a dividend of −3, 0 or 3 Taler after each period (a negative one is a holding cost), and 45 a unit after the last period, so the value is 45 throughout.', { dividends: [-3, 0, 3], buyback: 45 }),
    'stockl-huber-kirchler-2014-rising': stocklHuberKirchler('rising value (R3)', 'R3: holding costs of 0, 3 or 6 Taler after each period, and 90 a unit after the last period, so the value rises from 45 by 3 a period.', { dividends: [-6, -3, 0], buyback: 90 }),
    'stockl-huber-kirchler-2014-trimodal': stocklHuberKirchler('random value, three steps (R4)', 'R4: no dividends; the value starts at 45 and changes by −3, 0 or +3 (equally likely) after each period, shown then; a unit pays the value after the last period. (The paper uses one drawn path and its mirror image; here a path is drawn for each market.)', { dividends: [0], walk: { start: 45, steps: [-3, 0, 3] } }),
    'stockl-huber-kirchler-2014-normal': stocklHuberKirchler('random value, normal steps (R5)', 'R5: as R4, with normal steps of mean 0 and standard deviation 2.5. (The paper uses one drawn path and its mirror image; here a path is drawn for each market.)', { dividends: [0], walk: { start: 45, sd: 2.5 } }),
    'palfrey-wang-2012': {
        title: 'Palfrey and Wang (2012): news and speculation',
        reference: 'Palfrey, T. R. and Wang, S. W. (2012). Speculative overpricing in asset markets with information flows. Econometrica 80(5), 1937–1976.',
        notes: 'The baseline: 11 traders (68 in six sessions); a practice market of 3 periods, then six markets of 11 periods of 50 seconds. Before each market a coin decides whether a unit pays 100 or 20 experimental dollars at its end; after each period but the last, public news, good or bad, right two times in three. Each market starts with 3 units; cash (800 at first, a loan) carries over from market to market. Integer prices up to 100, a unit at a time; only the latest improving bid and offer stand, and a trader has one bid or offer at a time. A cent (or two) an experimental dollar.',
        traders: 11, practicePeriods: 3, rounds: 6, periods: 11, tradingTime: 50, resultsTime: 10, multiUnit: false,
        tickSize: 1, maxPrice: 100, singleBest: true, maxOpenOrdersTotal: 1,
        assets: [{ name: 'Asset', description: 'Pays 100 a unit at the end of the market if the coin came up heads, 20 if tails.', dividends: [0], buyback: { values: [100, 20] } }],
        endowments: [{ cash: 800, assets: 3 }], loan: true, carryCash: true,
        stateSignals: { accuracy: 2 / 3, when: 'end', labels: ['good news', 'bad news'] },
        showHistory: true, exchangeRate: 0.01, cashName: 'experimental dollars',
    },
    'cheung-palan-2012-teams': {
        title: 'Cheung and Palan (2012): teams of two',
        reference: 'Cheung, S. L. and Palan, S. (2012). Two heads are less bubbly than one: team decision-making in an experimental asset market. Experimental Economics 15(3), 373–397.',
        notes: 'Haruvy, Noussair and Powell\'s market, with each trader a team of two at one computer: 9 traders with 6, 4 or 2 units and 450, 1170 or 1890 francs; a practice period (10 minutes, alone), then 15 periods of 5 minutes (4 for individuals); dividends of 0, 8, 28 or 60 francs. Both team members are paid the team\'s earnings, 100 francs to the euro. A unit at a time is assumed here.',
        traders: 9, practicePeriods: 1, periods: 15, tradingTime: 300, multiUnit: false,
        assets: [{ name: 'Shares', dividends: SSW_DIVIDENDS }],
        endowments: SSW_DOUBLED, exchangeRate: 0.01, showFundamentalValue: true, cashName: 'francs',
    },
    'oechssler-schmidt-schnedler-2011-noinf': oechsslerSchmidtSchnedler('no information (NOINF)', 'No trader learns anything about the supplements.', { supplements: { amounts: [80, 40], insider: 0 } }),
    'oechssler-schmidt-schnedler-2011-inf': oechsslerSchmidtSchnedler('inside information (INF)', 'With probability ½, one trader, drawn at random, is told which asset has one of the supplements, and how much.', { supplements: { amounts: [80, 40], insider: 0.5 } }),
    'oechssler-schmidt-schnedler-2011-infchat': oechsslerSchmidtSchnedler('inside information and chat (INFCHAT)', 'As INF, with a chat of 60 seconds before each day but the first, open to all; each message shows the sender\'s wealth at the last prices.', { supplements: { amounts: [80, 40], insider: 0.5 }, chatTime: 60, chatFrom: 2 }),
    'cheung-hedegaard-palan-2014-base': cheungHedegaardPalan('no training (BASE)', 'BASE: no training.', {}),
    'cheung-hedegaard-palan-2014-pk': cheungHedegaardPalan('training, public knowledge (PK)', 'PK: before the market, every trader answers 30 questions on the value (what a share bought, or sold, in each period pays on average), and all know that all of them have.', {
        controlQuestions: CHP_QUESTIONS, controlQuestionsIntro: 'Every trader in your market answers these questions correctly before the market begins.',
    }),
    'cheung-hedegaard-palan-2014-npk': cheungHedegaardPalan('training, not public knowledge (NPK)', 'NPK: every trader answers the questions, but is told only that some traders in the session do (in the paper, ten of twenty).', {
        controlQuestions: CHP_QUESTIONS, controlQuestionsIntro: 'Some of the participants in this session are asked to answer these questions. The experiment begins when they have answered them all correctly.',
    }),
    'cheung-hedegaard-palan-2014-wait': cheungHedegaardPalan('no training, waiting (WAIT)', 'WAIT: no training, and a message that no one in the market answered questions (in the paper, these traders waited while others in the session were trained).', {
        announcements: [{ periods: [1], text: 'None of the traders in your market answered any questions about the instructions.' }],
    }),
    'ackert-charupat-church-deaves-2006-nssb': ackertCharupatChurchDeaves('borrowing, no short selling (NSS/B)', 'NSS/B: $100 of cash, a loan paid back at the end; earnings are the cash left over it, and at least 0.', { endowments: [{ cash: 100, assets: 2 }], loan: true }),
    'ackert-charupat-church-deaves-2006-nssnb': ackertCharupatChurchDeaves('no borrowing, no short selling (NSS/NB)', 'NSS/NB: $40 of cash, not a loan.', { endowments: [{ cash: 40, assets: 2 }] }),
    'ackert-charupat-church-deaves-2006-ssnb': ackertCharupatChurchDeaves('short selling, no borrowing (SS/NB)', 'SS/NB: $40 of cash, and short sales of up to 5 units of each asset (in the paper, a limit at the end of each period; here, at all times). Traders who are short pay the dividends.', { endowments: [{ cash: 40, assets: 2 }], shortAssets: 5 }),
    'fischbacher-hens-zeisberger-2013-nopolicy': fischbacherHensZeisberger('no policy', 'The control markets: the bond rate is 5% throughout.', { rate: 0.05 }),
    'fischbacher-hens-zeisberger-2013-policy': fischbacherHensZeisberger('interest rate policy', 'Experiment 1\'s policy markets: the rate starts at 5% and is raised, in periods 4, 8 and 12, to 11, 15 and 21% when the price forecast (4/3 of the last mean price, plus 1/3 of the one before, less 2/3 of the one before that) is above 135% of the value; it is lowered a level as soon as the mean price falls to the value at the current rate. Interest is paid into cash after each period.', { rate: 0.05, policy: FHZ_POLICY }),
    'fischbacher-hens-zeisberger-2013-exogenous': fischbacherHensZeisberger('exogenous rates, interest at the end', 'Experiment 2\'s policy markets: the rate rises to 11, 15 and 21% in periods 4, 8 and 12 whatever the prices, and interest is paid at the end, not into cash.', { rate: 0.05, payAtEnd: true, policy: Object.assign({ exogenous: true }, FHZ_POLICY) }),
    'ackert-charupat-deaves-kluger-2009': {
        title: 'Ackert, Charupat, Deaves and Kluger (2009): truncated and untruncated lotteries',
        reference: 'Ackert, L. F., Charupat, N., Deaves, R. and Kluger, B. D. (2009). Probability judgment error and speculation in laboratory asset market bubbles. Journal of Financial and Quantitative Analysis 44(3), 719–744.',
        notes: 'The multi-period market (MP-10) of each session: each trader has a $40 loan and 2 units of two assets, which pay $20 after a period with probability 2% and nothing otherwise, drawn apart; asset B pays only until it has paid three times ($60 at most). 10 periods of 5 minutes, a unit at a time, a book of depth one. In Canadian dollars. The number of traders (9) is assumed here; the two single-period markets of each session (5 and 8 draws) are not included. The value shown for B is A\'s, as the paper finds them within a cent of each other.',
        traders: 9, periods: 10, tradingTime: 300, multiUnit: false, tickSize: 0.01, orderBookDepth: 1, singleBest: true,
        assets: [
            { name: 'Stock A', description: 'Pays $20 after a period with probability 2%.', dividends: { values: [0, 20], probabilities: [0.98, 0.02] } },
            { name: 'Stock B', description: 'Pays $20 after a period with probability 2%, until it has paid three times.', dividends: { values: [0, 20], probabilities: [0.98, 0.02] }, maxPayouts: 3 },
        ],
        endowments: [{ cash: 40, assets: 2 }], loan: true, exchangeRate: 1, showFundamentalValue: true, cashName: 'dollars',
    },
    'hussam-porter-smith-2008-baseline': {
        title: 'Hussam, Porter and Smith (2008): baseline',
        reference: 'Hussam, R. N., Porter, D. and Smith, V. L. (2008). Thar she blows: can bubbles be rekindled with experienced subjects? American Economic Review 98(3), 924–937.',
        notes: 'The baseline environment: 15 periods of a uniform-price sealed-bid-offer call market; dividends of 0, 8, 28 or 60 cents; three portfolio types, $10.80 and 3 shares, $7.20 and 4, $3.60 and 5 ($21.60 each at the value), spread evenly, with any remainder given the middle one. 14 traders (70 subjects in five cohorts). The same cohort played it two or three times, as sessions on different days: run it again for experience. One buy and one sell order each per period, and 60 seconds to submit them, are assumed here; the paper does not give them.',
        traders: 14, periods: 15, mechanism: 'call', callMaxOrders: 1, marketOrders: false, callTime: 60,
        assets: [{ name: 'Shares', dividends: SSW_DIVIDENDS }],
        endowments: [{ cash: 1080, assets: 3 }, { cash: 720, assets: 4 }, { cash: 360, assets: 5 }], fillerType: 2,
        exchangeRate: 0.01, showFundamentalValue: true, cashName: 'cents',
    },
    'hussam-porter-smith-2008-rekindle': {
        title: 'Hussam, Porter and Smith (2008): rekindle',
        reference: 'Hussam, R. N., Porter, D. and Smith, V. L. (2008). Thar she blows: can bubbles be rekindled with experienced subjects? American Economic Review 98(3), 924–937.',
        notes: 'The rekindle environment, played by twice-experienced traders in new groups (11 traders: 33 subjects in three sessions; 15 in the new replications): as the baseline, with more cash, fewer shares and riskier dividends: $18.90 and 1 share, $15.30 and 2, $11.70 and 3, and dividends of 0, 1, 8, 28 or 98 cents (27 on average), so that the value falls from 405. One buy and one sell order each per period, and 60 seconds to submit them, are assumed here.',
        traders: 11, periods: 15, mechanism: 'call', callMaxOrders: 1, marketOrders: false, callTime: 60,
        assets: [{ name: 'Shares', dividends: [0, 1, 8, 28, 98] }],
        endowments: [{ cash: 1890, assets: 1 }, { cash: 1530, assets: 2 }, { cash: 1170, assets: 3 }], fillerType: 2,
        exchangeRate: 0.01, showFundamentalValue: true, cashName: 'cents',
    },
    'shestakova-powell-gladyrev-2019': {
        title: 'Shestakova, Powell and Gladyrev (2019): experience and success',
        reference: 'Shestakova, N., Powell, O. and Gladyrev, D. (2019). Bubbles, experience and success. Journal of Behavioral and Experimental Finance 22, 206–213 (working paper: Gladyrev, Powell and Shestakova, 2015).',
        notes: 'Dufwenberg, Lindqvist and Moore\'s market with equal endowments: 6 traders, each with 3 units and 400 cents; 10 periods of 2 minutes, with a dividend of 0 or 20 cents (equally likely) after each; a continuous double auction whose book is emptied after each period; no borrowing or short selling. Six traders play three such markets to gain experience (here); then they are ranked by their luck-adjusted earnings, and each pair (top, middle, bottom) trades a fourth market with four new traders, in sessions of their own. The CRT comes afterwards (unpaid); their control questions and the training against a computer trader are not included. Every market is paid. A unit at a time is assumed here.',
        traders: 6, rounds: 3, periods: 10, tradingTime: 120, multiUnit: false,
        assets: [{ name: 'Asset', dividends: [0, 20] }],
        endowments: [{ cash: 400, assets: 3 }], crt: 'after',
        exchangeRate: 0.01, showFundamentalValue: true, cashName: 'cents',
    },
    'breaban-noussair-2015-bull': breabanNoussair('BullMarket', 'BullMarket: a tax of 10 ECU a unit after periods 8 to 15, and 200 a unit after the last period, so that the value is 120 in periods 1 to 7 and then rises by 10 a period to 200.', [0, 0, 0, 0, 0, 0, 0, 10, 10, 10, 10, 10, 10, 10, 10], 200),
    'breaban-noussair-2015-bear': breabanNoussair('BearMarket', 'BearMarket: a subsidy of 10 ECU a unit after periods 8 to 15, and 40 a unit after the last period, so that the value is 120 in periods 1 to 7 and then falls by 10 a period to 40.', [0, 0, 0, 0, 0, 0, 0, -10, -10, -10, -10, -10, -10, -10, -10], 40),
    'cueva-rustichini-2015': {
        title: 'Cueva and Rustichini (2015): constant value, loan and forecasts',
        reference: 'Cueva, C. and Rustichini, A. (2015). Is financial instability male-driven? Gender and cognitive skills in experimental asset markets. Journal of Economic Behavior & Organization 119, 330–344. The same market: Cueva, C., Roberts, R. E., Spencer, T., Rani, N., Tempest, M., Tobler, P. N., Herbert, J. and Rustichini, A. (2015). Cortisol and testosterone increase financial risk taking and may destabilize markets. Scientific Reports 5, 11206.',
        notes: 'Noussair, Robin and Ruffieux\'s loan design: 10 traders (female-only, male-only or mixed groups in the paper), each with 10 units and 10,000 francs, a loan paid back at the end; a practice period, then 15 periods of 2 minutes; after each, a dividend of −24, −16, 4 or 36 francs, kept apart until the end, and 360 a unit after the last period, so that the value is 360 throughout. Before each period, a forecast of its average price, paid 10 pence (36 francs) when accurate: within 10% is assumed here. 360 francs to the pound; payments are kept between 10 and 30 pounds. Their lottery task (15 choices) before the market, and the cognitive tasks after it, are not included. Cueva et al. (Scientific Reports, 2015) report hormone measures from sessions of this market.',
        traders: 10, practicePeriods: 1, periods: 15, tradingTime: 120,
        assets: [{ name: 'Asset', dividends: [-24, -16, 4, 36], buyback: 360 }],
        endowments: [{ cash: 10000, assets: 10 }], loan: true, dividendAccount: 'separate',
        forecasts: { horizon: 1, rewards: [[0.10, 36]], target: 'mean' },
        minPayoff: 3600, maxPayoff: 10800, exchangeRate: 1 / 360, showFundamentalValue: true, cashName: 'francs',
    },
    'cason-samek-2015-text': casonSamek('text display', 'Text: trade prices are listed as text.', { showChart: false }),
    'cason-samek-2015-visualized': casonSamek('visualized display', 'Visualized: trade prices are also charted against time (here, the period\'s; in the paper, the whole market\'s).', { showChart: true }),
    'huber-kirchler-stockl-2015-t1': huberKirchlerStockl('value on the history screen (T1)', 'T1: the value is explained in the instructions and shown on the history screen after each period, not while trading.', { showFundamentalValue: false }),
    'huber-kirchler-stockl-2015-t2fv': huberKirchlerStockl('value on the trading screen (T2 FV)', 'T2 FV: the value of the period is also shown on the trading screen.', { showFundamentalValue: true }),
};

/** The settings of a preset, over the defaults, and then overrides (an object, or JSON). */
function settingsFor(presetId, overrides) {
    const preset = PRESETS[presetId];
    if (preset == null) throw new Error('No GIMS preset "' + presetId + '". Presets: ' + Object.keys(PRESETS).join(', '));
    if (typeof overrides === 'string') overrides = overrides.trim() === '' ? {} : JSON.parse(overrides);
    const settings = Object.assign({}, DEFAULTS, preset, overrides || {});
    settings.preset = presetId;
    return settings;
}

module.exports = { DEFAULTS, PRESETS, settingsFor };
