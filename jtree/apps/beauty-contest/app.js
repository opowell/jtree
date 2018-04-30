app.title = 'Beauty Contest Game';
app.description = 'Players make a guess between 0 and 100. Winner is the player whose guess is closest to 2/3 of the average guess.';

app.addPositiveIntegerOption('numGroups', 1, null, 'The number of groups.');
app.addPositiveIntegerOption('numPeriods', 5, null, 'The number of periods.');
app.multiplier  = 2/3;
app.lowerBound  = 0;
app.upperBound  = 100;

var decideStage = app.newStage('decide');

var resultsStage = app.newStage('results');
//resultsStage.duration = 30; // in seconds
resultsStage.groupStart = function(group) { // when a group starts this stage
    group.totalGuesses = Utils.sum(group.players, 'guess');
    group.target = group.totalGuesses * app.multiplier / Utils.objLength(group.players);
    group.lowestDist = null;
    group.numWinners = 0;
    // Find out who won.
    for (var i in group.players) { // i = 0, 1, 2, 3
        var player = group.players[i];
        player.distance = Math.abs(group.target - player.guess);
        if (group.lowestDist === null || player.distance < group.lowestDist) {
            group.lowestDist = player.distance;
            group.numWinners = 1;
        } else if (player.distance === group.lowestDist) {
            group.numWinners++;
        }
    }
    // Assign points
    for (var i in group.players) {
        var player = group.players[i];
        if (player.distance <= group.lowestDist) {
            player.points = 5 / group.numWinners;
        } else {
            player.points = 0;
        }
    }
}
