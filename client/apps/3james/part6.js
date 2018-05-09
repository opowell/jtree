stage.content = `
<style>

    .cols3 > span {
        display: flex;
    }

    .cols3 > span > div {
        margin: 1rem;
        border: 1px solid;
        border-radius: 5px;
        padding-left: 1rem;
        padding-right: 1rem;
    }

    .cols3 > button {
        align-self: center;
    }

</style>

    <p style='margin-left: auto; margin-right: auto;'>
        In this Part of the experiment you will be asked to guess three numbers that are related to the contributions made by other participants in Part 5.
    </p>

    <form id='part6Form' class='cols3'>
        <span>
            <div>
                <p>
                    <b>Task 1</b><br><br>
                    <b>Two</b> participants, other than yourself and your partner from Part 5, will be randomly selected.<br><br><br>
                    Guess a number such that you think <b>one</b> of the contributions will be greater than that number, and <b>one</b> will be less than or equal to that number. <br><br>
                    If your guess is correct you will earn 2 Euros. You will also be paid if both numbers are the same and you guessed that number.
                </p>
                <p>
                    <i>Example</i><br>
                    If the randomly selected contributions were 2 and 6, you would earn 2 Euros if you guessed 2, 3, 4, or 5, and nothing otherwise.
                </p>
                <p>What is your guess?</p>
                <p class='question'>
                    <input name='player.part6Med' type='number' required min='0' jt-max='app.part5End' step='1'>
                </p>
            </div>
            <div>
                <p>
                    <b>Task 2</b><br><br>
                    <b>Four</b> participants, other than yourself and your partner from Part 5, will be randomly selected (different from the participants selected in Task 1). <br><br>
                    Guess a number such that you think <b>one</b> of the contributions will be greater than that number, and <b>three</b> will be less than or equal to that number. <br><br>
                    If your guess is correct you will earn 2 Euros. You will also be paid if all four numbers are the same and you guessed that number.
                </p>
                <p>
                    <i>Example</i><br>
                    If the randomly selected contributions were 3, 8, 15 and 18, you would earn 2 Euros if you guessed 15, 16, or 17, and nothing otherwise.
                </p>
                <p>What is your guess?</p>
                <p class='question'>
                    <input name='player.part6UpQ' type='number' required min='0' jt-max='app.part5End' step='1'>
                </p>
            </div>
            <div>
                <p>
                    <b>Task 3</b><br><br>
                    <b>Four</b> participants, other than yourself and your partner from Part 5, will be randomly selected (different from the participants selected in Tasks 1 and 2). <br><br>
                    Guess a number such that you think <b>three</b> of the contributions will be greater than or equal to that number, and <b>one</b> will be less than that number.<br><br>
                    If your guess is correct you will earn 2 Euros. You will also be paid if all four numbers are the same and you guessed that number.
                </p>
                <p>
                    <i>Example</i><br>
                    If the randomly selected contributions were 3, 9, 12 and 19, you would earn 2 Euros if you guessed 4, 5, 6, 7, 8 or 9, and nothing otherwise.
                </p>
                <p>What is your guess?</p>
                <p class='question'>
                    <input name='player.part6LowQ' type='number' required min='0' jt-max='app.part5End' step='1'>
                </p>
            </div>
        </span>

        <button>OK</button>
    </form>
`

stage.waitToEnd = false;

stage.playerEnd = function(player) {
    var app = player.app();
    var group = player.group;
    // var otherPlayers = Utils.randomEls(player.group.playersExcept(player.part5GroupPlayerIds), 10);
    var otherPlayers = group.players.filter(function(el) {
        return
            // Not a member of this player's group.
            !player.part5GroupPlayerIds.includes(el.id) &&
            // Same multiplier.
            el.part5Mult === app.part5MultT1;
    });
    player.part6OtherPlayersIds = [];
    for (var i=0; i<otherPlayers.length; i++) {
        player.part6OtherPlayersIds.push(otherPlayers[i].id);
    }

    var draw1 = 2, draw2 = 3;
    if (draw1 === draw2 && draw2 === player.part6Med) {
        player.part6MedPoints = app.part6Payoff;
    } else {
        player.part6CountMed = Utils.count(otherPlayers.slice(0, 2), 'element.part5Cont > ' + player.part6Med);
        if (player.part6CountMed == 1) {
            player.part6MedPoints = app.part6Payoff;
        } else {
            player.part6MedPoints = 0;
        }
    }

    if (draw1 === draw2 && draw2 === player.part6Med) { // TODO... draw3 and draw4
        player.part6UpQPoints = app.part6Payoff;
    } else {
        player.part6CountUpQ = Utils.count(otherPlayers.slice(2, 6), 'element.part5Cont > ' + player.part6UpQ);
        if (player.part6CountUpQ == 1) {
            player.part6UpQPoints = app.part6Payoff;
        } else {
            player.part6UpQPoints = 0;
        }
    }

    if (draw1 === draw2 && draw2 === player.part6Med) { // TODO... draw3 and draw4
        player.part6LowQPoints = app.part6Payoff;
    } else {
        player.part6CountLowQ = Utils.count(otherPlayers.slice(6), 'element.part5Cont < ' + player.part6LowQ);
        if (player.part6CountLowQ == 1) {
            player.part6LowQPoints = app.part6Payoff;
        } else {
            player.part6LowQPoints = 0;
        }
    }
}
