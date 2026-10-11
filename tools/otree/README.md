# oTree, to check jtree against

jtree runs oTree apps with its own `otree.api` (`server/source/dialects/otree/python`). To see
what oTree itself does with an app (its pages, its data, its errors), install oTree here:

    tools/otree/setup.sh 5.11.5     # oTree 5: apps in __init__.py
    tools/otree/setup.sh 3.4.0      # oTree 3 (Django 2.2): apps with models.py and pages.py

Each version goes in `tools/otree/<version>/venv` (ignored by git), with its own Python: oTree 3
needs Python 3.7 or 3.8, which the script fetches with uv when there is none (into
`tools/otree/python` and `tools/otree/uv`, ignored too). Then, in an oTree project's folder:

    /path/to/jtree/tools/otree/5.11.5/venv/bin/otree test my_config 3     # its bots
    /path/to/jtree/tools/otree/5.11.5/venv/bin/otree devserver            # in a browser

oTree 2.5 asks for Python 3.7, which uv does not have for macOS: the script installs it on 3.8,
from its source, with that check and the pins of its compiled dependencies taken out.

## Comparing jtree's data with oTree's

    node tools/otree/compare.js PROJECT CONFIG [N] [--otree=5.11.5] [--seed=S] [--runs=3] [--save=DIR]

plays a session config with the project's bots in oTree (`otree test --export`, in a copy of the
project) and in jtree (by oTree's rules), once per bots' case, and compares their "all apps,
wide" CSVs column by column. Without `--seed`, only the columns all of oTree's runs agreed on
(what depends on chance is left out, but a rare draw may agree by chance: more `--runs` help).
With `--seed`, Python's random is seeded alike in both (oTree 5 draws its codes and random
groups from a generator of its own, as jtree does), so random draws are compared too; two runs
tell the columns that depend on the moment. oTree 2 and 3 draw codes from Python's random, so
seeding does not line them up. `--save` writes oTree's values for `server/test/otree-reference.test.js`.
