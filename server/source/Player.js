// @flow

const Utils     = require('./Utils.js');
const path      = require('path');
const clPlayer  = require('./client/clPlayer.js');

/** Class representing a player. */
class Player {

    constructor(id, participant, group, idInGroup) {

        /**
         * This player's participant.
         * @type {Participant}
         */
        this.participant = participant;

        /**
         * This player's group.
         * @type {Group}
         */
        this.group = group;

        /**
         * The player's ID.
         * @type {String}
         */
        this.id = id;

        /**
         * @type {Number}
         */
        this.idInGroup = idInGroup;

        /**
         * @type number
         * @default 0
         */
        this.points = 0; // points from the current period


        /**
         * The current status of this player.
         *
         * 1. 'ready': the player is ready to play their current stage, but is waiting (for their fellow group members).
         * 2. 'playing': the player is playing their current stage.
         * 3. 'done': the player is done playing their current stage, waiting to call 'Stage.playerEnd(player)'.
         * 4. 'finished': player is ready to move to next stage.
         * 
         * See Session Flow tutorial for more details.
         * 
         * @type string
         * @default 'ready'
         */
        this.status = 'ready';

        /**
         * @type number
         * @default 0
         */
        this.stageIndex = 0

        /**
         * @type {Stage}
         * @default null
         */
        this.stage = null;

        /**
         * 'outputHide' fields are not included in output.
         * @type Array
         * @default []
         * @private
         */
        this.outputHide = [];

        /**
         * 'outputHideAuto' fields are not included in output.
         * @type {String[]}
         * @private
         */
        this.outputHideAuto = [
            'appIndex',
            'group',
            'groupId',
            'outputHide',
            'outputHideAuto',
            'participant',
            'periodId',
            'stage',
            'stageTimer',
            'stageClientDuration',
            'this',
            'type'
        ];
    }

    timeInStage() {
        return this.group.timeInStage();
    }

