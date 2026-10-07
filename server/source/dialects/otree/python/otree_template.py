"""oTree's template language, for rendering oTree apps' pages in jtree.

Written from oTree's documentation. Supports:
  {{ expr }} and {{ expr|filter }}    dotted names (methods called without arguments, .0 for an index)
  {{ if }} {{ elif }} {{ else }} {{ endif }}, {{ for x in xs }} {{ endfor }}
  {{ block name }} {{ endblock }}, {{ extends "..." }}, {{ include "..." }}
  {{ formfields }}, {{ formfield 'name' }} / {{ formfield player.name label="..." }},
  {{ formfield_errors 'name' }}, {{ next_button }}, {{ static 'path' }}, {# comments #}
Filters: c, to0, to1, to2, json, safe, escape, default:"x", length, upper, lower.
Expressions are evaluated from a whitelist of Python syntax (names, attributes, indexes,
literals, comparisons, and/or/not, + - * /), never with eval.
"""

import ast
import html
import json
import re

TOKEN = re.compile(r'(\{\{.*?\}\}|\{#.*?#\})', re.S)


class TemplateError(Exception):
    pass


class SafeText(str):
    """Text that is HTML already, not to be escaped."""


def escape(value):
    if isinstance(value, SafeText):
        return value
    return html.escape('' if value is None else str(value))


# --- Expressions --------------------------------------------------------------------------

_DOTTED_INDEX = re.compile(r'\.(\d+)\b')


def _auto_call(value):
    if callable(value) and not isinstance(value, type):
        return value()
    return value


def evaluate(expr, context):
    expr = _DOTTED_INDEX.sub(r'[\1]', expr.strip())
    try:
        tree = ast.parse(expr, mode='eval')
    except SyntaxError as err:
        raise TemplateError(f'cannot read {expr!r}: {err.msg}')
    return _eval(tree.body, context)


def _eval(node, ctx):
    if isinstance(node, ast.Constant):
        return node.value
    if isinstance(node, ast.Name):
        if node.id in ctx:
            return ctx[node.id]
        if node.id in ('True', 'False', 'None'):
            return {'True': True, 'False': False, 'None': None}[node.id]
        raise TemplateError(f'{node.id!r} is not defined in this template')
    if isinstance(node, ast.Attribute):
        obj = _eval(node.value, ctx)
        if node.attr.startswith('_'):
            raise TemplateError(f'cannot use {node.attr!r} in a template')
        if isinstance(obj, dict) and node.attr in obj:
            return _auto_call(obj[node.attr])
        return _auto_call(getattr(obj, node.attr))
    if isinstance(node, ast.Subscript):
        return _eval(node.value, ctx)[_eval(node.slice, ctx)]
    if isinstance(node, (ast.List, ast.Tuple)):
        return [_eval(e, ctx) for e in node.elts]
    if isinstance(node, ast.UnaryOp):
        v = _eval(node.operand, ctx)
        if isinstance(node.op, ast.Not): return not v
        if isinstance(node.op, ast.USub): return -v
        if isinstance(node.op, ast.UAdd): return +v
    if isinstance(node, ast.BoolOp):
        if isinstance(node.op, ast.And):
            result = True
            for v in node.values:
                result = _eval(v, ctx)
                if not result:
                    return result
            return result
        result = False
        for v in node.values:
            result = _eval(v, ctx)
            if result:
                return result
        return result
    if isinstance(node, ast.BinOp):
        a, b = _eval(node.left, ctx), _eval(node.right, ctx)
        ops = {ast.Add: lambda: a + b, ast.Sub: lambda: a - b, ast.Mult: lambda: a * b,
               ast.Div: lambda: a / b, ast.Mod: lambda: a % b}
        if type(node.op) in ops:
            return ops[type(node.op)]()
    if isinstance(node, ast.Compare):
        left = _eval(node.left, ctx)
        for op, right_node in zip(node.ops, node.comparators):
            right = _eval(right_node, ctx)
            ok = {ast.Eq: lambda: left == right, ast.NotEq: lambda: left != right,
                  ast.Lt: lambda: left < right, ast.LtE: lambda: left <= right,
                  ast.Gt: lambda: left > right, ast.GtE: lambda: left >= right,
                  ast.In: lambda: left in right, ast.NotIn: lambda: left not in right,
                  ast.Is: lambda: left is right, ast.IsNot: lambda: left is not right}[type(op)]()
            if not ok:
                return False
            left = right
        return True
    raise TemplateError('cannot use this in a template: ' + ast.dump(node)[:60])


