stage.waitToStart = false;

stage.content = `
    <span jt-displayif='player.treatment==1'>
        <p>In this part of the experiment the computer will randomly select a participant from Part 1, excluding your choice and that of the participant you were matched with in that Part. What is your belief about the chances that this participant chose Option B in Part 1 of this experiment?</p>
        <p>Please state your belief in terms of a number between 0 and 100 (for example, 0 corresponds to no chance this participant choose Option B, 50 corresponds to equal chances this participant chose Option B vs Option A, and 100 corresponds to full certainty that this participant chose Option B).</p>
        <p>In order to incentivize accurate reports of beliefs, you will be compensated according to the following scheme. This scheme makes it in your best interest to report your true belief about the likely choice. After you report a number between 0 and 100, the computer will randomly choose a number between 0 and 100. If this number (call it n) is lower than the number you report, then you will be paid 2 Euros if the randomly selected participant chose Option B, and you will be paid 0 if that participant chose Option A. If the random number n is greater than the number you reported, then you will earn 2 Euros with a chance of n% and 0 Euros with a chance of (100-n)%.</p>
        <p>Remember:<br>
        If a participant chose Option A, he/she would receive 10 Points no matter what the participant with whom they were matched chose.<br>
        If a participant chose Option B, he/she would receive 15 Points if the participant with whom they were matched also chose Option B, and nothing if the participant with whom they were matched also chose Option A.
        </p>
        <p>What is your belief about the chances that the randomly selected participant chose Option B in Part 1 of this experiment?</p>
        <form>
            <div class='question'>
                <input name='player.part2Ans' type='number' required min='0' max='100' step='1'>
            </div>
            <br>
            <button>OK</button>
        </form>
    </span>
    <span jt-displayif='player.treatment==2'>
        <p>In this part of the experiment the computer will randomly select 20 participants from Part 1, excluding your choice and that of the participant you were matched with in that Part. How many of these participants do you think chose Option B? You will earn 2 Euros if your guess is correct.</p>
        <p>Remember:<br>
        If a participant chose Option A, he/she would receive 10 Points no matter what the participant with whom they were matched chose.<br>
        If a participant chose Option B, he/she would receive 15 Points if the participant with whom they were matched also chose Option B, and nothing if the participant with whom they were matched also chose Option A.</p>
        <p>How many of the 20 randomly selected participants do you think chose Option B?</p>
        <form>
            <div class='question'>
                <input name='player.part2Ans' type='number' required min='0' max='20' step='1'>
            </div>
            <br>
            <button>OK</button>
        </form>
    </span>
`

stage.waitToEnd = false;

stage.playerEnd = function(player) {
    var app = player.app();
    if (player.treatment == 1) {
        var otherPlayers = Utils.randomEls(player.group.playersExceptIds([player.id, player.part1PartnerId]), 20);
        player.part2OtherPlayersIds = [];
        for (var i=0; i<otherPlayers.length; i++) {
            player.part2OtherPlayersIds.push(otherPlayers[i].id);
        }
        player.part2CountStag = Utils.count(otherPlayers, 'element.part1Ans === "' + app.STAG + '"');
        if (player.part2Ans === player.part2CountStag) {
            player.part2Points = 1;
        } else {
            player.part2Points = 0;
        }
    } else {
        var n = Math.random()*100;
        player.part2n = n;
        var randomOtherPlayer = Utils.randomEl(player.group.playersExceptIds([player.id, player.part1PartnerId]));
        player.part2PartnerAns = randomOtherPlayer.part1Ans;
        if (n < player.part2Ans) {
            if (randomOtherPlayer.part1Ans === app.STAG) {
                player.part2Points = 1;
            } else {
                player.part2Points = 0;
            }
        } else {
            player.part2SecondN = Math.random()*100;
            if (player.part2SecondN < n) {
                player.part2Points = 1;
            } else {
                player.part2Points = 0;
            }
        }
    }
}
