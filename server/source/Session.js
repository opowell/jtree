// @flow

const Participant   = require('./Participant.js');
const App           = require('./App.js');
const Period        = require('./Period.js');
const Group         = require('./Group.js');
const Player        = require('./Player.js');
const Client        = require('./Client.js');
const Table         = require('./Table.js');
const Utils         = require('./Utils.js');
const fs            = require('fs-extra');
const path          = require('path');
const async         = require('async');
const {stringify} = require('flatted/cjs');
const clone         = require('./clone.js');

const PLAYER_STATUS_FINISHED = 'finished';
const PLAYER_STATUS_PLAYING = 'playing';
const PLAYER_STATUS_READY = 'ready';

/**
* A session is a collection of apps and players.
*/
class Session {

    /**
    * Create a Session.
    *
    * CALLED FROM:
    * - {@link Session#load}
    * - {@link Data#constructor}
    * - {@link Data#createSession}
    *
    * @param  {type} id               The id of the new session.
    */
    constructor(id, options) {

        if (options == null) {
            options = {};
        }

        if (options.createFolder == null) {
            options.createFolder = true;
        }

        this.id = id;
        if (this.id === null || this.id === undefined) {
            this.id = Utils.getDate();
        }
        this.name = this.id;

        this.initialState = {
            timeStarted: 0,
            started: false,
            participants: [],
            gameTree: [],
            potentialParticipantIds: global.jt.settings.participantIds,
            id: this.id,
            stateId: 0,
        };

        if (this.initialState.nonObs == null) {
            Object.defineProperty(this.initialState, "nonObs", {
                enumerable: false,
                value: {}
            });
        }

        this.initialState.nonObs.session = this;
        
        /**
         * Fields initially existing on "proxyObj" are not monitored.
         */
        let proxyObj = {
            id: this.id,
            messages: [],
            messageLatest: true,
            messageIndex: 0, // 0 means no messages, 1 is first message, etc.
            clients: [],
            state: this.initialState,
            objectList: [],
        }

        this.proxy = proxyObj;
        this.gameTree = this.proxy.state.gameTree;

        /**
        * A list of the clients connected to this session.
        * @type Array
        */
        this.clients = [];

        this.caseSensitiveLabels = false;

        /**
        * A list of participants in this session.
        * @type Object
        */
        // this.participants = {};

        /**
        * The time at which this session was last started.
        * @type number
        */
        this.timeStarted = 0;
        this.started = false;

        /**
        * Whether or not clients can create a participant that does not exist yet.
        */
        this.allowNewParts = global.jt.settings.session.allowClientsToCreateParticipants;

        this.outputDelimiter = global.jt.settings.outputDelimiter;

        for (let i in global.jt.settings.session) {
            this[i] = global.jt.settings.session[i];
        }

        /**
        * The apps in this session.
        * @type Array
        */
        // this.apps = [];

        this.users = [];

        this.asyncQueue = async.queue(this.processQueueMessage, 1);

        // A filestream for writing to this session's object states.
        try {
            fs.ensureDirSync(this.getOutputDir());
            var options = { 'flags': 'a'};
            this.fileStream = fs.createWriteStream(this.getOutputDir() + '/' + this.id + '.gsf', options);
        } catch (err) {
            debugger;
            console.log(err);
        }
        /**
        * A list of fields to hide from output.
        * @type Array
        */
        this.outputHide = [
            'jt',
            'clients',
            'participants',
            'this',
            'outputHide',
            'apps',
            'fileStream',
            'asyncQueue',
            // 'started',
            'emitMessages'
        ];

        this.emitMessages = true;

    }

