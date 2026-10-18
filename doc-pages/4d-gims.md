GIMS, the Graz-Innsbruck Market System (Palan, 2015), is a z-Tree program for asset market experiments: one generic market whose settings make it the market of many studies. jtree has a version of it, `client/apps/gims`, with GIMS's market rules and settings, and **presets**: configurations of published experiments, each with its source.

<img src="images/gims.png" alt="A trader's screen in the GIMS app: their account and the value of a unit, the order book with buy and sell orders, and a chart and list of trade prices" style="max-width: 100%; border: 1px solid #ddd">

In each period traders buy and sell one or more assets for cash, in a continuous double auction, a call auction, or both, one after the other. After each period every unit pays a dividend, drawn for the market from a known distribution. A round (a market) lasts a number of periods; after its last, a unit is worth its buyback value. Around this, as settings:

- endowment types, assigned in equal numbers, and trader roles (buyers who can only buy, sellers who can only sell);
- dividends into cash or into an account apart from it; interest (or charges) on cash; cash given to traders after each period;
- short selling of assets and cash, holding caps (for some periods or all), purchase limits per period, fees for making and taking orders;
- GIMS's order book rules: single or multi-unit orders, the improvement rule, no crossing of the book, a limit on open orders, invalidation of orders no longer feasible (in full or in part), emptying the book after a trade, how many orders and prices are shown;
- the call auction's rules: orders per trader, market orders and their priority, indicative prices, rationing by time or at random;
- price forecasts, paid by accuracy; a vote to end a period early; practice periods with things to try; repeated markets, all paid or one at random; a minimum payment;
- control questions, the cognitive reflection test and Holt and Laury's lottery choices, before or after the market.

#### Running it

In the admin, start a session with `gims/app.jtt` (Browse panel), and choose its options:

- **preset**: the experiment, from the list below (`ssw` by default);
- **changes**: settings to change, as JSON, over the preset's: `{"traders": 8, "tradingTime": 120}`. This is GIMS's Settings stage.

Each preset has its number of traders: participants are put in markets of that many, in order (a session of 18 with `ssw` has two markets of 9). With `"traders": 0` all participants trade in one market. Money is in points; the preset's exchange rate turns them into money, or the session's if the preset has none (several papers do not report theirs).

`client/apps/gims/presets.js` lists every setting, with its default and GIMS's name for it; a new preset is an entry there. The market engine is `market.js`, plain functions without jtree, and the app is `app.jtt`.

#### The presets

