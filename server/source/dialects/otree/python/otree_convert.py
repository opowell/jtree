"""Converts an oTree app (in oTree's current format, loaded by jtree_otree) to a jtree app: an
app.jtt with its functions translated from Python to JS, a Vue screen per page translated from its
template, and CONVERSION.md, which says what was converted and what needs work by hand.

The translation covers the Python oTree apps are written in: arithmetic, comparisons, if/for/while,
lists, dicts and comprehensions, f-strings, Python's built-ins and random, and oTree's models' API,
which becomes jtree's (payoff is points, id_in_group idInGroup, rounds periods, ...), with the
helpers in otree.cjs (convert-runtime.js) for what has no direct equivalent. Anything else becomes
a TODO in the code, which throws if it runs, and in the report. See plans/ztree-otree-dialects.md,
section 4.7.
"""

import ast
import json
import re

from otree import api
import jtree_otree
import otree_template

JS_RESERVED = {
    'arguments', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
    'delete', 'do', 'else', 'enum', 'eval', 'export', 'extends', 'false', 'finally', 'for', 'function',
    'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'let', 'new', 'null', 'package',
    'private', 'protected', 'public', 'return', 'static', 'super', 'switch', 'this', 'throw', 'true',
    'try', 'typeof', 'var', 'void', 'while', 'with', 'yield', 'undefined', 'NaN', 'Infinity',
    # Names app.jtt uses.
    'app', 'otree', 'stage', 'path', 'fs', 'require', 'Utils', 'Math', 'Object', 'Array', 'JSON', 'String',
    'Number', 'Error', 'console',
}

# Model attributes, as jtree has them ({o}: the object).
ATTRS = {
    'payoff': 'otree.payoff({o})',
    'round_number': 'otree.roundNumber({o})',
    'id_in_group': '{o}.idInGroup',
    'id_in_subsession': 'otree.idInSubsession({o})',
    'subsession': 'otree.period({o})',
    'session': 'otree.session({o})',
    'vars': 'otree.vars({o})',
    'config': 'otree.config({o})',
    'role': 'otree.role({o})',
    'code': '{o}.id',
    'id_in_session': 'otree.view({o}, 0).id_in_session',
    'num_participants': 'Object.keys({o}.participants).length',
}

# Methods ({o}: the object, {a}: the arguments, {a0}, {a1}: each).
METHODS = {
    'get_players': 'otree.getPlayers({o})',
    'get_groups': 'otree.getGroups({o})',
    'get_player_by_id': 'otree.playerById({o}, {a})',
    'get_player_by_role': 'otree.playerByRole({o}, {a})',
    'get_others_in_group': 'otree.others({o})',
    'get_others_in_subsession': 'otree.othersInSubsession({o})',
    'in_round': '{o}.inPeriod({a})',
    'in_rounds': 'otree.inRounds({o}, {a})',
    'in_all_rounds': '{o}.inAllPeriods()',
    'in_previous_rounds': '{o}.inPreviousPeriods()',
    'get_group_matrix': 'otree.groupMatrix({o})',
    'set_group_matrix': 'otree.setGroups({o}, {a})',
    'group_randomly': 'otree.groupRandomly({o})',
    'group_like_round': 'otree.groupLikeRound({o}, {a})',
    'field_maybe_none': 'otree.field({o}, {a})',
    'field_display': 'otree.display({o}, {a})',
    'payoff_plus_participation_fee': 'otree.paymentWithFee({o})',
    # Lists, dicts and strings.
    'append': '{o}.push({a})',
    'extend': '{o}.push(...{a})',
    'insert': '{o}.splice({a0}, 0, {a1})',
    'remove': 'otree.remove({o}, {a})',
    'index': '{o}.indexOf({a})',
    'count': 'otree.count({o}, {a})',
    'reverse': '{o}.reverse()',
    'copy': 'otree.list({o}).slice()',
    'get': 'otree.get({o}, {a})',
    'items': 'otree.items({o})',
    'keys': 'otree.keys({o})',
    'values': 'otree.values({o})',
    'setdefault': 'otree.setdefault({o}, {a})',
    'update': 'Object.assign({o}, {a})',
    'upper': '{o}.toUpperCase()',
    'lower': '{o}.toLowerCase()',
    'strip': '{o}.trim()',
    'startswith': '{o}.startsWith({a})',
    'endswith': '{o}.endsWith({a})',
    'replace': '{o}.split({a0}).join({a1})',
}

# Python's built-ins and modules' functions, as functions of their translated arguments.
BUILTINS = {
    'sum': 'otree.sum', 'len': 'otree.len', 'min': 'otree.min', 'max': 'otree.max', 'round': 'otree.round',
    'range': 'otree.range', 'enumerate': 'otree.enumerate', 'zip': 'otree.zip', 'any': 'otree.any',
    'all': 'otree.all', 'abs': 'Math.abs', 'int': 'otree.int', 'float': 'otree.float', 'str': 'otree.str',
    'bool': 'otree.bool', 'print': 'console.log', 'currency_range': 'otree.currencyRange',
}
# Built-ins' keyword arguments, after their first argument, in order.
BUILTIN_KEYWORDS = {'enumerate': ['start'], 'round': ['ndigits'], 'sum': ['start']}
# Methods whose results are lists.
LIST_METHODS = {'get_players', 'get_groups', 'get_others_in_group', 'get_others_in_subsession', 'in_all_rounds',
                'in_previous_rounds', 'in_rounds', 'get_group_matrix', 'items', 'keys', 'values'}
RANDOM = {'randint': 'otree.randint', 'uniform': 'otree.uniform', 'choice': 'otree.choice',
          'shuffle': 'otree.shuffle', 'sample': 'otree.sample', 'random': 'otree.random'}
MATH = {'floor': 'Math.floor', 'ceil': 'Math.ceil', 'sqrt': 'Math.sqrt', 'exp': 'Math.exp', 'log': 'Math.log',
        'pow': 'Math.pow', 'fabs': 'Math.abs', 'pi': 'Math.PI', 'e': 'Math.E', 'inf': 'Infinity'}
CURRENCY = {'cu', 'c', 'Currency'}

# JS operators' precedence, for parentheses.
P_ASSIGN, P_COND, P_OR, P_AND, P_EQ, P_REL, P_ADD, P_MUL, P_POW, P_UNARY, P_ATOM = 2, 3, 4, 5, 9, 10, 12, 13, 14, 15, 20
BINOPS = {ast.Add: ('+', P_ADD), ast.Sub: ('-', P_ADD), ast.Mult: ('*', P_MUL), ast.Div: ('/', P_MUL),
          ast.Pow: ('**', P_POW)}
CMPOPS = {ast.Eq: ('===', P_EQ), ast.NotEq: ('!==', P_EQ), ast.Lt: ('<', P_REL), ast.LtE: ('<=', P_REL),
          ast.Gt: ('>', P_REL), ast.GtE: ('>=', P_REL), ast.Is: ('===', P_EQ), ast.IsNot: ('!==', P_EQ)}


class Unsupported(Exception):
    def __init__(self, node, why):
        super().__init__(why)
        self.node = node
        self.why = why


def js_str(s, quote="'"):
    """A JS string literal."""
    out = s.replace('\\', '\\\\').replace(quote, '\\' + quote).replace('\n', '\\n').replace('\r', '\\r')
    out = out.replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
    if quote == "'":
        # Fit in an HTML attribute too.
        out = out.replace('"', '\\x22')
    return quote + out + quote


def js_value(v, indent=''):
    """A JSON-like value as a JS literal."""
    if v is None:
        return 'null'
    if v is True:
        return 'true'
    if v is False:
        return 'false'
    if isinstance(v, float):
        if v.is_integer() and abs(v) < 1e15:
            return str(int(v))
        return repr(v)
    if isinstance(v, int):
        return str(v)
    if isinstance(v, str):
        return js_str(v)
    if isinstance(v, (list, tuple)):
        return '[' + ', '.join(js_value(x) for x in v) + ']'
    if isinstance(v, dict):
        return '{ ' + ', '.join(js_key(str(k)) + ': ' + js_value(x) for k, x in v.items()) + ' }' if v else '{}'
    return js_str(str(v))


def js_key(k):
    return k if re.match(r'^[A-Za-z_$][\w$]*$', k) else js_str(k)


def _plain_value(v):
    return jtree_otree._json_value(v)


