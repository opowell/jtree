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
