# Published oTree experiments

oTree experiments their authors published under licences that let them be passed on, used by
`test/otree-published.test.js`: jtree runs each session config to its end. Each experiment here is
its authors' work, under its own licence (below), not jtree's.

## holzmeister/: ready-made apps (MIT, with a citation requirement)

From Felix Holzmeister's publications (https://www.felixholzmeister.com/views/research/publications.html).
Each app's `LICENSE.txt` gives its licence. **If you publish results of experiments run with one of
these apps, the licence asks you to name its authors and cite its article:**

| App | Article |
| --- | --- |
| `bret` (the "bomb" risk elicitation task) | Holzmeister, F. and Pfurtscheller, A. (2016). oTree: The "Bomb" Risk Elicitation Task. *Journal of Behavioral and Experimental Finance* 10, 105–108. |
| `cem`, `icl`, `mpl`, `scl` (certainty equivalents, implied choice list, multiple price list, single choice list) | Holzmeister, F. (2017). oTree: Ready-Made Apps for Risk Preference Elicitation Methods. *Journal of Behavioral and Experimental Finance* 16, 33–38. |
| `eet` (the equality equivalence test) | Holzmeister, F. and Kerschbamer, R. (2019). oTree: The Equality Equivalence Test. *Journal of Behavioral and Experimental Finance* 22, 214–222. |

## manydesigns/: #ManyDesigns (CC BY 4.0)

The experimental software of #ManyDesigns: Competition and Moral Behavior, by Anna Dreber Almenberg,
Felix Holzmeister, Christoph Huber, Jürgen Huber, Magnus Johannesson, Michael Kirchler and Utz
Weitzel, and the research teams named by the folders. Each team designed its own experiment.
Published on the OSF under the Creative Commons Attribution 4.0 International licence
(https://creativecommons.org/licenses/by/4.0/):

- `randomization/`: from "Randomization Software", https://osf.io/t8cyj/
- the teams' folders: from "Experimental Software and Instructions", https://osf.io/wz9uq/
- the project: https://osf.io/r6anc/

Article: Huber, C., Dreber, A., Huber, J., Johannesson, M., Kirchler, M., Weitzel, U., et al. (2023).
Competition and moral behavior: A meta-analysis of forty-five crowd-sourced experimental designs.
*Proceedings of the National Academy of Sciences* 120(23), e2215572120.

## delegation/: Delegation Decisions in Finance (CC BY 4.0)

The experimental software of Delegation Decisions in Finance, by Felix Holzmeister, Martin Holmén,
Michael Kirchler, Matthias Stefan and Erik Wengström, https://osf.io/tfeh5/ (project
https://osf.io/uma9z/). Published on the OSF under the Creative Commons Attribution 4.0
International licence (https://creativecommons.org/licenses/by/4.0/).

## What was changed

The experiments' code and templates are as published, except:

- Only each project's folder is here. Left out: virtual environments, caches, databases
  (`db.sqlite3`), IDE settings, zipped exports (`.otreezip`), and the media that their Python code
  does not use (images, fonts, sounds, JavaScript and CSS libraries). Their pages show without
  them; the tests do not need them. LGT85's captcha images are left out too: its code finds the
  answers in their file names (`captcha/filenames.py`).
- In each `settings.py`, `SECRET_KEY` and a written-out `ADMIN_PASSWORD` are `'redacted'`.
- Folders are renamed: the teams' by their team codes, `BDQ29-Baseline` and `BDQ29-Treatment`
  for BDQ29's two projects, `randomization` for `_randomization`, and `delegation` for
  `2019_hea-01`.
- Each Holzmeister app has its licence as `LICENSE.txt` (published as `License.pdf`).

## Not here

Published but not licensed for passing on (no licence given): Cognitive Skills and Economic
Preferences in the Fund Industry, by Adam Farago, Martin Holmén, Felix Holzmeister, Michael
Kirchler and Michael Razen (https://osf.io/4hgct/). Not oTree: the #ManyDesigns teams MUE79 and
TVX41 (PHP and SQL), and the teams that used Qualtrics or other software.
