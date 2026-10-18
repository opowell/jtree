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
    bonus: 0,                    // points added to each round's earnings
    loan: false,                 // whether the initial cash is a loan, paid back from a round's earnings
    cashName: 'points',          // what cash is called on the screens

    // The market
    mechanism: 'cda',            // 'cda' (continuous double auction), 'call' (call auction) or 'call+cda' [CallAuction, ContinuousDoubleAuction]
    tradingTime: 180,            // seconds of continuous double auction [TimeContinuousDoubleAuction]
    callTime: 0,                 // seconds to submit call auction orders; 0 for no limit [TimeCallAuction]
    resultsTime: 30,             // seconds the results of a period are shown; 0 until all have read them [TimeContinuousDoubleAuctionResults]
    assets: [                    // the assets traded, each in its own market [NumMarkets]
        {
            name: 'Asset',
            description: '',     // shown under the name, e.g. what the asset is
            dividends: [0, 8, 28, 60],   // equally likely values, or { values, probabilities } [dividends]
            dividendSequence: null,      // dividends drawn in advance, by period, in place of draws [PresetDividends]
            buyback: 0,                  // what a unit is worth after a round's last period [BBV]
            signals: null,               // signals, by period: [[set 1's values, set 2's, ...], ...]; trader k sees set k (in turn) [signals]
            // Any market rule below can also be set for an asset alone.
        },
    ],
    endowments: [                // endowment types, assigned in equal numbers [endowments]
        { cash: 225, assets: 3 },        // assets: units of each asset (a number for all, or an array)
        { cash: 585, assets: 2 },        // role: 'trader' (default), 'buyer' (buys only) or 'seller' (sells only)
        { cash: 945, assets: 1 },
    ],
    fillerType: 2,               // the type (from 1) of traders left over when the types do not divide them [EndowmentFillerType]
    assignment: 'random',        // types assigned to traders at 'random' (GIMS) or in 'order' of their place in the market
    dividendAccount: 'cash',     // dividends paid into 'cash', or a 'separate' account not used for trading
    interest: 0,                 // interest per period on cash held after trading (negative: a charge)
    cashInflow: 0,               // cash given to each trader after each period: a number, or an array by period

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
    holdingCap: null,            // the most units a trader may hold
    holdingCapUntil: null,       // the last period of a round the cap holds in; null for all
    purchaseLimit: null,         // the most units a trader may buy in a period
    callMaxOrders: 0,            // [NumTypedOffersCallAuction]
    marketOrders: true,          // [AllowMarketOrders]
    marketOrderPriority: true,   // [MarketOrderPriority]
    rationing: 'time',           // 'time' (GIMS) or 'random'

    // The trading screen
    orderBookDepth: -1,          // orders shown on each side, besides one's own; -1 for all [OrderBookDepth]
    priceListDepth: 0,           // prices in the list of trades; 0 for all [PriceListDepth]
    showPriceList: true,         // [ShowPricelist]
    showChart: true,             // [ShowChart]
    showFundamentalValue: false, // a table of the asset's value by period, and its value now
    earlyEndingVote: false,      // traders can vote to end a period early; it ends when all have [EarlyEndingVote]
    indicativePriceInterval: 0,  // seconds between indicative prices in the call auction; 0 for none [IndicativePriceInterval]

    // Price forecasts: null, or { horizon: periods ahead (1 for this period's, or 'all' for every
    // period left), rewards: [[relative error at most, points], ...], target: 'mean' (trade
    // price), 'median', 'last' or 'call' (the call auction price) }. They are paid into the
    // separate account.
    forecasts: null,

    // Before and after the market [ControlQuestions, CRTBefore, CRTAfter, HLBefore, HLAfter]
    controlQuestions: [],        // [{ question, options: [...], answer: index of the right option }]
    crt: null,                   // the cognitive reflection test (Frederick 2005): 'before', 'after' or null
    crtPay: 0,                   // points per right answer
    holtLaury: null,             // the Holt and Laury (2002) lottery choices: 'before', 'after' or null
    holtLauryPayoffs: { aHigh: 2, aLow: 1.6, bHigh: 3.85, bLow: 0.1 },   // in points [PayoffAHigh, ...]
};

// The dividends of Smith, Suchanek and Williams (1988), used by many of the studies below.
const SSW_DIVIDENDS = [0, 8, 28, 60];
// The forecast rewards of Haruvy, Lahav and Noussair (2007), as later studies describe them.
const HLN_REWARDS = [[0.10, 50], [0.25, 20], [0.50, 10]];

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
