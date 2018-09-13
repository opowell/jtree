const Stage     = require('./Stage.js');
const Period    = require('./Period.js');
const Utils     = require('./Utils.js');
const App       = require('./App.js');
const fs        = require('fs-extra');
const path      = require('path');

/** Utility class for managing App objects on the server. */
class AppUtility {

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
    static load(json, session) {
        var index = json.sessionIndex;
        var app = new App(session, json.id, session.jt);

        // Run app code.
        var folder = path.join(session.jt.path, session.getOutputDir() + '/' + index + '_' + json.id);
        var appCode = Utils.readJS(folder + '/app.jtt');
        eval(appCode);

        //If there is already an app in place, save its stages and periods??
        if (session.apps.length > index-1) {
            var curApp = session.apps[index-1];
            /** app.stages = curApp.stages;*/
            app.periods = curApp.periods;
        }

        for (var j in json) {
            app[j] = json[j];
        }

        session.apps[index-1] = app;
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
    static load(json, session) {
        var index = json.sessionIndex;
        var app = new App(session, json.id, session.jt);

        // Run app code.
        var folder = path.join(session.jt.path, session.getOutputDir() + '/' + index + '_' + json.id);
        var appCode = Utils.readJS(folder + '/app.jtt');
        eval(appCode);

        //If there is already an app in place, save its stages and periods??
        if (session.apps.length > index-1) {
            var curApp = session.apps[index-1];
            /** app.stages = curApp.stages;*/
            app.periods = curApp.periods;
        }

        for (var j in json) {
            app[j] = json[j];
        }

        session.apps[index-1] = app;
    }

    //TODO
    static setContents(app, contents) {
        try {
            fs.writeFileSync('apps/' + app.id + '.jtt', contents);
        } catch (err) {
            console.log(err);
        }
    }

    //TODO
    setFileContents(app, filename, contents) {
        try {
            fs.writeFileSync('apps/' + app.id + '/' + filename, contents);
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * metaData - description
     *
     * @return {type}  description
     */
    static metaData(curApp) {
        var metaData = {};
        metaData.numPeriods = curApp.numPeriods;
        metaData.groupSize = curApp.groupSize;
        metaData.id = curApp.id;
        metaData.title = curApp.title;
        metaData.description = curApp.description;
        metaData.appPath = curApp.appPath;

        // var folder = path.join(curApp.jt.path, curApp.jt.settings.appFolders[0] + '/' + curApp.id);
        try {
            if (curApp.appPath.endsWith('.jtt') || curApp.appPath.endsWith('.js')) {
                metaData.appjs = Utils.readJS(curApp.appPath);
            } else {
                metaData.appjs = Utils.readJS(curApp.appPath + '/app.jtt');
            }
        } catch (err) {
            metaData.appjs = '';
        }

        try {
            metaData.clientHTML = Utils.readJS(curApp.appPath + '/client.html');
        } catch (err) {
            metaData.clientHTML = '';
        }

        var app = new App.new(null, curApp.appPath);

        metaData.stages = [];
        try {
            eval(metaData.appjs); // jshint ignore:line
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

    static reload(curApp) {
        var app = new App.new(curApp.session, curApp.appPath, curApp.jt);
        app.optionValues = curApp.optionValues;
        for (var opt in app.optionValues) {
            app[opt] = app.optionValues[opt];
        }
        var appCode = Utils.readJS(curApp.appPath);
        eval(appCode); // jshint ignore:line
        return app;
    }

    // TODO
    addStage(app, name) {
        var stage = app.newStage(name);
        var fn = 'apps/' + app.id + '/' + name + '.js';
        try {
            eval(Utils.readJS(fn)); // jshint ignore:line
        } catch (err) {
            console.log('Error evaluating ' + fn);
            console.log(err);
        }
    }

    static sendParticipantPage(curApp, req, res, participant) {

        // Load dynamic version of app to allow for live editing of stage html.
        // var app = this;
        var app = this.reload(curApp);

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
            html += `
            <span jt-status='playing' class='playing-screen'>
                ${app.activeScreen}
                <div>
                {{stages}}
                </div>
            </span>
            `;
        }

        if (!html.includes('{{stages}}')) {
            html += `
            <span jt-status='playing' class='playing-screen'>
                {{stages}}
            </span>
            `;
        }

        // Load stage contents, if any.
        var stagesHTML = '';
        for (var i=0; i<app.stages.length; i++) {
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
                stagesHTML += app.parseStageTag(stage, app.stageContentStart)  + '\n';
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
            var text = html.substring(ind1+markerStart.length, ind2);
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

    saveOutput(app, fn) {

        //Create headers
        var appsHeaders = [];
        var appsSkip = ['id'];
        var appFields = app.outputFields();
        Utils.getHeaders(appFields, appsSkip, appsHeaders);

        var periodHeaders = [];
        var groupHeaders = [];
        var playerHeaders = [];
        var periodSkip = ['id'];
        var groupSkip = ['id', 'allPlayersCreated'];
        var playerSkip = ['status', 'stageIndex', 'id', 'participantId'];
        var groupTables = [];
        var groupTableHeaders = {};
        for (let i=0; i<app.periods.length; i++) {
            var period = app.periods[i];
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
                for (let k=0; k<group.players.length; k++) {
                    var player = group.players[k];
                    var fieldsToOutput = player.outputFields();
                    Utils.getHeaders(fieldsToOutput, playerSkip, playerHeaders);
                }
            }
        }
        var participantHeaders = [];
        var participantSkip = ['id', 'points', 'periodIndex', 'appIndex'];
        for (let i in app.session.participants) {
            var participant = app.session.participants[i];
            var participantFields = participant.outputFields();
            Utils.getHeaders(participantFields, participantSkip, participantHeaders);
        }

        //Create data
        var appsText = [];
        appsText.push('id,' + appsHeaders.join(','));
        var newLine = app.id + ',';
        for (var h=0; h<appsHeaders.length; h++) {
            var header = appsHeaders[h];
            if (app[header] !== undefined) {
                newLine += JSON.stringify(app[header]);
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
        for (let i=0; i<app.periods.length; i++) {
            let period = app.periods[i];
            let newLine = period.id + ',';
            newLine = app.appendValues(newLine, periodHeaders, period);
            periodText.push(newLine);
            for (let j=0; j<period.groups.length; j++) {
                let group = period.groups[j];
                let newLine = period.id + ',' + group.id + ',';
                newLine = app.appendValues(newLine, groupHeaders, group);
                groupText.push(newLine);
                for (let k=0; k<group.players.length; k++) {
                    let player = group.players[k];
                    let participant = player.participant;
                    let newLine = period.id + ',' + group.id + ',' + participant.id + ',';
                    newLine = app.appendValues(newLine, playerHeaders, player);
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
        var pIds = Object.keys(app.session.participants).sort();
        for (let i in pIds) {
            let participant = app.session.participants[pIds[i]];
            let newLine = participant.id + ',' + participant.points();
            if (participantHeaders.length > 0) {
                newLine += ',';
            }
            for (let h=0; h<participantHeaders.length; h++) {
                let header = participantHeaders[h];
                if (participant[header] !== undefined) {
                    newLine += participant[header];
                }
                if (h<participantHeaders.length-1) {
                    newLine += ',';
                }
            }
            participantText.push(newLine);
        }

        // WRITE OUTPUT
        fs.appendFileSync(fn, 'APP ' + app.indexInSession() + '_' + app.id + '\n');
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
            let tableHeaders = groupTableHeaders[table];
            groupTableText.push('period.id,group.id,id,' + tableHeaders.join(','));
            for (var i=0; i<app.periods.length; i++) {
                let period = app.periods[i];
                for (let j=0; j<period.groups.length; j++) {
                    let group = period.groups[j];
                    var tabRows = group[table].rows;
                    for (var r=0; r<tabRows.length; r++) {
                        var row = tabRows[r];
                        let newLine = period.id + ',' + group.id + ',' + row.id + ',';
                        newLine = app.appendValues(newLine, tableHeaders, row);
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


}

var exports = module.exports = {};
exports.metaData            = AppUtility.metaData;
exports.sendParticipantPage = AppUtility.sendParticipantPage;
exports.reload              = AppUtility.reload;
