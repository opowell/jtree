/*
 * z-Tree screens as HTML, for participants' pages (participant/ztree.js and ztree.css show them):
 * a screen's boxes placed as z-Leaf places them, each with its items and buttons, at the time of
 * rendering (the server renders again when the data changes).
 *
 * Boxes take the screen's remaining area: their distances (left, right, top, bottom) and sizes
 * (width, height) in % of it or in points (p); a box with a height or width given takes that
 * strip off the remaining area (from the top, or the side it is placed at).
 */

const lang = require('./lang.js');

const escape = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// --- Values and layouts -------------------------------------------------------------------

const parsed = new Map();
/** code parsed as an expression, once. */
function expression(code) {
    if (!parsed.has(code)) parsed.set(code, lang.parseExpr(code));
    return parsed.get(code);
}

/** The value of expression code in ctx; on an error, null (and the error noted in ctx.errors). */
function value(code, ctx) {
    if (code == null || String(code).trim() === '') return null;
    try {
        return lang.evaluate(expression(code), ctx);
    } catch (err) {
        if (ctx.errors) ctx.errors.push(code + ': ' + err.message);
        return null;
    }
}

/**
 * A layout: {kind: 'number', step} (a number's resolution: "1", "0.01", or a variable), or
 * {kind: 'text'|'radio'|'radioline'|'checkbox'|'slider'|'scrollbar'|'button', options: [[value,
 * label]], count}, from "!radio: 1 = "a"; 2 = "b"" and the like.
 */
function parseLayout(layout, ctx) {
    let text = String(layout || '').trim();
    let format = false;
    if (text.startsWith('<>')) {
        format = true;
        text = text.slice(2).trim();
    }
    const m = /^!(\w+)\s*:(.*)$/s.exec(text);
    if (m == null) {
        const step = text === '' ? 1 : lang.num(value(text, ctx));
        return { kind: 'number', step: step > 0 ? step : 1, format };
    }
    const options = [];
    let count = null;
    for (const part of m[2].split(';')) {
        const p = part.trim();
        if (p === '') continue;
        // value = "text": the value a number, or a variable's (State == AddPoint, ...).
        const opt = /^([^=]+?)\s*=\s*"([^"]*)"$/s.exec(p);
        if (opt != null) {
            const key = /^-?[\d.]+$/.test(opt[1].trim()) ? Number(opt[1]) : lang.num(value(opt[1], ctx));
            options.push([key, opt[2]]);
        }
        else if (/^\d+$/.test(p)) count = Number(p);
    }
    return { kind: m[1].toLowerCase(), options, count, format };
}

/** decimals for a resolution step (0.01 → 2). */
function decimals(step) {
    if (!(step > 0)) return 0;
    return Math.max(0, Math.min(10, -Math.floor(Math.log10(step) + 1e-9)));
}

/** v shown with a layout. */
function formatValue(v, layout, ctx) {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    if (lang.isArray(v)) return v.values.join(', ');
    const l = typeof layout === 'object' ? layout : parseLayout(layout, ctx);
    if (l.kind === 'number') {
        return lang.roundTo(Number(v), l.step).toFixed(decimals(l.step));
    }
    // A text for the value: its own, else the one of the largest value below it.
    let best = null;
    for (const [k, label] of l.options) {
        if (Math.abs(k - v) < 1e-9) { best = label; break; }
        if (k <= v && (best == null || k > best.k)) best = { k, label };
    }
    const label = best == null ? String(v) : typeof best === 'string' ? best : best.label;
    // "<|1>" in the text: the value itself, with layout 1.
    return label.replace(/<\|([^>]*)>/g, (all, lay) => formatValue(v, lay || '1', ctx));
}

/**
 * A label or text with z-Tree's formatting: "<>" starts text with variables, <var|layout>;
 * RTF ({\rtf ...}) is reduced to its text.
 */
function formatText(text, ctx) {
    let s = String(text == null ? '' : text);
    if (s.startsWith('{\\rtf')) s = rtfToText(s);
    if (!s.startsWith('<>')) return escape(s).replace(/\n/g, '<br>');
    s = s.slice(2);
    let out = '';
    const re = /<([^<>|]*)\|([^<>]*)>/g;
    let last = 0;
    let m;
    while ((m = re.exec(s)) != null) {
        out += escape(s.slice(last, m.index));
        const v = m[1].trim() === '' ? null : value(m[1], ctx);
        out += escape(formatValue(v, m[2], ctx));
        last = re.lastIndex;
    }
    out += escape(s.slice(last));
    return out.replace(/\n/g, '<br>');
}

