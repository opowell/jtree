// Runs jtree in this process, headless, for tests.
//
// startServer() starts jtree on an HTTP server of its own, on a free port, with a
// throwaway data folder (sessions, logs, settings) so tests leave the repo alone.
// Participants are bots: real socket.io clients sending what the participant page
// sends, while their state is read straight from the server's objects.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { io: ioClient } = require('socket.io-client');

const REPO = path.resolve(__dirname, '../..');
const CLIENT = path.join(REPO, 'client');
const jtree = require(path.join(REPO, 'server/source/jtree.js'));

/** Absolute path of an app in client/apps, e.g. app('1 sample games/public-good.jtt'). */
function app(rel) {
    return path.join(CLIENT, 'apps', rel);
}

/** Resolves once test() is true, checking every few ms; rejects after timeout ms. */
async function until(test, { timeout = 5000, what = 'condition' } = {}) {
    const end = Date.now() + timeout;
    for (;;) {
        const value = test();
        if (value) return value;
        if (Date.now() > end) throw new Error('timed out waiting for ' + what);
        await new Promise(r => setTimeout(r, 5));
    }
}

/**
 * A throwaway data folder for jtree (sessions, logs, settings.json with settings).
 * The interfaces and shared files are read from the repo; everything written goes here.
 * With withApps, the app catalogue is client/apps; without, it is empty.
 * remove() deletes it.
 */
function makeDataDir({ settings = {}, withApps = false } = {}) {
    const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jtree-test-'));
    fs.mkdirSync(path.join(dataDir, 'internal'));
    // A junction on Windows, which needs no admin rights; a symbolic link elsewhere.
    const clientsLink = path.join(dataDir, 'internal/clients');
    fs.symlinkSync(path.join(CLIENT, 'internal/clients'), clientsLink, 'junction');
    fs.copyFileSync(path.join(CLIENT, 'internal/sharedTemplate.js'), path.join(dataDir, 'internal/sharedTemplate.js'));
    fs.writeFileSync(path.join(dataDir, 'settings.json'), JSON.stringify({
        openAdminOnStart: false,
        logToConsole: false,
        autoSaveFreq: 1e9,
        // Written at startup from internal/sharedTemplate.js; keep it out of the repo.
        clientJSFile: 'internal/shared.js',
        appFolders: withApps ? [path.join(CLIENT, 'apps')] : [],
        ...settings,
    }));
    return {
        path: dataDir,
        remove() {
            // Remove the link first, so nothing can delete through it into the repo.
            fs.unlinkSync(clientsLink);
            fs.rmSync(dataDir, { recursive: true, force: true });
        },
    };
}

/** Runs fn with jtree's console logging silenced, unless JTREE_TEST_VERBOSE is set. */
function quietly(fn) {
    if (process.env.JTREE_TEST_VERBOSE) return fn();
    const log = console.log;
    console.log = () => {};
    try {
        return fn();
    } finally {
        console.log = log;
    }
}

/**
 * Starts jtree on an HTTP server of the test's, as JAS hosts it, with a data folder
 * from makeDataDir({ settings, withApps }), removed by close(). Or with data, a data
 * folder from makeDataDir that the test keeps and removes itself, with settings added:
 * to start jtree again on what an earlier one saved.
 */
async function startServer({ settings = {}, withApps = false, data: givenData } = {}) {
    const data = givenData || makeDataDir({ settings, withApps });
    const dataDir = data.path;
    if (givenData) {
        // Settings for this start, over those the folder was made with.
        const file = path.join(dataDir, 'settings.json');
        fs.writeFileSync(file, JSON.stringify({ ...JSON.parse(fs.readFileSync(file, 'utf8')), ...settings }));
    }

    // The server's request listener exists before jtree starts, as a hosting program's does:
    // socket.io, attaching, wraps it, and answers its own requests (e.g. a browser's polling).
    let handle = (req, res) => { res.statusCode = 503; res.end(); };
    const httpServer = http.createServer((req, res) => handle(req, res));
    // jtree logs freely to the console; keep test output readable.
    const log = console.log;
    if (!process.env.JTREE_TEST_VERBOSE) console.log = () => {};
    let jt;
    try {
        jt = jtree.start({ path: dataDir, basePath: '', httpServer });
    } catch (err) {
        console.log = log;
        if (!givenData) data.remove();
        throw err;
    }
    handle = jt.staticServer.expApp;
    // jtree logs errors in processing messages to its log file only; show them, so a test that
    // fails because of one says why.
    const jtLog = jt.log;
    jt.log = function(text, forceConsole) {
        if (/\n\s+at /.test(String(text))) process.stderr.write('jtree logged: ' + text + '\n');
        return jtLog(text, forceConsole);
    };
    await new Promise(r => httpServer.listen(0, '127.0.0.1', r));
    const url = 'http://127.0.0.1:' + httpServer.address().port;

    const sockets = [];

    const server = {
        jt,
        url,
        dataDir,

        /** Writes an app file with code in the data folder; returns its path. */
        writeApp(name, code) {
            const file = path.join(dataDir, 'test-apps', name);
            fs.mkdirSync(path.dirname(file), { recursive: true });
            fs.writeFileSync(file, code);
            return file;
        },

        /** Writes app (a loaded App) as an app description (.app.json); returns its path. */
        writeIR(name, app) {
            return server.writeApp(name + '.app.json', JSON.stringify(app.toIR(), null, 2));
        },

        /** A started session with the given apps (absolute paths) and number of participants. */
        createSession(appPaths, { numParticipants, options } = {}) {
            const session = jt.data.createSession();
            session.resume();
            jt.data.sessions.push(session);
            for (const p of [].concat(appPaths)) {
                const added = session.addApp(p, options);
                if (added == null) throw new Error('could not load app ' + p);
                if (added.hasError) throw new Error('error in app ' + p);
            }
            if (numParticipants != null) session.setNumParticipants(numParticipants);
            return session;
        },

        /** Connects a bot as participant pId of session. */
        async connect(session, pId) {
            const socket = ioClient(url, {
                path: '/socket.io',
                query: { id: pId, type: 'PARTI', sessionId: session.id, roomId: 'null' },
                transports: ['websocket'],
                forceNew: true,
            });
            sockets.push(socket);
            await new Promise((resolve, reject) => {
                const timer = setTimeout(() => reject(new Error(pId + ' was not logged in to session ' + session.id)), 5000);
                socket.once('logged-in', () => { clearTimeout(timer); resolve(); });
                socket.once('connect_error', (err) => { clearTimeout(timer); reject(err); });
            });
            return new Bot(session, pId, socket);
        },

        /** Connects bots for all of session's participants. */
        async connectAll(session) {
            const bots = [];
            for (const pId of Object.keys(session.participants)) {
                bots.push(await server.connect(session, pId));
            }
            return bots;
        },

        async close() {
            for (const s of sockets) s.close();
            await jt.stop();
            // jtree leaves the server it was given running; it is ours.
            const closed = new Promise(r => httpServer.close(r));
            httpServer.closeAllConnections();
            await closed;
            console.log = log;
            if (!givenData) data.remove();
        },
    };
    return server;
}

