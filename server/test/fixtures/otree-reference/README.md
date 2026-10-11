# oTree's own data for its sample games

What oTree 5.11.5 itself recorded for each sample game in `../otree-samples`, played by its bots:
for each of the bots' cases, each participant's values in the "all apps, wide" CSV's columns that
every one of three runs of oTree agreed on (so none that depend on chance, or on the moment).
`test/otree-reference.test.js` expects jtree, by oTree's rules, to record the same.

Made with `tools/otree/compare.js` (oTree from `tools/otree/setup.sh 5.11.5`), in a copy of the
sample project whose `settings.py` has a session config for each game, named after it:

    node tools/otree/compare.js <that copy> <game> <participants> --seed=5 --save=server/test/fixtures/otree-reference

`ManyDesigns.json` is #ManyDesigns' randomization project (`../otree-published/manydesigns/randomization`,
100 participants, scipy), from its download from the OSF (whose static files oTree needs):

    node tools/otree/compare.js <its download> ManyDesigns 100 --seed=11 --save=server/test/fixtures/otree-reference
