// const Stage     = require('./Stage.js');
const Period    = require('./Period.js');
const Utils     = require('./Utils.js');
const fs        = require('fs-extra');
const path      = require('path');
const Timer     = require('./Timer.js');
const Player    = require('./Player.js');

/** Class that represents an app. */
class App {

    /**
     * Creates an App.
     *
     * @param  {Session} session description
     * @param  {String} id      description
     */
    constructor(session, appPath, parent) {

        /**
         * The unique identifier of this App. In order of precedence, the value is given by:
         * - the explicit value in the .jtt file (if it has been set)
         * - the name of the .jtt file (if it is not app.jtt or app.js)
         * - the name of the folder containing the .jtt file
         * @type {String}
         */
        this.id = appPath;

        this.parent = parent;
        this.superGame = parent;

        this.waitToStart = true;
        this.waitToEnd = true;

        if (this.superGame != null) {
            this.waitToStart = parent.subGameWaitToStart;
            this.waitToEnd = parent.subGameWaitToEnd;
        }

        this.showErrorsInLog = true;

        let id = appPath;
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
        } else if (id.endsWith('.jt')) {
            id = id.substring(0, id.length - '.jt'.length);
        } else if (id.endsWith('.jtt')) {
            id = id.substring(0, id.length - '.jtt'.length);
        }
        this.shortId = id;


        /** Where the original definition of this app is stored on the server.*/
        this.appPath = appPath;

        this.started = false;

        this.outputDelimiter = ';';
        if (session != null) {
            this.outputDelimiter = session.outputDelimiter;
        }

        /**
         * The Session that this App belongs to.
         * @type {Session}
         */
        this.session = session;

        /**
         * 
         */
        this.isStandaloneApp = true;

        /**
         * The stages of this app.
         * @type Array
         * @default []
         */
        this.stages = [];

        // From Game.js
        this.subgames = [];
        this.activeScreen = '';        
        this.addOKButtonIfNone = true;
        this.addFormIfNone = true;

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
        
        /**
         * How long clients have before stage is auto-submitted (from client, not from server).
         * if <= 0, then no client timeout for this stage.
         * @type number
         * @default 0
         */
        this.clientDuration = 0;

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
                <body style='display: none'>
                    <div id='jtree'>
                        <p v-if='superGame.numPeriods > 1'>Period: {{period.id}}/{{superGame.numPeriods}}</p>
                        <p v-if='hasTimeout'>Time left (s): {{clock.totalSeconds}}</p>
                        <span v-if='player.status=="playing"'>
                            {{stages}}
                        </span>
                        <span v-if='["waiting", "finished", "done"].includes(player.status)'>
                            {{waiting-screens}}
                        </span>
                    </div>
                    {{scripts}}
                </body>
            </html>
        `;

        this.periodText = 'Period'

        this.vueModels = {};

        // Objects defined here are generated on the client, and accessible via "jt.vue.XXX", 
        // where XXX is the name of the computed variable.
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

        /** Shown on all client playing screens if {@link Stage.useAppActiveScreen} = true.
        * @default null
        */
        // this.activeScreen = null;


        /** Shown on all client waiting screens if {@link Stage.useWaitingScreen} = true.
        */
        this.waitingScreenDefault = `
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

        this.stageWaitToStart = true;
        this.stageWaitToEnd = true;
        this.subGameWaitToStart = true;
        this.subGameWaitToEnd = true;

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
         * Set default value for Stage.wrapPlayingScreenInFormTag.
         * If 'yes', then form is added.
         * If 'no', no form is added.
         * If 'onlyIfNoButton', then form is added only if page has no buttons.
         * @type String
         * @default true
         */
        this.stageWrapPlayingScreenInFormTag = 'onlyIfNoButton';
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
          * Indicates whether or not the code for this app compiles to an error or not.
          */
        this.hasError = false;

         /**
          * If not null and this is the first App in a Session, sets the initial number of players to this amount.
          */
        this.suggestedNumPlayers = undefined;

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
        // this.stageContentStart = '<span jt-stage="{{stage.id}}">';

        this.stageContentStart = `
            <span v-show="stage.id == '{{stage.id}}'">
        `;
        this.subgameContentStart = `<span v-if="game.id == '{{game.id}}'">`;


        /**
         * Ends the stages of this App.
         * TODO:
         * @type string
         * @default '</span>'
         */
        this.stageContentEnd = '</span>';
        this.subgameContentEnd = '</span>';

        //TODO:
        this.outputHideAuto = [
            'stageContentStart',
            'stageContentEnd',
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
            'activeScreen',
            'stageWrapPlayingScreenInFormTag',
            'subgameWrapPlayingScreenInFormTag',
            'waitForAll',
            'finished',
            'htmlFile',
            'this',
            'session',
            'stages',
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
    }

    getWaitingScreen() {
        if (this.subgames.length > 0) {
            return '';
        } else {
            return this.waitingScreenDefault;
        }
    }

    /**
     * @static newSansId - return an app with the given path.
     *
     * @param  {type} jt      description
     * @param  {type} appPath The path relative to the server process. i.e. /apps/my-app.jtt or /apps/my-complex-app/app.js
     * @return {App}          The given app.
     */
    static newSansId(appPath) {
        console.log('loading app with no session: ' + appPath);
        let out = new App({}, appPath);
        return out;
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

    for (let i in this.messages) {
        let msg = this.messages[i];
        client.register(i, msg);
    }

    // Load custom code, overwrite default stage submission behavior.
    try {
        this.addClient(client);
    } catch(err) {
        console.log(err);
    }

    for (let s in this.subgames) {
        this.subgames[s].addClientDefault(client);
    }

}

    /** TODO */
    addStages(array) {
        for (let i=0; i<array.length; i++) {
            this.addStage(array[i]);
        }
    }