    /**
    * Loads a session from a .json file.
    *
    * FUNCTIONALITY
    * - create a new session
    * - load session objects from .gsf file
    * - for each object in the .gsf file, call the appropriate object.load method.
    * - link participants and players.
    *
    * @param  {Object} jt      The server
    * @param  {type} json      The content of the session.
    * @return {Session}        The session described by the contents of json.
    */
    static load(folder, data) {
        var session = new Session(folder);
        var all = fs.readFileSync(path.join(jt.path, jt.settings.sessionsFolder + '/' + folder + '/' + folder + '.gsf')).toString();
        var lines = all.split('\n');

        // Read objects
        for (var i=0; i<lines.length; i++) {
            try {
                if (lines[i] !== undefined && lines[i].length > 0) {
                    var json = JSON.parse(lines[i]);
                    switch (json.type) {
                        case 'SESSION':
                        var newSession = new Session(folder);
                        for (var j in json) {
                            newSession[j] = json[j];
                        }
                        newSession.proxy.state.participants = session.proxy.state.participants;
                        for (let p in session.proxy.state.participants) {
                            session.proxy.state.participants[p].session = newSession;
                        }

                        newSession.apps = [];
                        // var extra = 0;
                        // for (var j in newSession.appSequence) {
                        //     var k = j - extra;
                        //     if (session.apps[k].id === newSession.appSequence) {
                        //         var app = session.apps[k];
                        //         app.session = newSession;
                        //         newSession.apps.push(app);
                        //     } else {
                        //         extra++;
                        //     }
                        // }

                        session = newSession;

                        break;
                        case 'APP':
                        App.load(json, session);
                        break;
                        case 'PERIOD':
                        Period.load(json, session);
                        break;
                        case 'GROUP':
                        Group.load(json, session, data);
                        break;
                        case 'PLAYER':
                        Player.load(json, session);
                        break;
                        case 'PARTICIPANT':
                        Participant.load(json, session);
                        break;
                        case 'TABLE':
                        Table.load(json, session);
                        break;
                    };
                }
            } catch (err) {
//                console.log(err.stack);
            }
        }

        // Link participants and players.
        for (var a in session.apps) {
            var app = session.apps[a];
            for (var prd in app.periods) {
                var period = app.periods[prd];
                for (var gr in period.groups) {
                    var group = period.groups[gr];
                    for (var pl in group.players) {
                        var player = group.players[pl];
                        var participant = session.proxy.state.participants[player.participantId];
                        player.participant = participant;
                        participant.player = player;
                        participant.players.push(player);
                        if (player.stageIndex > -1) {
                            player.stage = player.app().stages[player.stageIndex];
                        }
                    }
                }
            }
        }

        return session;
    }

    canUserManage(userId) {
        var user = global.jt.data.user(userId);
        if (!global.jt.settings.multipleUsers) {
            return true;
        } else {
            if (user === null) {
                return false;
            } else if (user.isAdmin()) {
                return true;
            } else {
                return this.users.includes(userId);
            }
        }
    }

    getGSFFile() {
        return this.getOutputDir() + '/' + this.id + '.json';
    }

    /**
    * Add the app with the given ID to this session.
    *
    * FUNCTIONALITY:
    * - load the given app {@link Session#loadApp}
    * - add app to this session's apps field.
    * - copy app source files {@link Utils#copyFiles}.
    * - save app and its stages {@link App#saveSelfAndChildren}.
    * - emit 'sessionAddApp' message.
    *
    * @param  {string} appId The ID of the app to add to this session.
    */
    addApp(appPath, options) {

        if (this.queuePath != null && !appPath.startsWith(this.queuePath)) {
            appPath = path.join(this.queuePath, appPath);
        }

        try {
            var app = global.jt.data.loadApp(appPath, this, appPath, options);
        if (app !== null) {
            // this.apps.push(app);
            let game = app;
            this.proxy.state.gameTree.push(game);
            if (app.appPath.includes('.')) {
                Utils.copyFile(app.appFilename, app.appDir, app.getOutputFN());
            } else {
                Utils.copyFiles(path.parse(app.appPath).dir, app.getOutputFN());
            }
            if (
                this.proxy.state.gameTree.length == 1
            &&  app.suggestedNumParticipants != null
            &&  this.suggestedNumParticipants == null
            ) {
                this.suggestedNumParticipants = app.suggestedNumParticipants;
                this.setNumParticipants(app.suggestedNumParticipants);
            }   
            // app.saveSelfAndChildren();
            this.save();
            if (this.emitMessages) {
                this.emit('sessionAddApp', {sId: this.id, app});
            }
        }
    } catch (err) {
        debugger;
    }
    }

    addGame(state, {filePath, options}) {
        let fullPath = filePath;
        if (typeof fullPath !== 'string') {
            fullPath = path.join.apply(null, filePath);
        }
        var game = global.jt.data.loadGame(fullPath, state, options);
        if (game !== null) {
            state.gameTree.push(game);
        }
    }

    setSessionLatest(value) {
        this.proxy.messageLatest = value;
        if (this.proxy.messageLatest) {
            this.setMessageIndex(this.proxy.messages.length);
        }
    }
    
    addUser(userId) {
        this.users.push(userId);
        this.save();
        this.emit('sessionAddUser', {sId: this.id, uId: userId});
    }

    addQueue(qId) {
        var queue = global.jt.data.queue(qId);
        if (queue !== null) {
            for (var i in queue.apps) {
                try {
                    this.addApp(queue.apps[i].appId, queue.apps[i].options);
                } catch (err) {}
            }
        }
    }

