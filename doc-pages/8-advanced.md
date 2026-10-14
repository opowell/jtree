These tutorials cover advanced topics.

### Technical details
jtree is a Node.js server (Node.js 22 or later), which runs as an app on [JAS](https://github.com/opowell/jas). The downloads include Node.js and JAS, and their launchers start JAS with jtree as its default app. Clients and the server talk over standard web requests and websockets (socket.io 4). The admin interfaces are Vue 3 single-file components, compiled in the browser, with no build step. The participants' pages use Vue 2.7 and jQuery 3. oTree apps' Python runs in Pyodide, inside the server.

Documentation is written in Markdown (`doc-pages/`), and compiled to HTML with `jsdoc`, together with the reference from the server's comments.

### Project structure

- `apps/jtree/`: the JAS app, which starts jtree's server with `client/` as its data folder.
- `vendor/jas/`: JAS (a git submodule).
- `start.sh`, `start.command`, `start.cmd`: the launchers.
- `client/`: jtree's data folder.
    - `apps/`: experiment apps, queues, z-Tree treatments and oTree apps.
    - `sessions/`, `rooms/`, `settings.json`.
    - `internal/clients/admin/v2/`: the admin interface, at `/admin/`.
    - `internal/clients/admin/ztree/`: the z-Tree admin, at `/admin/ztree/`.
    - `internal/clients/admin/otree/`: the oTree admin, at `/admin/otree/`.
    - `internal/clients/participant/`: participants' pages.
    - `internal/docs/`: this documentation, as HTML.
- `server/source/`: the server.
    - the game engine (`Session`, `App`, `Period`, `Stage`, `Group`, `Player`, ...), which puts participants through stages;
    - `core/`: the static file server, the websocket server and its messages (`Msgs.js`), settings and data;
    - `dialects/`: how jtree reads and runs apps: jtree's, z-Tree's (`ztree/`) and oTree's (`otree/`), and the converters;
    - `editors/`: what the three app editors ask the server (`/api/editor/<jtree, ztree or otree>/…`);
    - `exporters/`: the formats a session's data downloads in.
- `server/test/`: the tests.
- `doc-pages/`: these documents, in Markdown. `docs/`: the website, opowell.github.io/jtree, with a copy of the HTML in `docs/reference/`.
- `build-tools/`: building releases and documentation.

### Running from source

```sh
git clone --recurse-submodules https://github.com/opowell/jtree.git
cd jtree
./start.sh          # macOS, Linux
start.cmd           REM Windows
```

Or without JAS: `cd server && pnpm i`, then `cd ../client && node ../server/source/jtree.js`.

### Tests

`cd server && pnpm test`. The tests start jtree with a throwaway data folder and play apps with bots; where Chrome is installed, some also play in browsers. They run on every push.

### Building the documentation

From the repository's folder: `npx jsdoc@4.0.4 -c build-tools/jsdoc-config.json`, which writes `client/internal/docs/`; then copy it to `docs/reference/` for the website (`build-tools/linux/buildDocs.sh` does both).

### Contributing

Anyone is welcome to contribute to the project. Either edit files directly on Github, or submit groups of changes as a pull request. Changes that users can see go into the documentation too.
