const Player    = require('./Player.js');
const Timer     = require('./Timer.js');
const Utils     = require('./Utils.js');
const Table     = require('./Table.js');
const fs        = require('fs-extra');
const path      = require('path');
const CircularJSON = require('./circularjson.js');

/** A group of players playing in a {@link Period}. */
class Group {
    /**
    * Create a new Group.
    *
    * @param  {String} id     The id of this group.
    * @param  {Period} period The period this group belongs to.
    */
    constructor(id, period) {
        /**
         * this group's id
         * @type {String}
         */
        this.id = id;

        /**
         * Each Group belongs to a single Period.
         * @type {Period}
         */
        this.period = period;

        /**
         * a list of the players in this group.
         * @type array
         * @default []
         */
        this.players = [];

        /**
         * whether or not all players in this group have been created yet.
         * @type boolean
         * @default false
         */
        this.allPlayersCreated = false;

        /**
         * 'outputHide' fields are not included in output.
         * @type array
         * @default []
         */
        this.outputHide = [];

        /**
         * 'outputHideAuto' fields are not included in output.
         * @type {String[]}
         */
        this.outputHideAuto = ['stage', 'status', 'outputHide', 'outputHideAuto', 'players', 'stageTimer', 'period', 'tables', 'type', 'stageIndex', 'stageEndedIndex'];

        /**
         * @type array
         * @default []
         */
        this.tables = [];

        /**
         * @type number
         * @default 0
         */
        this.stageIndex = 0;


        this.stageStartedIndex = -1;
        this.stageEndedIndex = -1;
    }

    /**
     * Returns the stage that this group is currently in.
     */
    stage() {
        return this.app().stages[this.stageIndex];
    }

    /**
     * Loads the group from a given set of data.
     *
     * CALLED FROM:
     * - {@link Session#load}
     *
     * @param  {type} json    The JSON data describing the group.
     * @param  {type} session The session to which the group belongs.
     * @return {Group}         The group.
     */
    static load(json, session, data) {
        var app = session.apps[json.appIndex-1];
        var period = app.periods[json.periodId-1];
        var id = json.id;
        var newGroup = new Group(id, period);
        if (period.groups.length > id-1) {
            var curGroup = period.groups[id-1];
            newGroup.players = curGroup.players;
        }
        for (var j in json) {
            newGroup[j] = json[j];
        }
        if (json !== null && json.stageTimerStart !== undefined) {
            var lastTimeOn = data.lastTimeOn;
            var timeLeft = json.stageTimerTimeLeft;
            if (session.isRunning) {
                timeLeft = timeLeft - (lastTimeOn - new Date(json.stageTimerStart).getTime());
                if (timeLeft >= 0) {
                    var stage = app.stages[json.stageTimerStageIndex];
                    var group = newGroup;
                    var callback = eval('(' + json.stageTimerCallback + ')');
                    newGroup.stageTimer = Timer.load(json.stageTimerDuration, timeLeft, json.stageTimerStageIndex, callback);
                    newGroup.stageTimer.resume();
                    newGroup.save();
                }
            }
        }
        period.groups[id-1] = newGroup;
    }

    /**
     * Find the player with the given participant ID.
     * @param  {String} id the given id.
     * @return {type}    the player where player.participant.id == id.
     */
    playerByParticipantId(id) {
        for (var i=0; i<this.players.length; i++) {
            if (this.players[i].participant.id === id) {
                return this.players[i];
            }
        }
        return null;
    }

    /**
     * playerWithParticipant - description
     *
     * @param  {type} participant description
     * @return {type}             description
     */
    playerWithParticipant(participant) {
        return this.playerByParticipantId(participant.id);
    }

    slowestPlayers() {
        var out = [];
        var minStageIndex = null;
        for (var i in this.players) {
            var part = this.players[i];
            if (minStageIndex === null || part.stageIndex <= minStageIndex) {
                if (minStageIndex === null || part.stageIndex < minStageIndex) {
                    minStageIndex = part.stageIndex;
                    out = [];
                }
                out.push(part);
            }
        }
        return out;
    }

    addTable(name) {
        this[name] = new Table.new(name, 'this.context.emit', this, this.roomId(), this.session());
        this.tables.push(name);
    }

    playerWithId(id) {
        for (var i=0; i<this.players.length; i++) {
            if (this.players[i].idInGroup === id) {
                return this.players[i];
            }
        }
        return null;
    }

    jt() {
        return this.session().jt;
    }

