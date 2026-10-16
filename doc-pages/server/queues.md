A queue is an app whose stages are other apps, each with preset options (see [apps and stages](tutorial-apps-and-stages.html)). Adding a queue to a session adds its apps to the session in its place, in order, as the session's apps; adding it to an app (`app.addApp('my-queue.jtq')`) makes it a stage of that app, like any app. Queues make it easy to re-use groups of pre-specified apps.

## Using a Queue

Queues are listed with the apps, marked as queues. Open one to see its apps, then press "New session with this queue", or "Add to open session" to add its apps to the session that is open. Then run the session as usual (see Quick Start).

## Creating a Queue

A queue is a `.jtq` file in the `apps` folder. It is a script that adds apps to the session, which it calls `session`:

```javascript
session.addApp('app1.jtt', {treatment: 'A'});
session.addApp('app1.jtt', {treatment: 'B'});
session.addApp('other-queue.jtq');
```

Paths are relative to the `.jtq` file. A queue can add other queues, whose apps are added in their place. An app adds apps the same way, as its stages: `app.addApp('app1.jtt', {treatment: 'A'})`.

From an app's panel, "Add to queue…" adds that app to the end of a queue's file.

## Session options and hooks

A queue's script runs against the session, so it can also declare session options, set session fields, and replace session behaviour:

```javascript
session.addNumberOption('rounds', 3, 1, 10, 1, 'Number of rounds');

session.participantStart = function(participant) { ... };
session.getApp = function(participant) { ... };
```

Options given when the queue is added to a session are set on the session before the script runs.

These act on the whole session, not just the queue's apps. Added to an app instead, the queue declares them on itself: its options are set with `app.addApp('my-queue.jtq', {rounds: 5})`, and its hooks (`participantStart`, ...) are an app's. A hook such as `session.getApp` that picks apps by their index in `session.apps` assumes the queue's apps are the only ones in the session, so add such a queue on its own.

## Older JSON queues

`.jtq` files in the older JSON format still work:

```javascript
{
    "displayName": "My Queue",
    "apps": [
        "app1",
        {"appId": "app2", "options": {"treatment": "B"}}
    ]
}
```

An `appId` without an extension is a `.jtt` file next to the queue.