function rtfToText(rtf) {
    return rtf.replace(/\\par[d]?/g, '\n').replace(/\{\\\*[^}]*\}/g, '').replace(/\\[a-z]+-?\d* ?/g, '').replace(/[{}]/g, '').trim();
}

// --- Placement ----------------------------------------------------------------------------

// A length: pct % of the screen plus px pixels.
const len = (pct = 0, px = 0) => ({ pct, px });
const add = (a, b) => len(a.pct + b.pct, a.px + b.px);
const sub = (a, b) => len(a.pct - b.pct, a.px - b.px);
const scale = (a, f) => len(a.pct * f, a.px * f);
const css = (a) => (Math.abs(a.px) < 1e-9 ? a.pct.toFixed(3) + '%' : 'calc(' + a.pct.toFixed(3) + '% + ' + a.px.toFixed(1) + 'px)');

/** A distance or size ("10%", "30p", "12"): a length, relative to whole; null if empty. */
function measure(text, whole) {
    const t = String(text || '').trim();
    if (t === '') return null;
    const m = /^(-?[\d.]+)\s*(%|p)?$/.exec(t);
    if (m == null) return null;
    const n = Number(m[1]);
    // A point is about 1.33 pixels.
    return m[2] === '%' ? scale(whole, n / 100) : len(0, n * 4 / 3);
}

/** box's rectangle in the area {x0, y0, x1, y1}; and the area left for the boxes after it. */
function place(box, area) {
    const W = sub(area.x1, area.x0);
    const H = sub(area.y1, area.y0);
    const axis = (lo, hi, size, start, end, whole) => {
        const a = measure(lo, whole);
        const b = measure(hi, whole);
        const s = measure(size, whole);
        if (s == null) return [add(start, a || len()), sub(end, b || len())];
        if (a != null) return [add(start, a), add(add(start, a), s)];
        if (b != null) return [sub(sub(end, b), s), sub(end, b)];
        const mid = scale(add(start, end), 0.5);
        return [sub(mid, scale(s, 0.5)), add(mid, scale(s, 0.5))];
    };
    const [x0, x1] = axis(box.left, box.right, box.width, area.x0, area.x1, W);
    const [y0, y1] = axis(box.top, box.bottom, box.height, area.y0, area.y1, H);
    const rect = { x0, y0, x1, y1 };
    // The area left for the boxes after it: less the box's strip if it says so (its options:
    // byte 1 left, 2 or 3 right, 4 or 5 top, 6 or 7 bottom; seen in z-Tree's examples).
    const o = box.options || [];
    let rest = area;
    if (o[1]) rest = { ...area, x0: x1 };
    else if (o[2] || o[3]) rest = { ...area, x1: x0 };
    else if (o[4] || o[5]) rest = { ...area, y0: y1 };
    else if (o[6] || o[7]) rest = { ...area, y1: y0 };
    return { rect, rest };
}

const style = (r) => 'left:' + css(r.x0) + ';top:' + css(r.y0) + ';width:' + css(sub(r.x1, r.x0)) + ';height:' + css(sub(r.y1, r.y0));

// --- Boxes --------------------------------------------------------------------------------

/**
 * The HTML of a screen (a stage's active or waiting boxes) for a subject.
 * @param {Object[]} boxes
 * @param {Object} view {ctx (the subject's record's), stage (index), screen ('active' or
 *   'waiting'), header (the treatment's header box, if the stage shows it), period, numPeriods,
 *   selected ({boxPath: record id}), rt}
 */
function renderScreen(boxes, view) {
    const all = (view.header ? [view.header] : []).concat(boxes);
    let area = { x0: len(0), y0: len(0), x1: len(100), y1: len(100) };
    let html = '';
    all.forEach((box, i) => {
        const path = box === view.header ? 'h' : String(i - (view.header ? 1 : 0));
        if (box.condition && !lang.bool(value(box.condition, view.ctx))) return;
        const { rect, rest } = place(box, area);
        area = rest;
        html += renderBox(box, rect, path, view);
    });
    return '<div class="ztree-screen-boxes" data-screen="' + view.screen + '">' + html + '</div>';
}

