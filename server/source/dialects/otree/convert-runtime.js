/*
 * What jtree apps converted from oTree apps use (see convert.js): written beside each converted
 * app as otree.cjs, and required by its app.jtt. It does what oTree's models' methods and Python's
 * built-ins do, for the code translated from Python, and sets stages up as oTree's pages.
 *
 * Python does not say what type a variable is, so helpers look at what they are given (a
 * player, group or period, oTree's subsession).
 */
const fs = require('fs');
const path = require('path');

// oTree's pages are written for Bootstrap 5; converted screens link these (see convert.js).
const STYLES = '<link rel="stylesheet" href="/shared/bootstrap-5.3.8/bootstrap.min.css">' +
    '<link rel="stylesheet" href="/participant/otree.css">';

const otree = {
    STYLES,

    // jtree's classes, by name (their objects have methods named like the others' fields).
    isPlayer: (x) => x != null && typeof x === 'object' && x.constructor.name === 'Player',
    isGroup: (x) => x != null && typeof x === 'object' && x.constructor.name === 'Group',
    isParticipant: (x) => x != null && typeof x === 'object' && x.constructor.name === 'Participant',

    // --- Models ---------------------------------------------------------------------------

    /** The period (oTree's subsession) of a player or group, or itself. */
    period: (x) => (otree.isPlayer(x) ? x.group.period : otree.isGroup(x) ? x.period : x),
    roundNumber: (x) => otree.period(x).id,
    session: (x) => {
        if (otree.isPlayer(x) || otree.isParticipant(x)) return (x.participant || x).session;
        return otree.period(x).app.session;
    },
    getPlayers: (x) => (otree.isGroup(x) ? x.players.slice() : otree.period(x).groups.flatMap((g) => g.players)),
    getGroups: (x) => otree.period(x).groups.slice(),
    playerById: (group, id) => group.players.find((p) => p.idInGroup === id),
    playerByRole: (group, role) => group.players.find((p) => otree.role(p) === role),
    others: (player) => player.group.players.filter((p) => p !== player),
    othersInSubsession: (player) => otree.getPlayers(otree.period(player)).filter((p) => p !== player),
    idInSubsession: (x) => (otree.isGroup(x) ? otree.period(x).groups.indexOf(x) + 1 : otree.getPlayers(otree.period(x)).indexOf(x) + 1),
    /** A player's role: the C.*_ROLE for their id in the group, in order ('' if there are none). */
    role: (player) => {
        const roles = Object.keys(otree.C(player)).filter((k) => k.endsWith('_ROLE')).map((k) => otree.C(player)[k]);
        return roles[player.idInGroup - 1] || '';
    },
    C: (x) => otree.period(otree.isParticipant(x) ? x.player : x).app.C || {},
    inRounds: (x, first, last) => x.inAllPeriods().filter((y) => otree.roundNumber(y) >= first && otree.roundNumber(y) <= last),
    /** A player's payoff (jtree's points), or a participant's over the session. */
    payoff: (x) => {
        if (typeof x.points === 'function') return x.points();
        return x.points == null ? 0 : x.points;
    },
    paymentWithFee: (participant) => participant.payment(),
    /** participant.vars, session.vars: an object kept on the participant or session. */
    vars: (x) => {
        if (x.vars == null) x.vars = {};
        return x.vars;
    },
    config: (session) => session.otreeConfig || {},
    /** A field's value, or null (field_maybe_none). */
    field: (x, name) => (x[name] === undefined ? null : x[name]),

    // Grouping (oTree's group matrix: rows of players, or of their ids in the subsession).
    groupMatrix: (period) => otree.period(period).groups.map((g) => g.players.slice()),
    setGroups: (period, matrix) => {
        const players = otree.getPlayers(period);
        otree.period(period).setGroups(matrix.map((row) => row.map((p) => (typeof p === 'object' ? p : players[p - 1]).participant.id)));
    },
    groupRandomly: (period) => {
        const players = otree.shuffle(otree.getPlayers(period));
        const size = otree.period(period).groups[0].players.length;
        const rows = [];
        for (let i = 0; i < players.length; i += size) rows.push(players.slice(i, i + size));
        otree.setGroups(period, rows);
    },
    groupLikeRound: (period, n) => {
        const before = otree.period(period).app.periods[n - 1];
        otree.period(period).setGroups(before.groups.map((g) => g.players.map((p) => p.participant.id)));
    },

    /** A field's value as shown: its choice's label, Yes or No, or the value (field_display). */
    display: (x, name) => {
        const field = (otree.period(x).app.fields || {})[(otree.isGroup(x) ? 'group.' : 'player.') + name] || {};
        const value = x[name];
        const choices = typeof field.choices === 'function' ? field.choices(otree.isGroup(x) ? x.players[0] : x) : field.choices;
        for (const c of choices || []) {
            if (Array.isArray(c) && c[0] === value) return c[1];
        }
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        return value;
    },

    /** Sets fields' initial values (oTree's initial=) on a period's players and groups. */
    initialize: (period, initial) => {
        for (const group of period.groups) {
            for (const [name, value] of Object.entries(initial.group || {})) {
                if (group[name] === undefined) group[name] = value;
            }
            for (const player of group.players) {
                for (const [name, value] of Object.entries(initial.player || {})) {
                    if (player[name] === undefined) player[name] = value;
                }
            }
        }
    },

    // --- Pages ----------------------------------------------------------------------------

    /** Sets stage up as an oTree page: each player on their own, with a form and its own Next button. */
    page: (stage) => {
        stage.wrapPlayingScreenInFormTag = 'yes';
        stage.waitToStart = false;
        stage.waitToEnd = false;
        stage.addOKButtonIfNone = false;
        stage.formFields = [];
        stage.playerStart = (player) => {
            player.page = otree.pageVars(player, {});
        };
    },

    /** Sets stage up as an oTree wait page: it waits for the group, and then ends. */
    waitPage: (stage, title, body) => {
        stage.wrapPlayingScreenInFormTag = 'no';
        stage.waitToStart = true;
        stage.waitToEnd = true;
        stage.addOKButtonIfNone = false;
        stage.activeScreen = STYLES + '<div class="otree-page"><h2 class="otree-title">' + title + '</h2><p>' + body + '</p></div>';
        stage.playerStart = otree.endSoon;
    },

    /** A page's screen: pages/<name>.html beside the app. */
    screen: (app, name) => fs.readFileSync(path.join(path.dirname(app.appPath), 'pages', name + '.html'), 'utf8'),

    /** Ends a player's wait page as soon as it has started. */
    endSoon: (player) => player.session().pushMessage(player, true, 'endStage'),

    /**
     * Checks a page's form as oTree does: each field's <field>_error_message(model, value), then
     * the page's error_message(player, values). Returns messages by field ('' for the page).
     */
    validate: (player, values, model, fieldChecks, pageCheck) => {
        const obj = model === 'group' ? player.group : player;
        const short = {};
        for (const [full, value] of Object.entries(values)) short[full.split('.').slice(1).join('.')] = value;
        const errors = {};
        for (const [name, check] of Object.entries(fieldChecks || {})) {
            if (name in short) {
                const message = check(obj, short[name]);
                if (message) errors[model + '.' + name] = String(message);
            }
        }
        if (Object.keys(errors).length === 0 && pageCheck != null) {
            const result = pageCheck(player, short);
            if (result != null && typeof result === 'object') {
                for (const [k, v] of Object.entries(result)) if (v) errors[model + '.' + k] = String(v);
            } else if (result) {
                errors[''] = String(result);
            }
        }
        return Object.keys(errors).length > 0 ? errors : undefined;
    },

    /**
     * What a page's screen shows (as player.page): player, group, subsession, participant,
     * session and C as oTree's templates see them, with what vars_for_template gave, and the
     * form's fields' choices, min and max for the player.
     */
    pageVars: (player, vars) => {
        const app = otree.period(player).app;
        const page = {
            player: otree.view(player, 2),
            group: otree.view(player.group, 2),
            subsession: otree.view(otree.period(player), 1),
            participant: otree.view(player.participant, 1),
            session: otree.view(otree.session(player), 1),
            C: app.C || {},
            form: {},
        };
        page.player.in_all_rounds = player.inAllPeriods().map((p) => otree.view(p, 0));
        page.player.in_previous_rounds = player.inPreviousPeriods().map((p) => otree.view(p, 0));
        for (const name of player.stage.formFields || []) {
            const field = (app.fields || {})[name] || {};
            const value = (v) => (typeof v === 'function' ? v(player) : v);
            const choices = value(field.choices);
            page.form[name.split('.').pop()] = {
                min: value(field.min),
                max: value(field.max),
                choices: choices == null ? null : choices.map((c) => (Array.isArray(c) ? c : [c, c])),
            };
        }
        for (const [k, v] of Object.entries(vars || {})) page[k] = otree.data(v);
        return page;
    },

    /**
     * A player, group, period, participant or session as oTree's templates see it: its fields,
     * with oTree's names (payoff, id_in_group, round_number, ...); depth says how far to follow
     * it to the others (a group's players, a player's group).
     */
    view: (x, depth) => {
        if (x == null) return null;
        const out = {};
        const own = (obj, skip) => {
            for (const [k, v] of Object.entries(obj)) {
                if (skip.includes(k) || typeof v === 'function' || k === 'page') continue;
                if (v == null || typeof v !== 'object' || Array.isArray(v) && v.every((e) => e == null || typeof e !== 'object')) out[k] = v;
            }
        };
        if (otree.isPlayer(x)) {
            own(x, ['id', 'status', 'stageIndex', 'timeInStage', 'points', 'outputHide', 'outputHideAuto']);
            out.payoff = otree.payoff(x);
            out.id_in_group = x.idInGroup;
            out.round_number = otree.roundNumber(x);
            out.role = otree.role(x);
            out.id_in_subsession = otree.idInSubsession(x);
            out.participant = otree.view(x.participant, 0);
            if (depth > 1) out.group = otree.view(x.group, depth - 1);
        } else if (otree.isGroup(x)) {
            own(x, ['id', 'outputHide', 'outputHideAuto']);
            out.id_in_subsession = otree.idInSubsession(x);
            out.round_number = otree.roundNumber(x);
            if (depth > 0) out.get_players = x.players.map((p) => otree.view(p, 0));
        } else if (otree.isParticipant(x)) {
            out.vars = Object.assign({}, x.vars);
            out.label = x.label || null;
            out.code = x.id;
            out.id_in_session = Object.keys(x.session.participants).indexOf(String(x.id)) + 1;
            out.payoff = otree.payoff(x);
            out.payoff_plus_participation_fee = x.payment();
            for (const k of Object.keys(x)) {
                if (!(k in out) && (x[k] == null || typeof x[k] !== 'object') && typeof x[k] !== 'function') out[k] = x[k];
            }
        } else if (x.constructor.name === 'Period') {
            out.round_number = x.id;
            if (depth > 0) out.get_groups = x.groups.map((g) => otree.view(g, 1));
        } else {
            // A session.
            out.code = x.id;
            out.config = Object.assign({}, otree.config(x));
            out.vars = Object.assign({}, x.vars);
            out.num_participants = Object.keys(x.participants).length;
        }
        return out;
    },

    /** What vars_for_template gives, as data for the page: players and groups as their views. */
    data: (value) => {
        if (otree.isPlayer(value) || otree.isGroup(value) || otree.isParticipant(value)) return otree.view(value, 1);
        if (Array.isArray(value)) return value.map(otree.data);
        if (value != null && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, otree.data(v)]));
        return value;
    },

    // --- Python's built-ins -----------------------------------------------------------------

    list: (x) => (x == null ? [] : Array.isArray(x) ? x : typeof x === 'string' ? Array.from(x) : typeof x[Symbol.iterator] === 'function' ? Array.from(x) : Object.keys(x)),
    sum: (xs, start = 0) => otree.list(xs).reduce((a, b) => a + b, start),
    len: (x) => (x == null ? 0 : Array.isArray(x) || typeof x === 'string' ? x.length : Object.keys(x).length),
    min: (...args) => otree.extreme(args, -1),
    max: (...args) => otree.extreme(args, 1),
    /** min (sign -1) or max (1) of a list, or of the arguments; the last may be {key}. */
    extreme: (args, sign) => {
        let key = (x) => x;
        if (args.length > 1 && args[args.length - 1] != null && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1]) && 'key' in args[args.length - 1]) {
            key = args.pop().key;
        }
        const xs = args.length === 1 ? otree.list(args[0]) : args;
        let best;
        for (const x of xs) {
            if (best === undefined || otree.cmp(key(x), key(best)) === sign) best = x;
        }
        return best;
    },
    /** Python's round: halves to even. */
    round: (x, n = 0) => {
        const f = Math.pow(10, n);
        const v = x * f;
        const r = Math.round(v);
        const exact = Math.abs(Math.abs(v % 1) - 0.5) < 1e-9;
        return (exact && r % 2 !== 0 ? r - 1 : r) / f;
    },
    range: (a, b, step = 1) => {
        if (b === undefined) { b = a; a = 0; }
        const out = [];
        for (let i = a; step > 0 ? i < b : i > b; i += step) out.push(i);
        return out;
    },
    /** oTree's currency_range: from a to b, both included. */
    currencyRange: (a, b, step = 1) => {
        const out = [];
        for (let i = a; i <= b + 1e-9; i += step) out.push(Math.round(i * 1e6) / 1e6);
        return out;
    },
    /** Python's ordering: -1, 0 or 1; lists (tuples) item by item. */
    cmp: (a, b) => {
        if (Array.isArray(a) && Array.isArray(b)) {
            for (let i = 0; i < Math.min(a.length, b.length); i++) {
                const c = otree.cmp(a[i], b[i]);
                if (c !== 0) return c;
            }
            return a.length - b.length < 0 ? -1 : a.length > b.length ? 1 : 0;
        }
        return a < b ? -1 : a > b ? 1 : 0;
    },
    sorted: (xs, opts = {}) => {
        const key = opts.key || ((x) => x);
        // Stable, as Python's sort; reverse keeps equal items in order.
        const out = otree.list(xs).slice().sort((a, b) => otree.cmp(key(a), key(b)) * (opts.reverse ? -1 : 1));
        return out;
    },
    sortInPlace: (xs, opts = {}) => {
        const sorted = otree.sorted(xs, opts);
        xs.splice(0, xs.length, ...sorted);
    },
    enumerate: (xs, start = 0) => otree.list(xs).map((x, i) => [i + start, x]),
    zip: (...lists) => {
        const ls = lists.map(otree.list);
        return ls[0].slice(0, Math.min(...ls.map((l) => l.length))).map((_, i) => ls.map((l) => l[i]));
    },
    contains: (container, x) => {
        if (container == null) return false;
        if (Array.isArray(container)) return container.some((y) => otree.eq(x, y));
        if (typeof container === 'string') return container.includes(x);
        return Object.prototype.hasOwnProperty.call(container, otree.key(x));
    },
    /** Python's ==: lists by their items. */
    eq: (a, b) => (Array.isArray(a) && Array.isArray(b) ? a.length === b.length && a.every((x, i) => otree.eq(x, b[i])) : a === b),
    /** A dict's key, for a tuple too. */
    key: (k) => (Array.isArray(k) ? JSON.stringify(k) : k),
    unique: (xs) => Array.from(new Set(otree.list(xs))),
    items: (d) => Object.entries(d),
    keys: (d) => Object.keys(d),
    values: (d) => Object.values(d),
    get: (d, k, fallback = null) => (d != null && Object.prototype.hasOwnProperty.call(d, otree.key(k)) ? d[otree.key(k)] : fallback),
    setdefault: (d, k, value = null) => {
        if (!Object.prototype.hasOwnProperty.call(d, otree.key(k))) d[otree.key(k)] = value;
        return d[otree.key(k)];
    },
    /** xs[i], for i < 0 from the end. */
    at: (xs, i) => (i < 0 ? xs[xs.length + i] : xs[i]),
    remove: (xs, x) => {
        const i = xs.findIndex((y) => otree.eq(x, y));
        if (i >= 0) xs.splice(i, 1);
    },
    count: (xs, x) => otree.list(xs).filter((y) => otree.eq(x, y)).length,
    popAt: (xs, i) => xs.splice(i < 0 ? xs.length + i : i, 1)[0],
    str: (x) => (x === true ? 'True' : x === false ? 'False' : x == null ? 'None' : Array.isArray(x) ? '[' + x.map(otree.repr).join(', ') + ']' : String(x)),
    repr: (x) => (typeof x === 'string' ? "'" + x + "'" : otree.str(x)),
    int: (x) => (typeof x === 'string' ? parseInt(x, 10) : Math.trunc(Number(x))),
    float: (x) => Number(x),
    bool: (x) => (Array.isArray(x) ? x.length > 0 : x != null && typeof x === 'object' ? Object.keys(x).length > 0 : !!x),
    /** Python's +: lists and strings joined, numbers added. */
    add: (a, b) => (Array.isArray(a) ? a.concat(b) : a + b),
    repeat: (xs, n) => Array.from({ length: n }, () => xs).flat(),
    floordiv: (a, b) => Math.floor(a / b),
    mod: (a, b) => ((a % b) + b) % b,
    any: (xs) => otree.list(xs).some(Boolean),
    all: (xs) => otree.list(xs).every(Boolean),
    /** A value in an f-string, with a format spec ('.2f', 'd', ',', ...). */
    format: (x, spec) => {
        const m = /^(,)?(?:\.(\d+))?([fd%]?)$/.exec(spec || '');
        if (m == null) return String(x);
        let v = Number(x);
        if (m[3] === '%') v *= 100;
        let s = m[2] != null ? v.toFixed(Number(m[2])) : m[3] === 'd' ? String(Math.trunc(v)) : String(x);
        if (m[1]) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return m[3] === '%' ? s + '%' : s;
    },

    // Python's random.
    random: () => Math.random(),
    randint: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
    uniform: (a, b) => a + Math.random() * (b - a),
    choice: (xs) => xs[Math.floor(Math.random() * xs.length)],
    shuffle: (xs) => {
        for (let i = xs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [xs[i], xs[j]] = [xs[j], xs[i]];
        }
        return xs;
    },
    sample: (xs, k) => otree.shuffle(otree.list(xs).slice()).slice(0, k),
};

module.exports = otree;
