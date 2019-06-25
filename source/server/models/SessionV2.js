const Observer = require('micro-observer').Observer;
const Utils         = require('./Utils.js');
const Participant   = require('./Participant.js');
const fs            = require('fs-extra');
const path          = require('path');
const clone     = require('../clone.js');
const Client        = require('./Client.js');
const Game        = require('./Game.js');
const async         = require('async');

class SessionV2 {

    constructor(jt) {
        this.jt = jt;
        this.id = Utils.getDate();

        // A filestream for writing to this session's object states.
        try {
            // fs.ensureDirSync(this.getOutputDir());
        } catch (err) {
            console.log(err);
        }

        this.initialState = {
            timeStarted: 0,
            started: false,
            participants: [],
            gameTree: [],
            potentialParticipantIds: this.jt.settings.participantIds,
            id: this.id,
            stateId: 0,
        };

        let proxyObj = {
            id: this.id,
            messages: [],
            messageLatest: true,
            messageIndex: 0, // 0 means no messages, 1 is first message, etc.
            clients: [],
            state: this.initialState,
        }

        this.asyncQueue = async.queue(this.processQueueMessage, 1);

        this.objectList = [];
        
        this.setProxy(proxyObj);

    }

    setProxy(proxyObj) {
        const thisSession = this;

        this.proxy = Observer.create(proxyObj, function(change) {
            let msg = {
                arguments: [],
                function: change.function,
                path: change.path,
                property: change.property,
                type: change.type,
                newValue: change.newValue,
            }
            if (change.arguments != null) {
                for (let i=0; i<change.arguments.length; i++) {
                    msg.arguments.push(change.arguments[i]);
                }
            }
            if (change.type === 'function-call' && !['splice', 'push', 'unshift'].includes(change.function)) {
                return true;
            }
            if (msg.newValue != null) {
                let x = global.jt.replaceExistingObjectsWithLinks(msg.newValue, thisSession.objectList);
                msg.newValue = x;
            }
            if (msg.arguments != null) {
                for (let i=0; i < msg.arguments.length; i++) {
                    let x = global.jt.replaceExistingObjectsWithLinks(msg.arguments[i], thisSession.objectList);
                    msg.arguments[i] = x;
                }
            }
            msg.newValue = global.jt.flatten(msg.newValue);
            msg.arguments = global.jt.flatten(msg.arguments);
            console.log('change from session: ' + msg.path);
            msg.source = 'session';
            jt.socketServer.io.to(thisSession.roomId()).emit('objChange', msg);
            thisSession.save();
            // for (let i in thisSession.proxy.state.participants) {
            //     let participant = thisSession.proxy.state.participants[i];
            //     jt.socketServer.io.to(participant.roomId()).emit('objChange', msg);
            // }
            return true; // to apply changes locally.
        });

    }

    dataReviver(key, value) {
        if (
            (value != null) &&
            (typeof value.startsWith === 'function') &&
            value.startsWith("/Function(") &&
            value.endsWith(")/")
        ) {
            value = value.substring(10, value.length - 2);
            try {
                return eval("(" + value + ")");
            } catch (err) {
                console.log(err);
            }
        } else {
            return value;
        }
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
        var session = new SessionV2(jt, folder);
        var all = fs.readFileSync(path.join(jt.path, jt.settings.sessionsFolder + '/' + folder + '/' + folder + '.json')).toString();
        let proxyObj = Parser.parse(all, session.dataReviver);
        session.id = proxyObj.id;
        for (let i=0; i<proxyObj.messages.length; i++) {
            if (proxyObj.messages[i].state != null) {
                let state = proxyObj.messages[i].state;
                for (let j=0; j<state.participants.length; j++) {
                    state.participants[j] = Participant.load(state.participants[j], state);
                }
                for (let j=0; j<state.gameTree.length; j++) {
                    state.gameTree[j] = Game.load(state.gameTree[j], state);
                }
            }
        }
        session.setProxy(proxyObj);
        return session;
    }

