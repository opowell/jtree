// Rooms: a lasting link where participants wait, by label, until a session is opened in it.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { io: ioClient } = require('socket.io-client');
const { startServer } = require('./harness.js');
const Room = require('../source/Room.js');
const python = require('../source/dialects/otree/runtime.js');

let server;
const sockets = [];
before(async () => { server = await startServer(); });
after(async () => { sockets.forEach(s => s.close()); await server.close(); });

/** A room page's socket, for label in room; resolves once logged into the room. */
async function joinRoom(roomId, label) {
    const socket = ioClient(server.url, { path: '/socket.io', transports: ['websocket'], forceNew: true,
        query: { id: label, type: 'PARTI', roomId } });
    sockets.push(socket);
    socket.redirects = [];
    socket.on('roomGoToSession', (d) => socket.redirects.push(d.url));
    socket.on('roomFull', () => socket.redirects.push('full'));
    await new Promise((resolve) => socket.once('loggedIntoRoom', resolve));
    return socket;
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

test('participants wait in a room, and go into the session opened in it, by their label', async () => {
    const room = new Room.new('lab', server.jt);
    room.useSecureURLs = false;
    room.labels = ['A', 'B', 'C'];
    server.jt.data.addRoom(room);
    const session = server.createSession(server.writeApp('room.jtt', `app.newStage('s');`), { numParticipants: 2 });

    const a = await joinRoom('lab', 'A');
    await wait(100);
    assert.deepEqual(a.redirects, []);

    server.jt.socketServer.msgs.roomOpenSession({ roomId: 'lab', sessionId: session.id });
    await wait(100);
    assert.deepEqual(a.redirects, ['/session/' + session.id + '/P1']);
    assert.equal(session.participants.P1.label, 'A');

    // Joining later: straight in; again with the same label: the same participant.
    const b = await joinRoom('lab', 'B');
    const a2 = await joinRoom('lab', 'A');
    await wait(100);
    assert.deepEqual(b.redirects, ['/session/' + session.id + '/P2']);
    assert.deepEqual(a2.redirects, ['/session/' + session.id + '/P1']);
    // No place left for C.
    const c = await joinRoom('lab', 'C');
    await wait(100);
    assert.deepEqual(c.redirects, ['full']);
    assert.equal(room.shell().sessionId, session.id);
});

test("an oTree project's ROOMS are rooms, with labels from its participant_label_file", async () => {
    await python.ready();
    server.jt.data.loadAppDir(path.join(__dirname, 'fixtures/otree'));
    const lab = server.jt.data.room('lab');
    assert.deepEqual([lab.displayName, lab.labels, lab.allowNewPIds], ['The lab', ['seat1', 'seat2'], false]);
    const online = server.jt.data.room('online');
    assert.deepEqual([online.labels, online.allowNewPIds], [[], true]);
});
