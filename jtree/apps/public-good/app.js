app.description = 'Players in a group contribute to a public good. Contributions are increased by a factor > 1, then redistributed equally among all group members.';

app.numPeriods  = 30;
app.groupSize   = 4;
app.endowment   = 20;
app.factor      = 2;

var decideStage = app.newStage('decide');

var resultsStage = app.newStage('results');

resultsStage.duration    = 30; // in seconds

// when a group starts this stage
resultsStage.groupStart = function(group) {
    group.contributions = Utils.sum(group.players, 'contribution');
    group.production = group.contributions * app.factor;
    var prodPerPlayer = group.production / group.players.length;
    for (var i in group.players) { // i = 0, 1, 2, 3
        var player = group.players[i];
        player.points = app.endowment - player.contribution + prodPerPlayer;
    }
}
