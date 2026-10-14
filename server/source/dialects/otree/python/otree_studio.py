"""An oTree app's __init__.py, and a project's settings.py, as jtree's oTree Studio editor shows them
(server/source/editors/otree.js): constants, the models' fields, functions, pages and the page
sequence; session configs and settings. Read with Python's own parser; every part says where it is
in the source (character offsets), so that an edit changes only that part.
"""

import ast
import json


class _Source:
    """Offsets of a source's lines, to turn ast's (line, byte column) into character offsets."""

    def __init__(self, source):
        self.source = source
        self.lines = source.splitlines(keepends=True)
        self.starts = []
        at = 0
        for line in self.lines:
            self.starts.append(at)
            at += len(line)
        self.starts.append(at)

    def offset(self, lineno, col):
        if lineno - 1 >= len(self.lines):
            return len(self.source)
        line = self.lines[lineno - 1]
        return self.starts[lineno - 1] + len(line.encode('utf-8')[:col].decode('utf-8', 'ignore'))

    def range(self, node, with_decorators=True):
        lineno, col = node.lineno, node.col_offset
        if with_decorators and getattr(node, 'decorator_list', None):
            first = node.decorator_list[0]
            lineno, col = first.lineno, first.col_offset - 1
        return {'start': self.offset(lineno, col), 'end': self.offset(node.end_lineno, node.end_col_offset)}

    def text(self, node):
        r = self.range(node, False)
        return self.source[r['start']:r['end']]

    def indent(self, node):
        line = self.lines[node.lineno - 1]
        return line[:len(line) - len(line.lstrip())]


def _dedent(text):
    lines = text.split('\n')
    indents = [len(l) - len(l.lstrip()) for l in lines if l.strip()]
    cut = min(indents) if indents else 0
    return '\n'.join(l[cut:] for l in lines).strip('\n')


def _function(src, node):
    """A def: its name, parameters (as written), body (without its indentation) and docstring."""
    args = node.args
    params = []
    plain = args.posonlyargs + args.args
    defaults = [None] * (len(plain) - len(args.defaults)) + list(args.defaults)
    for a, d in zip(plain, defaults):
        p = a.arg + (': ' + src.text(a.annotation) if a.annotation else '')
        params.append(p + (('=' if not a.annotation else ' = ') + src.text(d) if d is not None else ''))
    if args.vararg:
        params.append('*' + args.vararg.arg)
    if args.kwarg:
        params.append('**' + args.kwarg.arg)
    first, last = node.body[0], node.body[-1]
    body_range = {'start': src.starts[first.lineno - 1], 'end': src.offset(last.end_lineno, last.end_col_offset)}
    body = _dedent(src.source[body_range['start']:body_range['end']])
    decorators = [src.text(d) for d in node.decorator_list]
    return {
        'name': node.name, 'params': params, 'body': body, 'decorators': decorators,
        'returns': src.text(node.returns) if node.returns else None,
        'range': src.range(node), 'bodyRange': body_range,
    }


def _assign(src, stmt):
    """`name = value` (or `name: type = value`): (name, value node), else None."""
    if isinstance(stmt, ast.Assign) and len(stmt.targets) == 1 and isinstance(stmt.targets[0], ast.Name):
        return stmt.targets[0].id, stmt.value
    if isinstance(stmt, ast.AnnAssign) and isinstance(stmt.target, ast.Name) and stmt.value is not None:
        return stmt.target.id, stmt.value
    return None


def _field(src, name, value, stmt):
    """`x = models.IntegerField(...)`: the field, else None."""
    if not isinstance(value, ast.Call):
        return None
    f = value.func
    kind = f.attr if isinstance(f, ast.Attribute) else f.id if isinstance(f, ast.Name) else None
    if not kind or not kind.endswith('Field'):
        return None
    return {
        'name': name, 'type': kind,
        'args': [{'name': k.arg, 'code': src.text(k.value)} for k in value.keywords if k.arg],
        'posargs': [src.text(a) for a in value.args],
        'range': src.range(stmt), 'valueRange': src.range(value, False),
    }


def _class_info(src, node):
    body = node.body
    only_pass = len(body) == 1 and isinstance(body[0], ast.Pass)
    return {
        'name': node.name, 'bases': [src.text(b) for b in node.bases], 'range': src.range(node),
        'indent': src.indent(body[0]) if body else '    ',
        'passRange': src.range(body[0]) if only_pass else None,
        'docstring': ast.get_docstring(node),
    }


MODELS = ('Subsession', 'Group', 'Player')


