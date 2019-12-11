const fs = require('fs-extra');
const Utils = require('../Utils.js');
const path = require('path');
const Session = require('../Session.js');
const App = require('../App.js');
const Room = require('../Room.js');
const Queue = require('../Queue.js');
const User = require('../User.js');
const StackTracey = require('stacktracey');

/** The data object. */
class Data {

    /*
     * FUNCTIONALITY
     * - initialize fields
     * - commence storing time information {@link Data#storeTimeInfo}.
     * @param  {Object} jt The server.
     */
    constructor(jt) {

        /*
         * The server.
         * @type Object
         */
        this.jt = jt;
        jt.data = this;

        this.lastOpenedSession = null;

        /*
         * The last time the server was on, {@link Data#loadLastTimeOn}.
         * @type number
         */
        this.lastTimeOn = this.loadLastTimeOn();

                /*
         * The list of available apps, loaded from the contents of the {@link Settings#appsFolder} folder.
         * @type Object
         */

        this.reloadApps();

        /*
         * Available [Sessions]{@link Session}, loaded from the contents of the 'sessions' folder.
         * Sorted in ascending order according to time created.
         * @type Array of {@link Session}.
         */
        this.sessions = [];
        if (jt.settings.loadSessions) {
            this.sessions = this.loadSessions();
        }

        this.rooms = this.loadRooms();

        this.users = this.loadUsers();

        this.storeTimeInfo();

        // Participant clients with no session IDs.
        // Reload them when a new session is opened.
        this.participantClients = [];

    }

    /*
     * Set a timeout to write the time info {@link Data#storeTimeInfo}. Timeout length is {@link Settings#autoSaveFreq} milliseconds.
     *
     * CALLED FROM
     * - {@link Data#storeTimeInfo}
     *
     */
    callStoreTimeInfoFunc() {
        setTimeout(this.storeTimeInfo.bind(this), this.jt.settings.autoSaveFreq);
    }

    /*
     * getMostRecentActiveSession -
     *
     * CALLED FROM:
     * - {@link StaticServer.sendClientPage}.
     *
     * @return {Session|null}  The session, or null if none exists.
     */
    getMostRecentActiveSession() {
        if (this.lastOpenedSession !== null) {
            return this.lastOpenedSession;
        }
        for (var i = this.sessions.length - 1; i >= 0; i--) {
            if (this.sessions[i].active === true) {
                return this.sessions[i];
            }
        }
        return null;
    }

    sessionsForUser(userId) {
        var out = [];
        for (var i in this.sessions) {
            var session = this.sessions[i];
            if (session.canUserManage(userId)) {
                out.push(session.shell());
            }
        }
        return out;
    }

    getClients(sessionId) {
        let out = [];
        let session = this.getSession(sessionId);
        if (sessionId != null) {
            if (session != null) {
                for (let i=0; i<session.clients.length; i++) {
                    out.push(session.clients[i].toShell());
                }
            }
        } else {
            for (let i in this.participantClients) {
                out.push(this.participantClients[i].shell());
            }
        }
        return out;
    }

    /*
     * FUNCTIONALITY
     * write current time to disk
     * set timeout for next write {@link Data#callStoreTimeInfoFunc}.
     *
     * CALLED FROM:
     * - [Data()]{@link Data}
     * - {@link Data#callStoreTimeInfoFunc}
     *
     */
    storeTimeInfo() {
        var fn = path.join(this.jt.path, this.jt.settings.serverTimeInfoFilename);
        var now = Date.now();
        fs.writeJSON(fn, now, this.callStoreTimeInfoFunc.bind(this));
    }

    app(id, options) {
        if (this.jt.settings.reloadApps) {
            var appPath = this.appsMetaData[id].appPath;
            return this.loadApp(id, null, appPath, options);
        } else {
            return this.apps[id];
        }
    }
    