class Report:
    def __init__(self):
        self.items = []

    def add(self, part, status, note='', line=None):
        self.items.append({'part': part, 'status': status, 'note': note, 'line': line})

    @property
    def todos(self):
        return [i for i in self.items if i['status'] == 'todo']


class PyToJS:
    """Translates the Python of an oTree app's functions to JS."""

    def __init__(self, source, functions, report):
        self.lines = source.splitlines()
        self.functions = functions  # module function name -> ast.FunctionDef
        self.report = report
        self.renames = {}
        self.modules = {}  # local name -> 'random' / 'math', from imports
        self.random_names = {}  # from random import x -> x
        self.where = ''

    # --- Names -------------------------------------------------------------------------

    def name(self, n):
        if n in self.renames:
            return self.renames[n]
        return n + '_' if n in JS_RESERVED else n

    # --- Expressions -------------------------------------------------------------------

    def expr(self, node, min_prec=0):
        code, prec = self._expr(node)
        return '(' + code + ')' if prec < min_prec else code

    def _expr(self, node):
        method = getattr(self, 'e_' + type(node).__name__, None)
        if method is None:
            raise Unsupported(node, type(node).__name__ + ' is not translated')
        return method(node)

    def e_Constant(self, node):
        v = node.value
        if v is None or isinstance(v, (bool, int, float, str)):
            return js_value(v), P_ATOM
        raise Unsupported(node, 'a constant ' + repr(v))

    def e_Name(self, node):
        n = node.id
        if n == 'True':
            return 'true', P_ATOM
        if n == 'False':
            return 'false', P_ATOM
        if n == 'None':
            return 'null', P_ATOM
        if n in self.random_names:
            return RANDOM[self.random_names[n]], P_ATOM
        if n == 'Constants':
            return 'C', P_ATOM
        return self.name(n), P_ATOM

    def e_Attribute(self, node):
        value = node.value
        if isinstance(value, ast.Name):
            module = self.modules.get(value.id)
            if module == 'math' and node.attr in MATH:
                return MATH[node.attr], P_ATOM
            if module is not None:
                raise Unsupported(node, value.id + '.' + node.attr + ' is not translated')
            if value.id in ('C', 'Constants'):
                return 'C.' + node.attr, P_ATOM
        o = self.expr(value, P_ATOM)
        if node.attr in ATTRS:
            return ATTRS[node.attr].format(o=o), P_ATOM
        if node.attr in METHODS:
            raise Unsupported(node, node.attr + ' is a method, used without calling it')
        return o + '.' + node.attr, P_ATOM

    def e_Subscript(self, node):
        o = self.expr(node.value, P_ATOM)
        s = node.slice
        if isinstance(s, ast.Slice):
            if s.step is not None:
                raise Unsupported(node, 'a slice with a step')
            lower = self.expr(s.lower) if s.lower is not None else '0'
            if s.upper is None:
                return o + '.slice(' + lower + ')', P_ATOM
            return o + '.slice(' + lower + ', ' + self.expr(s.upper) + ')', P_ATOM
        if isinstance(s, ast.Tuple):
            return o + '[otree.key(' + self.expr(s) + ')]', P_ATOM
        if isinstance(s, ast.UnaryOp) and isinstance(s.op, ast.USub) and isinstance(s.operand, ast.Constant):
            return 'otree.at(' + o + ', ' + self.expr(s) + ')', P_ATOM
        return o + '[' + self.expr(s) + ']', P_ATOM

    def e_List(self, node):
        return '[' + ', '.join(self.expr(e, P_ASSIGN) for e in node.elts) + ']', P_ATOM

    e_Tuple = e_List

    def e_Set(self, node):
        return 'otree.unique([' + ', '.join(self.expr(e, P_ASSIGN) for e in node.elts) + '])', P_ATOM

    def e_Dict(self, node):
        parts = []
        for k, v in zip(node.keys, node.values):
            if k is None:
                parts.append('...' + self.expr(v, P_ASSIGN))
            elif isinstance(k, ast.Constant) and isinstance(k.value, str):
                parts.append(js_key(k.value) + ': ' + self.expr(v, P_ASSIGN))
            elif isinstance(k, ast.Constant) and isinstance(k.value, (int, float)) and not isinstance(k.value, bool):
                parts.append(js_value(k.value) + ': ' + self.expr(v, P_ASSIGN))
            else:
                parts.append('[otree.key(' + self.expr(k) + ')]: ' + self.expr(v, P_ASSIGN))
        if not parts:
            return '{}', P_ATOM
        return '{ ' + ', '.join(parts) + ' }', P_ATOM

    def e_BinOp(self, node):
        op = type(node.op)
        if op is ast.FloorDiv:
            return 'Math.floor(' + self.expr(node.left, P_MUL) + ' / ' + self.expr(node.right, P_MUL + 1) + ')', P_ATOM
        if op is ast.Mod:
            if isinstance(node.left, (ast.Constant, ast.JoinedStr)) and isinstance(getattr(node.left, 'value', None), str):
                raise Unsupported(node, "formatting strings with %")
            return 'otree.mod(' + self.expr(node.left) + ', ' + self.expr(node.right) + ')', P_ATOM
        if op is ast.Add and (self._is_list(node.left) or self._is_list(node.right)):
            return 'otree.add(' + self.expr(node.left) + ', ' + self.expr(node.right) + ')', P_ATOM
        if op is ast.Mult and (self._is_list(node.left) or self._is_list(node.right)):
            lst, n = (node.left, node.right) if self._is_list(node.left) else (node.right, node.left)
            return 'otree.repeat(' + self.expr(lst) + ', ' + self.expr(n) + ')', P_ATOM
        if op not in BINOPS:
            raise Unsupported(node, 'the operator ' + type(node.op).__name__)
        sym, prec = BINOPS[op]
        if op is ast.Pow:
            return self.expr(node.left, prec + 1) + ' ** ' + self.expr(node.right, prec), prec
        return self.expr(node.left, prec) + ' ' + sym + ' ' + self.expr(node.right, prec + 1), prec

    def _is_list(self, node):
        return isinstance(node, (ast.List, ast.ListComp))

    def e_UnaryOp(self, node):
        if isinstance(node.op, ast.Not):
            return '!' + self.expr(node.operand, P_UNARY), P_UNARY
        if isinstance(node.op, ast.USub):
            return '-' + self.expr(node.operand, P_UNARY + 1), P_UNARY
        if isinstance(node.op, ast.UAdd):
            return '+' + self.expr(node.operand, P_UNARY + 1), P_UNARY
        raise Unsupported(node, 'the operator ' + type(node.op).__name__)

    def e_BoolOp(self, node):
        sym, prec = ('&&', P_AND) if isinstance(node.op, ast.And) else ('||', P_OR)
        return (' ' + sym + ' ').join(self.expr(v, prec + 1) for v in node.values), prec

    def e_Compare(self, node):
        parts = []
        left = node.left
        for op, right in zip(node.ops, node.comparators):
            parts.append(self._compare(left, op, right))
            left = right
        if len(parts) == 1:
            return parts[0]
        return ' && '.join(code if prec > P_AND else '(' + code + ')' for code, prec in parts), P_AND

    def _compare(self, left, op, right):
        if isinstance(op, (ast.In, ast.NotIn)):
            code = 'otree.contains(' + self.expr(right) + ', ' + self.expr(left) + ')'
            return ('!' + code, P_UNARY) if isinstance(op, ast.NotIn) else (code, P_ATOM)
        is_none = lambda n: isinstance(n, ast.Constant) and n.value is None
        sym, prec = CMPOPS[type(op)]
        if is_none(left) or is_none(right):
            sym = '==' if sym == '===' else '!='
        elif isinstance(op, (ast.Eq, ast.NotEq)) and (self._is_list(left) or self._is_list(right) or
                                                      isinstance(left, ast.Tuple) or isinstance(right, ast.Tuple)):
            code = 'otree.eq(' + self.expr(left) + ', ' + self.expr(right) + ')'
            return ('!' + code, P_UNARY) if isinstance(op, ast.NotEq) else (code, P_ATOM)
        return self.expr(left, prec) + ' ' + sym + ' ' + self.expr(right, prec + 1), prec

    def e_IfExp(self, node):
        return (self.test(node.test, P_OR) + ' ? ' + self.expr(node.body, P_ASSIGN) + ' : ' +
                self.expr(node.orelse, P_ASSIGN)), P_COND

    SCALAR_CALLS = {'len', 'sum', 'any', 'all', 'bool', 'int', 'float', 'str', 'abs', 'round', 'min', 'max'}

    def test(self, node, min_prec=0):
        """node as a condition, true as Python has it: an empty list (or dict) is false. Variables and
        calls' results may be lists; fields and comparisons are not."""
        if isinstance(node, ast.BoolOp):
            sym, prec = ('&&', P_AND) if isinstance(node.op, ast.And) else ('||', P_OR)
            code = (' ' + sym + ' ').join(self.test(v, prec + 1) for v in node.values)
            return '(' + code + ')' if prec < min_prec else code
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.Not):
            code = '!' + self.test(node.operand, P_UNARY)
            return '(' + code + ')' if P_UNARY < min_prec else code
        maybe_list = (isinstance(node, ast.Name) and node.id not in ('True', 'False', 'None')) or isinstance(node, ast.Subscript) or (
            isinstance(node, ast.Call) and not (isinstance(node.func, ast.Name) and (node.func.id in self.SCALAR_CALLS or node.func.id in CURRENCY)))
        if maybe_list:
            return 'otree.bool(' + self.expr(node) + ')'
        return self.expr(node, min_prec)

    def e_Lambda(self, node):
        return self._params(node.args) + ' => ' + self.expr(node.body, P_ASSIGN), P_ASSIGN

    def e_Starred(self, node):
        return '...' + self.expr(node.value, P_ASSIGN), P_ASSIGN

    def e_JoinedStr(self, node):
        out = '`'
        for v in node.values:
            if isinstance(v, ast.Constant):
                out += v.value.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
            elif isinstance(v, ast.FormattedValue):
                inner = self.expr(v.value)
                if v.conversion == ord('r'):
                    inner = 'otree.repr(' + inner + ')'
                if v.format_spec is not None:
                    spec = ''.join(p.value for p in v.format_spec.values if isinstance(p, ast.Constant))
                    inner = 'otree.format(' + inner + ', ' + js_str(spec) + ')'
                out += '${' + inner + '}'
        return out + '`', P_ATOM

    def _comprehension(self, node, element):
        """[element for ... in ... if ...], as filter/map, and flatMap for each generator but the last."""
        gens = node.generators

        def build(i):
            g = gens[i]
            if g.is_async:
                raise Unsupported(node, 'async comprehensions')
            target = self._target(g.target)
            source = self._iterable(g.iter)
            for cond in g.ifs:
                source += '.filter(' + target + ' => ' + self.test(cond, P_ASSIGN) + ')'
            if i == len(gens) - 1:
                return source + '.map(' + target + ' => ' + element() + ')'
            return source + '.flatMap(' + target + ' => ' + build(i + 1) + ')'
        return build(0)

    def _target(self, t):
        if isinstance(t, ast.Name):
            return '(' + self.name(t.id) + ')'
        if isinstance(t, (ast.Tuple, ast.List)):
            return '([' + ', '.join(self._target(e)[1:-1] for e in t.elts) + '])'
        raise Unsupported(t, 'this loop target')

    def _iterable(self, node):
        code = self.expr(node, P_ATOM)
        # Lists, and variables (a dict would fail loudly: for ... of a JS object throws).
        if isinstance(node, (ast.List, ast.Tuple, ast.ListComp, ast.Name)) or code.startswith('otree.') and not code.startswith('otree.vars('):
            return code
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr in LIST_METHODS:
            return code
        return 'otree.list(' + self.expr(node) + ')'

    def e_ListComp(self, node):
        return self._comprehension(node, lambda: self.expr(node.elt, P_ASSIGN)), P_ATOM

    e_GeneratorExp = e_ListComp

    def e_SetComp(self, node):
        return 'otree.unique(' + self._comprehension(node, lambda: self.expr(node.elt, P_ASSIGN)) + ')', P_ATOM

    def e_DictComp(self, node):
        pair = lambda: '[otree.key(' + self.expr(node.key) + '), ' + self.expr(node.value, P_ASSIGN) + ']'
        return 'Object.fromEntries(' + self._comprehension(node, pair) + ')', P_ATOM

    def _args(self, node):
        if any(k.arg is None for k in node.keywords):
            raise Unsupported(node, 'calls with **kwargs')
        return [self.expr(a, P_ASSIGN) for a in node.args]

    def _kwargs(self, node):
        return {k.arg: self.expr(k.value, P_ASSIGN) for k in node.keywords}

    def e_Call(self, node):
        f = node.func
        args = self._args(node)
        kw = self._kwargs(node)
        if isinstance(f, ast.Name):
            n = f.id
            if n in CURRENCY:
                if kw or len(args) > 1:
                    raise Unsupported(node, n + '() with these arguments')
                return (args[0], P_ASSIGN) if args else ('0', P_ATOM)
            if n in self.random_names:
                return RANDOM[self.random_names[n]] + '(' + ', '.join(args) + ')', P_ATOM
            if n in self.functions:
                return self.name(n) + '(' + ', '.join(self._positional(node, self.functions[n], args, kw)) + ')', P_ATOM
            if n in ('sorted',):
                opts = ', '.join(js_key(k) + ': ' + v for k, v in kw.items())
                return 'otree.sorted(' + args[0] + (', { ' + opts + ' }' if opts else '') + ')', P_ATOM
            if n in ('min', 'max') and kw:
                if set(kw) - {'key'}:
                    raise Unsupported(node, n + '() with ' + ', '.join(kw))
                return 'otree.' + n + '(' + ', '.join(args + ['{ key: ' + kw['key'] + ' }']) + ')', P_ATOM
            if kw and n in BUILTIN_KEYWORDS:
                # Keyword arguments of built-ins, in their places.
                names = BUILTIN_KEYWORDS[n]
                for k in list(kw):
                    if k not in names:
                        raise Unsupported(node, n + '() with ' + k)
                while len(args) < len(names) + 1 and kw:
                    name = names[len(args) - 1]
                    args.append(kw.pop(name) if name in kw else 'undefined')
            if kw and n not in ('dict',):
                raise Unsupported(node, n + '() with keyword arguments')
            if n in BUILTINS:
                return BUILTINS[n] + '(' + ', '.join(args) + ')', P_ATOM
            if n == 'list' or n == 'tuple':
                return ('otree.list(' + args[0] + ').slice()', P_ATOM) if args else ('[]', P_ATOM)
            if n == 'set':
                return ('otree.unique(' + args[0] + ')', P_ATOM) if args else ('[]', P_ATOM)
            if n == 'dict':
                parts = (['...' + args[0]] if args else []) + [js_key(k) + ': ' + v for k, v in kw.items()]
                return ('{ ' + ', '.join(parts) + ' }' if parts else '{}'), P_ATOM
            raise Unsupported(node, n + '() is not translated')
        if isinstance(f, ast.Attribute):
            if isinstance(f.value, ast.Name) and self.modules.get(f.value.id) == 'random':
                if f.attr not in RANDOM or kw:
                    raise Unsupported(node, 'random.' + f.attr + ' is not translated')
                return RANDOM[f.attr] + '(' + ', '.join(args) + ')', P_ATOM
            if isinstance(f.value, ast.Name) and self.modules.get(f.value.id) == 'math':
                if f.attr not in MATH or kw:
                    raise Unsupported(node, 'math.' + f.attr + ' is not translated')
                return MATH[f.attr] + '(' + ', '.join(args) + ')', P_ATOM
            o = self.expr(f.value, P_ATOM)
            m = f.attr
            if m == 'join' and not kw and len(args) == 1:
                if isinstance(node.args[0], (ast.ListComp, ast.GeneratorExp, ast.List)):
                    return args[0] + '.join(' + o + ')', P_ATOM
                return 'otree.list(' + args[0] + ').join(' + o + ')', P_ATOM
            if m == 'sort':
                opts = ', '.join(js_key(k) + ': ' + v for k, v in kw.items())
                return 'otree.sortInPlace(' + o + (', { ' + opts + ' }' if opts else '') + ')', P_ATOM
            if m == 'pop':
                if not args:
                    return o + '.pop()', P_ATOM
                return 'otree.popAt(' + o + ', ' + args[0] + ')', P_ATOM
            if m == 'split':
                return (o + '.trim().split(/\\s+/)' if not args else o + '.split(' + args[0] + ')'), P_ATOM
            if m == 'format':
                raise Unsupported(node, 'str.format')
            if m in METHODS and not kw:
                a = ', '.join(args)
                return METHODS[m].format(o=o, a=a, a0=args[0] if args else '', a1=args[1] if len(args) > 1 else ''), P_ATOM
            raise Unsupported(node, 'the method ' + m + ' is not translated')
        raise Unsupported(node, 'this call')

    def _positional(self, node, fn, args, kw):
        """A call's arguments in the order of fn's parameters."""
        if not kw:
            return args
        params = [a.arg for a in fn.args.args]
        out = list(args)
        for name in params[len(args):]:
            if name in kw:
                out.append(kw.pop(name))
            else:
                out.append('undefined')
        if kw:
            raise Unsupported(node, 'keyword arguments ' + ', '.join(kw))
        while out and out[-1] == 'undefined':
            out.pop()
        return out

    # --- Statements --------------------------------------------------------------------

    def source(self, node):
        return '\n'.join(self.lines[node.lineno - 1:getattr(node, 'end_lineno', node.lineno)])

    def todo(self, node, why, indent):
        """A statement not translated: its Python as a comment, and code that throws if it runs."""
        self.report.add(self.where, 'todo', why + ' (line ' + str(node.lineno) + ')', node.lineno)
        out = [indent + '// TODO (from Python, line ' + str(node.lineno) + '): ' + why + '.']
        for line in self.source(node).splitlines():
            out.append(indent + '//   ' + line.rstrip())
        out.append(indent + "throw new Error('Not converted from Python: line " + str(node.lineno) + "');")
        return out

    def block(self, stmts, indent, scope):
        out = []
        for s in stmts:
            out.extend(self.stmt(s, indent, scope))
        return out

    def stmt(self, node, indent, scope):
        method = getattr(self, 's_' + type(node).__name__, None)
        try:
            if method is None:
                raise Unsupported(node, type(node).__name__ + ' statements are not translated')
            return method(node, indent, scope)
        except Unsupported as err:
            return self.todo(node, err.why, indent)

    def s_Expr(self, node, indent, scope):
        if isinstance(node.value, ast.Constant) and isinstance(node.value.value, str):
            return [indent + '// ' + line.strip() for line in node.value.value.strip().splitlines()]
        return [indent + self.expr(node.value) + ';']

    def s_Pass(self, node, indent, scope):
        return []

    def s_Break(self, node, indent, scope):
        return [indent + 'break;']

    def s_Continue(self, node, indent, scope):
        return [indent + 'continue;']

    def s_Return(self, node, indent, scope):
        return [indent + 'return' + ('' if node.value is None else ' ' + self.expr(node.value)) + ';']

    def _assign_target(self, t):
        if isinstance(t, ast.Name):
            return self.name(t.id)
        if isinstance(t, ast.Attribute):
            if isinstance(t.value, ast.Name) and t.value.id in ('C', 'Constants'):
                raise Unsupported(t, 'setting a constant')
            o = self.expr(t.value, P_ATOM)
            if t.attr == 'payoff':
                return o + '.points'
            if t.attr in ATTRS:
                raise Unsupported(t, 'setting ' + t.attr)
            return o + '.' + t.attr
        if isinstance(t, ast.Subscript):
            if isinstance(t.slice, ast.Slice):
                raise Unsupported(t, 'setting a slice')
            return self.expr(t, P_ATOM)
        if isinstance(t, (ast.Tuple, ast.List)):
            if any(isinstance(e, ast.Starred) for e in t.elts):
                raise Unsupported(t, 'unpacking with *')
            return '[' + ', '.join(self._assign_target(e) for e in t.elts) + ']'
        raise Unsupported(t, 'setting ' + type(t).__name__)

    def s_Assign(self, node, indent, scope):
        value = self.expr(node.value, P_ASSIGN)
        targets = [self._assign_target(t) for t in node.targets]
        decl = ''
        if len(node.targets) == 1 and id(node) in scope.get('let_at', set()):
            decl = 'let '
        return [indent + decl + ' = '.join(targets) + ' = ' + value + ';']

    def s_AnnAssign(self, node, indent, scope):
        if node.value is None:
            return []
        fake = ast.Assign(targets=[node.target], value=node.value)
        ast.copy_location(fake, node)
        if id(node) in scope.get('let_at', set()):
            scope['let_at'].add(id(fake))
        return self.s_Assign(fake, indent, scope)

    def s_AugAssign(self, node, indent, scope):
        t = node.target
        op = type(node.op)
        value = self.expr(node.value, P_ADD + 1)
        if isinstance(t, ast.Attribute) and t.attr == 'payoff':
            o = self.expr(t.value, P_ATOM)
            current = 'otree.payoff(' + o + ')'
            if op not in BINOPS:
                raise Unsupported(node, 'this operator on payoff')
            sym, prec = BINOPS[op]
            return [indent + o + '.points = ' + current + ' ' + sym + ' ' + self.expr(node.value, prec + 1) + ';']
        target = self._assign_target(t)
        if op is ast.FloorDiv:
            return [indent + target + ' = Math.floor(' + target + ' / ' + value + ');']
        if op is ast.Mod:
            return [indent + target + ' = otree.mod(' + target + ', ' + self.expr(node.value) + ');']
        if op is ast.Add and self._is_list(node.value):
            return [indent + target + ' = otree.add(' + target + ', ' + self.expr(node.value) + ');']
        if op not in BINOPS:
            raise Unsupported(node, 'the operator ' + op.__name__)
        return [indent + target + ' ' + BINOPS[op][0] + '= ' + self.expr(node.value, P_ASSIGN) + ';']

    def s_If(self, node, indent, scope):
        out = [indent + 'if (' + self.test(node.test) + ') {']
        out += self.block(node.body, indent + '    ', scope)
        orelse = node.orelse
        while len(orelse) == 1 and isinstance(orelse[0], ast.If):
            inner = orelse[0]
            try:
                test = self.test(inner.test)
            except Unsupported:
                break
            out.append(indent + '} else if (' + test + ') {')
            out += self.block(inner.body, indent + '    ', scope)
            orelse = inner.orelse
        if orelse:
            out.append(indent + '} else {')
            out += self.block(orelse, indent + '    ', scope)
        out.append(indent + '}')
        return out

    def s_For(self, node, indent, scope):
        if node.orelse:
            raise Unsupported(node, 'for ... else')
        target = self._target(node.target)[1:-1]
        names = _names_in(node.target)
        decl = 'const ' if not (names & scope.get('hoisted', set())) else ''
        out = [indent + 'for (' + decl + target + ' of ' + self._iterable(node.iter) + ') {']
        out += self.block(node.body, indent + '    ', scope)
        out.append(indent + '}')
        return out

    def s_While(self, node, indent, scope):
        if node.orelse:
            raise Unsupported(node, 'while ... else')
        out = [indent + 'while (' + self.test(node.test) + ') {']
        out += self.block(node.body, indent + '    ', scope)
        out.append(indent + '}')
        return out

    def s_Assert(self, node, indent, scope):
        msg = self.expr(node.msg) if node.msg is not None else js_str('assert ' + ast.unparse(node.test))
        return [indent + 'if (!' + self.test(node.test, P_UNARY) + ') {', indent + '    throw new Error(' + msg + ');',
                indent + '}']

    def s_Raise(self, node, indent, scope):
        exc = node.exc
        if exc is None:
            return [indent + 'throw err;']
        if isinstance(exc, ast.Call) and isinstance(exc.func, ast.Name):
            args = [self.expr(a) for a in exc.args]
            return [indent + 'throw new Error(' + (args[0] if args else js_str(exc.func.id)) + ');']
        if isinstance(exc, ast.Name):
            return [indent + 'throw new Error(' + js_str(exc.id) + ');']
        raise Unsupported(node, 'this raise')

    def s_Import(self, node, indent, scope):
        for alias in node.names:
            if alias.name not in ('random', 'math'):
                raise Unsupported(node, 'importing ' + alias.name)
            self.modules[alias.asname or alias.name] = alias.name
        return []

    def s_ImportFrom(self, node, indent, scope):
        if node.module == 'random':
            for alias in node.names:
                if alias.name not in RANDOM:
                    raise Unsupported(node, 'random.' + alias.name + ' is not translated')
                self.random_names[alias.asname or alias.name] = alias.name
            return []
        if node.module == 'otree.api':
            return []
        raise Unsupported(node, 'importing from ' + str(node.module))

    def s_Delete(self, node, indent, scope):
        out = []
        for t in node.targets:
            if not isinstance(t, ast.Subscript):
                raise Unsupported(node, 'del of ' + type(t).__name__)
            out.append(indent + 'delete ' + self.expr(t, P_ATOM) + ';')
        return out

    def s_Try(self, node, indent, scope):
        if node.orelse or len(node.handlers) > 1:
            raise Unsupported(node, 'try with else or several excepts')
        out = [indent + 'try {']
        out += self.block(node.body, indent + '    ', scope)
        for h in node.handlers:
            name = self.name(h.name) if h.name else 'err'
            out.append(indent + '} catch (' + name + ') {')
            out.append(indent + '    // As Python\'s except' + (' ' + ast.unparse(h.type) if h.type is not None else '') +
                       ', but catching every error.')
            out += self.block(h.body, indent + '    ', scope)
        if node.finalbody:
            out.append(indent + '} finally {')
            out += self.block(node.finalbody, indent + '    ', scope)
        out.append(indent + '}')
        return out

    def s_FunctionDef(self, node, indent, scope):
        return self.function(node, indent)

    # --- Functions ---------------------------------------------------------------------

    def _params(self, args):
        if args.kwarg is not None or args.kwonlyargs:
            raise Unsupported(args, 'keyword-only parameters or **kwargs')
        params = []
        positional = args.posonlyargs + args.args
        defaults = [None] * (len(positional) - len(args.defaults)) + list(args.defaults)
        for a, d in zip(positional, defaults):
            params.append(self.name(a.arg) + ('' if d is None else ' = ' + self.expr(d, P_ASSIGN)))
        if args.vararg is not None:
            params.append('...' + self.name(args.vararg.arg))
        return '(' + ', '.join(params) + ')'

    def function(self, node, indent='', name=None, keyword='function '):
        """node as a JS function declaration (or, with keyword '', its parameters and body only)."""
        saved = dict(self.modules), dict(self.random_names)
        try:
            if node.decorator_list and not all(isinstance(d, ast.Name) and d.id == 'staticmethod' for d in node.decorator_list):
                raise Unsupported(node, 'decorators')
            params = self._params(node.args)
            param_names = {a.arg for a in node.args.posonlyargs + node.args.args}
            if node.args.vararg is not None:
                param_names.add(node.args.vararg.arg)
            scope = _scope(node.body, param_names)
            body = []
            if scope['hoisted']:
                body.append(indent + '    let ' + ', '.join(self.name(n) for n in sorted(scope['hoisted'])) + ';')
            body += self.block(node.body, indent + '    ', scope)
            head = indent + keyword + (self.name(name or node.name) if keyword else '') + params + ' {'
            return [head] + body + [indent + '}']
        except Unsupported as err:
            self.report.add(self.where, 'todo', err.why + ' (line ' + str(node.lineno) + ')', node.lineno)
            head = indent + keyword + (self.name(name or node.name) if keyword else '') + '() {'
            body = self.todo(node, err.why, indent + '    ')
            self.report.items.pop()
            return [head] + body + [indent + '}']
        finally:
            self.modules, self.random_names = saved


