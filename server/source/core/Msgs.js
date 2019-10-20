const fs        = require('fs-extra');
const path      = require('path');
const Utils     = require('../Utils.js');
const {stringify} = require('flatted/cjs');

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
        var session = global.jt.data.getSession(d.sId);
        var num = parseInt(d.number);
        session.addParticipants(num);
    }

    appSaveFileContents(d, socket) {
        var app = global.jt.data.app(d.aId, d.options);
        app.setFileContents(d.content);
        app = app.reload();
        global.jt.data.appsMetaData[d.aId] = app.metaData();
    }

    getClients(data, socket) {
        let clients = global.jt.data.getClients(data.sessionId);
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
        var apps = global.jt.data.getApps();
        var metadatas = [];
        for (var i in apps) {
            metadatas.push(apps[i].metaData());
        }
        var message = {cb: cb, metadatas: metadatas};
        global.jt.io.to('socket_' + socket.id).emit('dataMessage', message);
    }

    /**
     * getApp - Return the app with identifier data.appId.
     *
     * @param  {String} data.appId   Identifier of the app.
     * @param  {Socket} socket The socket which asked for the app.
     * @return {Message}        A message object, which includes callback (cb) and data fields.
     */
    getApp(data, socket) {
        data.app = global.jt.data.getApp(data.appPath);
        global.jt.io.to('socket_' + socket.id).emit('dataMessage', data);
    }

    setAppContents(data, socket) {
        fs.writeFileSync(path.join(global.jt.path, data.appPath), data.content);
        var outMessage = {};
        outMessage.appPath = data.appPath;
        outMessage.cb   = data.cb;
        outMessage.app  = global.jt.data.getApp(data.appPath);
        global.jt.io.to('socket_' + socket.id).emit('dataMessage', outMessage);
    }

    setSessionId(data, socket) {
        var session = global.jt.data.getSession(data.oldId);
        session.setId(data.newId);
        global.jt.io.to('socket_' + socket.id).emit('setSessionId', data);
    }

    renameApp(data, socket) {
        fs.renameSync(data.originalId, data.newId);
        global.jt.data.appsMetaData[data.newId] = global.jt.data.appsMetaData[data.originalId];
        delete global.jt.data.appsMetaData[data.originalId];
        global.jt.data.appsMetaData[data.newId].appPath = data.newId;
        global.jt.data.appsMetaData[data.newId].id = data.newId;
        let sep = '\\';
        if (data.newId.includes('/')) {
            sep = '/';
        }
        let lastFolderChar = data.newId.lastIndexOf(sep);
        global.jt.data.appsMetaData[data.newId].shortId = data.newId.substring(lastFolderChar+1);
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
        var session = global.jt.data.getSession(d.sId);
        var num = parseInt(d.number);
        session.setNumParticipants(num);
    }

    resetSession(d, socket) {
        let session = global.jt.data.getSession(d.sId);
        session.reset();
        global.jt.io.to('socket_' + socket.id).emit('openSession', stringify(session));
        global.jt.data.lastOpenedSession = session;
    }

    appAddStage(d, socket) {
        var session = global.jt.data.getApp(d.aId);
    }

    deleteParticipant(d, socket) {
        var session = global.jt.data.getSession(d.sId);
        session.deleteParticipant(d.pId);
    }

    saveOutput(sId, socket) {
        var session = global.jt.data.getSession(sId);
        session.saveOutput();
    }

    setDefaultAdminPwd(d, sock) {
        global.jt.settings.setDefaultAdminPwd(d.curPwd, d.newPwd);
    }

    setUsersMode(d, sock) {
        global.jt.settings.setMultipleUsers(d);
    }

    createSessionAndAddApp(msgData, sock) {
        var appPath = msgData.appId;
        var options = msgData.options;
        var session = global.jt.data.createSession(msgData.userId);
        session.resume();
        global.jt.data.sessions.push(session);
        var d = {sId: session.id, appPath: appPath, options: options};
        this.sessionAddApp(d);
        this.openSession(session.id, sock);
    }

    createApp(appId, sock) {
        var app = global.jt.data.createApp(appId);
        if (app !== null) {
            global.jt.socketServer.emitToAdmins('createApp', app);
        }
        return app;
    }

    createAppFromFile(data, sock) {
        var app = global.jt.data.createApp(data.fn);
        app.setContents(data.contents);
        if (app !== null) {
            global.jt.socketServer.emitToAdmins('createApp', app);
        }
        return app;
    }

    updateAppPreview(d, socket) {
        var app = global.jt.data.app(d.appId, d.options);
        global.jt.io.to('socket_' + socket.id).emit('updateAppPreview', app);
    }

    startSessionFromQueue(data, sock) {
        var session = global.jt.data.createSession(data.userId);
        session.resume();
        global.jt.data.sessions.push(session);
        var queue = global.jt.data.queue(data.qId);
        if (queue.code == null) {
            for (var a in queue.apps) {
                var app = queue.apps[a];
                var d = {sId: session.id, appPath: app.appId, options: app.options};
                this.sessionAddApp(d);
            }
        } else {
            session.queuePath = path.dirname(queue.id);
            eval(queue.code);
        }
        this.openSession(session.id, sock);
    }

    createRoom(id, sock) {
        var room = global.jt.data.createRoom(id);
        if (room !== null) {
            global.jt.socketServer.emitToAdmins('createRoom', room);
        }
        return room;
    }

    createUser(data, sock) {
        var user = global.jt.data.createUser(data.id, data.type);
        if (user !== null) {
            global.jt.socketServer.emitToAdmins('createUser', user);
        }
        return user;
    }

    createQueue(id, sock) {
        var queue = global.jt.data.createQueue(id);
        if (queue !== null) {
            global.jt.socketServer.emitToAdmins('createQueue', queue);
        }
        return queue;
    }

    saveRoom(room, sock) {
        global.jt.data.saveRoom(room);
//        global.jt.socketServer.emitToAdmins('saveRoom', room);a
    }

    deleteQueue(id, sock) {
        global.jt.data.deleteQueue(id);
        global.jt.socketServer.emitToAdmins('deleteQueue', id);
    }

    deleteAppFromQueue(qId, aId, appIndex) {
        var queue = global.jt.data.queue(qId);
        queue.deleteApp(aId, appIndex);
        global.jt.socketServer.emitToAdmins('deleteAppFromQueue', {qId: qId, aId: aId, appIndex: appIndex});
    }

    deleteApp(id, sock) {
        global.jt.data.deleteApp(id);
        global.jt.socketServer.emitToAdmins('deleteApp', id);
    }

    saveAppHTML(app, sock) {
        global.jt.data.saveApp(app);
        var appInfo = global.jt.data.apps[app.id];
        appInfo.origId = app.origId;
        global.jt.socketServer.emitToAdmins('appSaved', appInfo);
    }

    deleteSession(d) {
        var mypath = path.join(global.jt.path, global.jt.settings.sessionsFolder, d);
        for (var i in global.jt.data.sessions) {
            var session = global.jt.data.sessions[i];
            if (d === session.id) {
                if (session.autoSaveTimer !== null) {
                    clearInterval(session.autoSaveTimer);
                }
                if (session.fileStream !== null) {
                    session.fileStream.end();
                }
                global.jt.data.sessions.splice(i, 1);
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

        global.jt.socketServer.emitToAdmins('deleteSession', d);
    }

    messages(data, sock) {
        for (var i=0; i<data.length; i++) {
            var msgName = data[i].msgName;
            var msgData = data[i].msgData;
            // global.jt.log('received message ' + msgName + ': ' + JSON.stringify(msgData));
            eval('this.' + msgName + "(msgData, sock)");
        }
    }

    openSession(sId, socket) {
        var session = Utils.findById(global.jt.data.sessions, sId);
        if (session !== null && session !== undefined) {
            socket.join(session.roomId());
            global.jt.io.to('socket_' + socket.id).emit('openSession', stringify(session));
            global.jt.data.lastOpenedSession = session;
            // this.reloadClients();
            // Called from client-side.
        }
    }

    reloadApps(msg, socket) {
        global.jt.data.reloadApps();
        if (msg == null) {
            msg = {
                userId: ''
            }
        }
        global.jt.socketServer.refreshAdmin(null, 'socket_' + socket.id, msg.userId);
    }

    reloadClients() {
        const clients = global.jt.data.participantClients;
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
        global.jt.data.getSession(data.sId).addApp(data.appPath, data.options);
    }

    sessionAddUser(d) {
        global.jt.data.getSession(d.sId).addUser(d.uId);
    }

    sessionAddQueue(d) {
        global.jt.data.getSession(d.sId).addQueue(d.qId);
    }

    roomAddApp(d) {
        global.jt.data.room(d.roomId).addApp(d.appId);
    }

    queueAddApp(d) {
        global.jt.data.queue(d.queueId).addApp(d.appId, d.options);
    }

    /*
     * Advance all participants who have not started the session yet. Calls {@link Session#advanceSlowest}.
     *
     * @param  {string} id The id of the session.
     */
    sessionStart(id) {
        var session = Utils.findById(global.jt.data.sessions, id);
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
        var session = Utils.findById(global.jt.data.sessions, id);
        if (session !== null) {
            session.advanceSlowest();
        }
        session.emitParticipantUpdates();
    }

    sessionCreate(userId, sock) {
        var session = global.jt.data.createSession(userId);
        session.resume();
        global.jt.data.sessions.push(session);
        this.openSession(session.id, sock);
    }

    sessionDeleteApp(d) {
        var session = Utils.findById(global.jt.data.sessions, d.sId);
        if (session !== null) {
            session.deleteApp(d);
        }
    }

    setAllowAdminPlay(d, socket) {
        let session = Utils.findById(global.jt.data.sessions, d.sessionId);
        if (session != null) {
            session.setAllowAdminPlay(d.val);
        }
    }

    setSessionAppOption(d, socket) {
        var session = Utils.findById(global.jt.data.sessions, d.sId);
        if (session !== null) {
            session.setAppOption(d.appId, d.i, d.name, d.value);
        }
    }

    setSessionAppOptions(d, socket) {
        var session = Utils.findById(global.jt.data.sessions, d.sId);
        if (session !== null) {
            for (var i in d.options) {
                session.setAppOption(d.appId, d.index, i, d.options[i]);
            }
        }
    }

    sessionPause(id, sock) {
        var session = Utils.findById(global.jt.data.sessions, id);
        if (session !== null) {
            session.pause();
        }
    }

    sessionResume(id, sock) {
        var session = Utils.findById(global.jt.data.sessions, id);
        if (session !== null) {
            session.resume();
        }
    }

    setAllowNewParts(d, socket) {
        var session = global.jt.data.getSession(d.sId);
        session.setAllowNewParts(d.value);
    }

    setCaseSensitiveLabels(d, socket) {
        var session = global.jt.data.getSession(d.sId);
        session.setCaseSensitiveLabels(d.value);
    }

    setAutoplay(data) {
        let session = global.jt.data.session(data.sId);
        if (session !== null) {
            let part = session.proxy.state.participants[data.pId];
            if (part !== undefined) {
                part.emit('setAutoplay', {val: data.val});
            } else {
                // console.log('Msgs.setAutoplay: undefined participant ' + data.pId);
            }
        }
    }

    setAutoplayForAll(data) {
        let session = global.jt.data.session(data.sId);
        if (session !== null) {
            for (let i in session.proxy.state.participants) {
                session.proxy.state.participants[i].emit('setAutoplay', {val: data.val});
            }
        }
    }

    setAutoplayDelay(data) {
        let session = global.jt.data.session(data.sId);
        if (session !== null) {
            for (let i in session.proxy.state.participants) {
                session.proxy.state.participants[i].emit('setAutoplayDelay', {val: data.val});
            }
        }
    }

}

var exports = module.exports = {};
exports.new = Msgs;
