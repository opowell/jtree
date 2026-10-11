const fs = require('fs-extra');
const path = require('path');

/*
 * The Python that runs oTree apps: one Pyodide interpreter per server, started the first time
 * an oTree app is loaded. jtree loads apps synchronously, and Pyodide starts asynchronously
 * (in about a second): until it has, loading an oTree app throws PythonStarting, and when it
 * has, the callbacks given to whenReady run (e.g. to load the app catalogue again).
 */

const PYTHON_DIR = path.join(__dirname, 'python');

let py = null;
let bridge = null;
let starting = null;
const waiting = [];

class PythonStarting extends Error {
    constructor() {
        super('Python is starting; the app loads in a moment.');
        this.name = 'PythonStarting';
    }
}

/** Copies the files under dir (on disk) to target in Pyodide's file system. */
function copyDir(dir, target, keep = () => true) {
    py.FS.mkdirTree(target);
    for (const name of fs.readdirSync(dir)) {
        const from = path.join(dir, name);
        const to = target + '/' + name;
        if (fs.statSync(from).isDirectory()) {
            if (!name.startsWith('.') && name !== '__pycache__') copyDir(from, to, keep);
        } else if (keep(name)) {
            py.FS.writeFile(to, fs.readFileSync(from));
        }
    }
}

/** Starts Python, once; resolves when it is ready. */
function start() {
    if (starting == null) {
        starting = (async () => {
            const { loadPyodide } = await import('pyodide');
            py = await loadPyodide();
            copyDir(PYTHON_DIR, '/jtree');
            py.FS.mkdirTree('/apps');
            py.runPython("import sys; sys.path[:0] = ['/jtree', '/apps']");
            // After each call into Python, what apps changed in participant.vars and session.vars
            // in place goes to jtree's objects too (flush_vars: they are kept as Python has them).
            const raw = py.pyimport('jtree_otree');
            bridge = new Proxy(raw, {
                get(target, name) {
                    const value = target[name];
                    if (typeof value !== 'function' || name === 'flush_vars') return value;
                    return (...args) => {
                        // An app's code runs in its project's folder, as oTree runs it (apps read
                        // their files by paths from there: redirect/urls.csv, ...).
                        if (typeof args[0] === 'string' && projectDirs.has(args[0])) target.chdir_to(projectDirs.get(args[0]));
                        try {
                            return value(...args);
                        } finally {
                            target.flush_vars();
                        }
                    };
                },
            });
            for (const fn of waiting.splice(0)) {
                try {
                    fn();
                } catch (err) {
                    console.log('Error after Python started: ' + err.stack);
                }
            }
        })();
    }
    return starting;
}

/** The bridge to Python (python/jtree_otree.py); throws PythonStarting, and starts it, if it is not ready. */
function getBridge() {
    if (bridge == null) {
        start();
        throw new PythonStarting();
    }
    return bridge;
}

/** Calls fn once Python is ready (now, if it is). */
function whenReady(fn) {
    if (bridge != null && !packagesPending) fn();
    else if (!waiting.includes(fn)) waiting.push(fn);
}

/**
 * Puts the app in the folder dir into Python as package pkg (its .py files, and its .html
 * templates for the renderer).
 */
function putApp(pkg, dir) {
    loadPackagesFor(dir);
    projectDirs.set(pkg, mountProject(path.dirname(dir)));
    const target = '/apps/' + pkg;
    if (py.FS.analyzePath(target).exists) {
        py.runPython(`import shutil; shutil.rmtree(${JSON.stringify(target)})`);
    }
    copyDir(dir, target, (name) => name.endsWith('.py') || name.endsWith('.html'));
    // Apps in oTree's older format import Page, WaitPage and Bot from ._builtin, which oTree
    // generated in each app (importing oTree's own modules): they get this one instead.
    if (fs.existsSync(path.join(dir, 'models.py'))) {
        py.FS.mkdirTree(target + '/_builtin');
        py.FS.writeFile(target + '/_builtin/__init__.py', 'from otree.api import Page, WaitPage, Bot\n');
    }
    // The project's templates (e.g. _templates/global/Page.html), if the app is in a project.
    const projectTemplates = path.join(path.dirname(dir), '_templates');
    if (fs.existsSync(projectTemplates)) {
        copyDir(projectTemplates, target + '/_project_templates', (name) => name.endsWith('.html'));
    }
}