function renderBox(box, rect, path, view) {
    const attrs = 'class="ztree-box ztree-box--' + box.type + (box.frame ? ' ztree-box--frame' : '') + '" data-box="' + path + '" style="' + style(rect) + '"';
    if (box.type === 'container') {
        let area = { x0: len(0), y0: len(0), x1: len(100), y1: len(100) };
        let inner = '';
        box.boxes.forEach((child, i) => {
            if (child.condition && !lang.bool(value(child.condition, view.ctx))) return;
            const { rect: r, rest } = place(child, area);
            area = rest;
            inner += renderBox(child, r, path + '.' + i, view);
        });
        return '<div ' + attrs + '>' + inner + '</div>';
    }
    let body;
    switch (box.type) {
        case 'header': body = headerBox(box, view); break;
        case 'help': body = '<div class="ztree-help-title">' + escape(box.title) + '</div><div class="ztree-help-text">' + formatText(box.text, view.ctx) + '</div>'; break;
        case 'contractList': body = contractList(box, path, view); break;
        case 'contractCreation': body = '<div class="ztree-box-main">' + itemsTable(box.items, view.ctx, path, 'new') + '</div>' + buttons(box, path); break;
        case 'history': body = history(box, view); break;
        case 'grid': body = grid(box, view.ctx, path) + buttons(box, path); break;
        case 'chat': body = chat(box, path, view); break;
        case 'plot': body = plot(box, path, view) + buttons(box, path); break;
        case 'standard':
        case 'unknown':
        default: body = '<div class="ztree-box-main">' + itemsTable(box.items, view.ctx, path, '') + '</div>' + buttons(box, path);
    }
    return '<div ' + attrs + '><div class="ztree-box-inner">' + body + '</div></div>';
}

function headerBox(box, view) {
    const t = box.texts || {};
    const period = view.period > 0
        ? escape(t.period || 'Period') + ' ' + view.period + (view.numPeriods ? ' ' + escape(t.of || 'of') + ' ' + view.numPeriods : '')
        : escape(t.trial || 'Trial');
    return '<div class="ztree-header"><span class="ztree-header-period">' + period + '</span>' +
        '<span class="ztree-header-time" data-timeout-text="' + escape(t.timeout || 'Please reach a decision.') + '">' +
        escape(t.time || 'Remaining time [sec]:') + ' <span class="ztree-time"></span></span></div>';
}

/** Items as rows: label, and the value or an input. prefix names inputs (new: a new record's). */
function itemsTable(items, ctx, path, prefix) {
    let rows = '';
    items.forEach((item, i) => {
        if (item.kind !== 'item') return;
        rows += '<div class="ztree-item">' + itemCell(item, ctx, path + ':' + i, prefix, true) + '</div>';
    });
    return '<div class="ztree-items">' + rows + '</div>';
}

/** An item: its label and its value, or its input. */
function itemCell(item, ctx, id, prefix, withLabel) {
    const layout = parseLayout(item.layout, ctx);
    const label = withLabel ? '<div class="ztree-label">' + formatText(item.label, ctx) + '</div>' : '';
    if (!item.variable) {
        return label === '' ? '' : '<div class="ztree-label ztree-label--wide">' + formatText(item.label, ctx) + '</div>';
    }
    if (!item.input) {
        const v = value(item.variable, ctx);
        return label + '<div class="ztree-value">' + (layout.format ? formatText('<>' + formatValue(v, layout, ctx), ctx) : escape(formatValue(v, layout, ctx))) + '</div>';
    }
    const name = escape(item.variable);
    const data = ' data-item="' + escape(id) + '"';
    const min = item.min ? lang.num(value(item.min, ctx)) : null;
    const max = item.max ? lang.num(value(item.max, ctx)) : null;
    let control;
    if (layout.kind === 'radio' || layout.kind === 'text') {
        control = layout.options.map(([v, l]) => '<label class="ztree-choice"><input type="radio" name="' + name + '" value="' + v + '"' + data + '> ' + escape(l) + '</label>').join('');
        if (layout.kind === 'text') {
            control = '<select name="' + name + '"' + data + '><option value=""></option>' +
                layout.options.map(([v, l]) => '<option value="' + v + '">' + escape(l) + '</option>').join('') + '</select>';
        }
    } else if (layout.kind === 'radioline') {
        const [lo, hi] = [layout.options[0], layout.options[layout.options.length - 1]];
        const n = layout.count || 2;
        let radios = '';
        for (let k = 0; k < n; k++) {
            const v = lo[0] + (hi[0] - lo[0]) * k / (n - 1);
            radios += '<input type="radio" name="' + name + '" value="' + v + '"' + data + '>';
        }
        control = '<span class="ztree-radioline"><span>' + escape(lo[1]) + '</span>' + radios + '<span>' + escape(hi[1]) + '</span></span>';
    } else if (layout.kind === 'checkbox') {
        const [v, l] = layout.options[0] || [1, ''];
        control = '<label class="ztree-choice"><input type="checkbox" name="' + name + '" value="' + v + '"' + data + '> ' + escape(l) + '</label>';
    } else if (layout.kind === 'slider' || layout.kind === 'scrollbar') {
        const [lo, hi] = [layout.options[0] || [min || 0, ''], layout.options[1] || [max || 100, '']];
        const n = layout.count || 101;
        const step = n > 1 ? (hi[0] - lo[0]) / (n - 1) : 1;
        control = '<span class="ztree-slider"><span>' + escape(lo[1]) + '</span><input type="range" name="' + name + '" min="' + lo[0] + '" max="' + hi[0] + '" step="' + step + '"' + data +
            ' value="' + lo[0] + '"><output></output><span>' + escape(hi[1]) + '</span></span>';
    } else if (layout.kind === 'button') {
        control = layout.options.map(([v, l]) => '<button type="button" class="ztree-item-button" name="' + name + '" value="' + v + '"' + data + '>' + escape(l) + '</button>').join('');
    } else {
        control = '<input type="text" inputmode="decimal" autocomplete="off" name="' + name + '"' + data +
            (min != null ? ' data-min="' + min + '"' : '') + (max != null ? ' data-max="' + max + '"' : '') + '>';
    }
    return label + '<div class="ztree-input" data-prefix="' + prefix + '">' + control + '</div>';
}

