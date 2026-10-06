// Every app in client/apps loads, and the ones meant to show errors do.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { startServer } = require('./harness.js');
const { syntaxErrorPosition } = require('../source/core/data/syntaxErrorPosition.js');

let server;
before(async () => {
    server = await startServer({ withApps: true });
});
after(async () => { await server.close(); });

// Apps that show how jtree reports a mistake in an app.
const MEANT_TO_FAIL = ['error-syntax.jtt', 'error-undefined-var.jtt'];

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

test('an app with a syntax error reports where it is', () => {
    const app = catalogueApp('error-syntax.jtt');
    assert.ok(app.hasError);
    // V8 places this one (a stray # at the start of line 2) on the ; that ends line 1.
    assert.equal(app.errorLine, '1');
    assert.equal(app.errorPosition, '214');
});

test('syntax errors are placed by line and column', () => {
    assert.deepEqual(syntaxErrorPosition('let a = 1;\nb = 2 2;', 'x.jtt'), { line: '2', column: '7' });
    assert.equal(syntaxErrorPosition('let a = 1;', 'x.jtt'), null);
});

test('a folder app is one app, without its stage files as apps of their own', () => {
    const paths = Object.keys(server.jt.data.apps).map(p => p.split(path.sep).slice(-2).join('/'));
    assert.ok(paths.includes('public-good-v2/app.jtt'));
    assert.ok(!paths.some(p => p.startsWith('public-good-v2/') && p !== 'public-good-v2/app.jtt'), paths.join(', '));
    const meta = Object.values(server.jt.data.appsMetaData).find(m => m.appPath.endsWith(path.join('public-good-v2', 'app.jtt')));
    assert.deepEqual(meta.stages, ['decide', 'results']);
});

test('an error in a stage file is reported in that file', () => {
    const dir = fs.mkdtempSync(path.join(server.dataDir, 'folder-app-'));
    fs.writeFileSync(path.join(dir, 'app.jtt'), 'app.numPeriods = 1;\n');
    fs.writeFileSync(path.join(dir, '1_ok.jtt'), 'stage.activeScreen = `<p>ok</p>`;\n');
    fs.writeFileSync(path.join(dir, '2_broken.jtt'), 'stage.activeScreen = `<p>ok</p>`;\nstage.x = = 1;\n');
    const broken = server.jt.data.loadApp('x', {}, path.join(dir, 'app.jtt'), {});
    assert.ok(broken.hasError);
    assert.equal(broken.errorFile, path.join(dir, '2_broken.jtt'));
    assert.equal(broken.errorLine, '2');
});

test("stage files a folder app's app.jtt adds itself are not added again", () => {
    const dir = fs.mkdtempSync(path.join(server.dataDir, 'folder-app-'));
    fs.writeFileSync(path.join(dir, 'app.jtt'), "app.addStage('first', '2_b.jtt');\n");
    fs.writeFileSync(path.join(dir, '1_a.jtt'), 'stage.x = app.id != null;\n');
    fs.writeFileSync(path.join(dir, '2_b.jtt'), 'stage.x = 2;\n');
    const folderApp = server.jt.data.loadApp('x', {}, path.join(dir, 'app.jtt'), {});
    assert.ok(!folderApp.hasError);
    assert.deepEqual(folderApp.stages.map(s => [s.id, s.x]), [['first', 2], ['a', true]]);
});