def model(source):
    """The app in source (an __init__.py), as JSON; with error {message, line, column} if it does not parse."""
    try:
        tree = ast.parse(source)
    except SyntaxError as e:
        return json.dumps({'error': {'message': e.msg, 'line': e.lineno or 0, 'column': (e.offset or 1) - 1}})
    src = _Source(source)
    out = {
        'error': None, 'doc': ast.get_docstring(tree), 'constants': None, 'models': {}, 'functions': [], 'pages': [],
        'pageSequence': None, 'other': [], 'end': len(source),
    }
    for stmt in tree.body:
        if isinstance(stmt, ast.ClassDef):
            bases = [src.text(b) for b in stmt.bases]
            if stmt.name in ('C', 'Constants') or 'BaseConstants' in bases:
                info = _class_info(src, stmt)
                info['items'] = []
                info['other'] = []
                for s in stmt.body:
                    a = _assign(src, s)
                    if a:
                        info['items'].append({'name': a[0], 'code': src.text(a[1]), 'range': src.range(s), 'valueRange': src.range(a[1], False)})
                    elif not isinstance(s, ast.Pass) and not (isinstance(s, ast.Expr) and isinstance(s.value, ast.Constant)):
                        info['other'].append({'code': src.text(s), 'range': src.range(s)})
                out['constants'] = info
                continue
            if stmt.name in MODELS or any(b in ('BaseSubsession', 'BaseGroup', 'BasePlayer') for b in bases):
                info = _class_info(src, stmt)
                info['fields'] = []
                info['other'] = []
                for s in stmt.body:
                    a = _assign(src, s)
                    fld = _field(src, a[0], a[1], s) if a else None
                    if fld:
                        info['fields'].append(fld)
                    elif not isinstance(s, ast.Pass) and not (isinstance(s, ast.Expr) and isinstance(s.value, ast.Constant)):
                        info['other'].append({'code': src.text(s), 'range': src.range(s)})
                out['models'][stmt.name] = info
                continue
            if any(b in ('Page', 'WaitPage') or b.endswith('.Page') or b.endswith('WaitPage') or b.endswith('Page') for b in bases):
                info = _class_info(src, stmt)
                info['kind'] = 'WaitPage' if any(b.endswith('WaitPage') for b in bases) else 'Page'
                info['attrs'] = []
                info['methods'] = []
                info['other'] = []
                for s in stmt.body:
                    a = _assign(src, s)
                    if a:
                        info['attrs'].append({'name': a[0], 'code': src.text(a[1]), 'range': src.range(s), 'valueRange': src.range(a[1], False)})
                    elif isinstance(s, ast.FunctionDef):
                        info['methods'].append(_function(src, s))
                    elif not isinstance(s, ast.Pass) and not (isinstance(s, ast.Expr) and isinstance(s.value, ast.Constant)):
                        info['other'].append({'code': src.text(s), 'range': src.range(s)})
                out['pages'].append(info)
                continue
        if isinstance(stmt, ast.FunctionDef):
            out['functions'].append(_function(src, stmt))
            continue
        a = _assign(src, stmt)
        if a and a[0] == 'page_sequence' and isinstance(a[1], (ast.List, ast.Tuple)):
            out['pageSequence'] = {'names': [src.text(e) for e in a[1].elts], 'range': src.range(stmt), 'valueRange': src.range(a[1], False)}
            continue
        if isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Constant) and stmt is tree.body[0]:
            continue
        out['other'].append({'code': src.text(stmt), 'range': src.range(stmt)})
    return json.dumps(out)


def _dict_entries(src, node):
    """A session config, as [{key, code}], from dict(name=...) or {'name': ...}; None if it is neither."""
    if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == 'dict' and not node.args:
        return 'call', [{'key': k.arg, 'code': src.text(k.value)} for k in node.keywords if k.arg]
    if isinstance(node, ast.Dict) and all(isinstance(k, ast.Constant) and isinstance(k.value, str) for k in node.keys):
        return 'literal', [{'key': k.value, 'code': src.text(v)} for k, v in zip(node.keys, node.values)]
    return None


def settings_model(source):
    """A project's settings.py, as JSON: its session configs and other settings."""
    try:
        tree = ast.parse(source)
    except SyntaxError as e:
        return json.dumps({'error': {'message': e.msg, 'line': e.lineno or 0, 'column': (e.offset or 1) - 1}})
    src = _Source(source)
    out = {'error': None, 'configs': None, 'settings': [], 'other': [], 'end': len(source)}
    for stmt in tree.body:
        a = _assign(src, stmt)
        if a and a[0] == 'SESSION_CONFIGS' and isinstance(a[1], ast.List):
            configs = []
            for e in a[1].elts:
                d = _dict_entries(src, e)
                configs.append({'style': d[0] if d else None, 'entries': d[1] if d else [], 'code': src.text(e), 'range': src.range(e, False)})
            out['configs'] = {
                'items': configs, 'range': src.range(stmt), 'valueRange': src.range(a[1], False),
                'indent': src.indent(a[1].elts[0]) if a[1].elts and a[1].elts[0].lineno != stmt.lineno else '    ',
            }
            continue
        if a:
            d = _dict_entries(src, a[1])
            out['settings'].append({'name': a[0], 'code': src.text(a[1]), 'range': src.range(stmt), 'valueRange': src.range(a[1], False),
                                    'entries': d[1] if d else None})
            continue
        out['other'].append({'code': src.text(stmt), 'range': src.range(stmt)})
    return json.dumps(out)


def check(source):
    """Whether source parses: '' if it does, else the error, as 'line N: message'."""
    try:
        ast.parse(source)
        return ''
    except SyntaxError as e:
        return 'line %s: %s' % (e.lineno, e.msg)
