stage.groupStart = function(group) {
    var app = group.app();

    // Players with idInGroup 1 - cutoff are in treatment 1, the rest are in treatment 2.
    // First half of players in each treatment get part5MultT1, rest get part5MultT2.
    // Ex: N = 26, cutoff = 12.
    var N = group.players.length;
    var cutoff = Math.floor(N/4) * 2;

    // If there is an extra pair and treatment 1 gets the extra pair, adjust.
    // Ex. cont.: 12 !== 13 && suppose treatment 1 gets extra pair.
    if (
        cutoff !== Math.floor(N/2) &&
        app.treatmentForExtraPair == 1)
    {
        // Ex. cont.: cutoff = 14
        cutoff = cutoff + 2;
    }

    for (var p in group.players) {
        var plyr = group.players[p];
        plyr.treatment = (plyr.idInGroup <= cutoff) ? 1 : 2;
        if (app.allSameMultiplier != null) {
          plyr.part5Mult = app.allSameMultiplier;
        } else {
          if (plyr.treatment === 1) {
            if (plyr.idInGroup <= cutoff / 2) {
              plyr.part5Mult = app.part5MultT1;
            } else {
              plyr.part5Mult = app.part5MultT2;
            }
          } else {
            if (plyr.idInGroup <= cutoff + (N-cutoff) / 2) {
              plyr.part5Mult = app.part5MultT1;
            } else {
              plyr.part5Mult = app.part5MultT2;
            }
          }
        }
    }
}

stage.content = `
    <p>Welcome to this economic experiment! The experiment in which you are about to participate is part of a research project on decision-making.</p>
    <p>You will be asked to make various decisions and you can earn money for your decisions. Your payment will depend on both your and the other participants' decisions. How much you can earn will be announced before you have to make your decisions.</p>
    <p>All participants and their decisions will remain anonymous to other participants and the researchers. You will neither learn the true identity of your interaction partners nor will others find out about your identity. At the end of the experiment you will be privately and anonymously paid in cash the amount you earned during the experiment.</p>
    <p><i>Please note that you will not be able to ask questions about the instructions. If there is something you do not understand, read the instructions again carefully and answer to the best of your ability.</i></p>
    <p>The experiment consists of several parts. Please click OK to begin Part 1.</p>
    <form>
      <button>OK</button>
    </form>
`

//stage.waitToEnd = false;
