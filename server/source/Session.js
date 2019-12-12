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
    * @param  {Object} jt         Server object.
    * @param  {type} id               The id of the new session.
    */
    constructor(jt, id, options) {

        if (options == null) {
            options = {};
        }

        if (options.createFolder == null) {
            options.createFolder = true;
        }

        this.jt = jt;
        this.id = id;
        if (this.id === null || this.id === undefined) {
            this.id = Utils.getDate();
        }
        this.name = this.id;

        /**
         * The options of this app.
         * @type Array
         * @default []
         */
        this.options = [];

        /**
         * The option values of this app.
         * @type Object
         * @default {}
         */
        this.optionValues = {};

        /**
        * A list of the clients connected to this session.
        * @type Array
        */
        this.clients = [];

        this.potentialParticipantIds = this.jt.settings.participantIds;

        this.caseSensitiveLabels = false;

        this.suggestedNumParticipants = jt.settings.session.suggestedNumParticipants;

        /**
        * A list of participants in this session.
        * @type Object
        */
        this.participants = {};

        /**
        * The time at which this session was last started.
        * @type number
        */
        this.timeStarted = 0;
        this.started = false;

        /**
        * Whether or not clients can create a participant that does not exist yet.
        */
        this.allowNewParts = this.jt.settings.allowClientsToCreateParticipants;

        this.outputDelimiter = this.jt.settings.outputDelimiter;

        /**
        * The apps in this session.
        * @type Array
        */
        this.apps = [];

        this.users = [];

        /**
         * Whether or not admin windows can play.
         * Generally, during testing this can be test
         */
        this.allowAdminClientsToPlay = true;

        this.asyncQueue = async.queue(this.processMessage, 1);

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
            'emitMessages',
            'queue',
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
    static load(jt, folder, data) {
        var session = new Session(jt, folder);
        var all = fs.readFileSync(path.join(jt.path, jt.settings.sessionsFolder + '/' + folder + '/' + folder + '.gsf')).toString();
        var lines = all.split('\n');

        // Read objects
        for (var i=0; i<lines.length; i++) {
            try {
                if (lines[i] !== undefined && lines[i].length > 0) {
                    var json = JSON.parse(lines[i]);
                    switch (json.type) {
                        case 'SESSION':
                        var newSession = new Session(jt, folder);
                        for (var j in json) {
                            newSession[j] = json[j];
                        }
                        newSession.participants = session.participants;
                        for (let p in session.participants) {
                            session.participants[p].session = newSession;
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
                        var participant = session.participants[player.participantId];
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
        var user = this.jt.data.user(userId);
        if (!this.jt.settings.multipleUsers) {
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
            var app = this.jt.data.loadApp(appPath, this, appPath, options);
            if (app !== null) {
                this.apps.push(app);
                if (app.appPath.endsWith('.jtt') || app.appPath.endsWith('.js')) {
                    Utils.copyFile(app.appFilename, app.appDir, app.getOutputFN());
                } else {
                    Utils.copyFiles(path.parse(app.appPath).dir, app.getOutputFN());
                }
                if (this.apps.length == 1 &&
                    app.suggestedNumParticipants != null &&
                    this.suggestedNumParticipants == null) {
                        this.suggestedNumParticipants = app.suggestedNumParticipants;
                        this.setNumParticipants(app.suggestedNumParticipants);
                }
                // app.saveSelfAndChildren();
                this.save();
                if (this.emitMessages) {
                    this.emit('sessionAddApp', {sId: this.id, app: app.shellWithChildren()});
                }
            }
            return app;
        } catch (err) {
            debugger;
        }
    }

    addUser(userId) {
        this.users.push(userId);
        this.save();
        this.emit('sessionAddUser', {sId: this.id, uId: userId});
    }

    addQueue(qId) {
        var queue = this.jt.data.queue(qId);
        if (queue !== null) {
            for (var i in queue.apps) {
                try {
                    this.addApp(queue.apps[i].appId, queue.apps[i].options);
                } catch (err) {}
            }
        }
    }

    addAdminClient(socket) {
        for (let i=0; i<this.participants.length; i++) {
            addClient(socket, this.participants[i].id);
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
        this.jt.socketServer.sendOrQueueAdminMsg(null, 'addClient', client.shell());
        this.io().to(socket.id).emit('logged-in', participant.shell());
        if (participant.player !== null) {
            participant.player.sendUpdate(socket.id);
        }

        return client;
    }

    emitToAdmins(name, data) {
        this.jt.socketServer.sendOrQueueAdminMsg(null, name, data);
    }

    getOutputDir() {
        return this.jt.settings.sessionsFolder + '/' + this.name;
    }

    /**
    * Pushes a message to the end of the message queue.
    * @param  {type} obj The client from whom the message was received.
    * @param  {type} da The data received from the client.
    * @param  {string} funcName The name of the function to evaluate on the client object.
    */
    pushMessage(obj, da, funcName) {
        var msg = {obj: obj, data: da, fn: funcName, jt: this.jt, session: this};
        this.asyncQueue.push(msg, this.messageCallback);
        //        var playerId = Player.genRoomId(da.player);
        //        var line = cl.participant.id + ', ' + cl.id + ', ' + playerId + ', ' + funcName + ', ' + JSON.stringify(da.data) + '\n';
        //        fs.appendFileSync(this.getOutputDir() + '/messages.csv', line);
    }

    addMessageToStartOfQueue(obj, data, funcName) {
        var msg = {obj: obj, data: data, fn: funcName, jt: this.jt, session: this};
        this.asyncQueue.unshift(msg, this.messageCallback);
        //        var playerId = Player.genRoomId(da.player);
        //        var line = cl.participant.id + ', ' + cl.id + ', ' + playerId + ', ' + funcName + ', ' + JSON.stringify(da.data) + '\n';
        //        fs.appendFileSync(this.getOutputDir() + '/messages.csv', line);
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
        var timers = this.timers();
        for (var t in timers) {
            timers[t].setRunning(b);
        }
        for (var i in this.participants) {
            var participant = this.participants[i];
            if (participant.player != null) {
                participant.player.emitUpdate2();
            }
        }
    }

    setId(id) {
        this.id = id;
        for (var i in this.participants) {
            var participant = this.participants[i];
            participant.refreshClients();
        }
    }

    reset() {
        this.started = false;
        for (let i in this.participants) {
            let participant = this.participants[i];
            participant.reset();
        }
        for (let i=0; i<this.apps.length; i++) {
            let app = this.apps[i];
            this.apps[i] = app.reload();
        }
    }

    timers() {
        var out = [];
        for (var a in this.apps) {
            var app = this.apps[a];
            for (var p in app.periods) {
                var period = app.periods[p];
                for (var g in period.groups) {
                    var group = period.groups[g];
                    if (group.stageTimer !== undefined) {
                        out.push(group.stageTimer);
                    }
                    for (var pl in group.players) {
                        var player = group.players[pl];
                        if (player.stageTimer !== undefined) {
                            out.push(player.stageTimer);
                        }
                    }
                }
            }
        }
        return out;
    }

    /**
    * Returns the {@link App} in the session app sequence that follows a reference {@link App}.
    * @param  {@link App} app The reference app.
    * @return {@link App}     The app in the session app sequence that follows the reference app.
    */
    appFollowing(app) {
        for (var i=0; i<this.apps.length; i++) {
            if (this.apps[i] === app) {
                if (i < this.apps.length-1) {
                    return this.apps[i+1];
                } else {
                    return null;
                }
            }
        }
    }

    participantUI() {
        return this.jt.settings.participantUI;
    }

    addNumberOption(name, defaultVal, min, max, step, description) {
        // Add to list of options.
        this.options.push({
            type: 'number',
            name: name,
            min: min,
            max: max,
            step: step,
            defaultVal: defaultVal,
            description: description
        });

        // Add value, if does not already exist.
        if (this[name] === undefined) {
            this[name] = defaultVal;
        }

        // Value already exists, coerce if possible into one of the original option values.
        else {
            this.setOptionValue(name, this[name]);
        }
    }

    addTextOption(name, defaultVal, description) {
        // Add to list of options.
        this.options.push({
            type: 'text',
            name: name,
            defaultVal: defaultVal,
            description: description
        });

        // Add value, if does not already exist.
        if (this[name] === undefined) {
            this[name] = defaultVal;
        }

        // Value already exists, coerce if possible into one of the original option values.
        else {
            this.setOptionValue(name, this[name]);
        }
    }

    addSelectOption(optionName, optionVals, description) {

        // Add to list of options.
        this.options.push({
            type: 'select',
            name: optionName,
            values: optionVals,
            description: description
        });

        // Add value, if does not already exist.
        if (this[optionName] === undefined) {
            this[optionName] = optionVals[0];
        }

        // Value already exists, coerce if possible into one of the original option values.
        else {
            this.setOptionValue(optionName, this[optionName]);
        }
    }

    /**
    * Sends a page to a client (via the given HTTPResponse object).
    * @param  {HTTPRequest} req description
    * @param  {HTTPResponse} res description
    */
    sendParticipantPage(req, res, participantId) {
        var participant = this.participant(participantId);

        // Not a participant yet
        if (participant == null) {
            res.sendFile(path.join(this.jt.path, this.participantUI() + '/readyClient.html'));
        }
        // Participant, but not in an app yet.
        else if (participant.getApp() == null) {
            res.sendFile(path.join(this.jt.path, this.participantUI() + '/readyClient.html'));
        }
        // participant in an app.
        else {
            const app = participant.getApp();
            app.sendParticipantPage(req, res, participant);
        }
    }

    /**
    * Adds a particular number of participants to this session.
    * @param  {number} num The number of participants to add.
    */
    addParticipants(num) {
        let partsAdded = 0;

        // Search through the list of participantIds until one is found for which
        // no participant already exists.
        for (var i=0; i<this.potentialParticipantIds.length; i++) {
            let pId = this.potentialParticipantIds[i];
            let ptcptAlreadyExists = this.participants[pId] !== undefined;

            // No participant already exists, so create one.
            if (!ptcptAlreadyExists) {
                this.participantCreate(pId);
                partsAdded++;

                // Check if enough participants have been created. If yes, exit.
                if (partsAdded >= num) {
                    return;
                }
            }
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
                newLine += JSON.stringify(this[header]);
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
            for (var i=0; i<this.apps.length; i++) {
                fullText += this.apps[i].saveOutput();
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

    emitParticipantUpdates() {
        // console.log('emitting updates');
        for (let p in this.participants) {
            this.participants[p].actuallyEmitUpdate();
        }
    }

    /**
    * Sets the number of participants in this session.
    * @param  {number} num The number of participants to have.
    */
    setNumParticipants(num) {
        let change = num - Object.keys(this.participants).length;
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
        const parts = this.participants;
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
        delete this.participants[pId];
        let md = {sId: this.id, pId: pId};
        this.emit('sessionDeleteParticipant', md);
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

    setOptionValue(name, value) {
        this.optionValues[name] = value;
        var correctedValue = value;
        var isValid = false;
        let foundOpt = false;
        for (var opt in this.options) {
            var option = this.options[opt];
            if (option.name === name) {
                foundOpt = true;
                if (option.type === 'select') {
                    for (var i in option.values) {
                        if (option.values[i] == value) { // allow for coercion
                            correctedValue = option.values[i];
                            isValid = true;
                            break;
                        }
                    }
                } else if (option.type === 'number') {
                    correctedValue = value - 0; /** coerce to number*/
                    isValid = true;
                    break;
                } else if (option.type === 'text') {
                    isValid = true;
                    // no correction needed.
                }
            }
        }
        if (isValid || !foundOpt) {
            this[name] = correctedValue;
        }
    }


    /**
    * Sends a message to all clients of this session.
    *
    * @param  {string} name The name of the message.
    * @param  {Object} d    The data of the message.
    */
    emit(name, d) {
        this.io().to(this.roomId()).emit(name, d);
    }

    /**
    * Move slowest participants to their next stage. See {@link Participant#moveToNextStage}.
    *
    */
    advanceSlowest() {
        var parts = this.slowestParticipants();
        for (var i=0; i<parts.length; i++) {
            parts[i].moveToNextStage();
        }
    }

    slowestParticipants() {
        var out = [];
        var minAppIndex = null;
        var minPeriodIndex = null;
        var minStageIndex = null;
        for (var i in this.participants) {
            var part = this.participants[i];
            if (minAppIndex === null || part.appIndex <= minAppIndex) {
                if (minPeriodIndex === null || part.periodIndex <= minPeriodIndex) {
                    if (minStageIndex === null || part.stageIndex() <= minStageIndex) {
                        if (minAppIndex === null || part.appIndex < minAppIndex) {
                            minAppIndex = part.appIndex;
                            minPeriodIndex = part.periodIndex;
                            minStageIndex = part.stageIndex();
                            out = [];
                        } else if (minPeriodIndex === null || part.periodIndex < minPeriodIndex) {
                            minPeriodIndex = part.periodIndex;
                            minStageIndex = part.stageIndex();
                            out = [];
                        } else if (minStageIndex === null || part.stageIndex() < minStageIndex) {
                            minStageIndex = part.stageIndex();
                            out = [];
                        }
                        out.push(part);
                    }
                }
            }
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
            this.jt.log('Session.save: ' + this.id);
            var localData = this.shell();
            this.saveDataFS(localData, 'SESSION');
            for (var i in this.apps) {
                this.apps[i].saveSelfAndChildren();
            }
        } catch (err) {
            console.log(err.stack);
        }
    }

    saveDataFS(d, type) {
        try {
            var a = JSON.stringify(d) + '\n';
            var b = '"type":"' + type + '"' + this.outputDelimiter;
            var position = 1;
            var output = [a.slice(0, position), b, a.slice(position)].join('');
            this.fileStream.write(output);
        } catch (err) {
            console.log('ERROR Session.saveDataFS: ' + err.stack);
        }
    }

    /**
    * Creates a top-down shell of this {@link Session}. This includes all fields given by {@link Session.outputFields}, the participants, the apps and the clients.
    *
    * CALLED FROM:
    * - {@link Msgs#openSession}.
    *
    * @return {type}  The shell of this session.
    */
    shellWithChildren() {
        var out = {};
        var fields = this.outputFields();
        for (var f in fields) {
            var field = fields[f];
            out[field] = this[field];
        }
        out.participants = {};
        for (var i in this.participants) {
            out.participants[i] = this.participants[i].shellAll();
        }
        out.apps = [];
        for (var i in this.apps) {
            out.apps[i] = this.apps[i].shellWithChildren();
        }
        out.clients = [];
        for (var i in this.clients) {
            out.clients[i] = this.clients[i].shell();
        }
        return out;
    }

    /**
    * shell - description
    *
    * @return {type}  description
    */
    shell() {
        var out = {};
        var fields = this.outputFields();
        for (var f in fields) {
            var field = fields[f];
            out[field] = this[field];
        }
        out.numParticipants = Utils.objLength(this.participants);
        out.numApps = Utils.objLength(this.apps);
        out.appSequence = [];
        for (var i in this.apps) {
            try {
                out.appSequence.push(this.apps[i].id);
            } catch (err) {}
        }
        out.clients = [];
        out.participants = [];
        return out;
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
        this.jt.log('removing client: ' + socketId);
        for (var i=this.clients.length - 1; i>=0; i--) {
            var client = this.clients[i];
            if (client.id === socketId) {
                if (client.participant !== null) {
                    client.participant.clientRemove(client.id);
                }
                this.clients.splice(i, 1);
                this.jt.socketServer.sendOrQueueAdminMsg(null, 'remove-client', client.shell());
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
        var participant = this.participants[participantId];
        if (participant == null && this.allowNewParts && this.isValidPId(participantId)) {
            participant = this.participantCreate(participantId);
            if (this.started) {
                participant.moveToNextStage();
            }
        }
        return participant;
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
        this.jt.log('Session.participantCreate: ' + participantId);
        var participant = new Participant.new(participantId, this);
        participant.save();
        this.save();
        this.participants[participantId] = participant;
        if (this.jt.socketServer != null) {
            this.jt.socketServer.sendOrQueueAdminMsg(null, 'addParticipant', participant.shell());
        }
        return participant;
    }

    isValidPId(pId) {
        return (pId != null && this.allowNewParts) || this.potentialParticipantIds.includes(pId);
    }

    /**
    * Updates client with latest stage information.
    *
    * @param  {type} p description
    * @return {type}   description
    */
    playerRefresh(p) {
        this.io().to(p).emit('set-stage-name', this.curStage().name);
        this.curStage().onPlayerConnect(this.players[p]);
    }

    /**
    * participantMoveToNextApp - description
    *
    * CALLED FROM:
    * - {@link Participant#moveToNextStage}.
    *
    * @param  {type} participant description
    * @return {type}             description
    */
    participantMoveToNextApp(participant) {
        if (participant.getApp() != null) {
            participant.getApp().participantEnd(participant);
        }

        if (participant.appIndex < this.apps.length) {
            participant.appIndex++;
            participant.save();
            this.participantBeginApp(participant);
        } else {
            this.participantEnd(participant);
        }
        this.emitParticipantUpdates();
    }

    /**
    * Overwrite to add custom functionality.
    *
    * @param  {type} participant description
    * @return {type}             description
    */
    participantEnd(participant) {
    }

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
        var participants = this.participants;
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

    participantBeginApp(participant) {
        this.jt.log('Session.participantBeginApp: ' + participant.appIndex);

        if (participant.appIndex < 1 || participant.appIndex > this.apps.length) {
            console.log('Session.participantBeginApp: INVALID appIndex');
            return false;
        }

        var app = this.getApp(participant);

        // If the app has not yet been started, reload it first.
        if (!app.started) {
            let newApp = app.reload();
            this.apps[app.indexInSession() - 1] = newApp;
            app = newApp;
            app.start();
        }

        app.participantBegin(participant);
    }

    stageEndCheck(group) {
        this.jt.log("checking to end stage for group " + group.id);
        this.clockUpdate();
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.clockStop();
            this.stageEnd(group);
        } else {
            this.jt.log('not ending stage');
            this.clockTimerStart();
        }
    }

    participantStart(participant) {
        
    }

    start() {
        if (!this.started) {
            this.started = true;
            for (let p in this.participants) {
                this.participantStart(this.participants[p]);
            }
            this.io().to(this.roomId()).emit('dataUpdate', [{
                roomId: this.roomId(),
                field: 'started',
                value: this.started
            }]);
            this.advanceSlowest();
        }
    }

    roomId() {
        return 'session_' + this.id;
    }

    io() {
        return this.jt.io;
    }

    /**
     * Return the next app in the session for this participant, null if there are no more apps for this participant.
     * @param {Participant} participant 
     */
    getApp(participant) {
        if (participant.appIndex < 1 || participant.appIndex > this.apps.length) {
            return null;
        } else {
            return this.apps[participant.appIndex - 1];
        }
    }

}

var exports = module.exports = {};
exports.new         = Session;
exports.load        = Session.load;
