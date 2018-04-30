// Send messages to server.
makeOfferToBuy = function() {
    var price = $('#offerToBuyPrice').val();
    if (price === '') {
        debugger;
    }
    jt.sendMessage('makeOfferToBuy', price);
}
makeOfferToSell = function() {
    var price = $('#offerToSellPrice').val();
    if (price === '') {
        debugger;
    }
    jt.sendMessage('makeOfferToSell', price);
}

// Checks for the client.
checkIfValidOTBPrice = function() {
    var otbInput = $('#offerToBuyPrice');
    var price = parseFloat(otbInput.val());
    var max = otbInput.attr('max');
    jt.setButtonEnabled($('#makeOTBButton'), price <= max);
}
checkIfValidOTSPrice = function() {
    var input = $('#offerToSellPrice');
    var price = parseFloat(input.val());
    var shares = jt.data.player.shares;
    jt.setButtonEnabled($('#makeOTSButton'), shares > 0 && !isNaN(price));
}

var chartData = [];
var chartSetup = false;
var DATA_ASKS = 0;
var DATA_BIDS = 1;
var DATA_TRADES = 2;
var DATA_TIME = 3;
var DATA_FV = 4;
var DATA_BESTBIDS = 5;
var DATA_BESTASKS = 6;

jt.setView = function(x) {
    $('.view').hide();
    $('#' + x).show();
    $('#tradingControls > div').show();
    $('#view-' + x).hide();
}

jt.avgDiv = function() {
    var app = jt.data.player.group.period.app;
    var avgDiv = 0;
    for (var i in app.divs) {
        avgDiv = avgDiv + app.divs[i];
    }
    avgDiv = avgDiv / app.divs.length;
    return avgDiv;
}

