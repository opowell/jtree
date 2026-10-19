// Settings of the chat app (app.jtt), and presets: the studies whose markets have a chat, under
// the names of their markets' presets (../market/presets.js), and an example to play it alone.

const DEFAULTS = {
    chatTime: 0,                 // seconds of chat; 0 for none
    chatFrom: 1,                 // in a market, the first period of each round with a chat (none in practice periods)
};

const PRESETS = {
    example: { chatTime: 60 },
    // Oechssler, Schmidt and Schnedler (2011): INFCHAT, a chat before each day but the first.
    'oechssler-schmidt-schnedler-2011-infchat': { chatTime: 60, chatFrom: 2 },
};

/** The settings of a preset (none: the defaults), and then changes to them (an object, or JSON). */
function settingsFor(presetId, changes) {
    if (typeof changes === 'string') changes = changes.trim() === '' ? {} : JSON.parse(changes);
    return Object.assign({}, DEFAULTS, PRESETS[presetId] || {}, changes || {});
}

module.exports = { DEFAULTS, PRESETS, settingsFor };
