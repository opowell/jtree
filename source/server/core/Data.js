const fs = require('fs-extra');
const Utils = require('../models/Utils.js');
const path = require('path');
// const Session = require('../models/Session.js');
const SessionV2 = require('../models/SessionV2.js');
// const App = require('../models/Game.js');
const Room = require('../models/Room.js');
// const Queue = require('../Queue.js');
const User = require('../models/User.js');
const Observer = require('micro-observer').Observer;
const Game = require('../models/Game.js');
const flatted = require('flatted');
const CircularJSON = require('../circularjson.js');
const Parser = CircularJSON;
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

        this.apps = {};
        this.appsMetaData = {};
        // this.games = {};

        //this.queues = this.loadQueues();
        this.queues = [];
        // this.loadApps();

        // this.loadGames();

        /*
         * Available [Sessions]{@link Session}, loaded from the contents of the 'sessions' folder.
         * Sorted in ascending order according to time created.
         * @type Array of {@link Session}.
         */
        this.sessions = this.loadSessions();

        this.rooms = this.loadRooms();

        this.users = this.loadUsers();

        this.storeTimeInfo();

        // Participant clients with no session IDs.
        // Reload them when a new session is opened.
        this.participantClients = [];

        let proxyObj = {
            sessions: [],
        };

        for (let i=0; i<this.sessions.length; i++) {
            proxyObj.sessions.push(this.sessions[i].proxy);
        }

        this.dataReplacer = function(key, value) {
            if (key === 'nonObs') {
                return undefined;
            }
            if (typeof value === "function") {
              return "/Function(" + value.toString() + ")/";
            }
            return value;
        }

        let replacer = this.dataReplacer;

        this.proxy = Observer.create(proxyObj, function(change) {
            let msg = {
                arguments: change.arguments,
                function: change.function,
                path: change.path,
                property: change.property,
                type: change.type,
                newValue: change.newValue,
            }
            if (change.type === 'function-call' && !['splice', 'push', 'unshift'].includes(change.function)) {
                return true;
            }
            let jt = global.jt;
            msg.newValue = Parser.stringify(msg.newValue, replacer, 2);
            msg.arguments = Parser.stringify(msg.arguments, replacer, 2);
            console.log('emit message: \n' + Parser.stringify(msg, replacer, 2));
            jt.socketServer.io.to(jt.socketServer.ADMIN_TYPE).emit('objChange', msg);
            return true; // to apply changes locally.
            // return false;
        });

    }

    // toShell(obj) {
    //     let out = null;
    //     if (obj == null) {
    //         out = obj;
    //     } else if (obj.shell != null) {
    //         out = obj.shell();
    //     } else if (obj instanceof Array) {
    //         out = [];
    //         for (let i=0; i<obj.length; i++) {
    //             out.push(this.toShell(obj[i]));
    //         }
    //     } else if (typeof obj === 'object') {
    //         out = {};
    //         for (let i in obj) {
    //             out[i] = this.toShell(obj[i]);
    //         }
    //     } else {
    //         out = obj;
    //     }
    //     return out;
    // }

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

    deleteSession(sessionId) {
        Utils.deleteById(this.proxy.sessions, sessionId);
        Utils.deleteById(this.sessions, sessionId);
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
            eval(app.appjs); // jshint ignore:line
            console.log('loaded app ' + filePath);
        } catch (err) {
            this.jt.log('Error loading app: ' + filePath);
            this.jt.log(err);
            app = null;
        }
        return app;
    }

    loadGame(appPath, session, options) {
        var app = null;
        app = new Game.new(session, this.jt, appPath);
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
            let game = app;
            let treatment = app;
            app.appjs = fs.readFileSync(filePath) + '';
            eval(app.appjs); // jshint ignore:line
            // console.log('loaded game ' + filePath);
        } catch (err) {
            this.jt.log('Error loading game: ' + filePath);
            this.jt.log(err);
            app = null;
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

            // Load folder as its own queue.
            var folderQueue = new Queue.new(dir, this.jt);
            console.log('loading folder queue ' + dir);

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
                            folderQueue.addApp(curPath);
                        }
                    }

                    // Queue / Session Config
                    if (id.endsWith('.jtq')) {
                        var queue = Queue.loadJTQ(curPath, this.jt, dir);
                        console.log('loading file queue ' + curPath);
                        this.queues[curPath] = queue;
                    }
                } else if (curPathIsFolder) {
                    this.loadAppDir(curPath);
                }
            }

            if (folderQueue.apps.length > 0) {
                folderQueue.displayName = dir.substring(dir.lastIndexOf('\\')+1);
                this.queues[dir] = folderQueue;
            }
        }
    }

    // Search for *.js and *.jtt files. Load as apps.
    // Search folders.
    // loadGamesFromDir(dir) {
    //     if (Utils.isDirectory(dir)) {
    //         var appDirContents = fs.readdirSync(dir);

    //         // Load folder as its own queue.
    //         var folderGame = new Game.new(null, this.jt, dir);
    //         console.log('loading folder game ' + dir);

    //         // Load individual apps and queues.
    //         for (var i in appDirContents) {
    //             // the current file
    //             var curPath = path.join(dir, appDirContents[i]);
    //             var curPathIsFile = fs.lstatSync(curPath).isFile();
    //             var curPathIsFolder = fs.lstatSync(curPath).isDirectory();
    //             if (curPathIsFile) {
    //                 var id = appDirContents[i];

    //                 // Treatment / App
    //                 if (id == 'app.js' || id == 'app.jtt') {
    //                     // Take id from path name.
    //                     if (dir.lastIndexOf('/') > -1) {
    //                         id = dir.substring(dir.lastIndexOf('/') + 1);
    //                     } else if (dir.lastIndexOf('\\') > -1) {
    //                         id = dir.substring(dir.lastIndexOf('\\') + 1);
    //                     }
    //                 }
    //                 if (id.endsWith('.js')) {
    //                     id = id.substring(0, id.length - '.js'.length);
    //                 } else if (id.endsWith('.jtt')) {
    //                     id = id.substring(0, id.length - '.jtt'.length);
    //                 }
    //                 try {
    //                     let app = this.loadGame(id, null, curPath, {});
    //                     if (app != null) {
    //                         this.games[curPath] = app;
    //                         this.gamesMetaData[curPath] = app.metaData();
    //                         folderGame.addGame(curPath);
    //                     }
    //                 } catch (err) {
    //                     // not a valid app.
    //                     // console.log('Error, invalid game: ' + err);
    //                 }

    //             } else if (curPathIsFolder) {
    //                 this.loadGamesFromDir(curPath);
    //             }
    //         }

    //         if (folderGame.stages.length > 0) {
    //             folderGame.displayName = dir.substring(dir.lastIndexOf('\\')+1);
    //             this.games[dir] = folderGame;
    //         }
    //     }
    // }

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
            fs.removeSync(this.appPath(id));
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

    // getApps() {
    //     var out = [];
    //     for (var i in this.jt.settings.appFolders) {
    //         var folder = this.jt.settings.appFolders[i];
    //         out = out.concat(this.getAppsFromDir(folder));
    //     }
    //     return out;
    // }

    loadApps() {
        for (var i in this.jt.settings.appFolders) {
            var folder = this.jt.settings.appFolders[i];
            this.loadAppDir(path.join(this.jt.path, folder));
        }
    }

    // loadGames() {
    //     for (var i in this.jt.settings.appFolders) {
    //         var folder = this.jt.settings.appFolders[i];
    //         this.loadGamesFromDir(path.join(this.jt.path, folder));
    //     }
    // }

    // saveApp(appToSave) {
    //     try {
    //         var origFolder = this.appPath(appToSave.origId);
    //         var newFolder = this.appPath(appToSave.id);
    //         fs.renameSync(origFolder, newFolder);
    //         var appjsPath = path.join(newFolder, 'app.jtt');
    //         fs.writeFileSync(appjsPath, appToSave.appjs);
    //         appjsPath = path.join(newFolder, 'client.html');
    //         fs.writeFileSync(appjsPath, appToSave.clientHTML);
    //         delete this.apps[appToSave.origId];
    //         this.apps[appToSave.id] = this.loadAppMetaData(appToSave.id, newFolder);
    //     } catch (err) {
    //
    //     }
    // }

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

        try {
            const sessPath = path.join(this.jt.path, this.jt.settings.sessionsFolder);
            fs.ensureDirSync(sessPath);
            var dirContents = fs.readdirSync(sessPath);
            for (var i in dirContents) {
                try {
                    var folder = dirContents[i];
                    var session = this.loadSession(folder);
                    if (session !== null) {
                        out.push(session);
                    } 
                    // else {
                    //     var pathToFolder = path.join(this.jt.path, this.jt.settings.sessionsFolder + '/' + folder + '/');
                    //     var contents = fs.readdirSync(pathToFolder);
                    //     if (contents.length === 0) {
                    //         console.log('completing delete of session ' + folder);
                    //         fs.removeSync(pathToFolder);
                    //     }
                    // }
                } catch (err) {
                    this.jt.log(err);
                }
            }
        } catch (err) {
            this.jt.log(err);
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
        return path.join(this.queuesPath(), id + '.json');
    }

    roomsPath() {
        return path.join(this.jt.path, this.jt.settings.roomsPath);
    }

    usersPath() {
        return path.join(this.jt.path, this.jt.settings.usersPath);
    }

    queuesPath() {
        return path.join(this.jt.path, this.jt.settings.queuesPath);
    }

    room(id) {
        return Utils.findById(this.rooms, id);
    }

    queue(id) {
        return Utils.findById(this.queues, id);
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
                out = SessionV2.load(this.jt, folder, this);
            }
        } catch (err) {
            console.log('error loading session WS: ' + folder);
            console.log(err);
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
        return Utils.findById(this.sessions, sessionId);
    }

    getProxySession(sessionId) {
        return Utils.findById(this.proxy.sessions, sessionId);
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
        var sess = new SessionV2.new(this.jt, null);
        // if (userId != null && userId.length > 0) {
        //     sess.addUser(userId);
        // }
        // sess.save();
        // this.jt.socketServer.emitToAdmins('addSession', sess.shell());
        this.sessions.push(sess);
        // let shell = sess.shell();
        this.proxy.sessions.push(sess.proxy);
        return sess;
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
        return Utils.findById(this.sessions, id);
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