def _round(value, digits):
    value = round(float(value), digits)
    return f'{value:.{digits}f}'


FILTERS = {
    'c': lambda v, a=None: str(_currency(v)),
    'cu': lambda v, a=None: str(_currency(v)),
    'to0': lambda v, a=None: _round(v, 0),
    'to1': lambda v, a=None: _round(v, 1),
    'to2': lambda v, a=None: _round(v, 2),
    'json': lambda v, a=None: SafeText(json.dumps(_plain(v))),
    'safe': lambda v, a=None: SafeText('' if v is None else str(v)),
    'escape': lambda v, a=None: escape(v),
    'default': lambda v, a=None: v if v not in (None, '') else a,
    'length': lambda v, a=None: len(v),
    'upper': lambda v, a=None: str(v).upper(),
    'lower': lambda v, a=None: str(v).lower(),
}


def _currency(value):
    from otree.api import Currency
    return Currency(value)


def _plain(value):
    if isinstance(value, (list, tuple)):
        return [_plain(v) for v in value]
    if isinstance(value, dict):
        return {str(k): _plain(v) for k, v in value.items()}
    if isinstance(value, float):
        return float(value)
    return value


def evaluate_with_filters(text, context):
    parts = _split_filters(text)
    value = evaluate(parts[0], context)
    for f in parts[1:]:
        name, _, arg = f.partition(':')
        name = name.strip()
        if name not in FILTERS:
            raise TemplateError(f'unknown filter {name!r}')
        value = FILTERS[name](value, evaluate(arg, context) if arg else None)
    return value


def _split_filters(text):
    """Splits 'a|f1|f2:"x|y"' at the |s outside quotes."""
    parts, current, quote = [], '', None
    for ch in text:
        if quote:
            current += ch
            if ch == quote:
                quote = None
        elif ch in '"\'':
            quote = ch
            current += ch
        elif ch == '|':
            parts.append(current)
            current = ''
        else:
            current += ch
    parts.append(current)
    return parts


# --- Templates ----------------------------------------------------------------------------

class Node:
    def __init__(self, kind, arg=''):
        self.kind = kind
        self.arg = arg
        self.children = []
        self.branches = []  # for if: [(condition, children)], last condition None for else


def _children(node):
    if node.kind == 'if':
        return [c for _, branch in node.branches for c in branch]
    return node.children


def _append(stack_top, node):
    if stack_top.kind == 'if':
        stack_top.branches[-1][1].append(node)
    else:
        stack_top.children.append(node)


# oTree's base templates, unless the project has its own (its _templates/global/Page.html usually
# extends otree/Page.html, adding global_styles and global_scripts).
BUILTIN = {
    'otree/Page.html': (
        '{{ block global_styles }}{{ endblock }}{{ block styles }}{{ endblock }}'
        '<h2 class="otree-title">{{ block title }}{{ endblock }}</h2>'
        '<div class="otree-body">{{ block content }}{{ endblock }}</div>'
        '{{ block global_scripts }}{{ endblock }}{{ block scripts }}{{ endblock }}'),
    'otree/WaitPage.html': '{{ extends "otree/Page.html" }}',
    'global/Page.html': '{{ extends "otree/Page.html" }}',
    'global/WaitPage.html': '{{ extends "otree/WaitPage.html" }}',
}

