// Settings of the control questions app (app.jtt), and presets: the studies with questions on
// the instructions before their markets, under the names of their markets' presets
// (../market/presets.js), and an example to play it alone.

const DEFAULTS = {
    // The questions [ControlQuestions]: [{ question, options: [...], answer: the index of the right
    // option, from 0 }], or { question, answer: a number }
    controlQuestions: [],
    controlQuestionsIntro: '',   // a text shown above them
};

// Cheung, Hedegaard and Palan (2014): training in the value of a share, 30 questions.
const CHP_QUESTIONS = [];
for (let t = 15; t >= 1; t--) CHP_QUESTIONS.push({ question: 'Suppose that you buy one share in period ' + t + ' and that you keep it until the end of the market (until period 15). What is the average total dividend that you will receive from this share?', answer: 24 * (16 - t) });
for (let t = 15; t >= 1; t--) CHP_QUESTIONS.push({ question: 'Suppose that you sell one share in period ' + t + ' and that you do not buy it back. What is the average total dividend that you give up on this share?', answer: 24 * (16 - t) });

const PRESETS = {
    example: {
        controlQuestions: [
            { question: 'A unit pays a dividend of 0 or 20, equally likely, after each period. What does it pay on average after a period?', answer: 10 },
            { question: 'Can you buy a unit with cash you do not have?', options: ['Yes', 'No'], answer: 1 },
        ],
    },
    'cheung-hedegaard-palan-2014-pk': { controlQuestions: CHP_QUESTIONS, controlQuestionsIntro: 'Every trader in your market answers these questions correctly before the market begins.' },
    'cheung-hedegaard-palan-2014-npk': { controlQuestions: CHP_QUESTIONS, controlQuestionsIntro: 'Some of the participants in this session are asked to answer these questions. The experiment begins when they have answered them all correctly.' },
};

/** The settings of a preset (none: the defaults), and then changes to them (an object, or JSON). */
function settingsFor(presetId, changes) {
    if (typeof changes === 'string') changes = changes.trim() === '' ? {} : JSON.parse(changes);
    return Object.assign({}, DEFAULTS, PRESETS[presetId] || {}, changes || {});
}

module.exports = { DEFAULTS, PRESETS, settingsFor };
