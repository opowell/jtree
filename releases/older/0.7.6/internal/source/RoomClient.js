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

    /**
     *
     * @return {type}  description
     */
    shell() {
        var out = {};
        out.id = this.id;
        out.pId = this.participantId;
        out.lastActivity = this.lastActivity;
        out.roomId = this.room.id;
        return out;
    }

}

var exports = module.exports = {};
exports.new = RoomClient;