    asClPlayer() {
        return new clPlayer.new(this);
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

    // /**
    //  * Move this player to their next stage.
    //  *
    //  * If this player is currently in a stage, call {@link Stage#playerEnd}.
    //  * Otherwise, call {@link App#playerMoveToNextStage}.
    //  *
    //  * @return {type}  description
    //  */
    // moveToNextStage() {
    //     console.log('player.moveToNextStage: ' + this.roomId());
    //     this.session().printStatuses();

    //     if (this.stage !== null) {
    //         this.stage.playerEnd(this);
    //     } else {
    //         // TODO: Delete.
    //         console.log('SHOULD NEVER HAPPEN??');
    //         debugger;
    //         this.app().playerMoveToNextStage(this);
    //     }
    // }

    recordStageEndTime(stage) {
        let timeStamp = this.timeStamp();
        this['timeEnd_' + stage.id] = timeStamp;
        if (this['timeStart_' + stage.id] == null) {
            console.log('Player ERROR, missing stage start time! Using end time.');
            this['timeStart_' + stage.id] = timeStamp;
        }
        this['msInStage_' + stage.id] = Utils.dateFromStr(timeStamp) - Utils.dateFromStr(this['timeStart_' + stage.id]);
    }

    recordStageStartTime(stage) {
        let timeStamp = this.timeStamp();
        console.log(timeStamp + ' START - PLAYER: ' + stage.id + ', ' + this.roomId());
        this['timeStart_' + stage.id] = timeStamp;
    }

    jt() {
        return this.session().jt;
    }

    canProcessMessage() {
        return (this.status === 'playing');
    }


    /**
     * roomId - description
     *
     * @return {type}  description
     */
    roomId() {
        return this.group.roomId() + '_player_' + this.id;
    }

    static genRoomId(player) {
        var sId     = player.group.period.app.session.id;
        var aId     = player.group.period.app.id;
        var prdId   = player.group.period.id;
        var gId     = player.group.id;
        var pId     = player.id;
        return 'session_' + sId + '_app_' + aId + '_period_' + prdId + '_group_' + gId + '_period_' + pId;
    }

    /**
     * appIndex - description
     *
     * @return {type}  description
     */
    appIndex() {
        return this.participant.appIndex;
    }

    /**
     * periodIndex - description
     *
     * @return {type}  description
     */
    periodIndex() {
        return this.period().id;
    }

    /**
     * period - description
     *
     * @return {type}  description
     */
    period() {
        return this.group.period;
    }

    /**
     * The next stage for this player.
     **/
    nextStage() {
        var stageInd = this.stageIndex;

        // If not in the last stage, return next stage.
        if (stageInd < this.app().stages.length-1) {
            return this.app().stages[stageInd+1];
        }

        // If in the last stage, but not the last period, return first stage (of next period).
        else if (this.period().id < this.app().numPeriods) {
            return this.app().stages[0];
        }

        // If not in the last app, return first stage of next app.
        else {
            var app = this.session().appFollowing(this.app());
            if (app !== null && app.stages.length > 0) {
                return app.stages[0];
            }
            // Otherwise, return null.
            else {
                return null;
            }
        }
    }


    /**
     * otherPlayersInGroup - description
     *
     * @return {type}  description
     */
    otherPlayersInGroup() {
        return this.group.playersExcept(this);
    }

    /**
     * addClient - description
     *
     * @param  {type} client description
     */
    addClient(client) {
        client.socket.join(this.roomId());
    }

    /**
     * compId - description
     *
     * @return {type}  description
     */
    compId() {
        var out = {};
        out.playerId = this.id;
        out.groupId = this.group.id;
        out.periodId = this.group.period.id;
        out.appId = this.group.period.app.id;
        out.sessionId = this.group.period.app.session.id;
        out.roomId = this.roomId();
        return out;
    }

    /**
     * app - description
     *
     * @return {@link App}  The app that this player is a member of.
     */
    app() {
        return this.period().app;
    }

    /**
     * matchesPlayer - description
     *
     * @param  {type} plyrShell description
     * @return {boolean}           whether or not the inputted player matches this one.
     */
    matchesPlayer(p) {
        return (
            p.id === this.id &&
            p.group.id === this.group.id &&
            p.group.period.id === this.group.period.id &&
            p.group.period.app.id === this.app().id && // TODO: update to match index instead of ID
            p.group.period.app.session.id === this.session().id
        )
    }

    /**
     * old - description
     *
     * @return {type}  description
     */
    old() {
        return this.app().previousPlayer(this);
    }

    /**
     * session - description
     *
     * @return {type}  description
     */
    session() {
        return this.app().session;
    }

    /**
     * emit - description
     *
     * @param  {type} name description
     * @param  {type} dta  description
     */
    emit(name, dta) {
        dta.participantId = this.participant.id;
        dta.sessionId = this.session().id;
        this.io().to(this.roomId()).emit(name, dta);
        this.session().emitToAdmins(name, dta);
    }

    io() {
        return this.session().io();
    }

    /**
     * this - description
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
        out.participantId = this.participant.id;
        out.groupId = this.group.id;
        out.periodId = this.period().id;
        out.appIndex = this.app().indexInSession();
        return out;
    }

    shellWithParticipant() {
        var out = this.shellWithParent();
        out.participant = this.participant.shell();
        var group = this.group;
        if (group.stageTimer !== undefined) {
            out.stageTimerStart = group.stageTimer.timeStarted;
            out.stageTimerDuration = group.stageTimer.duration;
            out.stageTimerTimeLeft = group.stageTimer.timeLeft;
            out.stageTimerRunning = group.stageTimer.running;
        }
        if (this.stage.clientDuration > 0) {
            out.stageClientDuration = this.stage.clientDuration;
        }
        return out;
    }

    shellWithParent() {
        var out = {};
        var fields = this.outputFields();
        for (var f in fields) {
            var field = fields[f];
            out[field] = this[field];
        }
        out.group = this.group.shellWithParent();
        if (this.stage !== null && this.stage !== undefined) {
            out.stage = this.stage.shellWithParent();
        }
        return out;
    }

    /**
    * CALLED FROM
    * - {@link Participant#shellAll}
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
        out.groupId = this.group.roomId();
        out.roomId = this.roomId();
        if (this.stage !== null && this.stage !== undefined) {
            out.stageId = this.stage.id;
        } else {
            out.stageId = null;
        }
        out.participantId = this.participant.id;
        if (this.group.stageTimer !== undefined) {
            out.stageTimerStart = this.group.stageTimer.timeStarted;
            out.stageTimerDuration = this.group.stageTimer.duration;
            out.stageTimerTimeLeft = this.group.stageTimer.timeLeft;
            out.stageTimerRunning = this.group.stageTimer.running;
        }

        if (this.stage != null && this.stage.clientDuration > 0) {
            out.stageClientDuration = this.stage.clientDuration;
        }

        return out;
    }

    /**
     * emitUpdate - description
     *
     * @return {type}  description
     */
    emitUpdate() {
        this.emit('playerUpdate', this.shellWithChildren());
    }

    emitUpdate2() {
        this.participant.emitUpdate();
    }

    /**
     * sendUpdate - description
     *
     * @param  {type} channel description
     */
    sendUpdate(channel) {
        // p: send this player's data
        // channel: channel to send this player's data to,
        // usually either the player themselves or an individual
        // client that is subscribed to the player.
        if (this.stage === null || this.stage.onPlaySendPlayer) {
            this.io().to(channel).emit('playerUpdate', new clPlayer.new(this));
        }
    }

    /**
     * isFinished - description
     *
     * @return {type}  description
     */
    isFinished() {
        var actualPlyr = this.participant.player;

        // No active player.
        if (actualPlyr === null) {
            return false;
        }

        // Already past this app.
        if (actualPlyr.group.period.app.indexInSession() > this.group.period.app.indexInSession()) {
            return true;
        }
        // Still in this app.
        else if (actualPlyr.group.period.app.indexInSession() === this.group.period.app.indexInSession()) {
            // Already past this period.
            if (actualPlyr.group.period.id > this.group.period.id) {
                return true;
            }
            // Still in this period.
            else if (actualPlyr.group.period.id === this.group.period.id) {
                if (['finished', 'done'].includes(actualPlyr.status)) {
                    return true;
                } else {
                    return false;
                }
            }
            // Not yet in this period.
            else {
                return false;
            }
        }
        // Not yet in this app.
        else {
            return false;
        }
    }

    /**
     * isReady - description
     *
     * @return {type}  description
     */
    isReady(stageIndex) {
        var actualPlyr = this.participant.player;

        // No active player.
        if (actualPlyr == null || this.roomId() !== actualPlyr.roomId()) {
            return false;
        }

        if (this.stageIndex !== stageIndex) {
            return false;
        }

        if (this.status !== 'ready') {
            return false;
        }

        return true;
    }

    /**
     * save - description
     *
     */
    save() {
        try {
            this.session().jt.log('Player.save: ' + this.roomId());
            var toSave = this.shell();
            this.session().saveDataFS(toSave, 'PLAYER');
        } catch (err) {
            console.log('Error saving player ' + this.roomId() + ': ' + err + '\n' + err.stack);
        }
    }

    saveAndUpdate() {
        this.io().to(this.roomId()).emit('playerUpdate', this.asClPlayer());
        this.save();
    }

    /**
     * Is the player at least finished the given stage of the given period?
     *
     * Return false if any of the following are true:
     * - the player is in a previous app.
     * - the player is in the same app, but a previous period.
     * - the player is in the same period, but a previous stage.
     * - the player is in the same stage, but is still 'playing'.
     *
     * Otherwise return true.
     *
     * CALLED FROM:
     * - {@link Stage#playerCanGroupProceedToNextStage}.
     */

    atLeastFinishedStage(stage, period) {

        if (this.app().indexInSession() < period.app.indexInSession()) {
            return false;
        } else if (this.app().indexInSession() > period.app.indexInSession()) {
            return true;
        }

        if (this.period().id < period.id) {
            return false;
        } else if (this.period().id > period.id) {
            return true;
        }

        if (this.stageIndex < stage.indexInApp()) {
            return false;
        } else if (this.stageIndex > stage.indexInApp()) {
            return true;
        }

        if (this.status === 'playing') {
            return false;
        }

        return true;

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
        var playerId = json.id;
        var app = session.apps[json.appIndex-1];
        var period = app.periods[json.periodId-1];
        var group = period.groups[json.groupId-1];
        var participant = session.participants[playerId];
        var newPlayer = new Player(playerId, participant, group, json.idInGroup);
        for (var j in json) {
            newPlayer[j] = json[j];
        }
        group.players[json.idInGroup-1] = newPlayer;
    }













    startStage(stage) {
        this.group.startStage(this.stage);
        if (!this.participant.canStartStage(stage)) {
            return;
        }
        if (this.stageIndex !== stage.indexInApp()) {
            this.stage = stage;
            this.stageIndex = stage.indexInApp();
            this.status = 'ready';            
        }
        if (this.group.canPlayersStart(this.stage)) {
            if (this.stage.canPlayerParticipate(this)) {
                if (this.status === 'ready') {
                    this.status = 'playing';
                    this.recordStageStartTime(stage);
                    try {
                        stage.playerStart(this);
                    } catch(err) {
                        console.log(err + '\n' + err.stack);
                    }
                    this.save();
                }
            } else {
                this.finishStage(true);
            }
        }
        this.emitUpdate2();
    }

    endStage(endGroup) {
        if (endGroup == null) {
            endGroup = true;
        }

        if (this.status === 'playing') {
            this.recordStageEndTime(this.stage);
            this.status = 'done';
        }

        if (!this.group.canPlayersEnd(this.stage)) {
            this.emitUpdate2();
            return;
        }

        console.log(this.timeStamp() + ' END   - PLAYER: ' + this.stage.id + ', ' + this.roomId());
        this.stage.playerEnd(this);
        this.emitUpdate2();
        this.finishStage(endGroup);
    }

    timeStamp() {
        return this.jt().settings.getConsoleTimeStamp();
    }

    finishStage(endGroup) {
        this.status = 'finished';
        console.log(this.timeStamp() + ' FINISH- PLAYER: ' + this.stage.id + ', ' + this.roomId());
        let curRoomId = this.roomId();
        let curStageIndex = this.stageIndex;
        if (endGroup) {
            this.group.endStage(this.stage);
        }
        if (curRoomId == this.roomId() && curStageIndex === this.stageIndex) {
            this.moveToNextStage();
        }
    }

    // If there is a next stage, enter it.
    // Otherwise, if there is a next period, start it.
    // Otherwise, end the current app.
    moveToNextStage() {
        let stage = this.stage;
        let player = this;

        // If this player is no longer active, do nothing.
        if (player.participant.player == null || player.roomId() !== player.participant.player.roomId()) {
            return;
        }

        var nextStage = this.app().getNextStageForPlayer(player);
        var nextPeriod = this.app().getNextPeriod(player.participant);
        if (nextStage !== null) {
            player.stage = nextStage;
            player.stageIndex++;
            player.status = 'ready';
            console.log(this.timeStamp() + ' READY - PLAYER: ' + this.stage.id + ', ' + this.roomId());
            player.startStage(player.stage);
        } else if (nextPeriod !== null) {
            player.participant.startPeriod(nextPeriod);
        } else {
            this.emitUpdate2();
            player.participant.endCurrentApp();
        }

    } 











}

var exports = module.exports = {};
exports.new = Player;
exports.load = Player.load;
exports.genRoomId = Player.genRoomId;
