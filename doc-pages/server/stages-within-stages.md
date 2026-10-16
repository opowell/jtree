A stage can have stages of its own, and an app can be a stage of another app. Either way, the stage is an app within its app: each time a group reaches it, its players play its stages, in periods and groups of its own, and then go on to the next stage, as from any stage. Apps whose stages have no stages run as they always have.

#### Stages within a stage

[`stage.newStage(id)`]{@link Stage#newStage} adds a stage within a stage. For example, three rounds of a decision and its results in each period of an app, between an introduction and a questionnaire:

```javascript
app.numPeriods = 2;
app.groupSize = 2;

app.newStage('intro');

let rounds = app.newStage('rounds');
rounds.numPeriods = 3;

let decide = rounds.newStage('decide');
decide.playerEnd = function(player) {
    player.points = player.x;
}
let results = rounds.newStage('results');
results.groupStart = function(group) {
    group.total = group.sum('x');
}

app.newStage('questionnaire');
```

In each of the app's 2 periods, a group plays `intro`, then `decide` and `results` 3 times, then `questionnaire`. The screens of `decide` and `results` are on the app's page, as other stages' are, and their code is the app's: `app` in it is the app. Stage ids are the page's, so no two stages may have the same id, inside a stage or out.

What a stage with stages says about them:
- `numPeriods`: how many times its stages are played (1 by default; `repetitions` is the same, if `numPeriods` is not set).
- Its players keep their groups by default: a group of the app's period plays the stages together, as a group of its own. With `groupSize`, `numGroups`, `groupMatchingType` or `getGroupIdsForPeriod(period)` set on the stage, they are regrouped, as an app's players are (see the [grouping tutorial](tutorial-grouping.html)), among the players of the app's period.
- `periodStart(period)` and `periodEnd(period)` are called for each of its periods, as an app's are.

As a stage of its app, it is like any other: `waitToStart` and `waitToEnd`, `canPlayerParticipate(player)`, and `groupStart`, `playerStart`, `playerEnd` and `groupEnd`, which are called before its stages begin and after they end. A player who does not play it ([can participate](tutorial-can-participate.html)) goes on to the next stage, and is not in its groups. It has no time limit of its own (`duration` and `clientDuration` are not used); its stages can have one.

Stages within stages can have stages too.

#### An app as a stage

[`app.addApp(file)`]{@link App#addApp} adds another app as a stage:

```javascript
app.newStage('decide');
let quiz = app.addApp('quiz.jtt');
app.newStage('results');
```

`file` is relative to the app's folder: an app's file, or a folder app. The stage's id is the app's (`quiz`), or `app.addApp(file, id)`. Each time a group reaches the stage, its players play that app, loaded afresh: its own periods, groupSize, matching, hooks and page, as when it is a session's app. Then their page goes back to this app's, and they go on to `results`. Its players are the players of this app's period who play the stage. A stage with stages can have an app as a stage too: `stage.addApp(file)`.

Adding a session's app copies the apps it adds as stages to the session too, when they are in its folder or next to it, so that a saved session loads them.

#### Periods, players and data

Each time a period of the app reaches a stage with stages, the stage's periods start again from 1: each period of the app has a run of the stage, `stage.runIn(period)`, an app with periods, groups and players of its own. Players in it are like players of any app: `player.period()`, `player.group`, `player.inPeriod(n)` and the rest are about the run. From a period of the run, `period.app.parentPeriod` is the period of the app it is in.

The points of players in a run are the participant's, in the app of the session it is in (see `participant.payment()`). In the session's data, each run follows the app it is in, as an app headed `APP <app>/<period>/<stage>`: for example `APP 1_myApp/2/rounds` for the run of `rounds` in period 2 of the session's first app.
