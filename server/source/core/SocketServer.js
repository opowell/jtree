const path      = require('path');
const fs        = require('fs-extra');
const Utils     = require('../Utils.js');
const socketIO  = require('socket.io');
const Msgs      = require('./Msgs.js');

/** Handles socket connections */
class SocketServer {

    constructor(jt) {
        this.io = socketIO(jt.staticServer.server);
        this.jt = jt;
        this.ADMIN_TYPE = 'ADMIN';
        this.msgs         = new Msgs.new(jt); // MESSAGES TO LISTEN FOR FROM CLIENTS
        jt.io = this.io;
        this.io.on('connection', this.onConnection.bind(this));

        // Participant clients with no session IDs.
        // Reload them when a new session is opened.
        this.participantClients = [];

    }

    /**
     * onConnection - called when a socket connects to the server.
     *
     * @param  {Socket} socket description
     */
    onConnection(socket) {

        var id          = socket.request._query.id; // participant or admin ID
        var pwd         = socket.request._query.pwd;
        var type        = socket.request._query.type; // ADMIN or PARTI
        var sessionId   = socket.request._query.sessionId;
        var roomId      = socket.request._query.roomId;

        if (id === null || id === undefined || id === '') {
            id = socket.request.connection._peername.address;
            id = id.substring(id.lastIndexOf(':')+1);
            console.log('new id = ' + id);
        }

        var admin = this.jt.data.getAdmin(id, pwd);

        this.jt.log('socket connection: ' + socket.id + ', id=' + id + ', pwd=' + pwd + ', session=' + sessionId);

        if (type === this.ADMIN_TYPE && (admin !== null || this.jt.settings.adminLoginReq === false)) {
            this.addAdminClient(socket);
        } else if (roomId !== 'null') {
            this.addRoomClient(socket, id, roomId);
        } else {
            this.addParticipantClient(socket, id, sessionId, roomId);
        }
    }

    addAdminClient(socket) {
        var sock = socket;
        var self = this;
        var log = this.jt.log;
        log('socket connection to ' + this.ADMIN_TYPE);
        socket.join(this.ADMIN_TYPE);
        socket.join('socket_' + sock.id);

        var functionList = Object.getOwnPropertyNames(Object.getPrototypeOf(this.msgs));
        for (var i in functionList) {
            var fnI = functionList[i];
            (function(fnI) {
                socket.on(fnI, function(d) {
                    try {
                        log('received message ' + fnI + ': ' + JSON.stringify(d));
                        eval('self.msgs.' + fnI + "(d, sock)");
                    } catch (err) {
                        console.log("Error: " + err + "\n" + err.stack);
                        debugger;
                    }
                });
            })(fnI);
        }

        socket.on('refreshAdmin', function(msg) {
            log('Server.refreshAdmin: socket_' + sock.id);
            self.refreshAdmin(null, 'socket_' + sock.id, msg.userId);
        });

    }

    addRoomClient(socket, pId, roomId) {
        this.jt.log('server.addRoomClient: ' + socket.id + ', pId=' + pId + ', roomId=' + roomId);
        try {
            var room = this.jt.data.room(roomId);
            room.addClient(socket, pId);
        } catch (err) {
            this.jt.log('server.addRoomClient error:' + err + '\n' + err.stack);
        }

    }

    addParticipantClient(socket, pId, sessionId, roomId) {
        this.jt.log('server.addClient: ' + socket.id + ', pId=' + pId + ', sId=' + sessionId + ', roomId=' + roomId);
        try {
            var session = this.jt.data.getActiveSession(sessionId);
            if (session === null) {
                session = this.jt.data.getMostRecentActiveSession();
            }

            const client = session.addClient(socket, pId);

            // If no fixed session ID, add to list of clients to reset.
            if (session.id !== sessionId && client !== null) {
                this.participantClients.push(client);
            }

        } catch (err) {
            this.jt.log('server.addClient error:' + err + '\n' + err.stack);
        }
    }

    adminsRefreshApps() {
        this.io.to(this.ADMIN_TYPE).emit('refresh-apps', system.apps);
    }

    refreshAdmin(msgs, id, userId) {
        this.jt.log('refreshAdmin: ' + id + ', userId = ' + userId);

        var ag = {};
        ag.appFolders           = this.jt.settings.appFolders;
        ag.apps                 = this.jt.data.appsMetaData;
        ag.appsFull             = Utils.shells(this.jt.data.apps);
        ag.predefinedQueues     = this.jt.settings.predefinedQueues;
        ag.rooms                = Utils.shells(this.jt.data.rooms);
        ag.queues                = Utils.shells(this.jt.data.queues);
        ag.sessions             = this.jt.data.sessionsForUser(userId);
        ag.jtreeLocalPath       = this.jt.path;
        ag.settings             = this.jt.settings.shell();
        ag.users                = Utils.shells(this.jt.data.users);

        this.sendOrQueueAdminMsg(msgs, 'refreshAdmin', ag, id);
    }

    // If msgs is null, sends the message immediately.
    // Otherwise, the messages is just added to msgs.
    sendOrQueueAdminMsg(msgs, msgName, msgData, channel) {
        if (msgs == null || msgs == undefined) {
            if (channel == null || channel == undefined) {
                channel = this.ADMIN_TYPE;
            }
            this.io.to(channel).emit(msgName, msgData);
        } else {
            // TODO: add channel information
            msgs.push(new jt.Message(msgName, msgData));
        }
    }

    emitMessages(channel, msgs) {
        this.io.to(channel).emit('messages', msgs);
    }

    refreshAdmins(msgs) {
        this.refreshAdmin(msgs, this.ADMIN_TYPE, null);
    }

    emitToAdmins(msgName, msgData) {
        this.io.to(this.ADMIN_TYPE).emit(msgName, msgData);
    }

}

var exports = module.exports = {};
exports.new = SocketServer;
