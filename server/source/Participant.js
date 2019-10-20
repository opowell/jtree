const Player    = require('./Player.js');
const clPlayer  = require('./client/clPlayer.js');
const Utils     = require('./Utils.js');
const path      = require('path');
const {stringify} = require('flatted/cjs');

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

        this.indexInSession = session.proxy.state.participants.length;

        /**
         * @type array
         * @default []
         */
        this.clients = [];

        this.reset();

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
            'updateScheduled'
        ];

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
        session.proxy.state.participants.push(newParticipant);
    }

    /**
     * Move this participant to their next stage.
     *
     * If the participant is already playing in an app as a player, call that player's {@link Player#moveToNextStage} function. Otherwise, call {@link Session#participantMoveToNextApp}.
     */
    moveToNextStage() {
        if (this.player === null) {
            this.session.participantMoveToNextGame(this);
        } else {
            this.player.endStage(true);
        }
    }

    printStatus() {
        if (this.player == null) {
            console.log(this.id + ' - no player');
        } else {
            this.player.showStatus();
        }
    }

    reset() {
        /**
         * @type array
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
         * Indexed at 0.
         * @type number
         * @default -1
         */
        this.periodIndex = -1;
        /**
         * The current app index of this participant.
         * 0 indicates no current app.
         * @type number
         * @default 0
         */
        this.appIndex = 0;
        this.gameIndex = -1;
        this.gameIndices = [[-1, 0]];


        /**
         * List of app ids that this participant has completed.
         */
        this.finishedApps = [];

        /**
         * @type boolean
         * @default false
         */
        this.autoplay = false;
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

    getApp() {
        if (this.appIndex < 1) {
            return null;
        }
        return this.session.getApp(this);
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

    getFullSession() {
        return global.jt.data.getSession(this.session.id);
    }
    
    endSession() {
        this.session.participantEnd(this);
        this.session.tryToEnd();
    }

    refreshClients() {
        this.emit('reload');
    }

    startPeriod(period) {
        this.periodIndex = period.id - 1;
        this.player.game.participantBeginPeriod(this);
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
        return this.session.roomId() + '_participant_' + this.id;
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

    incrementGame() {
        this.gameIndex++;
    }

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
        dta = stringify(dta);
        this.session.io().to(this.roomId()).emit(name, dta);
//        this.session.io().to(this.session.roomId()).emit(name, dta);
    }

    clientRemove(clientId) {
        Utils.deleteById(this.clients, clientId);
    }

    clientAdd(client) {
        this.clients.push(client);
        client.getSocket().join(this.roomId());
        // client.getSocket().join(this.session.nonObs.session.roomId());

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
        return this.pointsForApp(null);
    }

    /**
     * Returns the points the participant earned in the given app.
     * If app is null, returns points earned across all apps.
     */
    pointsForApp(app) {
        let out = 0;
        for (var p in this.players) {
            let player = this.players[p];
            if (app != null && player.app().id !== app.id) {
                continue;
            }
            var points = player.points;
            if (points !== undefined && points !== null && !isNaN(points)) {
                out += parseFloat(points);
            }
        }
        return out;
    }

    setPlayer(player) {
        let stageId = (player != null && player.stage != null) ? player.stage.id : 'null';
        // console.log('settting participant player: ' + this.id + ', ' + stageId);
        player.updateGamePath();
        this.player = player;
    }

    getProxy() {
        return this;
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

    actuallyEmitUpdate() {
        if (this.updateScheduled === true) {
            try {
                // console.log('sending update for ' + this.id);
                if (this.player !== null) {
                    this.player.emit('playerUpdate', this);
                } else {
                    this.emit('start-new-app'); // refresh clients.
                }
                this.updateScheduled = false;
            } catch (err) {
                console.log(err);
                debugger;
            }
        }
    }

    getGame() {
        if (this.gameIndex < 0 || this.gameIndex >= this.session.gameTree.length) {
            return null;
        }
        return this.session.gameTree[this.gameIndex];
    }
    
    emitUpdate() {
        this.updateScheduled = true;
    }

    save() {
        try {
            // global.jt.log('Participant.save: ' + this.id);
            var localData = this;
            this.session.saveDataFS(localData, 'PARTICIPANT');
        } catch (err) {
            console.log('Error saving participant ' + this.id + ': ' + err + '\n' + err.stack);
        }
    }

}

var exports = module.exports = {};
exports.new = Participant;
exports.load = Participant.load;
