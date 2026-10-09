const fs        = require('fs-extra');
const path      = require('path');
const Utils     = require('../Utils.js');

/**
 * Messages that the server listens for from clients.
 * Includes try-catch and notification (via console) of receipt.
 * Corresponds to client/internal/clients/admin/shared/msgsToServer.js
 */
class Msgs {

    /*
     * Returns a new instance of this class.
     *
     * @param  {type} jt description
     * @return {type}    description
     */
    constructor(jt) {
        this.jt = jt;
    }

    /*
     * addParticipants - Adds the specified number of participants to the session.
     *
     * @param  {type} d      an object with the following fields,
     * @param {string} d.sId the id of the sessions
     * @param {number} d.number the number of participants to add.
     * @param  {Socket} socket the client socket who sent the message.
     */
    addParticipants(d, socket) {
        var session = this.jt.data.getSession(d.sId);
        var num = parseInt(d.number);
        session.addParticipants(num);
    }

    appSaveFileContents(d, socket) {
        var app = this.jt.data.app(d.aId, d.options);
        app.setFileContents(d.content);
        app = app.reload();
        this.jt.data.appsMetaData[d.aId] = app.metaData();
    }

    getClients(data, socket) {
        let clients = this.jt.data.getClients(data.sessionId);
        var message = {cb: data.cb, clients: clients};
        socket.emit('dataMessage', message);
    }

    /**
     * getAppMetadatas - Get an array of the app metadatas found on the server.
     *
     * @param  {String} cb     The callback to execute when returning the metadatas to the client.
     * @param  {Socket} socket The socket which asked for the data.
     * @return {Message}        A message object, which includes callback (cb) and data fields.
     */
    getAppMetadatas(cb, socket) {
        var apps = this.jt.data.getApps();
        var metadatas = [];
        for (var i in apps) {
            metadatas.push(apps[i].metaData());
        }
        var message = {cb: cb, metadatas: metadatas};
        this.jt.io.to('socket_' + socket.id).emit('dataMessage', message);
    }

    /**
     * getApp - Return the app with identifier data.appId.
     *
     * @param  {String} data.appId   Identifier of the app.
     * @param  {Socket} socket The socket which asked for the app.
     * @return {Message}        A message object, which includes callback (cb) and data fields.
     */
    getApp(data, socket) {
        data.app = this.jt.data.getApp(data.appPath).shellWithChildren();
        this.jt.io.to('socket_' + socket.id).emit('dataMessage', data);
    }

    setAppContents(data, socket) {
        fs.writeFileSync(path.join(this.jt.path, data.appPath), data.content);
        var outMessage = {};
        outMessage.appPath = data.appPath;
        outMessage.cb   = data.cb;
        outMessage.app  = this.jt.data.getApp(data.appPath).shellWithChildren();
        this.jt.io.to('socket_' + socket.id).emit('dataMessage', outMessage);
    }

    setSessionId(data, socket) {
        var session = this.jt.data.getSession(data.oldId);
        session.setId(data.newId);
        this.jt.io.to('socket_' + socket.id).emit('setSessionId', data);
    }

    renameApp(data, socket) {
        fs.renameSync(data.originalId, data.newId);
        this.jt.data.appsMetaData[data.newId] = this.jt.data.appsMetaData[data.originalId];
        delete this.jt.data.appsMetaData[data.originalId];
        this.jt.data.appsMetaData[data.newId].appPath = data.newId;
        this.jt.data.appsMetaData[data.newId].id = data.newId;
        let sep = '\\';
        if (data.newId.includes('/')) {
            sep = '/';
        }
        let lastFolderChar = data.newId.lastIndexOf(sep);
        this.jt.data.appsMetaData[data.newId].shortId = data.newId.substring(lastFolderChar+1);
    }

    /*
     * setNumParticipants - Sets the specified number of participants to the session.
     *
     * @param  {type} d      an object with the following fields,
     * @param {string} d.sId the id of the sessions
     * @param {number} d.number the number of participants for the session.
     * @param  {Socket} socket the client socket who sent the message.
     */
    setNumParticipants(d, socket) {
        var session = this.jt.data.getSession(d.sId);
        var num = parseInt(d.number);
        session.setNumParticipants(num);
    }

