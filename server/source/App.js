const Period    = require('./Period.js');
const Utils     = require('./Utils.js');
const fs        = require('fs-extra');
const path      = require('path');
const Timer     = require('./Timer.js');
const Player    = require('./Player.js');
const Group     = require('./Group.js');
const Status    = require('./Status.js');

/** Class that represents an app. */
class App {

    constructor(session, appPath, parent) {

        this.id = appPath;
        this.superGame = parent;
        this.waitToStart = true;
        this.waitToEnd = true;
        if (this.superGame != null) {
            this.waitToStart = parent.subGameWaitToStart;
            this.waitToEnd = parent.subGameWaitToEnd;
        }
        this.showErrorsInLog = true;
        this.shortId = this.getShortId(appPath);
        this.outputDelimiter = ';';
        if (session != null) {
            this.outputDelimiter = session.outputDelimiter;
        }
        this.session = session;
        this.isStandaloneApp = true;
        this.subgames = [];
        this.activeScreen = '';        
        this.addOKButtonIfNone = true;
        this.addFormIfNone = true;
        this.options = [];
        this.optionValues = {};
        this.duration = null;
        this.useVue = true;
        this.clientDuration = 0;
        this.numPeriods = 1;
        this.insertJtreeRefAtStartOfClientHTML = true;
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
                        <span v-if='player.status==${Status.STARTED}'>
                            {{subgames}}
                        </span>
                        <span v-else>
                            {{waiting-screens}}
                        </span>
                    </div>
                    {{scripts}}
                </body>
            </html>
        `;
        this.periodText = 'Period'
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
        this.modifyPathsToIncludeId = true;
        this.screen = '';
        this.waitingScreenDefault = `
            <p>WAITING</p>
            <p>The experiment will continue soon.</p>
        `;
        this.htmlFile = null;
        this.periods = [];
        this.description = 'No description provided.';
        this.subGameWaitToStart = true;
        this.subGameWaitToEnd = true;
        this.groupMatchingType = 'STRANGER';
        this.messages = {};
        this.subgameWrapPlayingScreenInFormTag = 'onlyIfNoButton';
        this.wrapPlayingScreenInFormTag = 'onlyIfNoButton';
        this.groupSize = undefined;
        this.groupingType = undefined;
        this.hasError = false;
        this.suggestedNumPlayers = undefined;
        this.numGroups = undefined;
        this.subgameContentStart = `<span v-if="game.id == '{{game.id}}'">`;
        this.subgameContentEnd = '</span>';
    }

    getShortId(appPath) {
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
        return id;
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
    * - client registers automatic game submission messages it may send.
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

    // Load custom code, overwrite default game submission behavior.
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
    addGames(array) {
        for (let i=0; i<array.length; i++) {
            this.addGame(array[i]);
        }
    }

    /**
     * Adds a game, with contents loaded from .jtt file.
     * @param {String} name The name of the game to add
     */
    addGame(name) {
        let game = this.newSubGame(name);
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

    groupStart(group) {}
    playerStart(player) {}
    groupEnd(group) {}
    playerEnd(player) {}
    groupStartPeriod(group, period) {}
    playerStartPeriod(player, period) {}
    groupEndPeriod(group, period) {}
    playerEndPeriod(player, period) {}
    subGroupStartPeriod(group, period) {}
    subPlayerStartPeriod(player, period) {}
    subGroupEndPeriod(group, period) {}
    subPlayerEndPeriod(player, period) {}

    groupStartInternal(group) {

        if (group.status === Status.UNSET) {
            group.status = Status.READY_TO_START;
        }
        // if (!this.canGroupParticipate(this)) {
        //     this.groupEndInternal();
        // }

        if (!this.canGroupStart(group)) {
            return;
        }

        let groupDuration = this.getGroupDuration(group);
        if (groupDuration > 0) {
            let timeOutCB = function(game) {
                this.session().addMessageToStartOfQueue(this, game, 'forceEndGame');
            }.bind(this, game);
            this.gameTimer = new Timer.new(
                timeOutCB,
                groupDuration*1000,
                this.indexInApp()
            );
        }

        try {
            global.jt.log('START - GROUP : ' + this.id + ', ' + group.id);
            group.status = Status.STARTED;
            this.groupStart(group);
        } catch (err) {
            global.jt.log(err.stack);
        }
        for (let p in group.players) {
            try {
                this.playerStartInternal(group.players[p]);
            } catch (err) {
                global.jt.log(err.stack);
                debugger;
            }
        }

    }

    canGroupStart(group) {
        return this.canGroupStartDefault(group);
    }

    canGroupStartDefault(group) {

        if (group.status >= Status.STARTED) {
            return false;
        }

        if (this.waitToStart) {
            // If any player is not "ready", then return false.
            for (let p in group.players) {
                let player = group.players[p];
                if (player.status < Status.READY_TO_START) {
                    return false;
                }
            }
        } 
        
        // Otherwise, return true.
        return true;
    }

    playerStartInternal(player) {
        this.groupStartInternal(player.group);
        if (!this.canPlayerStart(player)) {
            return;
        }
        if (this.canGroupPlayersStart(player.group)) {
            if (this.canPlayerParticipate(player)) {
                if (player.status === Status.READY_TO_START) {
                    player.participant().setPlayer(player);
                    player.status = Status.STARTED;
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
                this.finishGame(true);
            }
        }
        player.emitUpdate2();
    }

    groupEndInternal(group) {

    }

    playerEndInternal(player) {

    }

    groupStartPeriodInternal(group, period) {

    }

    playerStartPeriodInternal(player, period) {

    }

    groupEndPeriodInternal(group, period) {

    }

    playerEndPeriodInternal(player, period) {

    }

    subGroupStartPeriodInternal(group, period) {

    }

    subPlayerStartPeriodInternal(player, period) {

    }

    subGroupEndPeriodInternal(group, period) {

    }

    subPlayerEndPeriodInternal(player, period) {

    }











    
    groupBeginPeriod(periodNum, group) {

        let period = this.getPeriod(periodNum-1);

        // Create Period Group.
        if (group.subGroups.length < periodNum) {
            let pg = new Group.new(group.id, period, group);
            for (let p in group.players) {
                let oldP = group.players[p];
                let newP = new Player.new(oldP.id, oldP, pg, oldP.idInGroup);
                oldP.subPlayers.push(newP);
                newP.type = 'period';
                pg.players.push(newP);
            }
            group.type = 'period';
            group.subGroups.push(pg);
        }
        let periodGroup = group.subGroups[periodNum-1];

        if (periodGroup.subGroups.length < period.numGroups(periodGroup)) {
            period.createGroups(periodGroup);
        }

        global.jt.log('START PERIOD - GROUP: ' + this.id + ', ' + period.id + ', ' + periodGroup.id);
        periodGroup.status = Status.STARTED;
        this.groupStartPeriod(periodGroup, period);
        for (let p in periodGroup.players) {
            let periodPlayer = periodGroup.players[p];
            global.jt.log('START PERIOD - PLAYER: ' + this.id + ', ' + period.id + ', ' + periodPlayer.id);
            periodPlayer.status = Status.STARTED;
            this.playerStartPeriod(periodPlayer, period);
        }

        for (let i in periodGroup.subGroups) {
            let periodSubGroup = periodGroup.subGroups[i];
            global.jt.log('START PERIOD - SUBGROUP: ' + this.id + ', ' + period.id + ', ' + periodSubGroup.id);
            this.subGroupStartPeriod(periodSubGroup, period);
            periodSubGroup.status = Status.READY_TO_START;
            period.groupBegin(periodSubGroup);
        }

    }

    playerBeginPeriod(periodNum, player) {

        this.groupBeginPeriod(periodNum, player.group);

        let period = this.getPeriod(periodNum-1);
        if (period === undefined) {
            return false;
        }

        let periodPlayer = player.subPlayers[periodNum - 1];

        period.playerBegin(periodPlayer);
    }

    /**
     * TODO
     * Get group ids for their current period
     */
    getGroupIdsForPeriod(period, group) {
        let players = group.players;
        let numGroups = period.numGroups(group);
        let pIds = [];
        for (let p in players) {
            pIds.push(players[p].id);
        }
        // Group IDs.
        let gIds = [];
        for (let g=0; g<numGroups; g++) {
            gIds.push([]);
        }

        // Remove any pIds of players who are already in a group.
        for (let i=0; i<group.subGroups.length; i++) {
            let subGroup = group.subGroups[i];
            for (let j=0; j<subGroup.players.length; j++) {
                gIds[i].push(subGroup.players[j].id);
                for (let k=0; k<pIds.length; k++) {
                    if (pIds[k] == subGroup.players[j].id) {
                        pIds.splice(k, 1);
                    }
                }
            }
        }

        // Calculate number of elements per group
        let m = Math.floor((pIds.length-1) / numGroups) + 1;

        if (this.groupMatchingType === 'PARTNER_1122') {
            for (let g=group.subGroups.length; g<numGroups; g++) {
                for (let i=0; i<m; i++) {
                    gIds[g].push(pIds[0]);
                    pIds.splice(0, 1);
                }
            }
        } else if (this.groupMatchingType === 'PARTNER_1212') {
            for (let i=0; i<m; i++) {
                for (let g=group.subGroups.length; g<numGroups; g++) {
                    gIds[g].push(pIds[0]);
                    pIds.splice(0, 1);
                }
            }
        } else if (this.groupMatchingType === 'PARTNER_RANDOM') {
            if (period.id === 1) {
                period.getStrangerMatching(numGroups, pIds, gIds, m, group.subGroups.length);
            } else {
                let prevPeriod = period.prevPeriod();
                gIds = prevPeriod.groupIds();
            }
        } else if (this.groupMatchingType === 'STRANGER') {
            period.getStrangerMatching(numGroups, pIds, gIds, m, group.subGroups.length);
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
            <span v-if='player.status == ${Status.STARTED}' class='playing-screen'>
                ${formStart}
                    ${app.activeScreen}
                    ${buttonCode}
                ${formEnd}
            </span>
            <span v-else class='waiting-screen'>
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
    parseSubGameTag(game, text) {
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

        // Load dynamic version of app to allow for live editing of game html.
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
            <span v-show='player.status == ${Status.STARTED}' class='playing-screen'>
                ${app.activeScreen}
                <div>
                {{subgames}}
                </div>
            </span>
            `;
        }

