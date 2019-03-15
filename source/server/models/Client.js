const Utils     = require('./Utils.js');
// const Observer = require('micro-observer').Observer;

/**
 * A client that is connected to a {@link Participant}.
 */
class Client {

    /**
     * Creates a {@link Client} from a given socket connection.
     * @param  {type} socket description
     */
     constructor(socket, session) {
         this.id = socket.id;
         this.session = session;
         this.ip = null;
         this.pId = null;
         this.participant = null;
         this.lastActivity = Utils.getDate(new Date());
         this.socketId = socket.id;
         socket.join(this.getChannelName());

    }

     /**
      * @return The name of this client's channel, which is 'socket_<client.id>', where <client.id> is this client's id.
      */
     getChannelName() {
         return 'socket_' + this.id;
     }

     canProcessMessage() {
         return true;
     }

    /*
     * Registers a handler on the socket to respond to a message.
     *
     * @param  {type} msgName description
     * @param  {type} fn      description
     * @return {type}         description
     */
    on(msgName, fn) {
        // let socket = jt.socketServer.getSocket(this.socketId);
        this.getSocket().on(msgName, fn);
    }

    register(msgName, msgFunc) {
        var client = this;
        client[msgName] = msgFunc;
        var session = this.participant.session;
        this.on(msgName, function(msg) {
            session.pushMessage(client, msg.data, msgName);
        });
    }

    reload() {
        var dta = {};
        global.jt.io.to(this.getChannelName()).emit('start-new-app', dta);
    }

    /**
     * player - description
     *
     * @return {type}  description
     */
    player() {
        if (this.participant === null) {
            return null;
        } else {
            return this.participant.player;
        }
    }

    /**
     * group - description
     *
     * @return {type}  description
     */
    group() {
        return this.player().group;
    }

    /**
     * period - description
     *
     * @return {type}  description
     */
    period() {
        return this.player().period();
    }

    /**
     * app - description
     *
     * @return {type}  description
     */
    app() {
        return this.player().app();
    }

    getSocket() {
        return global.jt.socketServer.getSocket(this.socketId);
    }

}

var exports = module.exports = {};
exports.new = Client;
