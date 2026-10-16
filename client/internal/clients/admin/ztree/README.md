# admin-ztree

Served at `/admin/ztree/` under jtree's route.


An admin interface for jtree laid out after [z-Tree](https://www.ztree.uzh.ch/en.html),
built on [appfr](https://github.com/opowell/appfr) (`header-content-layout`): one
main window with z-Tree's menu bar (File, Edit, Treatment, Run, Tools, View, ?)
over a grey desktop of child windows. It follows the
[z-Tree 5.1 manual](https://www.ztree.uzh.ch/static/doc/manual.pdf), chiefly
chapters 2.5–2.6 (testing a treatment), 5 (conducting a session) and 8 (menu commands).

The desktop's windows and where they are are in the address bar (`?w=…`, appfr's
`useLayoutRoute` over `windows.ts`'s `desktopLayout`), so a reload keeps them and a link
opens them as they were; they are also saved in the browser for an address without `w`.
Treatments named there are opened again once the server has listed its apps (`App.vue`).

## How jtree maps onto z-Tree

| z-Tree | jtree |
| --- | --- |
| Treatment (`.ztt`) | App (`.jtt` / `.js`) |
| Session | The session this window has open (created on first use; Run → Restore Session… switches) |
| Client / z-Leaf | Participant / its page |
| Start Treatment | Adds the app to the session and starts it for the selected clients (or all) |
| Stop Clock / Restart Clock | Pause / resume the session's timers |
| Stage `=|=` (Wait for all) | `stage.waitToStart` |
| Stage timeout `(30)A` | `stage.duration` (jtree always leaves the stage at the timeout) |
| `subjects.do { … }` | `playerStart` / `playerEnd` (by `‹hook›` in the tree) |
| `groups.do { … }` | `groupStart` / `groupEnd` |
| Background `globals.do { … }` | Top-level code such as `app.pieSize = 100;` |
| Active screen boxes and items | The stage's HTML: a `<form>` is a standard box, `<input name="player.x">` an `IN( player.x )` item, `{{player.x}}` an `OUT( player.x )` item |

## z-Tree's own treatments

A z-Tree treatment (`.ztt`, or a `.txt` in z-Tree's text format) or questionnaire (`.ztq`) in the
apps folder runs as it is (see `server/source/dialects/ztree`), and is edited here as z-Tree edits
it. File → Open… shows its stage tree as z-Tree draws it: the Background with its tables, programs
and screens, then the stages, each with its programs, Active screen and Waitingscreen, and their
boxes, items, buttons, checkers and plot items. File → New Treatment starts z-Tree's new treatment.

- **Treatment → New …** (Stage, Table, Table Loader and Dumper, Program, External Program, each kind
  of Box, Button, Checker, Item, each Plot item) puts the element where the selection says, as z-Tree
  does: into the selected element if it holds that kind, else after it or the element above it that
  can have it beside it. Its dialog opens first, with the settings z-Tree 5 gives a new one.
- **Double-click** (or Treatment → Info…) opens an element's dialog: General Parameters, Stage,
  Program, Table, the boxes', Item, Button, Checker, the plot items'. They have z-Tree's fields, set
  in z-Tree's words (`TRUE`, `ifnoinput`, `BOTTOMRIGHT`). Settings a dialog has no field for are under
  **Other settings**, where they can be changed, taken out or added, so nothing is out of reach.
  Changing the number of subjects or periods keeps the parameter table (roles, periods) in step.
- **Edit**: Undo (Ctrl+Z) and Redo (Ctrl+Y), Cut, Copy, Paste, Delete, and Move Up / Move Down
  (Alt+↑, Alt+↓).
- **Treatment → Check** parses every program and expression with jtree's z-Tree language and lists
  where any does not.
- **File → Save** has the server write the treatment in z-Tree's text format
  (`server/source/editors/ztree.js`), as z-Tree writes its exports: a treatment z-Tree exported is
  written again byte for byte. z-Tree opens these files with File → Import…. jtree reads z-Tree's
  binary `.ztt` files but does not write them: one opened here is saved as a `.txt` beside it, after
  a notice saying so. File → Export Treatment… downloads the text.

Treatment → Parameter Table shows the periods, subjects, groups and their programs of a treatment
jtree has read. Run → Tables show its own z-Tree tables (`globals`, `subjects`, `summary`,
`contracts`, as the server's `ztreeTables` message sends them, again whenever they change).

## jtree apps as treatments

File → New jtree App, or opening a `.jtt`, shows a jtree app as a treatment (`treatment/parse.ts`):
its stage tree made from its source. Treatment → New Stage…, New Program…, and Edit →
Cut/Copy/Paste change the source; the Stage and Program dialogs change a stage and its hooks.
Edits stay in the window until File → Save writes the file on the server. (jtree's own app editor,
in the main admin, edits them as a tree of stages, screens and elements, or field by field.)

## Windows

- **Treatment windows** (File → Open…, New Treatment, New jtree App): the stage
  tree, of a z-Tree treatment or a jtree app (above). Edits stay in the window
  until File → Save writes the file on the server.
- **Connection Monitor** (Run): z-Tree's seven columns. Tick `selected` to start
  the next treatment for only some clients. Click states, or the box over the
  state column, then Run → Leave Stage. Tick `stop after period` for a treatment.
  Double-click a client to watch its z-Leaf.
- **Tables** (Run): `treatments`, `clients`, `sessionglobals`, `participations`,
  `logfile`, and per treatment `globals`, `subjects`, `groups`, `contracts`,
  `summary` (Run → all Tables for earlier treatments). Copy cells with Ctrl+C,
  or File → Export Table….
- **z-Leaf windows** (Tools → Start z-Leaf…): one client per name, like
  `zleaf.exe /name first`, for testing on one computer.

Keys: F5 Start Treatment, F12 Stop Clock, Shift+F12 Restart Clock, Ctrl+O, Ctrl+S.

What jtree has no counterpart for (new questionnaires, the matching menu,
GameSafe, the data tools, …) is shown greyed out, as z-Tree greys out what cannot
be done.

## Server support

Three messages were added to `server/source/core/Msgs.js` for this interface:
`startTreatment` (start an app for some clients mid-session), `leaveStage`
(per-subject leave stage) and `setStopAfterPeriod` (checked in
`App.getNextPeriod`). z-Tree treatments are read, checked and written by the
server's editor API (`/api/editor/ztree/…`, `server/source/editors/ztree.js`).
Restart the jtree server after updating.

## Running and editing

There is no install or build step, as for [admin2](../v2/README.md): jtree serves
this folder as it is, and `boot.js` compiles `src/` (TypeScript and Vue
single-file components) in the browser with
[vue3-sfc-loader](https://github.com/FranckFreiburger/vue3-sfc-loader). Edit a
file and reload the page. Compiled modules are kept in the browser's
localStorage, keyed by their source.

The libraries are in `client/internal/clients/shared/`, served at `/shared/`:
Vue 3.5.43, vue3-sfc-loader 0.9.5, appfr 0.56.0
(`header-content-layout-0.56.0/`, shared with admin2), acorn 8.18.0 (parses the
apps' source), circular-json 0.5.9, and the socket.io client that the server
provides. To update one, add the new version's files next to the old ones and
change the paths in `index.html`.

The in-browser compiler has two limits to keep in mind:

- No TypeScript in templates: keep casts and `!` in the script.
- No import cycles, not even through `import type`: the compiler fetches type
  imports too, and two modules importing each other wait on each other forever,
  with a blank page and no error. Shared types go in a module of their own
  (see `src/treatment/tree.ts`).

The page works out the route jtree is served under (`''`, or `/jtree` inside JAS)
from its own address. `?id=…&pwd=…` on the URL are passed to the server when
admin login is required.

### Type checking (optional)

The browser ignores types. To check them, install the dev tools once:

```bash
cd client/internal/clients/admin/ztree
npm install
npm run typecheck
```
