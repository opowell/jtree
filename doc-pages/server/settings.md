Settings are read from `client/settings.json` when jtree starts. Create the file if it is not there, and restart jtree after changing it:

```json
{
    "defaultAdminPwd": "choose-a-password",
    "loadSessions": true,
    "mode": "ztree"
}
```

The admin's Settings panel shows the server's settings. The following are available (defaults shown):

#### `defaultAdminPwd`: none

The admin password. Without one, the admin interface only opens on the computer running jtree; with one, everyone logs in at `/admin/login`. `admins` adds more logins: `{ "anna": { "pwd": "..." } }`.

#### `openAdminOnStart`: true

Whether to open the admin page in a browser when jtree starts.

#### `port`: 3000 (80 on Windows when started without the launchers)

The port jtree listens on. The launchers start at 3000 and take the next free port; the environment variable `PORT` sets where they start, and wins over this setting.

#### `basePath`: `'/jtree'`

The route jtree is served under when it runs without JAS (`''` for the root). The launchers serve it from the root; inside a JAS that hosts other apps, JAS sets the route.

#### `appFolders`: `['apps']`

The folders apps are read from: relative to the `client` folder, or absolute.

#### `loadSessions`: false

Whether to load the saved sessions when jtree starts. They carry on where they stopped: participants reconnect to their stage, and stage timers run on with the time they had left.

#### `allowClientsToCreateParticipants`: true

Whether, in new sessions, a participant can log in with an id the session does not have yet. Each session's Options can change it.

#### `participantIds`: `['P1', 'P2', ..., 'P99']`

The ids given to a session's participants, in order.

#### `outputDelimiter`: `';'`

The column delimiter of the session's output file.

#### `useHTTPS`: false

Whether to serve over HTTPS, with a self-signed certificate jtree makes. Only when jtree runs without JAS: under JAS, and so from the launchers, JAS decides the protocol.

#### `mode`: 'jtree'

Whose rules apply where z-Tree, oTree and jtree differ: `'jtree'`, `'ztree'` or `'otree'`. Each
session runs by the server's mode unless it has its own: in the admin, a session's Options have
a "Rules" setting ([`session.setMode()`]{@link Session#setMode}). Starting jtree,
`node source/jtree.js --mode=ztree` or the environment variable `JTREE_MODE` set the server's.

| Where they differ | `'jtree'` | `'ztree'` | `'otree'` |
| --- | --- | --- | --- |
| A z-Tree program divides by 0, or gives no number (`sqrt(-1)`) | an error, shown in the admin; the program stops | `inf`, `-inf` or NaN, as z-Tree 5 does; it goes on | as `'jtree'` |
| A z-Tree array's index is out of range | an error; the program stops | the array's first or last element, as z-Tree 5 does | as `'jtree'` |

z-Tree's column was checked against z-Tree 5.1.21 (`server/test/fixtures/ztree5-probe/rules.txt`).
oTree apps run as oTree runs them in every mode: checked against oTree 5.11.5, 3.4.0 and 2.5.8
(`tools/otree`), their templates are strict, as jtree's rules are (a name a template cannot find
is an error, also in oTree 2.5 and 3's Django templates, except before a filter: `{{ x|default:1 }}`).

#### Payment
`settings.json` can set the defaults for new sessions' payment:

```json
{ "session": { "suggestedNumParticipants": 4, "showUpFee": 5, "exchangeRate": 0.1, "currency": "EUR" } }
```

- `showUpFee`: money every participant is paid for taking part (default 0).
- `exchangeRate`: money per point (default 1). An app can set its own, `app.exchangeRate`.
- `currency`: what the money is in, for showing it.

A participant's payment ([`participant.payment()`]{@link Participant#payment}) is the show-up fee plus, for each app, the points they earned in it (`player.points`) times its exchange rate, rounded to cents. [`session.payments()`]{@link Session#payments} lists everyone's.