    // setSessionOption(d, socket) {
    //     let session = this.jt.data.getSession(d.sessionId);
        
    // }

    resetSession(d, socket) {
        let session = this.jt.data.getSession(d.sId);
        session.reset();
        this.jt.io.to('socket_' + socket.id).emit('openSession', session.shellWithChildren());
        this.jt.data.lastOpenedSession = session;
    }

    appAddStage(d, socket) {
        var session = this.jt.data.getApp(d.aId);
    }

    deleteParticipant(d, socket) {
        var session = this.jt.data.getSession(d.sId);
        session.deleteParticipant(d.pId);
    }

    saveOutput(sId, socket) {
        var session = this.jt.data.getSession(sId);
        session.saveOutput();
    }

    setDefaultAdminPwd(d, sock) {
        this.jt.settings.setDefaultAdminPwd(d.curPwd, d.newPwd);
    }

    setUsersMode(d, sock) {
        this.jt.settings.setMultipleUsers(d);
    }

    createSessionAndAddApp(msgData, sock) {
        var appPath = msgData.appId;
        var options = msgData.options;
        var session = this.jt.data.createSession(msgData.userId);
        session.resume();
        this.jt.data.sessions.push(session);
        var d = {sId: session.id, appPath: appPath, options: options};
        this.sessionAddApp(d);
        this.openSession(session.id, sock);
    }

    /**
     * Creates and starts a session from an oTree project's session config (the oTree admin's
     * "Create session"): {configId (a queue id, settings.py#name), numParticipants, config
     * (values to change in session.config), userId}. Opens it for the admin who asked.
     */
    otreeCreateSession(d, sock) {
        var session = this.jt.data.createSession(d.userId);
        session.resume();
        this.jt.data.sessions.push(session);
        session.addApp(d.configId);
        if (session.otreeConfig != null && d.config != null) {
            Object.assign(session.otreeConfig, d.config);
            if (d.config.participation_fee != null) session.showUpFee = Number(d.config.participation_fee);
            if (d.config.real_world_currency_per_point != null) session.exchangeRate = Number(d.config.real_world_currency_per_point);
        }
        var n = parseInt(d.numParticipants);
        session.setNumParticipants(n > 0 ? n : (session.suggestedNumParticipants || 1));
        session.save();
        session.start();
        this.jt.socketServer.emitToAdmins('addSession', session.shell());
        if (sock != null) {
            this.openSession(session.id, sock);
        }
        return session;
    }

    /**
     * Sends the admin who asked where each participant of a session is (the oTree admin's
     * monitor): {sessionId, rows: [{code, label, app, round, page, status, secondsOnPage, payoff, payment}]}.
     */
    otreeMonitor(sessionId, sock) {
        var session = this.jt.data.session(sessionId);
        if (session == null || sock == null) {
            return;
        }
        var rows = Object.values(session.participants).map((p) => {
            var player = p.player;
            var row = { code: p.id, label: p.label || '', app: '', round: null, page: '', status: 'not started',
                secondsOnPage: null, payoff: p.points(), payment: p.payment() };
            if (p.isFinishedSession() && p.appIndex > 0) {
                row.status = 'finished';
            } else if (player != null) {
                row.app = player.app().shortId;
                row.round = player.group.period.id;
                row.page = player.stage != null ? player.stage.id : '';
                row.status = player.status;
                var start = player.stage != null ? player['timeStart_' + player.stage.id] : null;
                if (start != null) {
                    row.secondsOnPage = Math.round((Date.now() - Utils.dateFromStr(start).getTime()) / 1000);
                }
            }
            return row;
        });
        this.jt.io.to('socket_' + sock.id).emit('otreeMonitor', { sessionId: sessionId, rows: rows });
    }

