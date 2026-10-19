// Settings of the account status app (app.jtt), and presets: the studies whose markets show an
// account status, under the names of their markets' presets (../market/presets.js), and an
// example to play it alone.

const DEFAULTS = {
    accountStatus: null,         // { reference: 'highest' } or 'lowest': which total in the group is shown; null for none
};

const PRESETS = {
    example: { accountStatus: { reference: 'highest' } },
    // Schoenberg and Haruvy (2012): an upward or a downward reference.
    'schoenberg-haruvy-2012-up': { accountStatus: { reference: 'highest' } },
    'schoenberg-haruvy-2012-down': { accountStatus: { reference: 'lowest' } },
};

/** The settings of a preset (none: the defaults), and then changes to them (an object, or JSON). */
function settingsFor(presetId, changes) {
    if (typeof changes === 'string') changes = changes.trim() === '' ? {} : JSON.parse(changes);
    return Object.assign({}, DEFAULTS, PRESETS[presetId] || {}, changes || {});
}

module.exports = { DEFAULTS, PRESETS, settingsFor };