    canProcessMessage() {
        return true;
    }

    /**
     * old - description
     *
     * @return {type}  description
     */
    old() {
        return this.app().previousGroup(this);
    }

    /**
     * playersExcept - description
     *
     * @param  {type} player description
     * @return {type}        description
     */
    playersExcept(player) {
        return this.playersExceptIds([player.id]);
    }

    playersExceptIds(ids) {
        if (!Array.isArray(ids)) {
            ids = [ids];
        }
        var out = [];
        for (var i=0; i<this.players.length; i++) {
            if (!ids.includes(this.players[i].participant.id)) {
                out.push(this.players[i]);
            }
        }
        return out;
    }

    clearStageTimer() {
        //console.log('clearing stage timer');
        if (this.stageTimer !== undefined) {
            this.stageTimer.clear();
            this.stageTimer = undefined;
        }
    }

    /**
     * isFinished - description
     *
     * @return {type}  description
     */
    isFinished() {
        for (var i=0; i<this.players.length; i++) {
            if (!this.players[i].isFinished()) {
                return false;
            }
        }
        return true;
    }

    /*
     * outputFields - description
     *
     * @return {type}  description
     */
    outputFields() {
        var fields = [];
        for (var prop in this) {
            if (
                !Utils.isFunction(this[prop]) &&
                !this.outputHide.includes(prop) &&
                !this.outputHideAuto.includes(prop) &&
                !this.tables.includes(prop)
            )
            fields.push(prop);
        }
        return fields;
    }

    player(id) {
        return Utils.findByIdWOJQ(this.players, id);
    }

    /**
     * shell - description
     *
     * @return {type}  description
     */
    shellWithParent() {
        var out = {};
        var fields = this.outputFields();
        for (var f in fields) {
            var field = fields[f];
            out[field] = this[field];
        }
        out.period = this.period.shellWithParent();
        out.numPlayers = this.players.length;
        if (this.stageTimer !== undefined) {
            out.stageTimerStart = this.stageTimer.timeStarted;
            out.stageTimerDuration = this.stageTimer.duration;
        } else {
            out.timer = 'none';
        }
        out.tables = this.tables;
        for (var i in this.tables) {
            var name = this.tables[i];
            if (this[name] != null) {
                out[name] = this[name].shell();
            }
        }

        return out;
    }

    shellForPlayerUpdate() {
        var out = this.shellWithChildren();
        out.period = this.period.shellWithParent();
        return out;
    }

    timeInStage() {
        if (this.stageTimer == null) {
            return 0;
        }
        return this.stageTimer.state().timeElapsed;
    }

    /**
     * emitUpdate - description
     *
     * @return {type}  description
     */
    emitUpdate() {
        this.emit('groupUpdate', this.shellWithChildren());
    }

    /**
     * Returns the sum of "field" over all players in the group.
     * 
     * @param {String} field 
     */
    sum(field) {
        return Utils.sum(this.players, field);
    }

    /**
     * Emit the given message to subscriber's of this group.
     *
     * @param  {type} msgTitle The title of the message.
     * @param  {type} msgData  The data of the message.
     */
    emit(msgTitle, msgData) {
        this.session().io().to(this.roomId()).emit(msgTitle, CircularJSON.stringify(msgData));
    }

    /**
     * session - description
     *
     * @return {@link Session}  The session that this group belongs to.
     */
    session() {
        return this.period.session();
    }

    /**
     * roomId - description
     *
     * @return {type}  description
     */
    roomId() {
        return this.period.roomId() + '_group_' + this.id;
    }

    /*
     * moveToNextStage - description
     *
     * @return {type}  description
     */
    moveToNextStage() {
        for (var i=0; i<this.players.length; i++) {
            this.app().playerMoveToNextStage(this.players[i]);
        }
    }

    showStatus() {
        console.log('Group ' + this.id + ': stageIndex=' + this.stageIndex + ', stageEndedIndex=' + this.stageEndedIndex);
        this.session().printStatuses();
    }

    /**
     * Returns the app this group is in.
     *
     * @return {App}  The app.
     */
    app() {
        return this.period.app;
    }

    /*
     * Add client to this group.<br>
     * 1. The client joins this group's channel.
     *
     * @param  {type} client description
     */
    addClient(client) {
        client.socket.join(this.roomId());
    }