        if (!html.includes('{{subgames}}')) {
            html += `
            <span v-show='player.status == ${Status.STARTED}' class='playing-screen'>
                {{subgames}}
            </span>
            `;
        }

        // Load game contents, if any.
        let subgamesHTML = '';
        let waitingScreensHTML = '';
        for (let i=0; i<app.subgames.length; i++) {
            let subgame = app.subgames[i];
            let subgameHTML = '';
            let contentStart = app.parseSubGameTag(game, app.subgameContentStart);
            let contentEnd = app.parseSubGameTag(game, app.subgameContentStart);
            if (subgame.content != null) {
                subgameHTML = contentStart + '\n' + subgame.content + '\n' + contentEnd;
            }
            if (subgame.activeScreen != null) {
                subgameHTML += app.parseSubgameTag(subgame, app.subgameContentStart)  + '\n';
                let wrapInForm = null;
                if (subgame.wrapPlayingScreenInFormTag === 'yes') {
                    wrapInForm = true;
                } else if (subgame.wrapPlayingScreenInFormTag === 'no') {
                    wrapInForm = false;
                } else if (subgame.wrapPlayingScreenInFormTag === 'onlyIfNoButton') {
                    if (
                        !subgame.activeScreen.includes('<button') ||
                        subgame.addOKButtonIfNone
                        ) {
                        wrapInForm = true;
                    } else {
                        wrapInForm = false;
                    }
                }
                if (wrapInForm) {
                    subgameHTML += '<form>\n';
                }
                subgameHTML += subgame.activeScreen + '\n';
                if (subgame.addOKButtonIfNone) {
                    if (!subgameHTML.includes('<button')) {
                        subgameHTML += `<button>OK</button>`;
                    }
                }
                if (wrapInForm) {
                    subgameHTML += '</form>\n';
                }
                subgameHTML += app.parseSubGameTag(subgame, app.subgameContentEnd);
            }

            if (subgamesHTML.length > 0) {
                subgamesHTML += '\n';
            }
            subgamesHTML += subgameHTML;

            let waitingScreenHTML = contentStart;
            if (subgame.useAppWaitingScreen) {
                waitingScreenHTML += app.getWaitingScreen();
            }
            if (subgame.getWaitingScreen() != null) {
                waitingScreenHTML += subgame.getWaitingScreen();
            }
            waitingScreenHTML += contentEnd;

            if (waitingScreensHTML.length > 0) {
                waitingScreensHTML += '\n';
            }
            waitingScreensHTML += waitingScreenHTML;
        }

