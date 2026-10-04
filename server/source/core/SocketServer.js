const { Server } = require('socket.io');

const Utils     = require('../Utils.js');
const Client    = require('../Client.js');
const Msgs      = require('./Msgs.js');

/** Error sent to an admin socket that is not logged in; admin pages then go to the login page. */
const ADMIN_LOGIN_REQUIRED = 'jtree: admin login required';

/** Handles socket connections */
class SocketServer {

    constructor(jt) {
        // On a server shared with other apps (see jtree.js), leave WebSocket upgrades for other paths alone.
        this.io = new Server(jt.staticServer.server, {
            path: jt.basePath + '/socket.io',
            destroyUpgrade: jt.httpServer == null,
            // socket.io 2 accepted messages up to 100 MB; admins send whole app files.
            maxHttpBufferSize: 1e8,
            // Experiment pages that load an old socket.io client of their own.
            allowEIO3: true,
        });
        this.jt = jt;
        this.ADMIN_TYPE = 'ADMIN';
        this.msgs         = new Msgs.new(jt); // MESSAGES TO LISTEN FOR FROM CLIENTS
        jt.io = this.io;

        // Admin sockets carry the login of the page that opened them (see AdminAuth).
        const auth = jt.staticServer.auth;
        this.io.engine.use(auth.sessionMiddleware);
        this.io.use((socket, next) => {
            if (socket.handshake.query.type === this.ADMIN_TYPE && !auth.isAuthorized(socket.request)) {
                return next(new Error(ADMIN_LOGIN_REQUIRED));
            }
            next();
        });
        this.io.on('connection', this.onConnection.bind(this));
    }

    /**
     * onConnection - called when a socket connects to the server.
     *
     * @param  {Socket} socket description
     */
    onConnection(socket) {

        var query       = socket.handshake.query;
        var id          = query.id; // participant or admin ID
        var type        = query.type; // ADMIN or PARTI
        var sessionId   = query.sessionId;
        var roomId      = query.roomId;

        if (id === null || id === undefined || id === '') {
            id = socket.handshake.address;
            id = id.substring(id.lastIndexOf(':')+1);
            console.log('new id = ' + id);
        }

        this.jt.log('socket connection: ' + socket.id + ', id=' + id + ', type=' + type + ', session=' + sessionId);

        // Only authorized admins get this far with type ADMIN (see the constructor).
        if (type === this.ADMIN_TYPE) {
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

        for (const fnI of Msgs.names()) {
            socket.on(fnI, function(d, cb) {
                try {
                    log('received message ' + fnI + ': ' + JSON.stringify(d));
                    self.msgs[fnI](d, sock);
                    if (typeof cb === 'function') {
                        cb(true);
                    }
                } catch (err) {
                    console.log("Error: " + err + "\n" + err.stack);
                    if (typeof cb === 'function') {
                        cb(false);
                    }
                }
            });
        }

        socket.on('refreshAdmin', function(msg) {
            log('Server.refreshAdmin: socket_' + sock.id);
            self.refreshAdmin(null, 'socket_' + sock.id, msg.userId);
        });

        socket.on('reloadApps', function(msg) {
            self.jt.data.reloadApps();
            if (msg == null) {
                msg = {
                    userId: ''
                }
            }
            self.refreshAdmin(null, 'socket_' + sock.id, msg.userId);
        });

        socket.on('get-app', function(id) {
            var toSend = self.jt.data.apps[id].shell();
            self.io.to(sock.id).emit('get-app', toSend);
        });

        socket.on('session-set-active', function(msg) {
            var session = self.jt.data.getSession(msg.sId);
            session.setActive(msg.active);
        });

        socket.on('refresh-apps', function(msg) {
            self.jt.data.apps = self.jt.data.loadApps();
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

            let client = null;
            if (session != null) {
                // Add client to session (automatic notification of admins + client).
                client = session.addClient(socket, pId);
            } else {
                // No session, so notify manually.
                client = new Client.new(socket, null);
                client.pId = pId;
                this.sendOrQueueAdminMsg(null, 'addClient', client.shell());
                let participant = {
                    id: pId,
                    session: {
                        id: 'none'
                    }
                };
                socket.emit('logged-in', participant);
                let socketServer = this;
                socket.on('disconnect', function() {
                    console.log('disconnect for ' + JSON.stringify(client.shell()));
                    socketServer.sendOrQueueAdminMsg(null, 'removeClient', client.shell());
                    Utils.deleteById(socketServer.jt.data.participantClients, client.id);
                });
            }

            // If no fixed session ID, add to list of clients to reset.
            if ((session == null || session.id !== sessionId) && client !== null) {
                this.jt.data.participantClients.push(client);
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
