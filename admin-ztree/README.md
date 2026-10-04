# admin-ztree

An admin interface for jtree laid out after [z-Tree](https://www.ztree.uzh.ch/en.html),
built on [appfr](https://github.com/opowell/appfr) (`header-content-layout`): one
main window with z-Tree's menu bar (File, Edit, Treatment, Run, Tools, View, ?)
over a grey desktop of child windows. It follows the
[z-Tree 5.1 manual](https://www.ztree.uzh.ch/static/doc/manual.pdf), chiefly
chapters 2.5–2.6 (testing a treatment), 5 (conducting a session) and 8 (menu commands).

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

## Windows

- **Treatment windows** (File → Open…, New Treatment): the stage tree, parsed
  from the app's source. Double-click (or Treatment → Info…) opens an element's
  dialog: General Parameters, Stage, Program, Screen, Item, Table. Treatment →
  New Stage…, New Program…, and Edit → Cut/Copy/Paste change the source. Edits
  stay in the window until File → Save writes the file on the server.
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

What jtree has no counterpart for (questionnaires, parameter table, matching
menu, GameSafe, the data tools, …) is shown greyed out, as z-Tree greys out what
cannot be done.

## Server support

Three messages were added to `server/source/core/Msgs.js` for this interface:
`startTreatment` (start an app for some clients mid-session), `leaveStage`
(per-subject leave stage) and `setStopAfterPeriod` (checked in
`App.getNextPeriod`). Restart the jtree server after updating.

## Running

```bash
cd admin-ztree
pnpm i

# Against a jtree server on localhost:3000 (start it as in the main README):
pnpm dev                                   # http://localhost:5173/admin/ztree/
JTREE_SERVER=http://host:port JTREE_BASE=/jtree pnpm dev   # another server, or jtree inside JAS

# Build into client/internal/clients/admin/ztree, served by jtree at <route>/admin/ztree/
pnpm build
```

The page works out the route jtree is served under (`''`, or `/jtree` inside JAS)
from its own address. The jtree server finds admin interfaces when it starts, so
restart it after the first build. `?id=…&pwd=…` on the URL are passed to the
server when admin login is required.

The window arrangement, toolbar and status bar choices, recent files and client
order are kept in the browser.
