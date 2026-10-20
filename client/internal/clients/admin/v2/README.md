# admin2

jtree's admin interface, served at `/admin/` (and `/admin/v2/`) under jtree's route, built on
[appfr](https://github.com/opowell/appfr) (`header-content-layout`): a menu bar
over a window of rearrangeable panels, with the lists in those panels drawn by
appfr's `DataShell`.

It talks to the server over the same socket.io messages as the previous
interface (`server/source/core/Msgs.js`), and, for its app editor, to the
server's editor API (`/api/editor/jtree/…`, `server/source/editors/`).

## Panels

| Panel | What it is |
| --- | --- |
| Browse | Every session, participant, app (queues included) and log entry, searchable, filterable and sorted by any column's heading. Its query is in the address bar, so a view is a link. Opening a row opens it in its own panel. An app's Kind and File (`appKind`, `appFile` in `schema.ts`) say what it is in its own program's words; apps whose `listed` is false are left out unless the Unlisted filter is on (`source.ts`). |
| Session | The open session (a new one opens in this panel, in a window of its own beside what was open): start, pause/resume, advance slowest, reset, download output, delete; its apps; participant count, autoplay, login options. |
| Participants | The open session's participants, live: app, period, group, stage, clients, points, state. Opening one shows its page in Participant views. |
| Participant views | Each chosen participant's own page, side by side, with autoplay and reload per view. |
| App | One per app opened: details, and starting a session from it or adding it to the open one. A queue is an app made of other apps, and its panel lists them. Edit opens a jtree app in the app editor; z-Tree treatments and oTree apps link to the editors in their admins. |
| App editor | jtree's own editor for a `.jtt` app (an app's Edit, or File → New app…), in three modes. **Structured** (`AppTree.vue`): the app as a tree, as z-Tree shows a treatment: stages, their screens and the elements on them, and functions; what is chosen is changed beside it (settings, an element's text, fields and attributes in `ElementInspector.vue`, with a preview); Add… puts in stages, screens, functions and elements (`elements.ts`'s palette); elements are dragged (before, after or into others, to other screens and stages; with Ctrl or Alt, or from another app's editor, copied), moved (Alt+↑/↓), duplicated, copied, cut, pasted and deleted, and stages dragged into another order. **Forms**: a page per part: settings, functions, each stage (its screens, settings and functions), other code. **Source**: the whole file. Code (functions, screens, a script's or style's text, an element's HTML, Source) is edited in `CodeEditor.vue`, CodeMirror with `v-model`; plain text stays a textarea. Each change is made in the source by the server (`server/source/editors/jtree.js`, screens' HTML in `html.js`), which changes only the statement, or the element, it is about; every change is a named step of a history: Undo/Redo (Ctrl+Z, Ctrl+Shift+Z) go through it, choosing again what was chosen at each step, and the History list goes to any step, and Save (Ctrl+S) writes the file. |
| Log | Messages sent and received in this browser. |
| Settings | Theme, layout reset, and the server's settings (read-only). |

Panels can be dragged into tabs, splits and floating windows. The open panels
and their arrangement are in the address bar (`?w=…`, appfr's `useLayoutRoute`,
sharing Browse's address-bar adapter in `workspace.ts`), so a reload keeps them
and a link opens them as they were. They are also saved in the browser, with the
theme, for an address without `w`; **Window → Reset layout** restores the
default. The outermost space draws no bar or border (appfr's `rootBar` off), so
the panels sit straight in the window; how it is shown (row, column, tabs or
desktop) is **Window → Arrange**, appfr's `rootMenu`. The panels in the table above
are opened and closed from the **Panels** menu. The **Window** menu lists the windows: what
that outermost space holds (`topWindows` in `workspace.ts`), each named for the panels in it,
and brings the one chosen to the front. A new session opens in a window of its own beside
what was open (`showNewSession`): the outermost space becomes a strip of windows, drawn
without a bar, which the Window menu switches between. Each window is a pane or a grid of
its own, which keeps its own bar and tabs in that strip, and Arrange is appfr's `rootMenu`
for it as for any root (both appfr 0.59.0). A strip left holding one window is that window
again. The default's splits draw no bar (`headless`), and appfr keeps such a
space when its last panel goes, so `workspace.ts` drops an empty one from the
layout rather than leave a blank box where it was; and a split left holding one
thing is that thing, rather than a border drawn around a border around it. A panel's ⋯ menu pops it out to a browser window holding it alone
(`?solo`), and closes it here. A pane of tabs has **Close all** in that menu too,
which closes every tab on it that has a close button.

## Running and editing

There is no install or build step. jtree serves this folder as it is, and the
page compiles `src/` (TypeScript and Vue single-file components) in the browser
with [vue3-sfc-loader](https://github.com/FranckFreiburger/vue3-sfc-loader).
Edit a file and reload the page. Compiled modules are kept in the browser's
localStorage, keyed by their source, so unchanged files are not compiled again.

| File | What it does |
| --- | --- |
| `index.html` | The page: loads the libraries and `boot.js`, and writes the import map |
| `boot.js` | Loads `src/App.vue` through vue3-sfc-loader and mounts it |
| `src/` | The interface |

The libraries are in `client/internal/clients/shared/`, served at `/shared/`:
Vue 3.5.43 (`vue-3.5.43/`), vue3-sfc-loader 0.9.5, appfr 0.59.0
(`header-content-layout-0.59.0/`, the `dist/` of appfr commit
`f5862d984dc5a88eea07d50fa691ca8c497a022c`), CodeMirror 6 (`codemirror-6.43.14/`,
built by `build-tools/codemirror/`), circular-json 0.5.9, and the
socket.io client that the server provides. To update one, add the new version's
files next to the old ones and change the paths in `index.html`.

The in-browser compiler handles TypeScript in `<script lang="ts">` and `.ts`
files, but not in templates: keep casts such as `as HTMLInputElement` in the
script (see `checked()` in `SessionPanel.vue`). Imports of `.ts` files leave out
the extension.

### Type checking (optional)

The browser ignores types. To check them, install the dev tools once:

```bash
cd client/internal/clients/admin/v2
npm install
npm run typecheck
```
