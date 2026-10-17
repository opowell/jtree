# Samples library

23 economics experiments, each written three times: for jtree, for oTree and for z-Tree. The three
versions of an experiment have the same design (players, periods, roles, screens and payoffs), so
they can be compared side by side, and a study can start from whichever engine it runs on. jtree
runs all three versions.

    jtree/<game>.jtt        jtree apps
    otree/                  an oTree project: an app per game, and a session config for each
    ztree/<game>.ztt        z-Tree treatments (z-Tree 5.1's format)

Each treatment is also in z-Tree's text format, in `doc-pages/static/samples/ztree/<game>.txt`:
what was imported into z-Tree (File → Import) to make the `.ztt`. The library is shown in jtree's documentation:
[Samples library](https://opowell.github.io/jtree/reference/tutorial-4c-samples.html).

## The games

| Game | Players | Periods | From |
| --- | --- | --- | --- |
| `dictator` | pairs | 1 | jtree's dictator game; oTree's `dictator` |
| `ultimatum` | pairs | 1 | z-Tree's `ug`; jtree's ultimatum game |
| `trust` | pairs | 1 | oTree's `trust` and `trust_simple`; jtree's trust game |
| `bargaining` | pairs | 1 | oTree's `bargaining` |
| `public-goods` | groups of 4 | 10 | jtree's public goods game; oTree's `public_goods_simple`; z-Tree's `pg` |
| `public-goods-punishment` | groups of 4 | 10 | jtree's public goods game with punishment |
| `prisoners-dilemma` | pairs | 1 | oTree's `prisoner`; z-Tree's `pd` |
| `volunteers-dilemma` | groups of 3 | 1 | oTree's `volunteer_dilemma` |
| `travelers-dilemma` | pairs | 1 | oTree's `traveler_dilemma`; jtree's traveller's dilemma |
| `stag-hunt` | pairs | 1 | jtree's stag hunt |
| `battle-of-the-sexes` | pairs | 1 | z-Tree's `game222` |
| `matching-pennies` | pairs | 4 | oTree's `matching_pennies` |
| `beauty-contest` | groups of 3 | 3 | jtree's beauty contest; oTree's `guess_two_thirds` |
| `market-entry` | groups of 4 | 5 | jtree's market entry game |
| `centipede` | pairs | 1 | jtree's centipede game |
| `cournot` | pairs | 1 | oTree's `cournot` |
| `bertrand` | pairs | 1 | oTree's `bertrand` |
| `common-value-auction` | groups of 3 | 1 | oTree's `common_value_auction` |
| `dutch-auction` | groups of 3 | 3 | z-Tree's `dutchauction` |
| `double-auction` | 4 buyers, 4 sellers | 2 | z-Tree's `noda` |
| `asset-market` | 4 traders | 10 | jtree's double auction; z-Tree's `asset_da` |
| `real-effort` | 1 | 1 | jtree's real-effort task |
| `survey` | 1 | 1 | oTree's `survey` |

oTree's apps are named with underscores (`public_goods`), its session configs likewise. The z-Tree
treatments are for as many subjects as the table says (one group); the jtree and oTree versions
take any number of participants and make groups of the size given, in order.

Each game's design is described in its files (the jtree app's `app.description`, the oTree app's
`doc`) and in the documentation.

## Running them

- **jtree**: the library is in jtree's apps folder: open a game in the admin's Browse panel (under
  `samples`), any of its three versions, and start a session.
- **oTree** (5.11 or later): `cd client/apps/samples/otree`, then `otree devserver`, or
  `otree test <game>` to play a game with its bots.
- **z-Tree** (5.1): open a `.ztt` file in z-Tree, and start that many z-Leafs.

## How they are checked

`server/test/samples.test.js` plays each game in its three versions in jtree, with the same moves
(a dictator keeps 70, ...), each to its end, and expects the same payoffs from all three. The oTree
versions are played by their own bots (`tests.py`), which make those moves; they were also played
by `otree test` in oTree 5.11.5 itself (`tools/otree/setup.sh`). The z-Tree versions were imported
into z-Tree 5.1.21 (`tools/ztree-wine`), which reported no errors, and saved by it as the `.ztt`
files here; jtree's generic z-Tree bot plays each to its end too.

## Licences and citations

The jtree and z-Tree versions are jtree's own. The z-Tree versions follow the designs of z-Tree's
examples named above (https://www.ztree.uzh.ch/en/examples.html), but are written anew: z-Tree's
own examples are not passed on here.

oTree's versions of the games that come from oTree's sample games (above) are adapted from them,
under oTree's licence:

    Copyright (c) 2014 Daniel Li Chen, Martin Walter Schonger, Christopher Wickens.

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software
    and associated documentation files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or
    substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
    BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
    DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

    The Licensee undertakes to mention the name oTree, the names of the licensors (Daniel L. Chen,
    Martin Schonger and Christopher Wickens) and to cite the following article in all publications
    in which results of experiments conducted with the Software are published: Chen, Daniel L.,
    Martin Schonger, and Chris Wickens. 2016. "oTree - An open-source platform for laboratory,
    online, and field experiments." Journal of Behavioral and Experimental Finance, vol 9: 88-97.

Results of experiments run with z-Tree should cite Fischbacher, U. (2007), "z-Tree: Zurich toolbox
for ready-made economic experiments", *Experimental Economics* 10(2), 171–178.