// Run once the client page is loaded.
jt.connected = function() {

    $(function () {
      $('[data-toggle="tooltip"]').tooltip()
    })

    jt.socket.on('playerUpdate', function(player) {

        jt.bestBid = null;
        jt.bestAsk = null;

        if (!chartSetup) {

            var tradeTime = jt.data.player.stage.duration;
            var app = player.group.period.app;
            var numPeriods = app.numPeriods;
            var avgDiv = jt.avgDiv();

            const fv = calcFV();

            chartSetup = true;

            $('#fvTable').empty();

            for (var i=1; i<=numPeriods; i++) {
                var tr = $('<tr>');
                tr.append('<td>' + i + '</td>');
                tr.append('<td>' + (numPeriods - i + 1) + '</td>');
                tr.append('<td>' + avgDiv + '</td>');
                tr.append('<td>' + avgDiv*(numPeriods - i + 1) + '</td>');
                $('#fvTable').append(tr);
            }


            var ctx = document.getElementById('tradesChart').getContext('2d');

            var labels = [];
            var fvData = [];
            for (var i=1; i<=numPeriods; i++) {
                labels.push(i);
                fvData.push({
                    x: (i-1)*tradeTime,
                    y: avgDiv*(numPeriods - i + 1)
                });
                fvData.push({
                    x: i*tradeTime,
                    y: avgDiv*(numPeriods - i + 1)
                });
            }

            jt.setView('tradingChart');

            var width = $(window).width();
            ctx.canvas.width = width - 20;
            var height = $(window).height();
            console.log('set height to ' + height);
            ctx.canvas.height = height - 20;

            jt.chart = Chart.Scatter(ctx, {

                // The data for our dataset
                data: {
                     datasets: [
                         {
                             label: "Asks",
                             type: "scatter",
                             borderColor: "rgb(54, 162, 235)",
                             backgroundColor: "rgba(54, 162, 235, 0.2)",
                             data: [],
                             showLine: false,
                             pointRadius: 4
                         },
                         {
                             label: "Bids",
                             type: "scatter",
                             borderColor: "rgb(255, 99, 132)",
                             backgroundColor: "rgba(255, 99, 132, 0.2)",
                             data: [],
                             showLine: false,
                             pointRadius: 4
                         },
                         {
                             label: "Trades",
                             type: "scatter",
                             borderColor: "rgb(34, 152, 44)",
                             backgroundColor: "rgba(34, 152, 44, 0.6)",
                             data: [],
                             showLine: false,
                             pointRadius: 6
                         },
                         {
                             label: "Time",
                             type: "line",
                             data: [
                                 {
                                     x: 0,
                                     y: 0
                                 },
                                 {
                                     x: 0,
                                     y: 2*avgDiv*numPeriods
                                 }
                             ],
                             showLine: true,
                             fill: false,
                             borderColor: "rgb(241, 255, 53)"
                         },
                         {
                             label: "FV",
                             type: "line",
                             data: fvData,
                             showLine: true,
                             fill: false,
                             lineTension: 0,
                             borderColor: "rgb(0, 0, 0)",
                             pointRadius: 0
                         },
                         {
                             label: "bestBid",
                             type: "line",
                             data: [],
                             showLine: true,
                             fill: false,
                             lineTension: 0,
                             borderColor: "rgb(255, 99, 132)",
                             pointRadius: 0
                         },
                         {
                             label: "bestAsk",
                             type: "line",
                             data: [],
                             showLine: true,
                             fill: false,
                             lineTension: 0,
                             borderColor: "rgb(54, 162, 235)",
                             pointRadius: 0
                         }
                 ]
                 },
                // Configuration options go here
                options: {
                    legend: {
                        display: false
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                max: numPeriods*tradeTime,
                                min: 0,
                                stepSize: tradeTime
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                max: fv*2,
                                min: 0,
                                type: "linear"
                            }
                        }]
                    }
                }
            });

            for (var i in player.group.offers) {
                var x = player.group.offers[i];
                if (x.buyer != null) {
                    if (jt.bestBid == null || x.price > jt.bestBid) {
                        jt.bestBid = x.price;
                    }
                } else {
                    if (jt.bestAsk == null || x.price < jt.bestAsk) {
                        jt.bestAsk = x.price;
                    }
                }
                // jt.addOfferToChart(x);
            }
            jt.updateAxes();

        }

    });

    // Listen to messages from server
    jt.socket.on('playerUpdateData', function(player) {
        jt.setValues(player);
        checkIfValidOTBPrice();
        checkIfValidOTSPrice();
        jt.updateBestOffers();
    });

    setInterval(function() {jt.tickChart()}, 1000);

    jt.tickChart = function() {
        if (jt.data.player.stage.id !== 'trading') {
            return;
        }

        var curPeriod = jt.data.player.group.period.id;
        var duration = jt.data.player.stage.duration;
        var timeLeft = curPeriod*duration - jt.data.timeLeft/1000;

        jt.chart.data.datasets[DATA_TIME].data[0].x = timeLeft;
        jt.chart.data.datasets[DATA_TIME].data[1].x = timeLeft;

        if (jt.bestBid != null) {
            jt.chart.data.datasets[DATA_BESTBIDS].data.push(
                {
                    x: timeLeft,
                    y: jt.bestBid
                }
            );
        }

        if (jt.bestAsk != null) {
            jt.chart.data.datasets[DATA_BESTASKS].data.push(
                {
                    x: timeLeft,
                    y: jt.bestAsk
                }
            );
        }

        jt.chart.update();
    }

    jt.socket.on('acceptOffer', function(data) {
        var oId = data.oId;
        var curPeriod = jt.data.player.group.period.id;
        var duration = jt.data.player.stage.duration;
        var timeElapsed = data.time/1000 + (curPeriod-1)*duration;
        jt.updateBestOffers();
        var offer = findById(jt.data.player.group.offers, oId);
        if (offer == null) {
            console.log('ERROR: could not accept offer with id = ' + oId);
            return;
        }
        jt.chart.data.datasets[DATA_TRADES].data.push(
            {
                x: timeElapsed,
                y: offer.price
            }
        );
        jt.lastP = offer.price;
        jt.chart.update();
    });

    jt.socket.on('offersAdd', function(x) {
        offersAdd(x);
    });

    offersAdd = function(x) {
        jt.offersAdd(x);
        if (x.buyer != null) {
            if (jt.bestBid == null || x.price > jt.bestBid) {
                jt.bestBid = x.price;
            }
        } else {
            if (jt.bestAsk == null || x.price < jt.bestAsk) {
                jt.bestAsk = x.price;
            }
        }
        // jt.addOfferToChart(x);
        jt.updateAxes();
    }

    offersRemove = function(id) {
        jt.updateBestOffers();
    }

    jt.addOfferToChart = function(x) {
        var curPeriod = jt.data.player.group.period.id;
        var duration = jt.data.player.stage.duration;
        x.time = curPeriod*duration - jt.data.timeLeft/1000;

        var i = DATA_BIDS;
        if (x.buyer == null) {
            i = DATA_ASKS;
        }
        jt.chart.data.datasets[i].data.push(
            {
                x: x.time,
                y: x.price
            }
        );
        jt.chart.update();
    }
}

