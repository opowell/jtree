// Settings of the CRT app (app.jtt), and presets: the studies with a cognitive reflection test
// before or after their markets, under the names of their markets' presets (../market/presets.js),
// and an example to play it alone.

const DEFAULTS = {
    crt: null,                   // in GIMS (../app.jtt): 'before' or 'after' the market, or null for none [CRTBefore, CRTAfter]
    crtPay: 0,                   // points per right answer
};

const PRESETS = {
    example: { crt: 'before', crtPay: 1 },
    // $2 a right answer, at 600 francs to the dollar.
    'lugovskyy-puzzello-tucker-williams-2014': { crt: 'before', crtPay: 1200 },
    'lugovskyy-puzzello-tucker-williams-2014-cap': { crt: 'before', crtPay: 1200 },
    'lugovskyy-puzzello-tucker-williams-2014-short-cap': { crt: 'before', crtPay: 1200 },
    'baghestanian-lugovskyy-puzzello-tucker-da': { crt: 'before', crtPay: 1200 },
    'baghestanian-lugovskyy-puzzello-tucker-call': { crt: 'before', crtPay: 1200 },
    // A euro a right answer, at 500 ECU to the euro.
    'breaban-noussair-2015-bull': { crt: 'before', crtPay: 500 },
    'breaban-noussair-2015-bear': { crt: 'before', crtPay: 500 },
    // Afterwards, unpaid.
    'cheung-hedegaard-palan-2014-base': { crt: 'after' },
    'cheung-hedegaard-palan-2014-pk': { crt: 'after' },
    'cheung-hedegaard-palan-2014-npk': { crt: 'after' },
    'cheung-hedegaard-palan-2014-wait': { crt: 'after' },
    'corgnet-hernan-kujal-porter-2014': { crt: 'after' },
    'shestakova-powell-gladyrev-2019': { crt: 'after' },
};

/** The settings of a preset (none: the defaults), and then changes to them (an object, or JSON). */
function settingsFor(presetId, changes) {
    if (typeof changes === 'string') changes = changes.trim() === '' ? {} : JSON.parse(changes);
    return Object.assign({}, DEFAULTS, PRESETS[presetId] || {}, changes || {});
}

module.exports = { DEFAULTS, PRESETS, settingsFor };
