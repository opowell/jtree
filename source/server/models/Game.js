const Period    = require('./Period.js');
const Utils     = require('./Utils.js');
const fs        = require('fs-extra');
const path      = require('path');
const Timer     = require('./Timer.js');

/** Class that represents an app. */
class Game {

    /**
     * Creates an Game.
     *
     * @param  {Session} session description
     * @param  {String} id      description
     */
    constructor(session, jt, appPath, parent) {

        /**
         * The unique identifier of this Game. In order of precedence, the value is given by:
         * - the explicit value in the .jtt file (if it has been set)
         * - the name of the .jtt file (if it is not app.jtt or app.js)
         * - the name of the folder containing the .jtt file
         * @type {String}
         */
        this.id = appPath;

        this.parent = parent;
        this.superGame = parent;

        let id = appPath;
        if (id.includes('app.js') || id.includes('app.jtt') || id.includes('app.jtg')) {
            let str = null;
            if (id.includes('app.js')) {
                str = 'app.js';
            } else if (id.includes('app.jtt')) {
                str = 'app.jtt';
            } else if (id.includes('app.jtg')) {
                str = 'app.jtg';
            }
            id = id.substring(0, id.lastIndexOf(str));

           // Strip trailing slashes.
            if (id.endsWith('/')) {
                id = id.substring(0, id.lastIndexOf('/'));
            } else if (id.endsWith('\\')) {
                id = id.substring(0, id.lastIndexOf('\\'));
            }
            // Cut all but last part of path.
            if (id.lastIndexOf('/') > -1) {
                id = id.substring(id.lastIndexOf('/') + 1);
            } else if (id.lastIndexOf('\\') > -1) {
                id = id.substring(id.lastIndexOf('\\') + 1);
            }
        } else {
            // Strip folders.
            if (id.lastIndexOf('/') > -1) {
                this.appDir = id.substring(0, id.lastIndexOf('/'));
                id = id.substring(id.lastIndexOf('/') + 1);
            } else if (id.lastIndexOf('\\') > -1) {
                this.appDir = id.substring(0, id.lastIndexOf('\\'));
                id = id.substring(id.lastIndexOf('\\') + 1);
            }
            this.appFilename = id;
            if (id.endsWith('.js')) {
                id = id.substring(0, id.length - '.js'.length);
            } else if (id.endsWith('.jtt')) {
                id = id.substring(0, id.length - '.jtt'.length);
            } else if (id.endsWith('.jtg')) {
                id = id.substring(0, id.length - '.jtg'.length);
            }
        }
        this.shortId = id;


        /**
         * @type {jt}
         */
        // this.jt = jt;

        /** Where the original definition of this app is stored on the server.*/
        this.appPath = appPath;

        /**
         * The Session that this Game belongs to.
         * @type {Session}
         */
        while (session.__target) {
            session = session.__target;
        }
        this.session = session;


        /**
         * The subgames of this Game.
         * @type Array
         * @default []
         */
        this.subgames = [];

        /**
         * timeout duration in seconds
         * if <= 0, then no timeout for this stage.
         * @type number
         * @default 0
         */
        this.duration 	= 0;

        this.started = false;

        /**
         * @default null
         */
        this.activeScreen = null;

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

        // If not null, the length of time a participant has to play this app.
        this.duration = null;

        /** Used by the participant client to find and create dynamic text elements.*/
        this.textMarkerBegin = '{{{';
        this.textMarkerEnd = '}}}';

        this.useVue = true;

        this.addOKButtonIfNone = true;

        /**
         * The number of periods in this Game.
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

        /**
         * Shown on all client screens.
         * @type String
         * @default 
         */ 
        this.html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                </head>
                <body class='hidden'>
                    <div id='jtree'>
                        <p v-show='superGame.numPeriods > 1'>Period: {{period.id}}/{{superGame.numPeriods}}</p>
                        <p v-show='hasTimeout'>Time left (s): {{clock.totalSeconds}}</p>
                        <span v-show='player.status=="playing"'>
                            {{stages}}
                        </span>
                        <span v-show='["waiting", "finished", "done"].includes(player.status)'>
                            {{waiting-screens}}
                        </span>
                    </div>
                    {{scripts}}
                </body>
            </html>
        `;

        this.vueModels = {};
        this.vueComputed = {};
        this.vueMethods = {};

        this.vueMethodsDefaults = {
            checkForm: function (e) {
                return true;
                e.preventDefault();
            }
        }

        this.clientScripts = null;

        // Paths of script tags.
        this.modifyPathsToIncludeId = true;

        /** TODO:   */
        this.screen = '';

        /** Shown on all client playing screens if {@link Stage.useGameActiveScreen} = true.
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
         * The periods of this Game.
         * @type Array
         * @default []
         */
        this.periods = [];

        /**
        * Description of this Game.
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

        this.subGameWaitToStart = true;
        this.subGameWaitToEnd = true;

        /**
         * The matching type to be used for groups in this Game.
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
         * Set default value for Stage.wrapPlayingScreenInFormTag.
         * If 'yes', then form is added.
         * If 'no', no form is added.
         * If 'onlyIfNoButton', then form is added only if page has no buttons.
         * @type String
         * @default true
         */
        this.subgameWrapPlayingScreenInFormTag = 'onlyIfNoButton';

        this.wrapPlayingScreenInFormTag = 'onlyIfNoButton';

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
         * Starts the stages of this Game.
         * TODO:
         * @type string
         */
        this.subgameContentStart = `<span v-if="game.id == '{{game.id}}'">`;


        /**
         * Ends the stages of this Game.
         * TODO:
         * @type string
         * @default '</span>'
         */
        this.subgameContentEnd = '</span>';

        //TODO:
        this.outputHideAuto = [
            'subgameContentStart',
            'subgameContentEnd',
            'optionValues',
            'insertJtreeRefAtStartOfClientHTML',
            'textMarkerBegin',
            'textMarkerEnd',
            'html',
            'description',
            'keyComparisons',
            'screen',
            'subgameWrapPlayingScreenInFormTag',
            'waitForAll',
            'finished',
            'htmlFile',
            'this',
            'session',
            'subgames',
            'outputHideAuto',
            'outputHide',
            'periods',
            'messages',
            'folder',
            'options',
            'jt'
        ];

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

        // this.newStage = this.addSubGame;

    }

    /**
     * @static newSansId - return an app with the given path.
     *
     * @param  {type} jt      description
     * @param  {type} appPath The path relative to the server process. i.e. /apps/my-app.jtt or /apps/my-complex-app/app.js
     * @return {Game}          The given app.
     */
    static newSansId(jt, appPath) {
        console.log('loading app with no session: ' + appPath);
        var out = new Game(null, jt, appPath);
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
     * @return {Game}         A new app initialized with the data in json.
     */
    static load(json, session) {
        var index = json.sessionIndex;
        var app = new Game(session, session.jt, json.id, json.parent);

        // Run app code.
        // var folder = path.join(session.jt.path, session.getOutputDir() + '/' + index + '_' + json.id);
        // var appCode = Utils.readJS(folder + '/app.jtt');
        // eval(appCode);

        // //If there is already an app in place, save its stages and periods??
        // if (session.apps.length > index-1) {
        //     var curGame = session.apps[index-1];
        //     /** app.stages = curGame.stages;*/
        //     app.periods = curGame.periods;
        // }

        let keys = Object.keys(json);
        for (let i=0; i<keys.length; i++) {
            let key = keys[i];
            // console.log(i + ': ' + key);
            app[key] = json[key];
        }

        for (let i=0; i<app.subgames.length; i++) {
            app.subgames[i] = Game.load(app.subgames[i], session);
        }

        return app;
    }

    /**
     * Returns the amount of time this participant has to play this app.
     */
    getParticipantDuration(participant) {
        return this.duration;
    }

    /**
     * Overwrite to add custom functionality for when a {@link Client} starts this app.
     *
     * Called from:
     * - {@link Game#addClientDefault}.
     *
     * @param  {Client} client The client who is connecting to this app.
     */
    addClient(client) {
        /** Overwrite */
    }

    /**
    * Called when a {@link Client} connected to a {@link Participant} starts this app.
    *
    * - client subscribes to this Game's channel.
    * - client registers custom messages it may send.
    * - client registers automatic stage submission messages it may send.
    * - load custom behaviour [this.addClient]{@link Game#addClient}.
    *
    * Called from:
    * - {@link Game#participantBegin}
    *
    * @param  {Client} client The client who is connecting to this app.
    */
    addClientDefault(client) {

        for (var i in this.messages) {
            var msg = this.messages[i];
            client.register(i, msg);
        }

        // Load custom code, overwrite default stage submission behavior.
        try {
            this.addClient(client);
        } catch(err) {
            console.log(err);
        }

        for (var s in this.subgames) {
            this.subgames[s].addClientDefault(client);
        }

    }

    /** TODO */
    addStages(array) {
        for (var i=0; i<array.length; i++) {
            this.addStage(array[i]);
        }
    }

    // TODO
    addStage(name) {
        var stage = this.newStage(name);
        var fn = path.join(path.dirname(this.id), name);
        if (fs.existsSync(fn + '.jtt')) {
            fn = fn + '.jtt';
        } else if (fs.existsSync(fn + '.js')) {
            fn = fn + '.js';
        }
        try {
            eval(Utils.readJS(fn));
        } catch (err) {
            console.log('Error evaluating ' + fn);
            console.log(err);
        }
    }

    //TODO
    setContents(contents) {
        try {
            fs.writeFileSync('apps/' + this.id + '.jtt', contents);
        } catch (err) {
            console.log(err);
        }
    }

    //TODO
    setFileContents(filename, contents) {
        try {
            fs.writeFileSync('apps/' + this.id + '/' + filename, contents);
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Functions to overwrite.
     *
     * @param  {type} player description
     */
    groupEnd(group) {}
    groupStart(group) {}
    playerEnd(player) {}
    playerStart(player) {}

    /**
     * Get next stage for player in their current period. Return null if already at last stage of period.
     *
     * DUE TO:
     * {@link Stage.playerEnd}
     */
    getNextStageForPlayer(player) {
        var stageInd = player.stageIndex;

        if (player.stage.subgames.length > 0) {
            return player.stage.subgames[0];
        }

        /** If not in the last stage, return next stage.*/
        if (stageInd < this.subgames.length-1) {
            return this.subgames[stageInd+1];
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
        for (let i=0; i<participants.length; i++) {
            pIds.push(participants[i].id);
        }
        // Group IDs.
        var gIds = [];
        for (var g=0; g<numGroups; g++) {
            gIds.push([]);
        }

        for (let i=0; i<period.groups.length; i++) {
            let group = period.groups[i];
            for (let j=0; j<group.players.length; j++) {
                gIds[i].push(group.players[j].id);
                for (let k=0; k<pIds.length; k++) {
                    if (pIds[k] == group.players[j].id) {
                        pIds.splice(k, 1);
                    }
                }
            }
        }

        // Calculate number of elements per group
        var m = Math.floor((pIds.length-1) / numGroups) + 1;

        if (this.groupMatchingType === 'PARTNER_1122') {
            for (var g=this.groups.length; g<numGroups; g++) {
                for (var i=0; i<m; i++) {
                    gIds[g].push(pIds[0]);
                    pIds.splice(0, 1);
                }
            }
        } else if (this.groupMatchingType === 'PARTNER_1212') {
            for (var i=0; i<m; i++) {
                for (var g=this.groups.length; g<numGroups; g++) {
                    gIds[g].push(pIds[0]);
                    pIds.splice(0, 1);
                }
            }
        } else if (this.groupMatchingType === 'PARTNER_RANDOM') {
            if (period.id === 1) {
                period.getStrangerMatching(numGroups, pIds, gIds, m, period.groups.length);
            } else {
                var prevPeriod = period.prevPeriod();
                gIds = prevPeriod.groupIds();
            }
        } else if (this.groupMatchingType === 'STRANGER') {
            period.getStrangerMatching(numGroups, pIds, gIds, m, period.groups.length);
        }
        return gIds;
    }

    sendParticipantPage(req, res, participant) {

        if (this.superGame != null) {
            this.superGame.sendParticipantPage(req, res, participant);
            return;
        }

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
        var filename = path.join(global.jt.path, '/apps/' + app.id + '/' + htmlFile);
        if (fs.existsSync(filename)) {
            html = html + Utils.readTextFile(filename);
        } else {
            htmlFile = 'client.html';
            filename = path.join(global.jt.path, '/apps/' + app.id + '/' + htmlFile);
            if (fs.existsSync(filename)) {
                html = html + Utils.readTextFile(filename);
            }
        }

        if (app.activeScreen != null) {
            html += `
            <span v-show='player.status == "playing"' class='playing-screen'>
                ${app.activeScreen}
                <div>
                {{stages}}
                </div>
            </span>
            `;
        }

        if (!html.includes('{{stages}}')) {
            html += `
            <span v-show='player.status == "playing"' class='playing-screen'>
                {{stages}}
            </span>
            `;
        }

        // Load stage contents, if any.
        var stagesHTML = '';
        var waitingScreensHTML = '';

        let parseHTML = {stagesHTML, waitingScreensHTML}
        this.parseStagesHTML(app, parseHTML);
        stagesHTML = parseHTML.stagesHTML;
        waitingScreensHTML = parseHTML.waitingScreensHTML;

        let [strippedScripts, stagesHTML1] = this.stripTag('script', stagesHTML);
        let [strippedStyles, stagesHTML2] = this.stripTag('style', stagesHTML1);
        stagesHTML = stagesHTML2;

        if (html.includes('{{stages}}')) {
            html = html.replace('{{stages}}', stagesHTML);
        }

        // if (html.includes('{{waiting-screens}}') && app.waitingScreen != null) {
        //     html = html.replace('{{waiting-screens}}', app.waitingScreen);
        // }
        html = html.replace('{{waiting-screens}}', waitingScreensHTML);

        // Insert jtree functionality.
        if (app.insertJtreeRefAtStartOfClientHTML) {
            html = '<script type="text/javascript" src="/participant/jtree.js"></script>\n' + html;
        }

        let scriptsHTML = strippedStyles + '\n' + strippedScripts;
        if (app.clientScripts != null) {
            if (!app.clientScripts.trim().startsWith('<script')) {
                scriptsHTML = '<script>' + app.clientScripts + '</script>';
            } else {
                scriptsHTML = app.clientScripts;                
            }
        }
        
        if (html.includes('{{scripts}}')) {
            html = html.replace('{{scripts}}', scriptsHTML);
        }

        if (this.modifyPathsToIncludeId) {

            // Temporary fix, do not change anything that starts with '/' or 'http'.
            html = html.replace(/src="\//gmi, 'srcXXX="');
            html = html.replace(/src='\//gmi, "srcXXX='");
            html = html.replace(/src="http/gmi, 'srcXXXhttp="');
            html = html.replace(/src='http/gmi, "srcXXXhttp='");

            html = html.replace(/src="/gmi, 'src="./' + this.shortId + '/');
            html = html.replace(/src='/gmi, "src='./" + this.shortId + '/');

            // Revert fix.
            html = html.replace(/srcXXX="/gmi, 'src="/');
            html = html.replace(/srcXXX='/gmi, "src='/");
            html = html.replace(/srcXXXhttp="/gmi, 'src="http');
            html = html.replace(/srcXXXhttp='/gmi, "src='http");

        }
        // Return to client.
        res.send(html);
    }

    parseStagesHTML(app, html) {
        for (var i=0; i<app.subgames.length; i++) {
            var stage = app.subgames[i];

            // Stage HTML
            var stageHTML = '';
            var contentStart = app.parseStageTag(stage, app.subgameContentStart);
            var contentEnd = app.parseStageTag(stage, app.subgameContentEnd);
            if (stage.content != null) {
                stageHTML = contentStart + '\n' + stage.content + '\n' + contentEnd;
            }
            if (stage.activeScreen != null) {
                stageHTML += app.parseStageTag(stage, app.subgameContentStart)  + '\n';
                let wrapInForm = null;
                if (stage.wrapPlayingScreenInFormTag === 'yes') {
                    wrapInForm = true;
                } else if (stage.wrapPlayingScreenInFormTag === 'no') {
                    wrapInForm = false;
                } else if (stage.wrapPlayingScreenInFormTag === 'onlyIfNoButton') {
                    if (
                        !stage.activeScreen.includes('<button') ||
                        stage.addOKButtonIfNone
                        ) {
                        wrapInForm = true;
                    } else {
                        wrapInForm = false;
                    }
                }
                if (wrapInForm) {
                    stageHTML += '<form>\n';
                }
                stageHTML += stage.activeScreen + '\n';
                if (stage.addOKButtonIfNone) {
                    if (!stageHTML.includes('<button')) {
                        stageHTML += `<button>OK</button>`;
                    }
                }
                if (wrapInForm) {
                    stageHTML += '</form>\n';
                }
                stageHTML += app.parseStageTag(stage, app.subgameContentEnd);
            }

            if (html.stagesHTML.length > 0) {
                html.stagesHTML += '\n';
            }
            html.stagesHTML += stageHTML;

            // Waiting screen HTML
            var waitingScreenHTML = contentStart;
            if (stage.useGameWaitingScreen) {
                waitingScreenHTML += app.waitingScreen;
            }
            if (stage.waitingScreen != null) {
                waitingScreenHTML += stage.waitingScreen;
            }
            waitingScreenHTML += contentEnd;

            if (html.waitingScreensHTML.length > 0) {
                html.waitingScreensHTML += '\n';
            }
            html.waitingScreensHTML += waitingScreenHTML;

            // Subgame HTML
            this.parseStagesHTML(stage, html);
        }
    }

    stripTag(tagName, text) {
        let strippedText = '';
        while (text.includes('<' + tagName)) {
            let start = text.indexOf('<' + tagName);
            let end = text.indexOf('/' + tagName + '>') + ('/' + tagName + '>').length;
            if (start == -1 || end == -1 || start >= end) {
                break;
            }
            strippedText += text.substring(start, end);
            text = text.substring(0, start) + text.substring(end);
        }
        return [strippedText, text];
    }

    // TODO
    parseStageTag(game, text) {
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
     * Ends this Game.
     *
     * - Create headers for this app, periods, groups, group tables, players and participants.
     * - Create output.
     * - Write output to this session's csv file.
     *
     * CALLED FROM
     * - {@link Game#tryToEndGame}
     */
    internalEnd() {

        this.end();

        let timeStamp = this.session.jt.settings.getConsoleTimeStamp();
        console.log(timeStamp + ' END   - APP   : ' + this.shortId);

        this.finished = true;

        this.saveOutput(this.session.csvFN());

    }

    end() {}

    saveOutput(fn) {

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
        for (var i=0; i<this.periods.length; i++) {
            var period = this.periods[i];
            var periodFields = period.outputFields();
            Utils.getHeaders(periodFields, periodSkip, periodHeaders);
            for (var j=0; j<period.groups.length; j++) {
                var group = period.groups[j];
                for (var k=0; k<group.tables.length; k++) {
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
                for (var k=0; k<group.players.length; k++) {
                    var player = group.players[k];
                    var fieldsToOutput = player.outputFields();
                    Utils.getHeaders(fieldsToOutput, playerSkip, playerHeaders);
                }
            }
        }
        var participantHeaders = [];
        var participantSkip = ['id', 'points'];
        for (var i in this.session.participants) {
            var participant = this.session.participants[i];
            var participantFields = participant.outputFields();
            Utils.getHeaders(participantFields, participantSkip, participantHeaders);
        }

        //Create data
        var appsText = [];
        appsText.push('id,' + appsHeaders.join(','));
        var newLine = this.id + ',';
        for (var h=0; h<appsHeaders.length; h++) {
            var header = appsHeaders[h];
            if (this[header] !== undefined) {
                newLine += JSON.stringify(this[header]);
            }
            if (h<appsHeaders.length-1) {
                newLine += ',';
            }
        }
        appsText.push(newLine);

        var periodText = [];
        var groupText = [];
        var playerText = [];
        groupText.push('period.id,group.id,' + groupHeaders.join(','));
        playerText.push('period.id,group.id,participant.id,' + playerHeaders.join(','));
        for (var i=0; i<this.periods.length; i++) {
            var period = this.periods[i];
            var newLine = period.id + ',';
            newLine = this.appendValues(newLine, periodHeaders, period);
            periodText.push(newLine);
            for (var j=0; j<period.groups.length; j++) {
                var group = period.groups[j];
                var newLine = period.id + ',' + group.id + ',';
                newLine = this.appendValues(newLine, groupHeaders, group);
                groupText.push(newLine);
                for (var k=0; k<group.players.length; k++) {
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
            for (var h=0; h<participantHeaders.length; h++) {
                var header = participantHeaders[h];
                if (participant[header] !== undefined) {
                    newLine += JSON.stringify(participant[header]);
                }
                if (h<participantHeaders.length-1) {
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

        for (var t=0; t<groupTables.length; t++) {
            var groupTableText = [];
            var table = groupTables[t];
            var tableHeaders = groupTableHeaders[table];
            groupTableText.push('period.id,group.id,id,' + tableHeaders.join(','));
            for (var i=0; i<this.periods.length; i++) {
                var period = this.periods[i];
                for (var j=0; j<period.groups.length; j++) {
                    var group = period.groups[j];
                    var tabRows = group[table].rows;
                    for (var r=0; r<tabRows.length; r++) {
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

    static loadJTQ(id, jt, folder) {
        var queue = new Game(id, jt);
        if (fs.existsSync(id)) {
            var json = Utils.readJSON(id);
            if (json === 'JSON error') {
                // let session = new Session.new(jt, id, {createFolder: false});
                queue.code = Utils.readJS(id);
                // eval(queue.code);
                // for (let i=0; i<session.apps.length; i++) {
                //     let app = session.apps[i];
                //     queue.addGame(app.appPath, app.givenOptions);
                // }
            } else {
                if (json.displayName !== undefined) {
                    queue.displayName = json.displayName;
                }
                if (json.apps !== undefined) {
                    for (let i=0; i<json.apps.length; i++) {
                        let curJSON = json.apps[i];
                        let appId = curJSON;
                        let options = {};
                        if (curJSON.appId != null) {
                            appId = curJSON.appId;
                            options = curJSON.options;
                        }
                        queue.addGame(path.join(folder, appId + '.jtt'), options);
                    }
                }
            }
        }
        return queue;
    }

    addGame(appId, options) {
        if (options == null) {
            options = {};
        }
        var app = {
            appId: appId, 
            options: options, 
            indexInQueue: this.apps.length + 1
        };
        this.subgames.push(app);
        if (this.jt.socketServer != null) {
            this.save();
            this.jt.socketServer.sendOrQueueAdminMsg(null, 'queueAddGame', {queueId: this.id, app: app});
        }
    }

    /**
     * @return {string}  Session path + {@link Game#indexInSession} + '_' + app.id
     */
    getOutputFN() {
        return this.session.getOutputDir() + '/' + this.getIdInSession();
    }

    /**
     * - clear group's timer.
     * - if next stage exists, let the group play it.
     * - for each player in the group, call {@link Game#playerMoveToNextStage}.
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

    getIdInSession() {
        return this.indexInSession() + '_' + this.shortId;
    }

    /**
     * @return {number} The index of this app in its session's list of apps (first position = 1).
     */
    indexInSession() {
        if (this.session === null) {
            return -1;
        }

        for (var i in this.session.gameTree) {
            if (this.session.gameTree[i] === this) {
                return parseInt(i)+1;
            }
        }
        return -1;
    }

    /**
     * Creates a new period with the given id + 1, saves it and adds it to this Game's periods.
     *
     * Called from:
     * - {@link Game.participantBeginPeriod}
     *
     * @param  {number} prd The index to assign to the new period.
     */
    initPeriod(prd) {
        var period = new Period.new(prd + 1, this);
        this.periods.push(period);
    }

    /**
     * metaData - description
     *
     * @return {type}  description
     */
    metaData() {
        var metaData = {};
        metaData.numPeriods = this.numPeriods;
        metaData.groupSize = this.groupSize;
        metaData.id = this.id;
        metaData.shortId = this.shortId;
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

        var app = new Game(null, this.jt, this.id);

        metaData.stages = [];
        try {
            eval(metaData.appjs);
            for (var i in app.subgames) {
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

    reload() {
        var app = new Game(this.session, this.jt, this.id);
        app.optionValues = this.optionValues;
        for (var opt in app.optionValues) {
            app[opt] = app.optionValues[opt];
        }
        var appCode = Utils.readJS(this.appPath);
        let game = app;
        let treatment = app;
        eval(appCode);
        return app;
    }

    setOptionValue(name, value) {
        this.optionValues[name] = value;
        var correctedValue = value;
        var isValid = false;
        let foundOpt = false;
        for (var opt in this.options) {
            var option = this.options[opt];
            if (option.name === name) {
                foundOpt = true;
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
        if (isValid || !foundOpt) {
            this[name] = correctedValue;
        }
    }

    canPlayerParticipate(player) {
        return true;
    }

    /**
     * Create a new {@link Game} and add it as a subgame of the current Game.
     *
     * @param  {string} id The identifier of the game.
     * @return {Game} The new game.
     */
    addSubGame(id) {
        var subgame = new Game(this.session, this.jt, id, this);
        this.subgames.push(subgame);
        return subgame;
    }

    /**
     * Returns the next subgame for a given group in a given subgame.
     * 1. If subgame is not the last subgame of this game, return the next subgame of this app.
     * 2. If period is not the last period of this game, return the first subgame of this app.
     * 3. If game is not the last game of this session, return the first subgame of the next app.
     * 4. Otherwise, return null.
     *
     * TODO: Does the next stage have Stage.waitForGroup == true?
     *
     * CALLED FROM
     * - {@link Game#playerEnd}
     * - {@link Game#groupMoveToNextStage}
     *
     * @param  {Group} group The group
     * @return {(null|Game)} The next game for this group, or null.
     */
    nextStageForGroup(group) {
        var slowestPlayers = group.slowestPlayers();
        return slowestPlayers[0].nextGame();
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
     * - not be included in {@link Game#outputHide}
     * - not be included in {@link Game#outputHideAuto}
     *
     * @return {Array}  An array of the field names.
     */
    outputFields() {
        var fields = [];
        for (var prop in this) {
            if (
                Game.prototype[prop] !== this[prop] &&
                !this.outputHide.includes(prop) &&
                !this.outputHideAuto.includes(prop)
            )
            fields.push(prop);
        }
        return fields;
    }

    /**
     * Called when a participant begins this game.
     * - For each of the [Clients]{@link Client} of this participant, call {@link Game.addClientDefault}.
     * - Move participant to next period {@link Game.participantMoveToNextPeriod}.
     * - Participant notified clients about starting new app.
     *
     * @param  {Participant} participant The participant.
     */
    participantBegin(participant) {

        this.started = true;

        for (var c in participant.clients) {
            var client = participant.clients[c];
            this.addClientDefault(client);
        }

        let duration = this.getParticipantDuration(participant);
        if (duration != null) {
            participant.appTimer = new Timer.new(
                function() {
                    participant.session.addMessageToStartOfQueue(participant, {}, 'endCurrentGame');
                },
                duration*1000
            );
        }
        this.participantStart(participant);
        if (this.subgames.length > 0) {
            this.participantMoveToNextPeriod(participant);
        }
    }

    canPlayerStart(player) {
        return true;
    }

    getGroupDuration(group) {
        return this.duration;
    }

    /**
     * A participant begins its current period.
     *
     * - If current period undefined, initialize it ({@link Game.initPeriod}).
     * - Participant begins period ({@link Period.participantBegin}).
     *
     * Called from:
     * - {@link Game.participantMoveToNextPeriod}.
     *
     * @param  {type} participant The participant.
     */
    participantBeginPeriod(participant) {
        var prd = participant.getGamePeriod(this);

        // Move to next period
        prd++;

        var period = this.getPeriod(prd);
        if (period === undefined) {
            return false;
        }
        period.participantBegin(participant);
    }

    // An array of ids, one for each game in this game's ancestry.
    getGamePath() {
        let out = [];
        if (this.superGame != null) {
            out = this.superGame.getGamePath();
        }
        out.push(this.roomId());
        return out;
    }

    // An array of indices, one for each game in this game's ancestry.
    // i.e. [0, 0, 1, 0]
    getGameIndices() {
        let out = [];
        if (this.superGame != null) {
            out = this.superGame.getGameIndices();
        }
        out.push(this.indexInSuperGame());
        return out;
    }

    indexInSuperGame() {
        let gameTree = null;

        if (this.superGame == null) {
            gameTree = this.session.gameTree;
        } else {
            gameTree = this.superGame.subgames;
        }

        for (let i=0; i<gameTree.length; i++) {
            if (gameTree[i] === this) {
                return i;
            }
        }

        return -1;

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
     * - If participant is has finished all periods in this app, move to next app ({@link Session.participantMoveToNextGame}).
     * - Otherwise, begin new period ({@link Game.participantBeginPeriod}).
     *
     * CALLED FROM
     * - {@link Game#playerMoveToNextStage}
     * - {@link Game#participantBegin}
     *
     * @param  {type} participant description
     * @return {type}             description
     */
     participantMoveToNextPeriod(participant) {

        let periodIndex = participant.getGamePeriod(this);

         // If in the last period of app, move to next app.
         if (periodIndex >= this.numPeriods - 1) {
             this.getFullSession().participantMoveToNextGame(participant);
         }

         // Move to the next period of this app.
         else {
             // If not in the first period, end the previous period for this participant.
             if (periodIndex > -1) {
                 participant.proxy.player.period().participantEnd(participant);
             }

             // Move to next period.
            //  participant.periodIndices[this.roomId()]++;
             this.participantBeginPeriod(participant);
         }
     }

     getFullSession() {
         return global.jt.data.getSession(this.session.id);
     }

    /**
     * A participant finishes playing this app.
     *
     * FUNCTIONALITY
     * - Participant's clients unsubscribe from messages from this app.
     * - Try to end the app ({@link Game#tryToEndGame}).
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
        this.tryToEndGame();
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
     * - otherwise, move participant to next period ([this.participantMoveToNextPeriod(player.participant)]{@link Game#participantMoveToNextPeriod}).
     *
     * CALLED FROM
     * - {@link Game#groupMoveToNextStage}
     *
     * @param  {Player} player The player
     * @return {type}        description
     */
    playerMoveToNextStage(player) {
        if (player.stageIndex < this.stages.length - 1) {
            player.status = 'playing';
            player.stageIndex++;
            player.stage = this.subgames[player.stageIndex];
            player.game = this.subgames[player.stageIndex];
            player.stage.playerPlayDefault(player);
            // player.emitUpdate2();
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
            return Utils.findById(prevPeriod.groups, group.id);
        }
    }

    /**
     * roomId - description
     *
     * @return {string}  {@link Session#roomId} + '_app_' + this.id
     */
    roomId() {
        if (this.parent == null) {
            return 'session_' + this.session.id + '_app_' + this.indexInSession() + '-' + this.id;
        } else {
            return this.parent.roomId() + '_app_' + this.indexInSession() + '-' + this.id;
        }
    }

    /**
     * saveSelfAndChildren - description
     *
     * CALLED FROM:
     * - {@link Session#addGame}

     * @return {type}  description
     */
    saveSelfAndChildren() {
        this.save();
        for (var i in this.stages) {
            this.stages[i].save();
        }
    }

    /**
     * Save this {@link Game} to the session .gsf file.
     *
     * CALLED FROM:
     * - {@link Game#saveSelfAndChildren}
     *
     */
    save() {
        try {
            this.session.jt.log('Game.save: ' + this.id);
            var toSave = this.shell();
            this.session.saveDataFS(toSave, 'APP');
        } catch (err) {
            console.log('Error saving app ' + this.id + ': ' + err);
        }
    }

    canGroupParticipate(group) {
        return true;
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
                    if (player.stageIndex < this.indexInApp() || !player.isFinished()) {
                        return false;
                    }
                }
            }
        } 

        // Otherwise, return true.
        return true;

    }

    indexInApp() {
        if (this.parent != null) {
            for (var i in this.parent.subgames) {
                if (this.parent.subgames[i].id === this.id) {
                    return parseInt(i);
                }
            }
            return -1;
        } else {
            for (var i in this.session.gameTree) {
                if (this.session.gameTree[i].id === this.id) {
                    return parseInt(i);
                }
            }
            return -1;
        }
    }
    
    canGroupStart(group) {
        return this.canGroupStartDefault(group);
    }

    canGroupStartDefault(group) {

        // If already started this stage, return false.
        if (group.stageStartedIndex > this.indexInApp()) {
            return false;
        }

        // // If not finished a previous stage, return false.
        // if (group.stageEndedIndex < this.indexInApp() - 1) {
        //     return false;
        // }

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

    /**
     * A shell of this object. Excludes parent, includes child shells.
     *
     * CALLED FROM:
     * - {@link Session#addGame}
     *
     * @return {type}  description
     */
    /**
     * A shell of this object. Excludes parent, includes child shells.
     *
     * CALLED FROM:
     * - {@link Session#addApp}
     *
     * @return {type}  description
     */
    // shellWithChildren() {
    //     var out = {};
    //     out.functions = [];
    //     var fields = this.outputFields();
    //     for (var f in fields) {
    //         var field = fields[f];
    //         if (Utils.isFunction(this[field])) {
    //             out.functions.push({
    //                 field: field,
    //                 content: this[field].toString(),
    //             });
    //         } else {
    //             out[field] = this[field];
    //         }
    //     }
    //     out.indexInSession = this.indexInSession();
    //     out.periods = [];
    //     for (var i in this.periods) {
    //         out.periods[i] = this.periods[i].shellWithChildren();
    //     }
    //     out.subgames = [];
    //     for (var i in this.subgames) {
    //         out.subgames[i] = this.subgames[i].shellWithChildren();
    //     }
    //     out.options = this.options;
    //     return out;
    // }
    /**
     * A shell of this object. Includes parent shell, excludes child shells.
     *
     * @return {type}  description
     */
    // shellWithParent() {
    //     var out = {};
    //     var fields = this.outputFields();
    //     for (var f in fields) {
    //         var field = fields[f];
    //         out[field] = this[field];
    //     }
    //     out.session = this.session.shell();
    //     out.numStages = this.stages.length;
    //     out.vueComputedText = {};
    //     for (let i in this.vueComputed) {
    //         out.vueComputedText[i] = this.vueComputed[i].toString();
    //     }
    //     out.vueMethodsText = {};
    //     for (let i in this.vueMethods) {
    //         out.vueMethodsText[i] = this.vueMethods[i].toString();
    //     }
    //     for (let i in this.vueMethodsDefault) {
    //         if (out.vueMethodsText[i] == null) {
    //             out.vueMethodsText[i] = this.vueMethodsDefault[i].toString();
    //         }
    //     }
    //     return out;
    // }

    /**
     * A shell of this object. Excludes parent and children. The shell is a simplified version of an object and any of its fields.
     *
     * CALLED FROM
     * - {@link Game#save}
     *
     * @return {Object}  description
     */
    // shell() {
    //     var out = {};
    //     var fields = this.outputFields();
    //     for (var f in fields) {
    //         var field = fields[f];
    //         out[field] = this[field];
    //     }
    //     out.sessionIndex = this.indexInSession();
    //     out.subgames = [];
    //     for (let i in this.subgames) {
    //         out.subgames.push(this.subgames[i].shell());
    //     }
    //     return out;
    // }

    /**
     * If all participants have finished the app, end the app ({@link Game#end}).
     *
     * CALLED FROM
     * - {@link Game#participantEnd}
     *
     * @return {type}  description
     */
    tryToEndGame() {
        if (this.finished) {
            return;
        }

        var proceed = true;
        var participants = this.session.participants;
        for (var p in participants) {
            var participant = participants[p];
            if (!participant.isFinishedGame(this)) {
                proceed = false;
                break;
            }
        }
        if (proceed) {
            this.internalEnd();
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

                // Gameend the value.
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
        let gamePeriod = participant.getGamePeriod(this);
        if (gamePeriod >= this.numPeriods - 1) {
            return null;
        } else {
            return this.getPeriod(gamePeriod+1);
        }
    }

}

var exports = module.exports = {};
exports.new = Game;
exports.load = Game.load;
exports.newSansId = Game.newSansId;