    /**
     * Sends the admin who asked the admin reports of a session's oTree apps (their
     * admin_report.html): {sessionId, reports: [{app, round, html}]}, for the rounds started.
     */
    otreeReports(sessionId, sock) {
        var session = this.jt.data.session(sessionId);
        if (session == null || sock == null) {
            return;
        }
        var reports = [];
        var bridge = require('../dialects/otree/runtime.js');
        var otreeStatic = require('../dialects/otree/static.js');
        for (var app of session.apps) {
            if (app.otree == null || !bridge.getBridge().has_admin_report(app.otree.pkg)) {
                continue;
            }
            app.periods.forEach((period) => {
                if (period == null) return;
                var html;
                try {
                    html = bridge.getBridge().admin_report(app.otree.pkg, period, otreeStatic.urlFor(this.jt.basePath, app.otree.pkg));
                } catch (err) {
                    html = '<div class="alert alert-danger">The report could not be shown: ' + Utils.escapeHTML(String(err.message).trim().split('\n').pop()) + '</div>';
                }
                reports.push({ app: app.shortId, round: period.id, html: html });
            });
        }
        this.jt.io.to('socket_' + sock.id).emit('otreeReports', { sessionId: sessionId, reports: reports });
    }

    /**
     * Converts an oTree app of the catalogue to a jtree app (dialects/otree/convert.js), in a
     * folder beside it (<app>-jtree, or -jtree-2, ...), which joins the catalogue; tells the
     * admin who asked: otreeConverted {appPath, outPath, level, report} or {appPath, error}.
     * Returns a promise of that.
     */
    otreeConvertApp(d, sock) {
        var appPath = d != null ? d.appPath : null;
        var app = appPath != null ? this.jt.data.apps[appPath] : null;
        var reply = (result) => {
            if (sock != null) this.jt.io.to('socket_' + sock.id).emit('otreeConverted', result);
            return result;
        };
        if (app == null || app.otree == null) {
            return Promise.resolve(reply({ appPath: appPath, error: 'not an oTree app of the catalogue' }));
        }
        var dir = path.dirname(appPath);
        var outPath = dir + '-jtree';
        for (var n = 2; fs.existsSync(outPath); n++) {
            outPath = dir + '-jtree-' + n;
        }
        var { convertApp } = require('../dialects/otree/convert.js');
        return convertApp(dir, outPath).then((result) => {
            this.jt.data.reloadApps();
            this.jt.socketServer.refreshAdmins();
            return reply({ appPath: appPath, outPath: outPath, level: result.level, report: result.report });
        }, (err) => {
            fs.removeSync(outPath);
            return reply({ appPath: appPath, error: String(err.message || err) });
        });
    }

    /**
     * Converts a z-Tree treatment of the catalogue to a jtree app (dialects/ztree/convert.js), in a
     * folder beside it (<name>-jtree, or -jtree-2, ...), which joins the catalogue; tells the admin
     * who asked: ztreeConverted {appPath, outPath, level, report} or {appPath, error}.
     */
    ztreeConvertApp(d, sock) {
        var appPath = d != null ? d.appPath : null;
        var app = appPath != null ? this.jt.data.apps[appPath] : null;
        var reply = (result) => {
            if (sock != null) this.jt.io.to('socket_' + sock.id).emit('ztreeConverted', result);
            return result;
        };
        if (app == null || app.ztree == null || !/\.ztt$/i.test(appPath)) {
            return Promise.resolve(reply({ appPath: appPath, error: 'not a z-Tree treatment (.ztt) of the catalogue' }));
        }
        var base = appPath.replace(/\.ztt$/i, '');
        var outPath = base + '-jtree';
        for (var n = 2; fs.existsSync(outPath); n++) {
            outPath = base + '-jtree-' + n;
        }
        var { convertTreatmentFile } = require('../dialects/ztree/convert.js');
        return convertTreatmentFile(appPath, outPath).then((result) => {
            this.jt.data.loadAppDir(outPath);
            this.jt.socketServer.refreshAdmins();
            return reply({ appPath: appPath, outPath: outPath, level: result.level, report: result.report });
        }, (err) => {
            fs.removeSync(outPath);
            return reply({ appPath: appPath, error: String(err.message || err) });
        });
    }

