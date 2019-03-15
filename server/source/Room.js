const fs        = require('fs-extra');
const path      = require('path');
const Utils     = require('./Utils.js');
const RoomClient = require('./RoomClient.js');
const RoomParticipant = require('./RoomParticipant.js');
const hash      = require('object-hash');


/**
 * A room for running sessions.
*/
class Room {

    constructor(id, jt) {
        this.jt             = jt;
        this.id             = id;
        this.displayName    = id;
        this.useSecureURLs  = true;
        this.allowNewPIds   = false;
        this.labels         = [];
        this.hashes         = [];
        this.participants   = []; // RoomParticipant array
        this.apps           = [];
    }

    static load(folder, id, jt) {
        var room = new Room(id, jt);

        // Read fields, if any.
        var fn = path.join(folder, 'room.json');
        if (fs.existsSync(fn)) {
            var json = Utils.readJSON(fn);
            if (json.displayName !== undefined) {
                room.displayName = json.displayName;
            }
            if (json.useSecureURLs !== undefined) {
                room.useSecureURLs = json.useSecureURLs;
            }
        }

        // Read labels, if any.
        var labelsFN = path.join(folder, 'labels.txt');
        if (fs.existsSync(labelsFN)) {
            var all = fs.readFileSync(labelsFN).toString();
            var lines = all.split('\n');
            for (var i=0; i<lines.length; i++) {
                try {
                    var line = lines[i].trim();
                    if (line.length > 0) {
                        room.labels.push(line);
                        if (room.useSecureURLs) {
                            room.hashes.push(hash(line));
                        }
                        room.participants.push(new RoomParticipant.new(line));
                    }
                } catch (err) {
                    console.log(err);
                }
            }
        }

        return room;
    }

    /**
    * Add the app with the given ID to this session.
    *
    * FUNCTIONALITY:
    * - load the given app {@link Session#loadApp}
    * - add app to this session's apps field.
    * - copy app source files {@link Utils#copyFiles}.
    * - save app and its stages {@link App#saveSelfAndChildren}.
    * - emit 'sessionAddApp' message.
    *
    * @param  {string} appId The ID of the app to add to this session.
    */
    addApp(appId) {
        this.apps.push(appId);
        this.jt.socketServer.sendOrQueueAdminMsg(null, 'roomAddApp', {roomId: this.id, appId: appId});
    }

    clientRemove(socket) {
        var id          = socket.request._query.id; // participant or admin ID
        var participant = this.participant(id);
        participant.removeClient(socket.id);
        socket.leave(this.roomId());
        this.jt.socketServer.sendOrQueueAdminMsg(null, 'removeRoomClient', {cId: socket.id, pId: id, roomId: this.id});
    }

    addClient(socket, participantId) {
        var room = this;

        socket.on('disconnect', function() {
            room.clientRemove(socket);
        });

        var client = new RoomClient.new(socket, room, participantId);

        var participant = this.participant(client.participantId);

        if (participant === null) {
            return null;
        }

        participant.clients.push(client);

        socket.join(this.roomId());
        this.jt.socketServer.sendOrQueueAdminMsg(null, 'addRoomClient', client.shell());
        this.io().to(socket.id).emit('loggedIntoRoom', participantId);
    }

    io() {
        return this.jt.io;
    }

    participant(pId) {

        if (!this.isValidPId(pId)) {
            return null;
        }

        for (var i=0; i<this.participants.length; i++) {
            if (this.participants[i].id === pId) {
                return this.participants[i];
            }
        }

        var part = new RoomParticipant.new(pId);
        this.participants.push(part);
        return part;
    }

    roomId() {
        return 'room/' + this.id;
    }

    isValidPId(pId, hash) {
        if (this.allowNewPIds) {
            return true;
        }

        for (var i=0; i<this.labels.length; i++) {
            if (this.useSecureURLs) {
                if (this.labels[i] === pId && this.hashes[i]) {
                    return true;
                }
            } else {
                if (this.labels[i] === pId) {
                    return true;
                }
            }
        }

        return false;
    }

    shell() {
        var out = {}
        out.id             = this.id;
        out.displayName    = this.displayName;
        out.useSecureURLs  = this.useSecureURLs;
        out.allowNewPIds   = this.allowNewPIds;
        out.labels         = this.labels;
        out.hashes         = this.hashes;
        out.participants   = Utils.shells(this.participants);
        out.apps           = this.apps;
        return out;
    }

    genHashes() {
        this.hashes = [];
        if (this.useSecureURLs) {
            for (var i in this.labels) {
                this.hashes.push(hash(this.labels[i]));
            }
        }
        this.participants = [];
        for (var i in this.labels) {
            this.hashes.push(new RoomParticipant.new(this.labels[i]));
        }
    }

}

var exports = module.exports = {};
exports.new = Room;
exports.load = Room.load;
