// The three app editors in a real browser (headless Chrome, test/browser.js): jtree's own (admin
// v2's App editor), z-Tree's (admin/ztree's treatment windows) and oTree Studio's (admin/otree's
// Studio). Each makes or changes an app through its menus, dialogs and forms and saves it; the file
// written is then checked. Skipped where there is no Chrome.

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { startServer } = require('./harness.js');
const { launch, findChrome } = require('./browser.js');
const python = require('../source/dialects/otree/runtime.js');
const { readTextTreatment } = require('../source/dialects/ztree/ztext.js');

const skip = findChrome() == null ? 'no Chrome here' : false;
let server, browser, apps;

before(async () => {
    if (skip) return;
    apps = fs.mkdtempSync(path.join(os.tmpdir(), 'jtree-editors-'));
    fs.cpSync(path.join(__dirname, 'fixtures/otree'), path.join(apps, 'project'), { recursive: true });
    fs.mkdirSync(path.join(apps, 'ztree'));
    fs.copyFileSync(path.join(__dirname, 'fixtures/ztree-examples/pg.ztt'), path.join(apps, 'ztree/pg.ztt'));
    await python.ready();
    server = await startServer({ settings: { appFolders: [apps] } });
    browser = await launch();
});
after(async () => {
    if (skip) return;
    await browser.close();
    await server.close();
    fs.rmSync(apps, { recursive: true, force: true });
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Clicks the first element matching selector whose text matches pattern. */
const clickText = (page, selector, pattern) => page.eval((s, r) => {
    const el = [...document.querySelectorAll(s)].find((b) => new RegExp(r).test(b.innerText.trim()));
    if (!el) throw new Error('nothing to click: ' + s + ' ' + r);
    el.click();
}, selector, pattern);

/** Sets a field's value as typing does (input, then change). */
const fill = (page, selector, value) => page.eval((s, v) => {
    const el = document.querySelector(s);
    el.value = v;
    el.dispatchEvent(new Event('input'));
    el.dispatchEvent(new Event('change'));
}, selector, value);

/**
 * Sets a code field's text as typing does, then leaves it: the field is CodeMirror (the admins'
 * CodeEditor), so its text is replaced through its view. selector: the field or something in it.
 */
const setCode = (page, selector, text) => page.eval(async (s, t) => {
    const { EditorView } = await import('/shared/codemirror-6.43.14/codemirror.js');
    const view = EditorView.findFromDOM(document.querySelector(s).closest('.cm-editor') ?? document.querySelector(s).querySelector('.cm-editor'));
    view.focus();
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: t } });
    view.contentDOM.blur();
    return true;
}, selector, text);

/** Opens a menu of the menu bar, then one of its items. */
async function menu(page, top, item) {
    await clickText(page, 'button, [role=menuitem]', '^' + top + '$');
    await sleep(250);
    await clickText(page, '[role=menuitem], button, li', item);
    await sleep(300);
}

test("jtree's editor: a new app, a stage and a function, saved", { skip }, async () => {
    const page = await browser.open(server.url + '/admin/');
    await page.waitFor(() => document.querySelector('.admin__status[data-connected=true]'), { what: 'admin v2', timeout: 240000 });
    await menu(page, 'File', '^New app');
    await page.waitFor(() => document.querySelector('#new-name'), { what: 'the new app form' });
    await fill(page, '#new-name', 'mine/ultimatum');
    await fill(page, '#new-desc', 'An ultimatum game.');
    await clickText(page, 'button', '^Create$');
    await page.waitFor(() => document.querySelector('.ed__mode'), { what: 'the editor' });
    await clickText(page, '.ed__mode', '^Forms$');
    await page.waitFor(() => document.querySelector('.ed__nav'), { what: 'the forms' });
    // A number setting, typed in its field.
    await fill(page, '#vf-numPeriods', '3');
    await page.waitFor(() => /not saved/.test(document.body.innerText), { what: 'numPeriods set' });
    await fill(page, '.ed__add input', 'respond');
    await clickText(page, '.ed__add button', '^Add$');
    await page.waitFor(() => /respond/.test(document.querySelector('.ed__stages').innerText), { what: 'the new stage' });
    await clickText(page, '.btn', 'groupStart');
    await page.waitFor(() => Boolean(document.querySelector('.vf[data-kind=function] .cm-content')), { what: 'the function field' });
    await setCode(page, '.vf[data-kind=function] .cm-editor', 'group.done = true;');
    await page.waitFor(() => /not saved/.test(document.body.innerText), { what: 'the change' });
    await sleep(300);
    await clickText(page, '.btn', '^Save$');
    await page.waitFor(() => !/not saved/.test(document.body.innerText), { what: 'saved' });
    const file = path.join(apps, 'mine/ultimatum.jtt');
    const app = server.jt.data.loadApp(file, null, file, {});
    assert.equal(app.hasError, false);
    assert.deepEqual(app.stages.map((s) => s.id), ['decide', 'respond']);
    assert.equal(app.numPeriods, 3);
    assert.match(fs.readFileSync(file, 'utf8'), /respondStage\.groupStart = function\(group\) \{\n {4}group\.done = true;\n\};\n/);
    assert.deepEqual(page.errors, []);
    await page.close();
});

