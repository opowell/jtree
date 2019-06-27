These tutorials cover advanced topics.

### Technical details

jtree is a `node.js` app, packaged using `pkg`. As such, it uses standard web technologies: Javascript, CSS and HTML. Documentation is written in Markdown, then compiled to HTML using `jsdoc`. Clients and servers communicate via standard web requests and websockets (via `socket.io`).

### Mirroring arbitrary state objects on the client

Throughout a session, the game state changes on the server. Clients represent a view based on the current state. For example, the state may be:

state = {};
state.x = 5;

The state can be large, therefore when the state changes clients are given a copy of the changes, rather than a new copy of the entire state. Updates consist of changes to apply to the state, either setting new values on objects or passing arguments to specific array functions (push, unshift, splice). 

State changes are sent via message to clients. For example, the change:

state.y = 'abc';

would result in the following message:

{
    path: 'state.y',
    value: 'abc'
}

However, states may also contain circular links, and this presents problems with just passing objects in the update messages. Consider the following circular change:

state.linkToSelf = state;

A simple message update would be:

{
    path: 'state.linkToSelf',
    value: {
        x: 5,
        y: 'abc'
    }
}

The state on the client would not be the same as the state on the server, since the `value` of the update only contains a copy of `state`, rather a link to `state` itself. 

For this reason, clients store a list of all objects (including arrays) available in the state. Updates can then reference objects from this list. For example, the previous state would consist of the following object list:

[
    0: state
]

(Values that are not objects, such as strings and numbers, are not stored in this list, since it is not possible to reference them from Javascript). The revised update message for the circular link would be:

{
    path: 'state.linkToSelf',
    value: '__link__0'
}

Which tells the client to set the value of `state.linkToSelf` to the object in the list at position 0, the actual `state` object.

It is possible for an update to contain circular references within itself. For example,

let x = {}
x.y = {};
x.y.z = x;
state.x = x;

Then 