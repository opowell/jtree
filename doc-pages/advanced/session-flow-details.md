This describes the sequence of events that make up a session. For a broader summary, see the <a href="tutorial-session-flow.html">basic tutorial</a>.

A participants position in the session flow is determined by the following fields: `status`, `appIndex`, `periodIndex`, `stageIndex`, and `status`. When a participant connects to a new session for the first time, these fields are initialized to the following values:
- `status = ready`
- `appIndex = -1`
- `periodIndex = 0`
- `stageIndex = 0`

### Session start / advance slowest
For each of slowest participants in the session, the participant moves to their next stage.

### Participant moves to their next stage
FUNCTION: [`Participant.moveToNextStage()`]{@link Participant#moveToNextStage}

If participant is in a stage, participant's player attempts to end their current stage.

Otherwise, participant starts their first app.

DUE TO:
- session start / advance slowest.

### Participant starts an app
FUNCTION: [`App.participantBegin()`]{@link App#participantBegin}

If [`app.started`]{@link app#started} is `false`, evaluate the app's `app.js` file. Set [`app.started`]{@link App#started} to `true`.

Call [`App.participantStart(participant)`]{@link App#participantStart}.

Participant starts the first period of the app.

DUE TO:
- session start
- player ends a stage

### Participant starts a period.
If this is the first participant to start this period, initialize the period (create players, assign players to groups).

Participant's player attempts to start first stage.

DUE TO:
- participant starting an app
- player ending a stage

### Player attempts to start a stage
1. [`player.status`]{@link Player#status} is set to `'ready'`.

2. Group attempts to start the stage.

3. If [`Stage.waitToStart`]{@link Stage#waitToStart} is `false`, player starts the stage.

DUE TO:
- participant starts a period.
- player ending a stage

### Group attempts to start a stage
If [`Stage.waitToStart`]{@link Stage#waitToStart} is `false`, or all players in group are ready, then Group starts the stage.

DUE TO:
- player attempting to start a stage.
- group ends a stage.

### Group starts a stage
1. Group timers start. When timer elapses, group wraps up the stage.
2. Run the function [`Stage.groupPlay(group)`]{@link Stage#groupPlay}.
3. If [`Stage.waitToStart`]{@link Stage#waitToStart} is `true`, then each player of the group starts the stage.

DUE TO:
- participant starting a period.

### Player starts a stage.
- If [`Stage.canParticipate(player)`]{@link Stage#canParticipate} returns `true`, then:
 - Player's status set to `'playing'`.
 - Call [`Stage.playerStart(player)`]{@link Stage#playerStart}.
 - Update clients via `playerUpdate` message.
- Otherwise, player attempts to end the stage.

DUE TO:
- participant starting a period
- participant ending a stage
- group starting a stage

### Participant enters a stage with stages
FUNCTION: [`Participant.enterRun(stage, player)`]{@link Participant#enterRun}

When a player starts a stage with stages of its own (or an app added as a stage), after `Stage.playerStart(player)`:
- The app the stage's stages run as in the player's period is made, if this is the first player of the period to start it ([`Stage.runFor(period)`]{@link Stage#runFor}).
- The participant keeps the player, in [`participant.frames`]{@link Participant#frames}, and starts that app, as they start an app of the session: its first period, their player and group in it, its first stage.

DUE TO:
- player starts a stage.

### Participant leaves a stage with stages
FUNCTION: [`Participant.exitRun()`]{@link Participant#exitRun}

When the participant has played the last stage of the last period of the app within a stage (where they would end the app):
- The app's `participantEnd(participant)` is called; it ends once everyone of its period who plays the stage has left it.
- The participant's player is the one they kept again; that player ends the stage (see player attempts to end a stage).

When the stage's time is up (its `duration` for the group, or `clientDuration` for the player), the participant leaves it the same way, from wherever they are in its stages ([`Participant.leaveRun(run)`]{@link Participant#leaveRun}); groups of its stages that were waiting for them go on without them.

DUE TO:
- player ends a stage.
- the stage's time is up.

### Group wraps up a stage
- For each player in the group, the player attempts to end this stage.

DUE TO:
- group timer elapsing.

### Player attempts to end a stage
[`Player.attemptToEndStage()`]{@link Player#attemptToEndStage}
If player is not in this stage, then stop.

----------------------
- Player's status set to `'finished'`.

- If [`Stage.waitToEnd`]{@link Stage#waitToEnd} is `false`, player ends stage.

- Player's group attempts to end stage.

DUE TO:
- submitting stage data.
- not participating.

### Player ends a stage
[`Player.endStage()`]{@link Player#endStage}

If stage is not null,
- call [`Stage.playerEnd(player)`]{@link Stage#playerEnd}.

If player's next stage is not null, player starts their next stage.
- Otherwise, if participant's next period is not null, participant starts their next period.
- Otherwise, participant ends current app (or, in a stage with stages, leaves it).

DUE TO:
- Player attempts to end a stage.
- Group ends a stage.

### Player's next stage
Call [`App.getNextStageForPlayer(player)`]{@link App#getNextStageForPlayer}.

### Participant's next period
Call [`App.getNextPeriod(participant)`]{@link App#getNextPeriod}.

### Group attempts to end a stage
- If `player.status` is `finished` for all players of group, group ends the stage.

DUE TO:
- Player attempts to end a stage.

### Group ends a stage
- If group has a stage timer, it is cancelled.

- If no stage, or [`Stage.waitToEnd`]{@link Stage#waitToEnd} is `true`, each player ends the stage.

- Call [`Stage.groupEnd(group)`]{@link Stage#groupEnd}.

- If not last stage in period:
 - group attempts to start next stage in period.
   - Cannot simply start the next stage, since it is possible that group membership changed between periods.
- Otherwise, if not the last period in the app:
 - group ends this period.

DUE TO:
- Group attempting to end a stage.

### Group ends a period
Call [`Period.groupEnd(group)`]{@link Period#groupEnd}.

If all groups have finished this period, and this period is last period of App, write output of this app to the Session's .csv file.

DUE TO:
- group ending a stage.

### Participant ends an app
If app not null, call [`App.participantEnd(participant)`]{@link App#participantEnd}.
If participant's next app is not null, participant starts next their app of session.
Otherwise, participant ends the session.

DUE TO:
- group ending a stage.
- player ending a stage.

### Participant's next app
Call [`Session.getNextApp(participant)`]{@link Session#getNextApp}, which usually returns the next app in the session app sequence for this participant (given by [`Participant.appIndex`]{@link Participant#appIndex}).

### Participant ends a session
Call [`Session.participantEnd(participant)`]{@link Session#participantEnd}.
