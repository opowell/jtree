##### PLANNED
- Generic game trees.
- Listen to incremental game changes via observer.

#### Unreleased
- The server checks forms: `app.fields` declares fields' types and limits, `stage.formFields` what a form must send, and `stage.validate(player, values)` checks them together. A form with mistakes is not stored and the page shows why.
- A player's own time for a stage (`stage.clientDuration`, or `stage.getClientDuration(player)`) is kept by the server too: a page that does not submit when the time is up is ended after `timeoutGrace`. `stage.endOnTimeout = false` keeps a timed-out stage open until the players submit.
- `period.setGroups(matrix)` in `app.periodStart` regroups a period; `app.groupByArrival` groups participants in the order they arrive.
- `player.inPeriod(n)`, `player.inAllPeriods()`, `player.inPreviousPeriods()`, and the same for groups. `group.old()` works (it threw).
- The `PARTNER_1122` and `PARTNER_1212` matchings work (they threw when a period started).
- `stage.waitForAllGroups`: no group starts the stage until every group of the period has arrived; then `stage.allGroupsStart(period)` runs, once.
- App hooks `app.appStart()`, `app.periodStart(period)` and `app.periodEnd(period)`; `app.end()` is called again when everyone has finished an app, and the app's data is written to the session's CSV file then, as before.
- When a group ends a stage that waits for everyone, players move on after `groupEnd`, not before it: the next stage, or the next period's first, no longer starts before `groupEnd` has run. Errors in `groupEnd` and `playerEnd` are logged instead of stopping the session.
- Apps as folders work: `app.jtt` with one `.jtt` file per stage beside it, added in name order (`1_decide.jtt` is stage `decide`). In a stage's file, `stage` is the stage and `app` the app. A folder's stage files no longer show up as apps of their own.
- Stage timeouts no longer depend on participants' pages: if a page does not submit within `stage.timeoutGrace` seconds (default 5) of the timeout, the server ends the stage for that player. `player.timedOut` tells `playerEnd` and `groupEnd` which players timed out.
- A syntax error in an app is reported with its line and position, also in a folder app's stage files (`app.errorFile`).
- `jt.stop()` stops a jtree started from another program, for example tests.
- Tests: `cd server && pnpm test`.
- The moving-slider feature app runs on its own.
- Saved sessions load again (the `loadSessions` setting), and carry on where they stopped: participants reconnect to their stage, groups' tables (e.g. a double auction's offers) are back, and a stage timer runs on with the time it had left when jtree stopped (paused, if the session was). Since mid-2019, session files separated each record's type with the CSV delimiter (`;`), which is not JSON, so nothing was loaded; such files are read too. Apps are loaded from the session's own copy, folder apps included.
- Participants removed from a session stay removed when it is loaded; a session that had started is not started again.
- jtree saves the time every 5 seconds (`autoSaveFreq`, previously 100), and when it stops: after a crash, restored stage timers are off by at most that much.

#### 2026.10.05 - 0.9.0
- Downloads bundle Node.js (current LTS) and run through JAS: unpack and run `start.command` (macOS), `start.cmd` (Windows) or `start.sh` (Linux). Native Apple Silicon build. Windows XP and 32-bit Windows are no longer supported.
- Admin access: without an admin password, the admin interface only opens on the computer running jtree. Set `defaultAdminPwd` in `settings.json` to log in from other computers. Previously any participant could connect as an admin.
- Session output downloads and `/api` need admin access.
- New default admin interface at `/admin` (admin2), which runs without a build step. The previous one is at `/admin/multiuser`. The Vue 2 "beta" admin is removed.
- Admin interface laid out after z-Tree at `/admin/ztree`, also without a build step.
- Server: socket.io 4, Express 5, Node.js 22 or later. Unused dependencies removed.
- Participant page: jQuery 3.7.1 (with jQuery Migrate, for code written for jQuery 1.x) and Vue 2.7.16. The old files stay in `/shared` for apps that load them.
- Downloads serve jtree from the root (`/admin/`, `/P1`). Added to a JAS that hosts other apps, jtree is served under `/jtree`.
- Starts on port 3000, or the next free port. The `PORT` environment variable sets where to start.

#### 2020.02.14 - 0.8.7
- Remove some user games.
- Add Linux compilation scripts.

#### 2020.01.24 - 0.8.6
- Queue options respect limits.
- Method to get player time in stage.

#### 2019.12.13 - 0.8.5
- Sort participants.
- Submit form on autoplay.
- Change App.onSubmit to a string, instead of a function, that gets evaluated when a stage is submitted.

#### 2019.12.12 - 0.8.4
- App option: App.isStandaloneApp or //NOTSTANDLONEAPP.
- Stage submission: check for current player, instead of just current stage name.
- disable folder queues.
- Queue options.

#### 2019.11.15 - 0.8.3
- remove "showAllStages" option.
- focus modal inputs on show.
- fix showNewApp / playerUpdate mix up at end of an App.

