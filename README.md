## Getting started
Download for your system, unzip and run.

Latest version (2020.02.14): **0.8.7**

<a href='https://github.com/opowell/jtree/releases/latest/download/jtree-0.8.7-win.zip'>jtree for Windows</a>

<a href='https://github.com/opowell/jtree/releases/latest/download/jtree-0.8.7-macos.zip'>jtree for Mac</a>

<a href='https://github.com/opowell/jtree/releases/latest/download/jtree-0.8.7-linux.zip'>jtree for Linux</a>

<a href='https://github.com/opowell/jtree/releases/latest/download/jtree-0.8.7-winxp.zip'>jtree for WindowsXP</a>

![](double-auction.png)

![](adminUI.png)

#### Features
- functions, objects.
- subjects not required to run separate program / use Windows.
- server runs natively on Windows, MacOS and Linux.
- autoplay for testing.
- treatment options: facilitate switching between important parameter configurations of a treatment.
- session queues: save sequences of treatments (including their options) for re-use.

#### <a href='https://opowell.github.io/jtree/reference/tutorial-1-quick-start.html'>Quick start</a>

#### <a href='https://opowell.github.io/jtree/reference/tutorial-2-setup.html'>Setup</a>

#### <a href='https://opowell.github.io/jtree/reference/tutorial-3-running-a-session.html'>Running a session</a>

#### <a href='https://opowell.github.io/jtree/reference/tutorial-4-designing-an-app.html'>Designing an app</a>

#### <a href='https://opowell.github.io/jtree/reference/tutorial-7-release-notes.html'>Release notes</a>

#### <a href='https://opowell.github.io/jtree/reference/index.html'>Reference</a>

<a href='https://opowell.github.io/jtree'>opowell.github.io/jtree</a>

#### USER EXPERIMENTS
<a href='https://www.github.com/opowell/1natalia'>1natalia (University of Vienna, Ural Federal University)</a><br>
<a href='https://www.github.com/opowell/2peter'>2peter (Vienna University of Economics and Business)</a><br>
<a href='https://www.github.com/opowell/3james'>3james (University of Vienna, Vienna University of Economics and Business)</a><br>
<a href='https://www.github.com/opowell/5mariana'>5mariana (Vienna University of Economics and Business)</a><br>
<a href='https://www.github.com/opowell/6maxtom'>6maxtom (Vienna University of Economics and Business)</a><br>
<a href='https://www.github.com/opowell/7simone'>7simone (Vienna University of Economics and Business)</a><br>
<a href='https://www.github.com/opowell/8jelena'>8jelena (Vienna University of Economics and Business)</a><br>
<a href='https://www.github.com/opowell/9natalia'>9natalia (University of Vienna)</a><br>
<a href='https://www.github.com/opowell/10ali'>10ali (Vienna University of Economics and Business)</a><br>
<a href='https://www.github.com/opowell/11simone'>11simone (Vienna University of Economics and Business)</a><br>

#### Run with JAS
jtree runs as an app on [JAS](https://github.com/opowell/jas), which is included as a submodule in `vendor/jas`. You need [Node.js](https://nodejs.org) 22 or later and git.

```sh
git clone --recurse-submodules https://github.com/opowell/jtree.git
cd jtree
./start.sh          # macOS, Linux
start.cmd           REM Windows
```

Open http://localhost:3000/jtree/admin. Set `PORT` to use a different port. On the first run the launcher fetches the submodule if it is missing, and installs the server dependencies (`server/node_modules`) with pnpm, or npm if pnpm is not installed.

| Path | What it is |
| --- | --- |
| `apps/jtree/` | The JAS app: `server.js` starts jtree's server (`server/source/jtree.js`) on the server JAS owns, with `client/` as its data folder |
| `vendor/jas/` | JAS (submodule) |
| `start.sh`, `start.cmd` | Run JAS on this repo's `apps/` folder |

Everything jtree serves is under one route, `/jtree` by default: the admin (`/jtree/admin`), participant links (`/jtree/P1`, `/jtree/session/<id>/P1`), shared files and socket.io (`/jtree/socket.io`). HTML pages, experiment apps' stages included, are written with root-absolute URLs (`src="/shared/..."`), and jtree rewrites them to that route as it serves them. So jtree can sit beside other apps in any JAS:

```sh
ln -s "$PWD/apps/jtree" /path/to/jas/apps/jtree
```

Link it rather than copy it, since `server.js` loads jtree from this repo. Restart that JAS afterwards, because JAS loads an app's `server.js` only at startup. This needs a JAS with per-app routes; an older one serves it at `/<folder name>` anyway.

To change the route, set `route` in [apps/jtree/settings.json](apps/jtree/settings.json), e.g. `"route": "/lab"`. Running jtree without JAS (see Development below), set `basePath` in `client/settings.json` instead; it defaults to `/jtree`, and `""` serves jtree at the root as before.

#### Development
1. Clone project.
2. Install server files.
   1. cd server
   2. pnpm i
3. Start server
   1. cd client
   2. node ../server/source/jtree.js