// The folder (in Python's file system) of each app's project: {pkg: path}; the project
// folders mounted there (Pyodide's NODEFS: the files on disk, as they are).
const projectDirs = new Map();
const mounted = new Map();

/** The project folder dir (on disk) in Python's file system: mounted the first time. */
function mountProject(dir) {
    const resolved = path.resolve(dir);
    if (mounted.has(resolved)) return mounted.get(resolved);
    const at = '/projectfs/' + require('crypto').createHash('sha1').update(resolved).digest('hex').substring(0, 12);
    py.FS.mkdirTree(at);
    py.FS.mount(py.FS.filesystems.NODEFS, { root: resolved }, at);
    mounted.set(resolved, at);
    return at;
}

// Packages Pyodide has, loaded when an app first imports them (numpy, scipy, ...): the modules
// tried, and the load under way.
const triedImports = new Set();
let loadingPackages = null;
let packagesPending = false;

/**
 * If the app in dir imports modules Python does not have yet, loads the packages Pyodide has for
 * them (from its package repository; else pure Python ones from PyPI) and throws PythonStarting; whenReady's callbacks run when
 * they are in (as when Python starts). A module none has is tried once, then left to fail.
 */
function loadPackagesFor(dir) {
    const code = [];
    const visit = (d) => {
        for (const name of fs.readdirSync(d)) {
            const p = path.join(d, name);
            if (fs.statSync(p).isDirectory()) { if (!name.startsWith('.') && !['__pycache__', 'static', '_static', 'venv'].includes(name)) visit(p); }
            else if (name.endsWith('.py')) code.push(fs.readFileSync(p, 'utf8'));
        }
    };
    visit(dir);
    const missing = JSON.parse(getBridge().missing_imports(code.join('\n'))).filter((m) => !triedImports.has(m));
    if (missing.length === 0) return;
    missing.forEach((m) => triedImports.add(m));
    packagesPending = true;
    // (Python's import caches are cleared after: they hold what it found, and did not, before.)
    // (Pyodide maps the modules to its packages: scipy, pandas, sklearn → scikit-learn, ...)
    const imports = missing.map((m) => 'import ' + m).join('\n');
    // Those Pyodide has not: pure Python packages from PyPI (micropip), as named by their modules.
    const fromPypi = async () => {
        py.runPython('import importlib; importlib.invalidate_caches()');
        const still = JSON.parse(getBridge().missing_imports(imports));
        if (still.length === 0) return;
        await py.loadPackage('micropip');
        const micropip = py.pyimport('micropip');
        for (const name of still) {
            try {
                await micropip.install(name);
            } catch (err) {
                console.log('Could not install the Python package ' + name + ': ' + err.message);
            }
        }
    };
    const load = (loadingPackages || Promise.resolve()).then(() => py.loadPackagesFromImports(imports)).then(fromPypi)
        .then(() => py.runPython('import importlib; importlib.invalidate_caches()')).catch((err) => {
        console.log('Could not load Python packages for ' + missing.join(', ') + ': ' + err.message);
    }).then(() => {
        if (loadingPackages !== load) return;
        packagesPending = false;
        for (const fn of waiting.splice(0)) {
            try {
                fn();
            } catch (err) {
                console.log('Error after Python packages loaded: ' + err.stack);
            }
        }
    });
    loadingPackages = load;
    const err = new PythonStarting();
    err.message = 'Python is loading packages for this app (' + missing.join(', ') + '); it loads in a moment.';
    throw err;
}

/** Resolves when Python has started and the packages apps asked for are loaded. */
async function ready() {
    await start();
    while (loadingPackages != null) {
        const p = loadingPackages;
        await p;
        if (p === loadingPackages) break;
    }
}

module.exports = { start, ready, getBridge, whenReady, putApp, PythonStarting, get py() { return py; } };
