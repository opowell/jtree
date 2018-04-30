app.description = 'Trust game - Bednarik.';

// name, default, min, max, stepSize, description
app.addNumberOption('N', 3, 1, null, 1, 'The length of the feedback that P1 receives about P2\'s prior behavior');
app.addNumberOption('numPrdsNoFeedback', 10, 0, null, 1, 'The number of periods with no feedback.');
app.addNumberOption('numPrdsFeedback', 10, 0, null, 1, 'The number of periods with feedback.');

app.groupMatchingType   = 'STRANGER';
app.groupSize           = 2;

// ASSUME PROJECT CREATES GAIN OF 2x INVESTMENT
// INVESTMENT = 10
// ENDOWMENT_P1 = 10
// ENDOWMENT_P2 = 0
// IF P2 TRUSTS, HE RETURNS INVESTMENT + 1/2 OF GAIN.
app.payoffs = function(a1, a2) {
    if (a1 === 'TRUST') {
        if (a2 === 'TRUST') {
            return [15, 5];
        } else if (a2 === 'NOT TRUST') {
            return [0, 20];
        }
    } else if (a1 === 'NOT TRUST') {
        return [10, 0];
    }
}

app.numPeriods          = app.numPrdsNoFeedback + app.numPrdsFeedback;

// FOR TRACKING HISTORY
app.participantStart = function(participant) {
    participant.p2history = [];
    participant.histLength = 0;
}

// STAGE 1
var p1propose = app.newStage('p1invest');
p1propose.canPlayerParticipate = function(player) {
    return player.idInGroup === 1;
}

// STAGE 2
var p2choose = app.newStage('p2return');
p2choose.groupStart = function(group) { // when a group starts this stage
    var p1 = group.playerWithId(1);
    group.p1action = p1.p1action;
}
p2choose.canPlayerParticipate = function(player) {
    return (player.idInGroup === 2 && player.group.p1action === 'TRUST');
}

// RESULTS
var resultsStage = app.newStage('results');
resultsStage.groupStart = function(group) {

    // Get players.
    var p1 = group.playerWithId(1);
    var p2 = group.playerWithId(2);

    // Determine payoffs
    group.p2action = p2.p2action;
    var payoffs = app.payoffs(p1.p1action, p2.p2action);
    p1.points = payoffs[0];
    p2.points = payoffs[1];
    group.p1points = p1.points;
    group.p2points = p2.points;

    // Track history, average of last N actions by P2.
    var ptcpt1 = p1.participant;
    var history = ptcpt1.p2history;
    if (p1.p1action === 'TRUST') {
        history.push(p2.p2action === 'TRUST' ? 1 : 0);
    }
    ptcpt1.histLength = Math.min(app.N, history.length);
    ptcpt1.msg = 0;
    for (var i=0; i<ptcpt1.histLength; i++) {
        ptcpt1.msg += history[history.length - 1 - i];
    }
    ptcpt1.msg = ptcpt1.msg / ptcpt1.histLength;

}