    addAdminClient(socket) {
        for (let i=0; i<this.proxy.state.participants.length; i++) {
            addClient(socket, this.proxy.state.participants[i].id);
        }
    }

    /**
    * Connect a web socket client to a participant of this session.
    * - Listen for disconnect and goto-next-stage messages.
    * - Load participant.
    * - Socket listens to its own channel.
    * -
    *
    * CALLED FROM
    * - {@link SocketServer#addParticipantClient}
    *
    * @param  {Object} socket        The web socket.
    * @param  {string} participantId The id of the participant.
    */
    addClient(socket, participantId) {
        var session = this;

        socket.on('disconnect', function() {
            session.clientRemove(socket);
        });

        socket.on('goto-next-stage', function(msg) {
            var pId = msg.pId;
            var stageId = msg.stageId;
            var periodId = msg.periodId;
            var participant = session.participant(pId);
            if (participant.stageId() === stageId && participant.player.periodIndex() === periodId) {
                participant.getApp().playerMoveToNextStage(participant.player);
            }
        });

        var participant = this.participant(participantId);
        if (participant === null || participant === undefined) {
            if (!this.allowNewParts) {
                console.log('error: tried to add new participant ' + participantId);
                this.io().to(socket.id).emit('notLoggedIn');
                return null;
            }
            participant = this.participantCreate(participantId);
        }

        var client = new Client.new(socket, this);
        client.participant = participant;
        socket.join(this.roomId());
        participant.clientAdd(client);
        this.clients.push(client);
        global.jt.socketServer.sendOrQueueAdminMsg(null, 'addClient', client);
        this.io().to(socket.id).emit('logged-in', stringify(participant));
        // participant.player.sendUpdate(socket.id);

        return client;
    }

    processQueueMessage(msg, callback) {
        let obj = msg.obj;
        let data = msg.data;
        let fn = msg.fn;
        try {

            if (fn !== 'endGame') {
                data = Utils.parseFloatRec(data);
            }
            
            // if (obj.canProcessMessage()) {
                obj.addMessage(fn, data);
                // obj[fn](data);
            // } else {
                // jt.log('Object cannot process message, skipping message "' + fn + '".');
            // }
            obj.emitParticipantUpdates();
        } catch (err) {
            global.jt.log(err.stack);
            debugger;
            try {
                global.jt.log('error processing message: ' + JSON.stringify(msg.data));
            } catch (err2) {
                global.jt.log('Error printing error: ' + msg.fn + ', ' + err2.stack);
            }
        }
        callback();
        return true;
    }

    processMessage(state, message) {
        let func = eval('this["' + message.name + '"]').bind(this);
        func(state, message.content);
    }

    endGame(state, msgData) {

        let {endForGroup, data, participantId} = msgData;

        // global.jt.log('Server received auto-game submission: ' + JSON.stringify(data));

        // TODO: Not parsing strings properly.
        /** console.log('msg: ' + JSON.stringify(data) + ', ' + client.player().roomId());*/
        // var endForGroup = true;
        // let participantId = client.participant.id;

        let participant = Utils.findById(state.participants, participantId);
        let player = participant.player;
        let group = player.group;
        let period = group.period;
        let game = player.stage;

        if (player === null) {
            return false;
        }

        if (player.stage.id !== data.fnName) {
            console.log('Session.js, GAME NAME DOES NOT MATCH: ' + participant.player.game.id + ' vs. ' + data.fnName + ', data=' + JSON.stringify(data));
            return false;
        }

        for (var property in data) {
            var value = data[property];

            if (value === 'true') {
                value = true;
            } else if (value === 'false') {
                value = false;
            } else if (!isNaN(value)) {
                value = parseFloat(value);
            }

            if (data.hasOwnProperty(property)) {
                if (property.startsWith('player.')) {
                    var fieldName = property.substring('player.'.length);
                    player[fieldName] = value;
                } else if (property.startsWith('group.')) {
                    var fieldName = property.substring('group.'.length);
                    group[fieldName] = value;
                } else if (property.startsWith('participant.')) {
                    var fieldName = property.substring('participant.'.length);
                    participant[fieldName] = value;
                } else if (property.startsWith('period.')) {
                    var fieldName = property.substring('period.'.length);
                    period[fieldName] = value;
                } else if (property.startsWith('game.')) {
                    var fieldName = property.substring('game.'.length);
                    game[fieldName] = value;
                }
            }
        }
        player.endStage(endForGroup);

        participant.updateScheduled = true;
    }

    emitToAdmins(name, data) {
        global.jt.socketServer.sendOrQueueAdminMsg(null, name, data);
    }

