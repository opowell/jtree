/**
 * A participant in the experiment.
 */
class clParticipant {

    constructor(participant) {
        var fields = participant.outputFields();
        for (var f in fields) {
            var field = fields[f];
            this[field] = participant[field];
        }
        this.numClients = participant.clients.length;
        this.numPoints = participant.points();
        // session field is taken from player object.
    }

}

var exports = module.exports = {};
exports.new = clParticipant;