test("jtree's editor, structured: a screen's elements added, changed and moved in its tree, saved", { skip }, async () => {
    const page = await browser.open(server.url + '/admin/');
    await page.waitFor(() => document.querySelector('.admin__status[data-connected=true]'), { what: 'admin v2', timeout: 240000 });
    await menu(page, 'File', '^New app');
    await page.waitFor(() => document.querySelector('#new-name'), { what: 'the new app form' });
    await fill(page, '#new-name', 'mine/offer');
    await clickText(page, 'button', '^Create$');
    await page.waitFor(() => document.querySelector('.ed__mode'), { what: 'the editor' });
    await clickText(page, '.ed__mode', '^Structured$');
    await page.waitFor(() => document.querySelector('.at__tree'), { what: 'the tree' });

    /** Chooses the tree's row whose text matches pattern. */
    const choose = (pattern) => page.eval((r) => {
        const row = [...document.querySelectorAll('.tr')].find((el) => new RegExp(r).test(el.innerText.trim()));
        if (!row) throw new Error('no row ' + r);
        row.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }, pattern);
    /** Adds what Add offers as label. */
    const add = (label) => page.eval((l) => {
        const menu = document.querySelector('.at__add');
        menu.value = [...menu.options].find((o) => o.text === l).value;
        menu.dispatchEvent(new Event('change'));
    }, label);
    /** Presses key on the tree. */
    const press = (key, altKey = false) => page.eval((k, a) => document.querySelector('.at__tree').dispatchEvent(new KeyboardEvent('keydown', { key: k, altKey: a, bubbles: true })), key, altKey);
    const tree = () => page.eval(() => document.querySelector('.at__tree').innerText.replace(/\s+/g, ' '));

    // A number and a heading put in the stage's screen; the number's variable and limit set.
    await choose('Active screen');
    await add('Number');
    await page.waitFor(() => /Your choice/.test(document.querySelector('.at__tree').innerText), { what: 'the number' });
    await add('Heading');
    await page.waitFor(() => /Heading/.test(document.querySelector('.at__tree').innerText), { what: 'the heading' });
    await choose('^input');
    await page.waitFor(() => document.querySelector('#el-name'), { what: "the input's fields" });
    await fill(page, '#el-name', 'player.offer');
    await page.waitFor(() => /player\.offer/.test(document.querySelector('.at__tree').innerText), { what: 'the variable' });
    await fill(page, '#el-max', '50');
    await page.waitFor(() => /max='50'/.test(document.querySelector('.at__preview iframe')?.srcdoc ?? ''), { what: 'the maximum' });
    // The heading moved up, above the number's paragraph; deleted, and the delete undone.
    await choose('^h3');
    await press('ArrowUp', true);
    await page.waitFor(() => /decide.*Heading.*Your choice/.test(document.querySelector('.at__tree').innerText.replace(/\s+/g, ' ')), { what: 'the heading moved' });
    const before = await tree();
    await press('Delete');
    await page.waitFor(() => !/Heading/.test(document.querySelector('.at__tree').innerText), { what: 'the heading deleted' });
    await clickText(page, '.btn', '^Undo$');
    await page.waitFor(() => /Heading/.test(document.querySelector('.at__tree').innerText), { what: 'the heading back' });
    assert.equal(await tree(), before);
    await sleep(300);
    await clickText(page, '.btn', '^Save$');
    await page.waitFor(() => !/not saved/.test(document.body.innerText), { what: 'saved' });

    const file = path.join(apps, 'mine/offer.jtt');
    const app = server.jt.data.loadApp(file, null, file, {});
    assert.equal(app.hasError, false);
    assert.equal(app.stages[0].activeScreen, "\n    <p>decide</p>\n    <h3>Heading</h3>\n    <p>Your choice: <input name='player.offer' type='number' required min='0' max='50' step='1'></p>\n");
    assert.deepEqual(page.errors, []);
    await page.close();
});

