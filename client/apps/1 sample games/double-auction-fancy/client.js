makeOffer = function(type, price) {
    if (type == 'buy') {
        jt.sendMessage("makeOfferToBuy", price);
    }
    if (type == 'sell') {
        jt.sendMessage("makeOfferToSell", price);
    }
    setOfferType('');
}

setOfferType = function(type) {
    jt.vue.offerType = type;
    if (type === 'buy') {
        $('#offerTypeBuyBtn').addClass('btn-primary');
        $('#offerTypeSellBtn').addClass('btn-secondary');
        $('#offerTypeSellBtn').removeClass('btn-primary');
        $('#offerTypeBuyBtn').removeClass('btn-secondary');
    } else if (type === 'sell') {
        $('#offerTypeSellBtn').addClass('btn-primary');
        $('#offerTypeBuyBtn').removeClass('btn-primary');
        $('#offerTypeSellBtn').removeClass('btn-secondary');
        $('#offerTypeBuyBtn').addClass('btn-secondary');
    } else {
        $('#offerTypeBuyBtn').addClass('btn-secondary');
        $('#offerTypeSellBtn').addClass('btn-secondary');
        $('#offerTypeSellBtn').removeClass('btn-primary');
        $('#offerTypeBuyBtn').removeClass('btn-primary');
        jt.vue.offerPrice = p;
    }
}

let chartSetup = false;
let DATA_count = 0;
let DATA_TRADES = DATA_count++;
let DATA_TIME = DATA_count++;
let DATA_BESTBIDS = DATA_count++;
let DATA_BESTASKS = DATA_count++;
let DATA_FV = DATA_count++;

jt.avgDiv = function() {
    let app = jt.vue.player.group.period.app;
    let avgDiv = 0;
    for (let i in app.divs) {
        avgDiv = avgDiv + app.divs[i];
    }
    avgDiv = avgDiv / app.divs.length;
    return avgDiv;
}

let chartLoaded = false;

jt.connected = function() {

    jt.socket.on('playerUpdate', function(player) {

        player = JSON.parse(player);

        jt.bestBid = null;
        jt.bestAsk = null;

        let app = player.group.period.app;
        
        if (!chartLoaded) {

            chartLoaded = true;

            let tradeTime = app.tradingTime;
            let numPeriods = app.numPeriods;
            let avgDiv = jt.avgDiv();
            let maxY = avgDiv*numPeriods + 100;

            let labels = [];
            let fvData = [];
            for (let i=1; i<=numPeriods; i++) {
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

            let tradeData = [];
            let offers = player.group.offers;
            for (let i=0; i<offers.length; i++) {
                let offer = offers[i];
                if (offer.buyer != null && offer.seller != null) {
                    tradeData.push(
                        {
                            x: offer.timeElapsed,
                            y: offer.price
                        }
                    );
                }
            }

            let timeLeft = calcTimeLeft(player);
            
            let ctx = document.getElementById('tradesChart').getContext('2d');

            let chartDatasets = [
                {
                    label: "Trades",
                    type: "scatter",
                    pointBorderColor: "rgb(54, 162, 235)",
                    pointBackgroundColor: "rgba(54, 162, 235, 0.2)",
                    data: tradeData,
                    showLine: false,
                    pointRadius: 4
                },
                {
                    label: "Time",
                    type: "line",
                    data: [
                        {
                            x: timeLeft,
                            y: 0
                        },
                        {
                            x: timeLeft,
                            y: maxY
                        }
                    ],
                    showLine: true,
                    fill: false,
                    borderColor: "rgba(241, 255, 53, 0.7)"
                },
                {
                    label: "bestBid",
                    type: "line",
                    data: [],
                    showLine: true,
                    fill: false,
                    borderColor: "rgba(34, 152, 44, 0.4)",
                    lineTension: 0,
                    pointRadius: 0
                },
                {
                    label: "bestAsk",
                    type: "line",
                    data: [],
                    showLine: true,
                    fill: false,
                    lineTension: 0,
                    borderColor: "rgba(255, 99, 132, 0.4)",
                    pointRadius: 0
                },
                {
                    label: "FV",
                    type: "line",
                    data: fvData,
                    showLine: true,
                    fill: false,
                    lineTension: 0,
                    borderColor: "rgb(200, 200, 200)",
                    pointRadius: 0
                }
            ];

            jt.chart = Chart.Scatter(ctx, {

                data: {
                     datasets: chartDatasets
                },
                options: {
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            fontSize: 20,
                        }
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
                                max: maxY,
                                min: 0,
                                type: "linear"
                            }
                        }]
                    }
                }
            });


        }

    });

    setInterval(function() {jt.tickChart()}, 1000);

    jt.tickChart = function() {
        if (jt.vue.player.stage.id !== 'trading') {
            return;
        }

        let timeLeft = calcTimeLeft(jt.vue.player);

        jt.chart.data.datasets[DATA_TIME].data[0].x = timeLeft;
        jt.chart.data.datasets[DATA_TIME].data[1].x = timeLeft;

        if (jt.vue.bestBid != null) {
            jt.chart.data.datasets[DATA_BESTBIDS].data.push(
                {
                    x: timeLeft,
                    y: jt.vue.bestBid
                }
            );
        }

        if (jt.vue.bestAsk != null) {
            jt.chart.data.datasets[DATA_BESTASKS].data.push(
                {
                    x: timeLeft,
                    y: jt.vue.bestAsk
                }
            );
        }

        jt.chart.update();
    }

    jt.socket.on('acceptOffer', function(data) {
        let oId = data.oId;
        let offer = findById(jt.vue.group.offers, oId);
        if (offer == null) {
            console.log('ERROR: could not accept offer with id = ' + oId);
            return;
        }
        let time = (jt.vue.period.id-1)*jt.vue.stage.duration + data.time/1000;
        jt.chart.data.datasets[DATA_TRADES].data.push(
            {
                x: time,
                y: offer.price
            }
        );
        jt.chart.update();
    });

}