    /**
     * Sends the admin who asked the z-Tree tables of a session's z-Tree treatments:
     * ztreeTables {sessionId, apps: {<index in the session, from 1>: {periods: [{globals,
     * subjects, summary, contracts}], session, current (period index)}}}.
     */
    ztreeTables(sessionId, sock) {
        var session = this.jt.data.session(sessionId);
        if (session == null || sock == null) {
            return;
        }
        var apps = {};
        session.apps.forEach((app, i) => {
            var run = app.ztreeRun;
            if (run == null) return;
            var plain = (records) => records.map((r) => {
                var out = {};
                for (var k in r) {
                    if (k === '_id') continue;
                    var v = r[k];
                    out[k] = v != null && typeof v === 'object' ? (v.zArray ? v.values.join(' ') : null) : v;
                }
                return out;
            });
            apps[i + 1] = {
                periods: run.periods.map((p) => p == null ? null : {
                    globals: plain([p.globals]), subjects: plain(p.subjects), summary: plain([p.summary]), contracts: plain(p.contracts),
                }),
                session: plain(run.sessionRecords),
                current: run.periods.length - 1,
            };
        });
        this.jt.io.to('socket_' + sock.id).emit('ztreeTables', { sessionId: sessionId, apps: apps });
    }

    createApp(appId, sock) {
        var app = this.jt.data.createApp(appId);
        if (app !== null) {
            this.jt.socketServer.emitToAdmins('createApp', app);
        }
        return app;
    }

    createAppFromFile(data, sock) {
        var app = this.jt.data.createApp(data.fn);
        app.setContents(data.contents);
        if (app !== null) {
            this.jt.socketServer.emitToAdmins('createApp', app);
        }
        return app;
    }

    updateAppPreview(d, socket) {
        var app = this.jt.data.app(d.appId, d.options);
        this.jt.io.to('socket_' + socket.id).emit('updateAppPreview', app.shellWithChildren());
    }

    /** Older name for {@link Msgs#createSessionAndAddApp}, from when queues were not apps. */
    startSessionFromQueue(data, sock) {
        this.createSessionAndAddApp({appId: data.qId, options: data.options, userId: data.userId}, sock);
    }

    createRoom(id, sock) {
        var room = this.jt.data.createRoom(id);
        if (room !== null) {
            this.jt.socketServer.emitToAdmins('createRoom', room.shell());
        }
        return room;
    }

    createUser(data, sock) {
        var user = this.jt.data.createUser(data.id, data.type);
        if (user !== null) {
            this.jt.socketServer.emitToAdmins('createUser', user.shell());
        }
        return user;
    }

    createQueue(id, sock) {
        var queue = this.jt.data.createQueue(id);
        if (queue !== null) {
            this.jt.socketServer.emitToAdmins('createQueue', queue.shell());
        }
        return queue;
    }

    saveRoom(room, sock) {
        this.jt.data.saveRoom(room);
//        this.jt.socketServer.emitToAdmins('saveRoom', room);a
    }

    deleteQueue(id, sock) {
        this.jt.data.deleteApp(id);
        this.jt.socketServer.emitToAdmins('deleteQueue', id);
        this.jt.socketServer.emitToAdmins('deleteApp', id);
    }

    deleteApp(id, sock) {
        this.jt.data.deleteApp(id);
        this.jt.socketServer.emitToAdmins('deleteApp', id);
    }

    saveAppHTML(app, sock) {
        this.jt.data.saveApp(app);
        var appInfo = this.jt.data.apps[app.id];
        appInfo.origId = app.origId;
        this.jt.socketServer.emitToAdmins('appSaved', appInfo);
    }

    deleteSession(d) {
        var mypath = path.join(this.jt.path, this.jt.settings.sessionsFolder, d);
        for (var i in this.jt.data.sessions) {
            var session = this.jt.data.sessions[i];
            if (d === session.id) {
                if (session.autoSaveTimer !== null) {
                    clearInterval(session.autoSaveTimer);
                }
                if (session.fileStream !== null) {
                    session.fileStream.end();
                }
                this.jt.data.sessions.splice(i, 1);
                break;
            }
        }
        // TODO: Does not delete on Windows.
        // Workaround: delete empty folders on Data.loadSessions.
        try {
            if (fs.existsSync(mypath)) {
                fs.removeSync(mypath);
            }
        } catch (err) {}

        this.jt.socketServer.emitToAdmins('deleteSession', d);
    }