        let [strippedScripts, subgamesHTML1] = this.stripTag('script', subgamesHTML);
        let [strippedStyles, subgamesHTML2] = this.stripTag('style', subgamesHTML1);
        let [strippedLinks, subgamesHTML3] = this.stripTag('link', subgamesHTML2);
        subgamesHTML = subgamesHTML3;

        if (html.includes('{{subgames}}')) {
            html = html.replace('{{subgames}}', subgamesHTML);
        }

        html = html.replace('{{waiting-screens}}', waitingScreensHTML);

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
            switch (jt.vue.player.subgame.id) {
                `;
        for (let i=0; i<this.subgames.length; i++) {
            out += `
            case "${this.subgames[i].id}":
                jt.autoplay_${this.subgames[i].id}();
                break;
            `;
        }

        out += `
            }
        }
        `
        for (let i=0; i<this.subgames.length; i++) {
            out += `
                if (jt.autoplay_${this.subgames[i].id} == null) {
                    jt.autoplay_${this.subgames[i].id} = function() {
                        ${this.subgames[i].autoplay}
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
    parseSubgameTag(game, text) {
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
        let playerSkip = ['status', 'gameIndex', 'id', 'participantId'];
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
    initPeriod(prd) {
        let period = new Period.new(prd + 1, this);
        this.periods.push(period);
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
            if (this.id.includes('.')) {
                metaData.appjs = Utils.readJS(this.id);
            } else {
                metaData.appjs = Utils.readJS(this.id + '/app.jtt');
            }
        } catch (err) {
            metaData.appjs = '';
        }

        try {
            metaData.clientHTML = Utils.readJS(this.id + '/client.html');
        } catch (err) {
            metaData.clientHTML = '';
        }

        let app = new App({}, this.id);

        metaData.subgames = [];
        try {
            eval(metaData.appjs);
            for (let i in app.subgames) {
                metaData.subgames.push(app.subgames[i].id);
            }
            metaData.numPeriods = app.numPeriods;
            metaData.options = app.options;
        } catch (err) {
            metaData.subgames.push('unknown');
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
            let appCode = Utils.readJS(this.id);
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
        
        if (player.status !== Status.READY_TO_START) {
            return false;
        }

        if (this.waitToStart) {
            for (let i in player.group.players) {
                if (
                    player.group.players[i].status < Status.READY_TO_START &&
                    player.gameIndex >= this.indexInApp()
                ) {
                    return false;
                }
            }
        }

        return true;
    }

    canPlayerEnd(player) {
        
        if (player.status < Status.READY_TO_END) {
            return false;
        }

        // if (player.gameIndex > this.indexInApp()) {
        //     return false;
        // }

        if (this.waitToEnd) {
            for (let i in player.group.players) {
                if (player.group.players[i].status < Status.READY_TO_END) {
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
    
    
    getPeriod(index) {
        if (this.periods.length <= index) {
            this.initPeriod(index);
        }
        return this.periods[index];
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

        if (group.status > Status.READY_TO_END) {
            return false;
        }

        if (this.waitToEnd) {
            for (let i in group.players) {
                if (
                    group.players[i].status < Status.READY_TO_END &&
                    group.players[i].gameIndex === this.indexInApp()
                ) {
                    return false;
                }
            }
        }

        // // If already ended this game, return false.
        // if (group.gameEndedIndex >= this.indexInApp()) {
        //     return false;
        // }

        // if (this.waitToEnd) {
        //     // If any player is not in this game, then return false.
        //     for (let p in group.players) {
        //         let player = group.players[p];
        //         if (player.gameIndex > this.indexInApp()
        //          || ['done', 'finished'].includes(player.status) === false
        //         ) {
        //             return false;
        //         }
        //     }
        // } 
        
        // Otherwise, return true.
        return true;
    }

    // groupStartInternal(group) {

    //     if (!this.canGroupParticipate(this)) {
    //         this.groupEndInternal();
    //     }

    //     if (!this.canGroupStart(group)) {
    //         return;
    //     }

    //     let groupDuration = this.getGroupDuration(group);
    //     if (groupDuration > 0) {
    //         let timeOutCB = function(game) {
    //             this.session().addMessageToStartOfQueue(this, game, 'forceEndGame');
    //         }.bind(this, game);
    //         this.gameTimer = new Timer.new(
    //             timeOutCB,
    //             groupDuration*1000,
    //             this.indexInApp()
    //         );
    //     }

    //     try {
    //         global.jt.log('START - GROUP : ' + this.id + ', ' + group.id);
    //         group.gameStartedIndex = this.indexInApp();
    //         this.groupStart(group);
    //     } catch (err) {
    //         global.jt.log(err.stack);
    //     }
    //     // try {
    //     //     this.save();
    //     // } catch (err) {}
    //     for (let p in group.players) {
    //         try {
    //             this.playerStartInternal(group.players[p]);
    //         } catch (err) {
    //             global.jt.log(err.stack);
    //             debugger;
    //         }
    //     }

    // }

    groupEndInternal(group) {

        if (!this.canGroupEnd(group)) {
            return;
        }

        group.status = Status.ENDED;

        try {
            global.jt.log('END   - GROUP : ' + this.id + ', ' + group.id);
            group.gameEndedIndex = this.indexInApp();
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

        if (player.type == 'period') {
            player.timeEnd = timeStamp;
            // player.msInGame = Utils.dateFromStr(timeStamp) - Utils.dateFromStr(player.timeStart);
            global.jt.log('END PERIOD - PLAYER: ' + this.id + ', ' + player.id);
            return;
        }

        if (player.game == null) {
            player.timeEnd = timeStamp;
            player.msInGame = Utils.dateFromStr(timeStamp) - Utils.dateFromStr(player.timeStart);
            global.jt.log('END PERIOD - SUBPLAYER: ' + this.id + ', ' + player.id);
            return;
        }

        player['timeEnd_' + this.id] = timeStamp;
        if (player['timeStart_' + this.id] == null) {
            global.jt.log('Player ERROR, missing game start time!');
            player['msInGame_' + this.id] = 0;
        } else {
            player['msInGame_' + this.id] = Utils.dateFromStr(timeStamp) - Utils.dateFromStr(player['timeStart_' + this.id]);
        }
        global.jt.log('END   - PLAYER: ' + this.id + ', ' + player.id);
    }

    recordPlayerStartTime(player) {
        let timeStamp = Utils.timeStamp();
        global.jt.log('START - PLAYER: ' + this.id + ', ' + player.id);
        player['timeStart_' + this.id] = timeStamp;
    }

    /**
     * isReady - description
     *
     * @return {type}  description
     */
    isPlayerReady(player, gameIndex) {
        let actualPlyr = player.participant().player;

        // No active player.
        if (actualPlyr == null || player !== actualPlyr) {
            return false;
        }

        if (player.gameIndex !== gameIndex) {
            return false;
        }

        if (player.status !== 'ready') {
            return false;
        }

        return true;
    }

    // canGroupPlayersEnd(group) {

    //     if (group.gameEndedIndex < this.indexInApp()) {
    //         return false;
    //     }

    //     // If Group has already finished, do not allow players to finish. 
    //     if (group.gameEndedIndex > this.indexInApp()) {
    //         return false;
    //     }

    //     // If do not need to wait for all players, return true.
    //     if (!this.waitToEnd) {
    //         return true;
    //     }

    //     // If any player is not finished playing, return false.
    //     for (let p in group.players) {
    //         let player = group.players[p];
    //         if (
    //             ['done', 'finished'].includes(player.status) == false
    //          && player.gameIndex === this.indexInApp()
    //         ) {
    //             return false;
    //         }
    //     }

    //     // Otherwise, return true.
    //     return true;
    // }

    playerEnd(player) {}

    playerEndInternal(player) {
        if (player.status < Status.READY_TO_END) {
            player.status = Status.READY_TO_END;
        }
        this.groupEndInternal(player.group);
        if (!this.canPlayerEnd(player)) {
            return;
        }
            player.status = Status.ENDED;
            this.recordPlayerEndTime(player);
            try {
                this.playerEnd(player);
            } catch(err) {
                global.jt.log(err + '\n' + err.stack);
            }
            player.startNextGame();
        player.emitUpdate2();
    }

    playerStartInternal(player) {
        player.game = this;
        player.updateGamePath();
        if (player.status === Status.UNSET) {
            player.status = Status.READY_TO_START;
        }
        this.groupStartInternal(player.group);
        if (!this.canPlayerStart(player)) {
            return;
        }
        if (this.canPlayerParticipate(player)) {
            if (player.status === Status.READY_TO_START) {
                player.participant().setPlayer(player);
                player.status = Status.STARTED;
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
            this.finishGame(true);
        }
        player.emitUpdate2();
    }

    canPlayerStartPeriods(player) {
        let group = player.group;
        for (let i in group.players) {
            let pl = group.players[i];
            if (pl.status < Status.STARTED) {
                return false;
            }
        }
        return true;
    }

    indexInApp() {
        if (this.superGame != null) {
            for (let i in this.superGame.subgames) {
                if (this.superGame.subgames[i].id === this.id) {
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
        let game = player.SubGame;

        if (player === null) {
            return false;
        }

        if (player.game.id !== data.fnName) {
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
        player.endGame(endForGroup);
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
