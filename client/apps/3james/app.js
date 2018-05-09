app.numGroups   = 1;
app.showUpFee   = 2; // Euros

// Part 1
app.STAG = 'B';
app.HARE = 'A';
app.payoff_a = 6;
app.payoff_b = 4;
app.payoff_c = 0;
app.payoff_d = 4;
app.part1Payoff = function(player) {
    if (player.part1Ans === app.STAG) {
        if (player.part1PartnerAns === app.STAG) {
            return app.payoff_a;
        } else {
            return app.payoff_c;
        }
    } else {
        if (player.part1PartnerAns === app.STAG) {
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
app.part5End    = 20;
app.part5MultT1 = 1.2;
app.part5MultT2 = 1.9;
app.part5ExchRate = 0.2; // Euros per point.
app.part6Payoff = 2;

app.addStage('intro');
app.addStage('part1');
app.addStage('part2');
app.addStage('part3');
app.addStage('part4');
app.addStage('part5');
app.addStage('part6');
app.addStage('part7');
app.addStage('questionnaire');
app.addStage('results');
