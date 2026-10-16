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

        /**
         * for display only, should be unique.
         * @type {Name}
         */
        this.name       = name;

        /**
         * The identifier of this stage.
         * @type {String}
         */
        this.id = this.name;

        /**
         * the app of this stage.
         * @type {App}
         */
        this.app        = app;

        /**
         * timeout duration in seconds
         * if <= 0, then no timeout for this stage.
         * @type number
         * @default 0
         */
        this.duration 	= 0;

        this.showTimer = true;

        /**
         * Seconds each player has for this stage, from when they start it (oTree's page
         * timeout); see [getClientDuration(player)]{@link Stage#getClientDuration} for a
         * duration per player. Their page counts down and submits; if it does not, the server
         * ends the stage for them, as for a group's timeout (see timeoutGrace). If <= 0, none.
         * @type number
         * @default 0
         */
        this.clientDuration = 0;

        /**
         * When the stage times out (duration or clientDuration), end it (true); or only mark
         * the players timed out and keep it open until they submit (false: z-Tree's "leave
         * stage after timeout: no").
         * @type boolean
         * @default true
         */
        this.endOnTimeout = true;

        /**
         * Wait for all players in group to be 'ready' before calling [Stage.groupStart(group)]{@link stage#groupStart} and [Stage.playerStart(player)]{@link stage#groupStart} are called.
         * @type boolean
         * @default true
         */
        this.waitToStart = app.stageWaitToStart;

        /**
         * Wait for all players in group to be 'finished' or 'done' before calling [Stage.groupEnd(group)]{@link stage#groupEnd} and [Stage.playerStart(player)]{@link stage#groupEnd} are called.
         * @type boolean
         * @default true
         */
        this.waitToEnd = app.stageWaitToEnd;

        /**
         * Wait for every player of the period, in every group, to be 'ready' before any group
         * starts this stage (z-Tree's "wait for all", oTree's wait_for_all_groups). Then
         * [Stage.allGroupsStart(period)]{@link Stage#allGroupsStart} is called, once, before
         * the groups' groupStart.
         * @type boolean
         * @default false
         */
        this.waitForAllGroups = false;

        /**
         * when starting stage for a player, send 'player' object or not.
         * fields determined by [player.outputFields]{@link player#outputFields}.
         * @type boolean
         * @default true
         */
        this.onPlaySendPlayer = true;

        /**
         * how far up the tree should be sent on update. More data comes at cost of higher latency.
         * possible values: 'player', 'group'
         * @type string
         * @default 'player'
         */
        this.updateObject = 'player';

        /**
         * Wait for all players to finish stage on their own (true), or end anyway (false).
         * @type boolean
         * @default true
         */
        this.waitOnTimerEnd = true;

        /**
         * When this stage times out and {@link Stage#waitOnTimerEnd} is true, each player's
         * page is asked to submit what it has. After this many seconds, the server ends the
         * stage for players whose page has not (as if they submitted nothing); null waits
         * for the pages however long they take.
         * @type {number|null}
         * @default 5
         */
        this.timeoutGrace = app.stageTimeoutGrace;

       /**
        * @type boolean
        * @default true
        */
        this.useAppActiveScreen = true;

        /**
         * @type boolean
         * @default true
         */
        this.useAppWaitingScreen = true;

        /**
         *  Wrap stage playing screens in a <form> tag or not.
         */
        this.wrapPlayingScreenInFormTag = app.stageWrapPlayingScreenInFormTag;

        /**
         * 'outputHide' fields are not included in output.
         * @type Array
         * @default []
         */
        this.outputHide = [];

        this.addOKButtonIfNone = true;

        this.waitingScreen = null;

        /**
         * 'outputHideAuto' fields are not included in output.
         * @type {String[]}
         */
        this.outputHideAuto = ['app', 'outputHide', 'outputHideAuto', 'html', 'htmlFile', 'useIdAsHTMLFileName', 'subApp'];

        /**
         * @default null
         */
        this.activeScreen = null;

        /**
         * @default null
         */
        this.html = null;

        /**
         * @default null
         */
        this.htmlFile = null;

        /**
         * @type boolean
         * @default true
         */
        this.useIdAsHTMLFileName = true;

        /**
         * For a stage with stages of its own (see newStage), the number of times its stages
         * are played each time its group reaches it, if numPeriods is not set.
         * @type number
         * @default 1
         */
        this.repetitions = 1;

        this.autoplay = `
            jt.defaultAutoplay();
        `

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
        return this.canGroupStartDefault(group);
    }

    canGroupStartDefault(group) {

        // If already started this stage, return false.
        if (group.stageStartedIndex >= this.indexInApp()) {
            return false;
        }

        // // If not finished a previous stage, return false.
        // if (group.stageEndedIndex < this.indexInApp() - 1) {
        //     return false;
        // }

        // A group formed by arrival starts once it is full (see Period#arrivalGroupId).
        if (this.app.groupByArrival && !group.allPlayersCreated) {
            return false;
        }

        // Every player of the period, in every group, ready for this stage; until the groups
        // have been started together (see Group#startStage).
        if (this.waitForAllGroups && !group.period.allGroupsStarted.includes(this.indexInApp())) {
            for (const g of group.period.groups) {
                for (const player of g.players) {
                    if (player.stageIndex !== this.indexInApp() || player.status !== 'ready') {
                        return false;
                    }
                }
            }
        }

        if (this.waitToStart) {
            // If any player is 1) not "ready" or 2) not in this stage, then return false.
            for (var p in group.players) {
                var player = group.players[p];
                if (player.stageIndex !== this.indexInApp() || player.status !== 'ready') {
                    return false;
                }
            }
        } 
        
        // Otherwise, return true.
        return true;
    }

    getClientDuration(player) {
        return this.clientDuration;
    };

    /**
     * Adds a stage within this stage. A stage with stages is an app within its app: each time
     * a group reaches it, its players play its stages, numPeriods times (repetitions, if
     * that is not set), in periods of their own, and then go on to the next stage of this
     * stage's app. By default they keep their groups; with groupSize, numGroups,
     * groupMatchingType or getGroupIdsForPeriod(period) set on this stage, they are
     * regrouped, as an app's players are. periodStart(period) and periodEnd(period), if set
     * on this stage, are called as an app's are. See {@link App#newBlock}.
     * @param {string} [id]
     * @return {Stage} The new stage.
     */
    newStage(id) {
        return this.blockApp().newStage(id);
    }

    /**
     * Adds the app in file as a stage within this stage (see newStage, App#addApp).
     * @param {string} file The app's file, or folder, relative to this stage's app's folder.
     * @param {string} [id] The id of the stage; by default, the app's.
     * @return {Stage} The new stage.
     */
    addApp(file, id) {
        return this.blockApp().addApp(file, id);
    }

    /** The app this stage's stages are in (see App#newBlock), made the first time it is asked for. */
    blockApp() {
        if (this.appFile != null) {
            throw new Error('Stage ' + this.id + ' is the app ' + this.appFile + ', which has stages of its own.');
        }
        if (this.subApp == null) {
            this.subApp = this.app.newBlock(this);
        }
        return this.subApp;
    }

    /**
     * The stages within this stage: its own (see newStage), or, for an app added as a stage
     * (see App#addApp), that app's.
     * @type {Stage[]}
     */
    get stages() {
        return this.subApp == null ? [] : this.subApp.stages;
    }

    /** Whether this stage has stages of its own, or is an app (see newStage, App#addApp). */
    isContainer() {
        return this.subApp != null;
    }

    /**
     * The app this stage's stages run as in period (a period of this stage's app), for the
     * time period's groups reach this stage: made the first time it is asked for. For an app
     * added as a stage (see App#addApp), that app, loaded afresh.
     * @param {Period} period
     * @return {App}
     */
    runFor(period) {
        if (period.runs == null) {
            period.runs = {};
        }
        const index = this.indexInApp();
        if (period.runs[index] == null) {
            const run = this.appFile != null ? this.app.loadAppFile(this.appFile) : Object.create(this.subApp);
            run.parentStage = this;
            run.parentPeriod = period;
            run.periods = [];
            run.started = false;
            run.finished = false;
            run.leftIds = [];
            period.runs[index] = run;
        }
        return period.runs[index];
    }

    /** The app this stage's stages run as in period, if its groups have reached it; else null. */
    runIn(period) {
        return period.runs == null ? null : (period.runs[this.indexInApp()] || null);
    }

    canGroupEnd(group, forcePlayersToEnd) {

        var players = group.players;

        // If already finished, return false.
        if (group.stageEndedIndex >= this.indexInApp()) {
            return false;
        }

        if (this.waitToEnd && !forcePlayersToEnd) {
            // PROCEED ONLY IF ALL PLAYERS ARE "finished" and in this stage.
            for (var p in players) {
                var player = players[p];

                if (player.stageIndex > this.indexInApp()) {
                    // Player is already past this stage?!
                } else {
                    // If other player is not finished, return false.
                    if (player.stageIndex < this.indexInApp() || !player.isFinishedStage(this)) {
                        return false;
                    }
                }
            }
        } 

        // Otherwise, return true.
        return true;

    }

    /**
     * Overwrite in app.jtt.
     *
     * @param  {type} group description
     * @return {type}       description
     */
    groupEnd(group) {}

    /**
     * Overwrite in app.jtt: for a stage that waits for all groups, called once per period
     * when every player has arrived, before each group's groupStart.
     * @param {Period} period
     */
    allGroupsStart(period) {}

    /**
    *  Called before the first player plays this stage.
    * Overwrite in app.jtt
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

    getActiveScreen() {

        if (this.activeScreen == null) {
            this.activeScreen = Utils.getStageContents(this.app.id, this.id)
        }
        return this.activeScreen;
    }

    /**
     * End this stage for the given player.
     * Overwrite in app.jtt.
     *
     * @param  {type} player description
     */
    playerEnd(player) {}

    /**
     * Called when this player plays this stage.
     * Overwrite in app.jtt.
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
        out.getGroupDuration = this.getGroupDuration.toString();

        return out;
    }

    getGroupDuration(group) {
        return this.duration;
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
