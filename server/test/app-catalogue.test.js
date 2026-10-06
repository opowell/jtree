// Every app in client/apps loads, and the ones meant to show errors do.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { startServer } = require('./harness.js');

let server;
before(async () => {
    server = await startServer({ withApps: true });
});
after(async () => { await server.close(); });

// Apps that do not load on their own: two show how jtree reports a mistake in an app, and
// sliderMoving.jtt reads app.session.decisionSituations, which nothing in client/apps sets.
const MEANT_TO_FAIL = ['error-syntax.jtt', 'error-undefined-var.jtt', 'sliderMoving.jtt'];

test('the app catalogue loads every app in client/apps', () => {
    const apps = server.jt.data.apps;
    const paths = Object.keys(apps);
    assert.ok(paths.length >= 25, 'found only ' + paths.length + ' apps');

    const failed = paths.filter(p => apps[p].hasError).map(p => path.basename(p));
    assert.deepEqual(failed.sort(), MEANT_TO_FAIL.slice().sort());
});

function catalogueApp(file) {
    return Object.values(server.jt.data.apps).find(a => a.appPath.endsWith(file));
}

test('an app with a runtime error reports its line', () => {
    const app = catalogueApp('error-undefined-var.jtt');
    assert.ok(app.hasError);
    assert.equal(app.errorLine, '2');
});
