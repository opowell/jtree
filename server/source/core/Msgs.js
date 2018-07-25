const fs        = require('fs-extra');
const path      = require('path');
const Utils     = require('../Utils.js');

/**
 * Messages that the server listens for from clients.
 * Includes try-catch and notification (via console) of receipt.
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
        app.setFileContents(d.filename, d.content);
        this.jt.data.appsMetaData[d.aId] = app.metaData();
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
        var appId = msgData.appId;
        var options = msgData.options;
        var session = this.jt.data.createSession(msgData.userId);
        session.resume();
        this.jt.data.sessions.push(session);
        var d = {sId: session.id, appId: appId, options: options};
        this.sessionAddApp(d);
        this.openSession(session.id, sock);
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

    reloadApps(d, sock) {
        this.jt.data.loadApps();
        this.jt.socketServer.emitToAdmins('reloadApps', this.jt.data.appsMetaData);
    }

    startSessionFromQueue(data, sock) {
        var session = this.jt.data.createSession(data.userId);
        session.resume();
        this.jt.data.sessions.push(session);
        var queue = this.jt.data.queue(data.qId);
        for (var a in queue.apps) {
            var app = queue.apps[a];
            var d = {sId: session.id, appId: app.appId, options: app.options};
            this.sessionAddApp(d);
        }
        this.openSession(session.id, sock);
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
//        this.jt.socketServer.emitToAdmins('saveRoom', room);
    }

    deleteQueue(id, sock) {
        this.jt.data.deleteQueue(id);
        this.jt.socketServer.emitToAdmins('deleteQueue', id);
    }

    deleteAppFromQueue(qId, aId, appIndex) {
        var queue = this.jt.data.queue(qId);
        queue.deleteApp(aId, appIndex);
        this.jt.socketServer.emitToAdmins('deleteAppFromQueue', {qId, aId, appIndex});
    }

    deleteApp(id, sock) {
        this.jt.data.deleteApp(id);
        this.jt.socketServer.emitToAdmins('deleteApp', id);
    }

    saveApp(app, sock) {
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
            eval('this.' + msgName + "(msgData, sock)");
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

    reloadClients() {
        const clients = this.jt.socketServer.participantClients;
        for (let i=0; i<clients.length; i++) {
            try {
                clients[i].reload();
            } catch (err) {}
        }
    }

    sessionAddApp(d) {
        this.jt.data.getSession(d.sId).addApp(d.appId, d.options);
    }

    sessionAddUser(d) {
        this.jt.data.getSession(d.sId).addUser(d.uId);
    }

    sessionAddQueue(d) {
        this.jt.data.getSession(d.sId).addQueue(d.qId);
    }

    roomAddApp(d) {
        this.jt.data.room(d.roomId).addApp(d.appId);
    }

    queueAddApp(d) {
        this.jt.data.queue(d.queueId).addApp(d.appId, d.options);
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

    setSessionAppOption(d, socket) {
        var session = Utils.findByIdWOJQ(this.jt.data.sessions, d.sId);
        if (session !== null) {
            session.setAppOption(d.appId, d.i, d.name, d.value);
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

    sessionStart(id) {
        var session = Utils.findByIdWOJQ(this.jt.data.sessions, id);
        if (session !== null) {
            session.start();
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

}

var exports = module.exports = {};
exports.new = Msgs;
