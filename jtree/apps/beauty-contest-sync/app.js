app.addNumberOption('numPeriods', 3, 1, null, 1);
app.addNumberOption('multiplier', 0.66, 0, null, null);
app.addNumberOption('lowerBound', 0, 0, null, 1);
app.addNumberOption('upperBound', 100, 0, null, 1);
app.description = 'A synchronous version of the Beauty Contest game. Players proceed through stages as a group.';
app.numPeriods = 3;

var decideStage = app.newStage('decide');
decideStage.waitToEnd = true;

var resultsStage = app.newStage('results');
resultsStage.waitToEnd = true;
resultsStage.duration = 5; // in seconds
resultsStage.groupStart = function(group) { // when a group starts this stage
    group.totalGuesses = Utils.sum(group.players, 'guess');
    group.target = group.totalGuesses * app.multiplier / Utils.objLength(group.players);
    group.lowestDist = null;
    // Find out who won.
    for (var i in group.players) { // i = 0, 1, 2, 3
        var player = group.players[i];
        player.distance = Math.abs(group.target - player.guess);
        if (group.lowestDist === null || player.distance < group.lowestDist) {
            group.lowestDist = player.distance;
        }
    }
    // Assign points
    for (var i in group.players) {
        var player = group.players[i];
        if (player.distance <= group.lowestDist) {
            player.points = 1;
        } else {
            player.points = 0;
        }
    }
}
