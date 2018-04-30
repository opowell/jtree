app.description = 'Public goods game with punishment.';

app.groupSize   = 4;
app.endowment   = 20;
app.punMult     = 1;
app.prodMult    = 2;
app.addPositiveIntegerOption('numPeriods', 3, null);
app.addSelectOption('groupMatchingType', ['STRANGER', 'PARTNER_RANDOM']);
app.addSelectOption('punishment', ['YES', 'NO']);

var decideStage = app.newStage('decide');

if (app.punishment === 'YES') {
    var punishStage = app.newStage('punish');
    punishStage.updateObject = 'group'; // To show data from other players in group.
}

var resultsStage = app.newStage('results');
//resultsStage.duration = 30;
resultsStage.updateObject = 'group'; // To show data from other players in group.
resultsStage.groupStart = function(group) { // when a group starts this stage
    group.contributions = Utils.sum(group.players, 'contribution');
    group.production = group.contributions * app.prodMult;
    group.prodPerPlayer = group.production / group.players.length;

    for (let i=0; i<group.players.length; i++) { // i = 0, 1, 2, 3
        group.players[i].sentPuns = 0;
        group.players[i].receivedPuns = 0;
    }

    for (let i=0; i<group.players.length; i++) { // i = 0, 1, 2, 3
        var player = group.players[i];
        player.points = player.points + app.endowment - player.contribution + group.prodPerPlayer;
        let id = player.idInGroup;
        // Player i's punishment from other group members.
        for (let j=0; j<group.players.length; j++) {
            if (i !== j) {
                var playerJ = group.players[j];
                let punishment = playerJ['pun' + id];
                player.points = player.points - punishment*app.punMult;
                player.receivedPuns += punishment;
                playerJ.points = playerJ.points - punishment;
                playerJ.sentPuns += punishment;
            }
        }
    }
}
