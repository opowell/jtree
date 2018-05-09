const Player = require('./Player.js');
const clPlayer = require('./client/clPlayer.js');
const Utils = require('./Utils.js');
const path      = require('path');
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
         */
        this.id = id;

        /**
         *  Session for this participant.
         */
        this.session = session;
        this.players = [];
        this.player = null;
        this.clients = [];

        // Indexed at 0.
        this.periodIndex = -1;

        /**
         * The current app index of this participant.
         * 0 indicates no current app.
         */
        this.appIndex = 0;

        this.autoplay = false;

        // 'outputHide' fields are not included in output
        this.outputHide = [];
        // 'outputHideAuto' fields are not included in output.
        this.outputHideAuto = ['this', 'session', 'players', 'clients', 'outputHide', 'outputHideAuto', 'player', 'period', 'autoplay'];
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
        session.participants[id] = newParticipant;
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
            this.player.attemptToEndStage(true);
        }
    }

    canStartStage(stage) {
        if (this.player === null) {
            return false;
        }

        // Done previous stage.
        if (
            this.player.stageIndex === stage.indexInApp()-1 &&
            this.player.status === 'done'
        ) {
            return true;
        }

        // Ready in this stage.
        if (
            this.player.stageIndex === stage.indexInApp() &&
            this.player.status === 'ready'
        ) {
            return true;
        }

        return false;
    }

    endCurrentApp() {
        if (this.app() !== null) {
            this.app().participantEnd(this);
        }

        var nextApp = this.session.getNextApp(this);
        if (nextApp !== null) {
            this.startApp(nextApp);
        } else {
            this.endSession();
        }
    }

    endSession() {
        this.session.participantEnd(this);
        this.session.tryToEnd();
    }

    startApp(app) {

        this.appIndex = app.indexInSession();
        this.periodIndex = -1;
        app.participantStart(this);
        this.startPeriod(app.getNextPeriod(this));

        this.emit('participantSetAppIndex', {appIndex: app.indexInSession()});
        this.emit('start-new-app'); // refresh clients.
    }

    startPeriod(period) {
        this.periodIndex = period.id - 1;
        this.app().participantBeginPeriod(this);
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

    app() {
        if (this.appIndex < 1 || this.appIndex > this.session.apps.length) {
            return null;
        } else {
            return this.session.apps[this.appIndex-1];
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
        // In a previous app.
        if (this.appIndex < app.indexInSession()) {
            return false;
        }
        // In this app.
        else if (this.appIndex === app.indexInSession()) {
            // Not yet in the last period.
            if (this.periodIndex < app.numPeriods - 1) {
                return false;
            }
            // In the last period, but still 'playing'.
            if (this.player !== null && this.player.status === 'playing') {
                return false;
            }
            // Finished all periods and no longer 'playing'.
            return true;
        }
        // Already past this app.
        else {
            return true;
        }
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
        this.session.io().to(this.roomId()).emit(name, dta);
//        this.session.io().to(this.session.roomId()).emit(name, dta);
    }

    clientRemove(clientId) {
        Utils.deleteById(this.clients, clientId);
    }

    clientAdd(client) {
        this.clients.push(client);
        client.socket.join(this.roomId());
        if (this.player != null) {
            this.player.addClient(client);
            this.player.group.addClient(client);
            this.player.group.period.addClient(client);
            this.player.group.period.app.addClientDefault(client);
        }
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
                out += this.players[p].points;
            }
        }
        return out;
    }

    setPlayer(player) {
        this.player = player;
        this.save();
        for (var i=0; i<this.clients.length; i++) {
            var client = this.clients[i];
            player.addClient(client);
            player.group.addClient(client);
            player.period().addClient(client);
        }
        this.emit('participantSetPlayer', {player: player.shellWithParent()});
    }

    emitUpdate() {
        try {
//            console.log(this.id + ', ' + this.player.app().indexInSession() + ', ' + this.player.period().id + ', ' + this.player.stage.id + ', ' + this.player.status);
            this.player.emit('playerUpdate', new clPlayer.new(this.player));
        } catch (err) {
            debugger;
        }
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
        out.session = this.session.shell();
        return out;
    }

    shellAll() {
        var out = {};
        var fields = this.outputFields();
        for (var f in fields) {
            var field = fields[f];
            out[field] = this[field];
        }
        out.numClients = this.clients.length;
        if (this.player != null) {
            out.player = this.player.shellWithChildren();
        } else {
            out.player = null;
        }
        out.numPoints = this.points();
        out.playerIds = [];
        out.players = [];
        for (var i in this.players) {
            out.playerIds[i] = this.players[i].roomId();
            out.players.push(this.players[i].shell());
        }
        return out;
    }

    shellLocal() {
        var out = {};
        var fields = this.outputFields();
        for (var f in fields) {
            var field = fields[f];
            out[field] = this[field];
        }
        out.playerIds = [];
        for (var i in this.players) {
            out.playerIds.push(this.players[i].compId());
        }
        out.playerIds = JSON.stringify(out.playerIds);
        out.playerId = null;
        if (this.player !== null) {
            out.playerId = JSON.stringify(this.player.compId());
        }
        return out;
    }

    save() {
        try {
            this.session.jt.log('Participant.save: ' + this.id);
            var localData = this.shellLocal();
            this.session.saveDataFS(localData, 'PARTICIPANT');
        } catch (err) {
            console.log('Error saving participant ' + this.id + ': ' + err + '\n' + err.stack);
        }
    }

}

var exports = module.exports = {};
exports.new = Participant;
exports.load = Participant.load;
