app.groupSize   = 2;
app.pieSize     = 100;

var p1propose = app.newStage('p1propose');
p1propose.canPlayerParticipate = function(player) {
    return player.idInGroup === 1;
}
p1propose.activeScreen = `
<p>CHOOSE</p>
<p>You are Player <span jt-text='player.pName'></span>. The pie is currently <span jt-text='player.pieSize'></span>. Choose your action.</p>
<form>
    <button name='player.choice' value='TAKE'  type='submit'>Take</button>
    <button name='player.choice' value='PASS' type='submit'>Pass</button>
</form>    
`;

var p2choose = app.newStage('p2choose');
p2choose.waitForGroup = true;
p2choose.canPlayerParticipate = function(player) {
    return player.idInGroup === 2;
}

// when a group starts this stage
p2choose.groupStart = function(group) {
    var p1 = group.playerWithId(1);
    // Amount between 0 and app.pieSize for p1 to keep.
    group.proposalForP1 = p1.proposalForP1;
}

var resultsStage = app.newStage('results');
resultsStage.duration = 30; // in seconds

// when a group starts this stage
resultsStage.groupStart = function(group) {
    var p1 = group.playerWithId(1);
    var p2 = group.playerWithId(2);

    // Whether or not the proposal was accepted, true or false.
    group.accepted = p2.accepted;

    if (group.accepted) {
        p1.points = p1.proposalForP1;
        p2.points = app.pieSize - p1.proposalForP1;
        group.choice = 'ACCEPT';
    } else {
        p1.points = 0;
        p2.points = 0;
        group.choice = 'REJECT';
    }
    group.p1points = p1.points;
    group.p2points = p2.points;
}
