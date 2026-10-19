// Settings of the rating app (app.jtt), and presets: the studies whose markets ask for a rating,
// under the names of their markets' presets (../market/presets.js), and an example to play it
// alone.

const DEFAULTS = {
    rating: null,                // a question on a scale: { question, labels: [...] }; null for none
};

// Schoenberg and Haruvy (2012): after each period, how one feels about one's account.
const SH_RATING = { question: 'How do you feel about your current account total?', labels: ['Very negatively', 'Negatively', 'Somewhat negatively', 'Neutral', 'Somewhat positively', 'Positively', 'Very positively'] };

const PRESETS = {
    example: { rating: SH_RATING },
    'schoenberg-haruvy-2012-up': { rating: SH_RATING },
    'schoenberg-haruvy-2012-down': { rating: SH_RATING },
};

/** The settings of a preset (none: the defaults), and then changes to them (an object, or JSON). */
function settingsFor(presetId, changes) {
    if (typeof changes === 'string') changes = changes.trim() === '' ? {} : JSON.parse(changes);
    return Object.assign({}, DEFAULTS, PRESETS[presetId] || {}, changes || {});
}

module.exports = { DEFAULTS, PRESETS, settingsFor };
