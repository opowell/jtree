// Settings of the lottery ticket app (app.jtt), and presets: the studies whose markets have
// lottery tickets, under the names of their markets' presets (../market/presets.js), and an
// example to play it alone.

const DEFAULTS = {
    lottery: null,               // a lottery ticket: { price, prize, chance }, one draw for all; null for none
    cash: 100,                   // played alone: the cash each participant has to buy a ticket with
};

// Schoenberg and Haruvy (2012): after each period, 6 cents for a 5% chance of 120.
const SH_LOTTERY = { price: 6, prize: 120, chance: 0.05 };

const PRESETS = {
    example: { lottery: SH_LOTTERY },
    'schoenberg-haruvy-2012-up': { lottery: SH_LOTTERY },
    'schoenberg-haruvy-2012-down': { lottery: SH_LOTTERY },
};

/** The settings of a preset (none: the defaults), and then changes to them (an object, or JSON). */
function settingsFor(presetId, changes) {
    if (typeof changes === 'string') changes = changes.trim() === '' ? {} : JSON.parse(changes);
    return Object.assign({}, DEFAULTS, PRESETS[presetId] || {}, changes || {});
}

module.exports = { DEFAULTS, PRESETS, settingsFor };
