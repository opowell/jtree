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