    getOutputDir() {
        return global.jt.settings.sessionsFolder + '/' + this.name;
    }

    /**
    * Pushes a message to the end of the message queue.
    * @param  {type} obj The client from whom the message was received.
    * @param  {type} da The data received from the client.
    * @param  {string} funcName The name of the function to evaluate on the client object.
    */
   pushMessage(obj, da, funcName) {
    var msg = {obj: obj, data: da, fn: funcName};
    this.asyncQueue.push(msg, this.messageCallback);
}

    addMessageToStartOfQueue(obj, data, funcName) {
        var msg = {obj: obj, data: data, fn: funcName, jt: global.jt, session: this};
        this.asyncQueue.unshift(msg, this.messageCallback);
        //        var playerId = Player.genRoomId(da.player);
        //        var line = cl.participant.id + ', ' + cl.id + ', ' + playerId + ', ' + funcName + ', ' + JSON.stringify(da.data) + '\n';
        //        fs.appendFileSync(this.getOutputDir() + '/messages.csv', line);
    }

    addMessage(name, content) {
        // console.log('adding message: ' + name + (content==null ? '' : (', ' + content)));
        this.proxy.messages.push({
            id: this.proxy.messages.length + 1,
            name,
            content,
            state: null,
        });
        if (this.proxy.messageLatest) {
            return this.setMessageIndex(this.proxy.messages.length);
        }
    }

    setMessageIndex(index) {
        this.proxy.messageIndex = index;
        let state = this.loadMessageState(index-1);
        while (state.__target != null) {
            state = state.__target;
        }
        this.proxy.state = state;
    }
 
    loadMessageState(index) {

        // TODO: Remove
        this.processMessage(this.proxy.state, this.proxy.messages[index]);
        return this.proxy.state;
        // END: Remove.

        if (index >= this.proxy.messages.length) {
            console.log('Error: asking for state ' + index + ' when only ' + this.proxy.messages.length + ' messages.');
            return null;
        }

        if (index == -1) {
            return this.initialState;
        }

        if (this.proxy.messages[index].state == null) {
            let prevState = this.loadMessageState(index-1);

            // Temporarily disable state storage.
            let newState = clone(prevState);
            Object.defineProperty(newState, "nonObs", {
                enumerable: false,
                value: clone(prevState.nonObs)
            });
            // let newState = prevState;

            newState.stateId++;

            // Copy participants to the new state proxy.
            for (let i=0; i<newState.participants.length; i++) {
                let part = newState.participants[i];
                let proxy = part.getProxy();
                newState.participants[i] = proxy;
            }

            // Make new state available immediately, and create proxy object for it.
            while (newState.__target != null) {
                newState = newState.__target;
            }
            this.proxy.messages[index].state = newState;

            // Apply the message corresponding to this state.
            this.processMessage(this.proxy.messages[index].state, this.proxy.messages[index]);
        }

        return this.proxy.messages[index].state;
    }

    processMessage(msg, callback) {
        let obj = msg.obj;
        let data = msg.data;
        let fn = msg.fn;
        let jt = msg.jt;
        let session = msg.session;
        try {

            if (!['endStage', 'endApp', 'forceEndStage'].includes(fn)) {
                data = Utils.parseFloatRec(data);
            }
            
            if (obj.canProcessMessage()) {
                obj[fn](data);
                session.emitParticipantUpdates();
                //            }
                //            if (client.player() !== null && client.player().matchesPlayer(player) && client.player().status === 'playing') {
                //                if (client.player() !== null) {
                //                    client.player().save();
                //                }
            } else {
                jt.log('Object cannot process message, skipping message "' + fn + '".');
            }
        } catch (err) {
            jt.log(err.stack);
            debugger;
            try {
                jt.log('error processing message: ' + JSON.stringify(msg.data));
            } catch (err2) {
                jt.log('Error printing error: ' + msg.fn + ', ' + err2.stack);
            }
        }
        callback();
        return true;
    }

    /**
    // * Process a message from the queue.
    // */
    // processMessageV1(msg, callback) {
    //     const client = msg.client;
    //     const player = msg.data.player;
    //     let data = msg.data.data;
    //     const fn = msg.fn;
    //     const jt = msg.jt;
    //     try {
    //         if (client.player() !== null && client.player().matchesPlayer(player) && client.player().status === 'playing') {
    //             data = Utils.parseFloatRec(data);
    //             client[fn](data);
    //             //                if (client.player() !== null) {
    //             //                    client.player().save();
    //             //                }
    //         } else {
    //             jt.log('Message player does not match clients current player, skipping message.');
    //         }
    //     } catch (err) {
    //         jt.log('error processing message: ' + JSON.stringify(msg.data));
    //         jt.log(err.stack);
    //     }
    //     callback();
    //     return true;
    // }

