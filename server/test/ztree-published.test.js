// Published z-Tree treatments (fixtures/ztree-published, see its README: downloaded, not in the
// repository), each played to its end by the generic z-Tree bot: every subject fills in and
// presses what their screen offers, in every stage of every period. By z-Tree's rules (sessions
// in mode 'ztree'), as they ran in the lab.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { startServer } = require('./harness.js');
const { readTreatment } = require('../source/dialects/ztree/ztt.js');
const { runZtreeBots } = require('../source/dialects/ztree/bots.js');

const DIR = path.join(__dirname, 'fixtures/ztree-published/duffy-puzzello');

// The replication of Duffy and Puzzello (2014): file -> its OSF id (https://osf.io/x2wcy/).
const FILES = {
    'M6_G1.ztt': 'yq7fb', 'M6_G2.ztt': 'kxsf8', 'M6_G3.ztt': 'tkdwh', 'M6_G4.ztt': 'su8yr',
    'M6_G5.ztt': 't9epx', 'M6_G6.ztt': '8f4bs', 'M6_G7.ztt': 'g3f6e', 'M6_G8.ztt': 'hvn3e',
    'NM6_G1.ztt': '39ygx', 'NM6_G2.ztt': 'dqjgh', 'NM6_G3.ztt': 'scr2x', 'NM6_G4.ztt': 'bz8s4',
    'NM6_G5.ztt': '8j6ex', 'NM6_G6.ztt': 'cu4yq', 'NM6_G7.ztt': 'ghcjn', 'NM6_G8.ztt': '9fy7u',
    'HL.ztt': 'nt95a', 'PaymentInfo.ztq': '34mtu',
};

// The money treatment's own slip: its loop that shuffles tied bids indexes them with the outer
// loop's counter (buys[i], i up to 36, of 6). By z-Tree's rules that is buys[6]; by jtree's, an error.
const SLIP = /^in a program on subjects \(\/\/sort all buys and sells in ascending order\): array index \d+ out of range$/;

/** Downloads the files not here yet; resolves to whether all are here. */
async function ensureFiles() {
    fs.mkdirSync(DIR, { recursive: true });
    let all = true;
    for (const [name, id] of Object.entries(FILES)) {
        const file = path.join(DIR, name);
        if (fs.existsSync(file)) continue;
        try {
            const res = await fetch('https://osf.io/download/' + id + '/');
            if (!res.ok) throw new Error(String(res.status));
            const buf = Buffer.from(await res.arrayBuffer());
            if (/^\s*</.test(buf.subarray(0, 64).toString('latin1'))) throw new Error('not a z-Tree file');
            fs.writeFileSync(file, buf);
        } catch (err) {
            all = false;
        }
    }
    return all;
}

let server;
let haveFiles = false;
before(async () => {
    haveFiles = await ensureFiles();
    server = await startServer();
});
after(async () => { await server.close(); });

const files = (t) => {
    if (!haveFiles) t.skip('the treatments could not be downloaded from the OSF');
    return haveFiles;
};

test('Duffy and Puzzello: the treatments read with no warnings', (t) => {
    if (!files(t)) return;
    for (const name of Object.keys(FILES).filter((n) => n.endsWith('.ztt'))) {
        const g = readTreatment(fs.readFileSync(path.join(DIR, name)));
        assert.deepEqual(g.warnings, [], name);
        assert.equal(g.subjects.length, 6, name);
    }
    const m6 = readTreatment(fs.readFileSync(path.join(DIR, 'M6_G1.ztt')));
    assert.equal(m6.periods.length, 31);
    assert.deepEqual(m6.stages.slice(0, 3).map((s) => s.name), ['New Sequence', 'Decentralized Consumer', 'Decentralized Producer']);
});

for (const name of Object.keys(FILES)) {
    test('Duffy and Puzzello: ' + name + ', played to its end by the generic bot', async (t) => {
        if (!files(t)) return;
        const session = server.createSession(path.join(DIR, name), { numParticipants: 6, mode: 'ztree' });
        session.start();
        const stats = await runZtreeBots(session, { timeout: 60000 });
        assert.ok(stats.pressed > 0, name + ': no button pressed');
        assert.deepEqual(session.apps[0].ztreeRun.errors, [], name);
        assert.ok(Object.values(session.participants).every((p) => p.isFinishedSession()));
    });
}

test("Duffy and Puzzello: by jtree's rules, the money treatment's slip is reported", async (t) => {
    if (!files(t)) return;
    const session = server.createSession(path.join(DIR, 'M6_G1.ztt'), { numParticipants: 6, mode: 'jtree' });
    session.start();
    await runZtreeBots(session, { timeout: 60000 });
    const errors = session.apps[0].ztreeRun.errors;
    assert.ok(errors.length > 0 && errors.every((e) => SLIP.test(e)), JSON.stringify(errors.slice(0, 3)));
});
