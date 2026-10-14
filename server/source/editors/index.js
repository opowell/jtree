const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { fail } = require('./util.js');

/*
 * What the admin interfaces' app editors ask the server, at /api/editor/<dialect>/<action> (POST,
 * JSON; admins only, as all of /api): jtree's own editor (admin/v2) for .jtt apps, the z-Tree
 * editor (admin/ztree) for z-Tree treatments, and the oTree Studio editor (admin/otree) for oTree
 * projects. Each dialect's module reads its files into what its editor shows (a model), changes
 * them as its editor asks (apply), and writes them. Files are read and written only in the app
 * folders (settings.appFolders), and after a write the app catalogue is loaded again.
 */

const DIALECTS = {
    jtree: require('./jtree.js'),
    ztree: require('./ztree.js'),
    otree: require('./otree.js'),
};

/** The folders apps are in, absolute. */
function appRoots(jt) {
    return (jt.settings.appFolders || []).map((f) => path.resolve(jt.path, f));
}

/** p (absolute, or relative to the first app folder), if it is in an app folder; else throws. */
function inAppFolders(jt, p) {
    if (typeof p !== 'string' || p === '') fail('no path given');
    const roots = appRoots(jt);
    if (!roots.length) fail('jtree has no app folders (settings.appFolders)');
    const abs = path.resolve(roots[0], p);
    if (!roots.some((r) => abs === r || abs.startsWith(r + path.sep))) fail('not in an app folder: ' + p);
    return abs;
}

/** What the editors are given to work with: where files may go, and loading the apps again. */
function context(jt) {
    return {
        roots: () => appRoots(jt),
        resolve: (p) => inAppFolders(jt, p),
        /** Writes text to file, making its folder if need be. */
        write(file, text, encoding = 'utf8') {
            fs.mkdirpSync(path.dirname(file));
            fs.writeFileSync(file, text, encoding);
        },
        /** Loads the app catalogue again, and tells the admins. */
        reload() {
            jt.data.reloadApps();
            if (jt.socketServer) jt.socketServer.refreshAdmins(null);
        },
        jt,
    };
}

/** The router for /api/editor. */
function router(jt) {
    const r = express.Router();
    r.use(express.json({ limit: '50mb' }));
    r.post('/:dialect/:action', async (req, res) => {
        const dialect = DIALECTS[req.params.dialect];
        const action = dialect && dialect.actions && dialect.actions[req.params.action];
        if (!action) return res.status(404).send({ error: 'no editor action ' + req.params.dialect + '/' + req.params.action });
        try {
            res.send(await action(req.body || {}, context(jt)));
        } catch (err) {
            if (!err.editorMessage) console.log('editor ' + req.params.dialect + '/' + req.params.action + ': ' + err.stack);
            res.status(400).send({ error: err.message });
        }
    });
    return r;
}

module.exports = { router, inAppFolders };
