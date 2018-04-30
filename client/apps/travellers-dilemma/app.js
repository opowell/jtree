app.description = 'Travellers dilemma. In pairs, players choose a number between two bounds. Players receive the lower of the two chosen numbers, and the player who chose the lower number receives a bonus.';

app.addPositiveIntegerOption('numPeriods', 4);
app.addSelectOption('groupMatchingType', ['STRANGER', 'PARTNER_RANDOM']);
app.groupSize   = 2;
app.lowerBound  = 10;
app.upperBound  = 50;
app.bonus       = 10;

var decideStage = app.newStage('decide');

var resultsStage = app.newStage('results');
resultsStage.groupStart = function(group) { // when a group starts this stage

    // Find winning number.
    group.lowestNumber = Utils.min(group.players, 'number');

    // Assign points
    group.payBonus = false;
    for (var i in group.players) {
        var player = group.players[i];
        player.points = group.lowestNumber;
        if (player.number > group.lowestNumber) {
            group.payBonus = true;
        }
    }

    // Pay bonus, if necessary.
    if (group.payBonus) {
        for (var i in group.players) {
            var player = group.players[i];
            player.points = group.lowestNumber;
            if (player.number > group.lowestNumber) {
                player.points = player.points - app.bonus;
            } else {
                player.points = player.points + app.bonus;
            }
        }
    }
}
