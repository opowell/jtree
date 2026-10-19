// Settings of the payment app (app.jtt), and presets: the studies whose payment rules are not
// GIMS's defaults (every market paid, no minimum or maximum), under the names of their markets'
// presets (../market/presets.js), and an example to play it alone.

const DEFAULTS = {
    payment: 'all',              // the market's rounds paid: 'all', or one 'random' round [RandomPeriodPayoff]
    paymentBlocks: null,         // with payment 'random', one round paid from each block of rounds: e.g. [10, 10]
    minPayoff: 0,                // the fewest points paid in all [MinPayoffECU]
    maxPayoff: null,             // the most points paid in all
};

const PRESETS = {
    example: {},
    // Fellner and Theissen (2014): one market of each block of ten paid.
    'fellner-theissen-2014-pa0': { payment: 'random', paymentBlocks: [10, 10] },
    'fellner-theissen-2014-pa60': { payment: 'random', paymentBlocks: [10, 10] },
    'fellner-theissen-2014-pa80': { payment: 'random', paymentBlocks: [10, 10] },
    'fellner-theissen-2014-ap0': { payment: 'random', paymentBlocks: [10, 10] },
    'fellner-theissen-2014-ap60': { payment: 'random', paymentBlocks: [10, 10] },
    'fellner-theissen-2014-ap80': { payment: 'random', paymentBlocks: [10, 10] },
    // Cueva and Rustichini (2015): payments kept between 10 and 30 pounds.
    'cueva-rustichini-2015': { minPayoff: 3600, maxPayoff: 10800 },
};

/** The settings of a preset (none: the defaults), and then changes to them (an object, or JSON). */
function settingsFor(presetId, changes) {
    if (typeof changes === 'string') changes = changes.trim() === '' ? {} : JSON.parse(changes);
    return Object.assign({}, DEFAULTS, PRESETS[presetId] || {}, changes || {});
}

module.exports = { DEFAULTS, PRESETS, settingsFor };
