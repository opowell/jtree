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
        this.session = session;

        // this.indexInSession = Object.keys(session.proxy.__target.state.participants).length;

        /**
         * @type array of arrays of players, one sub-array for each game, with the sub-array containing one player for each period in the game.
         * @default []
         */
        this.players = [];

        /**
         * The current player of this participant.
         * @type {Player}
         * @default null
         */
        this.player = null;

        /**
         * @type array
         * @default []
         */
        this.clients = [];

        /**
         * Array of indices, indicating in which period of game this player is in.
         * @type number
         * @default -1
         */
        this.periodIndices = {};

        /**
         * List of app ids that this participant has completed.
         */
        this.finishedApps = [];

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

        let proxyObj = {
            player: this.player,
        }

        this.proxy = Observer.create(proxyObj, function(change) {
            global.jt.socketServer.sendMessage(this.channel(), change);
            return true; // to apply changes locally.
        });
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

    addPlayer(player, period) {
        let gamePath = period.game.getGamePath();
        let parentPath = this.players;
        for (let i=0; i<gamePath.length; i++) {
            if (parentPath[gamePath[i]] == null) {
                parentPath[gamePath[i]] = [];
            }
            parentPath = parentPath[gamePath[i]]; // select last game 
            parentPath = parentPath[parentPath.length-1]; // select last period in game
        }
        parentPath[period.id - 1] = player; 
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
        let games = this.session.gameTree;
        for (let i=0; i<this.gameIndices.length; i++) {
            if (this.gameIndices[i][0] < 0) {
                return null;
            }
            games = games[this.gameIndices[i][0]];
        }
        return games;
    }

    incrementGame() {
        let game = this.getGame();
        // Move to next period of current game.
        this.gameIndices[this.gameIndices.length-1][1]++;

        // If any games finished, move superGame to next period.
        for (let i=this.gameIndices.length-1; i>=0; i--) {
            // If finished last period of this game, move to next period.
            if (game.numPeriods === this.gameIndices[i][1]) {
                if (i > 0) {
                    // Last game in supergame, move to next period of supergame.
                    if (game.indexInSuperGame() === game.superGame.subgames.length-1) {
                        this.gameIndices[i-1][1]++;
                        this.gameIndices.splice(i, 1);
                    } 
                    // Not last game of supergame, move to next subgame of supergame.
                    else {
                        this.gameIndices[i][0]++;
                        this.gameIndices[i][1] = 0;
                    }
                }
            }

            // Move up the game tree.
            game = game.superGame;

        }
    }

    endCurrentApp() {

        if (this.getGame() !== null) {
            this.getGame().participantEnd(this);
            this.finishedApps.push(this.getGame().getIdInSession());
        }

        this.player = null;

        // this.appIndex++;
        this.incrementGame();

        var nextApp = this.session.getApp(this);
        if (nextApp != null) {
            //nextApp.participantBegin(this);
//            this.startApp(nextApp);
            this.session.participantBeginApp(this);
        } else {
            this.endSession();
        }
    }

    endSession() {
        this.session.participantEnd(this);
        this.session.tryToEnd();
    }

    refreshClients() {
        this.emit('reload');
    }

    getGamePeriod(game) {
        if (this.periodIndices[game.roomId()] == null) {
            this.periodIndices[game.roomId()] = -1;
        }
        return this.periodIndices[game.roomId()];
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
        this.periodIndices[period.game.roomId()] = period.id - 1;
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
        return 'session_' + this.id + '_participant_' + this.id;
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
        if (this.player != null) {
            // this.player.addClient(client);
            // this.player.group.addClient(client);
            // this.player.group.period.addClient(client);
            this.player.group.period.app.addClientDefault(client);
        }

        let session = global.jt.data.getSession(this.session.id);

        // Listen to message from clients.
        client.on('endGame', function(data) { // subgame messages are sent by default when submit button is clicked.
            session.pushMessage(client, data.data, 'endGame');
        });

        // Queue message.
        client.endGame = function(data) {
            session.pushMessage(client, data, 'endGameProcess');
        }

        // Process the message.
        client.endGameProcess = function(data) {

            global.jt.log('Server received auto-game submission: ' + JSON.stringify(data));

            if (client.player() === null) {
                return false;
            }

            if (client.player().game.id !== data.fnName) {
                console.log('Game.js, GAME NAME DOES NOT MATCH: ' + client.player().game.id + ' vs. ' + data.fnName + ', data=' + JSON.stringify(data));
                return false;
            }

            // TODO: Not parsing strings properly.
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
                        client.player()[fieldName] = value;
                    } else if (property.startsWith('group.')) {
                        var fieldName = property.substring('group.'.length);
                        client.group()[fieldName] = value;
                    } else if (property.startsWith('participant.')) {
                        var fieldName = property.substring('participant.'.length);
                        client.participant[fieldName] = value;
                    } else if (property.startsWith('period.')) {
                        var fieldName = property.substring('period.'.length);
                        client.period()[fieldName] = value;
                    } else if (property.startsWith('game.')) {
                        var fieldName = property.substring('game.'.length);
                        client.game()[fieldName] = value;
                    }
                }
            }
            /** console.log('msg: ' + JSON.stringify(data) + ', ' + client.player().roomId());*/
            var endForGroup = true;
            client.player().endStage(endForGroup);
        };

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
        this.player = player;
        for (var i=0; i<this.clients.length; i++) {
            var client = this.clients[i];
            player.addClient(client);
            player.group.addClient(client);
            player.period().addClient(client);
        }
        // this.emit('participantSetPlayer', {player: player.shellWithParent()});
    }

    actuallyEmitUpdate() {
        if (this.updateScheduled === true) {
            try {
                if (this.player !== null) {
                    this.player.emit('playerUpdate', new clPlayer.new(this.player));
                } else {
                    this.emit('start-new-app'); // refresh clients.
                }
                this.updateScheduled = false;
            } catch (err) {
                debugger;
            }
        }
    }

    emitUpdate() {
        this.updateScheduled = true;
    }

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