    /**
     * Adds a stage, with contents loaded from .jtt file.
     * @param {String} name The name of the stage to add
     */
    addStage(name) {
        let stage = this.newStage(name);
        let fn = path.join(path.dirname(this.id), name);
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
    setFileContents(contents) {
        try {
            fs.writeFileSync(this.id, contents);
        } catch (err) {
            console.log(err);
        }
    }

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
    // getNextStageForPlayer(player) {
    //     let stageInd = player.stageIndex;

    //     // if (player.stage.subgames.length > 0) {
    //     //     return player.stage.subgames[0];
    //     // }

    //     /** If not in the last stage, return next stage.*/
    //     if (stageInd < this.subgames.length-1) {
    //         return this.subgames[stageInd+1];
    //     } else {
    //         return null;
    //     }

    // }

    getGamePeriod(player) {
        if (player.group == null || player.group.period == null) {
            return -1;
        }
        return player.group.period.id - 1;
    }

    groupBeginPeriod(periodNum, group) {
        if (
            group.subGroups[periodNum-1] != null
        ) {
            return;
        }
       
        let period = this.getPeriod(periodNum-1, group);
        if (period === undefined) {
            return;
        }
        if (period.group.subGroups.length < period.numGroups()) {
            period.createGroups();
        }

        for (let i in period.group.subGroups) {
            let periodGroup = period.group.subGroups[i];
            period.groupBegin(periodGroup);
        }

    }

    playerBeginPeriod(periodNum, player) {

        this.groupBeginPeriod(periodNum, player.group);

        let period = this.getPeriod(periodNum-1, player.group);
        if (period === undefined) {
            return false;
        }
        period.playerBegin(player);
    }

    /**
     * TODO
     * Get group ids for their current period
     */
    getGroupIdsForPeriod(period) {
        let players = period.superGroup.players;
        let numGroups = period.numGroups();
        let pIds = [];
        for (let p in players) {
            pIds.push(players[p].id);
        }
        // Group IDs.
        let gIds = [];
        for (let g=0; g<numGroups; g++) {
            gIds.push([]);
        }

        for (let i=0; i<period.group.subGroups.length; i++) {
            let group = period.group.subGroups[i];
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
        let m = Math.floor((pIds.length-1) / numGroups) + 1;

        if (this.groupMatchingType === 'PARTNER_1122') {
            for (let g=period.group.subGroups.length; g<numGroups; g++) {
                for (let i=0; i<m; i++) {
                    gIds[g].push(pIds[0]);
                    pIds.splice(0, 1);
                }
            }
        } else if (this.groupMatchingType === 'PARTNER_1212') {
            for (let i=0; i<m; i++) {
                for (let g=period.group.subGroups.length; g<numGroups; g++) {
                    gIds[g].push(pIds[0]);
                    pIds.splice(0, 1);
                }
            }
        } else if (this.groupMatchingType === 'PARTNER_RANDOM') {
            if (period.id === 1) {
                period.getStrangerMatching(numGroups, pIds, gIds, m, period.group.subGroups.length);
            } else {
                let prevPeriod = period.prevPeriod();
                gIds = prevPeriod.groupIds();
            }
        } else if (this.groupMatchingType === 'STRANGER') {
            period.getStrangerMatching(numGroups, pIds, gIds, m, period.group.subGroups.length);
        }
        return gIds;
    }

    players() {
        return this.period.superGroup.players;
    }

    getHTML(participant) {
        let app = this.reload();

        let subgamesHTML = '';
        if (this.subgames.length > 0) {
            for (let sg=0; sg< this.subgames.length; sg++) {
                subgamesHTML = subgamesHTML + this.subgames[sg].getHTML(participant);
            }
        }

        let buttonCode = '';
        let formStart = '';
        let formEnd = '';

        if (
            app.addFormIfNone &&
            !app.activeScreen.includes('<form>')
        ) {
            formStart += '<form>';
            formEnd = '</form>';
        }

        if (
            app.addOKButtonIfNone &&
            app.subgames.length == 0 &&
            !app.activeScreen.includes('<button>')
        ) {
            buttonCode = '<button>OK</button>';
        }

        let appWaitingScreen = app.getWaitingScreen();

        let screensHTML = `
        <span v-if='player.gamePath.includes("{{app.path}}")'>
            <span v-if='player.status == "playing"' class='playing-screen'>
                ${formStart}
                    ${app.activeScreen}
                    ${buttonCode}
                ${formEnd}
            </span>
            <span v-if='["waiting", "done", "finished"].includes(player.status)' class='waiting-screen'>
                ${appWaitingScreen}
            </span>
            ${subgamesHTML}
        </span>
        `;

        let html = `${screensHTML}`;
        if (this.superGame == null) {
            html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <script type="text/javascript" src="/participant/jtree.js"></script>
                </head>
                <body style='display: none'>
                    <div id='jtree'>
                        <p v-if='game.superGame.numPeriods > 1'>Period: {{period.id}}/{{game.superGame.numPeriods}}</p>
                        <p v-if='hasTimeout'>Time left (s): {{clock.totalSeconds}}</p>
                        ${screensHTML}
                    </div>
                    {{scripts}}
                </body>
            </html>
            `;
        }
        html = html.replace('{{app.path}}', app.getFullGamePath());

        let [strippedScripts, strippedHTML1] = this.stripTag('script', html);
        let [strippedStyles, strippedHTML2] = this.stripTag('style', strippedHTML1);
        html = strippedHTML2;

        let scriptsHTML = strippedStyles + '\n' + strippedScripts;
        if (app.clientScripts != null) {
            if (!app.clientScripts.trim().startsWith('<script')) {
                scriptsHTML += '<script>' + app.clientScripts + '</script>';
            } else {
                scriptsHTML += app.clientScripts;                
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

        return html;
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
            let start = text.indexOf('{{');
            let end = text.indexOf('}}');
            let curTag = text.substring(start + '{{'.length, end);
            let value = eval(curTag);
            text = text.replace('{{' + curTag + '}}', value);
        }
        return text;
    }



    sendParticipantPage(req, res, participant) {

        // Load dynamic version of app to allow for live editing of stage html.
        // let app = this;
        let app = this.reload();

        // Start with hard-coded html, if any.
        let html = '';
        if (app.html != null) {
            html = html + app.html;
        }
        if (app.screen != null) {
            html = html + app.screen;
        }

        // Load content of html file, if any.
        // Try app.htmlFile, id.html, and client.html.
        let htmlFile = app.htmlFile == null ? app.id + '.html' : app.htmlFile;
        let filename = path.join(global.jt.path, '/apps/' + app.id + '/' + htmlFile);
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
        let stagesHTML = '';
        let waitingScreensHTML = '';
        for (let i=0; i<app.stages.length; i++) {
            let stage = app.stages[i];
            let stageHTML = '';
            let contentStart = app.parseStageTag(stage, app.stageContentStart);
            let contentEnd = app.parseStageTag(stage, app.stageContentEnd);
            if (stage.content != null) {
                stageHTML = contentStart + '\n' + stage.content + '\n' + contentEnd;
            }
            if (stage.activeScreen != null) {
                stageHTML += app.parseStageTag(stage, app.stageContentStart)  + '\n';
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
                stageHTML += app.parseStageTag(stage, app.stageContentEnd);
            }

            if (stagesHTML.length > 0) {
                stagesHTML += '\n';
            }
            stagesHTML += stageHTML;

            let waitingScreenHTML = contentStart;
            if (stage.useAppWaitingScreen) {
                waitingScreenHTML += app.getWaitingScreen();
            }
            if (stage.getWaitingScreen() != null) {
                waitingScreenHTML += stage.getWaitingScreen();
            }
            waitingScreenHTML += contentEnd;

            if (waitingScreensHTML.length > 0) {
                waitingScreensHTML += '\n';
            }
            waitingScreensHTML += waitingScreenHTML;
        }

        let [strippedScripts, stagesHTML1] = this.stripTag('script', stagesHTML);
        let [strippedStyles, stagesHTML2] = this.stripTag('style', stagesHTML1);
        let [strippedLinks, stagesHTML3] = this.stripTag('link', stagesHTML2);
        stagesHTML = stagesHTML3;

        if (html.includes('{{stages}}')) {
            html = html.replace('{{stages}}', stagesHTML);
        }

        html = html.replace('{{waiting-screens}}', waitingScreensHTML);

        // Replace {{ }} markers.
        let markerStart = app.textMarkerBegin;
        let markerEnd = app.textMarkerEnd;
        while (html.indexOf(markerStart) > -1) {
            let ind1 = html.indexOf(markerStart);
            let ind2 = html.indexOf(markerEnd);
            let text = html.substring(ind1+markerStart.length, ind2);
            let span = '<i jt-text="' + text + '" style="font-style: normal"></i>';
            html = html.replace(markerStart + text + markerEnd, span);
        }

        // Insert jtree functionality.
        if (app.insertJtreeRefAtStartOfClientHTML) {
            html = '<script type="text/javascript" src="/participant/jtree.js"></script>\n' + html;
        }

        let scriptsHTML = strippedLinks + '\n' + strippedStyles + '\n' + strippedScripts;
        if (app.clientScripts != null) {
            if (!app.clientScripts.trim().startsWith('<script')) {
                scriptsHTML = '<script>' + app.clientScripts + '</script>';
            } else {
                scriptsHTML = app.clientScripts;                
            }
        }
        scriptsHTML += this.getAutoplayScript();
        
        if (html.includes('{{scripts}}')) {
            html = html.replace('{{scripts}}', scriptsHTML);
        }

        if (this.modifyPathsToIncludeId) {
            let prefixes = ['href', 'src'];
            for (let ind in prefixes) {
                let i = prefixes[ind];
                // Temporary fix, do not change anything that starts with '/' or 'http'.
                html = html.replace(new RegExp(i + '="\\/', 'gmi'), i + 'XXX="');
                html = html.replace(new RegExp(i + "='\\/", "gmi"), i + "XXX='");
                html = html.replace(new RegExp(i + '="http', 'gmi'), i + 'XXXhttp="');
                html = html.replace(new RegExp(i + "='http", "gmi"), i + "XXXhttp='");
    
                // Replace all other paths.
                html = html.replace(new RegExp(i + '="', 'gmi'), i + '="./' + this.shortId + '/');
                html = html.replace(new RegExp(i + "='", "gmi"), i + "='./" + this.shortId + '/');
    
                // Revert fix.
                html = html.replace(new RegExp(i + 'XXX="', 'gmi'), i + '="/');
                html = html.replace(new RegExp(i + "XXX='", "gmi"), i + "='/");
                html = html.replace(new RegExp(i + 'XXXhttp="', 'gmi'), i + '="http');
                html = html.replace(new RegExp(i + "XXXhttp='", "gmi"), i + "='http");
            }
        }
        // Return to client.
        res.send(html);
    }

    getAutoplayScript() {
        let out = `
        <script>
        jt.autoplay = function() {
            switch (jt.vue.player.stage.id) {
                `;
        for (let i=0; i<this.stages.length; i++) {
            out += `
            case "${this.stages[i].id}":
                jt.autoplay_${this.stages[i].id}();
                break;
            `;
        }

        out += `
            }
        }
        `
        for (let i=0; i<this.stages.length; i++) {
            out += `
                if (jt.autoplay_${this.stages[i].id} == null) {
                    jt.autoplay_${this.stages[i].id} = function() {
                        ${this.stages[i].autoplay}
                    };
                }
            `;
        }

        out += `
        </script>`;

        return out;
    }

    stripTag(tagName, text) {
        let strippedText = '';
        while (text.includes('<' + tagName)) {
            let start = text.indexOf('<' + tagName);
            if (start == -1) {
                break;
            }
            let nextStart = text.indexOf('<' + tagName, start + tagName.length + 1);
            let endTag = '/' + tagName + '>';
            let end = text.indexOf(endTag, start) + endTag.length;
            if (end == -1 || (nextStart > -1 && end > nextStart)) {
                endTag = '>';
                end = text.indexOf(endTag, start) + endTag.length;
            } 
            if (end == -1 + endTag.length) {
                break;
            }
            strippedText += text.substring(start, end);
            text = text.substring(0, start) + text.substring(end);
        }
        return [strippedText, text];
    }

    // TODO
    parseStageTag(stage, text) {
        while (text.includes('{{')) {
            let start = text.indexOf('{{');
            let end = text.indexOf('}}');
            let curTag = text.substring(start + '{{'.length, end);
            let value = eval(curTag);
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
    internalEnd() {

        this.end();

        let timeStamp = global.jt.settings.getConsoleTimeStamp();
        console.log(timeStamp + 'END   - APP   : ' + this.getIdInSession());

        this.finished = true;

        let fd = fs.openSync(this.session.csvFN(), 'a');

        try {
            fs.appendFileSync(fd, this.saveOutput());
        } catch(err) {
            console.log('error writing app: ' + this.id);
            debugger;
        } finally {
            fs.closeSync(fd);
        }   

    }

    end() {}

    saveOutput() {

        if (this.subgames.length > 0) {
            let out = '';
            for (let i in this.subgames.length) {
                out += this.subgames[i].saveOutput();
            }
            return out;
        }

        //Create headers
        let appsHeaders = [];
        let appsSkip = ['id'];
        let appFields = this.outputFields();
        Utils.getHeaders(appFields, appsSkip, appsHeaders);

        let periodHeaders = [];
        let groupHeaders = [];
        let playerHeaders = [];
        let periodSkip = ['id'];
        let groupSkip = ['id', 'allPlayersCreated'];
        let playerSkip = ['status', 'stageIndex', 'id', 'participantId'];
        let groupTables = [];
        let groupTableHeaders = {};
        for (let i=0; i<this.periods.length; i++) {
            let period = this.periods[i];
            let periodFields = period.outputFields();
            Utils.getHeaders(periodFields, periodSkip, periodHeaders);
            for (let j=0; j<period.group.subGroups.length; j++) {
                let group = period.group.subGroups[j];
                for (let k=0; k<group.tables.length; k++) {
                    let tableId = group.tables[k];
                    if (!groupTables.includes(tableId)) {
                        groupTables.push(tableId);
                        groupTableHeaders[tableId] = [];
                    }
                    let tableHeaders = groupTableHeaders[tableId];
                    let tableFields = group[tableId].outputFields();
                    Utils.getHeaders(tableFields, [], tableHeaders);
                }
                let groupFields = group.outputFields();
                Utils.getHeaders(groupFields, groupSkip, groupHeaders);
                for (let k=0; k<group.players.length; k++) {
                    let player = group.players[k];
                    let fieldsToOutput = player.outputFields();
                    Utils.getHeaders(fieldsToOutput, playerSkip, playerHeaders);
                }
            }
        }
        let participantHeaders = [];
        let participantSkip = ['id', 'points', 'periodIndex', 'appIndex'];
        for (let i in this.session.proxy.state.participants) {
            let participant = this.session.proxy.state.participants[i];
            let participantFields = participant.outputFields();
            Utils.getHeaders(participantFields, participantSkip, participantHeaders);
        }

        //Create data
        let appsText = [];
        appsText.push('id' + this.outputDelimiter + appsHeaders.join(this.outputDelimiter));
        let newLine = this.id + this.outputDelimiter;
        for (let h=0; h<appsHeaders.length; h++) {
            let header = appsHeaders[h];
            if (this[header] !== undefined) {
                newLine += JSON.stringify(this[header]);
            }
            if (h<appsHeaders.length-1) {
                newLine += this.outputDelimiter;
            }
        }
        appsText.push(newLine);

        let periodText = [];
        let groupText = [];
        let playerText = [];
        groupText.push('period.id' + this.outputDelimiter + 'group.id' + this.outputDelimiter + groupHeaders.join(this.outputDelimiter));
        playerText.push('period.id' + this.outputDelimiter + 'group.id' + this.outputDelimiter + 'participant.id' + this.outputDelimiter + playerHeaders.join(this.outputDelimiter));
        for (let i=0; i<this.periods.length; i++) {
            let period = this.periods[i];
            let newLine = period.id + this.outputDelimiter;
            newLine = this.appendValues(newLine, periodHeaders, period);
            periodText.push(newLine);
            for (let j=0; j<period.group.subGroups.length; j++) {
                let group = period.group.subGroups[j];
                let newLine = period.id + this.outputDelimiter + group.id + this.outputDelimiter;
                newLine = this.appendValues(newLine, groupHeaders, group);
                groupText.push(newLine);
                for (let k=0; k<group.players.length; k++) {
                    let player = group.players[k];
                    let participant = player.participant;
                    let newLine = period.id + this.outputDelimiter + group.id + this.outputDelimiter + participant.id + this.outputDelimiter;
                    newLine = this.appendValues(newLine, playerHeaders, player);
                    playerText.push(newLine);
                }
            }
        }
        let participantText = [];
        let participantHeadersText = 'id' + this.outputDelimiter + 'points';
        if (participantHeaders.length > 0) {
            participantHeadersText += this.outputDelimiter + participantHeaders.join(this.outputDelimiter);
        }
        participantText.push(participantHeadersText);

        function compare( a, b ) {
            if ( a.id < b.id ) {
              return -1;
            }
            if ( a.id > b.id ) {
              return 1;
            }
            return 0;
          }

          let participants = this.session.proxy.state.participants;
          participants.sort(compare);
        for (let i in participants) {
            let participant = participants[i];
            let newLine = participant.id + this.outputDelimiter + participant.points();
            if (participantHeaders.length > 0) {
                newLine += this.outputDelimiter;
            }
            for (let h=0; h<participantHeaders.length; h++) {
                let header = participantHeaders[h];
                if (participant[header] !== undefined) {
                    newLine += JSON.stringify(participant[header]);
                }
                if (h<participantHeaders.length-1) {
                    newLine += this.outputDelimiter;
                }
            }
            participantText.push(newLine);
        }

        // WRITE OUTPUT
        let fullText = '';
        fullText += 'APP ' + this.indexInSession() + '_' + this.id + '\n';
        fullText += appsText.join('\n') + '\n';
        if (periodHeaders.length > 0) {
            fullText += 'PERIODS\n';
            fullText += periodText.join('\n') + '\n';
        }
        if (groupHeaders.length > 0) {
            fullText += 'GROUPS\n';
            fullText += groupText.join('\n') + '\n';
        }

        for (let t=0; t<groupTables.length; t++) {
            let groupTableText = [];
            let table = groupTables[t];
            let tableHeaders = groupTableHeaders[table];
            groupTableText.push('period.id' + this.outputDelimiter + 'group.id' + this.outputDelimiter + 'id' + this.outputDelimiter + tableHeaders.join(this.outputDelimiter));
            for (let i=0; i<this.periods.length; i++) {
                let period = this.periods[i];
                for (let j=0; j<period.group.subGroups.length; j++) {
                    let group = period.group.subGroups[j];
                    let tabRows = group[table].rows;
                    for (let r=0; r<tabRows.length; r++) {
                        let row = tabRows[r];
                        let newLine = period.id + this.outputDelimiter + group.id + this.outputDelimiter + row.id + this.outputDelimiter;
                        newLine = this.appendValues(newLine, tableHeaders, row);
                        groupTableText.push(newLine);
                    }
                }
            }
            fullText += groupTables[t].toUpperCase() + '\n';
            fullText += groupTableText.join('\n') + '\n';
        }

        if (playerHeaders.length > 0) {
            fullText += 'PLAYERS\n';
            fullText += playerText.join('\n') + '\n';
        }

        fullText += 'PARTICIPANTS\n';
        fullText += participantText.join('\n') + '\n';

        return fullText;

    }

    addGame(appId, options) {
        if (options == null) {
            options = {};
        }
        let app = {
            appId: appId, 
            options: options, 
            indexInQueue: this.apps.length + 1
        };
        this.subgames.push(app);
        if (global.jt.socketServer != null) {
            this.save();
            global.jt.socketServer.sendOrQueueAdminMsg(null, 'queueAddGame', {queueId: this.id, app: app});
        }
    }


    /**
     * @return {string}  Session path + {@link App#indexInSession} + '_' + app.id
     */
    getOutputFN() {
        return this.session.getOutputDir() + '/' + this.getIdInSession();
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
        let nextStage = this.nextStageForGroup(group);

        //If not at last stage of session, mvoe group to next stage.
        if (nextStage !== null) {
            nextStage.groupPlayDefault(group);
        }

        if (nextStage === null || nextStage.waitForGroup) {
            for (let p in group.players) {
                this.playerMoveToNextStage(group.players[p]);
            }
        }
    }

    getIdInSession() {
        return this.indexInSession() + '_' + this.shortId;
    }
    getFullGamePath() {
        let out = '';
        if (this.superGame != null) {
            out = out + this.superGame.getFullGamePath() + '_';
            out = out + this.indexInSuperGame();
        } else {
            out = out + this.shortId;
        }
        return out;
    }


    /**
     * @return {number} The index of this app in its session's list of apps (first position = 1).
     */
    indexInSession() {
        if (this.session === null) {
            return -1;
        }

        for (let i in this.session.apps) {
            if (this.session.apps[i] === this) {
                return parseInt(i)+1;
            }
        }
        return -1;
    }
    indexInSuperGame() {

        if (this.superGame == null) {
            return -1;
        }

        for (let i in this.superGame.subgames) {
            if (this.superGame.subgames[i] === this) {
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
    initPeriod(prd, superGroup) {
        let period = new Period.new(prd + 1, this, superGroup);
        this.periods[prd].push(period);
        return period;
    }

    /**
     * metaData - description
     *
     * @return {type}  description
     */
    metaData() {
        let metaData = {};
        metaData.numPeriods = this.numPeriods;
        metaData.groupSize = this.groupSize;
        metaData.id = this.id;
        metaData.shortId = this.shortId;
        metaData.title = this.title;
        metaData.description = this.description;
        metaData.appPath = this.appPath;
        metaData.hasError = this.hasError;
        metaData.errorPosition = this.errorPosition;
        metaData.errorLine = this.errorLine;

        // let folder = path.join(global.jt.path, global.jt.settings.appFolders[0] + '/' + this.id);
        try {
            if (this.appPath.includes('.')) {
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

        let app = new App({}, this.id);

        metaData.stages = [];
        try {
            eval(metaData.appjs);
            for (let i in app.stages) {
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
        let app = new App(this.session, this.id);
        app.optionValues = this.optionValues;
        for (let opt in app.optionValues) {
            app[opt] = app.optionValues[opt];
        }
        try {
            let appCode = Utils.readJS(this.appPath);
            let game = app;
            let treatment = app;
            eval(appCode);
            return app;
        } catch (err) {
            // Error parsing code, or game not defined in file.
            return this;
        }
    }

    setOptionValue(name, value) {
        this.optionValues[name] = value;
        let correctedValue = value;
        let isValid = false;
        let foundOpt = false;
        for (let opt in this.options) {
            let option = this.options[opt];
            if (option.name === name) {
                foundOpt = true;
                if (option.type === 'select') {
                    for (let i in option.values) {
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
     * Creates a new {@link Stage} and adds it to the App.
     *
     * @param  {string} id The identifier of the stage.
     * @return {Stage} The new stage.
     */
    newStage(id) {
        if (id == null) {
            id = 'stage' + (this.stages.length + 1);
        }
        let stage = new Stage.new(id, this);
        this.stages.push(stage);
        return stage;
    }

        /**
     * Create a new {@link Game} and add it as a subgame of the current Game.
     *
     * @param  {string} id The identifier of the game.
     * @return {Game} The new game.
     */
    addSubGame(id) {
        let subgame = new App(this.session, id, this);
        this.subgames.push(subgame);
        return subgame;
    }


    // /**
    //  * Returns the next stage for a given group in a given stage.
    //  * 1. If stage is not the last stage of this app, return the next stage of this app.
    //  * 2. If period is not the last period of this app, return the first stage of this app.
    //  * 3. If app is not the last app of this session, return the first stage of the next app.
    //  * 4. Otherwise, return null.
    //  *
    //  * TODO: Does the next stage have Stage.waitForGroup == true?
    //  *
    //  * CALLED FROM
    //  * - {@link Stage#playerEnd}
    //  * - {@link App#groupMoveToNextStage}
    //  *
    //  * @param  {Group} group The group
    //  * @return {(null|Stage)} The next stage for this group, or null.
    //  */
    // nextStageForGroup(group) {
    //     let slowestPlayers = group.slowestPlayers();
    //     return slowestPlayers[0].nextStage();
    // }
    // nextGameForGroup(group) {
    //     let slowestPlayers = group.slowestPlayers();
    //     return slowestPlayers[0].nextGame();
    // }

    // /**
    //  * Called when a player finishes a stage.
    //  * By default, check whether everyone in group is finished.
    //  * If yes, then advance to next stage ([this.session.gotoNextStage(player.group)]{@link Session.gotoNextStage}).
    //  *
    //  * @param  {Player} player description
    //  */
    // onPlayerFinished(player) {
    //     let proceed = true;
    //     for (let p in player.group.players) {
    //         let pId = player.group.players[p];
    //         if (this.session.player(pId).status !== 'finished') {
    //             proceed = false;
    //             break;
    //         }
    //     }
    //     if (proceed) {
    //         this.session.gotoNextStage(player.group);
    //     }
    // }

    /**
     * The names of fields to include in an export of this object. To be included, a field must:
     * - not be a function ({@link Utils.isFunction})
     * - not be included in {@link App#outputHide}
     * - not be included in {@link App#outputHideAuto}
     *
     * @return {Array}  An array of the field names.
     */
    outputFields() {
        let fields = [];
        for (let prop in this) {
            if (
                App.prototype[prop] !== this[prop] &&
                !this.outputHide.includes(prop) &&
                !this.outputHideAuto.includes(prop)
            )
            fields.push(prop);
        }
        return fields;
    }

    start() {
        if (this.started) {
            return;
        }
        this.started = true;
    }

    canPlayerStart(player) {
        
        if (!player.startedPeriod) {
            return false;
        }

        if (this.waitToStart) {
            for (let i in player.group.players) {
                if (!player.group.players[i].startedPeriod) {
                    return false;
                }
            }
        }

        return true;
    }

    canPlayerEnd(player) {
        
        if (player.endedPeriod) {
            return false;
        }

        if (player.stageIndex > this.indexInApp()) {
            return false;
        }

        if (this.waitToEnd) {
            for (let i in player.group.players) {
                if (player.group.players[i].endedPeriod) {
                    return false;
                }
            }
        }

        return true;
    }

    getGroupDuration(group) {
        return this.duration;
    }

    getClientDuration(player) {
        return this.clientDuration;
    };

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

        let thisTarget = this;
        while (thisTarget.__target != null) {
            thisTarget = thisTarget.__target;
        }

        for (let i=0; i<gameTree.length; i++) {
            let gameTarget = gameTree[i];
            while (gameTarget.__target != null) {
                gameTarget = gameTarget.__target;
            }
            if (gameTarget === thisTarget) {
                return i;
            }
        }

        return -1;

    }
    
    
    getPeriod(index, group) {
        if (this.periods.length <= index) {
            this.initPeriod(index, group);
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
     playerMoveToNextPeriod(player) {

        let periodIndex = player.getGamePeriod(this);

        // If in the last period of app, move to next app.
         if (periodIndex >= this.numPeriods - 1) {
            //  this.getFullSession().participantMoveToNextGame(participant);
         }

         // Move to the next period of this app.
         else {
             // Move to next period.
             player.periodIndex++;
             player.save();
             this.playerBeginPeriod(player);
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
     * - Try to end the app ({@link App#tryToEndApp}).
     *
     * CALLED FROM
     * - xxx
     *
     * @param  {Participant} participant The participant.
     */
    participantEndInternal(participant) {
        // for (let c in participant.clients) {
        //     let client = participant.clients[c];
        //     client.socket.leave(this.roomId());
        // }
        this.participantEnd(participant);
        this.tryToEndGame();
    }

    participantEnd(participant) {}

    // /**
    //  * Move the player to their next stage.
    //  *
    //  * FUNCTIONALITY
    //  * - if player has not finished all stages,
    //  * -- set player status to 'playing'
    //  * -- increment player's stage index.
    //  * -- play next stage ({@link Stage#playerPlayDefault}).
    //  * -- player emits update ({@link Player#emitUpdate2}).
    //  * - otherwise, move participant to next period ([this.participantMoveToNextPeriod(player.participant)]{@link App#participantMoveToNextPeriod}).
    //  *
    //  * CALLED FROM
    //  * - {@link App#groupMoveToNextStage}
    //  *
    //  * @param  {Player} player The player
    //  * @return {type}        description
    //  */
    // playerMoveToNextStage(player) {
    //     if (player.stageIndex < this.stages.length - 1) {
    //         player.status = 'playing';
    //         player.stageIndex++;
    //         player.stage = this.stages[player.stageIndex];
    //         player.stage.playerPlayDefault(player);
    //         player.emitUpdate2();
    //     } else {
    //         this.participantMoveToNextPeriod(player.participant);
    //     }
    // }

    /**
     * Returns the player of the current player's participant from the previous period.
     *
     * @param  {Player} player The player.
     * @return {Player}        The previous player, if any.
     */
    previousPlayer(player) {
        let prevPeriod = player.period().prevPeriod();
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
        let prevPeriod = group.period().prevPeriod();
        if (prevPeriod === null) {
            return null;
        } else {
            return Utils.findById(prevPeriod.group.subGroups, group.id);
        }
    }

    /**
     * roomId - description
     *
     * @return {string}  {@link Session#roomId} + '_app_' + this.id
     */
    roomId() {
        if (this.subgames.length > 0) {
            if (this.parent == null) {
                return 'session_' + this.session.id + '_app_' + this.indexInSession() + '-' + this.id;
            } else {
                return this.parent.roomId() + '_app_' + this.indexInSession() + '-' + this.id;
            }    
        } else {
            return this.session.roomId() + '_app_' + this.indexInSession() + '-' + this.id;
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
            // global.jt.log('App.save: ' + this.id);
            this.session.saveDataFS(this, 'APP');
        } catch (err) {
            console.log('Error saving app ' + this.id + ': ' + err);
        }
    }

    canGroupParticipate(group) {
        return true;
    }

    canGroupEnd(group) {
        return this.canGroupEndDefault(group);
    }

    canGroupEndDefault(group) {

        if (group.endedPeriod) {
            return false;
        }

        if (this.waitToEnd) {
            for (let i in group.players) {
                if (group.players[i].endedPeriod) {
                    return false;
                }
            }
        }

        // If already ended this stage, return false.
        if (group.stageEndedIndex >= this.indexInApp()) {
            return false;
        }

        if (this.waitToEnd) {
            // If any player is not in this stage, then return false.
            for (let p in group.players) {
                let player = group.players[p];
                if (player.stageIndex > this.indexInApp()
                 || ['done', 'finished'].includes(player.status) === false
                ) {
                    return false;
                }
            }
        } 
        
        // Otherwise, return true.
        return true;
    }

    groupStartInternal(group) {

        if (!this.canGroupParticipate(this)) {
            this.groupEndInternal();
        }

        if (!this.canGroupStart(group)) {
            return;
        }

        let groupDuration = this.getGroupDuration(group);
        if (groupDuration > 0) {
            let timeOutCB = function(stage) {
                this.session().addMessageToStartOfQueue(this, stage, 'forceEndStage');
            }.bind(this, stage);
            this.stageTimer = new Timer.new(
                timeOutCB,
                groupDuration*1000,
                this.indexInApp()
            );
        }

        try {
            global.jt.log('START - GROUP : ' + this.id + ', ' + group.id);
            group.stageStartedIndex = this.indexInApp();
            this.groupStart(group);
        } catch (err) {
            global.jt.log(err.stack);
        }
        // try {
        //     this.save();
        // } catch (err) {}
        for (let p in group.players) {
            try {
                this.playerStartInternal(group.players[p]);
            } catch (err) {
                global.jt.log(err.stack);
                debugger;
            }
        }

    }

    groupEndInternal(group) {

        if (!this.canGroupEnd(group)) {
            return;
        }

        try {
            global.jt.log('END   - GROUP : ' + this.id + ', ' + group.id);
            group.stageEndedIndex = this.indexInApp();
            this.groupEnd(group);
        } catch (err) {
            global.jt.log(err.stack);
        }
        for (let p in group.players) {
            this.playerEndInternal(group.players[p]);
        }

    }

    recordPlayerEndTime(player) {
        let timeStamp = Utils.timeStamp();
        player['timeEnd_' + this.id] = timeStamp;
        if (player['timeStart_' + this.id] == null) {
            global.jt.log('Player ERROR, missing stage start time!');
            player['msInStage_' + this.id] = 0;
        } else {
            player['msInStage_' + this.id] = Utils.dateFromStr(timeStamp) - Utils.dateFromStr(player['timeStart_' + this.id]);
        }
        global.jt.log('END   - PLAYER: ' + this.id + ', ' + player.id);
    }

    recordPlayerStartTime(player) {
        let timeStamp = Utils.timeStamp();
        global.jt.log('START - PLAYER: ' + this.id + ', ' + player.id);
        player['timeStart_' + this.id] = timeStamp;
    }

    canGroupPlayersStart(group) {
        
        if (group.stageStartedIndex >= this.indexInApp()) {
            return true;
        }

        // If do not need to wait for all players, return true.
        if (!this.waitToStart) {
            return true;
        }

        // If any player is not ready, return false.
        for (let p in group.players) {
            let player = group.players[p];
            if (!this.isPlayerReady(player, this.indexInApp())) {
                return false;
            }
        }

        return true;

    }

    canGroupPlayersEnd(group) {

        if (group.stageEndedIndex < this.indexInApp()) {
            return false;
        }

        // If Group has already finished, do not allow players to finish. 
        if (group.stageEndedIndex > this.indexInApp()) {
            return false;
        }

        // If do not need to wait for all players, return true.
        if (!this.waitToEnd) {
            return true;
        }

        // If any player is not finished playing, return false.
        for (let p in group.players) {
            let player = group.players[p];
            if (
                ['done', 'finished'].includes(player.status) == false
             && player.stageIndex === this.indexInApp()
            ) {
                return false;
            }
        }

        // Otherwise, return true.
        return true;
    }

    playerEnd(player) {}

    playerEndInternal(player) {
        player.status = 'done';
        this.groupEndInternal(player.group);
        if (!this.canPlayerEnd(player)) {
            return;
        }
        if (this.canGroupPlayersEnd(player.group)) {
            this.recordPlayerEndTime(player);
            try {
                this.playerEnd(player);
            } catch(err) {
                global.jt.log(err + '\n' + err.stack);
            }
            // If not in last subgame of parent game...
            if (player.stageIndex < player.superGame.subgames.length-1) {
                // Move to next subgame of parent game.
                player.startNextStage();
            } else if (player.period().id < player.app().numPeriods) {
                // player.superPlayer.startNextPeriod();
                this.superGame.playerBeginPeriod(player.period().id+1, player.superPlayer);
            }
            // Otherwise, finished all of parent game's subgames.
            else {
                // End parent player.
                player.superPlayer.endStage();
            }
        }
        player.emitUpdate2();
    }

    playerStartInternal(player) {
        this.groupStartInternal(player.group);
        if (!this.canPlayerStart(player)) {
            return;
        }
        if (this.canGroupPlayersStart(player.group)) {
            if (this.canPlayerParticipate(player)) {
                if (player.status === 'ready') {
                    player.participant().setPlayer(player);
                    player.status = 'playing';
                    this.recordPlayerStartTime(player);
                    try {
                        this.playerStart(player);
                    } catch(err) {
                        global.jt.log(err + '\n' + err.stack);
                    }
                    if (this.canPlayerStartPeriods(player)) {
                        this.playerBeginPeriod(1, player);
                    } 
                    this.save();
                }
            } else {
                this.finishStage(true);
            }
        }
        player.emitUpdate2();
    }

    canPlayerStartPeriods(player) {
        let group = player.group;
        for (let i in group.players) {
            let pl = group.players[i];
            if (pl.status !== 'playing') {
                return false;
            }
        }
        return true;
    }

    startStage(stage) {
        this.group.startStage(stage);
        if (!stage.canPlayerStart(this)) {
            return;
        }
        // if (!this.participant.canStartStage(stage)) {
        //     return;
        // }
        if (this.stageIndex !== stage.indexInApp()) {
            this.stage = stage;
            this.stageIndex = stage.indexInApp();
            this.status = 'ready';            
        }
        if (this.group.canPlayersStart(this.stage)) {
            if (this.stage.canPlayerParticipate(this)) {
                if (this.status === 'ready') {
                    this.participant.setPlayer(this);
                    this.status = 'playing';
                    this.recordStageStartTime(stage);
                    try {
                        // stage.playerStart(this);
                        stage.participantBegin(this.participant);
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
     * isReady - description
     *
     * @return {type}  description
     */
    isPlayerReady(player, stageIndex) {
        let actualPlyr = player.participant().player;

        // No active player.
        if (actualPlyr == null || player !== actualPlyr) {
            return false;
        }

        if (player.stageIndex !== stageIndex) {
            return false;
        }

        if (player
            .status !== 'ready') {
            return false;
        }

        return true;
    }

    /**
     * isFinished - description
     *
     * @return {type}  description
     */
    isFinished() {
        let actualPlyr = this;

        // Not yet in the group's current stage.
        if (actualPlyr.group.stageIndex > this.stageIndex) {
            return false;
        } 
        // Passed the group's current stage.
        else if (actualPlyr.group.stageIndex < this.stageIndex) {
            return true;
        }
        // In the group's current stage. Check status.
        else {
            if (['finished', 'done'].includes(actualPlyr.status)) {
                return true;
            } else {
                return false;
            }
        }
    }



    finishPlayer(player, endGroup) {
        player.status = 'finished';
        global.jt.log('FINISH- PLAYER: ' + this.id + ', ' + player.roomId());
        let curRoomId = player.roomId();
        let curGamePath = player.gamePath;
        let curStageIndex = player.stageIndex;
        if (endGroup) {
            player.group.endStage(this);
        }
        if (
            curRoomId == player.roomId() && 
            curStageIndex === player.stageIndex &&
            curGamePath == player.gamePath)
        {
            this.movePlayerToNextStage(player);
        }
    }

        // If there is a next stage, enter it.
    // Otherwise, if there is a next period, start it.
    // Otherwise, end the current app.
    movePlayerToNextStage(player) {
        let stage = this;

        // // If this player is no longer active, do nothing.
        // if (player.participant.player == null || player.roomId() !== player.participant.player.roomId()) {
        //     return;
        // }

        let superGame = player.app().superGame;
        let superPlayer = null;
        if (superGame != null) {
            let lastPeriod = superGame.periods[superGame.periods.length-1];
            findSuperPlayer: {
                for (let g in lastPeriod.group.subGroups) {
                    let gr = lastPeriod.group.subGroups[g];
                    for (let p in gr.players) {
                        if (gr.players[p].id === player.id) {
                            superPlayer = gr.players[p];
                            break findSuperPlayer;
                        }
                    }
                }
            }
        }

        let nextStage = this.app().getNextStageForPlayer(player);
        let nextPeriod = this.app().getNextPeriod(player);
        if (nextStage !== null) {
            player.stage = nextStage;
            player.subGame = nextStage;
            player.updateGamePath();
            player.stageIndex++;
            player.status = 'ready';
            console.log(this.timeStamp() + ' READY - PLAYER: ' + this.stage.id + ', ' + this.roomId());
            player.startStage(player.stage);
        } else if (nextPeriod !== null) {
            // player.participant.player = player.superPlayer;
            player.participant.startPeriod(nextPeriod);
        } else if (superPlayer != null) {
            if (superPlayer.stage === this.app()) {
                superPlayer.endStage(true);
            }
        } else {
            // let superGame = this.app().superGame;
            // if (superGame == null) {
            //     debugger;
            // }
            // superGame.moveParticipantToNext
            player.participant.endCurrentApp();
        }
        this.emitUpdate2();

    } 

        /**
     * The next stage for this player.
     **/
    nextStage(player) {
        let stageInd = player.stageIndex;

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
            let app = this.session().appFollowing(this.app());
            if (app !== null && app.stages.length > 0) {
                return app.stages[0];
            }
            // Otherwise, return null.
            else {
                return null;
            }
        }
    }

    indexInApp() {
        if (this.parent != null) {
            for (let i in this.parent.subgames) {
                if (this.parent.subgames[i].id === this.id) {
                    return parseInt(i);
                }
            }
            return -1;
        } else {
            for (let i in this.session.gameTree) {
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

        if (!group.startedPeriod) {
            return false;
        }

        if (this.waitToStart) {
            for (let i in group.players) {
                if (!group.players[i].startedPeriod) {
                    return false;
                }
            }
        }

        // If already started this stage, return false.
        if (group.stageStartedIndex >= this.indexInApp()) {
            return false;
        }

        if (this.waitToStart) {
            // If any player is 1) not "ready" or 2) not in this stage, then return false.
            for (let p in group.players) {
                let player = group.players[p];
                if (player.stageIndex < this.indexInApp()) {
                    return false;
                }
            }
        } 
        
        // Otherwise, return true.
        return true;
    }

    endGame(state, msgData) {

        let {endForGroup, data, participantId} = msgData;

        // global.jt.log('Server received auto-game submission: ' + JSON.stringify(data));

        // TODO: Not parsing strings properly.
        /** console.log('msg: ' + JSON.stringify(data) + ', ' + client.player().roomId());*/
        // let endForGroup = true;
        // let participantId = client.participant.id;

        let participant = Utils.findById(state.participants, participantId);
        let player = participant.player;
        let group = player.group;
        let period = group.period;
        let game = player.stage;

        if (player === null) {
            return false;
        }

        if (player.stage.id !== data.fnName) {
            console.log('Game.js, GAME NAME DOES NOT MATCH: ' + participant.player.game.id + ' vs. ' + data.fnName + ', data=' + JSON.stringify(data, global.jt.partReplacer));
            return false;
        }

        for (let property in data) {
            let value = data[property];

            if (value === 'true') {
                value = true;
            } else if (value === 'false') {
                value = false;
            } else if (!isNaN(value)) {
                value = parseFloat(value);
            }

            if (data.hasOwnProperty(property)) {
                if (property.startsWith('player.')) {
                    let fieldName = property.substring('player.'.length);
                    player[fieldName] = value;
                } else if (property.startsWith('group.')) {
                    let fieldName = property.substring('group.'.length);
                    group[fieldName] = value;
                } else if (property.startsWith('participant.')) {
                    let fieldName = property.substring('participant.'.length);
                    participant[fieldName] = value;
                } else if (property.startsWith('period.')) {
                    let fieldName = property.substring('period.'.length);
                    period[fieldName] = value;
                } else if (property.startsWith('game.')) {
                    let fieldName = property.substring('game.'.length);
                    game[fieldName] = value;
                }
            }
        }
        player.endStage(endForGroup);
    }



    /**
     * If all participants have finished the app, end the app ({@link App#end}).
     *
     * CALLED FROM
     * - {@link App#participantEndInternal}
     *
     * @return {type}  description
     */
    tryToEndGame() {
        if (this.finished) {
            return;
        }

        let proceed = true;
        let participants = this.session.proxy.state.participants;
        for (let p in participants) {
            let participant = participants[p];
            if (!participant.isFinishedGame(this)) {
                proceed = false;
                break;
            }
        }
        if (proceed) {
            this.internalEnd();
        }
    }


    tryToEndApp() {
        if (this.finished) {
            return;
        }

        let proceed = true;
        let participants = this.session.proxy.state.participants;
        for (let p in participants) {
            let participant = participants[p];
            if (!participant.isFinishedApp(this)) {
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
        for (let i=0; i<headers.length; i++) {
            let header = headers[i];
            let value = obj[header];
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
                newLine += this.outputDelimiter;
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

        tryToEndGame() {
        if (this.finished) {
            return;
        }

        let proceed = true;
        let participants = this.session.proxy.state.participants;
        for (let p in participants) {
            let participant = participants[p];
            if (!participant.isFinishedGame(this)) {
                proceed = false;
                break;
            }
        }
        if (proceed) {
            this.internalEnd();
        }
    }

    getNextPeriod(player) {
        let gamePeriod = player.group.period.id; // [1, periods.length]
        if (gamePeriod >= this.numPeriods) {
            return null;
        } else {
            return this.getPeriod(gamePeriod); // this.periods[gamePeriod].
        }
    }

}

var exports = module.exports = {};
exports.new = App;
exports.newSansId = App.newSansId;