    loadApp(id, session, appPath, options) {
        var app = null;
        app = new App.new(session, this.jt, appPath);
        app.givenOptions = options;
     //   app.shortId = id;

        // Set options before running code.
         for (var i in options) {
            app.setOptionValue(i, options[i]);
        }

        let filePath = appPath;
        if (!fs.existsSync(appPath) && session.queuePath != null) {
            filePath = path.join(session.queuePath, appPath);
        }

        try {
            app.appjs = fs.readFileSync(filePath) + '';
            if (app.appjs.startsWith('//NOTSTANDALONEAPP')) {
                return null;
            }
            eval(app.appjs); // jshint ignore:line
            this.jt.log('loaded app ' + filePath);
        } catch (err) {
            if (
                !filePath.endsWith('.jtt')
            ) {
                return null;
            }
            if (app.isStandaloneApp) {
                app.hasError = true;
                let stack = new StackTracey (err);
                this.jt.log('Error loading app: ' + filePath, true);
                this.jt.log(err, true);
                let lines = err.stack.split('\n');
                let index = lines[1].indexOf('<anonymous>:');
                let position = lines[1].substring(index + '<anonymous>:'.length);
                let start = 0;
                let indexColon = position.indexOf(':', start);
                let line = position.substring(start, indexColon);
                start = start + indexColon + 1;
                let indexParen = position.indexOf(')', start);
                let positionStr = position.substring(start, indexParen);
                if (isNaN(line)) {
                    line = 'unknown';
                }
                if (isNaN(positionStr)) {
                    positionStr = 'unknown';
                }
                this.jt.log('Line ' + line + ', position ' + positionStr, true);
                app.errorLine = line;
                app.errorPosition = positionStr;
            }
        }
        return app;
    }

    getAppsFromDir(dir) {
        var out = [];
        if (Utils.isDirectory(dir)) {
            var appDirContents = fs.readdirSync(dir);
            for (var i in appDirContents) {
                var curPath = path.join(dir, appDirContents[i]);
                var curPathIsFile = fs.lstatSync(curPath).isFile();
                var curPathIsFolder = fs.lstatSync(curPath).isDirectory();
                if (curPathIsFile) {
                    console.log('check queue: ' + id);

                    var id = appDirContents[i];

                    let isApp = false;
                    // Treatment / App
                    if (id == 'app.js' || id == 'app.jtt') {
                        isApp = true;
                        // Take id from path name.
                        if (dir.lastIndexOf('/') > -1) {
                            id = dir.substring(dir.lastIndexOf('/') + 1);
                        } else if (dir.lastIndexOf('\\') > -1) {
                            id = dir.substring(dir.lastIndexOf('\\') + 1);
                        }
                    }
                    if (id.endsWith('.js')) {
                        isApp = true;
                        id = id.substring(0, id.length - '.js'.length);
                    } else if (id.endsWith('.jtt')) {
                        isApp = true;
                        id = id.substring(0, id.length - '.jtt'.length);
                    }
                    if (isApp) {
                        let app = this.loadApp(id, null, curPath, {});
                        if (app != null) {
                            // this.apps[id] = app;
                            // this.appsMetaData[id] = app.metaData();
                            out.push(app);
                        }
                    }

                    // Queue / Session Config
                    if (id.endsWith('.jtq')) {
                        id = id.substring(0, id.indexOf('.jtq'));
                        var queue = Queue.loadJTQ(id, this.jt, curPath);
                        console.log('loading queue ' + queue.id);
                        out.push(queue);
                    }
                } else if (curPathIsFolder) {
                    out = out.concat(this.getAppsFromDir(curPath));
                }
            }
        }
        return out;
    }

