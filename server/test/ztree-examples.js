// z-Tree's example treatments, from z-Tree's site, downloaded once into fixtures/ztree-examples
// (see its README: they are not in the repository).

const fs = require('node:fs');
const path = require('node:path');

const DIR = path.join(__dirname, 'fixtures/ztree-examples');
const NAMES = ['pg', 'ug', 'pd', 'game222', 'noda', 'asset_da', 'dutchauction', 'ifelems_e', 'chatdemo'];

const OTHERS = ['brand16.ztq']; // a questionnaire
// z-Tree's graphics examples (plot boxes), from https://www.ztree.uzh.ch/en/examples/graphics.html.
const GRAPHICS = ['plotitems', 'smiley', 'boxplotdemo', 'colortriangle', 'movepointdemo', 'selectlinkdemo', 'animatetreedemo', 'z-draw'];

/** The path of example name's file (a .ztt, unless name has its extension). */
const file = (name) => path.join(DIR, /\.\w+$/.test(name) ? name : name + '.ztt');

/** Downloads the examples not here yet; resolves to whether all are here. */
async function ensureExamples() {
    let all = true;
    for (const name of [...NAMES, ...OTHERS, ...GRAPHICS]) {
        if (fs.existsSync(file(name))) continue;
        try {
            const graphics = GRAPHICS.includes(name);
            const res = await fetch('https://www.ztree.uzh.ch/static/examples/' + (graphics ? 'graphics/' : '') + path.basename(file(name)));
            if (!res.ok) throw new Error(String(res.status));
            fs.writeFileSync(file(name), Buffer.from(await res.arrayBuffer()));
        } catch (err) {
            all = false;
        }
    }
    return all;
}

// GIMS (Palan 2015), a z-Tree market treatment published as z-Tree's text export, at a fixed
// version of its repository (https://github.com/stpalan/GIMS; BSD-style licence, its LICENSE).
const GIMS_COMMIT = 'a2bb6e9838675f14db40d84ab21bff5483cc0b34';
const GIMS = path.join(DIR, 'gims', 'GIMS.txt');

/** Downloads GIMS if it is not here yet; resolves to its path, or null if it could not be. */
async function ensureGims() {
    if (fs.existsSync(GIMS)) return GIMS;
    try {
        const base = 'https://raw.githubusercontent.com/stpalan/GIMS/' + GIMS_COMMIT + '/';
        fs.mkdirSync(path.dirname(GIMS), { recursive: true });
        for (const [from, to] of [['GIMS_Source.txt', GIMS], ['LICENSE', path.join(DIR, 'gims', 'LICENSE')]]) {
            const res = await fetch(base + from);
            if (!res.ok) throw new Error(String(res.status));
            fs.writeFileSync(to, Buffer.from(await res.arrayBuffer()));
        }
        return GIMS;
    } catch (err) {
        return null;
    }
}

// z-Tree 5's own exports (export/<name>.txt) and saves (saved/<name>) of the examples, made
// locally with tools/ztree-wine (not in the repository: they are made from z-Tree's files).
const ZTREE5 = path.join(DIR, 'ztree5');

module.exports = { ensureExamples, ensureGims, file, NAMES, GRAPHICS, DIR, ZTREE5 };