def _names_in(target):
    return {n.id for n in ast.walk(target) if isinstance(n, ast.Name)}


def _own_nodes(stmts):
    """The nodes of stmts, not looking into nested functions, lambdas and comprehensions."""
    stack = list(stmts)
    while stack:
        node = stack.pop()
        yield node
        for child in ast.iter_child_nodes(node):
            if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef, ast.Lambda, ast.ListComp, ast.SetComp,
                                  ast.DictComp, ast.GeneratorExp, ast.ClassDef)):
                if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                    yield child  # its name is a local
                continue
            stack.append(child)


def _scope(body, params):
    """A function's locals: those declared where first assigned (let_at: ids of those top-level
    assignments), those declared at the top (hoisted), and for loops' own variables (neither)."""
    stores = {}
    for node in _own_nodes(body):
        if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store):
            stores.setdefault(node.id, []).append(node)
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            pass  # declared by itself
    for_targets = set()
    for node in _own_nodes(body):
        if isinstance(node, ast.For):
            for_targets |= {id(n) for n in ast.walk(node.target) if isinstance(n, ast.Name)}
    local = {n for n in stores if n not in params}
    loop_only = {n for n in local if all(id(s) in for_targets for s in stores[n])}
    let_at = set()
    seen = set()
    declared = set()
    for stmt in body:
        if isinstance(stmt, (ast.Assign, ast.AnnAssign)):
            targets = stmt.targets if isinstance(stmt, ast.Assign) else [stmt.target]
            if len(targets) == 1:
                names = _names_in(targets[0]) if isinstance(targets[0], (ast.Name, ast.Tuple, ast.List)) else set()
                simple = isinstance(targets[0], ast.Name) or (
                    isinstance(targets[0], (ast.Tuple, ast.List)) and all(isinstance(e, ast.Name) for e in targets[0].elts))
                value_names = {n.id for n in ast.walk(stmt.value) if isinstance(n, ast.Name)} if stmt.value is not None else set()
                if simple and names and names <= local and not (names & seen) and not (names & value_names):
                    let_at.add(id(stmt))
                    declared |= names
        seen |= {n.id for n in ast.walk(stmt) if isinstance(n, ast.Name)}
    hoisted = local - declared - loop_only
    return {'let_at': let_at, 'hoisted': hoisted}