    messageCallback() {}

    resume() {
        this.setRunning(true);
    }

    pause() {
        this.setRunning(false);
    }

    setRunning(b) {
        this.isRunning = b;
        // var timers = this.timers();
        // for (var t in timers) {
        //     timers[t].setRunning(b);
        // }
        for (var i in this.proxy.state.participants) {
            var participant = this.proxy.state.participants[i];
            if (participant.player != null) {
                participant.player.emitUpdate2();
            }
        }
    }

    setId(id) {
        this.id = id;
        for (var i in this.proxy.state.participants) {
            var participant = this.proxy.state.participants[i];
            participant.refreshClients();
        }
    }

    reset() {
        this.started = false;
        let participants = this.proxy.state.participants;
        for (let i in participants) {
            let participant = participants[i];
            participant.reset();
        }
        for (let i=0; i<this.gameTree.length; i++) {
            let app = this.gameTree[i];
            this.gameTree[i] = app.reload();
        }
    }

    // timers() {
    //     var out = [];
    //     for (var a in this.apps) {
    //         var app = this.apps[a];
    //         for (var p in app.periods) {
    //             var period = app.periods[p];
    //             for (var g in period.groups) {
    //                 var group = period.groups[g];
    //                 if (group.stageTimer !== undefined) {
    //                     out.push(group.stageTimer);
    //                 }
    //                 for (var pl in group.players) {
    //                     var player = group.players[pl];
    //                     if (player.stageTimer !== undefined) {
    //                         out.push(player.stageTimer);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     return out;
    // }

    /**
    * Returns the {@link App} in the session app sequence that follows a reference {@link App}.
    * @param  {@link App} app The reference app.
    * @return {@link App}     The app in the session app sequence that follows the reference app.
    */
    // appFollowing(app) {
    //     for (var i=0; i<this.apps.length; i++) {
    //         if (this.apps[i] === app) {
    //             if (i < this.apps.length-1) {
    //                 return this.apps[i+1];
    //             } else {
    //                 return null;
    //             }
    //         }
    //     }
    // }

    participantUI() {
        return global.jt.settings.participantUI;
    }

    /**
    * Sends a page to a client (via the given HTTPResponse object).
    * @param  {HTTPRequest} req description
    * @param  {HTTPResponse} res description
    */
    sendParticipantPage(req, res, participantId) {
        var participant = this.participant(participantId);

        // Not a valid participant.
        if (!this.isValidPId(participantId)) {
            res.sendFile(path.join(global.jt.path, this.participantUI() + '/enterId.html'));
        } 
        // Not a participant yet
        else if (participant == null) {
            res.sendFile(path.join(global.jt.path, this.participantUI() + '/readyClient.html'));
        }
        // Participant, but not in an app yet.
        else if (participant.getGame() == null) {
            res.sendFile(path.join(global.jt.path, this.participantUI() + '/readyClient.html'));
        }
        // participant in an app.
        else {
            // const app = participant.getApp();
            // app.sendParticipantPage(req, res, participant);
            let html = this.getPage(participant);
            res.send(html);
        }
    }

    getPage(participant) {
        let html = '';
        // let gameTree = this.proxy.__target.state.gameTree;
        let gameTree = this.proxy.state.gameTree;
        for (let g=0; g<gameTree.length; g++) {
            html = html + gameTree[g].getHTML(participant);
        }
        return html;
    }

    /**
    * Adds a particular number of participants to this session.
    * @param  {number} num The number of participants to add.
    */
    addParticipants(num) {
        // Search through the list of participantIds until one is found for which
        // no participant already exists.
        for (let i=0; i<num; i++) {
            let newId = this.getNextAvailablePId();
            this.participantCreate(newId);    
        }
    }

    saveOutput() {

        var headers = ['id'];
        var skip = [];
        var fields = this.outputFields();
        Utils.getHeaders(fields, skip, headers);
        var text = [];
        text.push(headers.join(this.outputDelimiter));
        var newLine = '';
        for (var h=0; h<headers.length; h++) {
            var header = headers[h];
            if (this[header] !== undefined) {
                let value = this[header];
                if (typeof value == 'object') {
                    value = 'object';
                }
                // newLine += JSON.stringify(this[header]);
                newLine += value;
            }
            if (h<headers.length-1) {
                newLine += this.outputDelimiter;
            }
        }
        text.push(newLine);

        var fn = this.csvFN() + ' - manual save at ' + Utils.getDate() + '.csv';
        let fullText = '';
        let fd = fs.openSync(fn, 'a');
        try {
            fullText += 'SESSION\n';
            fullText += text.join('\n') + '\n';
            for (var i=0; i<this.gameTree.length; i++) {
                fullText += this.gameTree[i].saveOutput();
            }
            fs.appendFileSync(fd, fullText);
        } catch(err) {
            console.log('error writing session: ' + this.id);
            debugger;
        } finally {
            fs.closeSync(fd);
        }

        return fs.readFileSync(fn, 'utf8');
    }