test("jtree's editor, structured: elements and stages dragged, the history gone back and forth through, saved", { skip }, async () => {
    const page = await browser.open(server.url + '/admin/');
    await page.waitFor(() => document.querySelector('.admin__status[data-connected=true]'), { what: 'admin v2', timeout: 240000 });
    await menu(page, 'File', '^New app');
    await page.waitFor(() => document.querySelector('#new-name'), { what: 'the new app form' });
    await fill(page, '#new-name', 'mine/drag');
    await clickText(page, 'button', '^Create$');
    await page.waitFor(() => document.querySelector('.ed__mode'), { what: 'the editor' });
    await clickText(page, '.ed__mode', '^Structured$');
    await page.waitFor(() => document.querySelector('.at__tree'), { what: 'the tree' });

    const choose = (pattern) => page.eval((r) => {
        const row = [...document.querySelectorAll('.tr')].find((el) => new RegExp(r).test(el.innerText.replace(/[▾▸]/g, '').trim()));
        if (!row) throw new Error('no row ' + r);
        row.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }, pattern);
    const add = (label) => page.eval((l) => {
        const menu = document.querySelector('.at__add');
        menu.value = [...menu.options].find((o) => o.text === l).value;
        menu.dispatchEvent(new Event('change'));
    }, label);
    const rows = () => page.eval(() => [...document.querySelectorAll('.tr')].map((r) => r.innerText.replace(/[▾▸]/g, '').trim().replace(/\s+/g, ' ')));
    const steps = () => page.eval(() => [...document.querySelector('.ed__history').options].map((o) => o.text));
    /** Drags the row matching from over the row matching to, at y (0 top, 1 bottom); returns the place marked, after dropping it there. */
    async function drag(from, to, y) {
        await page.eval((f, t, at) => {
            const all = [...document.querySelectorAll('.tr')];
            const src = all.find((r) => new RegExp(f).test(r.innerText.replace(/[▾▸]/g, '').trim()));
            const dst = all.find((r) => new RegExp(t).test(r.innerText.replace(/[▾▸]/g, '').trim()));
            if (!src || !dst) throw new Error('no row ' + (src ? t : f));
            const box = dst.getBoundingClientRect();
            window.dragTest = { dst, dt: new DataTransfer(), x: box.left + 30, y: box.top + box.height * at };
            src.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: window.dragTest.dt }));
            dst.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: window.dragTest.dt, clientX: window.dragTest.x, clientY: window.dragTest.y }));
        }, from, to, y);
        await sleep(100);
        return page.eval(() => {
            const { dst, dt, x, y } = window.dragTest;
            const marked = dst.dataset.drop ?? null;
            dst.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt, clientX: x, clientY: y }));
            dst.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt }));
            return marked;
        });
    }
    const settled = (what, fn, ...args) => page.waitFor(fn, { what }, ...args);

    // Rows are matched by their text, without their ▾ / ▸.
    // decide's screen: "decide", Text, Heading; and a second stage.
    await choose('^screen');
    await add('Paragraph');
    await settled('the paragraph', () => /Text/.test(document.querySelector('.at__tree').innerText));
    await add('Heading');
    await settled('the heading', () => /Heading/.test(document.querySelector('.at__tree').innerText));
    await add('Stage');
    await settled('the stage', () => document.querySelectorAll('.tr[data-kind=stage]').length === 2);

    // The heading to the top of its screen, the paragraph onto the second stage, that stage before the first.
    assert.equal(await drag('^h3', '^p\\s+decide', 0.1), 'before');
    await settled('the heading moved', () => /screen Active screen h3 Heading heading p decide/.test([...document.querySelectorAll('.tr')].map((r) => r.innerText.replace(/[▾▸]/g, '').trim()).join(' ').replace(/\s+/g, ' ')));
    assert.equal(await drag('^p\\s+Text', '^2\\s+stage$', 0.5), 'inside');
    await settled('the paragraph moved', () => /2 stage screen Active screen p stage paragraph p Text paragraph$/.test([...document.querySelectorAll('.tr')].map((r) => r.innerText.replace(/[▾▸]/g, '').trim()).join(' ').replace(/\s+/g, ' ')));
    assert.equal(await drag('^2\\s+stage$', '^1\\s+decide$', 0.2), 'before');
    await settled('the stage moved', () => /^1\s+stage$/.test(document.querySelector('.tr[data-kind=stage]').innerText.replace(/[▾▸]/g, '').trim()));
    assert.equal(await drag('^1\\s+stage$', '^p\\s+stage', 0.5), null, 'a stage goes only next to a stage');
    const end = await rows();
    assert.deepEqual((await steps()).slice(1), ['1. Add Paragraph', '2. Add Heading', '3. Add stage stage', '4. Move Heading', '5. Move Paragraph', '6. Move stage stage']);

    // Back three steps (to before the moves), with Undo and the History list; then forward again.
    await clickText(page, '.btn', '^Undo$');
    await settled('undone', () => document.querySelector('.ed__history').value === '5');
    assert.match(await page.eval(() => document.querySelector('.btn[title^="Redo"]').title), /^Redo Move stage stage/);
    await page.eval(() => { const h = document.querySelector('.ed__history'); h.value = '3'; h.dispatchEvent(new Event('change')); });
    await settled('back to step 3', () => document.querySelector('.ed__history').value === '3' && /h3 Heading heading$/.test([...document.querySelectorAll('.tr')].slice(0, 6).map((r) => r.innerText.replace(/[▾▸]/g, '').trim()).join(' ').replace(/\s+/g, ' ')));
    assert.match((await steps())[6], /\(undone\)$/);
    await page.eval(() => document.querySelector('.at__tree').focus());
    await page.eval(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true, bubbles: true })));
    await settled('redone with the keys', () => document.querySelector('.ed__history').value === '4');
    await page.eval(() => { const h = document.querySelector('.ed__history'); h.value = '6'; h.dispatchEvent(new Event('change')); });
    // (The list's value is the test's own at once: what to wait for is the tree as it was at the end.)
    await settled('forward to the end', (want) => JSON.stringify([...document.querySelectorAll('.tr')]
        .map((r) => r.innerText.replace(/[▾▸]/g, '').trim().replace(/\s+/g, ' '))) === want, JSON.stringify(end));
    assert.deepEqual(await rows(), end);
    await sleep(300);
    await clickText(page, '.btn', '^Save$');
    await page.waitFor(() => !/not saved/.test(document.body.innerText), { what: 'saved' });

    const file = path.join(apps, 'mine/drag.jtt');
    const app = server.jt.data.loadApp(file, null, file, {});
    assert.equal(app.hasError, false);
    assert.deepEqual(app.stages.map((s) => s.id), ['stage', 'decide']);
    assert.equal(app.stages[1].activeScreen, '\n    <h3>Heading</h3>\n    <p>decide</p>\n');
    assert.equal(app.stages[0].activeScreen, '\n    <p>stage</p>\n    <p>Text</p>\n');
    assert.deepEqual(page.errors, []);
    await page.close();
});

