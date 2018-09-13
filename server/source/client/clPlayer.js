const clParticipant  = require('./clParticipant.js');
const clStage  = require('./clStage.js');

/**
 * A participant in the experiment, meant to be sent from the server to a client.
 */
class clPlayer {

    constructor(player) {

        var fields = player.outputFields();
        for (var f in fields) {
            var field = fields[f];
            this[field] = player[field];
        }

        /**
         * The group of this player.
         * @type string
         */
        this.group = player.group.shellWithParent();
        var group = player.group;
        if (group.stageTimer !== undefined) {
            this.stageTimerStart = group.stageTimer.timeStarted;
            this.stageTimerDuration = group.stageTimer.duration;
            let state = group.stageTimer.state();
            this.stageTimerTimeLeft = state.timeLeft - state.timeElapsed;
            this.stageTimerRunning = group.stageTimer.running;
        }

        if (player.stage.getClientDuration(player) > 0) {
            this.stageClientDuration = player.stage.getClientDuration(player);
        }

        if (player.stage !== null && player.stage !== undefined) {
            this.stage = new clStage.new(player.stage);

            if (this.stage.updateObject === 'group') {
                this.group = player.group.shellForPlayerUpdate();
            }
        }

        this.participant = new clParticipant.new(player.participant);
    }

    // This function re-establishes links between objects.
    // Use on client after receiving object on client.
    // *Note* function itself is not passed via JSON.
    fixLinks() {
        this.participant.session = this.group.period.app.session;
        this.stage.app = this.group.period.app;
    }
}

var exports = module.exports = {};
exports.new = clPlayer;