# --- Templates ----------------------------------------------------------------------------

class TemplateToVue:
    """Translates a page's oTree template to a Vue template, whose data is player.page (see
    pageVars in convert-runtime.js) as page: oTree's names, with vars_for_template's."""

    def __init__(self, pkg, info, page, report, where):
        self.pkg = pkg
        self.info = info
        self.page = page
        self.report = report
        self.where = where
        self.form = self._form()

    def todo(self, what):
        self.report.add(self.where, 'todo', what)
        return '<!-- TODO: ' + what.replace('--', '- -') + ' -->'

    def _form(self):
        info, page = self.info, self.page
        model = info.form_model(page)
        cls = info.Player if model == 'player' else info.Group
        out = []
        for name in page.form_fields or []:
            field = cls._fields[name]
            opts = field.opts
            dynamic = {cb for cb in ('choices', 'min', 'max') if info.has_callback(cls, name, cb)}
            out.append({'name': name, 'full': model + '.' + name, 'kind': field.kind, 'opts': opts, 'dynamic': dynamic})
        return out

    def convert(self, text):
        blocks = {}
        tree = otree_template.parse_tree(text)
        level = 0
        while True:
            for node in otree_template._walk(tree):
                if node.kind == 'block' and node.arg not in blocks:
                    blocks[node.arg] = node
            extends = next((c for c in tree.children if c.kind == 'extends'), None)
            if extends is None and level > 0:
                break
            name = _literal(extends.arg) if extends is not None else 'global/Page.html'
            if name is None:
                return self.todo('extends with an expression: ' + extends.arg)
            base = jtree_otree._read(self.pkg, name) or otree_template.BUILTIN.get(name)
            if base is None:
                return self.todo('no template ' + name)
            tree = otree_template.parse_tree(base)
            level += 1
        html = self.nodes(tree.children, set(), blocks)
        html = otree_template.EMPTY_TITLE.sub('', html)
        return _attributes(html)

    def nodes(self, nodes, loop_vars, blocks):
        out = ''
        for node in nodes:
            out += self.node(node, loop_vars, blocks, out)
        return out

    def node(self, node, loop_vars, blocks, before):
        k = node.kind
        if k == 'text':
            return node.arg
        in_tag = before.rfind('<') > before.rfind('>')
        in_code = _inside(before, 'script') or _inside(before, 'style')
        if k == 'expr':
            if in_code:
                return '/* ' + self.todo('{{ ' + node.arg + ' }} in a script or style').replace('*/', '* /') + ' */'
            try:
                code, raw = self.filtered(node.arg, loop_vars)
            except Unsupported as err:
                return self.todo('{{ ' + node.arg + ' }}: ' + err.why)
            if raw:
                if in_tag:
                    return self.todo('{{ ' + node.arg + ' }} inside a tag')
                return '<span v-html="' + code + '"></span>'
            return '{{ ' + code + ' }}'
        if k in ('if', 'for') and (in_tag or in_code):
            return self.todo('{{ ' + k + ' }} inside a tag, script or style')
        if k == 'if':
            out = ''
            for i, (cond, branch) in enumerate(node.branches):
                if cond is None:
                    attr = 'v-else'
                else:
                    try:
                        attr = ('v-if' if i == 0 else 'v-else-if') + '="' + self.vtest(cond, loop_vars) + '"'
                    except Unsupported as err:
                        return self.todo('{{ if ' + cond + ' }}: ' + err.why)
                out += '<template ' + attr + '>' + self.nodes(branch, loop_vars, blocks) + '</template>'
            return out
        if k == 'for':
            names, expr = node.arg
            names = [n.strip() for n in names.split(',')]
            try:
                source = self.vexpr(expr, loop_vars)
            except Unsupported as err:
                return self.todo('{{ for ... in ' + expr + ' }}: ' + err.why)
            alias = names[0] if len(names) == 1 else '[' + ', '.join(names) + ']'
            inner = loop_vars | set(names) | {'forloop'}
            body = self.nodes(node.children, inner, blocks)
            return '<template v-for="(' + alias + ', forloop_index) in ' + source + '">' + body + '</template>'
        if k == 'block':
            chosen = blocks.get(node.arg, node) if blocks else node
            return self.nodes(chosen.children, loop_vars, blocks)
        if k in ('include', 'include_sibling'):
            name = _literal(node.arg)
            text = jtree_otree._read(self.pkg, name) if name else None
            if text is None:
                return self.todo('{{ ' + k + ' ' + node.arg + ' }}')
            return self.nodes(otree_template.parse_tree(text).children, loop_vars, blocks)
        if k == 'formfields':
            return ''.join(self.field(f, None, loop_vars) for f in self.form)
        if k == 'formfield':
            m = re.match(r'''\s*(?:'([^']+)'|"([^"]+)"|([\w.]+))\s*(?:label\s*=\s*(.+))?$''', node.arg)
            if not m:
                return self.todo('{{ formfield ' + node.arg + ' }}')
            name = m.group(1) or m.group(2) or m.group(3).split('.')[-1]
            field = next((f for f in self.form if f['name'] == name), None)
            if field is None:
                return self.todo('{{ formfield ' + node.arg + ' }}: not one of the page\'s form_fields')
            return self.field(field, m.group(4), loop_vars)
        if k == 'formfield_errors':
            return ''
        if k == 'next_button':
            return '<button class="otree-btn-next btn btn-primary">Next</button>'
        if k == 'static':
            # convert.js puts the file in, as a data: URL.
            path = _literal(node.arg)
            if path is None:
                return self.todo('{{ static ' + node.arg + ' }}: a static file named by an expression')
            return STATIC_MARK + path + STATIC_MARK
        if k == 'chat':
            return self.todo('{{ chat }}: jtree has no chat for converted apps; the oTree app runs as is with its chat')
        if k in ('load', 'url', 'extends'):
            return ''
        return self.todo('{{ ' + k + ' }}')

    def filtered(self, text, loop_vars):
        """{{ expr|filter... }} as a Vue expression; and whether it is HTML (|safe)."""
        parts = otree_template._split_filters(text)
        code = self.vexpr(parts[0], loop_vars)
        raw = False
        for f in parts[1:]:
            name, _, arg = f.partition(':')
            name = name.strip()
            if name in ('c', 'cu', 'escape'):
                continue
            if name in ('to0', 'to1', 'to2'):
                code = '(' + code + ').toFixed(' + name[2] + ')'
            elif name == 'json':
                code = 'JSON.stringify(' + code + ')'
            elif name == 'safe':
                raw = True
            elif name == 'length':
                code = '(' + code + ').length'
            elif name == 'upper':
                code = 'String(' + code + ').toUpperCase()'
            elif name == 'lower':
                code = 'String(' + code + ').toLowerCase()'
            elif name == 'default':
                d = self.vexpr(arg, loop_vars)
                code = '(' + code + ' == null || ' + code + " === '' ? " + d + ' : ' + code + ')'
            else:
                raise Unsupported(None, 'the filter ' + name)
        return code, raw

    def vtest(self, text, loop_vars):
        """A condition, true as Python has it for a name's value: an empty list is false."""
        code = self.vexpr(text, loop_vars)
        if re.match(r'^(not\s+)?[A-Za-z_]\w*$', text.strip()):
            name = code.lstrip('!')
            test = '(Array.isArray(' + name + ') ? ' + name + '.length > 0 : !!' + name + ')'
            return ('!' if code.startswith('!') else '') + test
        return code

    def vexpr(self, text, loop_vars):
        text = otree_template._DOTTED_INDEX.sub(r'[\1]', text.strip())
        try:
            tree = ast.parse(text, mode='eval')
        except SyntaxError as err:
            raise Unsupported(None, 'cannot read ' + text)
        return _VueExpr(loop_vars).expr(tree.body)

    def field(self, f, label_arg, loop_vars):
        opts = f['opts']
        name, full, kind, dynamic = f['name'], f['full'], f['kind'], f['dynamic']
        if label_arg:
            lit = _literal(label_arg)
            label = otree_template.escape(lit) if lit is not None else '{{ ' + self.vexpr(label_arg, loop_vars) + ' }}'
        else:
            label = otree_template.escape(opts.get('label') or name)
        required = '' if opts.get('blank') else ' required'
        widget = opts.get('widget')
        choices = opts.get('choices')
        if kind == 'bool' and not choices and 'choices' not in dynamic:
            choices = [[True, 'Yes'], [False, 'No']]
        if choices is not None or 'choices' in dynamic:
            radio = widget in ('RadioSelect', 'RadioSelectHorizontal') or kind == 'bool'
            if 'choices' in dynamic:
                loop = 'v-for="choice in page.form.' + name + '.choices"'
                if radio:
                    options = ('<label class="otree-choice" ' + loop + '><input type="radio" name="' + full +
                               '" :value="choice[0] === true ? \'True\' : choice[0] === false ? \'False\' : choice[0]"' +
                               required + '> {{ choice[1] }}</label>')
                else:
                    options = '<option ' + loop + ' :value="choice[0]">{{ choice[1] }}</option>'
            else:
                pairs = [c if isinstance(c, (list, tuple)) else [c, c] for c in choices]
                if radio:
                    options = ''.join('<label class="otree-choice"><input type="radio" name="' + full + '" value="' +
                                      otree_template.escape(_choice_value(v)) + '"' + required + '> ' +
                                      otree_template.escape(t) + '</label>' for v, t in pairs)
                else:
                    options = ''.join('<option value="' + otree_template.escape(_choice_value(v)) + '">' +
                                      otree_template.escape(t) + '</option>' for v, t in pairs)
            if radio:
                cls = ' otree-radio-horizontal' if widget == 'RadioSelectHorizontal' else ''
                control = '<div class="otree-radio' + cls + '">' + options + '</div>'
            else:
                control = ('<select name="' + full + '" class="form-select"' + required + '><option value=""></option>' +
                           options + '</select>')
        elif kind in ('int', 'number', 'currency'):
            attrs = ''
            for k in ('min', 'max'):
                if k in dynamic:
                    attrs += ' :' + k + '="page.form.' + name + '.' + k + '"'
                elif opts.get(k) is not None:
                    attrs += ' ' + k + '="' + js_value(_plain_value(opts[k])) + '"'
            step = '1' if kind == 'int' else 'any'
            control = '<input type="number" step="' + step + '" name="' + full + '"' + attrs + required + ' class="form-control">'
        elif opts.get('long') or widget == 'TextArea':
            control = '<textarea name="' + full + '" class="form-control"' + required + '></textarea>'
        else:
            control = '<input type="text" name="' + full + '"' + required + ' class="form-control">'
        return '<div class="otree-field mb-3"><label class="form-label">' + label + '</label>' + control + '</div>'


