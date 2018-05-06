app.numGroups   = 1;

// PART 1
app.STAG = 'B';
app.HARE = 'A';
// Payoffs as listed here:
// https://en.wikipedia.org/wiki/Stag_hunt
app.payoff_a = 15;
app.payoff_b = 10;
app.payoff_c = 0;
app.payoff_d = 10;
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

app.part4Urn1 = 0.1; // % Green
app.part4Urn2 = 0.9;

app.drawFromUrn = function(prGreen) {
    if (Math.random() < prGreen) {
        return 'Green';
    } else {
        return 'Purple';
    }
}

// PART 5
app.part5End    = 20;
app.part5MultT1 = 1.2;
app.part5MultT2 = 1.9;

app.part6Payoff = 2;

var intro   = app.newStage('intro');
var part1   = app.newStage('part1');
var part2   = app.newStage('part2');
var part3   = app.newStage('part3');
var part4   = app.newStage('part4');
var part5   = app.newStage('part5');
var part6   = app.newStage('part6');
var part7   = app.newStage('part7');
var results = app.newStage('results');

intro.groupStart = function(group) {
    for (var p in group.players) {
        var plyr = group.players[p];
        plyr.treatment = plyr.idInGroup % 2 + 1;
        var n = Utils.objLength(group.period.app.session.participants);
        if (plyr.idInGroup-0 <= n / 2) {
            plyr.part5Mult = app.part5MultT1;
        } else {
            plyr.part5Mult = app.part5MultT2;
        }
    }
}

// when the entire group ends this stage
part1.groupEnd = function(group) {
    var part1Groups = Utils.getRandomGroups(group.players, 2);
    for (var i=0; i<part1Groups.length; i++) {
        var p1 = part1Groups[i][0];
        var p2 = part1Groups[i][1];
        p1.part1GroupId = i;
        p2.part1GroupId = i;
        p1.partnerPart1Ans = p2.part1Ans;
        p2.partnerPart1Ans = p1.part1Ans;
        p1.part1Points = app.part1Payoff(p1);
        p2.part1Points = app.part1Payoff(p2);
    }
}

part2.playerEnd = function(player) {
    if (player.treatment == 1) {
        var otherPlayers = Utils.randomEls(player.otherPlayersInGroup(), 20);
        player.part2OtherPlayersIds = [];
        for (var i=0; i<otherPlayers.length; i++) {
            player.part2OtherPlayersIds.push(otherPlayers[i].id);
        }

        player.countStag = Utils.count(otherPlayers, 'element.part1Ans === "' + app.STAG + '"');
        if (player.part2Ans === player.countStag) {
            player.part2Points = 1;
        } else {
            player.part2Points = 0;
        }
    } else {
        var n = Math.random()*100;
        player.part2n = n;
        var randomOtherPlayer = Utils.randomEl(player.otherPlayersInGroup());
        player.partnerPart2Ans = randomOtherPlayer.part1Ans;
        if (n < player.part2Ans) {
            if (randomOtherPlayer.part1Ans === app.STAG) {
                player.part2Points = 1;
            } else {
                player.part2Points = 0;
            }
        } else {
            if (Math.random() < n) {
                player.part2Points = 1;
            } else {
                player.part2Points = 0;
            }
        }
    }
}

//part3.waitToEnd = true;

part4.playerStart = function(player) {
    player.part4Urn = Math.random() < 0.5 ? app.part4Urn1 : app.part4Urn2;
    player.part4BallColor = app.drawFromUrn(player.part4Urn);
    if (player.part4BallColor == 'Green') {
        player.part4OtherColor = 'Purple';
    } else {
        player.part4OtherColor = 'Green';
    }
}

part4.playerEnd = function(player) {
    if (player.treatment == 1) {
        player.matchingBalls = 0;
        for (var i=0; i<20; i++) {
            if (app.drawFromUrn(player.part4Urn) == player.part4BallColor) {
                player.matchingBalls++;
            }
        }
        if (player.part4Ans === player.matchingBalls) {
            player.part4Points = 1;
        } else {
            player.part4Points = 0;
        }
    } else {
        var n = Math.random()*100;
        player.part4n = n;
        player.randomBall = app.drawFromUrn(player.part4Urn);
        if (n < player.part4Ans) {
            if (player.randomBall == player.part4BallColor) {
                player.part4Points = 1;
            } else {
                player.part4Points = 0;
            }
        } else {
            if (Math.random() < n) {
                player.part4Points = 1;
            } else {
                player.part4Points = 0;
            }
        }
    }
}
//part4.waitToEnd = true;

part5.groupEnd = function(group) {
    var t1players = group.players.filter(function(el) {
        return el.part5Mult = app.part5MultT1;
    });
    var t2players = group.players.filter(function(el) {
        return el.part5Mult = app.part5MultT2;
    });

    var part5GroupsT1 = Utils.getRandomGroups(t1players, 2);
    for (var i=0; i<part5GroupsT1.length; i++) {
        var players = part5GroupsT1[i];
        var groupContributions = Utils.sum(players, 'part5Cont');
        var groupProd = groupContributions * app.part5MultT1;
        for (var j=0; j<players.length; j++) {
            var player = players[j];
            player.groupContributions = groupContributions;
            player.groupProd = groupProd;
            player.groupId = i;
            player.part5Points = app.part5End - player.part5Cont + groupProd / players.length;
        }
    }

    var part5GroupsT2 = Utils.getRandomGroups(t2players, 2);
    for (var i=0; i<part5GroupsT2.length; i++) {
        var players = part5GroupsT2[i];
        var groupContributions = Utils.sum(players, 'part5Cont');
        var groupProd = groupContributions * app.part5MultT2;
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
        player.part6MedPoints = app.part6Payoff;
    } else {
        player.part6MedPoints = 0;
    }

    player.countUpQ = Utils.count(otherPlayers.slice(2, 6), 'element.part5Cont > ' + player.part6UpQ);
    if (player.countUpQ == 1) {
        player.part6UpQPoints = app.part6Payoff;
    } else {
        player.part6UpQPoints = 0;
    }

    player.countLowQ = Utils.count(otherPlayers.slice(6), 'element.part5Cont > ' + player.part6LowQ);
    if (player.countLowQ == 3) {
        player.part6LowQPoints = app.part6Payoff;
    } else {
        player.part6LowQPoints = 0;
    }
}