test("z-Tree's editor: a binary treatment opened, a stage, box, item and button added, saved as text", { skip }, async () => {
    const page = await browser.open(server.url + '/admin/ztree/');
    await page.waitFor(() => /Ready/.test(document.body.innerText), { what: 'admin-ztree', timeout: 240000 });
    await sleep(1000);
    await menu(page, 'File', '^Open');
    await page.waitFor(() => document.querySelector('#open-look'), { what: 'the Open dialog' });
    // The file's path from the folder the dialog starts in.
    await page.eval((file) => {
        const start = document.querySelector('#open-look').value;
        const rel = file.replace(/\\/g, '/').replace(/^\/+/, '');
        const input = document.querySelector('#open-name');
        input.value = start && rel.startsWith(start + '/') ? rel.slice(start.length + 1) : rel;
        input.dispatchEvent(new Event('input'));
    }, path.join(apps, 'ztree/pg.ztt'));
    await clickText(page, '.zt-dialog button', '^Open$');
    await page.waitFor(() => document.querySelector('.zt-tree [data-kind=stage]'), { what: 'the stage tree' });
    const label = (pattern, nth = 0) => page.eval((r, k) => {
        const el = [...document.querySelectorAll('.zt-tree__label')].filter((e) => new RegExp(r).test(e.innerText))[k];
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    }, pattern, nth);
    await label('^Contribution Entry');
    await menu(page, 'Treatment', '^New Stage');
    await page.waitFor(() => document.querySelector('#zn-name'), { what: 'the Stage dialog' });
    await fill(page, '#zn-name', 'Questions');
    await clickText(page, '.zt-dialog button', '^OK$');
    await sleep(300);
    await label('^Active screen', 2);
    await menu(page, 'Treatment', '^New Box');
    await clickText(page, '[role=menuitem], button, li', '^New Standard Box');
    await clickText(page, '.zt-dialog button', '^OK$');
    await sleep(300);
    await menu(page, 'Treatment', '^New Item');
    await fill(page, '#zn-label', 'How many?');
    await fill(page, '#zn-variable', 'Answer');
    await page.eval(() => [...document.querySelectorAll('.zt-dialog label.zt-check')].find((l) => /^Input/.test(l.innerText.trim())).querySelector('input').click());
    await fill(page, '#zn-max', '10');
    await clickText(page, '.zt-dialog button', '^OK$');
    await sleep(300);
    await menu(page, 'Treatment', '^New Button');
    await clickText(page, '.zt-dialog button', '^OK$');
    await sleep(300);
    await menu(page, 'File', '^Save(\\s|$)');
    await page.waitFor(() => /binary format/.test(document.querySelector('.zt-dialog')?.innerText ?? ''), { what: 'the notice about the binary format' });
    await clickText(page, '.zt-dialog button', '^Save as');
    await page.waitFor(() => /Saved pg\.txt/.test(document.body.innerText), { what: 'saved' });
    const t = readTextTreatment(fs.readFileSync(path.join(apps, 'ztree/pg.txt')));
    assert.deepEqual(t.stages.map((s) => s.name), ['Contribution Entry', 'Questions', 'Profit Display']);
    const [box] = t.stages[1].active;
    assert.deepEqual([box.type, box.items.map((i) => [i.label, i.variable, i.input, i.max]), box.buttons.map((b) => b.name)],
        ['standard', [['How many?', 'Answer', true, '10']], ['OK']]);
    assert.match(await page.eval(() => document.title), /pg\.txt/);
    assert.deepEqual(page.errors, []);
    await page.close();
});

