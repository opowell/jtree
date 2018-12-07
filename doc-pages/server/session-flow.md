This tutorial describes the sequence of events that happen during an app. In particular, it points out the various functions that can be used to design an app. For more details about this procedure, see the <a href="tutorial-session-flow-details.html">advanced tutorial</a>.

In a jtree app, participants progress through a series of periods and stages. Within each period repeats the stages. In doing so, they take the form of players and groups. Broadly speaking, each object calls `playerStart` (or `groupStart`) and `playerEnd` (or `groupEnd`) whenever a player (or group) begins or finishes that part of the experiment.

For example, in a simple app the sequence of events might be:
1. stage1.groupStart(G1);
2. stage1.playerStart(P1);
3. stage1.playerStart(P2);
4. stage1.playerEnd(P1);
5. stage1.playerEnd(P2);
6. stage1.groupEnd(G1);

(Note that the order of the player functions (P1, P2) depends on how quickly each player progresses through the app.)

The logic of the app is implemented by overwriting each of these "start" and "end" methods.

This is done in the app's source file. This file has access to the `{@link App}` object, from which Stages can be created via the [`App.newStage(id)`]{@link App#newStage} function. Periods can be customized by overwriting the [`App.createPeriod(id)`]{@link App#createPeriod} method.

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

Within each period, players and groups progress through the stages of the app. Within each stage, the following functions are called for the groups and players:

1. `player.status` is set to `'ready'`.
2. If `Stage.waitToStart == true` and not all players in group are ready, stop.
3. If `Stage.groupStart(group)` has not already been called, call it.
4. If `Stage.canPlayerParticipate(player)` is true:
  1. `player.status` is set to `'playing'`.
  2. `Stage.playerStart(player)` is called.
  3. Players are shown the active screen.
  4. `player.status` is set to `'done'`.
  5. If `Stage.waitToEnd == true` and not all players in group are done, stop.
  6. `Stage.playerEnd(player)` is called.
5. `player.status` is set to `'finished'`.
6. Player begins from step 1 for next stage in session, if any.
7. Once all players in the group have ended the stage, `Stage.groupEnd(group)` is called.
8. Group begins procedure for next stage in session, if any.

When a session is started, all players begin the first app of the session.

If [`Stage.waitToStart`]{@link Stage#waitToStart} is `true`, no player can start the stage (Step 3) until all players in the group are ready.
If [`Stage.waitToEnd`]{@link Stage#waitToEnd} is `true`, no player can end the stage (Step 9) until all players in the group are finished.
As soon as a player ends the stage, they move to the next stage in the session (if there is one) and begin again at the first step of this procedure.

Groups belong to Periods. This means that whenever a stage has `waitToStart` as false, groups can "start" that stage before finishing one or more of the group's previous stages.