##### 2019.10.17 - 0.8.2.3
- CHANGED: AdminUI: default to old interface, added link to new (BETA) interface.
- FIXED: defaultClient.js: set array values using Vue.set.
- ADDED: new App (13victor).
- FIXED: bug for listening to messages on client.

##### 2019.10.17 - 0.8.2.2
- FIXED: If default port (80 or 3000) is in use, try again with new port.

##### 2019.10.08 - 0.8.2.1
- FIXED: Admin UI, broken link to shared.js.

##### 2019.10.08 - 0.8.2
- FIXED: Help tutorials.

#### 2019.10.07 - 0.8.1
- Windowed Admin interface.

##### 2019.09.24 - 0.7.17
- FIXED: # clients not updating.
- ADDED: show apps with errors.
- ADDED, Settings: suggestedNumParticipants.
- ADDED: features/chat app.
- REMOVED: features/messaging app.
- FIXED: samples/double-auction-fancy app.
- CHANGED, Group: automatically stringify and parse message data.
- ADDED: messages object on client.
Admin UI
- ADDED: Restart session (with same Apps).
- ADDED: feedback on button clicks.
- ADDED: feature app, adding external library.
- ADDED: feature chart app.

##### 2019.09.19 - 0.7.16
- ADDED: option to serve files over HTTPS instead of HTTP.
- FIXED: allow socket connections from outside local network.
- CHANGED: custom settings now located in *jtree/settings.json*.
- FIXED: edit App, set variable values.
- FIXED, Admin UI: reload apps.
- ADDED: messaging sample app.
- ADDED: table sample app.
- ADDED, setting: loadSessions (false by default).

##### 2019.09.07 - 0.7.15
- FIXED, Participant: calculate points scored in an app / session.
- FIXED, Player.js: check for whether player is already finished a particular stage.
- FIXED, 1natalia app: outcome for ultimatum game & strategy method.
- FIXED, double-auction-bootstrap app: proper check for available inventory.

##### 2019.09.06 - 0.7.14
- UPDATED: double-auction-bootstrap app.
- UPDATED: 11simone app.
- UPDATED: Admin UI, Apps view, shortened id length.
- UPDATED, App.js: added check if jt.autoplay exists before creating it.
- UPDATED, Admin UI: Display number of apps in queue properly.

##### 2019.09.04 - 0.7.13
- UPDATED: double auction app.

##### 2019.09.02 - 0.7.12
- FIXED: buttons store values for multiple periods.
- FIXED: passing methods to Vue on client.
- FIXED: removed 'updateScheduled' for Participant output.
- ADDED: Stage.showTimer field.
- ADDED: Session.allowAdminClientsToPlay field.
- UPDATED: "11simone" app.
- REMOVED: unused client files.

##### 2019.08.28 - 0.7.11
- REMOVED: unused client files.
- FIXED: bug that cleared inputs when other players finished a stage.
- UPDATED: "11simone" app.

##### 2019.08.27 - 0.7.10
- fix for ending stages automatically after timeout.

##### 2019.07.06 - 0.7.8
- script for updating version numbers.
- remove releases from repo.
- added "10ali" user app.
- added "queue" demo app.
- added "randomizedQuest" demo app.
- added "outputDelimiter" field to "Session", "App" and "Settings" objects.
- remove “Data” Session tab.
- fix duration timeouts.
- remove log statements from all apps
- re-add code to prompt during page unload

##### 2019.04.22 - 0.7.7
- send circular data in messages.
- menu collapses at smaller width.

##### 2019.04.10 - 0.7.6
- clean up icons.
- fix "double auction" app.
- re-organize apps folder.

##### 2019.03.29 - 0.7.5
- Added: display version on Home tab.
- Fix: "test" player no longer created.
- Cleaned up menu.

##### 2019.03.28 - 0.7.4
- Disable autocomplete on forms.
- Stop players advancing two periods by accident.

##### 2018.12.28 - 0.7.3
- Apps are reloaded just before first participant starts them.
- Admin UIs must be explcitly added to build.
- Removed unused admin UI files.

##### 2018.12.20 - 0.7.2
- Fix: Apps not ending correctly.

##### 2018.12.20 - 0.7.1
- catch errors in admin UI.
- Fix: Groups end stages with duration correctly.
- remove duplicate participant updates.

#### 2018.12.07 - 0.7.0
- fix stage engine
- sort participants alphanumerically when downloading output

