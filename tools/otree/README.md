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
