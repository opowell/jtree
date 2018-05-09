// @flow

const Timer = require('./Timer.js');
const Utils     = require('./Utils.js');

/**
 * A stage of an {@link App}.
 */
class Stage {

    /*
     * constructor - description
     *
     * @param  {type} name description
     * @param  {type} app  description
     * @return {type}      description
     */
    // constructor(name: string, app: App) {
    constructor(name, app) {

        // for display only, should be unique.
        this.name       = name;


        /**
         * The identifier of this stage.
         */
        this.id = this.name;


        /**
         * the app of this stage.
         */
        this.app        = app;

        /**
         * timeout duration in seconds
         * if <= 0, then no timeout for this stage.
         */
        this.duration 	= 0;

        /**
         * Wait for all players in group before players and group can start this stage.
         */
        this.waitToStart = true;

        /**
         * Group waits for all players to finish stage before calling stage.groupEnd(group).
         */
        this.waitToEnd = true;

        // when starting stage for a player, send 'player' object or not.
        // fields determined by player.outputFields.
        this.onPlaySendPlayer = true;

        /**
         * how far up the tree should be sent on update.
         * possible values: 'player', 'group'
         */
        this.updateObject = 'player';

        /**
         * Wait for all players to finish stage on their own (true), or end anyway (false).
         */
        this.waitOnTimerEnd = true;

        this.useAppActiveScreen = true;
        this.useAppWaitingScreen = true;

        // 'outputHide' fields are not included in output
        this.outputHide = [];
        // 'outputHideAuto' fields are not included in output.
        this.outputHideAuto = ['app', 'outputHide', 'outputHideAuto', 'content', 'html', 'htmlFile', 'useIdAsHTMLFileName'];

        this.content = null;

        this.html = null;
        this.htmlFile = null;
        this.useIdAsHTMLFileName = true;

    }

    /**
     * indexInApp - description
     *
     * @return {type}  description
     */
    indexInApp() {
        for (var i in this.app.stages) {
            if (this.app.stages[i] === this) {
                return parseInt(i);
            }
        }
        return -1;
    }

    /*
     * playerCanGroupProceedToNextStage - description
     *
     * @param  {type} player description
     * @return {type}        description
     */
    playerCanGroupProceedToNextStage(player) {
        // PROCEED GROUP
        var players = player.otherPlayersInGroup();
        for (var p in players) {
            var otherPlyr = players[p];
            if (!otherPlyr.atLeastFinishedStage(this, player.period())) {
                return false;
            }
        }
        return true;
    }

    canGroupStart(group) {

        var players = group.players;

        if (this.waitToStart) {
            // PROCEED ONLY IF ALL PLAYERS ARE "ready" and in this stage.
            for (var p in players) {
                var player = players[p];

                // Stop if player is either:
                // 1) not in this stage, or
                // 2) not ready.
                if (!player.participant.canStartStage(this)) {
                    return false;
                }

            }
        } else {
            // PROCEED ONLY IF NO PLAYER HAS ALREADY STARTED PLAYING this stage.
            for (var p in players) {
                var player = players[p];

                // If other player is in this stage and not ready, or already past this stage, return false.
                if (
                    (player.stageIndex === this.indexInApp() && player.status !== 'ready') ||
                    (player.stageIndex > this.indexInApp())
                ) {
                    return false;
                }

            }
        }

        return true;
    }

    canGroupEnd(group) {

        var players = group.players;

        // If already finished, return false.
        if (group.stageFinishedIndex >= this.indexInApp()) {
            return false;
        }

        if (this.waitToEnd) {
            // PROCEED ONLY IF ALL PLAYERS ARE "finished" and in this stage.
            for (var p in players) {
                var player = players[p];

                // If other player is not finished, return false.
                if (player.stageIndex !== this.indexInApp() || !player.isFinished()) {
                    return false;
                }

            }
        } else {
            // PROCEED ONLY IF NO PLAYER HAS ALREADY FINISHED this stage.
            for (var p in players) {
                var player = players[p];

                // If other player is in this stage and not finished, or not even in this stage yet, return false.
                if (
                    (player.stageIndex === this.indexInApp() && !player.isFinished()) ||
                    (player.stageIndex < this.indexInApp())
                ) {
                    return false;
                }

            }
        }

        return true;

    }

    /**
     * Overwrite in app.js.
     *
     * @param  {type} group description
     * @return {type}       description
     */
    groupEnd(group) {}

    /**
    *  Called before the first player plays this stage.
    * Overwrite in app.js
    */
    groupStart(group) {}

    /**
     * Can the given player participate in this stage?
     *
     * @param  {type} player description
     * @return {type}        description
     */
    canPlayerParticipate(player) {
        return true;
    }

    canGroupParticipate(group) {
        return true;
    }

    getContent() {
        if (this.content == null) {
            this.content = getStageContents(this.app.id, this.id)
        }
        return this.content;
    }

    /**
     * End this stage for the given player.
     * Overwrite in app.js.
     *
     * @param  {type} player description
     */
    playerEnd(player) {}

    /**
     * Called when this player plays this stage.
     * Overwrite in app.js.
     **/
    playerStart(player) {}

    /**
     * session - description
     *
     * @return {type}  description
     */
    session() {
        return this.app.session;
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

    /**
     * shellWithParent - description
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
        out['app.index'] = this.app.indexInSession();
        out.app = this.app.shell();
        return out;
    }

    /**
     * CALLED FROM:
     * - {@link Stage#save}
     * - {@link App#shellWithChildren}
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
        out['app.index'] = this.app.indexInSession();
        out.canPlayerParticipate = this.canPlayerParticipate;

        out.groupStart = this.groupStart.toString();
        out.groupEnd = this.groupEnd.toString();
        out.playerStart = this.playerStart.toString();
        out.playerEnd = this.playerEnd.toString();

        return out;
    }

    getOutputDir() {
        return this.app.getOutputFN() + '/stages/';
    }

    /**
     * CALLED FROM:
     * - {@link App#saveSelfAndChildren}
     *
     * @return {type}  description
     */
    save() {
        try {
            this.session().jt.log('Stage.save: ' + this.id);
            var toSave = this.shell();
    //        Utils.writeJSON(this.getOutputDir() + this.indexInApp() + '_' + this.id + '.json', toSave);
            this.session().saveDataFS(toSave, 'STAGE');
        } catch (err) {
            console.log('Error saving stage ' + this.id + ': ' + err);
        }
    }

}

var exports = module.exports = {};
exports.new = Stage;
exports.load = Stage.load;