function buttons(box, path) {
    if (box.buttons.length === 0) return '';
    return '<div class="ztree-buttons">' + box.buttons.map((b, i) =>
        '<button type="button" class="ztree-button" data-box="' + path + '" data-button="' + i + '">' + escape(b.name) + '</button>').join('') + '</div>';
}

/** A contract list: the table's records that meet the box's condition, one a row, to choose from. */
function contractList(box, path, view) {
    const rt = view.ctx.rt;
    const records = view.ctx.rt.contractRows(box, view.ctx);
    const items = box.items.filter((it) => it.kind === 'item');
    const selected = (view.selected || {})[path];
    let head = '<tr>' + (box.buttons.length ? '<th></th>' : '') + items.map((it) => '<th>' + formatText(it.label, view.ctx) + '</th>').join('') + '</tr>';
    let rows = '';
    for (const rec of records) {
        const rctx = { rt, table: box.table, rec, outer: view.ctx, errors: view.ctx.errors };
        const id = rec._id;
        rows += '<tr class="ztree-row' + (String(selected) === String(id) ? ' ztree-row--selected' : '') + '" data-record="' + id + '">' +
            (box.buttons.length ? '<td><input type="radio" name="ztree-select-' + escape(path) + '" value="' + id + '"' + (String(selected) === String(id) ? ' checked' : '') + '></td>' : '') +
            items.map((it, i) => '<td>' + itemCell(it, rctx, path + ':' + i, 'record', false) + '</td>').join('') + '</tr>';
    }
    return '<table class="ztree-list" data-box="' + path + '"><thead>' + head + '</thead><tbody>' + rows + '</tbody></table>' + buttons(box, path);
}

/** The subject's records in the periods before this one, a row each. */
function history(box, view) {
    const items = box.items.filter((it) => it.kind === 'item');
    const rows = view.ctx.rt.history(view.ctx).map((rec) => {
        const rctx = { rt: view.ctx.rt, table: 'subjects', rec, outer: null, errors: view.ctx.errors };
        return '<tr>' + items.map((it) => '<td>' + escape(formatValue(value(it.variable, rctx), it.layout, rctx)) + '</td>').join('') + '</tr>';
    }).join('');
    return '<table class="ztree-list"><thead><tr>' + items.map((it) => '<th>' + formatText(it.label, view.ctx) + '</th>').join('') + '</tr></thead><tbody>' + rows + '</tbody></table>';
}

