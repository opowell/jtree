const Player    = require('./Player.js');
const clPlayer  = require('./client/clPlayer.js');
const Utils     = require('./Utils.js');
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
         * @type {String}
         */
        this.id = id;

        /**
         *  Session for this participant.
         * @type {Session}
         */
        this.session = session;

        this.indexInSession = Object.keys(session.participants).length;

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
            'skipToAppIndex',
            'updateScheduled',
            'frames'
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
        Utils.copySavedFields(newParticipant, json, ['session']);
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

        /**
         * List of app ids that this participant has completed.
         */
        this.finishedApps = [];

        /**
         * The apps within stages (see Stage#runFor) this participant is in, outermost first:
         * each with the player whose stage it is, and the participant's periodIndex there.
         * @type {Array.<{run: App, player: Player, periodIndex: number}>}
         */
        this.frames = [];

        /**
         * @type boolean
         * @default false
         */
        this.autoplay = false;
    }

    /**
     * Whether this participant can start stage, as player (by default, their current player).
     */
    canStartStage(stage, player) {
        const current = player == null ? this.player : this.currentPlayerIn(player.app());
        if (current == null) {
            return false;
        }

        // Ready in this stage.
        // TODO: Check whether correct period and app.
        if (
            current.stageIndex === stage.indexInApp() &&
            current.status === 'ready'
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

    /** The app this participant is in: within a stage (see Stage#runFor), the innermost. */
    getApp() {
        if (this.frames.length > 0) {
            return this.frames[this.frames.length - 1].run;
        }
        if (this.appIndex < 1) {
            return null;
        }
        return this.session.getApp(this);
    }

    /** This participant's player in the app of the session they are in, or null. */
    topPlayer() {
        return this.frames.length > 0 ? this.frames[0].player : this.player;
    }

    /**
     * This participant's player in app now: their current player, or, while they are in an
     * app within its stage (see Stage#runFor), the player whose stage that is. For an app of
     * the session they are not in, their player in the app of the session they are in (as
     * before apps had stages with stages); for an app within a stage, null.
     * @param {App} app
     * @return {Player|null}
     */
    currentPlayerIn(app) {
        for (const frame of this.frames) {
            if (frame.player.app() === app) {
                return frame.player;
            }
        }
        if (this.player != null && this.player.app() === app) {
            return this.player;
        }
        return app.parentPeriod == null ? this.topPlayer() : null;
    }

    /**
     * This participant, as player, starts playing the stages of stage, a stage with stages
     * (see Stage#newStage, App#addApp): in the app they run as for player's period
     * (Stage#runFor), from its first period. When they finish it, they go back to player
     * (see exitRun).
     * @param {Stage} stage
     * @param {Player} player
     */
    enterRun(stage, player) {
        const run = stage.runFor(player.period());
        this.frames.push({ run, player, periodIndex: this.periodIndex });
        this.save();
        run.start();
        run.participantBegin(this);
    }

    /**
     * This participant has finished the app within a stage they are in (see enterRun): they go
     * back to the player whose stage it is, who ends it.
     */
    exitRun() {
        const frame = this.frames[this.frames.length - 1];
        this.leaveRun(frame.run);
    }

    /**
     * This participant leaves run, an app within a stage they are in (see enterRun), and the
     * apps within its stages they are in: they go back to the player whose stage run is, who
     * ends it. As when they have finished it (exitRun), or when the stage's time is up.
     * @param {App} run
     */
    leaveRun(run) {
        const index = this.frames.findIndex((f) => f.run === run);
        if (index < 0) {
            return;
        }
        const page = this.getApp().hostApp();
        let frame = null;
        while (this.frames.length > index) {
            frame = this.frames.pop();
            if (frame.timer != null) {
                frame.timer.clear();
            }
            if (this.player != null && this.player.app() === frame.run) {
                this.player.clearTimer();
                this.player.period().participantEnd(this);
            }
            frame.run.leftIds.push(this.id);
            frame.run.participantEndInternal(this);
            this.player = frame.player;
            this.periodIndex = frame.periodIndex;
        }
        this.setPlayer(frame.player);
        // From the page of an app added as a stage (see App#addApp) to this app's.
        const host = frame.player.app().hostApp();
        if (host !== page) {
            for (const client of this.clients) {
                host.addClientDefault(client);
            }
            this.emit('start-new-app');
        }
        frame.player.endStage(true);
    }

    /**
     * After a session is loaded (see Session.load), with player the participant's player in
     * the app of the session they are in: the apps within stages they are in (see enterRun).
     */
    restoreRuns() {
        this.frames = [];
        let player = this.player;
        while (player != null && player.stage != null && player.stage.isContainer() && player.status === 'playing') {
            const run = player.stage.runIn(player.period());
            if (run == null || run.leftIds.includes(this.id)) {
                break;
            }
            let inner = null;
            for (const period of run.periods) {
                const p = period == null ? null : period.playerByParticipantId(this.id);
                if (p != null) {
                    inner = p;
                }
            }
            if (inner == null) {
                break;
            }
            this.frames.push({ run, player, periodIndex: player.period().id - 1 });
            player = inner;
        }
        this.player = player;
    }

    /**
     * Ends this participant's current app (its later stages and periods too) and starts the app
     * at index (from 1) in the session's apps, or ends the session if there is none (oTree's
     * app_after_this_page).
     * @param {number} index
     */
    skipToApp(index) {
        // Out of the apps within stages they are in, too.
        if (this.frames.length > 0) {
            this.player = this.frames[0].player;
            this.frames = [];
        }
        const app = this.getApp();
        if (app !== null) {
            this.finishedApps.push(app.getIdInSession());
            app.participantEndInternal(this);
        }
        this.player = null;
        this.appIndex = index;
        this.save();
        if (this.session.getApp(this) != null) {
            this.session.participantBeginApp(this);
        } else {
            this.endSession();
        }
    }

    endCurrentApp() {

        // An app within a stage: back to the app it is in.
        if (this.frames.length > 0) {
            this.exitRun();
            return;
        }

        const app = this.getApp();
        if (app !== null) {
            this.finishedApps.push(app.getIdInSession());
            // Calls the app's participantEnd, and ends the app if everyone has finished it.
            app.participantEndInternal(this);
        }

        this.player = null;

        this.appIndex++;

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

    startPeriod(period) {
        this.periodIndex = period.id - 1;
        this.getApp().participantBeginPeriod(this);
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
    isFinishedApp(app) {

        // An app within a stage (see Stage#runFor): finished once they have left it.
        if (app.parentPeriod != null) {
            return app.leftIds.includes(this.id);
        }

        // Already finished this app.
        if (this.finishedApps.includes(app.getIdInSession())) {
            return true;
        }

        // Past it: in a later app, skipped over it (see skipToApp), or done with the session.
        if (this.appIndex > app.indexInSession()) {
            return true;
        }

        // In this app.
        if (this.session.getApp(this).getIdInSession() === app.getIdInSession()) {
            // Not yet in the last period.
            const periodIndex = this.frames.length > 0 ? this.frames[0].periodIndex : this.periodIndex;
            if (periodIndex < app.numPeriods - 1) {
                return false;
            }
            // In the last period, but still not 'finished'.
            const player = this.topPlayer();
            if (player !== null && player.status !== 'finished') {
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
            this.player.group.period.app.hostApp().addClientDefault(client);
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
            if (app != null && player.app().rootApp().id !== app.id) {
                continue;
            }
            var points = player.points;
            if (points !== undefined && points !== null && !isNaN(points)) {
                out += parseFloat(points);
            }
        }
        return out;
    }

    /**
     * What this participant is paid: the session's show-up fee, plus the points of each app
     * times its exchange rate (app.exchangeRate, or the session's), rounded to cents.
     * @return {number}
     */
    payment() {
        let money = Number(this.session.showUpFee) || 0;
        for (const app of this.session.apps) {
            const rate = app.exchangeRate != null ? app.exchangeRate : this.session.exchangeRate;
            money += this.pointsForApp(app) * rate;
        }
        return Math.round(money * 100) / 100;
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

    actuallyEmitUpdate() {
        if (this.updateScheduled === true) {
            try {
                console.log('sending update for ' + this.id);
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
        out.payment = this.payment();
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
        out.payment = this.payment();
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