jt.updateBestOffers = function() {
    var bBid = null;
    var bAsk = null;
    let offers = jt.data.player.group.offers;
    for (let i=0; i<offers.length; i++) {
        let offer = offers[i];
        if (offer.open) {
            if (offer.buyer != null) {
                if (bBid == null || bBid < offer.price) {
                    bBid = offer.price;
                }
            } else {
                if (bAsk == null || bAsk > offer.price) {
                    bAsk = offer.price;
                }
            }
        }
    }
    jt.bestBid = bBid;
    jt.bestAsk = bAsk;

    jt.updateAxes();

}

jt.updateAxes = function() {
    var min;
    if (jt.bestBid != null) {
        min = jt.bestBid;
    } else if (jt.lastP != null) {
        min = jt.lastP;
    } else {
        min = calcFV();
    }
    // jt.chart.options.scales.yAxes[0].ticks.min = min/4;
    // jt.chart.data.datasets[DATA_TIME].data[0].y = min/4;

    var max;
    if (jt.bestAsk != null) {
        max = jt.bestAsk;
    } else if (jt.lastP != null) {
        max = jt.lastP;
    } else {
        max = calcFV();
    }
    // jt.chart.options.scales.yAxes[0].ticks.max = max*2;
    // jt.chart.data.datasets[DATA_TIME].data[1].y = max*2;

    jt.chart.update();
}

/**
 Random choose action among:
 1. offer to buy (OTB)
 2. offer to sell (OTS)
 3. buy
 4. sell
 5. do nothing
**/

randLog = function(a, b) {
    var r = Math.random();
    return Math.exp(r*Math.log(a) + (1-r)*Math.log(b))
}

calcFV = function() {
    var avgDiv = jt.avgDiv();
    var curPeriod = jt.data.player.group.period.id;
    var periodsLeft = jt.data.player.group.period.app.numPeriods - curPeriod + 1;
    return periodsLeft*avgDiv;
}

jt.autoplay = function() {
    // DRAW VALUE (val)
    var curPeriod = jt.data.player.group.period.id;
    var periodsLeft = jt.data.player.group.period.app.numPeriods - curPeriod + 1;
    var fv = calcFV();
    var bAsk = jt.bestAsk;
    var bBid = jt.bestBid;
    var lastP = jt.lastP;
    if (lastP == null) {
        lastP = fv;
    }

    var curP = fv;
    if (bAsk == null && bBid != null) {
        curP = Math.sqrt(bBid*lastP);
    } else
    if (bAsk != null && bBid == null) {
        curP = Math.sqrt(bAsk*lastP);
    } else
    if (bAsk != null && bBid != null) {
        curP = Math.sqrt(bAsk*bBid);
    }
    if (isNaN(curP)) {
        debugger;
    }
    var target = Math.sqrt(fv*curP);
    var val = randLog(target/2, target*2);
    // GET CURRENT PRICE (curP)
    if (val > target) {
        // Bid / buy
        var price = randLog(target, val).toFixed(0);
        if (bAsk != null && bAsk < price && bAsk < jt.data.player.cash) {
            // Buy
            let offers = jt.data.player.group.offers;
            for (let i=0; i<offers.length; i++) {
                let offer = offers[i];
                if (offer.open && offer.price === bAsk) {
                    if (offer.seller === jt.data.player.id) {
                        jt.sendMessage('cancelOffer', offer.id);
                        return;
                    } else {
                        jt.sendMessage('acceptOTS', offer.id);
                        return;
                    }
                }
            }
        } else if (price < jt.data.player.cash) {
            // Bid
            $('#offerToBuyPrice').val(price);
            makeOfferToBuy();
        }
    } else {
        // Ask / sell
        if (jt.data.player.shares > 0) {
            var price = randLog(val, target).toFixed(0);
            if (bBid != null && bBid > price) {
                // Sell
                let offers = jt.data.player.group.offers;
                for (let i=0; i<offers.length; i++) {
                    let offer = offers[i];
                    if (offer.open && offer.price === bBid) {
                        if (offer.buyer === jt.data.player.id) {
                            jt.sendMessage('cancelOffer', offer.id);
                            return;
                        } else {
                            jt.sendMessage('acceptOTB', offer.id);
                            return;
                        }
                    }
                }
            } else {
                // Ask
                $('#offerToSellPrice').val(price);
                makeOfferToSell();
            }
        }
    }
}