##### 2018.11.28 - 0.6.13
- app randomization via queue (session.getApp(participant). See "random-order" app.
- Admin UI: fix Participants table showing blank spaces.
- Stage.autoplay: write autoplay code for each stage individually.
- App.periodText: text to display for "Period".


##### 2018.11.21 - 0.6.12
- update `3james` app to work with latest release.
- update `7simone` app to include two timers.
- clients run two seperate timers (stage.duration and stage.clientDuration).

##### 2018.11.16 - 0.6.11
- Fixed font size for smaller screens (phones).
- App order is customizable (Session.getApp(participant)).
- Added Utils.drawRandomly function.
- Added App.end() function.
- Queues can be defined programmatically (i.e. "session.addApp(...)");

##### 2018.11.14 - 0.6.10
- Session: fixed "Download" button.

##### 2018.11.08 - 0.6.9
- Added "Stage.getGroupDuration(group)" function to allow stage duration to be dynamic.
- Allow editing of session ids.

##### 2018.10.31 - 0.6.8
- Fix for Queue options.
- Added "timeElapsed" field to client.

##### 2018.10.22 - 0.6.7
- Added fields: App.stageWaitToStart, App.stageWaitToEnd.
- Fix for Queues in admin UI.

##### 2018.10.16 - 0.6.6
- Queues turned on by default.
- Record time spent in each stage.

##### 2018.09.27 - 0.6.5
- Integrate Vue.js on clients.
- Added: Double auction app.

##### 0.6.4
- Added Stage.getClientDuration(player) function.

##### 0.6.2
- Documentation for App.id and using static files.
- Removed console error for missing settings.js file.

##### 0.6.1
- Cleaned up extra files.

##### 0.6.0
- Show # of participants in UI.
- various model fixes.

##### 0.5.4
- Fixed docs.
- Client: fixed duration timer not displaying correctly.

##### 0.5.3
- Add: Client onClockUpdate function.

##### 0.5.2
- Fix: Participant fields not being saved on App end.

##### 0.5.1
- added Stage.clientDuration property.

#### 0.5.0
- fix for multiple periods.

##### 0.4.9
- save session data

##### 0.4.8
- catch errors when parsing client values.
- save session data on demand.
- fix to display participant points properly.

##### 0.4.7
- fix to reload apps on participant connect.

##### 0.4.6
- participant IDs can include '.' character.

##### 0.4.5
- load apps from .js and .jtt files.

##### 0.4.4
- fixes

##### 0.4.3
- added Stag Hunt game
- app UI: use brackets "{}" to indicate text that should be dynamic. Configurable in App.textMarkerBegin and App.textMarkerEnd.
- started work on WindowUI.

##### 0.4.2
- do not set attribute on 'jt-enabledIf' tags on client.
- update to Double Auction (LNF) app

##### 0.4.1
- shortcut to make client previews full screen screen
- update to Double Auction (LNF) app

#### 0.4.0
- User functionality.
- various fixes.

##### 0.3.3
- added "description" field to App Options.
- allow connections without explicit Participant ID.
- hide / show Queues.

##### 0.3.2
- refactoring admin UI.
- App "2peter": changed grouping to "stranger".

##### 0.3.1
- minor changes to some default apps.

#### 0.3.0
- split session page into tabs.
- added "Data" tab to session page.
- group buttons.
- added breakpoint to participant css.

##### 0.2.5
- participant UI: improvement to mobile view.

##### 0.2.4
- fixed: in sessions with repeats of the same app, the last player in the session would skip first instance of the app.
- added: client autoplay now uses player.id in text fields.
- added: queues prompt on delete.
- added: new App, 2peter (binary trust game with history)
- changed, autoplay: if no empty input field is found, click random submit button.
- tidied up documentation a bit

##### 0.2.3
- bug fix: timers not ending stages correctly
- added: delete session.

##### 0.2.2
- fixed: would not start without valid settings.js file.

##### 0.2.1
- include example Queue

#### 0.2.0
- fix session flow
- added app options
- added queues
- various Admin UI improvements

##### 0.1.4
- UI improvements
- started work on rooms
- changed participation links to be either 1) server/pId, or 2) server/session/sId/pId

##### 0.1.3
- added: switching between admin UIs via URL.
- added: menu to admin UI
- added: placeholders for rooms and users
- fixed: bug in autoplay that played hidden inputs.
- fixed: sessions in admin UIs showing participants from other sessions.

##### 0.1.2
- bug fix: expiry of group timers now use session message queue.
- app finished: public goods with punishment

##### 0.1.1
- added stage timers back to default apps.
- fixed bug with displaying timers on clients.
- fixed bugs with stage flow.

#### 0.1.0
- fixed stage flow pattern to match docs.

##### 0.0.11
- bug fix: clients could not use "participant" object.

##### 0.0.10
- can delete participants from admin interface.
- added "allow new participants" setting to sessions.

##### 0.0.9
- changed participant links to be x.x.x.x/PID
- added participantIds setting, allows to specify the PIDs to use on the server.

##### 0.0.8
- added 3 games: Beauty Contest, Market Entry Game, and Travellers Dilemma.
- added help.

##### 0.0.7
- updated version number

##### 0.0.5
** clients
- added "jt-value" functionality, lets you set elements to expressions instead of single variables.
- added "jt-displayIf" functionality, lets you dynamically hide or show elements.
- added "real-effort-sums" app.

##### 0.0.1
** server
- fixed bug with stage timers expiring multiple times.
** clients
- added missing sharedTemplate.js file.
- hide stage content on load.
** general
- changed default port to 80.
- hide port from participant urls if it is 80.

#### 0.0.0
- initial release