    messages(data, sock) {
        for (var i=0; i<data.length; i++) {
            var msgName = data[i].msgName;
            var msgData = data[i].msgData;
            this.jt.log('received message ' + msgName + ': ' + JSON.stringify(msgData));
            if (!Msgs.names().includes(msgName)) {
                this.jt.log('ignoring unknown message ' + msgName);
                continue;
            }
            this[msgName](msgData, sock);
        }
    }

    openSession(sId, socket) {
        var session = Utils.findByIdWOJQ(this.jt.data.sessions, sId);
        if (session !== null && session !== undefined) {
            socket.join(session.roomId());
            this.jt.io.to('socket_' + socket.id).emit('openSession', session.shellWithChildren());
            this.jt.data.lastOpenedSession = session;
            // this.reloadClients();
            // Called from client-side.
        }
    }

    reloadApps(msg, socket) {
        this.jt.data.reloadApps();
        if (msg == null) {
            msg = {
                userId: ''
            }
        }
        this.jt.socketServer.refreshAdmin(null, 'socket_' + socket.id, msg.userId);
    }

    reloadClients() {
        const clients = this.jt.data.participantClients;
        for (let i=0; i<clients.length; i++) {
            try {
                clients[i].reload();
            } catch (err) {}
        }
    }


    /**
     * sessionAddApp - Add an app to the given session.
     *
     * @param  {Object} d An object containing the session ID (sId), the app id (appPath), and options for the app (options).
     * @return {type}
     */
    sessionAddApp(data, socket) {
        if (data.appPath == null) {
            data.appPath = data.appId;
        }
        this.jt.data.getSession(data.sId).addApp(data.appPath, data.options);
    }

    sessionAddUser(d) {
        this.jt.data.getSession(d.sId).addUser(d.uId);
    }

    /** Older name for {@link Msgs#sessionAddApp}, from when queues were not apps. */
    sessionAddQueue(d) {
        this.jt.data.getSession(d.sId).addApp(d.qId);
    }

    /** Opens a session in a room: {roomId, sessionId} (see Room#openSession). */
    roomOpenSession(d) {
        var room = this.jt.data.room(d.roomId);
        var session = this.jt.data.session(d.sessionId);
        if (room != null && session != null) {
            room.openSession(session);
        }
    }

    roomAddApp(d) {
        this.jt.data.room(d.roomId).addApp(d.appId);
    }

    queueAddApp(d) {
        this.jt.data.queue(d.queueId).addApp(d.appId, d.options);
        var queue = this.jt.data.reloadQueue(d.queueId);
        this.jt.socketServer.emitToAdmins('queueAddApp', {queueId: queue.id, app: queue.apps[queue.apps.length - 1]});
    }

    /*
     * Advance all participants who have not started the session yet. Calls {@link Session#advanceSlowest}.
     *
     * @param  {string} id The id of the session.
     */
    sessionStart(id) {
        var session = Utils.findByIdWOJQ(this.jt.data.sessions, id);
        if (session !== null) {
            session.start();
        }
    }

    /*
     * Advances the slowest participants in the given session. Calls {@link Session#advanceSlowest}.
     *
     * @param  {string} id The id of the session.
     */
    sessionAdvanceSlowest(id) {
        var session = Utils.findByIdWOJQ(this.jt.data.sessions, id);
        if (session !== null) {
            session.advanceSlowest();
        }
        session.emitParticipantUpdates();
    }

    sessionCreate(userId, sock) {
        var session = this.jt.data.createSession(userId);
        session.resume();
        this.jt.data.sessions.push(session);
        this.openSession(session.id, sock);
    }

    sessionDeleteApp(d) {
        var session = Utils.findByIdWOJQ(this.jt.data.sessions, d.sId);
        if (session !== null) {
            session.deleteApp(d);
        }
    }

    setAllowAdminPlay(d, socket) {
        let session = Utils.findByIdWOJQ(this.jt.data.sessions, d.sessionId);
        if (session != null) {
            session.setAllowAdminPlay(d.val);
        }
    }

    setSessionAppOption(d, socket) {
        var session = Utils.findByIdWOJQ(this.jt.data.sessions, d.sId);
        if (session !== null) {
            session.setOption(d.name, d.value);
        }
    }

    setSessionAppOptions(d, socket) {
        var session = Utils.findByIdWOJQ(this.jt.data.sessions, d.sId);
        if (session !== null) {
            for (var i in d.options) {
                session.setAppOption(d.appId, d.index, i, d.options[i]);
            }
        }
    }

