/*
 * Checking what a stage's form submits (see App#addClientDefault).
 *
 * Fields are declared in app.fields, by the name the form uses (oTree's model fields,
 * z-Tree's input items):
 *
 *     app.fields = {
 *         'player.contribution': { type: 'int', min: 0, max: (player) => player.endowment },
 *         'player.color': { type: 'choice', choices: ['red', 'blue'] },
 *         'player.comment': { type: 'string', blank: true },
 *     };
 *
 * type is 'int', 'number', 'string', 'bool' or 'choice'. min, max and choices can be values
 * or functions of the player. A field is required unless blank is true. stage.formFields
 * lists the fields a stage's form must send (oTree's form_fields), and stage.validate(player,
 * values) checks them together (oTree's error_message), returning a message, an object of
 * messages by field, or nothing.
 *
 * Values for fields not declared are converted as they always have been: 'true' and
 * 'false' to booleans, and numbers to numbers.
 */

const MESSAGES = {
    required: 'Please fill in this field.',
    int: 'Please enter a whole number.',
    number: 'Please enter a number.',
    bool: 'Please choose yes or no.',
    choice: 'Please choose one of the options.',
    min: (min) => 'Please enter a value of at least ' + min + '.',
    max: (max) => 'Please enter a value of at most ' + max + '.',
};

/** true or false for text that says yes or no ('true', 'True', '1', 'yes', 'on', ...); else undefined. */
function boolValue(text) {
    const t = text.toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(t)) return true;
    if (['false', '0', 'no', 'off'].includes(t)) return false;
    return undefined;
}

/** value, or what it gives for player if it is a function. */
const valueFor = (value, player) => (typeof value === 'function' ? value(player) : value);

/** A value submitted for a field nobody declared, converted as jtree always has. */
function legacyValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (typeof value === 'string' && value.trim() !== '' && !isNaN(value)) return parseFloat(value);
    return value;
}

/**
 * Converts one submitted value of a declared field; returns {value} or {error}.
 * @param {Object} field Its declaration.
 * @param {*} raw What the form sent (a string, or undefined if nothing).
 * @param {Player} player
 */
function checkField(field, raw, player) {
    const empty = raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '');
    if (empty) {
        return field.blank ? { value: null } : { error: MESSAGES.required };
    }
    const text = String(raw).trim();
    let value;
    switch (field.type) {
        case 'int':
            if (!/^[-+]?\d+$/.test(text)) return { error: MESSAGES.int };
            value = parseInt(text, 10);
            break;
        case 'number':
            value = Number(text);
            if (!Number.isFinite(value)) return { error: MESSAGES.number };
            break;
        case 'bool':
            value = boolValue(text);
            if (value === undefined) return { error: MESSAGES.bool };
            break;
        case 'choice': {
            const choices = valueFor(field.choices, player) || [];
            const values = choices.map((c) => (Array.isArray(c) ? c[0] : c));
            // Yes/no choices: 'True' (as oTree's pages write it), 'true', '1', ...
            const match = values.find((v) => String(v) === text || (typeof v === 'boolean' && boolValue(text) === v));
            if (match === undefined) return { error: MESSAGES.choice };
            value = match;
            break;
        }
        default:
            value = typeof raw === 'string' ? raw : text;
    }
    if (field.type === 'int' || field.type === 'number') {
        const min = valueFor(field.min, player);
        const max = valueFor(field.max, player);
        if (min != null && value < min) return { error: MESSAGES.min(min) };
        if (max != null && value > max) return { error: MESSAGES.max(max) };
    }
    return { value };
}

/**
 * Checks and converts what a stage's form submitted.
 * @param {Stage} stage
 * @param {Player} player
 * @param {Object} data The form's values by field name ('player.x', ...).
 * @return {{values: Object, errors: Object|null}} The converted values by name, and if
 * anything is wrong, the messages by field name ('' for the form as a whole).
 */
function checkForm(stage, player, data) {
    const declared = (stage.app && stage.app.fields) || {};
    const values = {};
    const errors = {};
    const names = new Set(Object.keys(data));
    for (const name of stage.formFields || []) {
        names.add(name);
    }
    for (const name of names) {
        const field = declared[name];
        if (field == null) {
            values[name] = legacyValue(data[name]);
            continue;
        }
        const result = checkField(field, data[name], player);
        if (result.error !== undefined) {
            errors[name] = result.error;
        } else {
            values[name] = result.value;
        }
    }
    if (Object.keys(errors).length === 0 && typeof stage.validate === 'function') {
        const result = stage.validate(player, values);
        if (typeof result === 'string' && result !== '') {
            errors[''] = result;
        } else if (result != null && typeof result === 'object') {
            Object.assign(errors, result);
        }
    }
    return { values, errors: Object.keys(errors).length > 0 ? errors : null };
}

module.exports = { checkForm, checkField, MESSAGES };