def _choice_value(v):
    if v is True:
        return 'True'
    if v is False:
        return 'False'
    return str(_plain_value(v)) if not isinstance(v, float) or not v.is_integer() else str(int(v))


def _literal(text):
    try:
        v = ast.literal_eval(text.strip())
    except (ValueError, SyntaxError):
        return None
    return v if isinstance(v, str) else None


def _inside(html, tag):
    return html.lower().rfind('<' + tag) > html.lower().rfind('</' + tag)


STATIC_MARK = '@@jtree-static@@'

_TAG = re.compile(r'<[a-zA-Z][^<>]*\{\{[^<>]*>')
_ATTR = re.compile(r'([\w:.-]+)="([^"]*\{\{[^"]*)"')


def _attributes(html):
    """Mustaches in attributes (Vue 2 has none there): name="a{{ x }}b" as :name="'a' + (x) + 'b'"."""
    def fix_attr(m):
        parts = re.split(r'\{\{\s*(.*?)\s*\}\}', m.group(2))
        code = []
        for i, part in enumerate(parts):
            if i % 2:
                code.append('(' + part + ')')
            elif part:
                code.append(js_str(otree_template.html.unescape(part)))
        return ':' + m.group(1) + '="' + ' + '.join(code or ["''"]) + '"'

    return _TAG.sub(lambda m: _ATTR.sub(fix_attr, m.group(0)), html)