    loadMessageState(index) {

        if (index >= this.proxy.messages.length) {
            console.log('Error: asking for state ' + index + ' when only ' + this.proxy.messages.length + ' messages.');
            return null;
        }

        if (index == -1) {
            return this.initialState;
        }

        if (this.proxy.messages[index].state == null) {
            let prevState = this.loadMessageState(index-1);

            // Temporarily disable state storage.
            let newState = clone(prevState);
            Object.defineProperty(newState, "nonObs", {
                enumerable: false,
                value: clone(prevState.nonObs)
            });
            // let newState = prevState;

            newState.stateId++;

            // Copy participants to the new state proxy.
            for (let i=0; i<newState.participants.length; i++) {
                let part = newState.participants[i];
                let proxy = part.getProxy();
                newState.participants[i] = proxy;
            }

            // Make new state available immediately, and create proxy object for it.
            while (newState.__target != null) {
                newState = newState.__target;
            }
            this.proxy.messages[index].state = newState;

            // Apply the message corresponding to this state.
            this.processMessage(this.proxy.messages[index].state, this.proxy.messages[index]);
        }

        return this.proxy.messages[index].state;
    }

    processQueueMessage(msg, callback) {
        let obj = msg.obj;
        let data = msg.data;
        let fn = msg.fn;
        try {

            if (fn !== 'endGame') {
                data = Utils.parseFloatRec(data);
            }
            
            // if (obj.canProcessMessage()) {
                obj.addMessage(fn, data);
                // obj[fn](data);
            // } else {
                // jt.log('Object cannot process message, skipping message "' + fn + '".');
            // }

            // obj should always be Session object?
            obj.emitParticipantUpdates();

        } catch (err) {
            global.jt.log(err.stack);
            debugger;
            try {
                global.jt.log('error processing message: ' + JSON.stringify(msg.data));
            } catch (err2) {
                global.jt.log('Error printing error: ' + msg.fn + ', ' + err2.stack);
            }
        }
        callback();
        return true;
    }

    processMessage(state, message) {
        let func = eval('this["' + message.name + '"]').bind(this);
        func(state, message.content);
    }
    
    emitParticipantUpdates() {
        // console.log('emitting updates');
        for (let p in this.proxy.state.participants) {
            this.proxy.state.participants[p].actuallyEmitUpdate();
        }
    }

    /**
    * Sets the number of participants in this session.
    * @param  {number} num The number of participants to have.
    */
    setNumParticipants(num) {
        let change = num - this.proxy.state.participants.length;
        if (change > 0) {
            this.addParticipants(change);
        } else if (change < 0) {
            this.removeParticipants(-change);
        }
    }

    setAllowNewParts(b) {
        this.allowNewParts = b;
        var d = {sId: this.id, value: b};
        this.emit('setAllowNewParts', d);
    }

   /**
    * participantMoveToNextGame - description
    *
    * CALLED FROM:
    * - {@link Participant#moveToNextStage}.
    *
    * @param  {type} participant description
    * @return {type}             description
    */
   participantMoveToNextGame(participant) {
    if (participant.getGame() != null) {
        participant.getGame().participantEndInternal(participant);
    }

    if (participant.gameIndex < participant.session.gameTree.length) {
        participant.gameIndex++;
        // participant.gameTree.push(participant.session.gameTree[participant.gameIndex]);
        this.participantBeginApp(participant);
    } else {
        this.participantEnd(participant);
        this.tryToEnd();
    }
}

setAllowAdminPlay(b) {
        this.allowAdminClientsToPlay = b;
        let data = {sId: this.id, value: b};
        this.emit('setAllowAdminPlay', data);
    }

    setCaseSensitiveLabels(b) {
        this.caseSensitiveLabels = b;
        var d = {sId: this.id, value: b};
        this.emit('setCaseSensitiveLabels', d);
    }

    /**
    * Remove a particular number of participants from this session.
    * @param  {number} num The number of participants to remove.
    */
    removeParticipants(num) {
        const parts = this.proxy.state.participants;
        for (let i=0; i<num; i++) {
            let len = Object.keys(parts).length;

            if (len < 1) {
                return;
            }

            let part = parts[Object.keys(parts)[len-1]];
            let pId = part.id;
            this.deleteParticipant(pId);
        }
    }

