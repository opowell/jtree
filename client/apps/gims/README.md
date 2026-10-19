# GIMS asset markets

GIMS, the Graz-Innsbruck Market System (Palan 2015), is a z-Tree program for asset market
experiments. This folder has it for jtree: the markets of published studies, and what comes
around them, as apps of their own, each with the presets of the studies it is part of. The
documentation is the page "GIMS asset markets":
[opowell.github.io/jtree/reference/tutorial-4d-gims.html](https://opowell.github.io/jtree/reference/tutorial-4d-gims.html).

    app.jtt              GIMS: for a study (its preset), the apps below as its stages
    market/              the market: periods, accounts, trading and results; market.js is its engine
    control-questions/   questions on the instructions, before the market
    crt/                 the cognitive reflection test, before or after it
    holt-laury/          Holt and Laury's lottery choices, before or after it
    chat/                a chat, before trading
    bonds/               one-period bonds, before trading, back after it
    forecasts/           price forecasts, before trading, paid after it
    lottery-ticket/      a lottery ticket, after trading
    account-status/      the account status, after a period's results
    rating/              a rating, after a period's results
    payment/             the payment

Start a session with `app.jtt` and choose a **preset**; the **changes** option changes any
setting of any of the apps, as JSON (`{"traders": 8, "tradingTime": 120}`). Each app also runs on
its own, with its own presets (and an `example`). Each app's `presets.js` has its settings, with
their defaults, and its presets, under the names of the studies' markets in `market/presets.js`.
A new preset is an entry there, and in the presets of the other apps its study has.

`server/test/gims.test.js` tests the engine and plays studies with bots;
`server/test/gims-apps.test.js` plays each app on its own.

The apps are written anew for jtree, after GIMS v8.4.2's settings and rules and its manual
(v7.7.1); no GIMS code is copied. Publications of results from them should cite GIMS, as GIMS's
licence asks: Palan, S. (2015). GIMS — Software for asset market experiments. *Journal of
Behavioral and Experimental Finance* 5, 1–14. Each preset cites the paper whose design it follows.
