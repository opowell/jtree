const fs = require('fs-extra');
const { applyIR } = require('../../ir/ir.js');

/**
 * Apps written as an app description (see ir/ir.js): a file <name>.app.json. Importers
 * from other platforms produce the same description.
 */
/**
 * Where the mistake in text is, as {line, column} from 1, given the error JSON.parse threw.
 * Its message says so for some mistakes ("... (line 2 column 3)") but not for others
 * ("Unexpected token ','"); then the mistake is found as the shortest start of the text that
 * fails before its end.
 */
function jsonErrorPosition(text, err) {
    const m = /line (\d+) column (\d+)/.exec(err.message);
    if (m) {
        return { line: Number(m[1]), column: Number(m[2]) };
    }
    const failsBeforeEnd = (n) => {
        try {
            JSON.parse(text.substring(0, n));
            return false;
        } catch (e) {
            // Failing where the start ends, e.g. "Expected property name or '}' in JSON at position 1" for "{".
            const at = /at position (\d+)/.exec(e.message);
            return !/end of JSON input/.test(e.message) && !(at && Number(at[1]) >= n);
        }
    };
    let lo = 0;
    let hi = text.length;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (failsBeforeEnd(mid + 1)) hi = mid;
        else lo = mid + 1;
    }
    const before = text.substring(0, lo).split('\n');
    return { line: before.length, column: before[before.length - 1].length + 1 };
}

module.exports = {
    name: 'ir',

    detect(appPath) {
        return appPath.endsWith('.app.json');
    },

    /** Makes app what its file describes. */
    define(app) {
        app.appjs = fs.readFileSync(app.appPath, 'utf8');
        let ir;
        try {
            ir = JSON.parse(app.appjs);
        } catch (err) {
            const pos = jsonErrorPosition(app.appjs, err);
            err.jtreePosition = { file: app.appPath, line: String(pos.line), column: String(pos.column) };
            throw err;
        }
        try {
            applyIR(app, ir);
        } catch (err) {
            err.jtreePosition = err.jtreePosition || { file: app.appPath, line: 'unknown', column: 'unknown' };
            throw err;
        }
    },
};