    // Search for *.js and *.jtt files. Load as apps.
    // Search folders.
    loadAppDir(dir) {
        if (Utils.isDirectory(dir)) {
            var appDirContents = fs.readdirSync(dir);

            // Load individual apps and queues.
            for (var i in appDirContents) {
                var curPath = path.join(dir, appDirContents[i]);
                var curPathIsFile = fs.lstatSync(curPath).isFile();
                var curPathIsFolder = fs.lstatSync(curPath).isDirectory();
                if (curPathIsFile) {
                    var id = appDirContents[i];

                    let isApp = false;
                    // Treatment / App
                    if (id == 'app.js' || id == 'app.jtt') {
                        isApp = true;
                        // Take id from path name.
                        if (dir.lastIndexOf('/') > -1) {
                            id = dir.substring(dir.lastIndexOf('/') + 1);
                        } else if (dir.lastIndexOf('\\') > -1) {
                            id = dir.substring(dir.lastIndexOf('\\') + 1);
                        }
                    }
                    if (id.endsWith('.js')) {
                        isApp = true;
                        id = id.substring(0, id.length - '.js'.length);
                    } else if (id.endsWith('.jtt')) {
                        isApp = true;
                        id = id.substring(0, id.length - '.jtt'.length);
                    }
                    if (isApp) {
                        let app = this.loadApp(id, {}, curPath, {});
                        if (app != null) {
                            this.apps[curPath] = app;
                            this.appsMetaData[curPath] = app.metaData();
                        }
                    }

                    // Queue / Session Config
                    if (id.endsWith('.jtq')) {
                        var queue = Queue.loadJTQ(curPath, this.jt, dir);
                        queue.dummy = true;
                        var session = new Session.new(this.jt, null);
                        session.emitMessages = false;
                        session.queuePath = path.dirname(queue.id);
                        eval(queue.code);
                        session.setNumParticipants(session.suggestedNumParticipants);
                        let options = {};
                        for (let i in session.apps) {
                            queue.addApp(session.apps[i].id, options);
                        }
                        queue.options = session.options;
                        queue.optionValues = session.optionValues;
                        // queue.apps = session.apps;
                        this.jt.log('loading file queue ' + curPath + ' with ' + queue.apps.length + ' apps');
                        this.queues[curPath] = queue;
                    }
                } else if (curPathIsFolder) {
                    this.loadAppDir(curPath);
                }
            }

        }
    }

    saveRoom(room) {
        this.deleteRoom(room.originalId);
        var newRoom = new Room.new(room.id, this.jt);
        newRoom.displayName = room.displayName;
        newRoom.labels = room.labels;
        newRoom.useSecureURLs = room.useSecureURLs;
        this.createRoomFromRoom(newRoom);
    }

    deleteQueue(id) {
        try {
            fs.removeSync(this.queuePath(id));
            for (var i in this.queues) {
                if (this.queues[i].id === id) {
                    this.queues.splice(i, 1);
                    break;
                }
            }
        } catch (err) {

        }
    }

    deleteApp(id) {
        try {
            if (!id.startsWith(this.jt.path)) {
                id = this.appPath(id);                
            }
            fs.removeSync(id);
            delete this.apps[id];
            delete this.appsMetaData[id];
        } catch (err) {
            this.jt.log(err);
        }
    }

    deleteRoom(id) {
        try {
            fs.removeSync(this.roomPath(id));
            for (var i in this.rooms) {
                if (this.rooms[i].id === id) {
                    this.rooms.splice(i, 1);
                    break;
                }
            }
        } catch (err) {

        }
    }

    getApp(appPath, options) {
        var app = App.newSansId(this.jt, appPath);

        // Set options before running code.
        for (var i in options) {
            app.setOptionValue(i, options[i]);
        }

        try {
            app.appjs = fs.readFileSync(appPath) + '';
            eval(app.appjs); // jshint ignore:line
        } catch (err) {
            this.jt.log('Error loading app: ' + appPath);
            this.jt.log(err);
            app = null;
        }
        return app;
    }

    reloadApps() {
        this.apps = {};
        this.appsMetaData = {};
        this.queues = [];
        this.loadApps();
    }

    loadApps() {
        for (var i in this.jt.settings.appFolders) {
            var folder = this.jt.settings.appFolders[i];
            this.loadAppDir(path.join(this.jt.path, folder));
        }
    }

