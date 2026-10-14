const { fail } = require('./util.js');

/*
 * A jtree screen's HTML as a tree, for the app editor's structured mode: elements, text and
 * comments, each with the stretch of the screen it came from, so an edit to one element changes
 * only that stretch. It reads what participants' browsers read (Vue's {{ }} and :attributes
 * included) and forgives what they forgive: end tags left out, stray end tags, unquoted values.
 *
 * Nodes: {type: 'element', tag, attrs: [{name, value, range}], range, open: {start, end},
 * inner: {start, end} | null, children} | {type: 'text' | 'comment', text, range}. An attribute
 * written without a value has value null. White space around text, and text that is only white
 * space, is left out: it is the layout between nodes, and edits keep it. An element whose end tag
 * is left out ends at the last thing in it.
 */

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style', 'textarea', 'title']);
const BLOCK = ['address', 'article', 'aside', 'blockquote', 'div', 'dl', 'fieldset', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul'];

/** Elements an opening tag closes when one of them is the element open. */
const CLOSES = {
    li: ['li'], dt: ['dt', 'dd'], dd: ['dt', 'dd'], option: ['option'], optgroup: ['optgroup', 'option'],
    tr: ['tr', 'td', 'th'], td: ['td', 'th'], th: ['td', 'th'], thead: ['tbody', 'tfoot'], tbody: ['thead', 'tbody', 'tfoot'], tfoot: ['thead', 'tbody'],
};
for (const tag of BLOCK) CLOSES[tag] = (CLOSES[tag] || []).concat('p');

const NAME = /[A-Za-z][\w:-]*/y;
const ATTR = /\s*([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/y;

/** The nodes of html, as above. */
function parse(html) {
    const root = { type: 'root', children: [] };
    const stack = [root];
    const top = () => stack[stack.length - 1];
    const close = (el, end, closeStart) => {
        el.range.end = end;
        el.inner = { start: el.open.end, end: closeStart };
    };
    let i = 0;
    let text = 0;
    /** pos, back past white space (not before floor): where an element left open ends. */
    const back = (pos, floor) => {
        while (pos > floor && /\s/.test(html[pos - 1])) pos--;
        return pos;
    };
    const implied = (el, pos) => { const end = back(pos, el.open.end); close(el, end, end); };
    const flushText = (to) => {
        const t = html.slice(text, to);
        if (t.trim() === '') return;
        const start = text + t.length - t.trimStart().length;
        const end = text + t.trimEnd().length;
        top().children.push({ type: 'text', text: html.slice(start, end), range: { start, end } });
    };
    while (i < html.length) {
        const lt = html.indexOf('<', i);
        if (lt < 0) break;
        if (html.startsWith('<!--', lt)) {
            flushText(lt);
            const end = html.indexOf('-->', lt + 4);
            const stop = end < 0 ? html.length : end + 3;
            top().children.push({ type: 'comment', text: html.slice(lt + 4, end < 0 ? html.length : end), range: { start: lt, end: stop } });
            i = text = stop;
            continue;
        }
        if (html[lt + 1] === '/') {
            NAME.lastIndex = lt + 2;
            const m = NAME.exec(html);
            if (!m) { i = lt + 1; continue; }
            flushText(lt);
            const tag = m[0].toLowerCase();
            const gt = html.indexOf('>', NAME.lastIndex);
            const stop = gt < 0 ? html.length : gt + 1;
            // Close up to the element it ends; an end tag for nothing open is dropped.
            const at = stack.map((e) => e.tag).lastIndexOf(tag);
            if (at > 0) {
                while (stack.length > at + 1) implied(stack.pop(), lt);
                close(stack.pop(), stop, lt);
            }
            i = text = stop;
            continue;
        }
        NAME.lastIndex = lt + 1;
        const m = NAME.exec(html);
        if (!m) { i = lt + 1; continue; }
        flushText(lt);
        const tag = m[0].toLowerCase();
        const attrs = [];
        let j = NAME.lastIndex;
        for (;;) {
            ATTR.lastIndex = j;
            const a = ATTR.exec(html);
            if (!a) break;
            const start = a.index + a[0].length - a[0].trimStart().length;
            const value = a[2] ?? a[3] ?? a[4] ?? null;
            attrs.push({ name: a[1], value, quote: a[2] != null ? '"' : a[3] != null ? "'" : '', range: { start, end: ATTR.lastIndex } });
            j = ATTR.lastIndex;
        }
        const gt = html.indexOf('>', j);
        const stop = gt < 0 ? html.length : gt + 1;
        const selfClosing = html[stop - 2] === '/';
        while (CLOSES[tag] && CLOSES[tag].includes(top().tag)) implied(stack.pop(), lt);
        const el = { type: 'element', tag, attrs, range: { start: lt, end: stop }, open: { start: lt, end: stop }, inner: null, children: [] };
        top().children.push(el);
        i = text = stop;
        if (VOID.has(tag) || selfClosing) continue;
        if (RAW.has(tag)) {
            const end = html.toLowerCase().indexOf('</' + tag, stop);
            const closeStart = end < 0 ? html.length : end;
            const gt2 = end < 0 ? -1 : html.indexOf('>', end);
            text = stop;
            stack.push(el);
            flushText(closeStart);
            stack.pop();
            close(el, gt2 < 0 ? html.length : gt2 + 1, closeStart);
            i = text = el.range.end;
            continue;
        }
        stack.push(el);
    }
    flushText(html.length);
    while (stack.length > 1) implied(stack.pop(), html.length);
    return root.children;
}

/** The node at path (indexes into children, from the top), or fails. */
function nodeAt(nodes, path) {
    let node = null;
    let list = nodes;
    for (const k of path) {
        node = list && list[k];
        if (!node) fail('no element at ' + JSON.stringify(path) + '; the screen has changed');
        list = node.children;
    }
    if (!node) fail('no element given');
    return { node, siblings: path.length === 1 ? nodes : nodeAt(nodes, path.slice(0, -1)).node.children };
}

/** The indentation of the line pos is on. */
function lineIndent(html, pos) {
    const lineStart = html.lastIndexOf('\n', pos - 1) + 1;
    return /^[ \t]*/.exec(html.slice(lineStart))[0];
}

/** Whether range is alone on its line(s): only white space before it and after it there. */
function ownLine(html, range) {
    const lineStart = html.lastIndexOf('\n', range.start - 1) + 1;
    const lineEnd = html.indexOf('\n', range.end);
    return html.slice(lineStart, range.start).trim() === '' && html.slice(range.end, lineEnd < 0 ? html.length : lineEnd).trim() === '';
}

/** Lines after the first indented by indent, for HTML put where a line starts with it. */
const indentLines = (text, indent) => String(text).replace(/\r\n/g, '\n').trim().split('\n').map((l, k) => (k && l.trim() ? indent + l : l)).join('\n');

/** An attribute as written, quoted with what it was quoted with, else ' (or " if the value has a '). */
function attrSource(name, value, quote) {
    if (value == null) return name;
    value = String(value);
    let q = quote || "'";
    if (value.includes(q)) q = q === "'" ? '"' : "'";
    if (value.includes(q)) value = value.replace(/"/g, '&quot;'), q = '"';
    return name + '=' + q + value + q;
}

const splice = (html, range, text) => html.slice(0, range.start) + text + html.slice(range.end);

/**
 * html with edit made. Edits (path: the node's indexes, as parse gives them):
 * - {do: 'insert', path?, where: 'before' | 'after' | 'inside', html}: next to the node, or as
 *   the last of its children (inside); with no path, at the end of the screen.
 * - {do: 'remove', path}, {do: 'move', path, by: -1 | 1} (past the sibling before or after)
 * - {do: 'replace', path, html}: the node, as written, becomes html.
 * - {do: 'setContent', path, html}: what is between an element's tags.
 * - {do: 'setAttr', path, name, value?, remove?}: value null for an attribute without one.
 */
function edit(html, e) {
    const nodes = parse(html);
    switch (e.do) {
        case 'insert': {
            const code = String(e.html || '');
            if (!code.trim()) fail('nothing to put in');
            if (!e.path || !e.path.length) {
                if (nodes.length) return edit(html, { do: 'insert', path: [nodes.length - 1], where: 'after', html: code });
                // An empty screen: a line of its own, as a new stage's screen is written.
                return '\n    ' + indentLines(code, '    ') + '\n';
            }
            const { node } = nodeAt(nodes, e.path);
            if (e.where === 'inside') {
                if (node.type !== 'element' || !node.inner) fail('<' + (node.tag || node.type) + '> has nothing inside');
                const last = node.children[node.children.length - 1];
                if (last) return edit(html, { do: 'insert', path: e.path.concat(node.children.length - 1), where: 'after', html: code });
                // Empty: on a line of its own, indented one more, if the element takes lines; else just inside.
                if (ownLine(html, node.range) && /\n/.test(html.slice(node.inner.start, node.inner.end) + code)) {
                    const indent = lineIndent(html, node.range.start);
                    return splice(html, node.inner, '\n' + indent + '    ' + indentLines(code, indent + '    ') + '\n' + indent);
                }
                return splice(html, node.inner, code);
            }
            const indent = lineIndent(html, node.range.start);
            const separate = ownLine(html, node.range);
            if (e.where === 'before') return splice(html, { start: node.range.start, end: node.range.start }, indentLines(code, indent) + (separate ? '\n' + indent : ''));
            return splice(html, { start: node.range.end, end: node.range.end }, (separate ? '\n' + indent : '') + indentLines(code, indent));
        }
        case 'remove': {
            const { node } = nodeAt(nodes, e.path);
            let { start, end } = node.range;
            if (ownLine(html, node.range)) {
                // Its lines go with it.
                start = html.lastIndexOf('\n', start - 1) + 1;
                const lineEnd = html.indexOf('\n', end);
                end = lineEnd < 0 ? html.length : lineEnd + 1;
                if (lineEnd < 0 && start > 0) start--;
            }
            return splice(html, { start, end }, '');
        }
        case 'move': {
            const { node, siblings } = nodeAt(nodes, e.path);
            const k = siblings.indexOf(node);
            const other = siblings[k + (e.by < 0 ? -1 : 1)];
            if (!other) fail('it is already the ' + (e.by < 0 ? 'first' : 'last') + ' there');
            const [a, b] = e.by < 0 ? [other, node] : [node, other];
            // Swapped as written; what is between them stays.
            return html.slice(0, a.range.start) + html.slice(b.range.start, b.range.end) + html.slice(a.range.end, b.range.start) +
                html.slice(a.range.start, a.range.end) + html.slice(b.range.end);
        }
        case 'replace': {
            const { node } = nodeAt(nodes, e.path);
            return splice(html, node.range, indentLines(String(e.html ?? ''), lineIndent(html, node.range.start)));
        }
        case 'setContent': {
            const { node } = nodeAt(nodes, e.path);
            if (node.type !== 'element' || !node.inner) fail('<' + (node.tag || node.type) + '> has nothing inside');
            return splice(html, node.inner, String(e.html ?? ''));
        }
        case 'setAttr': {
            const { node } = nodeAt(nodes, e.path);
            if (node.type !== 'element') fail('only an element has attributes');
            const name = String(e.name || '').trim();
            if (!/^[^\s"'>\/=]+$/.test(name)) fail('not an attribute name: ' + JSON.stringify(name));
            const attr = node.attrs.find((a) => a.name === name);
            if (e.remove) {
                if (!attr) return html;
                let start = attr.range.start;
                while (start > 0 && /[ \t]/.test(html[start - 1])) start--;
                return splice(html, { start, end: attr.range.end }, '');
            }
            if (attr) return splice(html, attr.range, attrSource(name, e.value, attr.quote));
            const last = node.attrs[node.attrs.length - 1];
            const at = last ? last.range.end : node.open.start + 1 + node.tag.length;
            return splice(html, { start: at, end: at }, ' ' + attrSource(name, e.value));
        }
        default:
            fail('unknown screen edit: ' + e.do);
    }
}

/** Nodes as the editor is sent them: without what it does not need. */
function describe(nodes) {
    return nodes.map((n) => (n.type === 'element'
        ? { type: n.type, tag: n.tag, attrs: n.attrs.map((a) => ({ name: a.name, value: a.value })), range: n.range, inner: n.inner, children: describe(n.children) }
        : { type: n.type, text: n.text, range: n.range }));
}

module.exports = { parse, edit, describe };
