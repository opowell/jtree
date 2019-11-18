const Player    = require('./Player.js');
const Timer     = require('./Timer.js');
const Utils     = require('./Utils.js');
const Table     = require('./Table.js');
const fs        = require('fs-extra');
const path      = require('path');
const {parse, stringify} = require('flatted/cjs');
const Status    = require('./Status.js');

class Group {
    constructor(id, period, parent) {
        this.id = id;
        this.superGroup = parent;
        this.subGroups = [];
        this.period = period;
        this.players = [];
        this.allPlayersCreated = false;
        this.tables = [];
        this.status = Status.UNSET;
    }

    /**
     * Find the player with the given participant ID.
     * @param  {String} id the given id.
     * @return {type}    the player where player.participant.id == id.
     */
    playerByParticipantId(id) {
        return Utils.findById(this.players, id);
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
        var minGameIndex = null;
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
        return Utils.findByField(this.players, id, 'idInGroup');
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
        return Utils.findById(this.players, id);
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
        this.emit('groupUpdate', this);
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
        this.session().io().to(this.roomId()).emit(msgTitle, stringify(msgData, global.jt.partReplacer));
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
        if (this.period == null || this.period.roomId == null) {
            return this.app().roomId() + '_period_none_group_' + this.id;
        }
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

    /*
     * getOutputDir - description
     *
     * @return {type}  description
     */
    getOutputDir() {
        return this.period.getOutputDir() + '/groups/' + this.id;
    }

    /**
     * save - description
     */
    save() {
        try {
            // global.jt.log('Group.save: ' + this.roomId());
            var toSave = this;
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

    startStage(game) {

        if (!game.canGroupParticipate(this)) {
            this.endGame();
        }

        if (!game.canGroupStart(this)) {
            return;
        }

        this.gameStartedIndex++;
        this.gameIndex = game.indexInApp();
        let groupDuration = game.getGroupDuration(this);
        if (groupDuration > 0) {
            let timeOutCB = function(game) {
                this.session().addMessageToStartOfQueue(this, game, 'forceEndGame');
            }.bind(this, game);
            this.gameTimer = new Timer.new(
                timeOutCB,
                groupDuration*1000,
                game.indexInApp()
            );
        }

        try {
            console.log(global.jt.settings.getConsoleTimeStamp() + ' START - GROUP : ' + game.id + ', ' + this.roomId());
            game.groupStart(this);
        } catch (err) {
            console.log(err.stack);
        }
        try {
            this.save();
        } catch (err) {}
        for (var p in this.players) {
            try {
                this.players[p].startGame(game);
            } catch (err) {}
        }
    }

    forceEndGame(game) {
        console.log('Group.forceEndGame: ' + game.id);
        this.clearGameTimer();
        this.endGame(game, true);
    }

    endGame(game, forcePlayersToEnd) {

        if (forcePlayersToEnd == null) {
            forcePlayersToEnd = false;
        }

        if (!game.canGroupEnd(this, forcePlayersToEnd)) {
            return;
        }

        // If waiting for any players, stop.
        if (this.waitingForPlayersInGame(game, forcePlayersToEnd)) {
            return;
        }

        this.clearGameTimer();

        console.log(global.jt.settings.getConsoleTimeStamp() + ' END   - GROUP : ' + game.id + ', ' + this.roomId());
        this.gameEndedIndex = game.indexInApp();
        game.groupEnd(this);

        for (var p in this.players) {
            var player = this.players[p];
            if (player.game.id === game.id && player.status !== 'finished') {
                player.endGame(false);
            }
        }

        this.gameIndex = game.indexInApp() + 1;
        if (this.gameIndex < this.app().subgames.length) {
            // move group (and all its players) to next stage.
            this.startGame(this.game());
        } else {
            // move players to next period if necessary.
            for (var p in this.players) {
                if (this.players[p].participant.player.period().id === this.period.id) {
                    this.players[p].moveToNextGame();
                }
            }
        }

        // if (stage.waitToEnd) {
        //     for (var p in this.players) {
        //         let player = this.players[p];
        //         if (player.stageIndex === stage.indexInApp()) {
        //             player.moveToNextStage();
        //         }
        //     }
        // }

    }

    // Check if this group is waiting for players to finish playing the given stage.
    // If it is, tell those players to end the stage.
    // Return whether or not any player
    waitingForPlayersInGame(game, forcePlayersToEnd) {
        let waitingForPlayers = false;
        if (game.waitOnTimerEnd) {
            for (var p in this.players) {
                var player = this.players[p];
                    // If player is in an earlier stage, wait.
                    if (player.game.indexInApp() < game.indexInApp()) {
                        waitingForPlayers = true;
                    } else if (player.game.indexInApp() > game.indexInApp()) {
                        // If player is past this stage, proceed.
                    } else {
                        // If player is in this stage and not finished...
                        if (!player.isFinished()) {
                            waitingForPlayers = true;
                            if (forcePlayersToEnd) {
                                // If any clients are connected, let player finish via call to "endStage".
                                if (player.participant.clients.length > 0) {
                                    player.emit('endGame', player);
                                }
                                // If not, end player immediately.
                                else {
                                    console.log('No connected clients for ' + player.id + ', ending immediately.');
                                    player.endGame(false);
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
