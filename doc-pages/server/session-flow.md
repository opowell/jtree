This tutorial describes the sequence of events that happen during a session. In particular, it points out the various functions that can be used to design an app. For more details about this procedure, see the <a href="tutorial-session-flow-details.html">advanced tutorial</a>.

In jtree, participants progress through a session which consists of apps, periods and stages. In doing so, they take the form of players and groups. Broadly speaking, each object calls `playerStart` (or `groupStart`) and `playerEnd` (or `groupEnd`) whenever a player (or group) begins or finishes that part of the experiment. Designing the logic of the app is simply a matter of overwriting these methods.

This is done in the app's `app.js` file. This file has access to the `App` object, from which Stages can be created and customized via the [`App.newStage(id)`]{@link App#newStage} function. Periods can be customized by overwriting the [`App.createPeriod(id)`]{@link App#createPeriod} method.

The rest of this tutorial describes approximately the order in which events take place within a session. Due to the option of letting participants progress through different stages without waiting for each other, the actual order of these events may differ in actual sessions.

At the beginning of an app, the following functions are called:

```javascript
eval(app.js) // evaluates the contents of app.js
App.participantStart(participant)
// Clients are updated via a "startNewApp" message.
// Participants go through the Periods of the App.
App.participantEnd(participant)
```

Within the app, participants go through a series of periods. At the beginning of the period, participants are assigned to a player, and the players are assigned to groups, according to the output of [`App.getGroupIdsForPeriod(period)`]{@link App#getGroupIdsForPeriod}. Thus, each period calls the following functions:

```javascript
App.getGroupIdsForPeriod(period)
Period.groupStart(group)
Period.playerStart(player)
// Players go through the stages of the app.
Period.playerEnd(player)
Period.groupEnd(group)
```

Within the period, players and groups progress through the stages of the app. Within each stage, the following functions are called for the groups and players:

1. `player.status` is set to `'ready'`.
2. If `Stage.waitToStart == true`, pause here until all players are ready.
3. `Stage.groupStart(group)` is called.
4. `player.status` is set to `'playing'`.
5. `Stage.playerStart(player)` is called.
6. Players are shown the active screen.
7. `player.status` is set to `'finished'`.
8. If `Stage.waitToEnd == true`, pause here until all players are finished.
9. `Stage.playerEnd(player)` is called.
10. `player.status` is set to `'done'`.
11. Player begins procedure for next stage in session, if any.
12. Once all players in the group have ended the stage, `Stage.groupEnd(group)` is called.
13. Group begins procedure for next stage in session, if any.

If [`Stage.waitToStart`]{@link Stage#waitToStart} is `true`, no player can start the stage (Step 3) until all players in the group are ready.
If [`Stage.waitToEnd`]{@link Stage#waitToEnd} is `true`, no player can end the stage (Step 9) until all players in the group are finished.
As soon as a player ends the stage, they move to the next stage in the session (if there is one) and begin again at the first step of this procedure.

Groups belong to Periods. This means that whenever a stage has `waitToStart` as false, groups can "start" that stage before finishing one or more of the group's previous stages.