    /**
     * shellAll - description
     *
     * @return {type}  description
     */
    shellWithChildren() {
        var out = {};
        var fields = this.outputFields();
        for (var f in fields) {
            var field = fields[f];
            out[field] = this[field];
        }
        out.period = this.period.id;
        out.players = [];
        for (var i in this.players) {
            out.players[i] = this.players[i].shellWithChildren();
        }
        if (this.stageTimer !== undefined) {
            out.stageTimerStart = this.stageTimer.timeStarted;
            out.stageTimerDuration = this.stageTimer.duration;
            out.stageTimerTimeLeft = this.stageTimer.timeLeft;
        }
        out.tables = this.tables;
        for (var i in this.tables) {
            var name = this.tables[i];
            if (this[name] !== undefined) {
                out[name] = this[name].shell();
            }
        }
        return out;
    }

    /*
     * getOutputDir - description
     *
     * @return {type}  description
     */
    getOutputDir() {
        return this.period.getOutputDir() + '/groups/' + this.id;
    }

    /**
     * shellLocal - description
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
        out.tables = this.tables;
        if (this.stageTimer !== undefined) {
            out.stageTimerStart = this.stageTimer.timeStarted;
            out.stageTimerDuration = this.stageTimer.duration;
            out.stageTimerTimeLeft = this.stageTimer.timeLeft;
            out.stageTimerStageIndex = this.stageTimer.stageIndex;
            out.stageTimerCallback = this.stageTimer.callback.toString();
        }
        out.periodId = this.period.id;
        out.appIndex = this.app().indexInSession();
        return out;
    }

    /**
     * save - description
     */
    save() {
        try {
            this.session().jt.log('Group.save: ' + this.roomId());
            var toSave = this.shell();
            this.session().saveDataFS(toSave, 'GROUP');
            for (var i=0; i<this.tables.length; i++) {
                var table = this[this.tables[i]];
                if (table !== undefined) {
                    this[this.tables[i]].save();
                }
            }

        } catch (err) {
            console.log('Error saving group ' + this.id + ': ' + err);
            console.log(err.stack);
        }
    }

    canPlayersStart(stage) {
        
        if (this.stageStartedIndex >= stage.indexInApp()) {
            return true;
        }

        // If do not need to wait for all players, return true.
        if (!stage.waitToStart) {
            return true;
        }

        // If any player is not ready, return false.
        for (let p in this.players) {
            let player = this.players[p];
            if (!player.isReady(stage.indexInApp())) {
                return false;
            }
        }

        return true;

    }

    canPlayersEnd(stage) {

        // If Group has already finished, do not allow players to finish. 
        if (this.stageEndedIndex >= stage.indexInApp()) {
            return false;
        }

        // If do not need to wait for all players, return true.
        if (!stage.waitToEnd) {
            return true;
        }

        // If any player is not finished playing, return false.
        for (let p in this.players) {
            let player = this.players[p];
            if (!player.isFinished()) {
                return false;
            }
        }

        // Otherwise, return true.
        return true;
    }

//     checkIfWaitingToEnd(stage, endPlayers, canParticipate) {
//         console.log('Group.checkIfWaitingToEnd: ' + this.roomId());
//         this.showStatus();
//         if (canParticipate == null) {
//             canParticipate = true;
//         }

//         let group = this;
//         // Wait for players to submit their forms.
//         var waitingForPlayers = false;

//         if (!canParticipate) {
//             this.attemptToStartNextStage();
//             return;
//         }

//         if (stage.waitOnTimerEnd) {
//             for (var p in group.players) {
//                 var player = group.players[p];
//                     // If player is in an earlier stage, wait.
//                     if (player.stage.indexInApp() < stage.indexInApp()) {
//                         waitingForPlayers = true;
//                     } else if (player.stage.indexInApp() > stage.indexInApp()) {
//                         // If player is past this stage, proceed.
//                     } else {
//                         // If player is in this stage and not finished...
//                         if (!player.isFinished()) {
//                             // If any clients are connected, let player finish via call to "endStage".
//                             if (player.participant.clients.length > 0) {
//                                 waitingForPlayers = true;
//                                 if (endPlayers) {
//                                     player.emit('endStage', player.shellWithParent());
//                                 }
//                             }
//                             // If not, end player immediately.
//                             else {
//                                 if (endPlayers) {
//                                     console.log('No connected clients for ' + player.id + ', ending immediately.');
//                                     player.attemptToEndStage(false);
//                                 } else {
//                                     waitingForPlayers = true;
//                                 }
//                             }
//                         }
//                 }
//             }
//         }

//         // If not waiting for any players, proceed without waiting for players to submit their forms.
//         if (!waitingForPlayers) {
//             for (var p in group.players) {
//                 var player = group.players[p];
//                 if (player.stage.id === stage.id && player.status !== 'done') {
//                     player.justEndStage();
//                 }
//             }
//             console.log(this.jt().settings.getConsoleTimeStamp() + ' END   - GROUP : ' + stage.id + ', ' + group.roomId());
//             stage.groupEnd(group);
//             this.attemptToStartNextStage();
//         } else {
// //             debugger;
//         }

//     }










