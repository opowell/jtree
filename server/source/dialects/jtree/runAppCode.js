const vm = require('vm');
const fs = require('fs-extra');
const path = require('path');
const Utils = require('../../Utils.js');

/**
 * Runs the code of a jtree app (a .jtt or .js file), or of one of a folder app's stage files.
 *
 * The code is compiled as the body of a function whose parameters are the names in scope
 * (`app`, and `stage` for a stage file), plus Utils, fs, path and require, which apps have
 * always been able to use. Compiling it with its file's name puts that name and the line in
 * every error from it, now or later from the functions it defines (playerStart, ...).
 *
 * An error thrown while compiling or running the code gets `jtreePosition`: {file, line,
 * column} of where it happened, in this file or in a stage file the code added.
 *
 * @param {string} code
 * @param {string} filename The file the code is from.
 * @param {Object} scope Names the code can use, e.g. {app}; `this` is scope.app.
 */
function runAppCode(code, filename, scope) {
    const names = Object.assign({ Utils, fs, path, require }, scope);
    const keys = Object.keys(names);
    let fn;
    try {
        fn = vm.compileFunction(code, keys, { filename });
    } catch (err) {
        throw withPosition(err, filename);
    }
    try {
        fn.apply(scope.app, keys.map((k) => names[k]));
    } catch (err) {
        throw withPosition(err, filename);
    }
}

function withPosition(err, filename) {
    if (err != null && typeof err === 'object' && err.jtreePosition === undefined) {
        err.jtreePosition = errorPosition(err, filename);
    }
    return err;
}

/**
 * Where err happened in filename, as {file, line, column} (line and column as strings,
 * from 1), from its stack; null if the stack does not say.
 * - A SyntaxError's stack starts "<filename>:<line>", then the line, then a caret under the column.
 * - Other errors have a frame "<filename>:<line>:<column>".
 */
function errorPosition(err, filename) {
    const lines = String(err && err.stack).split('\n');
    if (err instanceof SyntaxError && lines[0] && lines[0].startsWith(filename + ':')) {
        const caret = (lines[2] || '').indexOf('^');
        return {
            file: filename,
            line: lines[0].substring(filename.length + 1),
            column: caret >= 0 ? String(caret + 1) : 'unknown',
        };
    }
    for (const line of lines) {
        const at = line.indexOf(filename + ':');
        if (at >= 0) {
            const m = /^(\d+):(\d+)/.exec(line.substring(at + filename.length + 1));
            if (m) {
                return { file: filename, line: m[1], column: m[2] };
            }
        }
    }
    return null;
}

module.exports = { runAppCode, errorPosition };
