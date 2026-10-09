# Plan: jtree as a host for z-Tree and oTree

Goal: make jtree general enough that z-Tree and oTree are special cases of it — server/game
logic, participant screens, admin interface, data output — so that z-Tree treatments and oTree
apps can be imported and either run as they are or converted to jtree apps.

Constraints that hold throughout:

- **Web-based.** Participants and experimenters use a browser. No z-Leaf, no Windows.
- **No build.** Every file jtree serves or runs is the file in the repo. Prebuilt third-party
  bundles (Vue, vue3-sfc-loader, Pyodide) are vendored as files, as now. New parsers and
  compilers are hand-written JS, not generated.
- **Existing jtree apps keep working unchanged** (`.jtt` files, `app.newStage`, `{{ }}` Vue screens).

---

## 1. Where jtree is today

| Area | Today | Gap for z-Tree / oTree |
| --- | --- | --- |
| Object model | `Session → App → Period → Group → Player`, `Participant`, `Stage` (`server/source/`) | Matches both closely. Missing: z-Tree's tables as first-class data; oTree's `Subsession`; session-/participant-level typed fields. |
| Lifecycle hooks | `stage.groupStart/playerStart/groupEnd/playerEnd`, `canPlayerParticipate`, `waitToStart/waitToEnd`, `duration` | No period-, app- or session-level hooks (`creating_session`, z-Tree's Background programs). No barrier across all groups (`wait_for_all_groups`). Groups are formed when the period starts, so no `group_by_arrival_time`. |
| App definition | A JS script `eval`'d against a live `App` (`App.js:395`, `Data.js:172`) | Nothing declarative to import into. The z-Tree admin re-derives a tree from source with acorn (`admin/ztree/src/treatment/parse.ts`). |
| Input handling | Client HTML attributes (`min`, `max`, `required`) and `player.x` field names | No server-side field schema or validation (oTree `IntegerField(min, max, choices)`, `error_message`; z-Tree item min/max/resolution). |
| Screens | One renderer: Vue 2.7 templates, rendered on the client from synced state (`participant/defaultClient.js`) | oTree renders server-side templates with `vars_for_template`; z-Tree lays out boxes and items at positions on a fixed screen. |
| Live interaction | `app.messages.x = fn`, `Table` rows broadcast to the group | Fits oTree `live_method` and z-Tree contract tables with an adapter. |
| Data output | One CSV per app (`App.saveOutput`), `.gsf` append log for restore | No z-Tree `.xls`/`.sbj`/`.pay` files, no oTree wide CSV / page times. |
| Admin | admin2 (`/admin/`), admin-ztree (`/admin/ztree/`), both Vue 3 SFC in the browser | No oTree-style admin (session configs, rooms, monitor, data, payments). |
| Tests | None | Needed before refactoring the core. |

The core is close. The work is mostly (a) a declarative layer between "an app file" and "the
running objects", (b) a handful of missing lifecycle features, and (c) pluggable pieces per
dialect: loader, program runtime, screen renderer, admin, exporter.

---

## 2. Architecture: one kernel, three dialects

```
              ┌──────────── loaders ────────────┐
  .jtt / .js ─┤ jtree loader  (eval, as today)  │
  .ztt text  ─┤ ztree loader  (parser)          ├──►  App IR  ──►  kernel  (Session/App/Period/Group/Player/Stage/Table)
  oTree dir  ─┤ otree loader  (Pyodide + ast)   │       │              │
              └─────────────────────────────────┘       │              ├── program runtimes: JS | z-Tree lang→JS | Python (Pyodide)
                                                        │              ├── screen renderers: vue | ztree-boxes | otree-template
                                     converters ◄───────┘              ├── exporters: jtree CSV | z-Tree xls | oTree CSV
                                  (IR → .jtt source)                   └── admin UIs: admin2 | admin-ztree | admin-otree
```

**App IR** (intermediate representation) is the hub: a plain, JSON-serialisable description of
an app. Every importer produces IR; the kernel runs IR; the converter prints IR as a `.jtt`
file. Three loaders and one emitter instead of six pairwise converters.

**A dialect** is a folder `server/source/dialects/<name>/` exporting:

```js
module.exports = {
  name: 'ztree',
  detect(filePath, stat) {},          // does this file/folder belong to me?
  load(filePath, ctx) {},             // → App IR (async)
  runtime,                            // compiles/executes the IR's program bodies
  exporters: { ztreeXls },            // extra output formats
  participantRenderer: '/participant/renderers/ztree.js',
  adminUrl: '/admin/ztree/',
}
```

`.jtt` is the `jtree` dialect; nothing about it changes for app authors.

### 2.1 App IR (sketch)

```js
{
  dialect: 'otree', id, title, description, source: { files, origin },
  constants: { NUM_ROUNDS: 3, PLAYERS_PER_GROUP: 2 },
  options: [ { name, type, default, min, max, choices, description } ],   // treatment options / session config
  numPeriods, practicePeriods,
  matching: { type: 'stranger'|'partner'|'absolute'|'typed'|'byArrival'|'custom', groupSize, numGroups, fn },
  fields: {                                   // typed, validated server-side
    player:  { contribution: { type: 'int', min: 0, max: 'C.ENDOWMENT', label, choices, blank: false, widget } },
    group:   { ... }, period: { ... }, participant: { ... }, session: { ... },
  },
  tables: [ { name: 'contracts', scope: 'period'|'session', columns } ],   // z-Tree user tables, jtree group tables
  hooks:  { sessionStart, appStart, periodStart, periodEnd, appEnd },       // program refs
  stages: [ {
      id, kind: 'page'|'wait',
      participate: prog, timeout: { seconds|prog, leave: true|false, onTimeout: prog },
      waitToStart: 'none'|'group'|'all', waitToEnd: ...,
      programs: { playerStart, groupStart, playerEnd, groupEnd, varsForScreen, validate },
      form: { fields: ['player.contribution'] },
      screen:  { renderer: 'vue'|'ztree'|'otree', active: ..., waiting: ... },
      live: prog,
  } ],
  payoff: { field: 'points'|'Profit'|'payoff', currency, exchangeRate, showUpFee },
  programs: { <ref>: { lang: 'js'|'ztree'|'python', source, compiled? } },
}
```

Program bodies stay in their source language inside the IR and are compiled by the dialect's
runtime when the app loads. That keeps the IR serialisable (for `.gsf` restore and admin
display) and lets the converter show the original next to the translation.

---

## 3. Kernel work (dialect-neutral)

Each item is useful to plain jtree apps too, and is a prerequisite for one or both dialects.

1. **Tests first.** Add `node:test` suites (built into Node 22, nothing to install) that drive
   sessions headlessly with autoplay-style bots: start session, connect N fake participants,
   submit stage forms, assert on state and output. Cover the sample games in
   `client/apps/1 sample games/`. Run in CI (`.github/workflows/`).
2. **IR + jtree loader.** `App.load` becomes `dialect.load → IR → App.fromIR`. For `.jtt`, the
   loader still `eval`s the script against an `App`, then reads the IR off it (`app.toIR()`), so
   existing apps and admin-ztree's source editing still work.
3. **Lifecycle hooks:** `session.start`, `app.start` (oTree `creating_session`, z-Tree
   Background session-start), `period.start/end` (z-Tree Background programs run every period),
   `app.end`.
4. **Barriers:** stage `waitToStart: 'all'` (all groups in the period: oTree
   `wait_for_all_groups`, z-Tree's default "wait for all subjects"), alongside today's per-group.
5. **Late grouping:** form groups at a named stage instead of at period start, from those
   who have arrived (oTree `group_by_arrival_time`, `get_players_for_group`), and regrouping
   mid-app (`set_group_matrix`).
6. **Typed fields + server-side validation:** schema on player/group/period/participant/session
   fields; the stage's form fields are validated on submit (type, min/max, choices, blank,
   dynamic `x_min`/`x_max`/`x_choices`, cross-field `error_message`). Errors go back to the
   client and the stage is not ended. Default values recorded in output even when unset.
7. **Timeouts:** per-player timeout (oTree `get_timeout_seconds`, `timeout_happened`), and
   z-Tree's "leave stage after timeout: no" (show the timer, keep the stage open).
8. **Payment:** points/currency with exchange rate, participation (show-up) fee, rounding,
   z-Tree `Profit`/`TotalProfit`, oTree `payoff`/`participant.payoff_plus_participation_fee()`.
   One payments view in the admins.
9. **History accessors:** `player.inPeriod(n)`, `inAllPeriods()`, `inPreviousPeriods()`
   (oTree `in_round`, z-Tree `OLDsubjects`), generalising `player.old()`.
10. **Tables as first-class data:** a `Table` can be scoped to group, period or session, and
    the kernel's own data can be *viewed* as tables (`subjects` = players of the period,
    `globals` = period fields, `session` = participant fields across apps). z-Tree programs run
    against these views; the jtree table window in admin-ztree already lists them.
