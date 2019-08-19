const Player    = require('./Player.js');
const clPlayer  = require('./client/clPlayer.js');
const Utils     = require('./Utils.js');
const path      = require('path');
const Observer = require('micro-observer').Observer;

/**
 * A participant in the experiment.
 */
class Participant {

    /*
     * constructor - description
     *
     * @param  {type} id      description
     * @param  {type} session description
     * @return {type}         description
     */
    constructor(id, session) {
        /**
         * Unique identifier for this participant.
         * @type {String}
         */
        this.id = id;

        /**
         *  Session for this participant.
         * @type {Session}
         */
        while (session.__target == null) {
            session = session.__target;
        }
        this.session = session;
        /**
         * @type array of arrays of players, one sub-array for each game, with the sub-array containing one player for each period in the game.
         * @default []
         */
        this.players = [];

        // this.indexInSession = Object.keys(session.proxy.__target.state.participants).length;

        /**
         * @type array
         * @default []
         */
        this.clients = [];

        // /**
        //  * Array of indices, indicating in which period of game this player is in.
        //  * @type number
        //  * @default -1
        //  */
        // this.periodIndices = {};

        // /**
        //  * List of app ids that this participant has completed.
        //  */
        // this.finishedApps = [];

        /**
         * @type boolean
         * @default false
         */
        this.autoplay = false;

        /**
         * 'outputHide' fields are not included in output.
         * @type Array
         * @default []
         */
        this.outputHide = [];

        /**
         * 'outputHideAuto' fields are not included in output.
         * @type {String[]}
         */
        this.outputHideAuto = [
            'this',
            'session',
            'players',
            'clients',
            'outputHide',
            'outputHideAuto',
            'player',
            'period',
            'autoplay',
            'appTimer',
            'indexInSession',
            'finishedApps',
            'proxy',
        ];

        // Index of games and periods that this participant is in.
        // [[g1, p1], [g2, p2], ...]
        // g1 = index of participant in session's top-level game tree.
        // p1 = index of participant in periods of first game.
        // g2 = index of participant in g1's subgames.
        // p2 = index of participant in g2's periods.
        this.gameIndices = [[-1, 0]];

        this.gameIndex = -1;

        // this.gameTree = [];

        this.player = null;

    }

    getProxy() {

        // let participant = this;

        // while (participant.__target != null) {
        //     participant = participant.__target;
        // }

        // let thisSession = participant.session.nonObs.session;

        // let proxy = Observer.create(participant, function(change) {
        //     if (change.type === 'function-call' && !['splice', 'push', 'unshift'].includes(change.function)) {
        //         return true;
        //     }
    
        //     let msg = {
        //         arguments: [],
        //         function: change.function,
        //         path: change.path,
        //         property: change.property,
        //         type: change.type,
        //         newValue: change.newValue,
        //     }
    
        //     if (change.arguments != null) {
        //         for (let i=0; i<change.arguments.length; i++) {
        //             msg.arguments.push(change.arguments[i]);
        //         }
        //     }
    
        //     let substitute = true;
        //     if (msg.path === 'objectList') { // Additions to the object list do not need modification.
        //         substitute = false;
        //     }
    
        //     if (substitute) {
    
        //         // Track the number of new objects added to the list, so that all new objects can be added at once.
        //         // Initially, objects are added without triggering a change event.
        //         // Then after all substitutions are finished, the change event is triggered.
        //         let curNumOL = thisSession.proxy.objectList.length;
    
        //         if (msg.newValue != null) {
        //             let x = global.jt.replaceExistingObjectsWithLinks(msg.newValue, thisSession.proxy.objectList.__target, thisSession.originalObjectsList);
        //             msg.newValue = x;
        //         }
        //         if (msg.arguments != null) {
        //             for (let i=0; i < msg.arguments.length; i++) {
        //                 let x = global.jt.replaceExistingObjectsWithLinks(msg.arguments[i], thisSession.proxy.objectList.__target, thisSession.originalObjectsList);
        //                 msg.arguments[i] = x;
        //             }
        //         }
    
        //         // Trigger change.
        //         let newNumOL = thisSession.proxy.objectList.length;
        //         if (curNumOL < newNumOL) {
        //             let newObjectsOL = thisSession.proxy.objectList.__target.splice(curNumOL, newNumOL - curNumOL);
        //             thisSession.proxy.objectList.push(...newObjectsOL);
        //         }
    
        //     }
    
        //     msg.newValue = global.jt.flatten(msg.newValue);
        //     msg.arguments = global.jt.flatten(msg.arguments);
    
        //     console.log('change from participant: ' + msg.path);
    
        //     msg.source = 'participant';
    
        //     jt.socketServer.io.to(thisSession.roomId()).emit('objChange', msg);
        //     return true; // to apply changes locally.
        // });

        return this;

    }

