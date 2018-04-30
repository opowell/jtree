app.description = 'Trust game.';

app.groupSize   = 2;
app.addNumberOption('p1endowment', 10, 1, null, 1);
app.addNumberOption('multiplier', 3, 1, null, null);
app.addNumberOption('numPeriods', 3, 1, null, 1);
app.addSelectOption('groupMatchingType', ['PARTNER_RANDOM', 'STRANGER']);

var p1propose = app.newStage('p1send');
p1propose.canPlayerParticipate = function(player) {
    return player.idInGroup === 1;
}

var p2choose = app.newStage('p2return');
p2choose.canPlayerParticipate = function(player) {
    return player.idInGroup === 2;
}
p2choose.groupStart = function(group) { // when a group starts this stage
    var p1 = group.playerWithId(1);
    // Amount between 0 and app.p1endowment for p1 to keep.
    group.p1send = p1.send;
    group.p2received = p1.send * app.multiplier;
}

var resultsStage = app.newStage('results');
resultsStage.duration = 30; // in seconds
resultsStage.groupStart = function(group) { // when a group starts this stage
    var p1 = group.playerWithId(1);
    var p2 = group.playerWithId(2);

    group.p2return = p2.return;

    p1.points = app.p1endowment - p1.send + p2.return;
    p2.points = group.p2received - p2.return;

    group.p1points = p1.points;
    group.p2points = p2.points;
}