11. **Event log:** every state change the kernel makes is appended to the session log as data
    (not `eval`able code), so restore, exporters and replay share one source. Replace the
    `__func_` stringify/eval round trip in `App.copyFieldsTo` for IR-backed apps.
12. **Pluggable participant renderers:** the participant page loads the renderer the IR names
    (`/participant/renderers/<name>.js`). `vue` is today's `defaultClient.js`. A renderer gets
    the synced player state and the stage's screen and returns DOM; form submission and
    `jt.sendMessage` stay common.
13. **Pluggable exporters:** `session.export(format)`; the admins list the formats the
    session's apps support.
14. **Sandboxing:** imported code is less trusted than the lab's own. Run JS programs from
    imported apps in `node:vm` contexts with only the kernel API in scope; Python runs in
    Pyodide (WASM, no file system or network unless granted).

---

## 4. oTree dialect

### 4.1 What an oTree project is

`settings.py` (`SESSION_CONFIGS`, `SESSION_CONFIG_DEFAULTS`, `ROOMS`, `PARTICIPANT_FIELDS`,
`SESSION_FIELDS`, `REAL_WORLD_CURRENCY_CODE`, …), one folder per app with `__init__.py`
(no-self format: `C`, `Subsession`, `Group`, `Player`, module-level functions, `Page`/`WaitPage`
classes, `page_sequence`) and `.html` templates, `_static/`, `_templates/`, optional `tests.py`
bots. Older projects use `models.py` + `pages.py` with `self`.

