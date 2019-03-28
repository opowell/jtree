stage.waitToStart = false;

stage.groupStart = function(group) {
  var app = group.app();

  // Part 1
  var part1Groups = Utils.getRandomGroups(group.players, 2);
  for (var i=0; i<part1Groups.length; i++) {
      var p1 = part1Groups[i][0];
      var p2 = part1Groups[i][1];
      p1.part1GroupId = i;
      p2.part1GroupId = i;
      p1.part1PartnerId = p2.id;
      p2.part1PartnerId = p1.id;
      p1.part1PartnerAns = p2.part1Ans;
      p2.part1PartnerAns = p1.part1Ans;
      p1.part1Points = app.part1Payoff(p1);
      p2.part1Points = app.part1Payoff(p2);
  }

  // Part 5
    var t1players = group.players.filter(function(el) {
        return el.part5Mult === app.part5MultT1;
    });
    var t2players = group.players.filter(function(el) {
        return el.part5Mult === app.part5MultT2;
    });

    var part5GroupsT1 = Utils.getRandomGroups(t1players, 2);
    for (var i=0; i<part5GroupsT1.length; i++) {
        var players = part5GroupsT1[i];
        var groupContributions = Utils.sum(players, 'part5Cont');
        var groupProd = groupContributions * app.part5MultT1;
        for (var j=0; j<players.length; j++) {
            var player = players[j];
            player.part5GroupPlayerIds = Utils.values(players, 'id');
            player.part5GroupContributions = groupContributions;
            player.part5GroupProd = groupProd;
            player.part5GroupId = i;
            player.part5Points = app.part5End - player.part5Cont + groupProd / players.length;
            player.part5Eur = (player.part5Points*app.part5ExchRate).toFixed(2)-0;
        }
    }

    var part5GroupsT2 = Utils.getRandomGroups(t2players, 2);
    for (var i=0; i<part5GroupsT2.length; i++) {
        var players = part5GroupsT2[i];
        var groupContributions = Utils.sum(players, 'part5Cont');
        var groupProd = groupContributions * app.part5MultT2;
        for (var j=0; j<players.length; j++) {
            var player = players[j];
            player.part5GroupPlayerIds = Utils.values(players, 'id');
            player.part5GroupContributions = groupContributions;
            player.part5GroupProd = groupProd;
            player.part5GroupId = i;
            player.part5Points = app.part5End - player.part5Cont + groupProd / players.length;
            player.part5Eur = (player.part5Points*app.part5ExchRate).toFixed(2)-0;
        }
    }

}

stage.playerStart = function(player) {

    // Part 2
    var app = player.app();
    var group = player.group;

    if (player.treatment == 1) {
        var n = Math.random()*100;
        player.part2n = n;
        var randomOtherPlayer = Utils.randomEl(group.playersExceptIds([player.id, player.part1PartnerId]));
        player.part2PartnerAns = randomOtherPlayer.part1Ans;
        if (n < player.part2Ans) {
            if (randomOtherPlayer.part1Ans === app.part1OptionB) {
                player.part2Points = app.part2Payoff;
            } else {
                player.part2Points = 0;
            }
        } else {
            player.part2SecondN = Math.random()*100;
            if (player.part2SecondN < n) {
                player.part2Points = app.part2Payoff;
            } else {
                player.part2Points = 0;
            }
        }
    } else {
        var otherPlayers = Utils.randomEls(group.playersExceptIds([player.id, player.part1PartnerId]), 20);
        player.part2OtherPlayersIds = [];
        for (var i=0; i<otherPlayers.length; i++) {
            player.part2OtherPlayersIds.push(otherPlayers[i].id);
        }
        player.part2CountOptionB = Utils.count(otherPlayers, 'element.part1Ans === "' + app.part1OptionB + '"');
        if (player.part2Ans === player.part2CountOptionB) {
            player.part2Points = app.part2Payoff;
        } else {
            player.part2Points = 0;
        }
    }

    // Part 4
    if (player.treatment == 1) {
        var n = Math.random()*100;
        player.part4n = n;
        player.part4RandomBall = app.drawFromUrn(player.part4Urn);
        if (n < player.part4Ans) {
            if (player.part4RandomBall == player.part4BallColor) {
                player.part4Points = 2;
            } else {
                player.part4Points = 0;
            }
        } else {
            player.part4SecondN = Math.random()*100;
            if (player.part4SecondN < n) {
                player.part4Points = 2;
            } else {
                player.part4Points = 0;
            }
        }
    } else {
        player.part4MatchingBalls = 0;
        for (var i=0; i<20; i++) {
            if (app.drawFromUrn(player.part4Urn) == player.part4BallColor) {
                player.part4MatchingBalls++;
            }
        }
        if (player.part4Ans === player.part4MatchingBalls) {
            player.part4Points = 2;
        } else {
            player.part4Points = 0;
        }
    }

    // Part 6
      var filterPlayer = function(el) {
          // Not a member of this player's group, AND
          // Same multiplier.
          var a =
              !player.part5GroupPlayerIds.includes(el.id) &&
              el.part5Mult === player.part5Mult;
          return a;
      };
      var otherPlayers = group.players.filter(filterPlayer);
      // Sort randomly.
      otherPlayers.sort(function() { return 0.5 - Math.random() });
      player.part6OtherPlayersIds = [];
      for (var i=0; i<otherPlayers.length; i++) {
          player.part6OtherPlayersIds.push(otherPlayers[i].id);
      }

      stage.part6Payoff(
          player,                                     // the player
          otherPlayers.slice(0, 4),                   // the other players
          player.part6Med,                            // field to check for exact match
          'element.part5Cont > ' + player.part6Med,   // condition for general matching
          'part6CountMed',                            // field in which to store count
          'part6MedPoints',                           // field in which to store points
          2                                           // number that must coincide
      );

      stage.part6Payoff(
          player,                                     // the player
          otherPlayers.slice(4, 8),                   // the other players
          player.part6UpQ,                            // field to check for exact match
          'element.part5Cont > ' + player.part6UpQ,   // condition for general matching
          'part6CountUpQ',                            // field in which to store count
          'part6UpQPoints',                           // field in which to store points
          1                                           // number that must coincide
      );

      stage.part6Payoff(
          player,                                      // the player
          otherPlayers.slice(8, 12),                   // the other players
          player.part6LowQ,                            // field to check for exact match
          'element.part5Cont < ' + player.part6LowQ,   // condition for general matching
          'part6CountLowQ',                            // field in which to store count
          'part6LowQPoints',                           // field in which to store points
          1                                           // number that must coincide
      );

    player.points =
        (app.showUpFee +
        player.part1Points +
        player.part2Points +
        player.part4Points +
        player.part5Eur +
        player.part6MedPoints +
        player.part6UpQPoints +
        player.part6LowQPoints).toFixed(2);
}