EMPTY_TITLE = re.compile(r'<h2 class="otree-title">\s*</h2>')


class Renderer:
    """Renders a template for a form: loader(name) gives a template's text, form describes the
    page's form fields: [{name, full, label, type, choices, min, max, widget, long}]."""

    def __init__(self, loader, form, static_url='/static/'):
        self.loader = loader
        self.form = form
        self.static_url = static_url

    def render(self, text, context):
        """A page's HTML: text extends a chain of templates (a page that does not say extends
        global/Page.html); each block is the most specific template's."""
        blocks = {}
        tree = parse_tree(text)
        level = 0
        while True:
            for node in _walk(tree):
                if node.kind == 'block' and node.arg not in blocks:
                    blocks[node.arg] = node
            extends = next((c for c in tree.children if c.kind == 'extends'), None)
            if extends is None and level > 0:
                break
            name = evaluate(extends.arg, context) if extends is not None else 'global/Page.html'
            tree = parse_tree(self._load(name))
            level += 1
        html = self._render_nodes(tree.children, context, blocks)
        return EMPTY_TITLE.sub('', html)

    def _load(self, name):
        text = self.loader(name)
        if text is None:
            text = BUILTIN.get(name)
        if text is None:
            raise TemplateError(f'no template {name!r}')
        return text

    def _render_nodes(self, nodes, context, blocks=None):
        out = []
        for node in nodes:
            out.append(self._render_node(node, context, blocks))
        return ''.join(out)

    def _render_node(self, node, ctx, blocks):
        k = node.kind
        if k == 'text':
            return node.arg
        if k == 'expr':
            return escape(evaluate_with_filters(node.arg, ctx))
        if k == 'if':
            for cond, branch in node.branches:
                if cond is None or evaluate(cond, ctx):
                    return self._render_nodes(branch, ctx, blocks)
            return ''
        if k == 'for':
            names, expr = node.arg
            names = [n.strip() for n in names.split(',')]
            out = []
            for item in evaluate(expr, ctx) or []:
                inner = dict(ctx)
                if len(names) == 1:
                    inner[names[0]] = item
                else:
                    inner.update(zip(names, item))
                out.append(self._render_nodes(node.children, inner, blocks))
            return ''.join(out)
        if k == 'block':
            chosen = blocks.get(node.arg, node) if blocks else node
            return self._render_nodes(chosen.children, ctx, blocks)
        if k in ('include', 'include_sibling'):
            return Renderer(self.loader, self.form, self.static_url).render_plain(self._load(evaluate(node.arg, ctx)), ctx)
        if k == 'formfields':
            return ''.join(self._field(f, None) for f in self.form)
        if k == 'formfield':
            name, label = self._field_arg(node.arg, ctx)
            field = self._form_field(name)
            return self._field(field, label)
        if k == 'formfield_errors':
            name, _ = self._field_arg(node.arg, ctx)
            return ''
        if k == 'next_button':
            return '<button class="otree-btn-next btn btn-primary">Next</button>'
        if k == 'static':
            return escape(self.static_url + str(evaluate(node.arg, ctx)))
        if k in ('chat', 'load', 'url', 'extends'):
            return ''
        raise TemplateError(f'cannot render {k}')

    def render_plain(self, text, context):
        return self._render_nodes(parse_tree(text).children, context)

    def _field_arg(self, arg, ctx):
        m = re.match(r'''\s*(?:'([^']+)'|"([^"]+)"|([\w.]+))\s*(?:label\s*=\s*(.+))?$''', arg)
        if not m:
            raise TemplateError('cannot read {{ formfield ' + arg + ' }}')
        name = m.group(1) or m.group(2) or m.group(3).split('.')[-1]
        label = evaluate(m.group(4), ctx) if m.group(4) else None
        return name, label

    def _form_field(self, name):
        for f in self.form:
            if f['name'] == name:
                return f
        raise TemplateError(f'{name!r} is not one of the page\'s form_fields')

    def _field(self, f, label):
        label = escape(label if label is not None else (f.get('label') or f['name']))
        full = escape(f['full'])
        widget = f.get('widget')
        if f['type'] == 'bool' and not f.get('choices'):
            choices = [[True, 'Yes'], [False, 'No']]
        else:
            choices = f.get('choices')
        if choices:
            choices = [c if isinstance(c, (list, tuple)) else [c, c] for c in choices]
            if widget in ('RadioSelect', 'RadioSelectHorizontal') or f['type'] == 'bool':
                cls = ' otree-radio-horizontal' if widget == 'RadioSelectHorizontal' else ''
                options = ''.join(
                    '<label class="otree-choice"><input type="radio" name="' + full + '" value="'
                    + escape(_value(v)) + '"> ' + escape(text) + '</label>' for v, text in choices)
                control = '<div class="otree-radio' + cls + '">' + options + '</div>'
            else:
                options = '<option value=""></option>' + ''.join(
                    '<option value="' + escape(_value(v)) + '">' + escape(text) + '</option>' for v, text in choices)
                control = '<select name="' + full + '" class="form-select">' + options + '</select>'
        elif f['type'] in ('int', 'number'):
            attrs = ''.join(f' {k}="{escape(f[k])}"' for k in ('min', 'max') if f.get(k) is not None)
            step = '1' if f['type'] == 'int' else 'any'
            control = '<input type="number" step="' + step + '" name="' + full + '"' + attrs + ' class="form-control">'
        elif f.get('long') or widget == 'TextArea':
            control = '<textarea name="' + full + '" class="form-control"></textarea>'
        else:
            control = '<input type="text" name="' + full + '" class="form-control">'
        return '<div class="otree-field mb-3"><label class="form-label">' + label + '</label>' + control + '</div>'


