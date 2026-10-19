// Settings of the bonds app (app.jtt), and presets: the studies whose markets have bonds, under
// the names of their markets' presets (../market/presets.js), and an example to play it alone.

const DEFAULTS = {
    // One-period bonds: null for none, or { rate (a number, or an array by period), payAtEnd (interest
    // paid into the account apart from cash, not into cash), policy: { levels: [rates], periods: [when
    // it may rise], threshold, exogenous } }
    bonds: null,
    cash: 1000,                  // played alone: the cash each participant has to put into bonds
};

// Fischbacher, Hens and Zeisberger (2013): the interest rate policy that leans against bubbles.
const FHZ_POLICY = { levels: [0.05, 0.11, 0.15, 0.21], periods: [4, 8, 12], threshold: 1.35 };

const PRESETS = {
    example: { bonds: { rate: 0.05 } },
    'fischbacher-hens-zeisberger-2013-nopolicy': { bonds: { rate: 0.05 } },
    'fischbacher-hens-zeisberger-2013-policy': { bonds: { rate: 0.05, policy: FHZ_POLICY } },
    'fischbacher-hens-zeisberger-2013-exogenous': { bonds: { rate: 0.05, payAtEnd: true, policy: Object.assign({ exogenous: true }, FHZ_POLICY) } },
};

/** The settings of a preset (none: the defaults), and then changes to them (an object, or JSON). */
function settingsFor(presetId, changes) {
    if (typeof changes === 'string') changes = changes.trim() === '' ? {} : JSON.parse(changes);
    return Object.assign({}, DEFAULTS, PRESETS[presetId] || {}, changes || {});
}

module.exports = { DEFAULTS, PRESETS, settingsFor };
