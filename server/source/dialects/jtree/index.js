const path = require('path');
const Utils = require('../../Utils.js');
const { runAppCode } = require('./runAppCode.js');

/**
 * jtree's own apps: a script (.jtt or .js) that sets up `app`, or a folder of them (an
 * app.jtt with one .jtt file per stage beside it, see App#loadStageFiles).
 */
module.exports = {
    name: 'jtree',

    detect(appPath) {
        return appPath.endsWith('.jtt') || appPath.endsWith('.js');
    },

    /** Makes app what its file describes, by running the file's code. */
    define(app) {
        app.appjs = Utils.readJS(app.appPath);
        runAppCode(app.appjs, app.appPath, { app });
        app.loadStageFiles();
    },
};
