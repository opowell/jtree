The server may be customized by modifying the contents of the `jtree/internal/settings.js` file. To overwrite option `name` with the value `value`, just add the following to the file:

```
settings.name = value
```

The following options (with default values shown) are available:

#### `defaultAdminPwd`: undefined

A password for accessing the administrator page. A value of "undefined" means no password is required.

#### `openAdminOnStart`: true

Whether or not the administrator window should open when server is started.

#### `port`: 80 on Windows, 3000 otherwise

The port which the server will run on.

#### `sessionShowFullLinks`: false

Whether or not sessions should display links with explicit session id.

#### `allowClientsToCreateParticipants`: true

Whether or not clients can login (with a valid participant ID) before the participant actually exists in the session.

#### `participantIds`: ['P1', 'P2', ..., 'P100']

A list of participant IDs to be used for sessions.

#### `waitOnTimerEnd`: true

Whether to wait for player submissions after a stage timer has expired (`true`), or whether to proceed immediately to the next stage (`false`). The former is useful if you want to allow half-finished submissions, while the second is faster (no delay in waiting for submissions) and more secure (players cannot circumvent the stage timer).

#### `mode`: 'jtree'

Whose rules apply where z-Tree, oTree and jtree differ: `'jtree'`, `'ztree'` or `'otree'`. Each
session runs by the server's mode unless it has its own: in the admin, a session's Options have
a "Rules" setting ([`session.setMode()`]{@link Session#setMode}). Starting jtree,
`node source/jtree.js --mode=ztree` or the environment variable `JTREE_MODE` set the server's.

| Where they differ | `'jtree'` | `'ztree'` | `'otree'` |
| --- | --- | --- | --- |
| A z-Tree program divides by 0, or gives no number (`sqrt(-1)`) | an error, shown in the admin; the program stops | `inf`, `-inf` or NaN, as z-Tree 5 does; it goes on | as `'jtree'` |
| A z-Tree array's index is out of range | an error; the program stops | the array's first or last element, as z-Tree 5 does | as `'jtree'` |
| A template of an older oTree app (`models.py`, Django's) shows a name it cannot find | an error | nothing, as Django does | nothing |

z-Tree's and oTree's columns were checked against z-Tree 5.1.21 and oTree 5.11.5 and 3.4.0
(`server/test/fixtures/ztree5-probe/rules.txt`, `tools/otree`).

#### Payment
`settings.json` can set the defaults for new sessions' payment:

```json
{ "session": { "suggestedNumParticipants": 4, "showUpFee": 5, "exchangeRate": 0.1, "currency": "EUR" } }
```

- `showUpFee`: money every participant is paid for taking part (default 0).
- `exchangeRate`: money per point (default 1). An app can set its own, `app.exchangeRate`.
- `currency`: what the money is in, for showing it.

A participant's payment ([`participant.payment()`]{@link Participant#payment}) is the show-up fee plus, for each app, the points they earned in it (`player.points`) times its exchange rate, rounded to cents. [`session.payments()`]{@link Session#payments} lists everyone's.