/** A participant driven by a test. */
class Bot {
    constructor(session, pId, socket) {
        this.session = session;
        this.id = pId;
        this.socket = socket;
        // What this bot has typed into the current stage's form (see fill), and which stage that is.
        this.form = {};
        this.formStage = null;
        // When a stage times out, the server asks the page to submit; it submits what is in
        // its form. Set answersTimeouts to false for a page that does not.
        this.answersTimeouts = true;
        socket.on('endStage', () => {
            if (this.answersTimeouts && this.stageId != null) this.submit();
        });
        // What the server said was wrong with the last submission, by field name.
        this.formErrors = null;
        socket.on('formErrors', (d) => { this.formErrors = d.errors; });
    }

    get participant() {
        return this.session.participant(this.id);
    }

    get player() {
        const p = this.participant;
        return p == null ? null : p.player;
    }

    /** This bot's player in each period of app (the session's first app by default), first period first. */
    players(app = this.session.apps[0]) {
        return app.periods.map(period => {
            for (const g of period.groups) {
                const pl = g.players.find(p => p.participant.id === this.id);
                if (pl) return pl;
            }
            return null;
        });
    }

    /** The id of the stage this bot is playing, or null if it is not playing one. */
    get stageId() {
        const player = this.player;
        return player != null && player.status === 'playing' ? player.stage.id : null;
    }

    /** Waits until this bot is playing the given stage (in the given period, if given). */
    waitForStage(stageId, { period, timeout } = {}) {
        return until(() => this.stageId === stageId &&
                (period == null || this.player.group.period.id === period),
            { timeout, what: this.id + ' to play stage ' + stageId + (period != null ? ' in period ' + period : '') });
    }

    /** Waits until test() is true; resolves to its value. */
    waitFor(test, { timeout, what = 'condition' } = {}) {
        return until(test, { timeout, what: this.id + ': ' + what });
    }

    /** Waits until this bot has finished the session. */
    waitForEnd({ timeout } = {}) {
        return until(() => this.participant.isFinishedSession(), { timeout, what: this.id + ' to finish the session' });
    }

    /** This bot's form for the stage it is playing, emptied when the stage changes. */
    currentForm() {
        const player = this.player;
        if (player == null || player.status !== 'playing') {
            throw new Error(this.id + ' is not playing a stage');
        }
        const key = player.roomId() + '/' + player.stage.id;
        if (this.formStage !== key) {
            this.form = {};
            this.formStage = key;
        }
        return this.form;
    }

    /**
     * Types values into the current stage's form without submitting it, keyed by
     * field name, e.g. { 'player.contribution': 5 }.
     */
    fill(values) {
        Object.assign(this.currentForm(), values);
    }

    /** Submits the current stage's form, with values filled in first, as the participant page does. */
    submit(values = {}) {
        this.fill(values);
        this.formErrors = null;
        const player = this.player;
        const stageId = player.stage.id;
        const data = { ...stringify(this.form), fnName: stageId, playerRoomId: player.roomId() };
        this.socket.emit(stageId, { data });
    }

    /** Waits for stageId, then submits values. */
    async play(stageId, values, opts) {
        await this.waitForStage(stageId, opts);
        this.submit(values);
    }

    /** Waits for the server to refuse the last submission; resolves to its messages by field name. */
    waitForFormErrors({ timeout } = {}) {
        return until(() => this.formErrors, { timeout, what: this.id + "'s form to be refused" });
    }

    /** Sends a custom message, as jt.sendMessage(name, data) does. */
    send(name, data) {
        this.socket.emit(name, { data });
    }
}

// The page sends form values as strings.
function stringify(values) {
    const out = {};
    for (const k in values) out[k] = Array.isArray(values[k]) ? values[k].map(String) : String(values[k]);
    return out;
}

module.exports = { startServer, makeDataDir, quietly, app, until, REPO, CLIENT };
