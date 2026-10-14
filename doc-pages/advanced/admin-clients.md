jtree has three admin interfaces, each a folder in `client/internal/clients/admin/`, served at `/admin/<folder>/`. They need no build step: jtree serves the folder as it is, and the page compiles its Vue and TypeScript files in the browser. Edit a file and reload the page.

- `v2/`: jtree's admin, also served at `/admin/` (the setting `defaultAdminUI`). See its `README.md`.
- `ztree/`: the z-Tree admin. See its `README.md`.
- `otree/`: the oTree admin. See its `README.md`.
- `multiuser/`: the previous admin.

An admin talks to the server over socket.io messages (`server/source/core/Msgs.js`), and its editors over the editor API (`/api/editor/…`, `server/source/editors/`). Another folder in `client/internal/clients/admin/` is served the same way, so an admin of your own can sit beside these.
