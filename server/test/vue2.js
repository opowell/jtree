// Renders jtree screens (Vue 2 templates, as participants' pages compile them) to HTML in Node,
// with the Vue jtree's pages use, for tests: no browser, and no DOM beyond what Vue's template
// compiler needs to decode entities.

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { CLIENT } = require('./harness.js');

const ENTITIES = { '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ', '&amp;': '&' };

let Vue = null;
function vue() {
    if (Vue == null) {
        const sandbox = {
            module: { exports: {} }, console, setTimeout, clearTimeout, Promise,
            document: {
                createElement: () => ({
                    set innerHTML(v) { this.text = v.replace(/&(lt|gt|quot|#39|nbsp|amp);/g, (e) => ENTITIES[e]); },
                    get textContent() { return this.text; },
                }),
            },
        };
        sandbox.exports = sandbox.module.exports;
        vm.runInNewContext(fs.readFileSync(path.join(CLIENT, 'internal/clients/shared/vue-2.7.16.js'), 'utf8'), sandbox);
        Vue = sandbox.module.exports;
        Vue.config.productionTip = false;
        Vue.config.devtools = false;
        // As participants' pages have it (participant/defaultClient.js).
        Vue.filter('round', (value, decimals) => {
            const f = Math.pow(10, decimals || 0);
            return Math.round((value || 0) * f) / f;
        });
    }
    return Vue;
}

const escapeText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttr = (s) => escapeText(s).replace(/"/g, '&quot;');
const VOID = new Set(['input', 'br', 'hr', 'img', 'link', 'meta']);

function html(node) {
    if (node == null) return '';
    if (node.tag == null) return node.isComment ? '' : escapeText(node.text || '');
    const data = node.data || {};
    const attrs = Object.assign({}, data.attrs);
    const classes = [data.staticClass, typeof data.class === 'string' ? data.class : null].filter(Boolean);
    if (classes.length > 0) attrs.class = classes.join(' ');
    if (data.domProps && data.domProps.value !== undefined) attrs.value = data.domProps.value;
    const open = '<' + node.tag + Object.entries(attrs).map(([k, v]) => ' ' + k + '="' + escapeAttr(v) + '"').join('') + '>';
    if (VOID.has(node.tag)) return open;
    const inner = data.domProps && data.domProps.innerHTML != null ? data.domProps.innerHTML : (node.children || []).map(html).join('');
    return open + inner + '</' + node.tag + '>';
}

/**
 * The HTML of template rendered with data; throws on Vue's warnings and errors (a name the
 * template uses that data does not have, an error in an expression, a template that does not compile).
 */
function render(template, data) {
    const V = vue();
    const problems = [];
    V.config.warnHandler = (msg) => problems.push(msg);
    V.config.errorHandler = (err) => problems.push(String(err && err.stack || err));
    try {
        const compiled = V.compile('<div>' + template + '</div>');
        const instance = new V({ data, render: compiled.render, staticRenderFns: compiled.staticRenderFns });
        const out = html(instance._render());
        if (problems.length > 0) throw new Error('Vue: ' + problems.join('\n'));
        return out;
    } finally {
        V.config.warnHandler = null;
        V.config.errorHandler = null;
    }
}

module.exports = { render };