def _value(v):
    if v is True:
        return 'true'
    if v is False:
        return 'false'
    return v


def _walk(node):
    for c in _children(node):
        yield c
        yield from _walk(c)


def parse_tree(text):
    """parse(), with if-branches holding their children."""
    root = Node('root')
    stack = [root]
    for token in TOKEN.split(text):
        if not token or token.startswith('{#'):
            continue
        top = stack[-1]
        if not token.startswith('{{'):
            _append(top, Node('text', token))
            continue
        inner = token[2:-2].strip()
        word, _, rest = inner.partition(' ')
        rest = rest.strip()
        if word == 'if':
            node = Node('if')
            node.branches.append((rest, []))
            _append(top, node)
            stack.append(node)
        elif word in ('elif', 'else'):
            if top.kind != 'if':
                raise TemplateError('{{ ' + word + ' }} without {{ if }}')
            top.branches.append((rest if word == 'elif' else None, []))
        elif word == 'endif':
            if top.kind != 'if':
                raise TemplateError('{{ endif }} without {{ if }}')
            stack.pop()
        elif word == 'for':
            m = re.match(r'(\w+(?:\s*,\s*\w+)*)\s+in\s+(.+)$', rest)
            if not m:
                raise TemplateError('cannot read {{ for ' + rest + ' }}')
            node = Node('for', (m.group(1), m.group(2)))
            _append(top, node)
            stack.append(node)
        elif word in ('endfor', 'endblock'):
            if top.kind != {'endfor': 'for', 'endblock': 'block'}[word]:
                raise TemplateError('{{ ' + word + ' }} does not close what is open')
            stack.pop()
        elif word == 'block':
            node = Node('block', rest)
            _append(top, node)
            stack.append(node)
        elif word in ('extends', 'include', 'include_sibling', 'formfields', 'formfield', 'formfield_errors',
                      'next_button', 'static', 'chat', 'load', 'url'):
            _append(top, Node(word, rest))
        else:
            _append(top, Node('expr', inner))
    if len(stack) > 1:
        raise TemplateError('{{ ' + stack[-1].kind + ' }} is not closed')
    return root