    deleteParticipant(pId) {
        let participants = this.proxy.state.participants;
        for (let i=0; i<participants.length; i++) {
            if (participants[i].id === pId) {
                // delete participants[pId];
                participants.splice(i, 1);
                let md = {sId: this.id, pId: pId};
                this.emit('sessionDeleteParticipant', md);
                return;
            }
        }
    }

    /**
    * this - description
    *
    * @param  {type} d description
    */
    deleteApp(d) {
        var i = parseInt(d.i);
        if (i > -1 && this.apps[i].id === d.aId) {
            this.apps.splice(i, 1);
            var toDel = this.getOutputDir() + '/' + (i + 1) + '_' + d.aId;
            if (fs.existsSync(toDel)) {
                fs.removeSync(toDel);
            }
            for (var j=i; j<this.apps.length; j++) {
                var origPath = this.getOutputDir() + '/' + (j + 2) + '_' + this.apps[j].id;
                var newPath = this.getOutputDir() + '/' + (j + 1) + '_' + this.apps[j].id;
                fs.renameSync(origPath, newPath);
            }
            this.save();
            this.emit('sessionDeleteApp', d);
        }
    }

    setAppOption(appId, appIndex, name, value) {
        var i = parseInt(appIndex);
        if (i > -1 && this.apps[i].id === appId) {
            var app = this.apps[i];
            app.setOptionValue(name, value);
            this.apps[i] = app.reload();
            app.saveSelfAndChildren();
        }
    }

    /**
    * Sends a message to all clients of this session.
    *
    * @param  {string} name The name of the message.
    * @param  {Object} d    The data of the message.
    */
    emit(name, d) {
        this.io().to(this.roomId()).emit(name, stringify(d));
    }

    /**
    * Move slowest participants to their next stage. See {@link Participant#moveToNextStage}.
    *
    */
    advanceSlowest() {
        var parts = this.slowestParticipants();
        for (var i=0; i<parts.length; i++) {
            if (parts[i].player == null) {
                this.gameTree[0].participantBegin(parts[i]);
            } else {
                parts[i].player.moveToNextGame();
            }
        }
    }

   /**
    * participantMoveToNextGame - description
    *
    * CALLED FROM:
    * - {@link Participant#moveToNextStage}.
    *
    * @param  {type} participant description
    * @return {type}             description
    */
//    participantMoveToNextGame(participant) {
//     if (participant.getGame() != null) {
//         participant.getGame().participantEnd(participant);
//     }

//     if (participant.gameIndex < participant.session.gameTree.length) {
//         participant.gameIndex++;
//         // participant.gameTree.push(participant.session.gameTree[participant.gameIndex]);
//         this.participantBeginApp(participant);
//     } else {
//         this.participantEnd(participant);
//         this.tryToEnd();
//     }
// }

slowestParticipants() {
        var out = [];
        for (var i in this.proxy.state.participants) {
            var part = this.proxy.state.participants[i];
            out.push(part);
        }
        return out;
    }

    /**
    * this - description
    *
    * @return {type}  description
    */
    save() {
        try {
            // global.jt.log('Session.save: ' + this.id);
            this.saveDataFS(this, 'SESSION');
            for (var i in this.apps) {
                this.apps[i].saveSelfAndChildren();
            }
        } catch (err) {
            console.log(err.stack);
        }
    }

    saveDataFS(d, type) {
        // Flatted.parse(d);
        // try {
        //     var a = JSON.stringify(d) + '\n';
        //     var b = '"type":"' + type + '"' + this.outputDelimiter;
        //     var position = 1;
        //     var output = [a.slice(0, position), b, a.slice(position)].join('');
        //     this.fileStream.write(output);
        // } catch (err) {
        //     console.log('ERROR Session.saveDataFS: ' + err.stack);
        // }
    }

    /**
    * this - description
    *
    * @return {type}  description
    */
    outputFields() {
        var fields = [];
        for (var prop in this) {
            if (
                !Utils.isFunction(this[prop]) &&
                !this.outputHide.includes(prop)
            )
            fields.push(prop);
        }
        return fields;
    }

    /**
    * clientRemove - description
    *
    * @param  {type} socket description
    * @return {type}        description
    */
    clientRemove(socket) {
        var socketId = socket.id;
        // global.jt.log('removing client: ' + socketId);
        for (var i=this.clients.length - 1; i>=0; i--) {
            var client = this.clients[i];
            if (client.id === socketId) {
                if (client.participant !== null) {
                    client.participant.clientRemove(client.id);
                }
                this.clients.splice(i, 1);
                global.jt.socketServer.sendOrQueueAdminMsg(null, 'remove-client', client);
            }
        }
    }

