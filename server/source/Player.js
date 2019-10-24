// @flow

const Utils     = require('./Utils.js');
const path      = require('path');
const clPlayer  = require('./client/clPlayer.js');
const {stringify} = require('flatted/cjs');
/** Class representing a player. */
class Player {

    constructor(id, parent, group, idInGroup) {

        /**
         * This player's participant.
         * @type {Participant}
         */
        this.superPlayer = parent;

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

        this.gamePath = '';

        this.subPlayers = [];

        this.superPlayer.subPlayers.push(this);

        this.startedPeriod = false;
        this.endedPeriod = false;

    }

    updateGamePath() {
        let out = '';
        if (this.subGame != null) {
            out = this.subGame.getFullGamePath();
        } else {
            out = this.superPlayer.gamePath;
        }
        this.gamePath = out;
    }

    timeInStage() {
        return this.group.timeInStage();
    }

    canProcessMessage() {
        return (this.status === 'playing');
    }

    end() {
        this.game.playerEndInternal(this);
    }

    /**
     * roomId - description
     *
     * @return {type}  description
     */
    roomId() {
        return this.group.roomId() + '_player_' + this.id;
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
     * otherPlayersInGroup - description
     *
     * @return {type}  description
     */
    otherPlayersInGroup() {
        return this.group.playersExcept(this);
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
        if (typeof dta !== 'string') {
            dta = stringify(dta, global.jt.partReplacer);
        }
        // this.io().to(this.roomId()).emit(name, dta);
        this.io().to(this.participant().roomId()).emit(name, dta);
        this.session().emitToAdmins(name, dta);
    }

    io() {
        return this.session().io();
    }

    /**
     * emitUpdate - description
     *
     * @return {type}  description
     */
    emitUpdate() {
        let data = this;
        this.emit('playerUpdate', data);
    }

    emitUpdate2() {
        this.participant().emitUpdate();
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
        if (this.stage == null || this.stage.onPlaySendPlayer) {
            // let data = new clPlayer.new(this);
            let data = this;
            data = stringify(data, global.jt.partReplacer);
            this.io().to(channel).emit('playerUpdate', data);
        }
    }

    /**
     * save - description
     *
     */
    save() {
        try {
            // global.jt.log('Player.save: ' + this.roomId());
            this.session().saveDataFS(this, 'PLAYER');
        } catch (err) {
            console.log('Error saving player ' + this.roomId() + ': ' + err + '\n' + err.stack);
        }
    }

    saveAndUpdate() {
        let data = this.asClPlayer();
        data = stringify(data, global.jt.partReplacer);
        this.io().to(this.roomId()).emit('playerUpdate', data);
        this.save();
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
        var participant = session.proxy.state.participants[playerId];
        var newPlayer = new Player(playerId, participant, group, json.idInGroup);
        for (var j in json) {
            newPlayer[j] = json[j];
        }
        group.players[json.idInGroup-1] = newPlayer;
    }

    participant() {
        if (this.superPlayer.participant == null) {
            return this.superPlayer;
        } else {
            return this.superPlayer.participant();
        }
    }

    totalPoints() {
        let total = this.points;
        for (let i in this.subPlayers) {
            total += this.subPlayers[i].totalPoints();
        }
        return total;
    }

}

var exports = module.exports = {};
exports.new = Player;
exports.load = Player.load;