From the list of asset market experiments at [sites.google.com/site/opowell/assetmarketexperiments](https://sites.google.com/site/opowell/assetmarketexperiments): those whose design GIMS's market can run, and whose parameters could be read in the paper, a working paper, or a replication (cited in each). What is assumed, or left out, is said.

**Smith, Suchanek and Williams (1988)** (`ssw`). The standard design: 9 traders of three endowment types (225, 585 or 945 cents and 3, 2 or 1 units; each worth 1305 at the start), 15 periods, a dividend of 0, 8, 28 or 60 cents each period and no value after the last, so that the fundamental value falls from 360 to 24. A unit at a time, and a period ends early if all vote to end it. The endowments and dividends are those GIMS takes as its defaults; the period length here (240 seconds) is that of later studies of this design (e.g. Eckel and Füllbrunn 2015). *9 traders, 15 periods, double auction.*  
Source: Smith, V. L., Suchanek, G. L. and Williams, A. W. (1988). Bubbles, crashes, and endogenous expectations in experimental spot asset markets. Econometrica 56(5), 1119–1151.

**GIMS's defaults** (`gims`). GIMS v8.4.2 as it comes: four assets traded at once, each with the dividends of Smith, Suchanek and Williams; three endowment types (225, 585 or 945 cash per asset, and 3, 2 or 1 units of each); multi-unit orders in steps of 0.01; 180 seconds of trading; the 3 best orders on each side and the last 4 prices shown. GIMS's treatment file has 1 period. *all participants in one market, 1 period, double auction.*  
Source: Palan, S. (2015). GIMS — Software for asset market experiments. Journal of Behavioral and Experimental Finance 5, 1–14.

**Noussair, Robin and Ruffieux (2001): constant fundamental value** (`noussair-robin-ruffieux-2001`). The Purdue sessions: 10 traders (8 to 10), each with 10 units and 10,000; a practice period, then 15 periods of 3 to 5 minutes (240 seconds here). After each period a unit pays 36 or 4, or costs 24 or 16, equally likely, into an account apart from cash; after the last, a unit is worth 360, so the value is 360 throughout. Earnings: cash, 360 a unit, the dividend account, and 5400; 800 to the dollar. Trading was MUDA's, a unit at a time. *10 traders, 15 periods, double auction, 1 practice period.*  
Source: Noussair, C., Robin, S. and Ruffieux, B. (2001). Price bubbles in laboratory asset markets with constant fundamental values. Experimental Economics 4, 87–105.

**Lei, Noussair and Plott (2001): no speculation** (`lei-noussair-plott-2001-nospec`). The NoSpec sessions (as Tucker and Xu 2024 list them): 8 traders, half buyers with 7,200 francs and no units, who can only buy, and half sellers with 20 units and no cash, who can only sell; a practice period, then 12 periods of 4 minutes; dividends of 20 or 40, equally likely; 300 francs to the dollar. Dividends go to an account apart from cash, as in Tucker and Xu's replication; the paper's own bookkeeping of them is not reproduced from it. *8 traders, 12 periods, double auction, 1 practice period.*  
Source: Lei, V., Noussair, C. N. and Plott, C. R. (2001). Nonspeculative bubbles in experimental asset markets: lack of common knowledge of rationality vs. actual irrationality. Econometrica 69(4), 831–859.

**Dufwenberg, Lindqvist and Moore (2005)** (`dufwenberg-lindqvist-moore-2005`). Working paper 588 (IUI, 2003): 6 traders, half with 6 units and 200 cents, half with 2 units and 600 cents; a two-minute practice period, then four rounds (markets) of 10 two-minute periods, each paying a dividend of 0 or 20 cents, equally likely. Every round is paid. (In the paper, two or four traders of the fourth round are newcomers; here the same traders play all four.) *6 traders, 4 markets of 10 periods, double auction, 1 practice period.*  
Source: Dufwenberg, M., Lindqvist, T. and Moore, E. (2005). Bubbles and experience: an experiment. American Economic Review 95(5), 1731–1737.

**Haruvy, Lahav and Noussair (2007): call market and forecasts** (`haruvy-lahav-noussair-2007`). As Carlé, Lahav, Neugebauer and Noussair (2019) describe it: 9 traders, with 1, 2 or 3 units (three of each) and the rest of 652 francs in cash; four rounds of 15 periods, each a call market where each trader submits one bid and one ask (price and quantity), bids below asks; dividends of 0, 4, 14 or 30, equally likely (a value of 180 at the start). Before each period, traders forecast the price of every period left, paid for each forecast within 10, 25 or 50% of the price (50, 20 or 10, as Baghestanian et al. give HLN's rewards). The exchange rate is not given here. *9 traders, 4 markets of 15 periods, call market.*  
Source: Haruvy, E., Lahav, Y. and Noussair, C. N. (2007). Traders' expectations in asset markets: experimental evidence. American Economic Review 97(5), 1901–1920.

**Kirchler, Huber and Stöckl (2012): declining value** (`kirchler-huber-stockl-2012-declining`). The SSW markets of their working paper (Innsbruck 2009-26), the declining value of the study: 10 traders, half with 60 units and 1000 Taler, half with 20 units and 3000; two practice periods, then 10 periods of 120 seconds; a dividend of 0 or 10, equally likely, into cash, so that the value falls from 50 by 5 a period; orders of any size; 400 Taler to the euro. (The paper draws one dividend sequence in advance for all sessions; here they are drawn.) *10 traders, 10 periods, double auction, 2 practice periods.*  
Source: Kirchler, M., Huber, J. and Stöckl, T. (2012). Thar she bursts: reducing confusion reduces bubbles. American Economic Review 102(2), 865–883.

**Kirchler, Huber and Stöckl (2012): declining value, gold mine** (`kirchler-huber-stockl-2012-goldmine`). The declining-value market, with the asset called stocks of a depletable gold mine, the framing that reduced confusion and mispricing in the paper. *10 traders, 10 periods, double auction, 2 practice periods.*  
Source: Kirchler, M., Huber, J. and Stöckl, T. (2012). Thar she bursts: reducing confusion reduces bubbles. American Economic Review 102(2), 865–883.

**Kirchler, Huber and Stöckl (2012): constant value and cash (T4)** (`kirchler-huber-stockl-2012-t4`). Treatment T4, as Noussair and Tucker (2014) replicate it with KHS's program: 10 traders, half with 20 units and 3,000 Taler, half with 60 and 1,000; two practice periods, then 10 periods of 120 seconds; a dividend of −5 or +5, equally likely, into an account apart from cash, and 50 a unit after the last period, so the value is 50 throughout and the cash-to-asset ratio stays 1. No shorting or borrowing; 400 Taler to the euro. *10 traders, 10 periods, double auction, 2 practice periods.*  
Source: Kirchler, M., Huber, J. and Stöckl, T. (2012). Thar she bursts: reducing confusion reduces bubbles. American Economic Review 102(2), 865–883.

**Kirchler, Huber and Stöckl (2012): constant value, rising cash (T2)** (`kirchler-huber-stockl-2012-t2`). Treatment T2: as T4, with cash given to each trader after each period (444, 556, 714, 953, 1333, 2000, 3333, 6667, 20000 and 0), so that the cash-to-asset ratio rises from 1 to 19 (Noussair and Tucker 2014, table 2). *10 traders, 10 periods, double auction, 2 practice periods.*  
Source: Kirchler, M., Huber, J. and Stöckl, T. (2012). Thar she bursts: reducing confusion reduces bubbles. American Economic Review 102(2), 865–883.

**Noussair and Tucker (2014): constant value, 20 times the cash** (`noussair-tucker-2014-20x`). Treatment T4_20x: KHS's T4 with 20 times the cash, a cash-to-asset ratio of 20 throughout: half the traders with 20 units and 41,000 Taler, half with 60 units and 39,000. Paid in New Zealand dollars; the rate is not given here. *10 traders, 10 periods, double auction, 2 practice periods.*  
Source: Noussair, C. N. and Tucker, S. (2014). Cash inflows and bubbles in asset markets with constant fundamental values. University of Waikato working paper 03/14 (2014).

**Lugovskyy, Puzzello, Tucker and Williams (2014): no cap** (`lugovskyy-puzzello-tucker-williams-2014`). The Unconstrained treatment: 9 traders (7 to 12), each with 10 units and 10,000 francs; 15 periods (120 or 180 seconds; 180 here) with the dividends of Smith, Suchanek and Williams; a cognitive reflection test first, $2 a right answer; before each period, a forecast of the period's mean price, paid into an account apart from cash (at HLN's rewards, assumed here); 600 francs to the dollar (the US sessions). *9 traders, 15 periods, double auction.*  
Source: Lugovskyy, V., Puzzello, D., Tucker, S. and Williams, A. (2014). Asset-holdings caps and bubbles in experimental asset markets. Journal of Economic Behavior & Organization (Waikato working paper 13/12, 2012).

**Lugovskyy, Puzzello, Tucker and Williams (2014): permanent cap** (`lugovskyy-puzzello-tucker-williams-2014-cap`). The Permanent Cap treatment: no trader may hold more than 18 units (1.8 times the endowment), in every period. Otherwise as the Unconstrained treatment. *9 traders, 15 periods, double auction.*  
Source: Lugovskyy, V., Puzzello, D., Tucker, S. and Williams, A. (2014). Asset-holdings caps and bubbles in experimental asset markets. Journal of Economic Behavior & Organization.

**Lugovskyy, Puzzello, Tucker and Williams (2014): short-term cap** (`lugovskyy-puzzello-tucker-williams-2014-short-cap`). The Short-Term Cap treatment: the cap of 18 units is lifted at the start of period 9. *9 traders, 15 periods, double auction.*  
Source: Lugovskyy, V., Puzzello, D., Tucker, S. and Williams, A. (2014). Asset-holdings caps and bubbles in experimental asset markets. Journal of Economic Behavior & Organization.

**Eckel and Füllbrunn (2015)** (`eckel-fullbrunn-2015`). From the instructions in the online appendix: 9 traders, 18 units in all; a practice period, then 15 periods of 240 seconds; dividends of 0, 8, 28 or 60 tokens into cash; a unit at a time; before each period, forecasts of the price of every period left, 5 tokens for each within 10% of the price, 2 within 25%, 1 within 50%; 100 tokens to the dollar. The endowments are those of Smith, Suchanek and Williams (3, 2 or 1 units), assumed here; the appendix does not give the cash. *9 traders, 15 periods, double auction, 1 practice period.*  
Source: Eckel, C. C. and Füllbrunn, S. C. (2015). Thar SHE blows? Gender, competition, and bubbles in experimental asset markets. American Economic Review 105(2), 906–920.

**Giusti, Jiang and Xu (2014): interest on cash, falling value** (`giusti-jiang-xu-2014-falling`). Treatment F (sessions F1, F2): 10 traders, each with 4 units and 2000; 15 periods of 150 seconds; dividends of Smith, Suchanek and Williams; 10% interest on cash each period, and 72 a unit after the last period, so the value falls from 200 to 87. A unit at a time; a practice period. The exchange rate is not given here. *10 traders, 15 periods, double auction, 1 practice period.*  
Source: Giusti, G., Jiang, J. H. and Xu, Y. (2014). Interest on cash, fundamental value process and bubble formation: an experimental study. Bank of Canada staff working paper 2014-18.

**Giusti, Jiang and Xu (2014): interest on cash, rising value** (`giusti-jiang-xu-2014-rising`). Treatment R (sessions R1 to R3): as F, with 720 a unit after the last period, so the value rises from 355 to 676. *10 traders, 15 periods, double auction, 1 practice period.*  
Source: Giusti, G., Jiang, J. H. and Xu, Y. (2014). Interest on cash, fundamental value process and bubble formation: an experimental study. Bank of Canada staff working paper 2014-18.

**Giusti, Jiang and Xu (2014): negative dividends and interest** (`giusti-jiang-xu-2014-negative`). Treatment N (sessions N1 to N3): a holding cost of 0, 8, 28 or 60 a unit each period, a charge of 10% on cash, 500 a unit after the last period, and 50,000 in cash each: the value falls from 1503 to 529. *10 traders, 15 periods, double auction, 1 practice period.*  
Source: Giusti, G., Jiang, J. H. and Xu, Y. (2014). Interest on cash, fundamental value process and bubble formation: an experimental study. Bank of Canada staff working paper 2014-18.

**Huber, Bindra and Kleinlercher (2019): constant value, rising cash** (`huber-bindra-kleinlercher-2019`). The BASE treatment, run with GIMS: 8 traders, each with 20 units and 560 Taler; two practice periods, then 20 periods of 120 seconds; dividends of 1.20 or 1.60, equally likely, 5% interest on cash after trading, 100 Taler to each trader after each period, and 28 a unit after the last period, so the value is 28 throughout. Before each period, forecasts of the mean price this period and the next two, 50 Taler for each within 5%. 400 Taler to the euro. The chart's scale (their treatment variable) is not reproduced. *8 traders, 20 periods, double auction, 2 practice periods.*  
Source: Huber, J., Bindra, P. C. and Kleinlercher, D. (2019). Design-features of bubble-prone experimental asset markets with a constant FV. Journal of the Economic Science Association.

**Baghestanian, Lugovskyy, Puzzello and Tucker: double auction** (`baghestanian-lugovskyy-puzzello-tucker-da`). The Double Auction treatment: 9 traders, each with 10 units and 10,000 francs; 15 periods of 3 minutes with the dividends of Smith, Suchanek and Williams; a unit at a time, at most 10 units bought a period; a cognitive reflection test first ($2 a right answer); before each period, a forecast of its mean price (50, 20 or 10 francs within 10, 25 or 50%), paid apart from cash. The exchange rate (not given) is that of related US sessions, 600 francs to the dollar. *9 traders, 15 periods, double auction.*  
Source: Baghestanian, S., Lugovskyy, V., Puzzello, D. and Tucker, S. Trading institutions in experimental asset markets: theory and evidence (working paper).

**Baghestanian, Lugovskyy, Puzzello and Tucker: call market** (`baghestanian-lugovskyy-puzzello-tucker-call`). The Call Market treatment: as the double auction, with a closed-book call market each period: one buy and one sell order each (a quantity and a price), buy prices below sell prices; ties for the last units broken at random. Forecasts are of the market price. (Their price is the lowest that clears the market; GIMS's rule, used here, picks among the clearing prices by its own steps.) *9 traders, 15 periods, call market.*  
Source: Baghestanian, S., Lugovskyy, V., Puzzello, D. and Tucker, S. Trading institutions in experimental asset markets: theory and evidence (working paper).

**Tucker and Xu (2024): one market** (`tucker-xu-2024-onemkt`). The OneMkt baseline of their replication of Lei, Noussair and Plott: 8 traders, each with 10 units and 10,000 francs; 15 periods of 3 minutes; the dividends of Smith, Suchanek and Williams, into an account apart from cash. Paid in New Zealand dollars; the rate is not given here. *8 traders, 15 periods, double auction.*  
Source: Tucker, S. and Xu, Y. (2024). Nonspeculative bubbles revisited. Journal of Behavioral and Experimental Finance (Waikato working paper 1/24).

**Tucker and Xu (2024): no speculation** (`tucker-xu-2024-nospec`). Their NoSpec treatment: half the traders are buyers with 10,000 francs and no units, who can only buy; half are sellers with 10 units and no cash, who can only sell. Otherwise as OneMkt. *8 traders, 15 periods, double auction.*  
Source: Tucker, S. and Xu, Y. (2024). Nonspeculative bubbles revisited. Journal of Behavioral and Experimental Finance (Waikato working paper 1/24).

#### GIMS's settings in jtree

| GIMS (globals) | jtree setting |
| --- | --- |
| `NumPeriods`, `PracticePeriod` | `periods`, `practicePeriods` (and `rounds` for repeated markets) |
| `ContinuousDoubleAuction`, `CallAuction` | `mechanism`: `'cda'`, `'call'` or `'call+cda'` |
| `TimeContinuousDoubleAuction`, `TimeCallAuction`, `TimeContinuousDoubleAuctionResults` | `tradingTime`, `callTime`, `resultsTime` |
| `NumMarkets`, `BBV[]`, `dividends` table, `PresetDividends` | `assets: [{ name, dividends, buyback, dividendSequence }]` |
| `endowments` table, `EndowmentFillerType` | `endowments: [{ cash, assets, role }]`, `fillerType` |
| `MultiUnitTrading`, `TickSize` | `multiUnit`, `tickSize` |
| `OfferImprovementRule`, `EmptyBookAfterTrade`, `PartialInvalidation`, `SpamControl` | `offerImprovement`, `emptyBookAfterTrade`, `partialInvalidation`, `maxOpenOrders` |
| `MakeFee`, `TakeFee` | `makeFee`, `takeFee` |
| `ShortingCapacityCash`, `ShortingCapacityAssets` | `shortCash`, `shortAssets` |
| `OrderBookDepth`, `PriceListDepth`, `ShowPricelist`, `ShowChart` | `orderBookDepth`, `priceListDepth`, `showPriceList`, `showChart` |
| `EarlyEndingVote`, `PracticeTasks` | `earlyEndingVote`, `practiceTasks` |
| `NumTypedOffersCallAuction`, `AllowMarketOrders`, `MarketOrderPriority`, `IndicativePriceInterval` | `callMaxOrders`, `marketOrders`, `marketOrderPriority`, `indicativePriceInterval` |
| `signals` table | `assets: [{ signals }]` |
| `IndependentPeriods`, `CarryOverWealth`, `RandomPeriodPayoff` | `rounds` (a round of 1 period is an independent period), `payment: 'random'` |
| `ExchangeRate`, `MinPayoffECU` | `exchangeRate`, `minPayoff` |
| `ControlQuestions`, `CRTBefore`/`CRTAfter`, `HLBefore`/`HLAfter` | `controlQuestions`, `crt`, `holtLaury` (and `crtPay`, `holtLauryPayoffs`) |

Beyond GIMS, for the presets: `rounds`, `dividendAccount`, `interest`, `cashInflow`, `holdingCap` and `holdingCapUntil`, `purchaseLimit`, trader `role`s, `forecasts`, `bonus`, `loan`, `rationing` and `showFundamentalValue`.

#### How it differs from GIMS

- **The same**: order validation (each order feasible on its own; trades cannot be with oneself), automatic invalidation after each trade, the improvement and no-crossing rules, accepting only the best order, fees, shorting, GIMS's five-step call auction price (volume, then the smallest surplus, then the side with the surplus, then the average rounded down) and its settlement by price, then market orders and orders at the price by time; dividends drawn once per period and market, also paid on short positions; earnings of cash plus the buyback value of units.
- **Different**: "Buy" and "Sell" take the best order of other traders (GIMS's best order may be one's own, which cannot be taken). A call auction's market order trades only what its trader's cash can pay for at the auction price (GIMS warns that market orders can bankrupt a trader). Fees apply to the double auction only. When the volume-maximizing prices with the smallest surplus all have a surplus on the same side, the highest (or lowest) is taken however many they are, as GIMS's manual describes the rule; GIMS's code does so only when they are two.
- **Not here**: GIMS's financial literacy questions and exit questionnaire, its German screens, its experimenter z-Leaf (jtree's admin shows each participant's screen and data) and its timelog (jtree records the order book and trades, as tables of each group, and every player's account, in the session's data).

#### Checks

`server/test/gims.test.js` tests the engine on its own (the order rules, invalidation, the five price rules, settlement, the value of a unit against Giusti, Jiang and Xu's table), loads every preset, and plays sessions of several with bots, checking each trader's earnings: SSW's market, KHS's constant-value market with its practice period, cash inflows and buyback, HLN's call market with forecasts, Tucker and Xu's buyers and sellers with a holding cap and the vote to end a period, a market with control questions, the CRT, lotteries, short selling, interest and a random market paid, and signals and indicative prices in a call auction.

#### Citing

Results of experiments run with it should cite GIMS: Palan, S. (2015), "GIMS — Software for asset market experiments", *Journal of Behavioral and Experimental Finance* 5, 1–14 (GIMS's licence asks for this), and the paper whose design a preset follows.