stage.part6Payoff = function(player, otherPlayers, exactField, condition, countField, pointsField, count) {
    var app = player.app();
    var exactMatch = true;
    for (var i=0; i<otherPlayers.length; i++) {
        if (otherPlayers[i].part5Cont != exactField) {
            exactMatch = false;
        }
    }

    if (exactMatch) {
        player[pointsField] = app.part6Payoff;
        player[countField] = 'match';
    } else {
        player[countField] = Utils.count(otherPlayers, condition);
        if (player[countField] == count) {
            player[pointsField] = app.part6Payoff;
        } else {
            player[pointsField] = 0;
        }
    }
}

stage.content = `
    <p>
        1. What is your age?
        <input name='player.quesAge' type='number' required min='0' max='100' step='1'>
    </p>

    <p>2. What is your gender?</p>
    <label for='quesGenderF'>
        <input name='player.quesGender' type='radio' required value='quesGenderF' id='quesGenderF'>
        Female
    </label>
    <label for='quesGenderM'>
        <input name='player.quesGender' type='radio' required value='quesGenderM' id='quesGenderM'>
        Male
    </label>

    <p>
        3. What is your field of study?
        <input name='player.quesField' required type='text'>
    </p>

    <p>
        4. In which year did you enrol in university for the first time?
        <input name='player.quesUniYear' type='number' required min='1950' max='2018' step='1'>
    </p>

    <p>
        5. What is your first (native) language?
        <input name='player.quesLang' required type='text'>
    </p>

    <p>6. How do you see yourself:<br>
        Are you generally a person who is fully prepared to take risks or do you try to avoid taking risks?</p>
    <div id='questRisk' class='likertScale' likert-low='Unwilling to take risks' likert-high='Fully prepared to take risks'></div>
    <br><br>

    <p>
        7. A bat and ball cost 110 Euros in total. The bat costs 100 Euros more than the ball. How much does the ball cost? (in Euros)
        <input name='player.quesCRTBat' type='number' required min='0' max='1000' step='1'>
    </p>

    <p>
        8. If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets? (in minutes)
        <input name='player.quesCRTWidgets' type='number' required min='0' max='1000' step='1'>
    </p>

    <p>
        9. In a lake, there is a patch of lily pads. Every day, the patch doubles in size. If it takes 48 days for the patch to cover the entire lake, how long would it take for the patch to cover half of the lake? (in days)
        <input name='player.quesCRTLilies' type='number' required min='0' max='1000' step='1'>
    </p>

    <form><button>OK</button></form>
`

stage.waitToEnd = false;
