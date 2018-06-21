// Utility functions
eval(fs.readFileSync(path.join(app.jt.path, 'internal/clients/shared/utilsFns.js')) + '');

// Prepare 'app' object.
app.title       = 'Dutch Auction';
app.description = '(UNDER CONSTRUCTION) An item is auctioned to a group of players. Price ticks down until one player accepts the current price.';
app.author      = 'Owen Powell - opowell@gmail.com';

app.numPeriods  = 10;
app.groupSize   = 3;

// Starting at priceMax, every priceTickFreq ms, the current price (curPrice) is
// decreased by priceTickSize until either at least one player opts-in or
// priceMin is reached.
app.priceMax        = 55;
app.priceMin        = 0;
app.priceTickSize   = 1;
app.priceTickFreq   = 2000; // in ms

// Player values are drawn uniformly from [valueMin, valueMax].
app.valueMin = 10;
app.valueMax = 50;

app.addClient = function(client) {

    // Listen for opt-in from this client.
    client.on('opt-in', function(a) {
        var player = client.participant.player;
        var group = player.group;
        console.log('opt-in by player ' + player.id + ' for a max price of ' + a + ' in group ' + group.id);

        // CHECKS
        // If not valid, return.
        a = parseInt(a);
        if (a <= 0 || a == null) {
            return false;
        }
        // If not higher than or equal to current price, return.
        if (a < group.curPrice) {
            return false;
        }
        // If we already have a winner, return
        if (group.foundWinner == true) {
            return false;
        }

        // Valid price, proceed.
        group.foundWinner = true;
        clearTimeout(group.priceTimer);
        player.optInValue = group.curPrice;
        player.points = player.value - player.optInValue;
        group.winningPrice = player.optInValue;
        group.winnerName = player.id;
        group.moveToNextStage();
    });
}

// DEFINE STAGES
var decideStage = app.newStage('decide');
decideStage.waitForGroup = true;

decideStage.playerPlay = function(player) {
    // When a player starts this stage, draw a new value.
    player.value = randomInt(app.valueMin, app.valueMax);
}

decideStage.groupPlay = function(group) {
    group.curPrice      = app.priceMax;
    group.foundWinner   = false;
    group.winnerName    = '';
    group.updatePrice = function() {
        // If finished, stop the timeout.
        if (
            group.curPrice <= group.app().priceMin ||
            group.foundWinner == true
        ) {
            clearTimeout(group.priceTimer);
            group.moveToNextStage();
        }
        // Otherwise, update the price.
        else {
            group.curPrice = group.curPrice - group.app().priceTickSize;
            group.emit('set-price', group.curPrice);
        }
    }
    // http://stackoverflow.com/questions/457826/pass-parameters-in-setinterval-function
    group.priceTimer = setInterval(function() {group.updatePrice()}, group.app().priceTickFreq);
    group.outputHide.push('priceTimer'); // do not display or send to client
    group.emit('set-price', group.curPrice);
}


var resultsStage = app.newStage('results');
resultsStage.duration = 30 * 1000; // in ms
