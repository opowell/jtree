/**
 * A participant in the experiment.
 */
class clStage {

    constructor(stage) {
        var fields = stage.outputFields();
        for (var f in fields) {
            var field = fields[f];
            this[field] = stage[field];
        }
        // App field populated from player object.
    }
}

var exports = module.exports = {};
exports.new = clStage;