    startStage(stage) {

        if (!stage.canGroupParticipate(this)) {
            this.endStage();
        }

        if (!stage.canGroupStart(this)) {
            return;
        }

        this.stageStartedIndex++;
        this.stageIndex = stage.indexInApp();
        let groupDuration = stage.getGroupDuration(this);
        if (groupDuration > 0) {
            let timeOutCB = function(stage) {
                this.session().addMessageToStartOfQueue(this, stage, 'forceEndStage');
            }.bind(this, stage);
            this.stageTimer = new Timer.new(
                timeOutCB,
                groupDuration*1000,
                stage.indexInApp()
            );
        }

        try {
            console.log(this.jt().settings.getConsoleTimeStamp() + ' START - GROUP : ' + stage.id + ', ' + this.roomId());
            stage.groupStart(this);
        } catch (err) {
            console.log(err.stack);
        }
        try {
            this.save();
        } catch (err) {}
        for (var p in this.players) {
            try {
                this.players[p].startStage(stage);
            } catch (err) {}
        }
    }

    forceEndStage(stage) {
        console.log('Group.forceEndStage: ' + stage.id);
        this.clearStageTimer();
        this.endStage(stage, true);
    }

    endStage(stage, forcePlayersToEnd) {

        if (forcePlayersToEnd == null) {
            forcePlayersToEnd = false;
        }

        if (!stage.canGroupEnd(this, forcePlayersToEnd)) {
            return;
        }

        // If waiting for any players, stop.
        if (this.waitingForPlayersInStage(stage, forcePlayersToEnd)) {
            return;
        }

        this.clearStageTimer();

        for (var p in this.players) {
            var player = this.players[p];
            if (player.stage.id === stage.id && player.status !== 'finished') {
                player.endStage(false);
            }
        }
        console.log(this.jt().settings.getConsoleTimeStamp() + ' END   - GROUP : ' + stage.id + ', ' + this.roomId());
        this.stageEndedIndex = stage.indexInApp();
        stage.groupEnd(this);

        if (stage.waitToEnd) {
            for (var p in this.players) {
                let player = this.players[p];
                if (player.stageIndex === stage.indexInApp()) {
                    player.moveToNextStage();
                }
            }
        }

        this.stageIndex = stage.indexInApp() + 1;
        if (this.stageIndex < this.app().stages.length) {
            // move group (and all its players) to next stage.
            this.startStage(this.stage());
        } else {
            // move all players to next period.
            for (var p in this.players) {
                this.players[p].moveToNextStage();
            }
        }

    }

    // Check if this group is waiting for players to finish playing the given stage.
    // If it is, tell those players to end the stage.
    // Return whether or not any player
    waitingForPlayersInStage(stage, forcePlayersToEnd) {
        let waitingForPlayers = false;
        if (stage.waitOnTimerEnd) {
            for (var p in this.players) {
                var player = this.players[p];
                    // If player is in an earlier stage, wait.
                    if (player.stage.indexInApp() < stage.indexInApp()) {
                        waitingForPlayers = true;
                    } else if (player.stage.indexInApp() > stage.indexInApp()) {
                        // If player is past this stage, proceed.
                    } else {
                        // If player is in this stage and not finished...
                        if (!player.isFinished()) {
                            waitingForPlayers = true;
                            if (forcePlayersToEnd) {
                                // If any clients are connected, let player finish via call to "endStage".
                                if (player.participant.clients.length > 0) {
                                    player.emit('endStage', player.shellWithParent());
                                }
                                // If not, end player immediately.
                                else {
                                    console.log('No connected clients for ' + player.id + ', ending immediately.');
                                    player.endStage(false);
                                }
                            }
                        }
                }
            }
        }
        return waitingForPlayers;
    }

}

var exports = module.exports = {};
exports.new = Group;
exports.load = Group.load;
