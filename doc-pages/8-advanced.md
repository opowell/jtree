These tutorials cover advanced topics.

### Technical details
jtree is a `node.js` app, packaged using `pkg`. As such, it uses standard web technologies: Javascript, CSS and HTML. Documentation is written in Markdown, then compiled to HTML using `jsdoc`. Clients and servers communicate via standard web requests and websockets (via `socket.io`).

### Project structure
The jtree project is divided into parts roughly based on its folder structure:

- build-tools:
    - scripts and tools for compiling releases.
- client:
    - files used by clients.
- doc-pages:
    - source files for documentation.
    - written in markdown, compiled to HTML.
- docs:
    - help files to serve on github.io.
- server:
    - the game engine, which puts players through stages.
    - static content server, for serving files.
    - websocket server, for sending and receiving websocket messages.
- vueadmin:
    - source files for the "vue" admin UI.

### Contributing

Anyone is welcome to contribute to the project on Github.
- Submit and comment on issues.
- Edit files directly.
- Submit groups of changes as a pull request.
