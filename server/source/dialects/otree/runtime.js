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
            bridge = py.pyimport('jtree_otree');
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
    if (bridge != null) fn();
    else if (!waiting.includes(fn)) waiting.push(fn);
}

/**
 * Puts the app in the folder dir into Python as package pkg (its .py files, and its .html
 * templates for the renderer).
 */
function putApp(pkg, dir) {
    const target = '/apps/' + pkg;
    if (py.FS.analyzePath(target).exists) {
        py.runPython(`import shutil; shutil.rmtree(${JSON.stringify(target)})`);
    }
    copyDir(dir, target, (name) => name.endsWith('.py') || name.endsWith('.html'));
    // The project's templates (e.g. _templates/global/Page.html), if the app is in a project.
    const projectTemplates = path.join(path.dirname(dir), '_templates');
    if (fs.existsSync(projectTemplates)) {
        copyDir(projectTemplates, target + '/_project_templates', (name) => name.endsWith('.html'));
    }
}

module.exports = { start, ready: start, getBridge, whenReady, putApp, PythonStarting, get py() { return py; } };