    /**
     * @static load - description
     *
     * CALLED FROM:
     * - {@link Session#load}
     *
     * @param  {type} json    description
     * @param  {type} session description
     * @return {type}         description
     */
    static load(json, session) {
        var id = json.id;
        var newParticipant = new Participant(id, session);
        for (var j in json) {
            if (j !== 'session') {
                newParticipant[j] = json[j];
            }
        }
        return newParticipant;
    }

    /**
     * Move this participant to their next stage.
     *
     * If the participant is already playing in an app as a player, call that player's {@link Player#moveToNextStage} function. Otherwise, call {@link Session#participantMoveToNextApp}.
     */
    moveToNextStage() {
        if (this.player === null) {
            this.session.participantMoveToNextApp(this);
        } else {
            this.player.endStage(true);
        }
    }

    getFullSession() {
        return global.jt.data.getSession(this.session.id);
    }

    addPlayer(player) {

        if (this.player != null) {
            this.player.subPlayers.push(player);
        } else {
            this.players.push(player);
        }

        // Find location of period in this.gameTree.
        // Insert player into same location in playerTree.
        // let period = player.group.period;

        // let gamePath = period.getGameTreePath();
        // let gameRoot = period.game;
        // while (gameRoot.superGame != null) {
        //     gameRoot = gameRoot.superGame;
        // }
        // for (let i=0; i<this.gameTree.length; i++) {
        //     if (this.gameTree[i] === gameRoot) {
        //         gamePath.unshift(i);
        //     }
        // }

        // let parentPath = this.players;
        // for (let i=0; i<gamePath.length; i++) {
        //     if (parentPath[gamePath[i]] == null) {
        //         parentPath[gamePath[i]] = [];
        //     }
        //     parentPath = parentPath.subplayers[gamePath[i]]; // select last game 
        //     parentPath = parentPath[parentPath.length-1]; // select last period in game
        // }
        // parentPath[period.id - 1] = player; 
        // this.players.push(player);
    }

    printStatus() {
        if (this.player == null) {
            console.log(this.id + ' - no player');
        } else {
            this.player.showStatus();
        }
    }

    canStartStage(stage) {
        if (this.player === null) {
            return false;
        }

        // Ready in this stage.
        // TODO: Check whether correct period and app.
        if (
            this.player.stageIndex === stage.indexInApp() &&
            this.player.status === 'ready'
        ) {
            return true;
        }

        return false;
    }

    finishCurrentApp() {
        // ensure that they are in the last period and waiting
        if (this.player.group.period.id < this.getApp().numPeriods) {
            // this.player.group.
        }
    }

    /**
     * Return the current game (if any) in the session for this participant. 
     * Potentially used to start the game for the participant, therefore the player for the game might not exist yet.
     * Must calculate using indices.
     * @param {Participant} participant 
     */
    getGame() {
        if (this.gameIndex < 0 || this.gameIndex >= this.session.gameTree.length) {
            return null;
        }
        return this.session.gameTree[this.gameIndex];
    }

    incrementGame() {
        // let game = this.getGame();
        // Move to next period of current game.
        // this.gameIndices[this.gameIndices.length-1][1]++;

        // // If any games finished, move superGame to next period.
        // for (let i=this.gameIndices.length-1; i>=0; i--) {
        //     // If finished last period of this game, move to next period.
        //     if (game.numPeriods === this.gameIndices[i][1]) {
        //         if (i > 0) {
        //             // Last game in supergame, move to next period of supergame.
        //             if (game.indexInSuperGame() === game.superGame.subgames.length-1) {
        //                 this.gameIndices[i-1][1]++;
        //                 this.gameIndices.splice(i, 1);
        //             } 
        //             // Not last game of supergame, move to next subgame of supergame.
        //             else {
        //                 this.gameIndices[i][0]++;
        //                 this.gameIndices[i][1] = 0;
        //             }
        //         }
        //     }

        //     // Move up the game tree.
        //     game = game.superGame;

        // }

        this.gameIndex++;
    }

