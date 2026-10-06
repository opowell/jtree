# Pyodide spike: oTree app logic in jtree's server

Phase 0 of [the plan](../../ztree-otree-dialects.md) (§4.2): can jtree run an oTree app's
Python on its Node server, with no build step, by giving Python proxies onto jtree's own
objects? **Yes.** Every question below came out in favour; nothing found changes the plan.

Run on 2026-10-06 with Node 22.23.1 on macOS (Apple Silicon), Pyodide 314.0.7 (Python 3.14.2).

## How to run it

```sh
mkdir /tmp/pyodide-spike && cp * /tmp/pyodide-spike && cd /tmp/pyodide-spike
npm init -y && npm install pyodide@314.0.7
node spike.mjs
```

| File | What it is |
| --- | --- |
| `otree_api.py` | A minimal `otree.api`: `models.*Field`, `cu`, `BaseConstants`, `BaseGroup`, `BasePlayer`, `Page`, `WaitPage`. Model instances hold no state: a field read or write goes to the JS object behind them, and writing an undeclared field is an error. Each model class collects its fields as a schema. |
| `public_goods.py` | A public goods game in oTree's no-self format |
| `spike.mjs` | Loads Pyodide, imports the game twice as two packages, reads its structure, runs `set_payoffs` on plain JS objects, and measures |

## Results

| Question | Result |
| --- | --- |
| Loads in Node 22, no build? | Yes: `npm install pyodide`, prebuilt files only. Loads with `import` and with `require` (jtree's server is CommonJS). |
| Start-up | 0.8 s to a working interpreter. |
| Memory | +156 MB RSS for the interpreter (43 → 199 MB); +8 MB after 10,000 calls. So **one interpreter per server**, shared by all oTree apps. |
| Importing an app | 4 ms. |
| Two apps in one interpreter | Isolated: each imported as its own package (`app_pg_1`, `app_pg_2`), with different `C.MULTIPLIER`s, both correct. |
| App structure for the IR | Read in Python and passed as JSON: constants, the fields of `Player` and `Group` with their options (`min`, `max`, `label`, kind), and the page sequence with `form_model`, `form_fields`, wait pages and `after_all_players_arrive`. |
| Python reading and writing jtree's objects, synchronously | Yes. `set_payoffs(Group(jsGroup))` read each player's `contribution` from plain JS objects and wrote `payoff`, `total_contribution` and `individual_share` back, all correct, in one synchronous call: fits jtree's serial message queue. |
| Values crossing over | `cu(...)` (a `float` subclass) arrives in JS as a plain number. Currency-ness is lost at the boundary, so jtree takes field kinds from the schema, not from values. |
| Cost of a call | 12 µs for `set_payoffs` on a group of 3 (about 15 crossings between JS and Python). Negligible next to a socket message. |
| Errors | Reach JS as exceptions with the Python traceback: file and line (`File "/tmp/bad.py", line 2, in f`), so jtree can report them as it does for JS apps. Writing an undeclared field gives `AttributeError: Player has no field 'contributon'`. |
| Determinism | `random.seed(42)` gives the same draws every time: differential tests can seed Python. |
| Python's `ast` for the converter (§4.7) | `ast.parse` + a 15-line walker gives JSON with line numbers in 2 ms. No Python parser to write. |
| Size for a release | Core files 13.9 MB (`pyodide.asm.wasm` 9.6 MB, `python_stdlib.zip` 2.5 MB, `pyodide.asm.mjs` 1.3 MB, lock file 0.1 MB); **6.4 MB compressed**. |
| Third-party packages | Not in the npm package. `loadPackage('numpy')` downloaded numpy from jsDelivr (21 s here) and cached the wheel beside Pyodide's files for later. Offline labs need the wheels in place beforehand. |

## Decisions this supports

- **Ship Pyodide's core in the release archives** (+6.4 MB compressed) rather than fetching it on
  first use: labs are often offline, and it needs no install. Third-party packages: fetch on
  import when online, plus a way to add wheels to a lab's install for offline use.
- **One interpreter per jtree server**, started on the first oTree import (0.8 s), each app a
  package of its own.
- **Models as proxies onto jtree's objects** (§4.2) works as planned; saving, restoring and the
  admin need nothing from Python.
- **Field kinds come from the schema**, since values lose their Python type at the boundary.
- **The converter parses with Python's own `ast`** inside the same interpreter.

## Not covered here

Templates (§4.3) are separate JS work. `ExtraModel`, `live_method`, bots, and apps in the
older `models.py`/`pages.py` format were not tried; nothing here suggests a problem with them.
The shim here is a sketch: Phase 4 writes the real one, from oTree's documentation.
