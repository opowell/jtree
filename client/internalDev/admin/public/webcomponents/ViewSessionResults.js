class ViewSessionResults extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div id='view-session-results' class='session-tab hidden'>

            <div class='hidden'>
                <div>Link to session output:&nbsp;</div>
                <a href='#' target='_blank' id='view-session-results-filelink'></a>
            </div>

            <div>
                Variable name: <input type='text' id='chartVarName'></input>
            </div>

            <div>
                Variable select: <select type='text' id='chartVarSelect'></select>
            </div>
            <br>
            <div>
                X-axis: <select id='chartSeries'>
                <option value='periods'>Periods</option>
                <option value='apps'>Apps</option>
                <option value='groups'>Groups</option>
                <option value='participants'>Participants</option>
                <option value='fields'>Fields</option>
                </select>
            </div>
            <br>
            <div>
                Series: <select id='chartXAxis'>
                <option value='participants'>Participants</option>
                <option value='groups'>Groups</option>
                <option value='periods'>Periods</option>
                <option value='apps'>Apps</option>
                <option value='fields'>Fields</option>
                </select>
            </div>
            <br>
            <span class='btn btn-outline-primary btn-sm' onclick='jt.chartVar();'>Update</span>
            <br>
            <div>FILTERS</div>
            <div>Apps: all / select</div>
            <div>Periods: all / select</div>
            <div>Groups: all / select</div>
            <div>Players: all / select</div>

            <div class="chart-container" style="position: relative; height:30vh; width:60vw">
                <canvas id='session-data-chart'></canvas>
            </div>

        </div>
    `;
    }
}

jt.updateChartPage = function() {

}

jt.chartVar = function() {

    var colors = [
        "#3e95cd", '#3366cc', '#dc3912', '#ff9900', '#109618', '#990099',
        '#0099c6', '#dd4477', '#66aa00', '#b82e2e', '#316395', '#3366cc'
    ]
    var colorIndex = 0;

    var varName = $('#chartVarName').val();

    var ctx = document.getElementById('session-data-chart').getContext('2d');

    var data = {};
    data.datasets = [];
    data.labels = [];

    // Series
    for (var i in jt.data.session.participants) {
        var dataset = {};
        dataset.label = jt.data.session.participants[i].id
        dataset.fill = false;
        dataset.data = [];
        var color = colors[colorIndex++]
        dataset.borderColor = color;
        dataset.pointBorderColor = color;
        dataset.pointBackgroundColor = color;
        dataset.backgroundColor = color;
        data.datasets.push(dataset);
    }

    // X-Axis
    if (jt.data.session.apps.length < 1) {
        return;
    }
    var appId = 0;
    var periods = jt.data.session.apps[appId].periods;
    for (var i in periods) {

        // Add the period as a label
        data.labels.push(periods[i].id);

        // For each series, add a data point, or blank if missing
        for (var d in data.datasets) {
            var dataset = data.datasets[d];
            playerSearch: {
                for (var g in periods[i].groups) {
                    var group = periods[i].groups[g];
                    for (var pl in group.players) {
                        var player = group.players[pl];
                        if (dataset.label === player.id) {
                            // Found player for this dataset, store their data point and quit search.
                            dataset.data.push(player[varName]);
                            break playerSearch;
                        }
                    }
                }
                // If missing, add -1.
                dataset.data.push(-1);
            }
        }
    }


    var options = {
        legend: {
            position: 'right'
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                },
                scaleLabel: {
                    display: true,
                    labelString: varName
                }
            }],
            xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'Period'
                }
            }]
        },
        elements: {
            line: {
                tension: 0, // disables bezier curves
            }
        }
    }

    var chartInfo = {type: 'line', data: data, options: options};

    var myChart = new Chart(ctx, chartInfo);

}

window.customElements.define('view-session-results', ViewSessionResults);
