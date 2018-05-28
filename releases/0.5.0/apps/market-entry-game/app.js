app.description = 'Players choose whether or not to enter a market. Payoffs for entrants depend on the number of players that chose to enter.';

app.addPositiveIntegerOption('numPeriods', 5);
app.addNumberOption('outsideOption', 1, 1, null, 1);
app.addPositiveIntegerOption('capacity', 4);
app.addTextOption('payoffEqn', '1 + 2*(app.capacity - player.group.numEnter);');
app.numGroups = 1;
app.payoff = function(player) {
    if (player.enter) {
            return eval(this.payoffEqn);
        } else {
            return this.outsideOption;
        }
}

var decideStage = app.newStage('decide');

var resultsStage = app.newStage('results');
resultsStage.groupStart = function(group) { // when a group starts this stage
    group.numEnter = 0;
    // Find out winning number.
    for (var i in group.players) { // i = 0, 1, 2, 3
        var player = group.players[i];
        if (player.enter) {
            group.numEnter++;
        }
    }
    // Assign points
    for (var i in group.players) {
        var player = group.players[i];
        player.points = app.payoff(player);
    }
}
