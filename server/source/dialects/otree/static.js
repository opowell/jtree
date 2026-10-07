const fs = require('fs-extra');
const path = require('path');

/*
 * oTree apps' static files ({{ static 'x' }} in their templates): served at
 * <jtree's route>/otree-static/<app's package>/<path>, from the app's project's _static folder,
 * or the app's own static or _static folder.
 */

const folders = new Map(); // package -> folders its static files are in

/** Notes where the static files of the app in folder dir (package pkg) are. */
function register(pkg, dir) {
    folders.set(pkg, [path.join(path.dirname(dir), '_static'), path.join(dir, 'static'), path.join(dir, '_static')]
        .filter((d) => fs.existsSync(d)));
}

/** The URL static file paths of package pkg are under, for jtree served at basePath. */
function urlFor(basePath, pkg) {
    return (basePath || '') + '/otree-static/' + pkg + '/';
}

/** The file for request path rel of package pkg, or null: never outside its folders. */
function file(pkg, rel) {
    for (const dir of folders.get(pkg) || []) {
        const full = path.resolve(dir, rel);
        if (full.startsWith(path.resolve(dir) + path.sep) && fs.existsSync(full) && fs.statSync(full).isFile()) {
            return full;
        }
    }
    return null;
}

module.exports = { register, urlFor, file };
