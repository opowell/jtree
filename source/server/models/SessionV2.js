const Observer = require('micro-observer').Observer;
// const deepcopy = require('deepcopy');
const Utils         = require('./Utils.js');
const Participant   = require('./Participant.js');
const fs            = require('fs-extra');
const path          = require('path');
const flatted = require('flatted');
const clone     = require('clone');
const Client        = require('./Client.js');

class SessionV2 {

    constructor(jt) {
        this.jt = jt;
        this.id = Utils.getDate();

        // A filestream for writing to this session's object states.
        try {
            fs.ensureDirSync(this.getOutputDir());
        } catch (err) {
            console.log(err);
        }

       /**
        * The time at which this session was last started.
        * @type number
        */

        this.initialState = {
            timeStarted: 0,
            started: false,
            participants: [],
            gameTree: [],
        };

        let proxyObj = {
            id: this.id,
            messages: [],
            messageLatest: true,
            messageIndex: 0, // 0 means no messages, 1 is first message, etc.
            clients: [],
            state: this.initialState,
        }
        
        const thisSession = this;

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
            msg.newValue = flatted.stringify(msg.newValue);
            msg.arguments = flatted.stringify(msg.arguments);
            console.log('emit message: \n' + JSON.stringify(msg, null, 4));
            // jt.socketServer.io.to(jt.socketServer.ADMIN_TYPE).emit('objChange', msg);
            jt.socketServer.io.to(thisSession.roomId()).emit('objChange', msg);
            thisSession.save();
            return true; // to apply changes locally.
        });

    }

    getOutputDir() {
        return this.jt.settings.sessionsFolder + '/' + this.id;
    }

    getGSFFile() {
        return this.getOutputDir() + '/' + this.id + '.gsf';
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
            this.deleteParticipant(pId);
        }
    }

    deleteParticipant(pId) {
        delete this.getState().participants[pId];
        this.addMessage(
            'deleteParticipant',
            pId,
        );
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
        state.participants.push(participant);
    }

    addMessage(name, content) {
        console.log('adding message: ' + name + ', ' + content);
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
            var data = JSON.stringify(this.proxy.__target.data, null, 4);
            fs.writeFileSync(this.getGSFFile(), data);
        } catch (err) {
            debugger;
            console.log('ERROR Session.saveDataFS: ' + err.stack);
        }
    }

    setMessageIndex(index) {
        this.proxy.messageIndex = index;
        let state = this.loadMessageState(index-1);
        if (state.__target != null) {
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
            // Copy of previous state.
            // let newState = deepcopy(this.loadMessageState(index-1));
            let prevState = this.loadMessageState(index-1);
            if (prevState.__target != null) {
                prevState = prevState.__target;
            }
            // let flatState = flatted.stringify(prevState);
            // let newState = flatted.parse(flatState);
            let newState = clone(prevState);

            this.processMessage(newState, this.proxy.messages[index]);
            this.proxy.messages[index].state = newState;
        }

        return this.proxy.messages[index].state;
    }

    processMessage(state, message) {
        // debugger;
        // let that = this.__target;
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
            this.participantBeginApp(participant);
        } else {
            this.participantEnd(participant);
        }
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
        socket.join(this.roomId());
        participant.clientAdd(client);
        this.proxy.clients.push(client);
        // global.jt.socketServer.sendOrQueueAdminMsg(null, 'addClient', client.shell());
        global.jt.socketServer.io.to(socket.id).emit('logged-in', flatted.stringify(participant.__target));
        global.jt.socketServer.io.to(socket.id).emit('sessionUpdate', flatted.stringify(participant.session.__target));
        // if (participant.player !== null) {
        //     participant.player.sendUpdate(socket.id);
        // }
        return client;
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