test("oTree Studio's editor: a field added, asked for on a page, the template changed, saved", { skip }, async () => {
    const dir = path.join(apps, 'project/public_goods');
    const page = await browser.open(server.url + '/admin/otree/#/studio/app/' + encodeURIComponent(dir));
    await page.waitFor(() => /Constants/.test(document.body.innerText) && document.querySelector('table'), { what: 'the studio', timeout: 240000 });
    await clickText(page, '.list-group-item', '^Player');
    await clickText(page, 'button', '^Add field$');
    await fill(page, '#ff-name', 'age');
    await fill(page, '#ff-label', 'How old are you?');
    await fill(page, '#ff-min', '18');
    await clickText(page, 'form.card button', '^OK$');
    await page.waitFor(() => /age/.test(document.querySelector('table')?.innerText ?? ''), { what: 'the field' });
    await clickText(page, '.list-group-item', 'Contribute');
    await page.waitFor(() => document.querySelector('#ff-Contribute-age'), { what: "the page's form fields" });
    await page.eval(() => document.querySelector('#ff-Contribute-age').click());
    await page.waitFor(() => document.querySelector('#ff-Contribute-age').checked, { what: 'the form field ticked' });
    await setCode(page, '#tc-Contribute', '<p>Tell us.</p>\n{{ formfields }}\n{{ next_button }}');
    await sleep(300);
    await clickText(page, 'button', '^Save$');
    await page.waitFor(() => /Saved/.test(document.body.innerText), { what: 'saved' });
    const source = fs.readFileSync(path.join(dir, '__init__.py'), 'utf8');
    // (With the line ends the file had: \r\n where git checks files out so, on Windows.)
    assert.match(source, /\r?\n {4}age = models\.IntegerField\(label='How old are you\?', min=18\)\r?\n/);
    assert.match(source, /form_fields = \['contribution', 'age'\]/);
    const html = fs.readFileSync(path.join(dir, 'Contribute.html'), 'utf8');
    assert.match(html, /<p>Tell us\.<\/p>/);
    assert.match(html, /\{\{ block scripts \}\}<script>window\.contributeScripts = true;<\/script>\{\{ endblock \}\}/, 'its other blocks stay');
    const app = server.jt.data.loadApp('x', {}, path.join(dir, '__init__.py'), {});
    assert.deepEqual(app.stages[0].formFields, ['player.contribution', 'player.age']);
    assert.deepEqual(page.errors, []);
    await page.close();
});
