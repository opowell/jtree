// Settings of the lottery choices app (app.jtt), and presets: the studies with Holt and Laury's
// lottery choices before or after their markets, under the names of their markets' presets
// (../market/presets.js), and an example to play it alone.

const DEFAULTS = {
    holtLaury: null,             // in GIMS (../app.jtt): 'before' or 'after' the market, or null for none [HLBefore, HLAfter]
    holtLauryPayoffs: { aHigh: 2, aLow: 1.6, bHigh: 3.85, bLow: 0.1 },   // in points [PayoffAHigh, ...]
    holtLauryResult: true,       // a screen with the row and number drawn, and the earnings, after the choices
};

const PRESETS = {
    example: { holtLaury: 'before' },
    // Breaban and Noussair (2015): before the market, in euros at 500 ECU to the euro; the result
    // is not shown until the payment.
    'breaban-noussair-2015-bull': { holtLaury: 'before', holtLauryPayoffs: { aHigh: 1000, aLow: 800, bHigh: 1925, bLow: 50 }, holtLauryResult: false },
    'breaban-noussair-2015-bear': { holtLaury: 'before', holtLauryPayoffs: { aHigh: 1000, aLow: 800, bHigh: 1925, bLow: 50 }, holtLauryResult: false },
};

/** The settings of a preset (none: the defaults), and then changes to them (an object, or JSON). */
function settingsFor(presetId, changes) {
    if (typeof changes === 'string') changes = changes.trim() === '' ? {} : JSON.parse(changes);
    return Object.assign({}, DEFAULTS, PRESETS[presetId] || {}, changes || {});
}

module.exports = { DEFAULTS, PRESETS, settingsFor };
