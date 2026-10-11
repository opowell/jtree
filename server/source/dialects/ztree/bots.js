/**
 * A generic bot for z-Tree treatments: each subject plays the screen they are shown, as a
 * participant might. In a box with buttons it fills in the box's inputs (a choice, a number
 * within the input's bounds, ...) and presses a button; if the treatment refuses (a checker, an
 * input out of bounds), it tries other values. A stage it cannot leave by a button (no buttons,
 * or one that keeps it there, as a market's offers do) it ends as the stage's timeout would.
 */

const { pressButton } = require('./index.js');

// Elements with no end tag.
const VOID = new Set(['input', 'br', 'img', 'hr', 'meta', 'link', 'col', 'area', 'source', 'wbr']);

/**
 * What a screen offers (player.ztreeHtml): its boxes by path, each with its buttons (indexes),
 * item buttons ({name, value}) and rows to choose (record ids); and its inputs, each with the
 * paths of the boxes it is in, innermost first.
 */
function readScreen(html) {
    const boxes = new Map();
    const inputs = [];
    const box = (path) => {
        if (!boxes.has(path)) boxes.set(path, { path, buttons: [], itemButtons: [], records: [] });
        return boxes.get(path);
    };
    const stack = []; // open elements: {tag, box}
    let select = null;
    const tagRe = /<(\/?)([a-zA-Z0-9]+)([^>]*)>/g;
    let m;
    while ((m = tagRe.exec(html)) != null) {
        const [, closing, rawTag, attrText] = m;
        const tag = rawTag.toLowerCase();
        if (closing) {
            const i = stack.map((e) => e.tag).lastIndexOf(tag);
            if (i >= 0) stack.length = i;
            if (tag === 'select') select = null;
            continue;
        }
        const attrs = {};
        for (const a of attrText.matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attrs[a[1]] = a[2] == null ? true : a[2];
        const within = stack.filter((e) => e.box != null).map((e) => e.box).reverse();
        if (attrs['data-box'] != null && /ztree-box\b/.test(attrs.class || '')) box(attrs['data-box']);
        if (tag === 'button' && /\bztree-button\b/.test(attrs.class || '')) {
            box(attrs['data-box']).buttons.push(Number(attrs['data-button']));
        } else if (tag === 'button' && /\bztree-item-button\b/.test(attrs.class || '') && within.length) {
            box(within[0]).itemButtons.push({ name: attrs.name, value: attrs.value });
        } else if (tag === 'tr' && attrs['data-record'] != null && within.length) {
            box(within[0]).records.push(attrs['data-record']);
        } else if (tag === 'input' && attrs.name != null && !/^ztree-select-/.test(attrs.name) && within.length) {
            const type = attrs.type || 'text';
            const prev = inputs.find((x) => x.name === attrs.name && x.boxes[0] === within[0]);
            if ((type === 'radio') && prev != null) {
                prev.options.push(attrs.value);
            } else {
                inputs.push({ name: attrs.name, type, options: attrs.value != null ? [attrs.value] : [], boxes: within,
                    min: attrs['data-min'] != null ? Number(attrs['data-min']) : attrs.min != null ? Number(attrs.min) : null,
                    max: attrs['data-max'] != null ? Number(attrs['data-max']) : attrs.max != null ? Number(attrs.max) : null,
                    step: attrs.step != null ? Number(attrs.step) : null });
            }
        } else if (tag === 'select' && attrs.name != null && within.length) {
            select = { name: attrs.name, type: 'select', options: [], boxes: within };
            inputs.push(select);
        } else if (tag === 'option' && select != null && attrs.value) {
            select.options.push(attrs.value);
        }
        if (!VOID.has(tag)) stack.push({ tag, box: attrs['data-box'] != null && /ztree-box\b/.test(attrs.class || '') ? attrs['data-box'] : null });
    }
    return { boxes, inputs };
}

const pick = (list) => list[Math.floor(Math.random() * list.length)];

/** A value for input, as a participant might enter it; attempt > 0: after one was refused. */
function valueFor(input, attempt) {
    switch (input.type) {
        case 'radio':
        case 'select':
            return pick(input.options);
        case 'checkbox':
            return Math.random() < 0.5 ? input.options[0] : '';
        case 'range': {
            const steps = input.step > 0 ? Math.round((input.max - input.min) / input.step) : 100;
            return String(input.min + input.step * Math.floor(Math.random() * (steps + 1)));
        }
        default: {
            const lo = input.min != null && isFinite(input.min) ? input.min : 0;
            const hi = input.max != null && isFinite(input.max) ? input.max : lo + (attempt < 10 ? 10 : 100);
            const whole = Number.isInteger(lo) && Number.isInteger(hi);
            const v = lo + Math.random() * (hi - lo);
            return String(whole ? Math.round(v) : Math.round(v * 100) / 100);
        }
    }
}

/**
 * Plays session's z-Tree treatments to their end, every participant by the generic bot.
 * Resolves to what the bots did: {pressed, refused, timedOut} (counts).
 * @param {object} [opts]
 * @param {number} [opts.timeout=60000] Milliseconds to finish in.
 * @param {number} [opts.pressesPerStage=3] Buttons pressed in a stage that do not leave it, before it is ended as on its timeout.
 */
async function runZtreeBots(session, { timeout = 60000, pressesPerStage = 3 } = {}) {
    const stats = { pressed: 0, refused: 0, timedOut: 0 };
    const tries = new Map(); // participant id -> {at, presses}
    const end = Date.now() + timeout;
    for (;;) {
        const participants = Object.values(session.participants);
        if (participants.every((p) => p.isFinishedSession())) return stats;
        if (Date.now() > end) {
            throw new Error('the z-Tree bots did not finish in ' + timeout + ' ms; at ' +
                participants.map((p) => p.id + ': ' + (p.player ? p.player.stage && p.player.stage.id + '/' + p.player.status : '-')).join(', '));
        }
        for (const participant of participants) {
            const player = participant.player;
            if (player == null || player.status !== 'playing' || player.stage == null || player.stage.ztree == null) continue;
            const app = player.app();
            const at = player.group.period.id + '/' + player.stage.id;
            let t = tries.get(participant.id);
            if (t == null || t.at !== at) {
                t = { at, presses: 0, ended: false };
                tries.set(participant.id, t);
            }
            if (t.ended) continue;
            const screen = readScreen(player.ztreeHtml || '');
            const boxes = [...screen.boxes.values()].filter((b) => b.buttons.length || b.itemButtons.length);
            if (boxes.length === 0 || t.presses >= pressesPerStage) {
                t.ended = true;
                stats.timedOut++;
                session.pushMessage(player, true, 'endStage');
                continue;
            }
            let result = null;
            for (let attempt = 0; attempt < 30; attempt++) {
                const b = pick(boxes);
                const data = { stage: player.stage.id, box: b.path, button: b.buttons.length ? pick(b.buttons) : 0, values: {}, others: {} };
                for (const input of screen.inputs) {
                    const v = valueFor(input, attempt);
                    if (input.boxes.includes(b.path)) {
                        data.values[input.name] = v;
                    } else {
                        (data.others[input.boxes[0]] = data.others[input.boxes[0]] || {})[input.name] = v;
                    }
                }
                if (!b.buttons.length) {
                    const ib = pick(b.itemButtons);
                    data.itemButton = true;
                    data.values[ib.name] = ib.value;
                }
                if (b.records.length) data.record = pick(b.records);
                result = pressButton(app, player, data);
                if (result == null || !result.error) break;
                stats.refused++;
            }
            t.presses++;
            if (result != null && !result.error) stats.pressed++;
        }
        await new Promise((resolve) => setTimeout(resolve, 5));
    }
}

module.exports = { runZtreeBots, readScreen };
