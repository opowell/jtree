stage.waitToStart = false;

stage.playerStart = function(player) {
    var app = player.app();
    player.part4Urn = Math.random() < 0.5 ? app.part4Urn1 : app.part4Urn2;
    player.part4BallColor = app.drawFromUrn(player.part4Urn);
    if (player.part4BallColor == 'Green') {
        player.part4OtherColor = 'Purple';
    } else {
        player.part4OtherColor = 'Green';
    }
}

stage.content = `
    <img src='./3james/urns.png' style='max-width: 500px; width: 100%; float: right; padding-left: 2rem;'>
    <p>In this part of the experiment there are two Urns with different numbers of Green and Purple balls, as shown in this image.</p>
    <p>One of the two Urns has been randomly selected by the computer. Urn 1 and Urn 2 have an equal chance (50%) of being selected.</p>
    <p>You do not know which Urn was selected.</p>
    <p>The computer has randomly drawn a ball from the selected Urn. This ball was <b>{{player.part4BallColor}}</b>. The ball was returned to the selected Urn.</p>
    <p></p>
    <span jt-displayif='player.treatment==1'>
        <p>After the ball was returned to the selected Urn, the computer randomly drew an additional ball, from the same selected Urn.</p>
        <p>What is your belief about the chances that this additional ball is {{player.part4BallColor}}?</p>
        <p>Please state your belief in terms of a number between 0 and 100 (for example, 0 corresponds to no chance the additional ball is {{player.part4BallColor}}, 50 corresponds to equal chances the additional ball is {{player.part4BallColor}} or the additional ball is {{player.part4OtherColor}}, and 100 corresponds to full certainty that the additional ball is {{player.part4BallColor}}).</p>
        <p>In order to incentivize accurate reports of beliefs, you will be compensated according to the following scheme. This scheme makes it in your best interest to report your true belief about the likely choice. After you report a number between 0 and 100, the computer will randomly choose a number between 0 and 100. If this number (call it n) is lower than the number you report, then you will be paid 2 Euros if the additional ball is {{player.part4BallColor}}, and you will be paid 0 if the additional ball is {{player.part4OtherColor}}. If the random number n is greater than the number you reported, then you will earn 2 Euros with a chance of n% and 0 Euros with a chance of (100-n)%.

        <p>What is your belief about the chances that the additional ball is {{player.part4BallColor}}?</p>
        <!-- Forms cannot have hidden, required inputs, so the form for each treatment must be seperate. -->
        <form>
            <span class='question'>
                <input name='player.part4Ans' type='number' required min='0' max='100' step='1'>
            </span>
            <br><br>
            <button>OK</button>
        </form>
    </span>
    <span jt-displayif='player.treatment==2'>
        <p>After the ball was returned to the selected Urn, the computer randomly drew 20 additional balls from the same selected Urn, replacing each ball before drawing the next.</p>
        <p>How many of these 20 additional balls do you think were {{player.part4BallColor}}? You will earn 2 Euros if your guess is correct.</p>
        <p>How many of the 20 additional balls do you think were {{player.part4BallColor}}?</p>
        <form>
            <div class='question'>
                <input name='player.part4Ans' type='number' required min='0' max='20' step='1'>
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
    } else {
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
    }
}