    sessionPause(id, sock) {
        var session = Utils.findByIdWOJQ(this.jt.data.sessions, id);
        if (session !== null) {
            session.pause();
        }
    }

    sessionResume(id, sock) {
        var session = Utils.findByIdWOJQ(this.jt.data.sessions, id);
        if (session !== null) {
            session.resume();
        }
    }

    setAllowNewParts(d, socket) {
        var session = this.jt.data.getSession(d.sId);
        session.setAllowNewParts(d.value);
    }

    setCaseSensitiveLabels(d, socket) {
        var session = this.jt.data.getSession(d.sId);
        session.setCaseSensitiveLabels(d.value);
    }

    setAutoplay(data) {
        let session = this.jt.data.session(data.sId);
        if (session !== null) {
            let part = session.participants[data.pId];
            if (part !== undefined) {
                part.emit('setAutoplay', {val: data.val});
            } else {
                // console.log('Msgs.setAutoplay: undefined participant ' + data.pId);
            }
        }
    }

    setAutoplayForAll(data) {
        let session = this.jt.data.session(data.sId);
        if (session !== null) {
            for (let i in session.participants) {
                session.participants[i].emit('setAutoplay', {val: data.val});
            }
        }
    }

    setAutoplayDelay(data) {
        let session = this.jt.data.session(data.sId);
        if (session !== null) {
            for (let i in session.participants) {
                session.participants[i].emit('setAutoplayDelay', {val: data.val});
            }
        }
    }

    /*
     * startTreatment - Appends an app to the session and starts it at once for
     * the given participants (all of them when none are given), the way z-Tree
     * starts a treatment for the selected clients. Participants still playing
     * an earlier app are left where they are.
     *
     * @param {string} d.sId the id of the session.
     * @param {string} d.appId the app to start.
     * @param {Object} [d.options] options for the app.
     * @param {string[]} [d.pIds] the participants to start it for.
     */
    startTreatment(d) {
        let session = this.jt.data.getSession(d.sId);
        let app = session.addApp(d.appId, d.options || {});
        if (app == null) {
            return;
        }
        let appIndex = session.apps.length;
        let pIds = d.pIds != null && d.pIds.length > 0 ? d.pIds : Object.keys(session.participants);
        if (!session.started) {
            session.started = true;
            session.emit('dataUpdate', [{roomId: session.roomId(), field: 'started', value: true}]);
        }
        for (let i in pIds) {
            let participant = session.participants[pIds[i]];
            if (participant == null || participant.player != null) {
                continue;
            }
            participant.appIndex = appIndex;
            participant.save();
            session.participantBeginApp(participant);
        }
        session.emitParticipantUpdates();
    }

    /*
     * leaveStage - Moves the given participants out of the stage they are
     * playing, as if they had submitted it. See {@link Player#endStage}.
     *
     * @param {string} d.sId the id of the session.
     * @param {string[]} d.pIds the participants.
     */
    leaveStage(d) {
        let session = this.jt.data.getSession(d.sId);
        for (let i in d.pIds) {
            let participant = session.participants[d.pIds[i]];
            if (participant != null && participant.player != null) {
                participant.player.endStage(true);
            }
        }
        session.emitParticipantUpdates();
    }

    /*
     * setStopAfterPeriod - Ends an app of the session once its current period
     * is over, instead of going on to the next period.
     *
     * @param {string} d.sId the id of the session.
     * @param {number} d.appIndex the app's (1-based) position in the session.
     * @param {boolean} d.value whether to stop.
     */
    setStopAfterPeriod(d) {
        let session = this.jt.data.getSession(d.sId);
        let app = session.apps[d.appIndex - 1];
        if (app != null) {
            app.stopAfterPeriod = d.value === true;
        }
    }

}

/** The messages admins may send: the methods above. */
Msgs.names = function() {
    return Object.getOwnPropertyNames(Msgs.prototype).filter((name) => {
        return name !== 'constructor' && typeof Msgs.prototype[name] === 'function';
    });
};

var exports = module.exports = {};
exports.new = Msgs;
exports.names = Msgs.names;
