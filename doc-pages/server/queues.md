A queue is a list of apps with preset options for each app. They make it easy to re-use groups of pre-specified apps.

## Using a Queue

Switch to the "Queues" view in the top menu. Press the blue play button next to the Queue you wish to run. Then run the session as usual (see Quick Start).

## Creating a Queue

By default, any folder in the `apps` folder is treated as a queue. So to create a queue, simply place a group of apps in a folder in the `apps` folder. 

Alternatively, queues can be created explicitly by making a `.jtq` JSON file that follows the following template:

```javascript
{
    id: 'apps/my-queue.jtq',
    displayName: 'My Queue',
    apps: [
        {
            appId: 'apps/app1.jtt',
            options: {},
            indexInQueue: 1
        },
        {
            appId: 'apps/app2.jtt',
            options: {},
            indexInQueue: 2
        },
    ]
}
```
