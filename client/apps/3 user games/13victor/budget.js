jt.connected = function() {
  jt.socket.on("playerUpdate", function(player) {
    player = JSON.parse(player);
    let containerName = 'containerDecision'
    if (player.stage.id === 'bargain') {
      containerName = 'containerBargain';
    }
    Vue.nextTick(function() {
      updateChart(player, containerName);
      if (player.stage.id === 'bargain') {
        $('#myAllocX').val(player.myAllocationProposal.x);
        $('#myAllocY').val(player.myAllocationProposal.y);
      }
    });
  });
};

jt.autoplay_decision = function() {
  let point = randomEl(jt.budgetData);
  if (jt.vue.app.treatment == 'pair') {
    if (jt.vue.player.idInGroup == 1) {
      point = jt.budgetData[0];
    } else {
      point = jt.budgetData[jt.budgetData.length - 1];
    }
  } 
  let proposal = { x: point[0], y: point[1] };
  jt.sendMessage("propose", proposal);
}

updateChart = function(player, containerName) {
  jt.chart = Highcharts.chart(containerName, {
    xAxis: {
      min: 0,
      max: 100,
      gridLineWidth: 0.5,
      tickInterval: 10,
      title: {
        text: "Good X"
      }
    },
    yAxis: {
      min: 0,
      max: 100,
      gridLineWidth: 0.5,
      tickInterval: 10,
      title: {
        text: "Good Y"
      }
    },
    title: {
      text: "Choose your preferred budget"
    },
    tooltip: {
      borderColor: "black",
      borderRadius: 2,
      borderWidth: 3,
      formatter: function() {
        return "X = <b>" + this.x + "</b>, Y = <b>" + this.y;
      },
      crosshairs: [true, true]
    },
    plotOptions: {
      series: {
        cursor: "pointer",
        point: {
          events: {
            click: function(e) {
              if (
                confirm(
                  "Your chosen budget is X=" +
                    this.x +
                    " and Y=" +
                    this.y +
                    ", is this your preferred budget?"
                )
              ) {
                let proposal = { x: this.x, y: this.y };
                jt.sendMessage("propose", proposal);
              }
            }
          }
        },
        marker: {
          lineWidth: 1
        }
      },
      line: {
        animation: false
      }
    },
    series: getSeries(player)
  });
}

getSeries = function(player) {
  let group = player.group;

  jt.budgetData = [];
  for (let i = 0; i <= group.maxX * 10; i++) {
    let x = i / 10;
    x = round(x, 2);
    let y = group.maxY - (group.maxY * i) / 10 / group.maxX;
    y = round(y, 2);
    jt.budgetData.push([x, y]);
  }

  let series = [
    {
      type: "line",
      name: "",
      color: "black",
      data: jt.budgetData,
      showInLegend: false,
      marker: {
        enabled: false
      },
      states: {
        hover: {
          lineWidth: 0
        }
      },
      enableMouseTracking: true
    }
  ];
  if (player.myProposal.x != '') {
    series.push({
      type: "scatter",
      name: "your choice",
      color: "red",
      data: [[player.myProposal.x, player.myProposal.y]],
      marker: {
        radius: 6
      }
    });
  }
  if (player.partnerProposal.x != '') {
    series.push({
      type: "scatter",
      name: "other player choice",
      color: "blue",
      data: [[player.partnerProposal.x, player.partnerProposal.y]],
      marker: {
        radius: 6
      }
    });
  }
  return series;
};
