// must be at least 21 players.
app.addSelectOption('treatment', ['T1 Our method', 'T2 Karni method']);
app.numGroups   = 1;

// PART 1
app.STAG = 'STAG';
app.HARE = 'HARE';
// Payoffs as listed here:
// https://en.wikipedia.org/wiki/Stag_hunt
app.payoff_a = 2;
app.payoff_b = 0;
app.payoff_c = 1;
app.payoff_d = 1;
app.part1Payoff = function(player) {
    if (player.part1Ans === app.STAG) {
        if (player.partnerPart1Ans === app.STAG) {
            return app.payoff_a;
        } else {
            return app.payoff_c;
        }
    } else {
        if (player.partnerPart1Ans === app.STAG) {
            return app.payoff_b;
        } else {
            return app.payoff_d;
        }
    }
};
app.part2Payoff = function(player) {
    if (app.treatment == 'T1 Our method') {
        var otherPlayers = Utils.randomEls(player.otherPlayersInGroup(), 20);
        player.part2OtherPlayersIds = [];
        for (var i=0; i<otherPlayers.length; i++) {
            player.part2OtherPlayersIds.push(otherPlayers[i].id);
        }

        player.countStag = Utils.count(otherPlayers, 'element.part1Ans === "' + app.STAG + '"');
        if (player.part2Ans === player.countStag) {
            return 5;
        } else {
            return 0;
        }
    } else {
        var n = Math.random()*100;
        player.part2n = n;
        var randomOtherPlayer = Utils.randomEl(player.otherPlayersInGroup());
        player.partnerPart2Ans = randomOtherPlayer.part1Ans;
        if (n < player.part2Ans) {
            if (randomOtherPlayer.part1Ans === app.STAG) {
                return 5;
            } else {
                return 0;
            }
        } else {
            // NOT SURE ABOUT THIS PART
            if (randomOtherPlayer.part1Ans === app.STAG) {
                return 0;
            } else {
                return 5;
            }
        }
    }
}

// PART 5
app.part5End    = 20;
app.part5Fac    = 2;

var part1   = app.newStage('part1');
var part2   = app.newStage('part2');
var part3   = app.newStage('part3');
var part4   = app.newStage('part4');
var part5   = app.newStage('part5');
var part6   = app.newStage('part6');
var part7   = app.newStage('part7');
var results = app.newStage('results');

// when the entire group ends this stage
part1.groupEnd = function(group) {
    var part1Groups = Utils.getRandomGroups(group.players, 2);
    for (var i=0; i<part1Groups.length; i++) {
        var p1 = part1Groups[i][0];
        var p2 = part1Groups[i][1];
        p1.groupId = i;
        p2.groupId = i;
        p1.partnerPart1Ans = p2.part1Ans;
        p2.partnerPart1Ans = p1.part1Ans;
        p1.part1Points = app.part1Payoff(p1);
        p2.part1Points = app.part2Payoff(p2);
    }
}

part2.playerEnd = function(player) {
    player.part2Points = app.part2Payoff(player);
}

part4.playerEnd = function(player) {
    // NOT SURE ABOUT THIS PART
    player.part4Points = 'TODO';
}

part5.groupEnd = function(group) {
    var part5Groups = Utils.getRandomGroups(group.players, 4);
    for (var i=0; i<part5Groups.length; i++) {
        var players = part5Groups[i];
        var groupContributions = Utils.sum(players, 'part5Cont');
        var groupProd = groupContributions * app.part5Fac;
        for (var j=0; j<players.length; j++) {
            var player = players[j];
            player.groupContributions = groupContributions;
            player.groupProd = groupProd;
            player.groupId = i;
            player.part5Points = app.part5End - player.part5Cont + groupProd / players.length;
        }
    }
}

part6.playerEnd = function(player) {
    var otherPlayers = Utils.randomEls(player.otherPlayersInGroup(), 10);
    player.part6OtherPlayersIds = [];
    for (var i=0; i<otherPlayers.length; i++) {
        player.part6OtherPlayersIds.push(otherPlayers[i].id);
    }
    player.countMed = Utils.count(otherPlayers.slice(0, 2), 'element.part5Cont > ' + player.part6Med);
    if (player.countMed == 1) {
        player.part6MedPoints = 5;
    } else {
        player.part6MedPoints = 0;
    }

    player.countUpQ = Utils.count(otherPlayers.slice(2, 7), 'element.part5Cont > ' + player.part6UpQ);
    if (player.countUpQ == 1) {
        player.part6UpQPoints = 5;
    } else {
        player.part6UpQPoints = 0;
    }

    player.countLowQ = Utils.count(otherPlayers.slice(7), 'element.part5Cont > ' + player.part6LowQ);
    if (player.countLowQ == 3) {
        player.part6LowQPoints = 5;
    } else {
        player.part6LowQPoints = 0;
    }
}
