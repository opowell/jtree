#### Install jtree

1. Download the archive for your computer from <a target='_blank' href='https://opowell.github.io/jtree'>opowell.github.io/jtree</a> (Windows, macOS on Apple Silicon or Intel, Linux on x86-64 or ARM64, or a portable one for any system with Node.js 22+).

2. Unpack it. Node.js is included; nothing needs installing.

#### Start jtree

3. Run the launcher in the unpacked folder: `start.cmd` on Windows, `start.command` on macOS, `start.sh` on Linux. On macOS, the first time, right-click `start.command`, choose Open, and confirm.

4. The admin page opens in your browser, at `http://localhost:3000/admin/`. If port 3000 is taken, jtree uses the next free one and prints it in the launcher's window.

#### Start a new session

5. In the Browse panel, open an app (for example `public-good`, in `1 sample games`), or a queue.

6. In the app's panel, press "New session with this app". The Session panel opens.

7. Under Participants, set the number of participants and press "Set".

8. Press "Start".

<img src="images/admin.png" alt="The admin with a running public goods session: the Session panel, and the Participants panel showing where each participant is" style="max-width: 100%; border: 1px solid #ddd">

Participants open the address the Session panel shows, `http://<this computer's address>:3000/P1` and so on. To try the session on your own, open participants from the Participants panel, or turn Autoplay on. For more, see <a href='tutorial-3-running-a-session.html'>Running a Session</a>.

#### Stop jtree

9. Close the launcher's window (or press Ctrl+C in it).

#### Run your own experiment

10. Put your files in the `client/apps` folder, then use File → Reload apps in the admin (or start jtree again). jtree runs:

    - jtree apps: a `.jtt` file, or a folder with an `app.jtt` (see <a href='tutorial-4-designing-an-app.html'>Designing an App</a>);
    - queues: a `.jtq` file that lists apps to play one after another, an app whose stages are those apps (see <a href='tutorial-queues.html'>Queues</a>);
    - z-Tree treatments and questionnaires: `.ztt`, `.ztq`, or z-Tree's text export (see <a href='tutorial-4a-ztree.html'>z-Tree treatments</a>);
    - oTree apps and projects: a folder with oTree's `__init__.py` (or `models.py`), or a project with its `settings.py` (see <a href='tutorial-4b-otree.html'>oTree apps</a>).
