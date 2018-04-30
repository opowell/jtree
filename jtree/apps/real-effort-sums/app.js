app.description = 'Real-effort task, in which subjects have a fixed amount of time to calculate sums of numbers.';

app.resultsTime = 30; // in seconds.

app.addNumberOption('workTime', 120, 0, null, 1);
app.addNumberOption('numbersPerProblem', 3, 0, null, 1);
app.addNumberOption('maxNumber', 100, 0, null, 1);
app.addNumberOption('numProblems', 40, 0, null, 1);

app.numbers = [];
for (var i=0; i<app.numProblems; i++) {
    var problem = [];
    for (var j=0; j<app.numbersPerProblem; j++) {
        problem.push(Utils.randomInt(0, app.maxNumber));
    }
    app.numbers.push(problem);
}

// Answers are recorded as player.A1, player.A2, etc.
var workStage = app.newStage('work');
workStage.duration = app.workTime;

var resultsStage = app.newStage('results');
resultsStage.duration = app.resultsTime;
resultsStage.playerStart = function(player) { // when a player starts this stage

    let app = player.app();

    // For each correct answer, increment player points by 1.
    for (let i=0; i<app.numbers.length; i++) {

        // the problem.
        let prob = app.numbers[i];

        // calculate the answer.
        let ans = 0;
        for (let j=0; j<prob.length; j++) {
            ans = prob[j] + ans;
        }

        // check if player's answer is correct.
        if (ans === player['A' + (i+1)]) {
            player.points++;
        }
    }

    player.participant.score = player.points;

}
