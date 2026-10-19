jtree has one model for what participants play: **an app is a list of stages, and a stage is an app.** A session plays its apps one after another. An app plays its stages, `numPeriods` times, in groups. A stage is one of three kinds of app:

- **A screen**: a stage with an `activeScreen` (or a screen in a file, see [designing an app](tutorial-4-designing-an-app.html)), which players fill in and submit. Most stages are screens.
- **Stages**: a stage with stages of its own, added with `stage.newStage(id)`, for example rounds within each period.
- **An app's file**: another app, or a queue of apps, added as a stage with `app.addApp(file)`.

"App", "stage" and "queue" are names for where one sits and how it is written: the apps of a session are apps; the apps of an app are its stages; a queue (a `.jtq` file) is an app whose stages are other apps, each with its options. `stage instanceof App` is true, and a stage has an app's members: `newStage`, `addApp`, `numPeriods`, `groupSize`, the hooks.

Apps written with only screens as stages run as they always have.

#### What an app says, at any level

| | an app of a session | a stage |
|---|---|---|
| `numPeriods` | how many times its stages are played | for a stage with stages: how many times they are played, each time a group reaches it (`repetitions` too, if `numPeriods` is not set) |
| `groupSize`, `numGroups`, `groupMatchingType`, `getGroupIdsForPeriod(period)` | how its players are grouped in each period | for a stage with stages: regroups its players, among those of its period; if none is set, its players keep their groups |
| `appStart()`, `end()`, `periodStart(period)`, `periodEnd(period)`, `participantStart(participant)`, `participantEnd(participant)` | its hooks | for a stage with stages, its hooks, the same: each time a group reaches it is a new run of it, which starts and ends |
| `groupStart(group)`, `playerStart(player)`, `playerEnd(player)`, `groupEnd(group)`, `waitToStart`, `waitToEnd`, `waitForAllGroups`, `canPlayerParticipate(player)` | not used: a session has no groups | the stage as a step of its app: called, and waited for, before its stages or screen begin and after they end |
| `duration` | each participant's time for it, from when they start it | each group's time for it; for a stage with stages, when it is up, its players leave its stages and end it |
| `activeScreen`, `waitingScreen` | shown around its stages' screens | for a screen, the screen; a stage with stages shows theirs |

An app's file added as a stage brings what it sets of a stage's settings (`waitToStart`, `waitToEnd`, `waitForAllGroups`, `canPlayerParticipate` and the group and player hooks); the app it is added to can set them after, as for any stage.

#### Stages within a stage

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

In each of the app's 2 periods, a group plays `intro`, then `decide` and `results` 3 times, then `questionnaire`. The screens of `decide` and `results` are on the app's page, as other stages' are, and their code is the app's: `app` in it is the app. Stage ids are the page's, so no two stages may have the same id, inside a stage or out. A player who does not play `rounds` ([can participate](tutorial-can-participate.html)) goes on to the next stage, and is not in its groups.

Stages within stages can have stages too.

#### An app's file as a stage

```javascript
app.newStage('decide');
let quiz = app.addApp('quiz.jtt');
app.addApp('more-quizzes.jtq', {level: 2});
app.newStage('results');
```

`app.addApp(file, options, id)` adds the app in `file` (relative to this app's folder: an app's file, a folder app, or a queue) as a stage, with its option values, as `session.addApp` does. The stage's id is the app's (`quiz`), with a number after it if that is taken. Each time a group reaches the stage, its players play that app, loaded afresh: its own periods, groupSize, matching, hooks and page, as when it is a session's app. Then their page goes back to this app's. Its players are the players of this app's period who play the stage. A stage with stages can have an app's file as a stage too: `stage.addApp(file)`.

Adding a session's app copies the apps it adds as stages to the session too, when they are in its folder or next to it, so that a saved session loads them.

An app meant only as a stage of others can stay out of the admin's lists of apps with `app.listed = false;`. It still loads, and is added by its file as before; Browse's "Unlisted" filter shows the apps that are not listed.

#### Queues

A queue is an app whose stages are other apps (see [queues](tutorial-queues.html)). Added to an app with `app.addApp`, it is a stage like any app. Added to a session, its apps are added to the session in its place, one after another, as the session's apps, and its script can set the session's options and hooks.

#### Periods, players and data

Each time a period of an app reaches a stage with stages, the stage's periods start again from 1: each period of the app has a run of the stage, `stage.runIn(period)`, with periods, groups and players of its own. Players in it are like players of any app: `player.period()`, `player.group`, `player.inPeriod(n)` and the rest are about the run. From a period of the run, `period.app.parentPeriod` is the period of the app it is in.

The points of players in a run are the participant's, in the app of the session it is in (see `participant.payment()`). In the session's data, each run follows the app it is in, as an app headed `APP <app>/<period>/<stage>`: for example `APP 1_myApp/2/rounds` for the run of `rounds` in period 2 of the session's first app.