class _VueExpr:
    """A template's expression as a Vue (JS) one: names are page's (page.player, page.C, ...)
    but for loops' variables; oTree's names are kept, as pageVars gives them."""

    def __init__(self, loop_vars):
        self.loop_vars = loop_vars

    def expr(self, node, min_prec=0):
        code, prec = self._expr(node)
        return '(' + code + ')' if prec < min_prec else code

    def _expr(self, node):
        if isinstance(node, ast.Constant):
            if node.value is None or isinstance(node.value, (bool, int, float, str)):
                return js_value(node.value), P_ATOM
        if isinstance(node, ast.Name):
            n = node.id
            if n in ('True', 'False', 'None'):
                return {'True': 'true', 'False': 'false', 'None': 'null'}[n], P_ATOM
            if n == 'Constants':
                n = 'C'
            if n in self.loop_vars:
                if n == 'forloop':
                    return 'forloop', P_ATOM
                return n, P_ATOM
            return 'page.' + n, P_ATOM
        if isinstance(node, ast.Attribute):
            if isinstance(node.value, ast.Name) and node.value.id == 'forloop' and 'forloop' in self.loop_vars:
                return {'counter': '(forloop_index + 1)', 'counter0': 'forloop_index'}.get(node.attr, 'undefined'), P_ATOM
            return self.expr(node.value, P_ATOM) + '.' + node.attr, P_ATOM
        if isinstance(node, ast.Subscript) and not isinstance(node.slice, ast.Slice):
            return self.expr(node.value, P_ATOM) + '[' + self.expr(node.slice) + ']', P_ATOM
        if isinstance(node, ast.BoolOp):
            sym, prec = ('&&', P_AND) if isinstance(node.op, ast.And) else ('||', P_OR)
            return (' ' + sym + ' ').join(self.expr(v, prec + 1) for v in node.values), prec
        if isinstance(node, ast.UnaryOp):
            if isinstance(node.op, ast.Not):
                return '!' + self.expr(node.operand, P_UNARY), P_UNARY
            if isinstance(node.op, ast.USub):
                return '-' + self.expr(node.operand, P_UNARY + 1), P_UNARY
        if isinstance(node, ast.BinOp) and type(node.op) in BINOPS:
            sym, prec = BINOPS[type(node.op)]
            return self.expr(node.left, prec) + ' ' + sym + ' ' + self.expr(node.right, prec + 1), prec
        if isinstance(node, ast.Compare) and len(node.ops) == 1:
            op, left, right = node.ops[0], node.left, node.comparators[0]
            if isinstance(op, (ast.In, ast.NotIn)):
                code = '[].concat(' + self.expr(right) + ').includes(' + self.expr(left) + ')'
                return ('!' + code, P_UNARY) if isinstance(op, ast.NotIn) else (code, P_ATOM)
            sym, prec = {ast.Eq: ('==', P_EQ), ast.NotEq: ('!=', P_EQ), ast.Lt: ('<', P_REL), ast.LtE: ('<=', P_REL),
                         ast.Gt: ('>', P_REL), ast.GtE: ('>=', P_REL), ast.Is: ('===', P_EQ),
                         ast.IsNot: ('!==', P_EQ)}[type(op)]
            return self.expr(left, prec) + ' ' + sym + ' ' + self.expr(right, prec + 1), prec
        if isinstance(node, (ast.List, ast.Tuple)):
            return '[' + ', '.join(self.expr(e) for e in node.elts) + ']', P_ATOM
        raise Unsupported(node, type(node).__name__ + ' in a template')


