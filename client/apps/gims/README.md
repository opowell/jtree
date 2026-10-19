# GIMS asset markets

GIMS, the Graz-Innsbruck Market System (Palan 2015), is a z-Tree program for asset market
experiments. This is a jtree app with its market and settings, and presets for published
experiments. The documentation is the page "GIMS asset markets":
[opowell.github.io/jtree/reference/tutorial-4d-gims.html](https://opowell.github.io/jtree/reference/tutorial-4d-gims.html).

    app.jtt      the app: its settings, stages, screens and messages
    market.js    the market engine: the double auction and the call auction (plain functions)
    presets.js   every setting with its default, and the presets

Start a session with `app.jtt` and choose a **preset**; the **changes** option changes any of its
settings, as JSON (`{"traders": 8, "tradingTime": 120}`). A new preset is an entry in `presets.js`,
with its source and anything it assumes.

The control questions, the cognitive reflection test and Holt and Laury's lottery choices are apps
of their own, next to this one (`../control-questions`, `../crt`, `../holt-laury`); the app adds
them as stages before or after the market, as a preset's `controlQuestions`, `crt` and `holtLaury`
say. Their points are the market's.

`server/test/gims.test.js` tests the engine and plays sessions of several presets with bots.

The app is written anew for jtree, after GIMS v8.4.2's settings and rules and its manual (v7.7.1);
no GIMS code is copied. Publications of results from it should cite GIMS, as GIMS's licence asks:
Palan, S. (2015). GIMS — Software for asset market experiments. *Journal of Behavioral and
Experimental Finance* 5, 1–14. Each preset cites the paper whose design it follows.