    endCurrentApp() {

        if (this.getGame() !== null) {
            this.getGame().participantEnd(this);
            this.finishedApps.push(this.getGame().getIdInSession());
        }

        this.player = null;

        this.getFullSession().participantMoveToNextGame(this);
        // this.incrementGame();

        // var nextGame = this.getGame();
        // if (nextGame != null) {
        //     nextGame.participantBegin(this);
        // } else {
        //     this.endSession();
        // }
    }

    endSession() {
        this.session.participantEnd(this);
        this.session.tryToEnd();
    }

    refreshClients() {
        this.emit('reload');
    }

    getGamePeriod(game) {
        let periodIndex = -1;

        if (this.player != null && this.player.group.period.app.id === game.id) {
            periodIndex = this.player.group.period.id - 1;
        }

        return periodIndex;

        // if (this.periodIndices[game.roomId()] == null) {
        //     this.periodIndices[game.roomId()] = -1;
        // }
        // return this.periodIndices[game.roomId()];
    }

    // startApp(app) {

    //     // this.appIndex = app.indexInSession();
    //     this.periodIndex = -1;
    //     app.participantStart(this);
    //     this.startPeriod(app.getNextPeriod(this));

    //     this.emit('participantSetAppIndex', {appIndex: app.indexInSession()});
    //     this.emit('start-new-app'); // refresh clients.
    //     this.updateScheduled = false;
    // }

    startPeriod(period) {
        // this.periodIndices[period.game.roomId()] = period.id - 1;
        period.game.participantBeginPeriod(this);
    }

    canProcessMessage() {
        return true;
    }



    /**
     * roomId - description
     *
     * @return {type}  description
     */
    roomId() {
        // return this.session.roomId() + '_participant_' + this.id;
        // return 'session_' + this.id + '_participant_' + this.id;
        return 'session_' + this.session.id + '_participant_' + this.id;
    }

    /**
     * stageId - description
     *
     * @return {type}  description
     */
    stageId() {
        if (this.player == null) {
            return null;
        } else {
            return this.player.stage.id;
        }
    }

    stageIndex() {
        if (this.player === null) {
            return -1;
        } else {
            return this.player.stage.indexInApp();
        }
    }

    /**
     * isFinishedApp - checks whether Participant is finished the given App.
     *
     * CALLED FROM
     * - {@link App#tryToEndApp}
     *
     * @param  {App} app The given app.
     * @return {boolean} If the player is in a previous app, as given by the app's
     * indexInSession compared to the participant's appIndex, then return false.
     * If the player is in a previous app, return false.
     * If the player is in this app,
     *   + not yet in the last period, return false.
     *   + in the last period, but still 'playing', return false.
     *   + in the last period and not 'playing', return true.
     * If the player is past this app, true.
     *
     */
    isFinishedApp(app) {

        // Already finished this app.
        if (this.finishedApps.includes(app.getIdInSession())) {
            return true;
        }

        // In this app.
        if (this.getApp().getIdInSession() === app.getIdInSession()) {
            // Not yet in the last period.
            if (this.periodIndex < app.numPeriods - 1) {
                return false;
            }
            // In the last period, but still not 'finished'.
            if (this.player !== null && this.player.status !== 'finished') {
                return false;
            }
            // Finished all periods.
            return true;
        }

        // Not in this app, and not finished it already.
        return false;
    }

    isFinishedGame(game) {
        let gamePath = game.getGameIndices();
        let player = this.getPlayer(gamePath);

        if (player == null) {
            return false;
        }

        if (player.status === 'done') {
            return true;
        }

        return false;
    }

    getPlayer(gamePath) {
        let players = this.players;
        for (let i=0; i<gamePath.length; i++) {
            players = players[gamePath[i]]; // select sub-array of children from this game.
            players = players[players.length-1]; // select last period of this subgame.
        }
        return players;
    }

// TODO: Remove??
    isFinishedSession() {
        // In an app.
        if (this.appIndex <= this.session.apps.length) {
            return false;
        } else {
            return true;
        }
    }

    emit(name, dta) {
        if (dta === undefined) {
            dta = {};
        }
        dta.participantId = this.id;
        dta.sessionId = this.session.id;
        global.jt.socketServer.io.to(this.roomId()).emit(name, dta);
//        this.session.io().to(this.session.roomId()).emit(name, dta);
    }

