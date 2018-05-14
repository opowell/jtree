app.description = 'Players play two repetitions of either the dictator, ultimatum or trust game, once as the first player and once as the second player.'

var ENDOWMENT_LOW       = 10000;
var ENDOWMENT_HIGH      = 50;
var SCORE_THRESHHOLD    = 20;
var ENDOWMENT_P2_LOW    = 0;
var ENDOWMENT_P2_HIGH   = 10;
var RETURN_RATE_HIGH    = 3;
var RETURN_RATE_LOW     = 200;

app.addSelectOption('p1Endowment', [ENDOWMENT_LOW, ENDOWMENT_HIGH, 'earned']);
app.addSelectOption('names', ['none', 'sender', 'receiver', 'both']);
app.addSelectOption('game', ['dictator', 'ultimatum', 'trust']);
app.addSelectOption('ultPlayType', ['choice', 'strategy']);
app.addSelectOption('returnRate', [RETURN_RATE_HIGH, RETURN_RATE_LOW]);
app.addSelectOption('p2Endowment', [ENDOWMENT_P2_LOW, ENDOWMENT_P2_HIGH]);
app.addSelectOption('instructions', ['NO', 'YES']);

if (app.game === 'dictator' || app.game === 'trust') {
    app.stage1VerbPresent = 'send';
    app.stage1VerbPast = 'sent';
} else {
    app.stage1VerbPresent = 'offer';
    app.stage1VerbPast = 'offered';
}

if (app.instructions === 'YES') {
    app.newStage('instructions'); // players must be advanced manually.
}

var decideStage = app.newStage('decide');
decideStage.playerStart = function(player) {
    if (app.endowment === 'earned') {
        if (player.participant.score > SCORE_THRESHHOLD) {
            player.p1Endowment = ENDOWMENT_HIGH;
        } else {
            player.p1Endowment = ENDOWMENT_LOW;
        }
    } else {
        player.p1Endowment = app.p1Endowment;
    }
    player.p2Endowment = app.p2Endowment;
}
decideStage.groupStart = function(group) {
    group.receiverIds = getAnonymousPartnerIds(group);
    for (var i in group.players) {
        // Match current player with their receiver.
        var player = group.players[i];
        var receiver = group.players[group.receiverIds[i]];
        player.receiverId = group.receiverIds[i]; // who this player sent to.
        receiver.senderId = i; // who this player received from.

        if (app.names === 'receiver' || app.names === 'both') {
            player.receiverName = receiver.participant.name;
        } else {
            player.receiverName = 'another random person in the class';
        }
        if (app.names === 'sender' || app.names === 'both') {
            receiver.senderName = player.participant.name;
        } else {
            receiver.senderName = 'another random person in the class';
        }
    }
}

if (app.game === 'ultimatum') {
    if (app.ultPlayType === 'choice') {
        var p2choose = app.newStage('p2choose');
        p2choose.playerStart = function(player) {
            var sender = player.group.players[player.senderId];
            var receiver = player.group.players[player.receiverId];
            player.received = sender.send; // What they received as receiver in S2.
        }
    }
    else if (app.ultPlayType === 'strategy') {
        var p2strategy = app.newStage('p2strategy');
        p2strategy.playerStart = function(player) {
            var sender = player.group.players[player.senderId];
            var receiver = player.group.players[player.receiverId];
            player.received = sender.send; // What they received as receiver in S2.
            player.senderEndowment = sender.endowment;
        }
        p2strategy.playerEnd = function(player) {
            player.accepted = player.received >= player.acceptThresh;
        }
    }
}
else if (app.game === 'trust') {
    var p2return = app.newStage('p2return');
    p2return.playerStart = function(player) {
        var sender = player.group.players[player.senderId];
        var receiver = player.group.players[player.receiverId];
        player.received = sender.send * app.returnRate; // What they received as receiver in S2.
    }
}

var resultsStage = app.newStage('results');
resultsStage.groupStart = function(group) {

    for (var i in group.players) {
        var player = group.players[i];

        if (app.game === 'dictator' || app.game === 'trust') {
            player.accepted = true;
        }

        if (app.game !== 'trust') {
            player.returnAmt = 0;
        }

    }

    for (var i in group.players) {
        var player = group.players[i];
        var sender = group.players[player.senderId];
        var receiver = group.players[player.receiverId];

        if (app.game === 'dictator') {
            player.received = sender.send;
        }

        receiver.receivedBack = player.returnAmt;

        // POINTS AS PLAYER 2
        if (player.accepted) {
            player.points += player.p2Endowment + player.received - player.returnAmt;
            player.answer = 'ACCEPT';
            sender.receiverAnswer = 'ACCEPTED';
        } else {
            player.answer = 'REJECT';
            sender.receiverAnswer = 'REJECTED';
        }

        // POINTS AS PLAYER 1
        if (receiver.accepted) {
            player.points += player.p1Endowment - player.send + receiver.returnAmt;
            receiver.answer = 'ACCEPT';
            player.receiverAnswer = 'ACCEPTED';
        } else {
            receiver.answer = 'REJECT';
            player.receiverAnswer = 'REJECTED';
        }
    }
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
