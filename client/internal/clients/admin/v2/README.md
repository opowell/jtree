# admin2

jtree's admin interface, served at `/admin/` (and `/admin/v2/`) under jtree's route, built on
[appfr](https://github.com/opowell/appfr) (`header-content-layout`): a menu bar
over a window of rearrangeable panels, with the lists in those panels drawn by
appfr's `DataShell`.

It talks to the server over the same socket.io messages as the previous
interface (`server/source/core/Msgs.js`), and needs no server changes.

## Panels

| Panel | What it is |
| --- | --- |
| Browse | Every session, participant, app (queues included) and log entry, searchable and filterable. Its query is in the address bar, so a view is a link. Opening a row opens it in its own panel. |
| Session | The open session: start, pause/resume, advance slowest, reset, download output, delete; its apps; participant count, autoplay, login options. |
| Participants | The open session's participants, live: app, period, group, stage, clients, points, state. Opening one shows its page in Participant views. |
| Participant views | Each chosen participant's own page, side by side, with autoplay and reload per view. |
| App | One per app opened: details, and starting a session from it or adding it to the open one. A queue is an app made of other apps, and its panel lists them. |
| Log | Messages sent and received in this browser. |
| Settings | Theme, layout reset, and the server's settings (read-only). |

Panels can be dragged into tabs, splits and floating windows. The layout, theme
and open panels are saved in the browser; **Window → Reset layout** restores
the default.

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
Vue 3.5.43 (`vue-3.5.43/`), vue3-sfc-loader 0.9.5, appfr 0.43.0
(`header-content-layout-0.43.0/`, the `dist/` of appfr commit
`06c71e0a7e872ec6b0e527c3958b8de544660398`), circular-json 0.5.9, and the
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
