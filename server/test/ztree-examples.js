// z-Tree's example treatments, from z-Tree's site, downloaded once into fixtures/ztree-examples
// (see its README: they are not in the repository).

const fs = require('node:fs');
const path = require('node:path');

const DIR = path.join(__dirname, 'fixtures/ztree-examples');
const NAMES = ['pg', 'ug', 'pd', 'game222', 'noda', 'asset_da', 'dutchauction', 'ifelems_e', 'chatdemo'];

const OTHERS = ['brand16.ztq']; // a questionnaire

/** The path of example name's file (a .ztt, unless name has its extension). */
const file = (name) => path.join(DIR, /\.\w+$/.test(name) ? name : name + '.ztt');

/** Downloads the examples not here yet; resolves to whether all are here. */
async function ensureExamples() {
    let all = true;
    for (const name of [...NAMES, ...OTHERS]) {
        if (fs.existsSync(file(name))) continue;
        try {
            const res = await fetch('https://www.ztree.uzh.ch/static/examples/' + path.basename(file(name)));
            if (!res.ok) throw new Error(String(res.status));
            fs.writeFileSync(file(name), Buffer.from(await res.arrayBuffer()));
        } catch (err) {
            all = false;
        }
    }
    return all;
}

module.exports = { ensureExamples, file, NAMES, DIR };