# --- The app ------------------------------------------------------------------------------

KINDS = {'int': 'int', 'number': 'number', 'currency': 'number', 'string': 'string', 'bool': 'bool'}
PAGE_HOOKS = ['is_displayed', 'vars_for_template', 'before_next_page', 'get_timeout_seconds', 'error_message']
NOT_CONVERTED = {
    'js_vars': 'js_vars: the page\'s scripts get no js_vars',
    'live_method': 'live_method: live pages are not converted',
    'get_form_fields': 'get_form_fields: the page has its form_fields only',
    'app_after_this_page': 'app_after_this_page: not converted',
}


def convert(pkg, source_name='__init__.py'):
    """The jtree app converted from the oTree app loaded as pkg, as JSON: {name, files: {path:
    text}, report: [{part, status ('converted' or 'todo'), note, line}]}. Static files are marked
    STATIC_MARK + path + STATIC_MARK, for convert.js to put in."""
    info = jtree_otree._apps[pkg]
    if info.old:
        raise ValueError('Converting needs an app in oTree\'s current format (__init__.py, no self); '
                         'this one is in its older format (models.py, pages.py). It runs in jtree as it is.')
    path = '/apps/' + pkg + '/' + source_name
    with open(path, encoding='utf-8') as f:
        source = f.read()
    module = ast.parse(source)
    report = Report()
    described = jtree_otree.describe(info)
    name = described['name'] or pkg

    functions = {n.name: n for n in module.body if isinstance(n, ast.FunctionDef)}
    js = PyToJS(source, functions, report)
    classes = {n.name: n for n in module.body if isinstance(n, ast.ClassDef)}
    pages = info.page_sequence

    out = []
    w = out.append
    w('// ' + name + ': converted by jtree from the oTree app ' + name + ' (see CONVERSION.md).')
    w('// Rounds are periods; payoff is points; pages are stages; templates are the screens in pages/.')
    w('')
    w("const otree = require(path.join(path.dirname(app.appPath), 'otree.cjs'));")
    w('')
    w('app.title = ' + js_str(name) + ';')
    if described['doc']:
        w('app.description = ' + js_str(re.sub(r'\s+', ' ', described['doc']).strip()) + ';')
    w('app.numPeriods = ' + str(described['num_rounds']) + ';')
    if described['players_per_group'] is not None:
        w('app.groupSize = ' + str(described['players_per_group']) + ';')
    w("app.groupMatchingType = 'PARTNER_1122'; // oTree's default: groups in order, the same in each round")
    w("app.playerFieldsNotInOutput = ['page'];")
    w('')
    report.add('Settings', 'converted', 'NUM_ROUNDS, PLAYERS_PER_GROUP')

    # Constants.
    w("// The constants (oTree's C).")
    w('const C = {')
    for k, v in described['constants'].items():
        w('    ' + js_key(k) + ': ' + js_value(v) + ',')
    w('};')
    w('app.C = C;')
    w('')
    report.add('C', 'converted', 'as constants (currency amounts as numbers)')

    # Module-level names other than functions and classes; imports of random and math.
    for node in module.body:
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            if isinstance(node, ast.ImportFrom) and node.module == 'otree.api':
                continue
            js.where = 'Import (line ' + str(node.lineno) + ')'
            for line in js.stmt(node, '', {}):
                w(line)
            continue
        if isinstance(node, (ast.FunctionDef, ast.ClassDef)):
            continue
        if isinstance(node, ast.Expr) and isinstance(node.value, ast.Constant):
            continue
        if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
            n = node.targets[0].id
            if n in ('doc', 'page_sequence'):
                continue
            value = getattr(info.mod, n, None)
            if isinstance(value, (bool, int, float, str, list, dict, tuple)) or value is None:
                w('const ' + js.name(n) + ' = ' + js_value(_plain_value(value)) + ';')
                report.add(n, 'converted', 'a module-level value', node.lineno)
                continue
        report.add('line ' + str(node.lineno), 'todo', 'module-level code: ' + js.source(node).splitlines()[0], node.lineno)
        w('// TODO (from Python, line ' + str(node.lineno) + '): module-level code, not converted.')
        for line in js.source(node).splitlines():
            w('//   ' + line)

    # Fields.
    if out[-1] != '':
        w('')
    w("// The fields: what pages' forms check (oTree's models' fields).")
    w('app.fields = {')
    initial = {'player': {}, 'group': {}}
    for model, cls in (('player', info.Player), ('group', info.Group)):
        for fname, field in cls._fields.items():
            opts = field.opts
            spec = {}
            if opts.get('label') is not None:
                spec['label'] = js_str(str(opts['label']))
            spec['type'] = js_str(KINDS.get(field.kind, 'string'))
            dynamic = [cb for cb in ('min', 'max', 'choices') if info.has_callback(cls, fname, cb)]
            if opts.get('choices') is not None or 'choices' in dynamic:
                spec['type'] = "'choice'"
                if opts.get('choices') is not None:
                    spec['choices'] = js_value(_plain_value(opts['choices']))
            for k in ('min', 'max'):
                if opts.get(k) is not None:
                    spec[k] = js_value(_plain_value(opts[k]))
            if opts.get('blank'):
                spec['blank'] = 'true'
            for cb in dynamic:
                arg = 'player' if model == 'player' else 'player.group'
                spec[cb] = '(player) => ' + js.name(fname + '_' + cb) + '(' + arg + ')'
            if opts.get('initial') is not None:
                initial[model][fname] = _plain_value(opts['initial'])
            w('    ' + js_str(model + '.' + fname) + ': { ' + ', '.join(k + ': ' + v for k, v in spec.items()) + ' },')
    w('};')
    report.add('Fields', 'converted', 'player and group fields, with min, max, choices, blank and initial')
    subsession_fields = list(info.Subsession._fields)
    if subsession_fields:
        report.add('Subsession fields', 'converted', ', '.join(subsession_fields) + ': kept on the period')

    # When rounds start.
    has_initial = initial['player'] or initial['group']
    if has_initial or described['creating_session']:
        w('')
        w("// When each round starts: fields' initial values" + (', then creating_session.' if described['creating_session'] else '.'))
        w('app.periodStart = function (period) {')
        if has_initial:
            w('    otree.initialize(period, ' + js_value({k: v for k, v in initial.items() if v}) + ');')
        if described['creating_session']:
            w('    creating_session(period);')
        w('};')

    # Functions.
    w('')
    w('// Functions.')
    for node in module.body:
        if isinstance(node, ast.FunctionDef):
            js.where = 'Function ' + node.name
            before = len(report.todos)
            if node.name in ('custom_export', 'vars_for_admin_report'):
                report.add(js.where, 'todo', node.name + ' is not converted', node.lineno)
                continue
            lines = js.function(node)
            w('')
            w('\n'.join(lines))
            if len(report.todos) == before:
                report.add(js.where, 'converted', '', node.lineno)

    # Pages.
    files = {}
    group_by_arrival = False
    for page in pages:
        cls_node = classes.get(page.__name__)
        is_wait = issubclass(page, api.WaitPage)
        where = ('Wait page ' if is_wait else 'Page ') + page.__name__
        js.where = where
        before = len(report.todos)
        methods = {n.name: n for n in (cls_node.body if cls_node else []) if isinstance(n, ast.FunctionDef)}
        w('')
        doc = ast.get_docstring(cls_node) if cls_node else None
        w('// ' + page.__name__ + (': a wait page.' if is_wait else ': a page.'))
        for line in (doc or '').splitlines():
            w('// ' + line.strip())
        w('{')
        w('    const stage = app.newStage(' + js_str(page.__name__) + ');')
        if is_wait:
            w('    otree.waitPage(stage, ' + js_str(str(page.title_text)) + ', ' + js_str(str(page.body_text)) + ');')
            if page.group_by_arrival_time:
                group_by_arrival = True
            target = page.after_all_players_arrive
            fn_name = None
            if 'after_all_players_arrive' in methods:
                lines = js.function(methods['after_all_players_arrive'], '    ', name='after_all_players_arrive')
                w('\n'.join(lines))
                fn_name = 'after_all_players_arrive'
            elif isinstance(target, str):
                fn_name = js.name(target)
            elif target is not None:
                fn_name = js.name(target.__name__)
            if page.wait_for_all_groups:
                w('    stage.waitForAllGroups = true;')
                if fn_name:
                    w('    stage.allGroupsStart = (period) => ' + fn_name + '(period); // after_all_players_arrive')
            elif fn_name:
                w('    stage.groupStart = (group) => ' + fn_name + '(group); // after_all_players_arrive')
            for m in methods:
                if m in ('is_displayed',):
                    lines = js.function(methods[m], '    ', keyword='function ', name='is_displayed')
                    w('\n'.join(lines))
                    w('    stage.canPlayerParticipate = is_displayed;')
        else:
            w('    otree.page(stage);')
            model = info.form_model(page)
            if page.form_fields:
                w('    stage.formFields = ' + js_value([model + '.' + f for f in page.form_fields]) + ';')
            if page.timeout_seconds:
                w('    stage.clientDuration = ' + js_value(page.timeout_seconds) + '; // timeout_seconds')
            w('    stage.activeScreen = otree.screen(app, ' + js_str(page.__name__) + ');')
            for m, node in methods.items():
                if m in NOT_CONVERTED:
                    report.add(where, 'todo', NOT_CONVERTED[m], node.lineno)
                    continue
                if m not in PAGE_HOOKS:
                    if m != 'after_all_players_arrive':
                        report.add(where, 'todo', m + ' is not an oTree page method jtree knows', node.lineno)
                    continue
                w('\n'.join(js.function(node, '    ')))
                if m == 'is_displayed':
                    w('    stage.canPlayerParticipate = is_displayed;')
                elif m == 'vars_for_template':
                    w('    stage.playerStart = (player) => {')
                    w('        player.page = otree.pageVars(player, vars_for_template(player));')
                    w('    };')
                elif m == 'before_next_page':
                    w('    stage.playerEnd = (player) => before_next_page(player, !!player.timedOut);')
                elif m == 'get_timeout_seconds':
                    w('    stage.getClientDuration = (player) => get_timeout_seconds(player) || 0;')
            field_checks = [f for f in page.form_fields or []
                            if info.has_callback(info.Player if model == 'player' else info.Group, f, 'error_message')]
            if field_checks or 'error_message' in methods:
                checks = '{ ' + ', '.join(js_key(f) + ': ' + js.name(f + '_error_message') for f in field_checks) + ' }'
                w('    stage.validate = (player, values) => otree.validate(player, values, ' + js_str(model) + ', ' +
                  (checks if field_checks else '{}') + ', ' + ('error_message' if 'error_message' in methods else 'null') + ');')
            # The screen.
            template_name = page.template_name or page.__name__ + '.html'
            text = jtree_otree._read(pkg, template_name)
            if text is None:
                text = ('{{ block title }}' + page.__name__ + '{{ endblock }}'
                        '{{ block content }}{{ formfields }}{{ next_button }}{{ endblock }}')
            vue = TemplateToVue(pkg, info, page, report, where).convert(text)
            files['pages/' + page.__name__ + '.html'] = _screen(page.__name__, template_name, name, vue)
        w('}')
        if len(report.todos) == before:
            note = '' if is_wait else 'with its template'
            if not is_wait and '<script' in files['pages/' + page.__name__ + '.html']:
                note += "; its scripts run when the participant's page loads, as jtree's do"
            report.add(where, 'converted', note)
    if group_by_arrival:
        w('')
        w('app.groupByArrival = true; // group_by_arrival_time')

    # What the app has that is not converted.
    for n, node in classes.items():
        bases = [ast.unparse(b) for b in node.bases]
        if 'ExtraModel' in bases:
            report.add('ExtraModel ' + n, 'todo', 'ExtraModels are not converted', node.lineno)
    if jtree_otree._read(pkg, 'admin_report.html') is not None:
        report.add('admin_report.html', 'todo', 'admin reports are not converted')

    files['app.jtt'] = '\n'.join(out) + '\n'
    return json.dumps({'files': files, 'report': report.items, 'name': name})


def _screen(page, template, app_name, vue):
    return ('<!-- ' + page + ': converted from ' + template + ' of the oTree app ' + app_name + '. Its data is\n'
            '     page, what pageVars (otree.cjs) worked out when the player started the page: player, group,\n'
            '     subsession, participant, session and C with oTree\'s names, and what vars_for_template gave. -->\n'
            '<link rel="stylesheet" href="/shared/bootstrap-5.3.8/bootstrap.min.css">\n'
            '<link rel="stylesheet" href="/participant/otree.css">\n'
            '<template v-if="stage.id == ' + js_str(page) + ' && player.page != null">\n'
            '<div class="otree-page" v-for="page in [player.page]">\n' + vue.strip() + '\n</div>\n</template>\n')
