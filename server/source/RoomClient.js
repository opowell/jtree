const Utils     = require('./Utils.js');

/**
 * A client that is connected to a {@link Room}.
 */
class RoomClient {

     constructor(socket, room, participantId) {
         this.id = socket.id;
         this.room = room;
         this.participantId = participantId;
         this.lastActivity = Utils.getDate(new Date());
         this.socket = socket;
         socket.join(this.getChannelName());
     }

     getChannelName() {
         return 'socket_' + this.id;
     }

}

var exports = module.exports = {};
exports.new = RoomClient;