    /*
     * loadSessions - description
     *
     * CALLED FROM:
     * - {@link Data.constructor}.
     *
     * @return {type}  Array of sessions.
     */
    loadSessions() {
        var out = [];

        const sessPath = path.join(this.jt.path, this.jt.settings.sessionsFolder);
        fs.ensureDirSync(sessPath);

        var dirContents = fs.readdirSync(sessPath);
        for (var i in dirContents) {
            try {
                var folder = dirContents[i];
                var session = this.loadSession(folder);
                if (session !== null) {
                    out.push(session);
                } else {
                    var pathToFolder = path.join(this.jt.path, this.jt.settings.sessionsFolder + '/' + folder + '/');
                    var contents = fs.readdirSync(pathToFolder);
                    if (contents.length === 0) {
                        console.log('completing delete of session ' + folder);
                        fs.removeSync(pathToFolder);
                    }
                }
            } catch (err) {
                jt.log(err);
            }
        }
        return out;
    }

    roomPath(id) {
        return path.join(this.roomsPath(), id);
    }

    userPath(id) {
        return path.join(this.usersPath(), id + '.json');
    }

    queuePath(id) {
        return path.join(this.jt.path, this.jt.settings.appFolders[0], id);
    }

    roomsPath() {
        return path.join(this.jt.path, this.jt.settings.roomsPath);
    }

    usersPath() {
        return path.join(this.jt.path, this.jt.settings.usersPath);
    }

    room(id) {
        return Utils.findByIdWOJQ(this.rooms, id);
    }

    queue(id) {
        return Utils.findByIdWOJQ(this.queues, id);
    }

    loadRooms() {
        var out = [];
        var fullPath = this.roomsPath();

        if (Utils.isDirectory(fullPath)) {
            var dirContents = fs.readdirSync(fullPath);
            for (var i in dirContents) {
                try {
                    var id = dirContents[i];
                    var room = Room.load(this.roomPath(id), id, this.jt);
                    out.push(room);
                } catch (err) {
                    console.log(err);
                }
            }
        }

        return out;
    }

    loadUsers() {
        var out = [];
        var fullPath = this.usersPath();

        if (Utils.isDirectory(fullPath)) {
            var dirContents = fs.readdirSync(fullPath);
            for (var i in dirContents) {
                try {
                    var id = dirContents[i];
                    var user = User.load(this.usersPath(), id, this.jt);
                    out.push(user);
                } catch (err) {
                    console.log(err);
                }
            }
        }

        return out;
    }

    loadQueues() {
        var out = [];
        var fullPath = this.queuesPath();

        if (Utils.isDirectory(fullPath)) {
            var dirContents = fs.readdirSync(fullPath);
            for (var i in dirContents) {
                try {
                    var id = dirContents[i];
                    id = id.substring(0, id.indexOf('.json'));
                    var queue = Queue.load(this.queuePath(id), id, this.jt);
                    out.push(queue);
                } catch (err) {
                    console.log(err);
                }
            }
        }

        return out;
    }

    createQueue(id) {
        // If already exists, return null.
        if (fs.existsSync(this.queuePath(id))) {
            return null;
        }

        var queue = new Queue.new(id, this.jt);

        try {
            fs.mkdirSync(this.queuesPath());
        } catch (err) {}

        queue.save();

        this.queues.push(queue);

        return queue;
    }

    createRoom(id) {
        // If already exists, return null.
        if (fs.existsSync(this.roomPath(id))) {
            return null;
        }

        var room = new Room.new(id, this.jt);
        this.createRoomFromRoom(room);
        return room;
    }

    createUser(id, type) {
        // If already exists, return null.
        if (fs.existsSync(this.userPath(id))) {
            return null;
        }

        var user = new User.new(id, this.jt);
        user.type = type;

        fs.ensureDirSync(this.usersPath());
        Utils.writeJSON(this.userPath(user.id), user.shell());
        return user;
    }

    user(id) {
        for (var i in this.users) {
            var user = this.users[i];
            if (user.id === id) {
                return user;
            }
        }
        return null;
    }

    appPath(id) {
        return path.join(this.jt.path, 'apps/' + id);
    }