    /**
    * participant - description
    *
    * @param  {type} participantId description
    * @return {type}               description
    */
   participant(participantId) {
    var participant = Utils.findById(this.proxy.state.participants, participantId);
    if (participant == null && this.allowNewParts && this.isValidPId(participantId)) {
        participant = this.participantCreate(participantId);
        if (this.started) {
            participant.moveToNextStage();
        }
    }
    return participant;
}

participantUI() {
    return global.jt.settings.participantUI;
}
    /**
    * participantCreate - description
    *
    * @param  {type} pId description
    * @return {type}     description
    */
    participantCreate(pId) {
        if (!this.isValidPId(pId)) {
            return null;
        }

        var participantId = pId;
        // global.jt.log('Session.participantCreate: ' + participantId);
        var participant = new Participant.new(participantId, this);
        participant.save();
        this.save();
        // this.participants[participantId] = participant;
        this.proxy.state.participants.push(participant);
        if (global.jt.socketServer != null) {
            global.jt.socketServer.sendOrQueueAdminMsg(null, 'addParticipant', participant);
        }
        return participant;
    }

    /**
    * Updates client with latest stage information.
    *
    * @param  {type} p description
    * @return {type}   description
    */
    // playerRefresh(p) {
    //     this.io().to(p).emit('set-stage-name', this.curStage().name);
    //     this.curStage().onPlayerConnect(this.players[p]);
    // }

    /**
    * participantMoveToNextApp - description
    *
    * CALLED FROM:
    * - {@link Participant#moveToNextStage}.
    *
    * @param  {type} participant description
    * @return {type}             description
    */
    // participantMoveToNextApp(participant) {
    //     if (participant.getApp() != null) {
    //         participant.getApp().participantEndInternal(participant);
    //     }

    //     if (participant.appIndex < this.apps.length) {
    //         participant.appIndex++;
    //         participant.save();
    //         this.participantBeginApp(participant);
    //     } else {
    //         this.participantEndInternal(participant);
    //     }
    //     this.emitParticipantUpdates();
    // }

    /**
    * Overwrite to add custom functionality.
    *
    * @param  {type} participant description
    * @return {type}             description
    */
    // participantEnd(participant) {
    //     //        console.log('Session.playerEnd: ' + participant.id);
    //     //        this.io().to(participant.roomId()).emit('start-new-app'); // refresh clients.
    // }

    /**
    * tryToEnd - description
    *
    * CALLED FROM:
    * - Participant.endSession()
    *
    * @return {type}  description
    */
    tryToEnd() {
        var proceed = true;
        var participants = this.proxy.state.participants;
        for (var p in participants) {
            var participant = participants[p];
            if (!participant.isFinishedSession()) {
                proceed = false;
                break;
            }
        }
        if (proceed) {
            this.end();
        }
    }

    end() {
        console.log('Session.end: ' + this.id);
    }

    csvFN() {
        return this.getOutputDir() + '/' + this.id + '.csv';
    }

    start() {
        let participants = this.proxy.state.participants;
        if (!this.started) {
            global.jt.log('############################################');
            global.jt.log('START - SESSIN: ' + this.id);
            this.started = true;
            this.io().to(this.roomId()).emit('dataUpdate', [{
                roomId: this.roomId(),
                field: 'started',
                value: this.started
            }]);
            let period = {
                app: this.gameTree[0],
                numPeriods: 1,
            }
            let group = new Group.new('session', period);
            for (let p in participants) {
                let part = participants[p];
                let player = new Player.new(part.id, part, group, p);
                part.player = player;
                group.players.push(player);
                player.startedPeriod = true;
            }
            group.startedPeriod = true;
            period.app.groupStartInternal(group);
        }
        for (let p in participants) {
            participants[p].emit('start-new-app'); /** refresh clients.*/
        }
    }

    roomId() {
        return 'session_' + this.id;
    }

    io() {
        return global.jt.io;
    }

    /**
     * Return the next app in the session for this participant, null if there are no more apps for this participant.
     * @param {Participant} participant 
     */
    // getApp(participant) {
    //     if (participant.appIndex < 1 || participant.appIndex > this.apps.length) {
    //         return null;
    //     } else {
    //         return this.apps[participant.appIndex - 1];
    //     }
    // }

}

var exports = module.exports = {};
exports.new         = Session;
exports.load        = Session.load;
