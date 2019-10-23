This tutorial describes the sequence of events that happen during a session. In particular, it points out the various functions that can be used to design an app. For more details about this procedure, see the <a href="tutorial-session-flow-details.html">advanced tutorial</a>.

In a session, participants play through a sequence of apps.
When playing through an app, each participant:

1. Starts the app, (`app.start()`)
2. Plays through repetitions of the app's subgames, if any.
3. Ends the app. (`app.end()`)

The number of repetitions is `app.numPeriods`. A repetition is called a `period`. During a period, a participant:

1. Starts the period (`app.startPeriod(i)`).
2. Plays through each of the app's subgames.
3. Ends the period (`app.endPeriod(i)`).

Notice that the previous two definitions refer to each other. That is, playing through an app can include playing through periods, which include playing through apps. So playing through subgames takes place precisely as described in "playing through an app".

For example, consider the following game structure:
1. intro
2. game [3 times]
  1. decide
  2. results
3. conclusion

The sequence of events would be:
* intro.start()
* intro.end()
* game.start()
  * game.startPeriod(1)
    * decide.start()
    * decide.end()
    * results.start()
    * results.end()
  * game.endPeriod(1)
  * game.startPeriod(2)
    * decide.start()
    * decide.end()
    * results.start()
    * results.end()
  * game.endPeriod(2)
  * game.startPeriod(3)
    * decide.start()
    * decide.end()
    * results.start()
    * results.end()
  * game.endPeriod(3)
* game.end()
* conclusion.start()
* conclusion.end()

### Groups vs. Players
Within each `period`-`app` pair, a participant is represented by a `player` object. Players form part of groups. Each function is first evaluated for the group, then for each of the players in the group.

All participants begin in the same group. By default, groups play through periods independently of one another.

A group `g` playing through an app `app` looks like:
* `app.startGroup(g)`
* For each player `p` in `g`:
  * `app.startPlayer(p)`
* Create subgroups.
* For each subgroup `sg`, independently:
  * For each period `i` in `1:app.numPeriods`:
    * `app.startPeriodGroup(i, sg)`
    * For each player `p` in `sg`:
      * `app.startPeriodPlayer(p)`
    * For each subgame `subApp` in `app`:
      * `sg` plays through `subApp`.
    * `app.endPeriodGroup(i, sg)`
* `app.endGroup(g)`
* For each player `p` in `g`:`
  * `app.endPlayer(p)`

Suppose in the example above that players play the `game` app in groups of two, and that the session contains four participants (`P1`, ..., `P4`). Then the actual sequence of events is:
* intro.startGroup(G)
* intro.startPlayer(G-P1)
* intro.startPlayer(G-P2)
* intro.endGroup(G)
* intro.endPlayer(G-P1)
* intro.endPlayer(G-P2)
* game.startGroup(G)
* game.startPlayer(G-P1)
* game.startPlayer(G-P2)
* For each repetition:
* game.createGroups(G) -> G1, G2
* game.startPeriodGroup(1, G1)
* game.startPeriodPlayer(1, G1-P1)
* game.startPeriodPlayer(1, G1-P2)
* decide.startGroup(G1)
* decide.startGroup(G1)
* decide.end()
* results.start()
* results.end()
* game.endPeriod(1)
* game.startPeriod(2)
    * decide.start()
    * decide.end()
    * results.start()
    * results.end()
  * game.endPeriod(2)
  * game.startPeriod(3)
    * decide.start()
    * decide.end()
    * results.start()
    * results.end()
  * game.endPeriod(3)
* game.end()
* conclusion.start()
* conclusion.end()

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
