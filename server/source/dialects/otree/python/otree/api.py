"""jtree's otree.api: what oTree apps import, written from oTree's documentation.

Model instances (Player, Group, Subsession, and Participant, Session) hold no state: each wraps
the jtree object it stands for (a Player, Group, Period, Participant or Session), and reading or
writing a field reads or writes that object. So jtree saves, restores and shows everything, and
Python holds nothing that needs saving. See plans/ztree-otree-dialects.md, section 4.
"""

import random as _random

from pyodide.ffi import JsProxy, to_js
from js import Object


# --- Values -------------------------------------------------------------------------------

class Currency(float):
    """An amount of points or money; arithmetic keeps it a Currency."""

    def __new__(cls, value=0):
        return super().__new__(cls, 0 if value is None else float(value))

    def _of(self, value):
        return Currency(value)

    def __add__(self, other): return Currency(float(self) + float(other))
    __radd__ = __add__
    def __sub__(self, other): return Currency(float(self) - float(other))
    def __rsub__(self, other): return Currency(float(other) - float(self))
    def __mul__(self, other): return Currency(float(self) * float(other))
    __rmul__ = __mul__
    def __truediv__(self, other): return Currency(float(self) / float(other))
    def __rtruediv__(self, other): return Currency(float(other) / float(self))
    def __floordiv__(self, other): return Currency(float(self) // float(other))
    def __neg__(self): return Currency(-float(self))
    def __abs__(self): return Currency(abs(float(self)))

    def to_real_world_currency(self, session):
        return round(float(self) * session.real_world_currency_per_point, 2)

    def __str__(self):
        value = round(float(self), 2)
        return str(int(value)) if value == int(value) else f'{value:.2f}'

    __repr__ = __str__


cu = Currency
c = Currency


def to_js_value(value):
    """value as jtree should store it: containers become JS objects and arrays."""
    if isinstance(value, Currency):
        return float(value)
    if isinstance(value, (dict, list, tuple)):
        return to_js(value, dict_converter=Object.fromEntries)
    return value


def to_py_value(value):
    """A value read from jtree, as Python sees it: JS undefined and null are None."""
    if isinstance(value, JsProxy):
        if str(value) in ('undefined', 'null'):
            return None
        try:
            return value.to_py()
        except Exception:
            return value
    return value


def js_get(obj, name):
    """obj[name] from a JS object, None if it has none."""
    try:
        return to_py_value(getattr(obj, name))
    except AttributeError:
        return None


# --- Fields -------------------------------------------------------------------------------

class _Field:
    def __init__(self, kind, **opts):
        self.kind = kind
        self.opts = opts


class models:
    @staticmethod
    def IntegerField(**kw): return _Field('int', **kw)
    @staticmethod
    def FloatField(**kw): return _Field('number', **kw)
    @staticmethod
    def CurrencyField(**kw): return _Field('currency', **kw)
    @staticmethod
    def StringField(**kw): return _Field('string', **kw)
    @staticmethod
    def LongStringField(**kw): return _Field('string', long=True, **kw)
    @staticmethod
    def BooleanField(**kw): return _Field('bool', **kw)


class widgets:
    RadioSelect = 'RadioSelect'
    RadioSelectHorizontal = 'RadioSelectHorizontal'
    CheckboxInput = 'CheckboxInput'
    TextArea = 'TextArea'
    Slider = 'Slider'


# --- Models -------------------------------------------------------------------------------

class _VarsDict:
    """participant.vars and session.vars: a dict kept in a JS object of jtree's."""

    def __init__(self, owner):
        object.__setattr__(self, '_owner', owner)
        if js_get(owner, 'vars') is None:
            owner.vars = Object.new()

    def _store(self):
        return self._owner.vars

    def __getitem__(self, key):
        value = js_get(self._store(), key)
        if value is None and not hasattr(self._store(), key):
            raise KeyError(key)
        return value

    def __setitem__(self, key, value):
        setattr(self._store(), key, to_js_value(value))

    def __contains__(self, key):
        return hasattr(self._store(), key)

    def get(self, key, default=None):
        return self[key] if key in self else default

    def setdefault(self, key, default=None):
        if key not in self:
            self[key] = default
        return self[key]

    def keys(self):
        return list(Object.keys(self._store()))

    def items(self):
        return [(k, self.get(k)) for k in self.keys()]

    def __iter__(self):
        return iter(self.keys())

    def __repr__(self):
        return repr(dict(self.items()))


class _Model:
    """A model whose fields live in a jtree object (self._js)."""

    _fields = {}
    _extra_settable = ()

    def __init_subclass__(cls, **kw):
        super().__init_subclass__(**kw)
        fields = {}
        for base in reversed(cls.__mro__[1:]):
            fields.update(getattr(base, '_fields', {}))
        for name, value in list(vars(cls).items()):
            if isinstance(value, _Field):
                fields[name] = value
                delattr(cls, name)
        cls._fields = fields

    def __init__(self, js):
        object.__setattr__(self, '_js', js)

    def __getattr__(self, name):
        if name.startswith('_'):
            raise AttributeError(name)
        if name in type(self)._fields:
            value = js_get(self._js, name)
            if value is None:
                value = type(self)._fields[name].opts.get('initial')
            if value is not None and type(self)._fields[name].kind == 'currency':
                return Currency(value)
            return value
        raise AttributeError(f'{type(self).__name__} has no field {name!r}')

    def __setattr__(self, name, value):
        cls = type(self)
        if isinstance(getattr(cls, name, None), property):
            object.__setattr__(self, name, value)
        elif name in cls._fields or name in cls._extra_settable:
            setattr(self._js, name, to_js_value(value))
        else:
            raise AttributeError(f'{cls.__name__} has no field {name!r}')

    def _key(self):
        return str(self._js.roomId())

    def __eq__(self, other):
        return isinstance(other, _Model) and self._key() == other._key()

    def __hash__(self):
        return hash(self._key())

    def __repr__(self):
        return f'<{type(self).__name__} {self._key()}>'

    # The app's own model classes, set by jtree_otree when it loads the app.
    _app = None

    @classmethod
    def _schema(cls):
        out = {}
        for name, f in cls._fields.items():
            out[name] = dict(kind=f.kind, **{k: v for k, v in f.opts.items() if _plain(v)})
        return out


def _plain(value):
    return value is None or isinstance(value, (bool, int, float, str)) or (
        isinstance(value, (list, tuple)) and all(_plain(v) for v in value))


class BaseConstants:
    pass


class BaseSubsession(_Model):
    """Stands for a jtree Period: one round of the app."""

    @property
    def round_number(self):
        return int(self._js.id)

    @property
    def session(self):
        return Session(self._js.app.session)

    def get_players(self):
        return [self._app.Player(p) for g in self._js.groups for p in g.players]

    def get_groups(self):
        return [self._app.Group(g) for g in self._js.groups]

    def set_group_matrix(self, matrix):
        ids = []
        for row in matrix:
            members = []
            for member in row:
                if isinstance(member, BasePlayer):
                    members.append(str(member._js.participant.id))
                else:
                    # An id_in_subsession, from 1.
                    members.append(str(self.get_players()[int(member) - 1]._js.participant.id))
            ids.append(members)
        self._js.setGroups(to_js(ids))

    def get_group_matrix(self):
        return [[p for p in g.get_players()] for g in self.get_groups()]

    def group_randomly(self, fixed_id_in_group=False):
        groups = [[p for p in g.get_players()] for g in self.get_groups()]
        if fixed_id_in_group:
            columns = [list(col) for col in zip(*groups)]
            for col in columns:
                _random.shuffle(col)
            groups = [list(row) for row in zip(*columns)]
        else:
            players = [p for g in groups for p in g]
            _random.shuffle(players)
            size = len(groups[0]) if groups else 0
            groups = [players[i:i + size] for i in range(0, len(players), size)]
        self.set_group_matrix(groups)

    def group_like_round(self, round_number):
        before = self.in_round(round_number)
        self.set_group_matrix([[str(p._js.participant.id) for p in g.get_players()] for g in before.get_groups()])

    def in_round(self, round_number):
        period = self._js.app.periods[round_number - 1]
        return self._app.Subsession(period)

    def in_rounds(self, first, last):
        return [self.in_round(n) for n in range(first, last + 1)]

    def in_previous_rounds(self):
        return self.in_rounds(1, self.round_number - 1)

    def in_all_rounds(self):
        return self.in_rounds(1, self.round_number)


class BaseGroup(_Model):
    """Stands for a jtree Group."""

    @property
    def id_in_subsession(self):
        return int(self._js.id)

    @property
    def round_number(self):
        return int(self._js.period.id)

    @property
    def subsession(self):
        return self._app.Subsession(self._js.period)

    @property
    def session(self):
        return self.subsession.session

    def get_players(self):
        return [self._app.Player(p) for p in self._js.players]

    def get_player_by_id(self, id_in_group):
        for p in self.get_players():
            if p.id_in_group == id_in_group:
                return p
        raise ValueError(f'no player with id_in_group {id_in_group}')

    def get_player_by_role(self, role):
        for p in self.get_players():
            if p.role == role:
                return p
        raise ValueError(f'no player with role {role!r}')

    def in_round(self, round_number):
        group = self._js.inPeriod(round_number)
        return None if group is None else self._app.Group(group)

    def in_rounds(self, first, last):
        return [self.in_round(n) for n in range(first, last + 1)]

    def in_previous_rounds(self):
        return self.in_rounds(1, self.round_number - 1)

    def in_all_rounds(self):
        return self.in_rounds(1, self.round_number)


class BasePlayer(_Model):
    """Stands for a jtree Player. Its payoff is jtree's player.points."""

    _extra_settable = ('payoff',)

    @property
    def payoff(self):
        return Currency(js_get(self._js, 'points') or 0)

    @payoff.setter
    def payoff(self, value):
        self._js.points = float(value if value is not None else 0)

    @property
    def id_in_group(self):
        return int(self._js.idInGroup)

    @property
    def id_in_subsession(self):
        return self.subsession.get_players().index(self) + 1

    @property
    def round_number(self):
        return int(self._js.group.period.id)

    @property
    def group(self):
        return self._app.Group(self._js.group)

    @property
    def subsession(self):
        return self._app.Subsession(self._js.group.period)

    @property
    def participant(self):
        return Participant(self._js.participant)

    @property
    def session(self):
        return self.subsession.session

    @property
    def role(self):
        roles = self._app.roles
        return roles[self.id_in_group - 1] if self.id_in_group <= len(roles) else ''

    def get_others_in_group(self):
        return [p for p in self.group.get_players() if p != self]

    def get_others_in_subsession(self):
        return [p for p in self.subsession.get_players() if p != self]

    def in_round(self, round_number):
        player = self._js.inPeriod(round_number)
        return None if player is None else self._app.Player(player)

    def in_rounds(self, first, last):
        return [self.in_round(n) for n in range(first, last + 1)]

    def in_previous_rounds(self):
        return self.in_rounds(1, self.round_number - 1)

    def in_all_rounds(self):
        return self.in_rounds(1, self.round_number)


class _Open:
    """A wrapper whose other attributes are the jtree object's own (PARTICIPANT_FIELDS, SESSION_FIELDS)."""

    _own = ()

    def __init__(self, js):
        object.__setattr__(self, '_js', js)

    def __getattr__(self, name):
        if name.startswith('_'):
            raise AttributeError(name)
        return js_get(self._js, name)

    def __setattr__(self, name, value):
        if isinstance(getattr(type(self), name, None), property):
            object.__setattr__(self, name, value)
        else:
            setattr(self._js, name, to_js_value(value))

    def __eq__(self, other):
        return isinstance(other, type(self)) and str(self._js.id) == str(other._js.id)

    def __hash__(self):
        return hash(str(self._js.id))


class Participant(_Open):
    """Stands for a jtree Participant."""

    @property
    def code(self):
        return str(self._js.id)

    @property
    def label(self):
        return js_get(self._js, 'label') or str(self._js.id)

    @property
    def id_in_session(self):
        return list(Object.keys(self._js.session.participants)).index(str(self._js.id)) + 1

    @property
    def vars(self):
        return _VarsDict(self._js)

    @property
    def session(self):
        return Session(self._js.session)

    @property
    def payoff(self):
        return Currency(self._js.points())

    def payoff_plus_participation_fee(self):
        return float(self._js.payment())


class Session(_Open):
    """Stands for a jtree Session."""

    @property
    def code(self):
        return str(self._js.id)

    @property
    def vars(self):
        return _VarsDict(self._js)

    @property
    def config(self):
        return js_get(self._js, 'otreeConfig') or {}

    @property
    def num_participants(self):
        return len(list(Object.keys(self._js.participants)))

    @property
    def real_world_currency_per_point(self):
        return float(self._js.exchangeRate)

    @property
    def participation_fee(self):
        return float(self._js.showUpFee)

    def get_participants(self):
        return [Participant(p) for p in Object.values(self._js.participants)]


# --- Pages --------------------------------------------------------------------------------

class Page:
    form_model = None
    form_fields = []
    timeout_seconds = None
    timer_text = None
    template_name = None


class WaitPage:
    wait_for_all_groups = False
    group_by_arrival_time = False
    after_all_players_arrive = None
    title_text = 'Please wait'
    body_text = 'Waiting for the other participants.'
    template_name = None


class ExtraModel:
    """Not yet supported by jtree."""

    def __init_subclass__(cls, **kw):
        raise NotImplementedError('jtree does not run ExtraModel yet')


class Bot:
    pass


class Submission:
    def __init__(self, page_class, post_data=None, check_html=True, timeout_happened=False):
        self.page_class = page_class
        self.post_data = post_data or {}
        self.timeout_happened = timeout_happened


def expect(*args):
    if len(args) == 2:
        assert args[0] == args[1], f'expected {args[1]!r}, got {args[0]!r}'
    elif len(args) == 3:
        a, op, b = args
        ops = {'==': a == b, '!=': a != b, '<': a < b, '>': a > b, '<=': a <= b, '>=': a >= b,
               'in': a in b, 'not in': a not in b}
        assert ops[op], f'expected {a!r} {op} {b!r}'


__all__ = ['Currency', 'cu', 'c', 'models', 'widgets', 'BaseConstants', 'BaseSubsession', 'BaseGroup',
           'BasePlayer', 'Page', 'WaitPage', 'ExtraModel', 'Bot', 'Submission', 'expect']
