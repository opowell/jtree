stage.waitToStart = false;

stage.content = `

    <p>In this part of the experiment you will be a matched with another participant as part of a project. Each of you has to decide on the allocation of {{app.part5End}} points. You can put these {{app.part5End}} points into your <b>private account</b> or you can contribute them <b>fully or partially</b> into a project. Each point you do not contribute to the project will automatically remain in your private account.</p>

    <p><b>Your income from the private account</b><br>
    You will earn one point for each point you put into your private account. No one except you earns something from your private account.</p>

    <p><b>Your income from the project</b><br>
    Your contribution to the project will be added to the other participant's contribution. The combined contributions will be increased by {{((player.part5Mult-1)*100).toFixed(0)}}% (multiplied by {{player.part5Mult}}), then divided equally between you and the other participant. The income for both you and the other participant will be determined as follows:<br>
    <i><b>Income from the project</b> = (sum of both contributions × {{player.part5Mult}})/2</i></p>

    <p><b>Total income</b><br>
    Your total income is the sum of your income from your private account and your income from the project. Each point will be converted to {{app.part5ExchRate}} Euros. </p>

    <p>To help you make your decision you may use the Income Calculator below to see how much you and the other participant would earn for different combinations of contributions:
    <ol>
        <li>Enter a number as your contribution.</li>
        <li>Enter a number as the other participant's contribution.</li>
        <li>Click "Check Incomes" to see how much you and the other participant would earn for these combinations.</li>
    </ol>
    <i>Numbers you enter into the Income Calculator will not affect your final payment in this experiment.</i></p>

    <p>When you have decided how much to contribute to the project, enter this into the box below the Income Calculator and click "Confirm Contribution".</p>

    <div style='
    border: 1px solid #888;
    padding: 1rem;
    margin: 1rem;
    display: grid;
    grid-template-columns: auto auto;
    grid-row-gap: 0.5rem;
    grid-column-gap: 0.5rem;
    width: fit-content;
    '>
        <b style='grid-column: span 2;'>Income Calculator</b>
        Your contribution:
        <input type='number' size=3 min=0 jt-max='app.part5End' step=1 style='width: fit-content' id='myCont'>
        Other's contribution:
        <input type='number' size=3 min=0 jt-max='app.part5End' step=1 style='width: fit-content' id='otherCont'>
        <button style='grid-column: span 2;' onclick='jt.updateCalculator();'>Check Incomes</button>
        Your contribution:
        <span id='myContDisp'></span>
        Other's contribution:
        <span id='otherContDisp'></span>
        Your earnings:
        <span id='myEarnings' style='width: 17rem;'></span>
        Other's earnings:
        <span id='otherEarnings'></span>
    </div>
    <script>
        jt.updateCalculator = function() {
            var myCont = parseInt($('#myCont').val());
            var otherCont = parseInt($('#otherCont').val());
            if (!isNaN(myCont) && !isNaN(otherCont)) {
                var end = jt.data.player.stage.app.part5End;
                var mult = jt.data.player.part5Mult;
                $('#myContDisp').text(myCont);
                $('#otherContDisp').text(otherCont);
                var p5c = $('#part5Calcs');
                if (p5c.val().length > 0) {
                    p5c.val(p5c.val() + ',');
                }
                p5c.val(p5c.val() + '(' + myCont + ',' + otherCont + ')');
                var myEarnings = round(end - myCont + (myCont + otherCont) * mult / 2, 2);
                var otherEarnings = round(end - otherCont + (myCont + otherCont) * mult / 2, 2);
                $('#myEarnings').text(end + ' - ' + myCont + ' + (' + myCont + ' + ' + otherCont + ') x ' + mult + '/2 = ' + myEarnings);
                $('#otherEarnings').text(end + ' - ' + otherCont + ' + (' + otherCont + ' + ' + myCont + ') x ' + mult + '/2 = ' + otherEarnings);
            }
        }
    </script>

    <p>How much do you want to contribute to the project?</p>

    <form>
        <input hidden name='player.part5Calculations' id='part5Calcs'>
        <span class='question'>
            <input name='player.part5Cont' required type='number' min='0' jt-max='app.part5End' step='1'>
        </span>
        <p><button>Confirm Contribution</button></p>
    </form>
`

stage.groupEnd = function(group) {
    var app = group.app();
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