    createApp(id) {
        if (fs.existsSync(this.appPath(id))) {
            return null;
        }

        var session = null;
        var appPath = this.appPath(id);
        var app = new App.new(session, this.jt, appPath);

        fs.writeFileSync(this.appPath(id), '');

        this.apps[app.id] = app;
        this.appsMetaData[app.id] = app.metaData();

        return app.metaData();
    }

    createRoomFromRoom(room) {
        try {
            fs.mkdirSync(this.roomPath(room.id));
        } catch (err) {}

        try {
            var config = {};
            config.displayName = room.displayName;
            config.useSecureURLs = room.useSecureURLs;
            Utils.writeJSON(path.join(this.roomPath(room.id), 'room.json'), config);
        } catch (err) {}

        try {
            for (var i in room.labels) {
                var label = room.labels[i].trim();
                // After removing leading and trailing white space, must have length > 0
                if (label.length > 0) {
                    fs.appendFileSync(path.join(this.roomPath(room.id), 'labels.txt'), label + '\n');
                }
            }
        } catch (err) {}

        try {
            room.genHashes();
        } catch (err) {}

        this.rooms.push(room);
    }

    loadSession(folder) {
        var out = null;
        try {
            var pathToFolder = path.join(this.jt.path, this.jt.settings.sessionsFolder + '/' + folder + '/');
            this.jt.log('loading session: ' + folder);
            if (folder !== null && fs.lstatSync(pathToFolder).isDirectory()) {
                out = Session.load(this.jt, folder, this);
            }
        } catch (err) {
            console.log('error loading session WS: ' + folder);
            //        console.log(err);
        }
        return out;
    }

    loadLastTimeOn() {
        var out = Date.now();
        try {
            out = fs.readJSONSync(this.js.settings.serverTimeInfoFilename);
        } catch (err) {}
        this.jt.log("last time on: " + out);
        return out;
    }

    getActiveSession(sessionId) {
        var session = null;
        if (sessionId == null || sessionId == undefined) {
            // return first active session
            for (var i in this.sessions) {
                if (this.sessions[i].active === true) {
                    session = this.sessions[i];
                    break;
                }
            }
        } else {
            session = this.getSession(sessionId);
        }
        return session;
    }

    getSession(sessionId) {
        return Utils.findByIdWOJQ(this.sessions, sessionId);
    }

    /*
     * createSession - description
     *
     * CALLED FROM:
     * - {@link Data#constructor}.
     *
     * @param  {type} save   description
     * @param  {type} active description
     * @return {Session}        description
     */
    createSession(userId) {
        var session = new Session.new(this.jt, null);
        session.setNumParticipants(session.suggestedNumParticipants);
        if (userId != null && userId.length > 0) {
            session.addUser(userId);
        }
        session.save();
        this.jt.socketServer.emitToAdmins('addSession', session.shell());
        return session;
    }

    getAdmin(id, pwd) {
        if (id === null || id === 'null') {
            return null;
        }
        var admin = this.jt.settings.admins[id];
        if (admin !== null && admin !== undefined) {
            // If password required and does not match, then do not log in.
            if (admin.pwd !== null && admin.pwd !== pwd) {
                admin = null;
            }
        }
        return admin;
    }

    session(id) {
        return Utils.findByIdWOJQ(this.sessions, id);
    }

    isValidAdmin(id, pwd) {
        const jt = this.jt;
        if (
            // User login is not enabled, AND
            !jt.settings.multipleUsers &&
            (
                // Default admin password is either not set, blank, or matches the supplied password.
                jt.settings.defaultAdminPwd === '' ||
                jt.settings.defaultAdminPwd === null ||
                jt.settings.defaultAdminPwd === undefined ||
                pwd === jt.settings.defaultAdminPwd
            )
        ) {
            return 'defaultAdmin';
        }

        if (jt.settings.multipleUsers) {
            for (var i in this.users) {
                var user = this.users[i];
                if (user.matches(id, pwd)) {
                    return user;
                }
            }
        }

        return null;

    }

}

var exports = module.exports = {};
exports.new = Data;
