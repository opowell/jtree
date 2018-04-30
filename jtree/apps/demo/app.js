app.numPeriods  = 10
app.groupSize   = 4
app.endowment   = 20
app.factor      = 2

var decideStage  = app.newStage('decide')
var resultsStage = app.newStage('results')

resultsStage.duration = 30
resultsStage.groupStart = function(group) {
    group.contributions = Utils.sum(group.players, 'contribution')
    group.production = group.contributions * app.factor
    group.prodPerPlayer = group.production / group.players.length
}
resultsStage.playerStart = function(player) {
    player.points =   app.endowment - player.contribution + player.group.prodPerPlayer
}
