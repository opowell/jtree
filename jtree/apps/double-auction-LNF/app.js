app.description = 'Shares are traded for experimental currency in a double auction. Shares pay random dividends every period. At the end of the game, shares are worth nothing. Reference: <a target="_blank" href="https://www.jstor.org/stable/1911361">Smith, Suchanek and Williams, 1988</a>.';

// Define parameters.
app.numPeriods  = 10;
app.endowCash   = 720;
app.endowShares = 3;
app.divs        = [0, 8, 28, 60];

// Trading stage.
var tradingStage = app.newStage('trading');
tradingStage.duration = 120;
tradingStage.groupStart = function(group) {
    group.addTable('offers');
}
tradingStage.playerStart = function(player) { // when a player starts this stage.
    if (player.periodIndex() === 1) {
        player.cash     = app.endowCash;
        player.shares   = app.endowShares;
    } else {
        player.cash     = player.old().cash;
        player.shares   = player.old().shares;
    }
}

// Results stage.
var resultsStage = app.newStage('results');
resultsStage.duration = 10; // in seconds
resultsStage.groupStart = function(group) { // when a group starts this stage
    group.dividendDraw = Utils.randomEl(app.divs);
    for (var i in group.players) { // i = 0, 1, 2, 3
        var player = group.players[i];
        player.dividends = player.shares * group.dividendDraw;
        player.cash = player.cash + player.dividends;
        // Points only recorded for last period.
        if (group.period.id === group.app().numPeriods) {
            player.points = player.cash;
        }
    }
}

//  Listen for messages from clients.
app.messages.makeOfferToBuy = function(price) {
    var player = this.participant.player;
    var offer = {price: price, makerPId: player.id, open: true, buyer: player.id};
    player.group.offers.new(offer);
}
app.messages.makeOfferToSell = function(price) {
    var player = this.participant.player;
    var offer = {price: price, makerPId: player.id, open: true, seller: player.id};
    player.group.offers.new(offer);
}
app.messages.cancelOffer = function(id) {
    var group = this.participant.player.group;
    var offer = group.offers.getRow(id);
    app.closeOffer(offer, group);
}
app.messages.acceptOTS = function(id) {
    app.acceptOffer(id, 'buy', this.participant.player);
}
app.messages.acceptOTB = function(id) {
    app.acceptOffer(id, 'sell', this.participant.player);
}

// Helper functions
app.closeOffer = function(offer, group) {
    offer.open = false;
    group.offers.save();
    group.emit('offersRemove', offer.id);
}
app.acceptOffer = function(id, action, player) {

    var group = player.group;
    var offer = group.offers.getRow(id);
    var creator = group.player(offer.makerPId);

    if (action === 'buy') {
        // exit if trade not possible
        if (creator.shares < 1 || player.cash < offer.price) {
            return;
        }
        player.shares++;
        player.cash = player.cash - offer.price;
        creator.shares--;
        creator.cash = creator.cash + offer.price;
        offer.buyer = player.id;
    } else if (action === 'sell') {
        // exit if trade not possible
        if (creator.cash < offer.price || player.shares < 1) {
            return;
        }
        player.shares--;
        player.cash = player.cash + offer.price;
        creator.shares++;
        creator.cash = creator.cash - offer.price;
        offer.seller = player.id;
    }
    group.emit('acceptOffer', {oId: offer.id, time: player.timeInStage()});
    app.closeOffer(offer, group);

    // Cancel other offers that might now be invalid.
    for (var i=0; i<group.offers.rows.length; i++) {
        var offer = group.offers.rows[i];
        if (offer.open) {
            var creator = group.player(offer.makerPId);
            if (offer.seller === offer.makerPId) {
                if (creator.shares < 1) {
                    app.closeOffer(offer, group);
                }
            }
            if (offer.buyer === offer.makerPId) {
                if (creator.cash < offer.price) {
                    app.closeOffer(offer, group);
                }
            }
        }

    }

    player.io().to(player.roomId()).emit('playerUpdateData', player.asClPlayer());
    creator.io().to(creator.roomId()).emit('playerUpdateData', creator.asClPlayer());

    player.save();
    creator.save();
}