calcTimeLeft = function(player) {
    let period = player.group.period;
    let curPeriod = period.id;
    let duration = player.stage.duration;
    let timeLeft = curPeriod*duration - player.stageTimerTimeLeft/1000;
    return timeLeft;
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
    let r = Math.random();
    return Math.exp(r*Math.log(a) + (1-r)*Math.log(b))
}

calcFV = function() {
    let avgDiv = jt.avgDiv();
    let curPeriod = jt.vue.player.group.period.id;
    let periodsLeft = jt.vue.player.group.period.app.numPeriods - curPeriod + 1;
    return periodsLeft*avgDiv;
}

jt.autoplay_trading = function() {
    let fv = calcFV();
    let bAsk = jt.vue.bestAsk;
    let bBid = jt.vue.bestBid;

    let curP = jt.vue.lastTradePrice;
    if (curP == null) {
        curP = fv;
    }
    if (bAsk == null && bBid != null) {
        curP = Math.sqrt(bBid*curP);
    } else
    if (bAsk != null && bBid == null) {
        curP = Math.sqrt(bAsk*curP);
    } else
    if (bAsk != null && bBid != null) {
        curP = Math.sqrt(bAsk*bBid);
    }
    if (isNaN(curP)) {
        debugger;
        return;
    }
    let target = Math.sqrt(fv*curP);
    let val = randLog(3*target/2, 2*target/3);
    console.log(`TRADING: curP = ${curP}, target = ${target}, val = ${val}`);
    // GET CURRENT PRICE (curP)
    let price = randLog(target, val).toFixed(0);
    if (val > target) {
        // Bid / buy
        if (bAsk != null && bAsk < price && bAsk < jt.vue.player.cashAvailable) {
            console.log('TRADING: trying to buy for ' + bAsk);
            // Buy
            let offers = jt.vue.offersToSell;
            for (let i=0; i<offers.length; i++) {
                let offer = offers[i];
                if (offer.price === bAsk) {
                    if (offer.seller === jt.vue.player.id) {
                        jt.sendMessage('cancelOffer', offer.id);
                        return;
                    } else {
                        jt.sendMessage('acceptOTS', offer.id);
                        return;
                    }
                }
            }
        } else if (price < jt.vue.player.cashAvailable) {
            // Bid
            console.log('TRADING: offering to buy for ' + price);
            jt.sendMessage("makeOfferToBuy", price);
        }
    } else {
        // Ask / sell
        if (jt.vue.player.sharesAvailable > 0) {
            if (bBid != null && bBid > price) {
                console.log('TRADING: selling for ' + bBid);
                // Sell
                let offers = jt.vue.offersToBuy;
                for (let i=0; i<offers.length; i++) {
                    let offer = offers[i];
                    if (offer.open && offer.price === bBid) {
                        if (offer.buyer === jt.vue.player.id) {
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
                jt.sendMessage("makeOfferToSell", price);
            }
        }
    }
}