/** A grid box: its items in columns of equal length (the first column holds the rows' labels). */
function grid(box, ctx, path) {
    const items = box.items.filter((it) => it.kind === 'item');
    let rowsPerColumn = items.length;
    for (let r = 2; r < items.length; r++) {
        if (items.length % r === 0 && items.slice(0, r).every((it) => !it.variable) && !items[r].variable && items[r + 1] && items[r + 1].variable) {
            rowsPerColumn = r;
            break;
        }
    }
    const columns = [];
    for (let i = 0; i < items.length; i += rowsPerColumn) columns.push(items.slice(i, i + rowsPerColumn).map((it, k) => [it, i + k]));
    let html = '<table class="ztree-grid">';
    for (let r = 0; r < rowsPerColumn; r++) {
        html += '<tr>' + columns.map((col) => {
            const [it, k] = col[r] || [null, 0];
            return '<td>' + (it ? itemCell(it, ctx, path + ':' + k, '', false) || formatText(it.label, ctx) : '') + '</td>';
        }).join('') + '</tr>';
    }
    return html + '</table>';
}

/** A chat box: the table's entries that meet its condition, shown with its format; and an input. */
function chat(box, path, view) {
    const rt = view.ctx.rt;
    let out = '';
    if (box.outputs && box.outputs.length) {
        const records = rt.records(box.table, {}).filter((rec) => !box.condition2 || lang.bool(value(box.condition2, { rt, table: box.table, rec, outer: view.ctx })));
        out += '<div class="ztree-chat-log">' + records.map((rec) => {
            const rctx = { rt, table: box.table, rec, outer: view.ctx };
            // <|-1>: the entry's text.
            const format = box.outputs[0].replace(/<\|-1>/g, '<' + box.variable + '|-1>');
            return '<div class="ztree-chat-line">' + formatText(format, rctx) + '</div>';
        }).join('') + '</div>';
    }
    if (box.variable) {
        out += '<div class="ztree-chat-input"><input type="text" class="ztree-chat-text" data-box="' + path + '" autocomplete="off"></div>';
    }
    return out;
}

// --- Plots ----------------------------------------------------------------------------------

/**
 * A plot box: its items evaluated (graphs' for each of their table's records) to shapes in the
 * plot's coordinates, for participant/ztree.js to draw (as SVG, at the box's size): {range,
 * shapes, inputs}. A shape a subject can click or drag has the inputs it takes, and the records
 * it was drawn for (its graphs', innermost first).
 */