### 4.2 Running oTree apps as they are: Pyodide + an `otree.api` shim

oTree app logic is Python, so the faithful way to run it is to run Python.
[Pyodide](https://pyodide.org) is CPython compiled to WebAssembly and runs in Node 22 with no
native build: its files are vendored like the other libraries (or fetched once on the first
oTree import, to keep the release archives small).

- **Shim, not oTree.** jtree ships its own `otree/api.py` (`models`, `widgets`, `Currency`/`cu`,
  `BaseConstants`, `BaseSubsession`, `BaseGroup`, `BasePlayer`, `Page`, `WaitPage`, `ExtraModel`,
  `Bot`, `Submission`, `expect`), written against oTree's public documentation. Before reusing
  any oTree source, check its license.
- **Models are proxies.** `Player`, `Group`, `Subsession` instances hold no state: attribute
  access goes through Pyodide's JS bridge to the kernel's `Player`/`Group`/`Period` objects,
  checked against the field schema the loader built from the class bodies. So the `.gsf` log,
  restore, admin tables and exporters all work unchanged, and Python holds nothing that
  needs saving.
- **Pages map to stages.** `form_model`/`form_fields` → stage form; `is_displayed` → participate;
  `vars_for_template`/`js_vars` → `varsForScreen`; `before_next_page` → `playerEnd`;
  `timeout_seconds`/`get_timeout_seconds` → timeout; `error_message`, `<field>_min/max/choices`
  → validation; `live_method` → stage live handler (return value `{id: data}`, `0` = group);
  `app_after_this_page` → kernel jump. `WaitPage` → wait stage with `after_all_players_arrive`
  as `groupStart` (or period-level when `wait_for_all_groups`), `group_by_arrival_time` → late
  grouping, `is_displayed`, `body_text`/`title_text`.
- `creating_session` → `app.start`; `C.NUM_ROUNDS` → periods; `C.PLAYERS_PER_GROUP` → group
  size (`None` = one group); `participant.vars`/`PARTICIPANT_FIELDS` → participant fields;
  `session.config` → session options; `ROOMS` → jtree rooms with participant labels.
- **One interpreter per server**, one module namespace per loaded app (each app imported under a
  unique package name). Calls into Python are synchronous, which suits jtree's serial message
  queue (`Session.processMessage`).
- Third-party packages: whatever Pyodide supplies (numpy, etc.) via `micropip`; apps needing
  others fall back to conversion.

### 4.3 oTree templates

A JS implementation of oTree's template language (it is its own language since oTree 5, not
Django's): `{{ expr }}` with dotted lookup, `{{ if }}/{{ elif }}/{{ else }}/{{ endif }}`,
`{{ for x in xs }}`, `{{ block }}`/`{{ extends }}`/`{{ include }}`, `{{ formfields }}`,
`{{ formfield 'x' }}`, `{{ formfield_errors }}`, `{{ next_button }}`, `{{ static }}`,
`{{ chat }}`, filters such as `|c`, `|to0`, `|to1`, `|to2`, `|json`. Hand-written tokenizer +
recursive-descent parser, roughly 600–900 lines, reusable on server and client.

The `otree` renderer renders on the server per player (it needs `vars_for_template`), sends
HTML, and the page shell provides oTree's client API: Bootstrap 5 layout (vendored), the timer
bar, `liveSend`/`liveRecv`, `js_vars`, form errors. Forms submit over jtree's socket; plain
HTTP POST also works so that pages with their own `<form>` JavaScript behave.

### 4.4 oTree admin (`/admin/otree/`)

A third admin, built like admin2 and admin-ztree (Vue 3 SFCs compiled in the browser, appfr):
Demo, Sessions (create from a session config, with its `config` overrides), Rooms (labels,
waiting participants), session tabs Description, Links (session-wide and per-participant),
Monitor (page, round, time on page, advance slowest), Data (live field table), Reports
(`vars_for_admin_report` + `admin_report.html`), Payments. It talks to the same socket.io
messages (`core/Msgs.js`), plus new ones where needed.

### 4.5 Output

`all_apps_wide.csv`, per-app CSVs, page-times CSV, `custom_export` (called through Pyodide),
in oTree's column naming (`participant.code`, `player.payoff`, `<app>.<round>.player.<field>`),
so existing analysis scripts run on jtree data.

### 4.6 Bots

`tests.py` `PlayerBot` → jtree autoplay: run the bot's `play_round` generator in Pyodide,
turning each `yield Page, {...}` into a stage submission. Gives a test suite for every imported
app for free, and is how §7's differential tests drive oTree apps.

### 4.7 Converting oTree apps to jtree

Parse with Python's own `ast` module inside Pyodide (`ast.dump` → JSON), so there is no
Python parser to write. Then emit `.jtt`:

- Structure (C, fields, page sequence, wait pages, timeouts, validation) → IR → `.jtt`, fully.
- Function bodies → a Python-subset → JS translator (arithmetic, comparisons, `if`/`for`/
  `while`, list/dict literals and comprehensions, `sum`/`len`/`min`/`max`/`round`/`range`,
  `random.*`, attribute access, the model API). Anything outside the subset is emitted as a
  `// TODO (from Python):` block with the original source, and listed in the conversion report.
- Templates → Vue templates where they map (`{{ x }}`, `if` → `v-if`, `for` → `v-for`,
  `formfield` → `<input name="player.x">` with the schema's attributes); else keep the oTree
  template and set `screen.renderer = 'otree'`, so converted apps still render exactly.

---

## 5. z-Tree dialect

### 5.1 Getting at a treatment

`.ztt` files are a binary format with no published specification. z-Tree itself exports a
treatment as text (File → Export → Treatment…; Windows-1252 encoded), the same route tools like
zBrac use.

- **Supported input:** the text export. The importer explains how to make one when given a
  binary `.ztt`.
- **Stretch goal:** read binary `.ztt` directly. Time-box a reverse-engineering spike against a
  corpus of `.ztt` + text-export pairs (§7) before committing; drop it if the format is unstable
  across z-Tree versions.

The exact grammar of the text export is not specified anywhere either; Phase 0 (§8) pins it
down from a corpus covering z-Tree 3.x–5.x.

### 5.2 Treatment → IR

| z-Tree | IR / kernel |
| --- | --- |
| Background: # subjects, # groups, # periods, # practice periods, exchange rate, show-up fee | `numPeriods`, `practicePeriods`, `matching`, `payoff` |
| Background tables (`globals`, `subjects`, `summary`, `contracts`, `session`, `logfile`, user tables) | kernel table views + `tables` |
| Background programs | `hooks.periodStart` |
| Stage: participate, start (wait for all / when possible / when all in group), timeout + "leave stage after timeout", "Leave stage" condition | stage `participate`, `waitToStart`, `timeout` |
| Stage programs (`subjects.do`, `globals.do`, `contracts.do`, …) | `programs.playerStart/groupStart/periodStart` by the table they run on |
| Active / waiting screen: boxes and items | `screen: { renderer: 'ztree', boxes: [...] }` |
| Buttons (with checker, "on click" programs) | form submit + `validate` + program |
| Matching (partner, stranger, absolute stranger, typed), group matching by program | `matching` |
| Questionnaires (address form, questions, rulers, buttons) | an extra app after the treatment, with the `ztree` renderer |
| Contract creation / list / grid boxes | live handlers on the `contracts` table |

### 5.3 z-Tree language → JS

A hand-written tokenizer + recursive-descent parser (`dialects/ztree/lang/`) for z-Tree's
programming language: numbers and strings, variables and assignment, arithmetic and
logic, `if`/`elsif`/`else`, `while`/`repeat`, `table.do { }`, `table.new { }`, scope operator
`:` and `\` for outer-scope/table variables, table functions (`sum`, `average`, `count`,
`find`, `maximum`, `minimum`, `product`, `median`, `same(x)`, …), `OLDsubjects`-style history,
built-ins (`random`, `round`, `roundup`, `rounddown`, `exp`, `ln`, `sqrt`, `if( , , )`,
`Period`, `Subject`, `Group`, `Profit`, `TotalProfit`), and the `<>`-text formatting used in
screens (`<>Your profit: <Profit|0.01>`).

It compiles to JS source, not an interpreter, so the same output (a) runs in the kernel and
(b) goes into converted `.jtt` files readable by a person. Its semantics (row iteration,
scoping, period-carry rules, rounding) get a dedicated conformance suite of small programs
whose expected results come from running them in real z-Tree.

### 5.4 z-Leaf renderer (`participant/renderers/ztree.js`)

A fixed-aspect screen of absolutely positioned boxes, sized in percent or pixels as z-Tree
does: header box (period, remaining time), standard, help, container, grid, history, message,
chat, plot, multimedia and the contract boxes; items with their layouts (number, `!text`,
radio, radio line, checkbox, slider, scrollbar, buttons), min/max/resolution, `<>` text
formatting; z-Tree's default look (grey, system font) as one CSS file. Plain JS, or Vue 3
(already vendored) if the contract boxes make reactivity worth it.

### 5.5 Admin

admin-ztree exists and already models treatments as a stage tree. Change it to read the tree
from the IR instead of parsing jtree source with acorn, so it opens imported `.ztt` text
directly; keep the acorn path for editing `.jtt` source. Enable the greyed-out items that the
kernel work makes real: questionnaires, parameter table (z-Tree's per-period/per-subject
parameter grid → stage-level fields), matching menu, payment file.

### 5.6 Output

z-Tree's session `.xls` (tab-separated table dumps per period), `.sbj` (questionnaire answers),
`.pay` (payment file) and `.adr`, byte-for-byte in layout, so `zTree` (R), `ztree2stata` and lab
payment scripts read jtree data unchanged.

### 5.7 Converting z-Tree treatments to jtree

IR → `.jtt`: compiled programs as hook functions, screens as Vue templates where the box/item
layout maps onto HTML (most standard boxes), or kept as `ztree` screens where it does not
(contract grids, plots, exact positioning). Conversion report as for oTree.

---

## 6. Converter output and the conversion report

Both converters write a folder: `app.jtt` (formatted, commented with the origin of each part),
copied static files, and `CONVERSION.md` listing for every element: translated / kept in the
source dialect's renderer / needs hand work, with line references into the original. The admin
shows the same report on import, and offers "run as is" or "convert" per app.

Levels of support, stated per imported app:

- **Runs as is**: loads and runs on the dialect runtime with no changes.
- **Converts**: becomes a native `.jtt` app with no TODOs.
- **Converts with TODOs**: structure converted, some code needs hand work.
- **Structure only**: stages, fields and screens imported; logic must be written.

Targets: oTree no-self apps with no unsupported third-party packages → runs as is; z-Tree
treatments using standard boxes, items and contract tables → runs as is.

---

## 7. Verification

- **Kernel tests** (§3.1) before any refactor; kept green throughout.
- **Corpus:** oTree's bundled sample games (public goods, trust, dictator, prisoner, guess
  two-thirds, Cournot, Bertrand, matching pennies, survey, bargaining, volunteer's dilemma,
  traveler's dilemma) and real lab projects; z-Tree treatments from the manual's tutorials and
  from labs (with `.ztt` + text export + a recorded session `.xls` each). Collect with
  permission; store outside the repo if not redistributable.
- **Differential tests:** run the same app with the same inputs (oTree bots; z-Tree replays of
  recorded sessions' inputs) on the original platform and on jtree, and compare outputs
  field-by-field after normalising IDs, timestamps and random seeds. This is the definition of
  "runs as is".
- **Language conformance:** §5.3's z-Tree program suite; template-language suite for §4.3.
- **Browser checks** of each renderer against screenshots from the original platforms.

---

## 8. Phases

Each phase ends with something usable and keeps every existing jtree app working.

| # | Phase | Delivers | Depends on |
| --- | --- | --- | --- |
| 0 | Spec and corpus | Corpus (§7); a written grammar for z-Tree's text export; Pyodide-in-Node spike (load time, memory, sync calls into the JS kernel); decision on binary `.ztt` | — |
| 1 | Test harness | `node:test` headless session driver; tests for sample games; CI | — |
| 2 | IR and dialect plumbing | IR, `App.fromIR`, jtree loader producing IR, dialect registry, renderer and exporter hooks; admin-ztree reads the IR | 1 |
| 3 | Kernel features | §3.3–3.11: hooks, barriers, late grouping, typed fields and validation, timeouts, payment, history, table views, data event log | 2 |
| 4 | oTree run | otree loader, `otree.api` shim on Pyodide, template engine, `otree` renderer, oTree CSV export, bots | 0, 3 |
| 5 | oTree admin | `/admin/otree/` | 4 |
| 6 | z-Tree run | text-export parser, z-Tree language compiler, table runtime, z-Leaf renderer, `.xls`/`.sbj`/`.pay` export, questionnaires | 0, 3 |
| 7 | z-Tree admin | admin-ztree on imported treatments, greyed items enabled | 6 |
| 8 | Converters | IR → `.jtt` emitter, Python-subset → JS, template → Vue, conversion reports | 4, 6 |
| 9 | Binary `.ztt` (optional) | Direct `.ztt` reading, if Phase 0's spike says it is feasible | 6 |
| 10 | Docs and release | Tutorials "Running an oTree project", "Running a z-Tree treatment", "Converting"; release notes; Pyodide packaged or fetched on first use | all |

Phases 4–5 and 6–7 are independent and can run in parallel after Phase 3. oTree first is
recommended: its inputs are readable files, Pyodide gives exact semantics, and its bots supply
differential tests; z-Tree needs the corpus and the language work before anything runs.

---

## 9. Risks and open questions

- **z-Tree's formats are undocumented.** The text export's grammar and the language's exact
  semantics must be inferred from a corpus and from runs of real z-Tree (Windows). Without
  access to z-Tree to make exports and reference runs, the z-Tree half cannot be verified.
- **Binary `.ztt`** may be impractical; the plan works without it at the cost of an export
  step in z-Tree.
- **Pyodide footprint:** tens of MB on disk and per interpreter in memory, a second or two to
  start. One shared interpreter per server keeps this bounded; measure in Phase 0. Decide
  whether release archives include it or fetch it on first use.
- **oTree features outside the shim:** `ExtraModel`, `custom_export`, MTurk/Prolific
  integration, `otree.database` internals, Django-era (oTree < 5) projects. Support the
  first two; treat the rest as conversion-with-TODOs. Old `models.py`/`pages.py` projects can
  use the same shim if it also supports the `self` style; decide in Phase 4.
- **Licensing:** z-Tree is proprietary (reimplementing behaviour from the manual is fine; do
  not ship its files). Check oTree's license before copying any of its code or templates.
- **Two participant Vue versions:** the participant page uses Vue 2.7, the admins Vue 3.
  New renderers should not depend on Vue 2; moving the `vue` renderer to Vue 3 is separate work.
- **Determinism:** differential tests need seeded randomness in all three runtimes
  (`Math.random`, z-Tree `random()`, Python `random`).

---

## 10. Progress

### Phase 1: test harness (done)

- `server/test/harness.js`: starts jtree in-process on a free port with a throwaway data
  folder; bots connect over socket.io as the participant page does (`submit`, `fill`, `send`,
  answering the server's `endStage` on timeouts) and read state from the server's objects.
- `server/test/sample-games.test.js`: every game in `client/apps/1 sample games` played to the
  end with payoffs checked; `app-catalogue.test.js`: every app in `client/apps` loads.
- `pnpm test` in `server/` (`node:test`, `socket.io-client` as the one dev dependency); CI on
  Linux, macOS and Windows in `.github/workflows/test.yml`.

Found on the way, and fixed:

- Folder apps: `app.jtt` plus one `.jtt` per stage, added in name order (`1_decide.jtt` is
  stage `decide`); `stage` and `app` in a stage's file; whole folder copied to the session's
  output; stage files no longer listed as apps. `public-good-v2` uses it. This is the
  one-file-per-stage layout imported apps can be converted to (§6).
- Syntax errors report line and position (`vm.Script` recompile; `syntaxErrorPosition.js`),
  also in stage files (`app.errorFile`). Moving from `eval` to `vm` for running apps is still
  §3.14.
- `jt.stop()`: disconnects clients, stops jtree's timers, closes its files and its own server.
- Stage timeouts: the server ends players whose page has not submitted within
  `stage.timeoutGrace` seconds (default 5, `null` waits as before), and `player.timedOut`
  marks who timed out, readable in `playerEnd`/`groupEnd`: the basis for oTree's
  `timeout_happened` and z-Tree's timeouts.
- `sliderMoving.jtt` runs on its own (default decision situations, text without images).

- Restoring saved sessions (`loadSessions`): `App.load` passed its constructor arguments in
  the wrong order and looked for the app's copy in the wrong place; and since 2019 every
  `.gsf` line had `;` (the CSV delimiter) after its type, so none parsed and nothing was
  restored, silently. Now sessions come back with apps, stages, players and data; old files
  are read too.

- Continuing a restored session: loading copied derived values over methods (a player's
  `roomId`), so participants could not log in; removals were not saved, so removed
  participants came back and groups waited for them; `started` and pause were not saved;
  stage timers could not be restored (a stringified bound callback, a typo in
  `loadLastTimeOn`, and superseded group records each starting a timer); and group tables
  were not found (`loadContext` matched `1-<app path>` against app ids). All fixed, with
  tests that stop jtree mid-session and play on.

Still open: a participant's app time limit (`app.duration`) is not restored; only two user
experiments under development use it. The `.gsf` format is replaced by the event log of
§3.11.

### Phase 0: Pyodide check (done)

[spikes/pyodide/](spikes/pyodide/README.md): Pyodide runs in Node 22 with no build (0.8 s to
start, +156 MB per interpreter); Python reads and writes jtree's JS objects synchronously
through proxies (12 µs for a public goods `set_payoffs`); apps are isolated as packages; the
field schema and page sequence come out as JSON; errors carry Python tracebacks; Python's
`ast` serves the converter. Core files are 6.4 MB compressed, so releases can include them.
The rest of Phase 0 (the z-Tree corpus and grammar) needs `.ztt` files and z-Tree.

### Phase 2: app descriptions and dialects (mostly done)

- `dialects/jtree/runAppCode.js`: app code runs through one loader (`vm.compileFunction` with
  the file's name) instead of `eval` in four places; errors give file and line, also from
  hooks later. Same scope everywhere: `app` (and `stage`), `Utils`, `fs`, `path`, `require`.
  Not a sandbox yet (§3.14): it runs in jtree's own context.
- `ir/ir.js`: the IR (§2.1, as far as the kernel supports today), `validate`, `applyIR`, and
  `app.toIR()` for jtree apps. `dialects/`: the registry, with `jtree` and `ir`
  (`<name>.app.json`) dialects; loading, reloading, restoring and the admin's metadata go
  through it.
- Tests play every sample game also as IR: 7 of 9 the same. What an IR of a jtree script
  cannot carry: functions that use names from their file (centipede), and values the script
  computes from options (real effort's stage duration, until a timeout can be a program, §3.7).
- Not done, on purpose: participant renderer and exporter slots wait for their second
  implementation (oTree templates and CSV, Phase 4); admin-ztree reading the IR waits for an
  importer (and the admin-ztree changes in progress).

### Phase 3: kernel features (what Phase 4 needs: done)

Each with tests, in the IR, and documented in doc-pages:

- §3.3 Hooks: `app.appStart()`, `app.periodStart(period)`, `app.periodEnd(period)`; `app.end()` runs
  again (nothing called it, and apps' data was no longer written to the session CSV at their end).
  Players of a stage that waits for everyone now move on after `groupEnd`/`periodEnd`, not
  before them; errors in `groupEnd`/`playerEnd` no longer stop a session.
- §3.4 `stage.waitForAllGroups` and `stage.allGroupsStart(period)`.
- §3.5 `period.setGroups(matrix)` in `periodStart`; `app.groupByArrival`. Fixed the
  `PARTNER_1122`/`PARTNER_1212` matchings (they threw).
- §3.6 `app.fields`, `stage.formFields`, `stage.validate`: forms checked and converted by the
  server; the page shows what is wrong.
- §3.7 Each player's own time (`stage.clientDuration`/`getClientDuration`) kept by the server;
  `stage.endOnTimeout`.
- §3.8 `session.showUpFee`/`exchangeRate`/`currency`, `app.exchangeRate`, `participant.payment()`.
- §3.9 `inPeriod`/`inAllPeriods`/`inPreviousPeriods` for players and groups; `group.old()` fixed.

Left for when what uses them is built:
- §3.10 Tables as views: shaped by z-Tree's language; with its runtime (Phase 6).
- §3.11 Event log replacing `.gsf`: restore works on `.gsf`; the log's consumers are exporters
  (Phases 4 and 6).
- §3.14 Sandbox: oTree's Python runs in Pyodide already, z-Tree's programs will be JS jtree
  generates; only third-party JS apps need it.
- A payments view in the admins (admin-ztree has work in progress).
- Restored sessions do not restore players' own timers, nor groups' stageEndedIndex.

### Phase 4: oTree apps run in jtree (largely done)

`server/source/dialects/otree/`: an oTree app (a folder with `__init__.py` in oTree's format)
loads as a jtree app; its Python runs in Pyodide (now a dependency) with jtree's own
`otree.api` (`python/otree/api.py`, written from oTree's documentation), whose models stand for
jtree's objects.

- Rounds as periods, `PLAYERS_PER_GROUP` (or one group), oTree's default grouping; Pages as
  stages players take on their own; WaitPages (group, `wait_for_all_groups`,
  `group_by_arrival_time`) with `after_all_players_arrive`; `creating_session` per round.
- Fields and forms: kinds, `min`/`max`/`choices`/`blank`, `<field>_min/_max/_choices/
  _error_message`, `error_message`, group form fields; a timeout takes what was submitted.
- Pages: `is_displayed`, `vars_for_template`, `before_next_page(player, timeout_happened)`,
  `timeout_seconds`/`get_timeout_seconds` with oTree's countdown, `js_vars`, `live_method` with
  `liveSend`/`liveRecv`. Templates rendered by Python in oTree's template language
  (`python/otree_template.py`: blocks, if/for, formfields, filters; expressions from a
  whitelist, not eval), on Bootstrap 5 with oTree's layout.
- Models: roles, `in_round`/`in_all_rounds`..., `get_player_by_id/_role`,
  `set_group_matrix`/`group_randomly`/`group_like_round`, `participant.vars`, `session.vars`,
  `session.config`, payoffs as jtree's points.
- Projects: each of `settings.py`'s `SESSION_CONFIGS` is a queue (fee, exchange rate, config,
  app sequence).
- Bots: apps' `tests.py` (`PlayerBot`, `cases`, `Submission`, `SubmissionMustFail`, `expect`)
  run in the server (`bots.js`) through `app.submitStage`.
- Data: oTree's "all apps, wide" CSV (`server/source/exporters`, a download in admin v2).
- Tests: four oTree apps of my own (public goods, trust, guessing with a survey, live bids),
  their bots, a project; checked in a browser.

Since then:
- `ExtraModel` (rows kept with the session; `custom_export`), chat (`{{ chat }}`, channels and
  nicknames), the older `models.py`/`pages.py` format with Django templates, a project's
  `_templates`/`_static`, `app_after_this_page`, rooms (a project's `ROOMS`), oTree's admin at
  `/admin/otree/` (sessions, links, monitor, data, reports with `admin_report.html`, payments),
  per-app CSVs, page times.
- oTree's own sample games (`test/fixtures/otree-samples`, MIT) each run in jtree, played by
  their own bots, in CI.

Checked in a browser, in the tests (`test/browser.test.js`: headless Chrome through the DevTools
protocol, `test/browser.js`, skipped where there is no Chrome): chat between participants, a room
page sending its participant into the session the admin opens there, the oTree admin (a session
from a config, its links, rooms, converting an app), admin v2's rooms, a converted app played in
browsers. `ExtraModel` rows persist only with the session's record.

### Phases 6 and 9: z-Tree treatments run in jtree (started)

`server/source/dialects/ztree/`: a z-Tree treatment (a `.ztt` file) loads as a jtree app, read
from z-Tree's binary format directly (Phase 9 came first: z-Tree's examples are only published as
`.ztt`, and no text exports were at hand).

- `ztt.js` reads file versions 16, 18 and 34 (z-Tree 3), worked out from z-Tree's nine examples:
  treatment, tables, background and stages (programs, timeout, options, active and waiting
  screens), boxes (standard, header, help, container, contract list and creation, history, grid,
  chat, calculator) with their placement, items (label, variable, input, min, max, layout),
  buttons with their checkers and programs, and the parameter table (periods, subjects, groups,
  programs). Each class's leading fields are read exactly; the bytes after them (display
  settings) are skipped, and the tree is put together from the objects' classes and the lists'
  lengths. Contract boxes' settings after their lists (owner, condition, sorting) are read
  loosely.
- `lang.js`: z-Tree's language: assignments, `if`/`elseif`/`else`, `while`, `repeat`, arrays,
  `T.do`, `T.new`, `later ( ) do/repeat`, `:x`, `\x`, `OLD` tables, table functions
  (`sum`/`count`/`average`/`minimum`/`maximum`/`find`/`same`/...), and z-Tree's functions.
- `runtime.js`: z-Tree's tables (globals, subjects, summary, contracts, session) each period;
  the background's and parameter table's programs at a period's start; stages' programs as
  they start (all at once for "wait for all", each subject's for "start if possible") and
  Participate; buttons (inputs checked against min, max and resolution, checkers, programs on
  the box's record, the subject's or globals); contract creation and lists; chat; Profit as
  points.
- `render.js` and `participant/ztree.js`: z-Leaf's screens: boxes placed by their distances and
  sizes, items with their layouts (numbers, `!text`, `!radio`, `!radioline`, `!checkbox`,
  `!slider`, `!button`, `<>` texts with `<var|layout>`), the header's countdown, z-Leaf's
  messages; drawn by the server and sent again whenever the tables change, keeping what a
  subject has typed.
- Data: the tables as z-Tree's `.xls` (tab-separated text), a download.
- Tests (`test/ztree.test.js`, and two in `test/browser.test.js`): z-Tree's examples, downloaded
  from its site (not in the repository): all are read; pg, ug, pd, game222, noda, asset_da,
  dutchauction, chatdemo and ifelems_e are played through participants' messages, with their
  results checked; pg and noda in browsers.

Phase 7: admin-ztree opens a `.ztt` as z-Tree shows it (its stage tree, read only, from the
treatment the server read: `treatment/ztt.ts`), with Treatment → Parameter Table, and Run's
tables showing the treatment's own z-Tree tables (`ztreeTables`, sent again when they change);
the Connection Monitor names z-Tree's stages. Questionnaires (`.ztq`, `ztq.js`) run as
treatments: a stage a questionnaire, texts and questions (lines of choices between their
labels), each subject at their own pace.

Not yet: plot and multimedia boxes; z-Tree's text export as input; converting treatments to
`.jtt` (Phase 8); stages' options other than "start if possible" and the header (bit 2 of the
first, set on the examples' market stages, is not known); boxes' frames and buttons' placement.

### Phase 8: converters (oTree's done)

`dialects/otree/convert.js` (`node server/source/dialects/otree/convert.js <app> [<out>]`)
converts an oTree app in its current format to a jtree folder app:
- `app.jtt`: settings, `C` as constants, fields as `app.fields` (min, max, choices, blank,
  initial, `<field>_min/_max/_choices` as functions), `creating_session` as `periodStart`, the
  app's functions translated from Python, and each page as a stage: `is_displayed` as
  `canPlayerParticipate`, `vars_for_template` in `playerStart`, `before_next_page` as
  `playerEnd`, `error_message` and `<field>_error_message` as `validate`, timeouts; wait pages
  with `after_all_players_arrive` as `groupStart` (or `allGroupsStart`).
- `pages/<Page>.html`: each template as a Vue screen (blocks, extends, include, if/elif/else,
  for with `forloop`, filters, formfields with their widgets, tags in attributes); its data is
  `player.page`, worked out when the player starts the page, with oTree's names.
- `otree.cjs` (`convert-runtime.js`): what the translated code calls for oTree's API and
  Python's built-ins (Python's rounding, sorting by tuples, truthiness of lists, ...).
- `CONVERSION.md`: converted, or a TODO for each thing that is not (in the code, a comment
  with the Python and a `throw`).
- `{{ static }}` files are put in the pages as `data:` URLs.

The translator (`python/otree_convert.py`) works on Python's syntax tree: arithmetic,
comparisons (chained), if/for/while, comprehensions, dict/tuple keys, f-strings, lambdas,
built-ins, `random`, `math`, and the models' API. Not converted: chat, live pages, `js_vars`,
`ExtraModel`, `custom_export`, admin reports, the older format (which runs as is).

Tested: all 14 oTree samples convert with no TODOs (prisoner's chat aside), and each converted
app is played by the oTree app's own bots in every case, which check its results and its
pages, rendered by Vue in Node (`test/vue2.js`); a fixture of harder Python passes the same bots
as oTree app and converted (`test/otree-convert.test.js`).

The oTree admin's Apps page lists the oTree apps, each running as it is, with **Convert to
jtree** (`otreeConvertApp`), which writes the jtree app beside it and shows the report.

Not yet: z-Tree's converter (Phase 6 first).

