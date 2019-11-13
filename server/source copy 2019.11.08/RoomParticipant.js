const Utils     = require('./Utils.js');
/**
 * A client that is connected to a {@link Room}.
 */
class RoomParticipant {

     constructor(pId) {
         this.id = pId;
         this.clients = [];
     }

     removeClient(sId) {
         for (var i in this.clients) {
             if (this.clients[i].id === sId) {
                 this.clients.splice(i, 1);
                 return;
             }
         }
     }

}

var exports = module.exports = {};
exports.new = RoomParticipant;
