app.description = 'A dictator decides how to split points between themselves and their partner.';

app.groupSize   = 2;
app.pieSize     = 100;
app.numPeriods  = 3;

var decideStage = app.newStage('decide');
decideStage.canPlayerParticipate = function(player) {
    return player.idInGroup === 1;
}

var resultsStage = app.newStage('results');
resultsStage.duration = 30; // in seconds
resultsStage.groupStart = function(group) { // when a group starts this stage
    var p1 = group.playerWithId(1);
    var p2 = group.playerWithId(2);
    p1.points = p1.keep;
    p2.points = app.pieSize - p1.keep;
    group.p1keep = p1.keep;
    group.p2points = p2.points;
}
