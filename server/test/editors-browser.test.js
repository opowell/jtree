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
    await page.waitFor(() => document.querySelector('.ed__nav'), { what: 'the editor' });
    // A number setting, typed in its field.
    await fill(page, '#vf-numPeriods', '3');
    await page.waitFor(() => /not saved/.test(document.body.innerText), { what: 'numPeriods set' });
    await fill(page, '.ed__add input', 'respond');
    await clickText(page, '.ed__add button', '^Add$');
    await page.waitFor(() => /respond/.test(document.querySelector('.ed__stages').innerText), { what: 'the new stage' });
    await clickText(page, '.btn', 'groupStart');
    await page.waitFor(() => document.querySelector('.vf[data-kind=function] textarea'), { what: 'the function field' });
    await page.eval(() => {
        const t = document.querySelector('.vf[data-kind=function] textarea');
        t.value = 'group.done = true;';
        t.dispatchEvent(new Event('input'));
        t.dispatchEvent(new Event('blur'));
    });
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
    await fill(page, '#tc-Contribute', '<p>Tell us.</p>\n{{ formfields }}\n{{ next_button }}');
    await sleep(300);
    await clickText(page, 'button', '^Save$');
    await page.waitFor(() => /Saved/.test(document.body.innerText), { what: 'saved' });
    const source = fs.readFileSync(path.join(dir, '__init__.py'), 'utf8');
    assert.match(source, /\n {4}age = models\.IntegerField\(label='How old are you\?', min=18\)\n/);
    assert.match(source, /form_fields = \['contribution', 'age'\]/);
    const html = fs.readFileSync(path.join(dir, 'Contribute.html'), 'utf8');
    assert.match(html, /<p>Tell us\.<\/p>/);
    assert.match(html, /\{\{ block scripts \}\}<script>window\.contributeScripts = true;<\/script>\{\{ endblock \}\}/, 'its other blocks stay');
    const app = server.jt.data.loadApp('x', {}, path.join(dir, '__init__.py'), {});
    assert.deepEqual(app.stages[0].formFields, ['player.contribution', 'player.age']);
    assert.deepEqual(page.errors, []);
    await page.close();
});
