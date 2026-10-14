Download the archive for your system, and unpack it:

- <a href='https://github.com/opowell/jtree/releases/latest/download/jtree-win-x64.zip'>Windows</a> (run `start.cmd`)
- <a href='https://github.com/opowell/jtree/releases/latest/download/jtree-darwin-arm64.tar.gz'>macOS, Apple Silicon (M1 and later)</a> (run `start.command`)
- <a href='https://github.com/opowell/jtree/releases/latest/download/jtree-darwin-x64.tar.gz'>macOS, Intel</a> (run `start.command`)
- <a href='https://github.com/opowell/jtree/releases/latest/download/jtree-linux-x64.tar.gz'>Linux, x86-64</a> (run `start.sh`)
- <a href='https://github.com/opowell/jtree/releases/latest/download/jtree-linux-arm64.tar.gz'>Linux, ARM64</a> (run `start.sh`)
- <a href='https://github.com/opowell/jtree/releases/latest/download/jtree-portable.zip'>Any system with Node.js 22+</a> (run `start.sh` or `start.cmd`)

Older versions (0.8.7 and before) are on the <a href='https://github.com/opowell/jtree/releases'>releases page</a>.

#### What is in the folder

- `start.cmd`, `start.command`, `start.sh`: the launchers. They start jtree's server, with the Node.js that is included.
- `client/apps/`: the apps, queues, z-Tree treatments and oTree apps that jtree can run. Add your own here.
- `client/sessions/`: each session's data, made as sessions run.
- `client/rooms/`: rooms, if you make any (see <a href='tutorial-rooms.html'>Rooms</a>).
- `client/settings.json`: your settings, if you make the file (see <a href='tutorial-settings_.html'>Settings</a>).
- `client/internal/`: the admin interfaces, the participants' pages, these documents and the logs.

#### How it works

jtree is a server. You start it, then connect to it with a web browser, as an administrator or as a participant. Participants need only a browser: on a laptop, desktop, tablet or phone, on any system.

The launcher opens the admin page, `http://localhost:3000/admin/`. If port 3000 is taken, jtree uses the next free one and prints it; set the environment variable `PORT` to start from another port. Participants open `http://<this computer's address>:3000/`, followed by their id (`/P1`, `/P2`, ...). The first time, your system may ask whether jtree may accept connections from the network: allow it, or participants on other computers cannot connect.

From the admin you design apps and run sessions. A session is a series of apps that its participants play in order. An app is a series of stages, repeated for a number of periods.

#### Admin access

With no admin password set, the admin interface only opens on the computer running jtree. To use it from other computers, set a password in `client/settings.json` (create the file if it is not there), then restart jtree:

```json
{ "defaultAdminPwd": "choose-a-password" }
```

Everyone then logs in at `/admin/login`, on this computer too.

#### Three admin interfaces

All three run the same sessions, on the same server; use the one you know best.

- `/admin/`: jtree's admin, with its app editor (see <a href='tutorial-3-running-a-session.html'>Running a Session</a>).
- `/admin/ztree/`: laid out after z-Tree, with its menus, Connection Monitor, tables and treatment editor (see <a href='tutorial-4a-ztree.html'>z-Tree treatments</a>).
- `/admin/otree/`: laid out after oTree's admin, with session configs, rooms, monitor, data and a Studio (see <a href='tutorial-4b-otree.html'>oTree apps</a>).

The previous admin interface is still at `/admin/multiuser/`.
