app.groupSize   = 2;
app.STAG = 'Action 1';
app.HARE = 'Action 2';
// Payoffs as listed here:
// https://en.wikipedia.org/wiki/Stag_hunt
app.payoff_a = 2;
app.payoff_b = 0;
app.payoff_c = 1;
app.payoff_d = 1;
app.payoff = function(player) {
    if (player.x === app.STAG) {
        if (player.partnerX === app.STAG) {
            return app.payoff_a;
        } else {
            return app.payoff_c;
        }
    } else {
        if (player.partnerX === app.STAG) {
            return app.payoff_b;
        } else {
            return app.payoff_d;
        }
    }
};

var decideStage  = app.newStage('decide');
var resultsStage = app.newStage('results');

// when a group starts this stage
resultsStage.groupStart = function(group) {
    var p1 = group.playerWithId(1);
    var p2 = group.playerWithId(2);
    p1.partnerX = p2.x;
    p2.partnerX = p1.x;
    p1.points = app.payoff(p1);
    p2.points = app.payoff(p2);
    group.x1 = p1.x;
    group.x2 = p2.x;
}
