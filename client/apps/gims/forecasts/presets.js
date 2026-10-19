// Settings of the forecasts app (app.jtt), and presets: the studies whose markets have price
// forecasts, under the names of their markets' presets (../market/presets.js), and an example to
// play it alone.

const DEFAULTS = {
    // Price forecasts: null for none, or { horizon: periods ahead (1 for this period's, or 'all' for
    // every period left), rewards: [[relative error at most, points], ...], target: 'mean' (trade
    // price), 'median', 'last' or 'call' (the call auction price), asset (from 0) }. In a market,
    // they are paid into its account apart from cash.
    forecasts: null,
    price: 100,                  // played alone: the price the forecast is scored against
    question: 'the price',       // played alone: what is forecast
};

// The forecast rewards of Haruvy, Lahav and Noussair (2007), as later studies describe them.
const HLN_REWARDS = [[0.10, 50], [0.25, 20], [0.50, 10]];

const PRESETS = {
    example: { forecasts: { horizon: 1, rewards: HLN_REWARDS, target: 'mean' } },
    'haruvy-lahav-noussair-2007': { forecasts: { horizon: 'all', rewards: HLN_REWARDS, target: 'call' } },
    'lugovskyy-puzzello-tucker-williams-2014': { forecasts: { horizon: 1, rewards: HLN_REWARDS, target: 'mean' } },
    'lugovskyy-puzzello-tucker-williams-2014-cap': { forecasts: { horizon: 1, rewards: HLN_REWARDS, target: 'mean' } },
    'lugovskyy-puzzello-tucker-williams-2014-short-cap': { forecasts: { horizon: 1, rewards: HLN_REWARDS, target: 'mean' } },
    'eckel-fullbrunn-2015': { forecasts: { horizon: 'all', rewards: [[0.10, 5], [0.25, 2], [0.50, 1]], target: 'mean' } },
    'huber-bindra-kleinlercher-2019': { forecasts: { horizon: 3, rewards: [[0.05, 50]], target: 'mean' } },
    'baghestanian-lugovskyy-puzzello-tucker-da': { forecasts: { horizon: 1, rewards: HLN_REWARDS, target: 'mean' } },
    'baghestanian-lugovskyy-puzzello-tucker-call': { forecasts: { horizon: 1, rewards: HLN_REWARDS, target: 'call' } },
    'cueva-rustichini-2015': { forecasts: { horizon: 1, rewards: [[0.10, 36]], target: 'mean' } },
};

/** The settings of a preset (none: the defaults), and then changes to them (an object, or JSON). */
function settingsFor(presetId, changes) {
    if (typeof changes === 'string') changes = changes.trim() === '' ? {} : JSON.parse(changes);
    return Object.assign({}, DEFAULTS, PRESETS[presetId] || {}, changes || {});
}

module.exports = { DEFAULTS, PRESETS, settingsFor };
