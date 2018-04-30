app.description = 'Pairs of players play the centipede game. Players repeatedly have the option of either taking or leaving the pie. Every time a player leaves the pie, the pie grows. As soon as a player takes the pie (or after a certain number of passes), the game ends.';

app.addPositiveIntegerOption('PIE_INITIAL', 5);
app.PIE_MULTIPLIER  = 2;
app.MAX_PASSES      = 3; // per player
app.SHARE_TAKER     = 0.8;

app.numPeriods      = app.MAX_PASSES;
app.getGroupIdsForPeriod = function(period) {
  return [['P1', 'P2', 'P3', 'P4']] // one row of app.groupIds
}

var s1 = app.newStage('s1');
s1.canPlayerParticipate = function(player) {
    return (!player.finished1);
}
s1.groupStart = function(group) {
    if (group.period.id === 1) {
        app.p2Ids = getAnonymousPartnerIds(group);
        for (var i in group.players) {
            var player = group.players[i];
            player.pieSize1 = app.PIE_INITIAL;
            player.pieSize2 = app.PIE_INITIAL;
            player.finished1 = false;
            player.finished2 = false;
            player.passes1 = 0;
            player.passes2 = 0;
        }
    } else {
        for (var i in group.players) {
            var player = group.players[i];
            player.pieSize1 = player.old().pieSize1;
            player.pieSize2 = player.old().pieSize2;
            player.finished1 = player.old().finished1;
            player.finished2 = player.old().finished2;
            player.passes1 = player.old().passes1;
            player.passes2 = player.old().passes2;
            player.whyEnd1 = player.old().whyEnd1;
            player.whyEnd2 = player.old().whyEnd2;
            player.share1 = player.old().share1;
            player.share2 = player.old().share2;
            player.choice1 = player.old().choice1;
            player.choice2 = player.old().choice2;
        }
    }
    for (var i in group.players) {
        // Match current player with their receiver.
        var player = group.players[i];
        player.p2 = app.p2Ids[i]; // who this player sent to.

        var p2 = group.players[app.p2Ids[i]];
        p2.p1 = i; // who this player received from.

    }
}


s1.playerEnd = function(player) {
    var p2 = player.group.players[player.p2];
    if (player.choice1 === 'TAKE') {
        player.points1 = app.SHARE_TAKER * player.pieSize1;
        p2.points2 = player.pieSize1 - player.points1;
        player.finished1 = true;
        p2.finished2 = true;
        player.whyEnd1 = 'you chose to TAKE';
        p2.whyEnd2 = 'the other player chose to TAKE';
        player.share1 = app.SHARE_TAKER;
        p2.share2 = 1 - player.share1;
    } else {
        player.points1 = 0.5 * player.pieSize1;
        p2.points2 = player.pieSize1 - player.points1;
        player.passes1++;
        p2.passes2++;
        if (player.passes1 < 2*app.MAX_PASSES) {
            player.pieSize1 = player.pieSize1 * app.PIE_MULTIPLIER;
        }
        p2.pieSize2 = player.pieSize1;
        player.whyEnd1 = 'neither player chose to TAKE';
        p2.whyEnd2 = 'neither player chose to TAKE';
        player.share1 = 0.5;
        p2.share2 = 0.5;
    }
}

var s2 = app.newStage('s2');
s2.canPlayerParticipate = function(player) {
    return (!player.finished2);
}
s2.playerEnd = function(player) {
    var p1 = player.group.players[player.p1];
    if (player.choice2 === 'TAKE') {
        player.points2 = app.SHARE_TAKER * player.pieSize;
        p1.points1 = player.pieSize2 - player.points2;
        player.finished2 = true;
        p1.finished1 = true;
        player.whyEnd2 = 'you chose to TAKE';
        p1.whyEnd1 = 'the other player chose to TAKE';
        player.share2 = app.SHARE_TAKER;
        p1.share1 = 1 - player.share2;
    } else {
        player.points2 = 0.5 * player.pieSize2;
        p1.points1 = player.pieSize2 - player.points2;
        player.passes2++;
        p1.passes1++;
        if (player.passes2 < 2*app.MAX_PASSES) {
            player.pieSize2 = player.pieSize2 * app.PIE_MULTIPLIER;
        }
        p1.pieSize1 = player.pieSize2;
        player.whyEnd2 = 'neither player chose to TAKE';
        p1.whyEnd1 = 'neither player chose to TAKE';
        player.share2 = 0.5;
        p1.share1 = 0.5;
    }
}

var resultsStage = app.newStage('results');
resultsStage.canPlayerParticipate = function(player) {
    return player.group.period.id === app.numPeriods;
}
resultsStage.playerStart = function(player) {
    player.points1 = player.share1 * player.pieSize1;
    player.points2 = player.share2 * player.pieSize2;
    player.points = player.points1 + player.points2;
}

function getAnonymousPartnerIds(group) {
    var idsLeft = [];
    var lastId;
    for (var i in group.players) {
        idsLeft.push(i);
        lastId = i;
    }
    var round1pairs = [];
    var N = group.players.length;
    for (var i in group.players) { // i = '0', '1', '2', ...

    var tookOutOwnId = false;
    if (idsLeft.includes(i)) {
        tookOutOwnId = true;
        idsLeft.splice(idsLeft.indexOf(i), 1);
    }

    var r = Utils.randomInt(0, idsLeft.length);
    var partnerId = idsLeft[r];
    if (tookOutOwnId) {
        idsLeft.push(i);
    }

    // if only two left, make sure last iteration will have valid match
    if (idsLeft.length === 2 && idsLeft.includes(lastId)) {
        if (idsLeft.indexOf(lastId) === 0) {
            partnerId = idsLeft[0];
        } else {
            partnerId = idsLeft[1];
        }
    }
    round1pairs.push(partnerId);
    idsLeft.splice(idsLeft.indexOf(partnerId), 1);
}
return round1pairs;
}
