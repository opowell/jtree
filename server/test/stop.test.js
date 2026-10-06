// jt.stop(), for jtree on a server of its own.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { io: ioClient } = require('socket.io-client');
const { makeDataDir, quietly, REPO } = require('./harness.js');
const jtree = require(path.join(REPO, 'server/source/jtree.js'));

test('jtree on its own server stops, closing the server and disconnecting clients', async () => {
    // Port 0: any free port.
    const data = makeDataDir({ settings: { port: 0 } });
    const savedPort = process.env.PORT;
    delete process.env.PORT;
    try {
        const jt = quietly(() => jtree.start({ path: data.path, basePath: '' }));
        const server = jt.staticServer.server;
        await new Promise(r => server.listening ? r() : server.once('listening', r));
        const url = 'http://127.0.0.1:' + server.address().port;

        const res = await fetch(url + '/api/sessions');
        assert.equal(res.status, 200);
        const socket = ioClient(url, { path: '/socket.io', transports: ['websocket'], query: { id: 'P1', type: 'PARTI', roomId: 'null' } });
        await new Promise((resolve, reject) => { socket.once('connect', resolve); socket.once('connect_error', reject); });
        const disconnected = new Promise(r => socket.once('disconnect', r));

        await quietly(() => jt.stop());
        assert.equal(server.listening, false);
        await disconnected;
        socket.close();
        // Logging after stopping does not write to the closed log file.
        quietly(() => jt.log('after stop'));
    } finally {
        if (savedPort !== undefined) process.env.PORT = savedPort;
        data.remove();
    }
});
