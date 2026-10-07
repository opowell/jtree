const fs = require('fs-extra');
const path = require('path');
const runtime = require('./runtime.js');
const staticFiles = require('./static.js');

/*
 * Converting an oTree app to a jtree app (plans/ztree-otree-dialects.md, section 4.7): a folder with
 * - app.jtt: the app's settings, constants, fields and functions, translated from Python, and its
 *   pages as stages;
 * - pages/<Page>.html: each page's screen, translated from its template to Vue;
 * - otree.cjs: what the translated code uses for oTree's and Python's functions (convert-runtime.js);
 * - CONVERSION.md: what was converted, and what needs work by hand (TODOs in the code).
 * The translation is Python's (python/otree_convert.py), from the app's syntax tree.
 *
 * From the command line:
 *     node server/source/dialects/otree/convert.js <oTree app folder> [<output folder>]
 */

const RUNTIME = path.join(__dirname, 'convert-runtime.js');
const STATIC_MARK = '@@jtree-static@@'; // around a static file's path, in what Python gives
const MAX_STATIC = 1024 * 1024;
const TYPES = {
    '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4',
    '.pdf': 'application/pdf', '.woff2': 'font/woff2',
};

/** The file an oTree app's folder is loaded from: its __init__.py (or older models.py). */
function appFile(dir) {
    for (const name of ['__init__.py', 'models.py']) {
        if (fs.existsSync(path.join(dir, name))) return path.join(dir, name);
    }
    throw new Error(dir + ' is not an oTree app (it has no __init__.py)');
}

/**
 * Converts the oTree app in appDir to a jtree app in outDir.
 * @return {Promise<{name, level, report, files}>} level: 'Converts' or 'Converts with TODOs';
 * report: [{part, status ('converted' or 'todo'), note, line}]; files: the paths written.
 */
async function convertApp(appDir, outDir) {
    await runtime.start();
    appDir = path.resolve(appDir);
    const { packageFor } = require('./index.js');
    const pkg = packageFor(appFile(appDir));
    runtime.putApp(pkg, appDir);
    const bridge = runtime.getBridge();
    bridge.load(pkg);
    let result;
    try {
        result = JSON.parse(runtime.py.pyimport('otree_convert').convert(pkg));
    } catch (err) {
        // Python's error, without its traceback.
        const lines = String(err.message || err).trim().split('\n');
        throw new Error(lines[lines.length - 1].replace(/^\w+Error: /, ''));
    }
    staticFiles.register(pkg, appDir);
    const report = result.report;
    const files = [];
    for (const [rel, text] of Object.entries(result.files)) {
        const page = rel.replace(/^pages\/|\.html$/g, '');
        fs.outputFileSync(path.join(outDir, rel), withStatics(text, pkg, page, report));
        files.push(rel);
    }
    fs.copyFileSync(RUNTIME, path.join(outDir, 'otree.cjs'));
    files.push('otree.cjs');
    const level = report.some((i) => i.status === 'todo') ? 'Converts with TODOs' : 'Converts';
    fs.outputFileSync(path.join(outDir, 'CONVERSION.md'), reportMarkdown(result.name, level, report));
    files.push('CONVERSION.md');
    return { name: result.name, level, report, files };
}

/** text with its static files ({{ static 'x' }}) as data: URLs, which work wherever the app is. */
function withStatics(text, pkg, page, report) {
    const re = new RegExp(STATIC_MARK + '(.*?)' + STATIC_MARK, 'g');
    return text.replace(re, (all, rel) => {
        const file = staticFiles.file(pkg, rel);
        const where = 'Page ' + page;
        if (file == null || fs.statSync(file).size > MAX_STATIC || TYPES[path.extname(file).toLowerCase()] == null) {
            const why = file == null ? 'not found' : fs.statSync(file).size > MAX_STATIC ? 'too large to put in the page' : 'of a type not put in pages';
            report.push({ part: where, status: 'todo', note: 'static file ' + rel + ': ' + why + '; give its URL', line: null });
            return rel;
        }
        if (!report.some((i) => i.part === where && i.note.includes(rel))) {
            report.push({ part: where, status: 'converted', note: 'static file ' + rel + ', put in the page as a data: URL', line: null });
        }
        return 'data:' + TYPES[path.extname(file).toLowerCase()] + ';base64,' + fs.readFileSync(file).toString('base64');
    });
}

/** CONVERSION.md: what was converted, and what needs work by hand. */
function reportMarkdown(name, level, report) {
    const lines = ['# ' + name + ': converted from oTree', '',
        '**' + level + '.** jtree converted the oTree app ' + name + ' to this jtree app:', '',
        '- `app.jtt`: its settings, constants, fields and functions (translated from Python), and its',
        '  pages, as stages;',
        '- `pages/`: each page\'s screen, translated from its template to Vue;',
        '- `otree.cjs`: what the translated code uses in place of oTree\'s and Python\'s functions.', ''];
    const todos = report.filter((i) => i.status === 'todo');
    if (todos.length > 0) {
        lines.push('## Needs work by hand', '', 'Each is a `TODO` in the code (which throws if it runs) or in a screen.', '');
        for (const item of todos) lines.push('- **' + item.part + '**: ' + item.note);
        lines.push('');
    }
    lines.push('## Converted', '');
    for (const item of report.filter((i) => i.status === 'converted')) {
        lines.push('- ' + item.part + (item.note ? ': ' + item.note : ''));
    }
    lines.push('', '## Differences from oTree', '',
        '- Amounts are numbers: currency is not rounded, nor shown as points.',
        '- A page\'s data (`player.page`) is worked out when the player starts the page, as oTree renders it then.',
        '- Pages\' scripts run when the participant\'s page loads, not when the page shows.', '');
    return lines.join('\n');
}

module.exports = { convertApp };

if (require.main === module) {
    const [appDir, outArg] = process.argv.slice(2);
    if (appDir == null) {
        console.log('Usage: node convert.js <oTree app folder> [<output folder>]');
        process.exit(1);
    }
    const outDir = outArg || path.resolve(appDir) + '-jtree';
    convertApp(appDir, outDir).then((result) => {
        console.log(result.name + ': ' + result.level + ', in ' + outDir);
        for (const item of result.report.filter((i) => i.status === 'todo')) {
            console.log('  TODO ' + item.part + ': ' + item.note);
        }
        process.exit(0);
    }, (err) => {
        console.log(String(err.message || err));
        process.exit(1);
    });
}
