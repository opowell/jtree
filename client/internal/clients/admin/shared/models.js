'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Stage = require('./Stage.js');
var Period = require('./Period.js');
var Utils = require('./Utils.js');
var fs = require('fs-extra');
var path = require('path');

/** Class that represents an app. */

var App = function () {

    /**
     * Creates an App.
     *
     * @param  {Session} session description
     * @param  {String} id      description
     */
    function App(session, jt, appPath) {
        _classCallCheck(this, App);

        /**
         * The unique identifier of this App. In order of precedence, the value is given by:
         * - the explicit value in the .jtt file (if it has been set)
         * - the name of the .jtt file (if it is not app.jtt or app.js)
         * - the name of the folder containing the .jtt file
         * @type {String}
         */
        this.id = appPath;

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
        this.html = '\n            <!DOCTYPE html>\n            <html>\n                <head>\n                    <meta http-equiv=\'Content-Type\' content=\'text/html; charset=utf-8\'>\n                </head>\n                <body>\n                    <p>Period: {{period.id}}/{{app.numPeriods}}</p>\n                    <p id=\'time-remaining-div\'>Time left: {{clock.minutes}}:{{clock.seconds}}</p>\n                    <span jt-status=\'active\'>\n                        {{stages}}\n                    </span>\n                    <span jt-status=\'waiting\'>\n                        {{waiting-screen}}\n                    </span>\n                </body>\n            </html>\n        ';

        /** TODO:   */
        this.screen = '';

        /** Shown on all client playing screens if {@link Stage.useAppActiveScreen} = true.
        * @default null
        */
        this.activeScreen = null;

        /** Shown on all client waiting screens if {@link Stage.useWaitingScreen} = true.
        */
        this.waitingScreen = '\n            <p>WAITING</p>\n            <p>The experiment will continue soon.</p>\n        ';

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
        this.outputHideAuto = ['stageContentStart', 'stageContentEnd', 'optionValues', 'insertJtreeRefAtStartOfClientHTML', 'textMarkerBegin', 'textMarkerEnd', 'html', 'description', 'keyComparisons', 'screen', 'activeScreen', 'waitingScreen', 'stageWrapPlayingScreenInFormTag', 'waitForAll', 'finished', 'htmlFile', 'this', 'session', 'stages', 'outputHideAuto', 'outputHide', 'periods', 'messages', 'type', 'folder', 'options', 'jt'];

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
     * @static newSansId - return an app with the given path.
     *
     * @param  {type} jt      description
     * @param  {type} appPath The path relative to the server process. i.e. /apps/my-app.jtt or /apps/my-complex-app/app.js
     * @return {App}          The given app.
     */


    _createClass(App, [{
        key: 'addClient',


        /**
         * Overwrite to add custom functionality for when a {@link Client} starts this app.
         *
         * Called from:
         * - {@link App#addClientDefault}.
         *
         * @param  {Client} client The client who is connecting to this app.
         */
        value: function addClient(client) {}
        /** Overwrite */


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

    }, {
        key: 'addClientDefault',
        value: function addClientDefault(client) {
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
                client.on(stageName, function (data) {
                    // stage messages are sent by default when submit button is clicked.
                    app.session.pushMessage(client, data.data, data.data.fnName);
                });

                // Queue message.
                client[stageName] = function (data) {
                    app.session.pushMessage(client, data, data.fnName + 'Process');
                };

                // Process the message.
                client[stageName + 'Process'] = function (data) {

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
            } catch (err) {
                console.log(err);
            }
        }

        /** TODO */

    }, {
        key: 'addStages',
        value: function addStages(array) {
            for (var i = 0; i < array.length; i++) {
                this.addStage(array[i]);
            }
        }

        // TODO

    }, {
        key: 'addStage',
        value: function addStage(name) {
            var stage = this.newStage(name);
            var fn = 'apps/' + this.id + '/' + name + '.js';
            try {
                eval(Utils.readJS(fn));
            } catch (err) {
                console.log('Error evaluating ' + fn);
                console.log(err);
            }
        }

        //TODO

    }, {
        key: 'setContents',
        value: function setContents(contents) {
            try {
                fs.writeFileSync('apps/' + this.id + '.jtt', contents);
            } catch (err) {
                console.log(err);
            }
        }

        //TODO

    }, {
        key: 'setFileContents',
        value: function setFileContents(filename, contents) {
            try {
                fs.writeFileSync('apps/' + this.id + '/' + filename, contents);
            } catch (err) {
                console.log(err);
            }
        }

        /**
         * Get next stage for player in their current period. Return null if already at last stage of period.
         *
         * DUE TO:
         * {@link Stage.playerEnd}
         */

    }, {
        key: 'getNextStageForPlayer',
        value: function getNextStageForPlayer(player) {
            var stageInd = player.stageIndex;

            /** If not in the last stage, return next stage.*/
            if (stageInd < this.stages.length - 1) {
                return this.stages[stageInd + 1];
            } else {
                return null;
            }
        }

        /**
         * TODO
         * Get group ids for their current period
         */

    }, {
        key: 'getGroupIdsForPeriod',
        value: function getGroupIdsForPeriod(period) {
            var participants = this.session.participants;
            var numGroups = period.numGroups();
            var pIds = [];
            for (var p in participants) {
                pIds.push(p);
            }
            // Group IDs.
            var gIds = [];
            for (var g = 0; g < numGroups; g++) {
                gIds.push([]);
            }

            // Calculate number of elements per group
            var m = Math.floor((pIds.length - 1) / numGroups) + 1;

            if (this.groupMatchingType === 'PARTNER_1122') {
                for (var g = 0; g < numGroups; g++) {
                    for (var i = 0; i < m; i++) {
                        gIds[g].push(pIds[0]);
                        pIds.splice(0, 1);
                    }
                }
            } else if (this.groupMatchingType === 'PARTNER_1212') {
                for (var i = 0; i < m; i++) {
                    for (var g = 0; g < numGroups; g++) {
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
    }, {
        key: 'sendParticipantPage',
        value: function sendParticipantPage(req, res, participant) {

            // Load dynamic version of app to allow for live editing of stage html.
            // var app = this;
            var app = this.reload();

            // Start with hard-coded html, if any.
            var html = '';
            if (app.html != null) {
                html = html + app.html;
            }
            if (app.screen != null) {
                html = html + app.screen;
            }

            // Load content of html file, if any.
            // Try app.htmlFile, id.html, and client.html.
            var htmlFile = app.htmlFile == null ? app.id + '.html' : app.htmlFile;
            var filename = path.join(app.jt.path, '/apps/' + app.id + '/' + htmlFile);
            if (fs.existsSync(filename)) {
                html = html + Utils.readTextFile(filename);
            } else {
                htmlFile = 'client.html';
                filename = path.join(app.jt.path, '/apps/' + app.id + '/' + htmlFile);
                if (fs.existsSync(filename)) {
                    html = html + Utils.readTextFile(filename);
                }
            }

            if (app.activeScreen != null) {
                html += '\n            <span jt-status=\'playing\' class=\'playing-screen\'>\n                ' + app.activeScreen + '\n                <div>\n                {{stages}}\n                </div>\n            </span>\n            ';
            }

            if (!html.includes('{{stages}}')) {
                html += '\n            <span jt-status=\'playing\' class=\'playing-screen\'>\n                {{stages}}\n            </span>\n            ';
            }

            // Load stage contents, if any.
            var stagesHTML = '';
            for (var i = 0; i < app.stages.length; i++) {
                var stage = app.stages[i];
                if (stage.content != null) {
                    if (stagesHTML.length > 0) {
                        stagesHTML = stagesHTML + '\n';
                    }
                    var contentStart = app.parseStageTag(stage, app.stageContentStart);
                    var contentEnd = app.parseStageTag(stage, app.stageContentEnd);
                    stagesHTML = stagesHTML + contentStart + '\n' + stage.content + '\n' + contentEnd;
                }
                if (stage.activeScreen != null) {
                    if (stagesHTML.length > 0) {
                        stagesHTML = stagesHTML + '\n';
                    }
                    stagesHTML += app.parseStageTag(stage, app.stageContentStart) + '\n';
                    var wrapInForm = stage.wrapPlayingScreenInFormTag;
                    if (wrapInForm) {
                        stagesHTML += '<form>\n';
                    }
                    stagesHTML += stage.activeScreen + '\n';
                    if (wrapInForm) {
                        stagesHTML += '</form>\n';
                    }
                    stagesHTML += app.parseStageTag(stage, app.stageContentEnd);
                }
            }
            if (html.includes('{{stages}}')) {
                html = html.replace('{{stages}}', stagesHTML);
            }

            if (html.includes('{{waiting-screen}}') && app.waitingScreen != null) {
                html = html.replace('{{waiting-screen}}', app.waitingScreen);
            }

            // Replace {{ }} markers.
            var markerStart = app.textMarkerBegin;
            var markerEnd = app.textMarkerEnd;
            while (html.indexOf(markerStart) > -1) {
                var ind1 = html.indexOf(markerStart);
                var ind2 = html.indexOf(markerEnd);
                var text = html.substring(ind1 + markerStart.length, ind2);
                var span = '<i jt-text="' + text + '" style="font-style: normal"></i>';
                html = html.replace(markerStart + text + markerEnd, span);
            }

            // Insert jtree functionality.
            if (app.insertJtreeRefAtStartOfClientHTML) {
                html = '<script type="text/javascript" src="/participant/jtree.js"></script>\n' + html;
            }

            // Return to client.
            res.send(html);
        }

        // TODO

    }, {
        key: 'parseStageTag',
        value: function parseStageTag(stage, text) {
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

    }, {
        key: 'end',
        value: function end() {

            this.finished = true;

            this.saveOutput(this.session.csvFN());
        }
    }, {
        key: 'saveOutput',
        value: function saveOutput(fn) {

            //Create headers
            var appsHeaders = [];
            var appsSkip = ['id'];
            var appFields = this.outputFields();
            Utils.getHeaders(appFields, appsSkip, appsHeaders);

            var periodHeaders = [];
            var groupHeaders = [];
            var playerHeaders = [];
            var periodSkip = ['id'];
            var groupSkip = ['id', 'allPlayersCreated'];
            var playerSkip = ['status', 'stageIndex', 'id', 'participantId'];
            var groupTables = [];
            var groupTableHeaders = {};
            for (var i = 0; i < this.periods.length; i++) {
                var period = this.periods[i];
                var periodFields = period.outputFields();
                Utils.getHeaders(periodFields, periodSkip, periodHeaders);
                for (var j = 0; j < period.groups.length; j++) {
                    var group = period.groups[j];
                    for (var k = 0; k < group.tables.length; k++) {
                        var tableId = group.tables[k];
                        if (!groupTables.includes(tableId)) {
                            groupTables.push(tableId);
                            groupTableHeaders[tableId] = [];
                        }
                        var tableHeaders = groupTableHeaders[tableId];
                        var tableFields = group[tableId].outputFields();
                        Utils.getHeaders(tableFields, [], tableHeaders);
                    }
                    var groupFields = group.outputFields();
                    Utils.getHeaders(groupFields, groupSkip, groupHeaders);
                    for (var k = 0; k < group.players.length; k++) {
                        var player = group.players[k];
                        var fieldsToOutput = player.outputFields();
                        Utils.getHeaders(fieldsToOutput, playerSkip, playerHeaders);
                    }
                }
            }
            var participantHeaders = [];
            var participantSkip = ['id', 'points', 'periodIndex', 'appIndex'];
            for (var i in this.session.participants) {
                var participant = this.session.participants[i];
                var participantFields = participant.outputFields();
                Utils.getHeaders(participantFields, participantSkip, participantHeaders);
            }

            //Create data
            var appsText = [];
            appsText.push('id,' + appsHeaders.join(','));
            var newLine = this.id + ',';
            for (var h = 0; h < appsHeaders.length; h++) {
                var header = appsHeaders[h];
                if (this[header] !== undefined) {
                    newLine += JSON.stringify(this[header]);
                }
                if (h < appsHeaders.length - 1) {
                    newLine += ',';
                }
            }
            appsText.push(newLine);

            var periodText = [];
            var groupText = [];
            var playerText = [];
            groupText.push('period.id,group.id,' + groupHeaders.join(','));
            playerText.push('period.id,group.id,participant.id,' + playerHeaders.join(','));
            for (var i = 0; i < this.periods.length; i++) {
                var period = this.periods[i];
                var newLine = period.id + ',';
                newLine = this.appendValues(newLine, periodHeaders, period);
                periodText.push(newLine);
                for (var j = 0; j < period.groups.length; j++) {
                    var group = period.groups[j];
                    var newLine = period.id + ',' + group.id + ',';
                    newLine = this.appendValues(newLine, groupHeaders, group);
                    groupText.push(newLine);
                    for (var k = 0; k < group.players.length; k++) {
                        var player = group.players[k];
                        var participant = player.participant;
                        var newLine = period.id + ',' + group.id + ',' + participant.id + ',';
                        newLine = this.appendValues(newLine, playerHeaders, player);
                        playerText.push(newLine);
                    }
                }
            }
            var participantText = [];
            var participantHeadersText = 'id,points';
            if (participantHeaders.length > 0) {
                participantHeadersText += ',' + participantHeaders.join(',');
            }
            participantText.push(participantHeadersText);
            var pIds = Object.keys(this.session.participants).sort();
            for (var i in pIds) {
                var participant = this.session.participants[pIds[i]];
                var newLine = participant.id + ',' + participant.points();
                if (participantHeaders.length > 0) {
                    newLine += ',';
                }
                for (var h = 0; h < participantHeaders.length; h++) {
                    var header = participantHeaders[h];
                    if (participant[header] !== undefined) {
                        newLine += participant[header];
                    }
                    if (h < participantHeaders.length - 1) {
                        newLine += ',';
                    }
                }
                participantText.push(newLine);
            }

            // WRITE OUTPUT
            fs.appendFileSync(fn, 'APP ' + this.indexInSession() + '_' + this.id + '\n');
            fs.appendFileSync(fn, appsText.join('\n') + '\n');
            if (periodHeaders.length > 0) {
                fs.appendFileSync(fn, 'PERIODS\n');
                fs.appendFileSync(fn, periodText.join('\n') + '\n');
            }
            if (groupHeaders.length > 0) {
                fs.appendFileSync(fn, 'GROUPS\n');
                fs.appendFileSync(fn, groupText.join('\n') + '\n');
            }

            for (var t = 0; t < groupTables.length; t++) {
                var groupTableText = [];
                var table = groupTables[t];
                var tableHeaders = groupTableHeaders[table];
                groupTableText.push('period.id,group.id,id,' + tableHeaders.join(','));
                for (var i = 0; i < this.periods.length; i++) {
                    var period = this.periods[i];
                    for (var j = 0; j < period.groups.length; j++) {
                        var group = period.groups[j];
                        var tabRows = group[table].rows;
                        for (var r = 0; r < tabRows.length; r++) {
                            var row = tabRows[r];
                            var newLine = period.id + ',' + group.id + ',' + row.id + ',';
                            newLine = this.appendValues(newLine, tableHeaders, row);
                            groupTableText.push(newLine);
                        }
                    }
                }
                fs.appendFileSync(fn, groupTables[t].toUpperCase() + '\n');
                fs.appendFileSync(fn, groupTableText.join('\n') + '\n');
            }

            if (playerHeaders.length > 0) {
                fs.appendFileSync(fn, 'PLAYERS\n');
                fs.appendFileSync(fn, playerText.join('\n') + '\n');
            }

            fs.appendFileSync(fn, 'PARTICIPANTS\n');
            fs.appendFileSync(fn, participantText.join('\n') + '\n');
        }

        /**
         * @return {string}  Session path + {@link App#indexInSession} + '_' + app.id
         */

    }, {
        key: 'getOutputFN',
        value: function getOutputFN() {
            return this.session.getOutputDir() + '/' + this.indexInSession() + '_' + this.id;
        }

        /**
         * - clear group's timer.
         * - if next stage exists, let the group play it.
         * - for each player in the group, call {@link App#playerMoveToNextStage}.
         *
         * @param  {Group} group
         */

    }, {
        key: 'groupMoveToNextStage',
        value: function groupMoveToNextStage(group) {
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

    }, {
        key: 'indexInSession',
        value: function indexInSession() {
            if (this.session === null) {
                return -1;
            }

            for (var i in this.session.apps) {
                if (this.session.apps[i] === this) {
                    return parseInt(i) + 1;
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

    }, {
        key: 'initPeriod',
        value: function initPeriod(prd) {
            var period = new Period.new(prd + 1, this);
            period.save();
            this.periods.push(period);
        }

        /**
         * metaData - description
         *
         * @return {type}  description
         */

    }, {
        key: 'metaData',
        value: function metaData() {
            var metaData = {};
            metaData.numPeriods = this.numPeriods;
            metaData.groupSize = this.groupSize;
            metaData.id = this.id;
            metaData.title = this.title;
            metaData.description = this.description;
            metaData.appPath = this.appPath;

            // var folder = path.join(this.jt.path, this.jt.settings.appFolders[0] + '/' + this.id);
            try {
                if (this.appPath.endsWith('.jtt') || this.appPath.endsWith('.js')) {
                    metaData.appjs = Utils.readJS(this.appPath);
                } else {
                    metaData.appjs = Utils.readJS(this.appPath + '/app.jtt');
                }
            } catch (err) {
                metaData.appjs = '';
            }

            try {
                metaData.clientHTML = Utils.readJS(this.appPath + '/client.html');
            } catch (err) {
                metaData.clientHTML = '';
            }

            var app = new App(null, this.jt, this.id);

            metaData.stages = [];
            try {
                eval(metaData.appjs);
                for (var i in app.stages) {
                    metaData.stages.push(app.stages[i].id);
                }
                metaData.numPeriods = app.numPeriods;
                metaData.options = app.options;
            } catch (err) {
                metaData.stages.push('unknown');
                metaData.numPeriods = 'unknown';
            }

            return metaData;
        }
    }, {
        key: 'addPositiveIntegerOption',
        value: function addPositiveIntegerOption(name, defaultVal, max, desc) {
            this.addNumberOption(name, defaultVal, 1, max, 1, desc);
        }
    }, {
        key: 'addNumberOption',
        value: function addNumberOption(name, defaultVal, min, max, step, description) {
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
    }, {
        key: 'addTextOption',
        value: function addTextOption(name, defaultVal, description) {
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
    }, {
        key: 'addSelectOption',
        value: function addSelectOption(optionName, optionVals, description) {

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
    }, {
        key: 'reload',
        value: function reload() {
            var app = new App(this.session, this.id, this.jt);
            app.optionValues = this.optionValues;
            for (var opt in app.optionValues) {
                app[opt] = app.optionValues[opt];
            }
            var appCode = Utils.readJS(this.appPath);
            eval(appCode);
            return app;
        }
    }, {
        key: 'setOptionValue',
        value: function setOptionValue(name, value) {
            this.optionValues[name] = value;
            var correctedValue = value;
            var isValid = false;
            for (var opt in this.options) {
                var option = this.options[opt];
                if (option.name === name) {
                    if (option.type === 'select') {
                        for (var i in option.values) {
                            if (option.values[i] == value) {
                                // allow for coercion
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

    }, {
        key: 'newStage',
        value: function newStage(id) {
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

    }, {
        key: 'nextStageForGroup',
        value: function nextStageForGroup(group) {
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

    }, {
        key: 'onPlayerFinished',
        value: function onPlayerFinished(player) {
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

    }, {
        key: 'outputFields',
        value: function outputFields() {
            var fields = [];
            for (var prop in this) {
                if (App.prototype[prop] !== this[prop] && !this.outputHide.includes(prop) && !this.outputHideAuto.includes(prop)) fields.push(prop);
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

    }, {
        key: 'participantBegin',
        value: function participantBegin(participant) {

            for (var c in participant.clients) {
                var client = participant.clients[c];
                this.addClientDefault(client);
            }

            participant.periodIndex = -1;
            participant.emit('participantSetAppIndex', { appIndex: this.indexInSession() });

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

    }, {
        key: 'participantBeginPeriod',
        value: function participantBeginPeriod(participant) {
            var prd = participant.periodIndex;
            participant.emit('participantSetPeriodIndex', { periodIndex: participant.periodIndex });

            var period = this.getPeriod(prd);
            if (period === undefined) {
                return false;
            }
            period.participantBegin(participant);
        }
    }, {
        key: 'getPeriod',
        value: function getPeriod(index) {
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

    }, {
        key: 'participantMoveToNextPeriod',
        value: function participantMoveToNextPeriod(participant) {
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

    }, {
        key: 'participantEnd',
        value: function participantEnd(participant) {
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

    }, {
        key: 'playerMoveToNextStage',
        value: function playerMoveToNextStage(player) {
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

    }, {
        key: 'previousPlayer',
        value: function previousPlayer(player) {
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

    }, {
        key: 'previousGroup',
        value: function previousGroup(group) {
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

    }, {
        key: 'roomId',
        value: function roomId() {
            return this.session.roomId() + '_app_' + this.indexInSession() + '-' + this.id;
        }

        /**
         * saveSelfAndChildren - description
         *
         * CALLED FROM:
         * - {@link Session#addApp}
           * @return {type}  description
         */

    }, {
        key: 'saveSelfAndChildren',
        value: function saveSelfAndChildren() {
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

    }, {
        key: 'save',
        value: function save() {
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

    }, {
        key: 'shellWithChildren',
        value: function shellWithChildren() {
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

    }, {
        key: 'shellWithParent',
        value: function shellWithParent() {
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

    }, {
        key: 'shell',
        value: function shell() {
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

    }, {
        key: 'tryToEndApp',
        value: function tryToEndApp() {
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

    }, {
        key: 'appendValues',
        value: function appendValues(newLine, headers, obj) {
            for (var i = 0; i < headers.length; i++) {
                var header = headers[i];
                var value = obj[header];
                if (value !== undefined && value !== null) {

                    // If value is an object, change it to string.
                    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
                        value = JSON.stringify(obj[header]);
                    }

                    // If value is a string, replace any commas.
                    if (typeof value === 'string') {
                        value = value.replace(/,/g, '--');
                    }

                    // Append the value.
                    newLine += value;
                }

                if (i < headers.length - 1) {
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

    }, {
        key: 'participantStart',
        value: function participantStart(participant) {}
    }, {
        key: 'getNextPeriod',
        value: function getNextPeriod(participant) {
            if (participant.periodIndex >= this.numPeriods - 1) {
                return null;
            } else {
                return this.getPeriod(participant.periodIndex + 1);
            }
        }
    }], [{
        key: 'newSansId',
        value: function newSansId(jt, appPath) {
            console.log('loading app with no session: ' + appPath);
            var out = new App(null, jt, appPath);
            return out;
        }

        /**
         * @static Load an app from json.
         *
         * CALLED FROM:
         * - {@link Session#load}
         *
         * @param  {Object} json    A json object containing the properties of the app.
         * @param  {Session} session The session this app belongs to.
         * @return {App}         A new app initialized with the data in json.
         */

    }, {
        key: 'load',
        value: function load(json, session) {
            var index = json.sessionIndex;
            var app = new App(session, json.id, session.jt);

            // Run app code.
            var folder = path.join(session.jt.path, session.getOutputDir() + '/' + index + '_' + json.id);
            var appCode = Utils.readJS(folder + '/app.jtt');
            eval(appCode);

            //If there is already an app in place, save its stages and periods??
            if (session.apps.length > index - 1) {
                var curApp = session.apps[index - 1];
                /** app.stages = curApp.stages;*/
                app.periods = curApp.periods;
            }

            for (var j in json) {
                app[j] = json[j];
            }

            session.apps[index - 1] = app;
        }
    }]);

    return App;
}();

var _exports = module.exports = {};
_exports.new = App;
_exports.load = App.load;
_exports.newSansId = App.newSansId;