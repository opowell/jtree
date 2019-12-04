// @flow

const Utils     = require('./Utils.js');
const path      = require('path');
const clPlayer  = require('./client/clPlayer.js');
const Status    = require('./Status.js');
const {stringify} = require('flatted/cjs');
const Status    = require('./Status.js');

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
        this.status = Status.UNSET;

        /**
         * @type number
         * @default 0
         */
        this.gameIndex = 0

        /**
         * @type {App}
         * @default null
         */
        this.game = null;

        this.gamePath = this.updateGamePath();

        this.subPlayers = [];

    }

    endGame() {
        if (this.game != null) {
            this.game.playerEndInternal(this); 
        } else {
            this.app().playerEndInternal(this);
        }
    }

    startNextGame() {
        // If this is a "period" player, move parent to next stage.
        if (this.type == 'period') {
            this.superPlayer.startNextGame();
            return;
        }

        // This is a "game" player.
        // If not in the last stage, move to next stage of parent.
        if (this.gameIndex < this.app().subgames.length - 1) {
            this.gameIndex++;
            this.status = 'ready';
            let nextApp = this.app().subgames[this.gameIndex];
            nextApp.playerStartInternal(this);
        } 
        // Otherwise, if not in the last period, move to next period.
        else if (this.period().id < this.app().numPeriods) {
            this.superGame.playerBeginPeriod(player.period().id+1, player.superPlayer);
        } 
        // Otherwise, parent ends game.
        else {
            this.superPlayer.endGame();
        }
    }

    updateGamePath() {
        let out = '';
        if (this.game != null) {
            out = this.game.getFullGamePath();
        } else {
            if (this.superPlayer.updateGamePath == null) {
                this.gamePath = '';
                return;
            }
            this.superPlayer.updateGamePath();
            out = this.superPlayer.gamePath;
        }
        this.gamePath = out;
    }

    timeInGame() {
        return this.group.timeInGame();
    }

    canProcessMessage() {
        return (this.status === Status.STARTED);
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
        if (this.game == null || this.game.onPlaySendPlayer) {
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

    getPlayerPath() {
        let out = '';
        if (this.superPlayer != null) {
            if (this.superPlayer.getPlayerPath != null) {
                out = this.superPlayer.getPlayerPath();
            }
            let index = -1;
            for (let i in this.superPlayer.subPlayers) {
                if (this.superPlayer.subPlayers[i] === this) {
                    index = i;
                    break;
                }
            }
            out += '/' + index + '-' + this.group.period.app.id;
        }
        return out;
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