    getOutputDir() {
        return this.jt.settings.sessionsFolder + '/' + this.id;
    }

    getGSFFile() {
        return this.getOutputDir() + '/' + this.id + '.json';
    }

    addGame(state, {filePath, options}) {
        let fullpath = path.join.apply(null, filePath);
        var game = this.jt.data.loadGame(fullpath, state, options);
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

    addParticipants(num) {
        let partsAdded = 0;

        // Search through the list of participantIds until one is found for which
        // no participant already exists.
        if (this.potentialParticipantIds == null) {
            return;
        }

        for (var i=0; i<this.potentialParticipantIds.length; i++) {
            let pId = this.potentialParticipantIds[i];
            let ptcptAlreadyExists = this.participants[pId] !== undefined;

            // No participant already exists, so create one.
            if (!ptcptAlreadyExists) {
                this.addMessage(
                    'participantCreate',
                    pId,
                );
                partsAdded++;

                // Check if enough participants have been created. If yes, exit.
                if (partsAdded >= num) {
                    return;
                }
            }
        }
    }

   
    endGame(state, msgData) {

        let {endForGroup, data, participantId} = msgData;

        global.jt.log('Server received auto-game submission: ' + JSON.stringify(data));

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
            console.log('Game.js, GAME NAME DOES NOT MATCH: ' + client.player().game.id + ' vs. ' + data.fnName + ', data=' + JSON.stringify(data));
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
    }

    getState() {
        return this.loadMessageState(this.proxy.messageIndex-1);
    }

    setNumParticipants(num) {
        let change = num - Object.keys(this.getState().participants).length;
        if (change > 0) {
            this.addParticipants(change);
        } else if (change < 0) {
            this.removeParticipants(-change);
        }
    }

    removeParticipants(num) {
        const parts = this.getState().participants;
        for (let i=0; i<num; i++) {
            let len = Object.keys(parts).length;

            if (len < 1) {
                return;
            }

            let part = parts[Object.keys(parts)[len-1]];
            let pId = part.id;
            this.addMessage(
                'deleteParticipant',
                pId,
            );
        }
    }

    deleteParticipant(state, pId) {
        for (let i in state.participants) {
            if (state.participants[i].id === pId) {
                delete state.participants[i];
                break;
            }
        }
    }
    
    createNewParticipant() {
        let i = 0;
        let pId;
        let participant = {};
        while (participant != null) {
            i++;
            pId = 'P' + i;
            participant = Utils.findById(this.getState().participants, pId);
        }
        this.addMessage(
            'participantCreate',
            pId,
        );

    }

    isValidPId(pId) {
        return true;
    }

    /**
    * participantCreate - description
    *
    * @param  {type} pId description
    * @return {type}     description
    */
   participantCreate(state, pId) {
        if (!this.isValidPId(pId)) {
            return null;
        }
        var participant = new Participant.new(pId, state);
        let proxy = Participant.getProxy(participant);
        state.participants.push(proxy);
    }

    addMessage(name, content) {
        console.log('adding message: ' + name + (content==null ? '' : (', ' + content)));
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

    save() {
        try {
            var data = global.jt.flatten(this.proxy.__target);
            // fs.writeFileSync(this.getGSFFile(), data);
        } catch (err) {
            debugger;
            console.log('ERROR Session.saveDataFS: ' + err.stack);
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
            // let newState = prevState;

            newState.stateId++;

            // Copy participants to the new state proxy.
            for (let i=0; i<newState.participants.length; i++) {
                let part = newState.participants[i];
                let proxy = Participant.getProxy(part);
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

    shell() {
        return this.proxy.__target;
    }

    // shellWithChildren() {
    //     return this.proxy.__target;
    // }

    roomId() {
        return 'session_' + this.id;
    }

    start(state) {
        if (!state.started) {
            state.started = true;
            for (let p in state.participants) {
                this.participantStart(state.participants[p]);
            }
            this.advanceSlowest(state);
        }
    }

    participantStart(participant) {
        
    }

    /**
    * Move slowest participants to their next stage. See {@link Participant#moveToNextStage}.
    *
    */
   advanceSlowest(state) {
        var parts = SessionV2.slowestParticipants(state);
        for (var i=0; i<parts.length; i++) {
            this.participantMoveToNextGame(parts[i]);
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
   participantMoveToNextGame(participant) {
        if (participant.getGame() != null) {
            participant.getGame().participantEnd(participant);
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

    participantEnd(participant) {

    }

    participantBeginApp(participant) {
        this.jt.log('Session.participantBeginApp: ' + participant.gameIndex);

        if (participant.gameIndex < 0 || participant.gameIndex >= participant.session.gameTree.length) {
            console.log('Session.participantBeginApp: INVALID gameIndex');
            return false;
        }

        var game = participant.getGame();

        // If the app has not yet been started, reload it first.
        // if (!game.started) {
        //     let newGame = game.reload();
        //     participant.session.gameTree[game.indexInSession() - 1] = newGame;
        //     game = newGame;
        //     // app.start();
        // }

        game.participantBegin(participant);
    }

    saveDataFS(d, type) {
        // try {
        //     var a = JSON.stringify(d) + '\n';
        //     var b = '"type":"' + type + '",';
        //     var position = 1;
        //     var output = [a.slice(0, position), b, a.slice(position)].join('');
        //     this.fileStream.write(output);
        // } catch (err) {
        //     console.log('ERROR Session.saveDataFS: ' + err.stack);
        // }
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
    * Sends a page to a client (via the given HTTPResponse object).
    * @param  {HTTPRequest} req description
    * @param  {HTTPResponse} res description
    */
   sendParticipantPage(req, res, participantId) {
        var participant = this.participant(participantId);

        // Not a participant yet
        if (participant == null) {
            res.sendFile(path.join(global.jt.path, this.participantUI() + '/readyClient.html'));
            return;
        }

        const app = participant.getGame();

        // Not in an app yet.
        if (app == null) {
            res.sendFile(path.join(global.jt.path, this.participantUI() + '/readyClient.html'));
            return;
        }

        app.sendParticipantPage(req, res, participant);
    }

    io() {
        return global.jt.io;
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

        var client = new Client.new(socket, this.proxy.state.__target);
        client.participant = participant.__target;
        participant.clientAdd(client);
        this.proxy.clients.push(client);
        global.jt.socketServer.io.to(socket.id).emit('logged-in', global.jt.flatten(participant.__target));
        return client;
    }

    messageCallback() {}

    pushMessage(obj, da, funcName) {
        var msg = {obj: obj, data: da, fn: funcName};
        this.asyncQueue.push(msg, this.messageCallback);
    }

    /**
    * clientRemove - description
    *
    * @param  {type} socket description
    * @return {type}        description
    */
   clientRemove(socket) {
        var socketId = socket.id;
        global.jt.log('removing client: ' + socketId);
        for (var i=this.proxy.clients.length - 1; i>=0; i--) {
            var client = this.proxy.clients[i];
            if (client.id === socketId) {
                if (client.participant !== null) {
                    client.participant.clientRemove(client.id);
                }
                this.proxy.clients.splice(i, 1);
                // global.jt.socketServer.sendOrQueueAdminMsg(null, 'remove-client', client.shell());
            }
        }
    }

    // TODO: Check for slowest participants.
    static slowestParticipants(state) {
        var out = [];
        let parts = state.participants;
        for (var i in parts) {
            var part = parts[i];
            out.push(part);
        }
        return out;
    }
}

var exports = module.exports = {};
exports.new         = SessionV2;
exports.load        = SessionV2.load;
