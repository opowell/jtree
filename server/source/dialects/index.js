/*
 * The dialects jtree reads apps in. Each has
 * - name
 * - detect(appPath): whether a file is an app of this dialect
 * - define(app): makes app (a new App for that file, with any options given already set)
 *   what the file describes; throws if it cannot, with err.jtreePosition {file, line, column}
 *   when it knows where the problem is.
 * See plans/ztree-otree-dialects.md §2.
 */
const DIALECTS = [
    require('./ir/index.js'),
    require('./jtree/index.js'),
];

/** The dialect of the app at appPath, or null if no dialect reads it. */
function dialectFor(appPath) {
    return DIALECTS.find((d) => d.detect(appPath)) || null;
}

module.exports = { dialectFor, DIALECTS };