    clientRemove(clientId) {
        Utils.deleteById(this.clients, clientId);
        // this.session.jt.socketServer.sendOrQueueAdminMsg(null, 'objChange', {
        //     type: 'set-value',
        //     path: 'session.participants.' + this.id + '.numClients',
        //     newValue: this.clients.length,
        // });
    }

    clientAdd(client) {
        this.clients.push(client);
        // this.clientProxies.push(client.proxy);
        client.getSocket().join(this.roomId());
        client.getSocket().join(this.session.nonObs.session.roomId());
        console.log('subscribing to ' + this.session.nonObs.session.roomId());
        // if (this.player != null) {
        //     // this.player.addClient(client);
        //     // this.player.group.addClient(client);
        //     // this.player.group.period.addClient(client);
        //     this.player.group.period.app.addClientDefault(client);
        // }

        let session = global.jt.data.getSession(this.session.id);

        // Listen to message from clients.
        client.on('endGame', function(data) { // subgame messages are sent by default when submit button is clicked.
            session.pushMessage(session, {
                data: data.data,
                endForGroup: true,
                participantId: client.participant.id,
            }, 'endGame');
        });

    }

    outputFields() {
        var fields = [];
        for (var prop in this) {
            if (
                !Utils.isFunction(this[prop]) &&
                !this.outputHide.includes(prop) &&
                !this.outputHideAuto.includes(prop)
            )
            fields.push(prop);
        }
        return fields;
    }

    points() {
        var out = 0;
        for (var p in this.players) {
            var points = this.players[p].points;
            if (points !== undefined && points !== null && !isNaN(points)) {
                out += parseFloat(this.players[p].points);
            }
        }
        return out;
    }

    setPlayer(player) {
        let stageId = (player != null && player.stage != null) ? player.stage.id : 'null';
        console.log('settting participant player: ' + this.id + ', ' + stageId);
        player.updateGamePath();
        // while (player.__target != null) {
        //     player = player.__target;
        // }
        this.player = player;
    }

    // actuallyEmitUpdate() {
    //     if (this.updateScheduled === true) {
    //         try {
    //             if (this.player !== null) {
    //                 this.player.emit('playerUpdate', new clPlayer.new(this.player));
    //             } else {
    //                 this.emit('start-new-app'); // refresh clients.
    //             }
    //             this.updateScheduled = false;
    //         } catch (err) {
    //             debugger;
    //         }
    //     }
    // }

    // emitUpdate() {
    //     this.updateScheduled = true;
    // }

    shell() {
        var out = {};
        var fields = this.outputFields();
        for (var f in fields) {
            var field = fields[f];
            out[field] = this[field];
        }
        out.numClients = this.clients.length;
        if (this.player !== null) {
            out.player = this.player.shellWithParent();
        } else {
            out.player = null;
        }
        out.numPoints = this.points();
        return out;
    }

    // shellAll() {
    //     var out = {};
    //     var fields = this.outputFields();
    //     for (var f in fields) {
    //         var field = fields[f];
    //         out[field] = this[field];
    //     }
    //     out.numClients = this.clients.length;
    //     if (this.player != null) {
    //         out.player = this.player.shellWithChildren();
    //     } else {
    //         out.player = null;
    //     }
    //     out.numPoints = this.points();
    //     out.playerIds = [];
    //     out.players = [];
    //     for (var i in this.players) {
    //         out.playerIds[i] = this.players[i].roomId();
    //         out.players.push(this.players[i].shell());
    //     }
    //     return out;
    // }

    // shellLocal() {
    //     var out = {};
    //     var fields = this.outputFields();
    //     for (var f in fields) {
    //         var field = fields[f];
    //         out[field] = this[field];
    //     }
    //     out.playerIds = [];
    //     for (var i in this.players) {
    //         out.playerIds.push(this.players[i].compId());
    //     }
    //     out.playerIds = JSON.stringify(out.playerIds);
    //     out.playerId = null;
    //     if (this.player !== null) {
    //         out.playerId = JSON.stringify(this.player.compId());
    //     }
    //     return out;
    // }

    save() {
        try {
            global.jt.log('Participant.save: ' + this.id);
            // var localData = this.shellLocal();
            // this.session.saveDataFS(localData, 'PARTICIPANT');
        } catch (err) {
            console.log('Error saving participant ' + this.id + ': ' + err + '\n' + err.stack);
        }
    }

}

var exports = module.exports = {};
exports.new = Participant;
exports.load = Participant.load;
exports.getGame = Participant.getGame;