function plot(box, path, view) {
    const ctx = view.ctx;
    const num = (code, c, fallback = 0) => {
        if (code == null || String(code).trim() === '') return fallback;
        const v = value(code, c);
        return v == null ? fallback : lang.num(v);
    };
    const color = (code, c) => {
        if (code == null || String(code).trim() === '') return null;
        const v = value(code, c);
        return typeof v === 'string' ? v : null;
    };
    const r = box.range || {};
    const data = {
        range: { x1: num(r.xLeft, ctx), x2: num(r.xRight, ctx, 100), y1: num(r.yBottom, ctx), y2: num(r.yTop, ctx, 100), keepAspect: box.keepAspect === true },
        shapes: [],
        inputs: [],
    };
    // Inputs: their path in the box, what they take, and whether they apply now.
    const input = (inp, id, c, records) => {
        if (inp.condition && !lang.bool(value(inp.condition, c))) return null;
        data.inputs.push({ id, action: inp.action || 0, records });
        return id;
    };
    // collected: the inputs at this level (of a graph's record: its items take them).
    const visit = (items, prefix, c, records, collected) => {
        items.forEach((item, i) => {
            const id = prefix + i;
            if (item.kind === 'graph') {
                const rt = c.rt;
                const recs = rt.records(item.table || 'globals', {}).filter((rec) => !item.graphCondition ||
                    lang.bool(value(item.graphCondition, { rt, table: item.table, rec, outer: c })));
                const joined = [];
                recs.forEach((rec) => {
                    const inner = { rt, table: item.table, rec, outer: c, errors: c.errors };
                    const before = data.shapes.length;
                    const level = [];
                    visit(item.items, id + '.', inner, [{ table: item.table, id: rec._id }, ...records], level);
                    data.shapes.slice(before).forEach((sh) => { if (sh.inputs) sh.inputs.push(...level); });
                    // The graph's line joins its points, record by record.
                    data.shapes.slice(before).filter((s) => s.kind === 'point').forEach((s) => joined.push([s.x, s.y]));
                });
                const lineColor = color(item.lineColor, c);
                if (lineColor && joined.length > 1) {
                    data.shapes.unshift({ kind: 'polyline', points: joined, color: lineColor, width: num(item.lineWidth, c, 1) });
                }
                return;
            }
            if (item.kind === 'input') {
                // In a graph: its record's items take it; in the box: a click anywhere.
                const used = input(item, id + '@' + records.map((x) => x.table + ':' + x.id).join(','), c, records);
                if (used) collected.push(used);
                return;
            }
            if (item.condition && !lang.bool(value(item.condition, c))) return;
            const shape = { kind: item.kind, inputs: [], records };
            (item.inputs || []).forEach((inp, k) => {
                const used = input(inp, id + ':' + k + '@' + records.map((x) => x.table + ':' + x.id).join(','), c, records);
                if (used) shape.inputs.push(used);
            });
            switch (item.kind) {
                case 'point':
                    Object.assign(shape, { x: num(item.x, c), y: num(item.y, c), size: num(item.size, c, 5), corners: num(item.corners, c, 4),
                        rotation: num(item.rotation, c), spokes: item.spokes, color: color(item.lineColor, c), width: num(item.lineWidth, c, 1),
                        fill: color(item.fillColor, c) });
                    break;
                case 'line':
                    Object.assign(shape, { x1: num(item.x1, c), y1: num(item.y1, c), x2: num(item.x2, c), y2: num(item.y2, c),
                        // An arrow's start: none if not given (0, given: a bar).
                        arrowStart: String(item.arrowStart || '').trim() === '' ? null : num(item.arrowStart, c),
                        arrowWidth: num(item.arrowWidth, c), arrowEnd: num(item.arrowEnd, c),
                        arrowFilled: item.arrowFilled, color: color(item.lineColor, c) || 'rgb(0,0,0)', width: num(item.lineWidth, c, 1) });
                    break;
                case 'rect': {
                    const has = (code) => code != null && String(code).trim() !== '';
                    const axis = (lo, hi, center, size) => {
                        if (has(lo) && has(hi)) return [num(lo, c), num(hi, c)];
                        const w = num(size, c);
                        if (has(lo)) return [num(lo, c), num(lo, c) + w];
                        if (has(hi)) return [num(hi, c) - w, num(hi, c)];
                        return [num(center, c) - w / 2, num(center, c) + w / 2];
                    };
                    // Height grows up from the bottom (or down from the top) given.
                    const [x1, x2] = axis(item.xLeft, item.xRight, item.xCenter, item.width);
                    const [y1, y2] = axis(item.yBottom, item.yTop, item.yCenter, item.height);
                    Object.assign(shape, { x1, x2, y1, y2, color: color(item.lineColor, c), width: num(item.lineWidth, c, 1), fill: color(item.fillColor, c) });
                    break;
                }
                case 'pie':
                    Object.assign(shape, { x: num(item.x, c), y: num(item.y, c), rx: num(item.rx, c, 1), ry: num(item.ry, c, 1),
                        a1: num(item.angleStart, c), a2: num(item.angleEnd, c, 360), color: color(item.lineColor, c), width: num(item.lineWidth, c, 1),
                        fill: color(item.fillColor, c) });
                    break;
                case 'text':
                    Object.assign(shape, { x: num(item.x, c), y: num(item.y, c), text: formatText(item.text, c).replace(/<br>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'),
                        hAlign: item.hAlign, vAlign: item.vAlign, color: color(item.color, c) || 'rgb(0,0,0)', size: num(item.fontSize, c, 12) });
                    break;
                case 'axis':
                    Object.assign(shape, { horizontal: item.horizontal, position: num(item.position, c), from: num(item.from, c), to: num(item.to, c, 1),
                        tick: num(item.tickStep, c), label: num(item.labelStep, c), layout: item.labelLayout || '1', caption: item.caption || '',
                        color: color(item.lineColor, c) || 'rgb(0,0,0)', width: num(item.lineWidth, c, 1) });
                    if (shape.label > 0) {
                        shape.labels = [];
                        for (let v = Math.ceil(shape.from / shape.label - 1e-9) * shape.label; v <= shape.to + 1e-9 && shape.labels.length < 200; v += shape.label) {
                            shape.labels.push([v, formatValue(v, shape.layout, c)]);
                        }
                    }
                    break;
                default:
                    return;
            }
            data.shapes.push(shape);
        });
    };
    const boxInputs = [];
    visit(box.plotItems || [], '', ctx, [], boxInputs);
    data.boxInputs = boxInputs;
    return '<div class="ztree-plot" data-box="' + path + '" data-plot="' + escape(JSON.stringify(data)) + '"></div>';
}

module.exports = { renderScreen, formatValue, formatText, parseLayout, place, measure, value, expression, escape };
