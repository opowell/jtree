// @flow

const Stage     = require('./Stage.js');
const Period    = require('./Period.js');
const Utils     = require('./Utils.js');
const AppUtility = require('./AppUtility.js');

/** Class that represents an app. */
class App {

    /**
     * Creates an App.
     *
     * @param  {Session} session description
     * @param  {String} id      description
     */
    constructor(session, id, jt, appPath) {

        /**
         * The unique identifier of this App. In order of precedence, the value is given by:
         * - the explicit value in the .jtt file (if it has been set)
         * - the name of the .jtt file (if it is not app.jtt or app.js)
         * - the name of the folder containing the .jtt file
         * @type {String}
         */
        this.id = id;

        /**
         * @type {jt}
         */
        this.jt = jt;

        /** Where the original definition of this app is stored on the server.*/
        this.appPath = appPath;

        /**
         * The Session that this App belongs to.
         * @type {Session}
         */
        this.session = session;


        /**
         * The stages of this app.
         * @type Array
         * @default []
         */
        this.stages = [];

        /**
         * The options of this app.
         * @type Array
         * @default []
         */
        this.options = [];

        /**
         * The option values of this app.
         * @type Object
         * @default {}
         */
        this.optionValues = {};

        /** Used by the participant client to find and create dynamic text elements.*/
        this.textMarkerBegin = '{{';
        this.textMarkerEnd = '}}';

        /**
         * The number of periods in this App.
         * @type number
         * @default 1
         */
        this.numPeriods = 1;

        /**
         * Inserts jtree functionality to the start of client.html
         * @type boolean
         * @default true
         */
        this.insertJtreeRefAtStartOfClientHTML = true;

        /** Shown on all client screens.*/
        this.html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
                </head>
                <body>
                    <p>Period: {{period.id}}/{{app.numPeriods}}</p>
                    <p id='time-remaining-div'>Time left: {{clock.minutes}}:{{clock.seconds}}</p>
                    <span jt-status='active'>
                        {{stages}}
                    </span>
                    <span jt-status='waiting'>
                        {{waiting-screen}}
                    </span>
                </body>
            </html>
        `;

        /** TODO:   */
        this.screen = '';

        /** Shown on all client playing screens if {@link Stage.useAppActiveScreen} = true.
        * @default null
        */
        this.activeScreen = null;


        /** Shown on all client waiting screens if {@link Stage.useWaitingScreen} = true.
        */
        this.waitingScreen = `
            <p>WAITING</p>
            <p>The experiment will continue soon.</p>
        `;

        /** If 'htmlFile' is not null, content of 'htmlFile' is added to client content.
         * Otherwise, if 'htmlFile' is null, content of this.id + ".html" is added to client content, if it exists.
         */
        this.htmlFile = null;

        /**
         * The periods of this App.
         * @type Array
         * @default []
         */
        this.periods = [];

        /**
        * Description of this App.
        * @type String
        * @default 'No description provided.'
        */
        this.description = 'No description provided.';

        /**
         * Array of comparisons to show by default on Session -> Data tab.
         * Each entry consists of:
         * - field name (i.e. 'player.points')
         * - x-axis object (i.e. 'player')
         * - y-axis object (i.e. 'period')
         * Field values are aggregated using the arithmetic mean as necessary (for example, if field is player.x, but x-axis is group, then table shows arithmetic mean of all player.x in a group).
         * @type Array
         * @default []
         */
        this.keyComparisons = [];

        /**
         * Whether or not to wait for all participants before starting the app.
         * @type boolean
         * @default true
         */
        this.waitForAll = true;

        /**
         * The matching type to be used for groups in this App.
         * @type string
         * @default 'STRANGER'
         */
        this.groupMatchingType = 'STRANGER';

        /**
         * Messages to listen for from clients.
         * @type Object
         * @default {}
         */
        this.messages = {};

        /**
         * TODO: Description
         * @type boolean
         * @default true
         */
        this.stageWrapPlayingScreenInFormTag = true;

        /**
         * If defined, subjects are assigned randomly to groups of this size takes precedence over numGroups.
         * @type number
         * @default undefined
         */
         this.groupSize = undefined;

         /**TODO:*/
         this.groupingType = undefined;

        /**
         * if defined, subjects are split evenly into this number of groups
         * overridden by groupSize.
         * @type number
         * @default undefined
         */
        this.numGroups = undefined;

        /**
         * Starts the stages of this App.
         * TODO:
         * @type string
         * @default '<span jt-stage="{{stage.id}}">'
         */
        this.stageContentStart = '<span jt-stage="{{stage.id}}">';

        /**
         * Ends the stages of this App.
         * TODO:
         * @type string
         * @default '</span>'
         */
        this.stageContentEnd = '</span>';

        //TODO:
        this.outputHideAuto = [
            'stageContentStart',
            'stageContentEnd',
            'optionValues',
            'insertJtreeRefAtStartOfClientHTML',
            'textMarkerBegin',
            'textMarkerEnd',
            'html',
            'description',
            'keyComparisons',
            'screen',
            'activeScreen',
            'waitingScreen',
            'stageWrapPlayingScreenInFormTag',
            'waitForAll',
            'finished',
            'htmlFile',
            'this',
            'session',
            'stages',
            'outputHideAuto',
            'outputHide',
            'periods',
            'messages',
            'type',
            'folder',
            'options',
            'jt',
            'appPath'];

        //TODO:
        /**
         * @type array
         * @default []
         */
        this.outputHide = [];

        /** TODO: Description
         * @type boolean
         * @default false
         */
        this.finished = false;
    }

    /**
     * Overwrite to add custom functionality for when a {@link Client} starts this app.
     *
     * Called from:
     * - {@link App#addClientDefault}.
     *
     * @param  {Client} client The client who is connecting to this app.
     */
    addClient(client) {
        /** Overwrite */
    }

    /**
    * Called when a {@link Client} connected to a {@link Participant} starts this app.
    *
    * - client subscribes to this App's channel.
    * - client registers custom messages it may send.
    * - client registers automatic stage submission messages it may send.
    * - load custom behaviour [this.addClient]{@link App#addClient}.
    *
    * Called from:
    * - {@link App#participantBegin}
    *
    * @param  {Client} client The client who is connecting to this app.
    */
    addClientDefault(client) {
        client.socket.join(this.roomId());

        for (var i in this.messages) {
            var msg = this.messages[i];
            client.register(i, msg);
        }

        // Register for automatic stage messages.
        var app = this;
        for (var s in this.stages) {
            var stageName = this.stages[s].name;

            // Listen to message from clients.
            client.on(stageName, function(data) { // stage messages are sent by default when submit button is clicked.
                app.session.pushMessage(client, data.data, data.data.fnName);
            });

            // Queue message.
            client[stageName] = function(data) {
                app.session.pushMessage(client, data, data.fnName + 'Process');
            }

            // Process the message.
            client[stageName + 'Process'] = function(data) {

                app.jt.log('Server received auto-stage submission: ' + JSON.stringify(data));

                if (client.player() === null) {
                    return false;
                }

                if (client.player().stage.id !== data.fnName) {
                    console.log('App.js, STAGE NAME DOES NOT MATCH: ' + client.player().stage.id + ' vs. ' + data.fnName + ', data=' + JSON.stringify(data));
                    return false;
                }

                // TODO: Not parsing strings properly.
                for (var property in data) {
                    var value = data[property];

                    if (value === 'true') {
                        value = true;
                    } else if (value === 'false') {
                        value = false;
                    } else if (!isNaN(value)) {
                        value = parseFloat(value);
                    }

                    if (data.hasOwnProperty(property)) {
                        if (property.startsWith('player.')) {
                            var fieldName = property.substring('player.'.length);
                            client.player()[fieldName] = value;
                        } else if (property.startsWith('group.')) {
                            var fieldName = property.substring('group.'.length);
                            client.group()[fieldName] = value;
                        } else if (property.startsWith('participant.')) {
                            var fieldName = property.substring('participant.'.length);
                            client.participant[fieldName] = value;
                        } else if (property.startsWith('period.')) {
                            var fieldName = property.substring('period.'.length);
                            client.period()[fieldName] = value;
                        } else if (property.startsWith('app.')) {
                            var fieldName = property.substring('app.'.length);
                            client.app()[fieldName] = value;
                        }
                    }
                }
                /** console.log('msg: ' + JSON.stringify(data) + ', ' + client.player().roomId());*/
                var attemptToEndForGroup = true;
                client.player().attemptToEndStage(attemptToEndForGroup);
            };
        }

        // Load custom code, overwrite default stage submission behavior.
        try {
            this.addClient(client);
        } catch(err) {
            console.log(err);
        }

    }

    /** TODO */
    addStages(array) {
        for (var i=0; i<array.length; i++) {
            this.addStage(array[i]);
        }
    }

    /**
     * Get next stage for player in their current period. Return null if already at last stage of period.
     *
     * DUE TO:
     * {@link Stage.playerEnd}
     */
    getNextStageForPlayer(player) {
        var stageInd = player.stageIndex;

        /** If not in the last stage, return next stage.*/
        if (stageInd < this.stages.length-1) {
            return this.stages[stageInd+1];
        } else {
            return null;
        }

    }

    /**
     * TODO
     * Get group ids for their current period
     */
    getGroupIdsForPeriod(period) {
        var participants = this.session.participants;
        var numGroups = period.numGroups();
        var pIds = [];
        for (var p in participants) {
            pIds.push(p);
        }
        // Group IDs.
        var gIds = [];
        for (var g=0; g<numGroups; g++) {
            gIds.push([]);
        }

        // Calculate number of elements per group
        var m = Math.floor((pIds.length-1) / numGroups) + 1;

        if (this.groupMatchingType === 'PARTNER_1122') {
            for (var g=0; g<numGroups; g++) {
                for (var i=0; i<m; i++) {
                    gIds[g].push(pIds[0]);
                    pIds.splice(0, 1);
                }
            }
        } else if (this.groupMatchingType === 'PARTNER_1212') {
            for (var i=0; i<m; i++) {
                for (var g=0; g<numGroups; g++) {
                    gIds[g].push(pIds[0]);
                    pIds.splice(0, 1);
                }
            }
        } else if (this.groupMatchingType === 'PARTNER_RANDOM') {
            if (period.id === 1) {
                period.getStrangerMatching(numGroups, pIds, gIds, m);
            } else {
                var prevPeriod = period.prevPeriod();
                gIds = prevPeriod.groupIds();
            }
        } else if (this.groupMatchingType === 'STRANGER') {
            period.getStrangerMatching(numGroups, pIds, gIds, m);
        }
        return gIds;
    }

    // TODO
    parseStageTag(stage, text) {
        while (text.includes('{{')) {
            var start = text.indexOf('{{');
            var end = text.indexOf('}}');
            var curTag = text.substring(start + '{{'.length, end);
            var value = eval(curTag);
            text = text.replace('{{' + curTag + '}}', value);
        }
        return text;
    }

    /**
     * Ends this App.
     *
     * - Create headers for this app, periods, groups, group tables, players and participants.
     * - Create output.
     * - Write output to this session's csv file.
     *
     * CALLED FROM
     * - {@link App#tryToEndApp}
     */
    end() {


        this.finished = true;

        AppUtility.saveOutput(this, this.session.csvFN());

    }

    /**
     * @return {string}  Session path + {@link App#indexInSession} + '_' + app.id
     */
    getOutputFN() {
        return this.session.getOutputDir() + '/' + this.indexInSession() + '_' + this.id;
    }

    /**
     * - clear group's timer.
     * - if next stage exists, let the group play it.
     * - for each player in the group, call {@link App#playerMoveToNextStage}.
     *
     * @param  {Group} group
     */
    groupMoveToNextStage(group) {
        group.clearStageTimer();
        var nextStage = this.nextStageForGroup(group);

        //If not at last stage of session, mvoe group to next stage.
        if (nextStage !== null) {
            nextStage.groupPlayDefault(group);
        }

        if (nextStage === null || nextStage.waitForGroup) {
            for (var p in group.players) {
                this.playerMoveToNextStage(group.players[p]);
            }
        }
    }

    /**
     * @return {number} The index of this app in its session's list of apps (first position = 1).
     */
    indexInSession() {
        if (this.session === null) {
            return -1;
        }

        for (var i in this.session.apps) {
            if (this.session.apps[i] === this) {
                return parseInt(i)+1;
            }
        }
        return -1;
    }

    /**
     * Creates a new period with the given id + 1, saves it and adds it to this App's periods.
     *
     * Called from:
     * - {@link App.participantBeginPeriod}
     *
     * @param  {number} prd The index to assign to the new period.
     */
    initPeriod(prd) {
        var period = new Period.new(prd + 1, this);
        period.save();
        this.periods.push(period);
    }

    addPositiveIntegerOption(name, defaultVal, max, desc) {
        this.addNumberOption(name, defaultVal, 1, max, 1, desc);
    }

    addNumberOption(name, defaultVal, min, max, step, description) {
        // Add to list of options.
        this.options.push({
            type: 'number',
            name: name,
            min: min,
            max: max,
            step: step,
            defaultVal: defaultVal,
            description: description
        });

        // Add value, if does not already exist.
        if (this[name] === undefined) {
            this[name] = defaultVal;
        }

        // Value already exists, coerce if possible into one of the original option values.
        else {
            this.setOptionValue(name, this[name]);
        }
    }

    addTextOption(name, defaultVal, description) {
        // Add to list of options.
        this.options.push({
            type: 'text',
            name: name,
            defaultVal: defaultVal,
            description: description
        });

        // Add value, if does not already exist.
        if (this[name] === undefined) {
            this[name] = defaultVal;
        }

        // Value already exists, coerce if possible into one of the original option values.
        else {
            this.setOptionValue(name, this[name]);
        }
    }

    addSelectOption(optionName, optionVals, description) {

        // Add to list of options.
        this.options.push({
            type: 'select',
            name: optionName,
            values: optionVals,
            description: description
        });

        // Add value, if does not already exist.
        if (this[optionName] === undefined) {
            this[optionName] = optionVals[0];
        }

        // Value already exists, coerce if possible into one of the original option values.
        else {
            this.setOptionValue(optionName, this[optionName]);
        }
    }

    setOptionValue(name, value) {
        this.optionValues[name] = value;
        var correctedValue = value;
        var isValid = false;
        for (var opt in this.options) {
            var option = this.options[opt];
            if (option.name === name) {
                if (option.type === 'select') {
                    for (var i in option.values) {
                        if (option.values[i] == value) { // allow for coercion
                            correctedValue = option.values[i];
                            isValid = true;
                            break;
                        }
                    }
                } else if (option.type === 'number') {
                    correctedValue = value - 0; /** coerce to number*/
                    isValid = true;
                    break;
                } else if (option.type === 'text') {
                    isValid = true;
                    // no correction needed.
                }
            }
        }
        if (isValid) {
            this[name] = correctedValue;
        }
    }

    /**
     * Creates a new {@link Stage} and adds it to the App.
     *
     * @param  {string} id The identifier of the stage.
     * @return {Stage} The new stage.
     */
    newStage(id) {
        var stage = new Stage.new(id, this, this.stages.length);
        this.stages.push(stage);
        return stage;
    }

    /**
     * Returns the next stage for a given group in a given stage.
     * 1. If stage is not the last stage of this app, return the next stage of this app.
     * 2. If period is not the last period of this app, return the first stage of this app.
     * 3. If app is not the last app of this session, return the first stage of the next app.
     * 4. Otherwise, return null.
     *
     * TODO: Does the next stage have Stage.waitForGroup == true?
     *
     * CALLED FROM
     * - {@link Stage#playerEnd}
     * - {@link App#groupMoveToNextStage}
     *
     * @param  {Group} group The group
     * @return {(null|Stage)} The next stage for this group, or null.
     */
    nextStageForGroup(group) {
        var slowestPlayers = group.slowestPlayers();
        return slowestPlayers[0].nextStage();
    }

    /**
     * Called when a player finishes a stage.
     * By default, check whether everyone in group is finished.
     * If yes, then advance to next stage ([this.session.gotoNextStage(player.group)]{@link Session.gotoNextStage}).
     *
     * @param  {Player} player description
     */
    onPlayerFinished(player) {
        var proceed = true;
        for (var p in player.group.players) {
            var pId = player.group.players[p];
            if (this.session.player(pId).status !== 'finished') {
                proceed = false;
                break;
            }
        }
        if (proceed) {
            this.session.gotoNextStage(player.group);
        }
    }

    /**
     * The names of fields to include in an export of this object. To be included, a field must:
     * - not be a function ({@link Utils.isFunction})
     * - not be included in {@link App#outputHide}
     * - not be included in {@link App#outputHideAuto}
     *
     * @return {Array}  An array of the field names.
     */
    outputFields() {
        var fields = [];
        for (var prop in this) {
            if (
                App.prototype[prop] !== this[prop] &&
                !this.outputHide.includes(prop) &&
                !this.outputHideAuto.includes(prop)
            )
            fields.push(prop);
        }
        return fields;
    }

    /**
     * Called when a participant begins this app.
     * - For each of the [Clients]{@link Client} of this participant, call {@link App.addClientDefault}.
     * - Set the participant's periodIndex to -1.
     * - Participant notifies clients about appIndex.
     * - Move participant to next period {@link App.participantMoveToNextPeriod}.
     * - Participant notified clients about starting new app.
     *
     * @param  {Participant} participant The participant.
     */
    participantBegin(participant) {

        for (var c in participant.clients) {
            var client = participant.clients[c];
            this.addClientDefault(client);
        }

        participant.periodIndex = -1;
        participant.emit('participantSetAppIndex', {appIndex: this.indexInSession()});

        this.participantStart(participant);
        this.participantMoveToNextPeriod(participant);

        participant.emit('start-new-app'); /** refresh clients.*/
    }

    /**
     * A participant begins its current period.
     *
     * - Participant notifies its clients of periodIndex.
     * - If current period undefined, initialize it ({@link App.initPeriod}).
     * - Participant begins period ({@link Period.participantBegin}).
     *
     * Called from:
     * - {@link App.participantMoveToNextPeriod}.
     *
     * @param  {type} participant The participant.
     */
    participantBeginPeriod(participant) {
        var prd = participant.periodIndex;
        participant.emit('participantSetPeriodIndex', {periodIndex: participant.periodIndex});

        var period = this.getPeriod(prd);
        if (period === undefined) {
            return false;
        }
        period.participantBegin(participant);
    }

    getPeriod(index) {
        if (this.periods[index] == undefined) {
            this.initPeriod(index);
        }
        return this.periods[index];
    }

    /**
     * A participant moves to its next period.
     *
     * FUNCTIONALITY
     * - If participant is currently in a period, end it ({@link Period.participantEnd}).
     * - Increment participant's period index.
     * - Save participant ({@link Participant.save}).
     * - If participant is has finished all periods in this app, move to next app ({@link Session.participantMoveToNextApp}).
     * - Otherwise, begin new period ({@link App.participantBeginPeriod}).
     *
     * CALLED FROM
     * - {@link App#playerMoveToNextStage}
     * - {@link App#participantBegin}
     *
     * @param  {type} participant description
     * @return {type}             description
     */
     participantMoveToNextPeriod(participant) {
         // If in the last period of app, move to next app.
         if (participant.periodIndex >= this.numPeriods - 1) {
             this.session.participantMoveToNextApp(participant);
         }

         // Move to the next period of this app.
         else {
             // If not in the first period, end the previous period for this participant.
             if (participant.periodIndex > -1) {
                 participant.player.period().participantEnd(participant);
             }

             // Move to next period.
             participant.periodIndex++;
             participant.save();
             this.participantBeginPeriod(participant);
         }
     }

    /**
     * A participant finishes playing this app.
     *
     * FUNCTIONALITY
     * - Participant's clients unsubscribe from messages from this app.
     * - Try to end the app ({@link App#tryToEndApp}).
     *
     * CALLED FROM
     * - xxx
     *
     * @param  {Participant} participant The participant.
     */
    participantEnd(participant) {
        // for (var c in participant.clients) {
        //     var client = participant.clients[c];
        //     client.socket.leave(this.roomId());
        // }
        this.tryToEndApp();
    }

    /**
     * Move the player to their next stage.
     *
     * FUNCTIONALITY
     * - if player has not finished all stages,
     * -- set player status to 'playing'
     * -- increment player's stage index.
     * -- play next stage ({@link Stage#playerPlayDefault}).
     * -- player emits update ({@link Player#emitUpdate2}).
     * - otherwise, move participant to next period ([this.participantMoveToNextPeriod(player.participant)]{@link App#participantMoveToNextPeriod}).
     *
     * CALLED FROM
     * - {@link App#groupMoveToNextStage}
     *
     * @param  {Player} player The player
     * @return {type}        description
     */
    playerMoveToNextStage(player) {
        if (player.stageIndex < this.stages.length - 1) {
            player.status = 'playing';
            player.stageIndex++;
            player.stage = this.stages[player.stageIndex];
            player.stage.playerPlayDefault(player);
            player.emitUpdate2();
        } else {
            this.participantMoveToNextPeriod(player.participant);
        }
    }

    /**
     * Returns the player of the current player's participant from the previous period.
     *
     * @param  {Player} player The player.
     * @return {Player}        The previous player, if any.
     */
    previousPlayer(player) {
        var prevPeriod = player.period().prevPeriod();
        if (prevPeriod === null) {
            return null;
        } else {
            return prevPeriod.playerByParticipantId(player.id);
        }
    }

    /**
     * Returns the group of the current player's participant from the previous period.
     *
     * @param  {Group} group The group.
     * @return TODO:{Player}        The previous player, if any.
     */
    previousGroup(group) {
        var prevPeriod = group.period().prevPeriod();
        if (prevPeriod === null) {
            return null;
        } else {
            return Utils.findByIdWOJQ(prevPeriod.groups, group.id);
        }
    }

    /**
     * roomId - description
     *
     * @return {string}  {@link Session#roomId} + '_app_' + this.id
     */
    roomId() {
        return this.session.roomId() + '_app_' + this.indexInSession() + '-' + this.id;
    }

    /**
     * saveSelfAndChildren - description
     *
     * CALLED FROM:
     * - {@link Session#addApp}

     * @return {type}  description
     */
    saveSelfAndChildren() {
        this.save();
        for (var i in this.stages) {
            this.stages[i].save();
        }
    }

    /**
     * Save this {@link App} to the session .gsf file.
     *
     * CALLED FROM:
     * - {@link App#saveSelfAndChildren}
     *
     */
    save() {
        try {
            this.session.jt.log('App.save: ' + this.id);
            var toSave = this.shell();
            this.session.saveDataFS(toSave, 'APP');
        } catch (err) {
            console.log('Error saving app ' + this.id + ': ' + err);
        }
    }

    /**
     * A shell of this object. Excludes parent, includes child shells.
     *
     * CALLED FROM:
     * - {@link Session#addApp}
     *
     * @return {type}  description
     */
    shellWithChildren() {
        var out = {};
        var fields = this.outputFields();
        for (var f in fields) {
            var field = fields[f];
            if (Utils.isFunction(this[field])) {
                out['__func_' + field] = this[field].toString();
            } else {
                out[field] = this[field];
            }
        }
        out.indexInSession = this.indexInSession();
        out.periods = [];
        for (var i in this.periods) {
            out.periods[i] = this.periods[i].shellWithChildren();
        }
        out.stages = [];
        for (var i in this.stages) {
            out.stages[i] = this.stages[i].shell();
        }
        out.options = this.options;
        return out;
    }

    /**
     * A shell of this object. Includes parent shell, excludes child shells.
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
        out.session = this.session.shell();
        out.numStages = this.stages.length;
        return out;
    }

    /**
     * A shell of this object. Excludes parent and children. The shell is a simplified version of an object and any of its fields.
     *
     * CALLED FROM
     * - {@link App#save}
     *
     * @return {Object}  description
     */
    shell() {
        var out = {};
        var fields = this.outputFields();
        for (var f in fields) {
            var field = fields[f];
            out[field] = this[field];
        }
        out.sessionIndex = this.indexInSession();
        return out;
    }

    /**
     * If all participants have finished the app, end the app ({@link App#end}).
     *
     * CALLED FROM
     * - {@link App#participantEnd}
     *
     * @return {type}  description
     */
    tryToEndApp() {
        if (this.finished) {
            return;
        }

        var proceed = true;
        var participants = this.session.participants;
        for (var p in participants) {
            var participant = participants[p];
            if (!participant.isFinishedApp(this)) {
                proceed = false;
                break;
            }
        }
        if (proceed) {
            this.end();
        }
    }

    // Helper method for writing to csv.
    //TODO:
    appendValues(newLine, headers, obj) {
        for (var i=0; i<headers.length; i++) {
            var header = headers[i];
            var value = obj[header];
            if (value !== undefined && value !== null) {

                // If value is an object, change it to string.
                if (typeof value === 'object') {
                    value = JSON.stringify(obj[header]);
                }

                // If value is a string, replace any commas.
                if (typeof value === 'string') {
                    value = value.replace(/,/g, '--');
                }

                // Append the value.
                newLine += value;
            }

            if (i<headers.length-1) {
                newLine += ',';
            }
        }
        return newLine;
    }


    /**
     * Overwrite in app.jtt.
     *
     * @param  {type} participant description
     * @return {type}             description
     */
    participantStart(participant) {}

    getNextPeriod(participant) {
        if (participant.periodIndex >= this.numPeriods - 1) {
            return null;
        } else {
            return this.getPeriod(participant.periodIndex+1);
        }
    }

}

var exports = module.exports = {};
exports.new = App;
exports.load = App.load;
