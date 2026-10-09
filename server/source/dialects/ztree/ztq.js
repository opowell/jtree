/*
 * Reads z-Tree questionnaires (.ztq), written from z-Tree's example (brand16.ztq, file version
 * 11): questionnaires, each a page of items (texts, and questions with a variable, its range and
 * its labels) and a button. As a treatment (see toTreatment), they run as any treatment does:
 * one stage a questionnaire, which each subject takes at their own pace.
 */

const { tokenize, Reader, ZttError } = require('./ztt.js');

/** The questionnaires in a .ztq file: {version, questionnaires: [{name, title, items, buttons}]}. */
function readQuestionnaires(buf) {
    const version = buf.readInt32LE(0);
    const tokens = tokenize(buf);
    if (!tokens.some((t) => t.cls === 'EEXQuesterQuestionnaire')) {
        throw new ZttError('not a z-Tree questionnaire file (no EEXQuesterQuestionnaire)');
    }
    const out = { version, questionnaires: [], warnings: [] };
    let current = null;
    for (const t of tokens) {
        const r = new Reader(buf, t.body, t.end);
        try {
            if (t.cls === 'EEXQuesterQuestionnaire') {
                current = { name: r.str(), title: r.str(), items: [], buttons: [] };
                out.questionnaires.push(current);
            } else if (t.cls === 'EEXQuesterItem' && current != null) {
                const item = { label: r.str(), type: r.i32(), variable: r.str() };
                if (item.variable) {
                    r.skip(6);
                    item.min = r.buf.readFloatLE(r.pos); r.skip(4);
                    item.max = r.buf.readFloatLE(r.pos); r.skip(4);
                    item.step = r.buf.readFloatLE(r.pos); r.skip(4);
                    item.layout = r.i32();
                    r.skip(4);
                    // The labels of the range's ends, a line each.
                    item.labels = r.str().split('\n').map((l) => l.trim()).filter(Boolean);
                }
                current.items.push(item);
            } else if (t.cls === 'EEXQuesterButton' && current != null) {
                current.buttons.push({ name: r.str() });
            } else if (/^EEXQuester/.test(t.cls)) {
                out.warnings.push('an object of class ' + t.cls + ' (at byte ' + t.start + ') is not read');
            }
        } catch (err) {
            if (!(err instanceof ZttError)) throw err;
            out.warnings.push(t.cls + ' at byte ' + t.start + ': ' + err.message);
        }
    }
    return out;
}

const round = (x) => Math.round(x * 1e6) / 1e6;

/**
 * The questionnaires as a treatment (as ztt.js describes one): a stage for each, its items in a
 * standard box: texts, and questions as a line of choices from min to max (labelled at its ends)
 * or a number field; and its button, or OK.
 */
function toTreatment(q) {
    const box = (questionnaire) => ({
        type: 'standard', cls: 'EEXDialogWindow', name: questionnaire.title || questionnaire.name,
        condition: '', left: '', right: '', width: '', top: '', bottom: '', height: '',
        boxes: [], programs: [],
        items: questionnaire.items.map((item) => {
            if (!item.variable) return { kind: 'item', label: item.label, variable: '', input: false, min: '', max: '', layout: '' };
            const steps = item.step > 0 ? Math.round((item.max - item.min) / item.step) + 1 : 0;
            const [left, right] = [item.labels[0] || '', item.labels[item.labels.length - 1] || ''];
            const layout = steps >= 2 && steps <= 21
                ? '!radioline: ' + round(item.min) + ' = "' + left.replace(/"/g, "'") + '"; ' + round(item.max) + ' = "' + right.replace(/"/g, "'") + '"; ' + steps
                : String(item.step > 0 ? round(item.step) : 1);
            return { kind: 'item', label: item.label, variable: item.variable, input: true, min: String(round(item.min)), max: String(round(item.max)), layout };
        }),
        buttons: questionnaire.items.length === 0 ? [] : (questionnaire.buttons.length ? questionnaire.buttons : [{ name: 'OK' }]).map((b) => ({ name: b.name, checkers: [], programs: [] })),
    });
    const stage = (questionnaire) => ({
        name: questionnaire.title || questionnaire.name,
        // Start if possible (bit 0): each subject at their own pace; no timeout.
        programs: [], timeout: '', options: [1, 0, 0, 0, 0, 0, 0, 0], showHeader: false,
        active: [box(questionnaire)], waiting: [],
    });
    const waitingText = { type: 'standard', cls: 'EEXDialogWindow', name: 'Text', condition: '', left: '', right: '', width: '', top: '', bottom: '', height: '',
        boxes: [], programs: [], buttons: [], items: [{ kind: 'item', label: 'Please wait.', variable: '', input: false, min: '', max: '', layout: '' }] };
    return {
        version: q.version,
        questionnaire: true,
        tables: [],
        background: { name: 'Background', programs: [], timeout: '', options: [], showHeader: false, active: [], waiting: [waitingText] },
        stages: q.questionnaires.map(stage),
        periods: [{ name: '1', program: '' }],
        subjects: [{ name: 'S 1', index: 0 }],
        params: [{ label: '', group: 1, program: '' }],
        warnings: q.warnings,
        texts: [],
    };
}

module.exports = { readQuestionnaires, toTreatment };
