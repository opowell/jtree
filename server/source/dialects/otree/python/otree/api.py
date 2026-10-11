"""jtree's otree.api: what oTree apps import, written from oTree's documentation.

Model instances (Player, Group, Subsession, and Participant, Session) hold no state: each wraps
the jtree object it stands for (a Player, Group, Period, Participant or Session), and reading or
writing a field reads or writes that object. So jtree saves, restores and shows everything, and
Python holds nothing that needs saving. See plans/ztree-otree-dialects.md, section 4.
"""

import random as _random

# oTree's own random numbers (group_randomly): not the apps' (random), which they may seed.
_rng = _random.Random()

from pyodide.ffi import JsProxy, to_js
from js import Object, JSON


# --- Values -------------------------------------------------------------------------------

class Currency(float):
    """An amount of points or money; arithmetic keeps it a Currency. Rounded as oTree rounds it
    (half up): to POINTS_DECIMAL_PLACES (0) with USE_POINTS, else REAL_WORLD_CURRENCY_DECIMAL_PLACES."""

    def __new__(cls, value=0):
        from decimal import Decimal, ROUND_HALF_UP
        from otree import settings
        places = settings.POINTS_DECIMAL_PLACES if settings.USE_POINTS else settings.REAL_WORLD_CURRENCY_DECIMAL_PLACES
        amount = value if isinstance(value, Decimal) else Decimal.from_float(float(0 if value is None else value))
        return super().__new__(cls, float(amount.quantize(Decimal('0.1') ** places, rounding=ROUND_HALF_UP)))

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

    # Django's fields, as oTree's older apps declare them.
    @staticmethod
    def PositiveIntegerField(**kw): return _Field('int', **{'min': 0, **kw})
    PositiveSmallIntegerField = PositiveIntegerField
    @staticmethod
    def SmallIntegerField(**kw): return _Field('int', **kw)
    BigIntegerField = SmallIntegerField
    @staticmethod
    def DecimalField(**kw): return _Field('number', **{k: v for k, v in kw.items() if k not in ('max_digits', 'decimal_places')})
    @staticmethod
    def CharField(**kw): return _Field('string', **{k: v for k, v in kw.items() if k != 'max_length'})
    @staticmethod
    def TextField(**kw): return _Field('string', long=True, **kw)
    @staticmethod
    def NullBooleanField(**kw): return _Field('bool', **kw)


class widgets:
    RadioSelect = 'RadioSelect'
    RadioSelectHorizontal = 'RadioSelectHorizontal'
    CheckboxInput = 'CheckboxInput'
    TextArea = 'TextArea'
    Slider = 'Slider'


# --- Models -------------------------------------------------------------------------------

# participant.vars and session.vars as Python has them, by owner: {key: {'owner', 'values'}}, so
# that what an app keeps there stays what it was (tuples, Currency, lists it appends to);
# _dirty: those read since they were last copied to jtree (flush_vars). 'seen' has each value as
# jtree had it then (JSON), so that one jtree's side changed since (a converted app's) is read again.
_vars_cache = {}
_dirty = set()


def _js_json(store, name):
    try:
        return JSON.stringify(getattr(store, name))
    except Exception:
        return None


def _vars_key(owner):
    session = js_get(owner, 'session')
    return ('participant', str(session.id), str(owner.id)) if session is not None else ('session', str(owner.id))


def flush_vars():
    """Copies the vars read since the last call to jtree's objects (what apps changed in them)."""
    for key in list(_dirty):
        entry = _vars_cache.get(key)
        if entry is not None:
            store = entry['owner'].vars
            for name, value in entry['values'].items():
                setattr(store, name, to_js_value(value))
                entry['seen'][name] = _js_json(store, name)
    _dirty.clear()


class _VarsDict:
    """participant.vars and session.vars: kept in Python (_vars_cache), and in a JS object of jtree's."""

    def __init__(self, owner):
        object.__setattr__(self, '_owner', owner)
        if js_get(owner, 'vars') is None:
            owner.vars = Object.new()
        key = _vars_key(owner)
        entry = _vars_cache.get(key)
        if entry is None:
            entry = _vars_cache[key] = {'owner': owner, 'values': {}, 'seen': {}}
        entry['owner'] = owner
        object.__setattr__(self, '_key', key)
        object.__setattr__(self, '_values', entry['values'])
        object.__setattr__(self, '_seen', entry['seen'])

    def _store(self):
        return self._owner.vars

    def __getitem__(self, key):
        store = self._store()
        if key not in self._values or _js_json(store, key) != self._seen.get(key):
            value = js_get(store, key)
            if value is None and not hasattr(store, key):
                self._values.pop(key, None)
                raise KeyError(key)
            self._values[key] = value
            self._seen[key] = _js_json(store, key)
        _dirty.add(self._key)
        return self._values[key]

    def __setitem__(self, key, value):
        self._values[key] = value
        setattr(self._store(), key, to_js_value(value))
        self._seen[key] = _js_json(self._store(), key)

    def __delitem__(self, key):
        self._values.pop(key, None)
        self._seen.pop(key, None)
        if hasattr(self._store(), key):
            delattr(self._store(), key)

    def __contains__(self, key):
        return hasattr(self._store(), key)

    def get(self, key, default=None):
        return self[key] if key in self else default

    def setdefault(self, key, default=None):
        if key not in self:
            self[key] = default
        return self[key]

    def pop(self, key, *default):
        if key in self:
            value = self[key]
            del self[key]
            return value
        if default:
            return default[0]
        raise KeyError(key)

    def update(self, other=(), **kw):
        for k, v in dict(other, **kw).items():
            self[k] = v

    def keys(self):
        return list(dict.fromkeys(list(Object.keys(self._store())) + list(self._values.keys())))

    def items(self):
        return [(k, self.get(k)) for k in self.keys()]

    def values(self):
        return [self.get(k) for k in self.keys()]

    def __iter__(self):
        return iter(self.keys())

    def __len__(self):
        return len(self.keys())

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

    def __getattribute__(self, name):
        # Fields are plain attributes in oTree, so apps may read them with self.__getattribute__(name).
        try:
            return object.__getattribute__(self, name)
        except AttributeError:
            if name.startswith('_'):
                raise
            return type(self).__getattr__(self, name)

    def __setattr__(self, name, value):
        cls = type(self)
        if isinstance(getattr(cls, name, None), property):
            object.__setattr__(self, name, value)
        elif name in cls._fields or name in cls._extra_settable:
            # A CurrencyField's value is a currency, rounded as oTree rounds it.
            if value is not None and name in cls._fields and cls._fields[name].kind == 'currency':
                value = Currency(value)
            setattr(self._js, name, to_js_value(value))
        else:
            raise AttributeError(f'{cls.__name__} has no field {name!r}')

    def field_display(self, name):
        """The field's value as shown: its choice's label, Yes or No, or the value."""
        field = type(self)._fields[name]
        value = getattr(self, name)
        choices = field.opts.get('choices')
        fn = getattr(self._app.mod, name + '_choices', None) if self._app is not None else None
        if callable(fn):
            choices = fn(self)
        for choice in choices or []:
            if isinstance(choice, (list, tuple)) and choice[0] == value:
                return choice[1]
        if field.kind == 'bool' and value is not None:
            return 'Yes' if value else 'No'
        return value

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
                _rng.shuffle(col)
            groups = [list(row) for row in zip(*columns)]
        else:
            players = [p for g in groups for p in g]
            _rng.shuffle(players)
            size = len(groups[0]) if groups else 0
            groups = [players[i:i + size] for i in range(0, len(players), size)]
        self.set_group_matrix(groups)

    def group_like_round(self, round_number):
        # The earlier round's players, by id_in_group: set_group_matrix places their participants.
        before = self.in_round(round_number)
        self.set_group_matrix([sorted(g.get_players(), key=lambda p: p.id_in_group) for g in before.get_groups()])

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
        # A currency, rounded as oTree rounds it.
        self._js.points = float(Currency(value if value is not None else 0))

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
        # As oTree's: the label a room (or the experimenter) gave the participant, else None.
        return js_get(self._js, 'label') or None

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

def _default(fn):
    """A page method's default (super().is_displayed() reaches it): not one the page has (jtree_otree)."""
    fn._jtree_default = True
    return fn


class Page:
    form_model = None
    form_fields = []
    timeout_seconds = None
    timer_text = None
    template_name = None

    # As oTree's own Page has them, for pages that call super().
    @_default
    def is_displayed(self, *args):
        return True

    @_default
    def vars_for_template(self, *args):
        return {}

    @_default
    def before_next_page(self, *args, **kw):
        return None


class WaitPage:
    wait_for_all_groups = False
    group_by_arrival_time = False
    after_all_players_arrive = None
    title_text = 'Please wait'
    body_text = 'Waiting for the other participants.'
    template_name = None


class _Link:
    def __init__(self, to):
        self.to = to


models.Link = staticmethod(lambda to: _Link(to))


def _session_js(obj):
    """The jtree Session of a model or wrapper."""
    js = obj._js
    if isinstance(obj, Session):
        return js
    if isinstance(obj, Participant):
        return js.session
    return js.session()


def _link_key(obj):
    if isinstance(obj, (Participant, Session)):
        return type(obj).__name__ + ':' + str(obj._js.id)
    return obj._key()


class ExtraModel:
    """oTree's extra tables (e.g. bids or offers), linked to players, groups, ... by models.Link.
    Rows are kept in the session (session.otreeExtra), each link as the id of what it links to."""

    _fields = {}
    _links = {}

    def __init_subclass__(cls, **kw):
        super().__init_subclass__(**kw)
        cls._fields, cls._links = {}, {}
        for name, value in list(vars(cls).items()):
            if isinstance(value, _Field):
                cls._fields[name] = value
                delattr(cls, name)
            elif isinstance(value, _Link):
                cls._links[name] = value
                delattr(cls, name)

    def __init__(self, row, session_js):
        object.__setattr__(self, '_row', row)
        object.__setattr__(self, '_session', session_js)

    @classmethod
    def _table(cls, session_js, create=False):
        key = cls.__module__.split('.')[0] + '.' + cls.__name__
        if js_get(session_js, 'otreeExtra') is None:
            session_js.otreeExtra = Object.new()
        rows = getattr(session_js.otreeExtra, key, None)
        if rows is None or str(rows) == 'undefined':
            rows = to_js([])
            setattr(session_js.otreeExtra, key, rows)
        return rows

    @classmethod
    def _session_of(cls, kw):
        for name in cls._links:
            if kw.get(name) is not None:
                return _session_js(kw[name])
        raise TypeError(f'{cls.__name__}: give one of its links ({", ".join(cls._links)})')

    @classmethod
    def create(cls, **kw):
        session_js = cls._session_of(kw)
        rows = cls._table(session_js)
        row = Object.new()
        ids = [r.id for r in rows]
        row.id = max(ids) + 1 if ids else 1
        for name, value in kw.items():
            if name in cls._links:
                setattr(row, name, _link_key(value) if value is not None else None)
            elif name in cls._fields:
                setattr(row, name, to_js_value(value))
            else:
                raise TypeError(f'{cls.__name__} has no field {name!r}')
        rows.push(row)
        return cls(row, session_js)

    @classmethod
    def filter(cls, **kw):
        session_js = cls._session_of(kw)
        out = []
        for row in cls._table(session_js):
            ok = True
            for name, value in kw.items():
                if name in cls._links:
                    ok = js_get(row, name) == (_link_key(value) if value is not None else None)
                elif name in cls._fields:
                    ok = js_get(row, name) == value
                else:
                    raise TypeError(f'{cls.__name__} has no field {name!r}')
                if not ok:
                    break
            if ok:
                out.append(cls(row, session_js))
        return out

    @classmethod
    def values_dicts(cls, **kw):
        return [dict(id=r.id, **{n: getattr(r, n) for n in cls._fields}) for r in cls.filter(**kw)]

    @property
    def id(self):
        return int(self._row.id)

    def delete(self):
        rows = type(self)._table(self._session)
        for i in range(len(list(rows))):
            if rows[i].id == self._row.id:
                rows.splice(i, 1)
                return

    def __getattr__(self, name):
        cls = type(self)
        if name in cls._fields:
            value = js_get(self._row, name)
            if value is not None and cls._fields[name].kind == 'currency':
                return Currency(value)
            return value
        if name in cls._links:
            key = js_get(self._row, name)
            if key is None:
                return None
            target = cls._links[name].to
            if key.startswith('Participant:'):
                return Participant(self._session.participants[key.split(':', 1)[1]])
            if key.startswith('Session:'):
                return Session(self._session)
            return target(self._session.objectByRoomId(key))
        raise AttributeError(f'{cls.__name__} has no field {name!r}')

    def __setattr__(self, name, value):
        cls = type(self)
        if name in cls._links:
            setattr(self._row, name, _link_key(value) if value is not None else None)
        elif name in cls._fields:
            if value is not None and cls._fields[name].kind == 'currency':
                value = Currency(value)
            setattr(self._row, name, to_js_value(value))
        else:
            raise AttributeError(f'{cls.__name__} has no field {name!r}')

    def __eq__(self, other):
        return type(self) is type(other) and self.id == other.id

    def __hash__(self):
        return hash((type(self).__name__, self.id))


class Bot:
    pass


class Submission:
    must_fail = False

    def __init__(self, page_class, post_data=None, check_html=True, timeout_happened=False):
        self.page_class = page_class
        self.post_data = post_data or {}
        self.check_html = check_html
        self.timeout_happened = timeout_happened


class SubmissionMustFail(Submission):
    must_fail = True


def currency_range(first, last, increment):
    values = []
    value = Currency(first)
    while value <= last:
        values.append(value)
        value = Currency(value + increment)
    return values


def expect(*args):
    if len(args) == 2:
        assert args[0] == args[1], f'expected {args[1]!r}, got {args[0]!r}'
    elif len(args) == 3:
        a, op, b = args
        ops = {'==': lambda: a == b, '!=': lambda: a != b, '<': lambda: a < b, '>': lambda: a > b,
               '<=': lambda: a <= b, '>=': lambda: a >= b, 'in': lambda: a in b, 'not in': lambda: a not in b}
        if op not in ops:
            raise ValueError(f'expect: unknown comparison {op!r}')
        assert ops[op](), f'expected {a!r} {op} {b!r}'


__all__ = ['Currency', 'cu', 'c', 'models', 'widgets', 'BaseConstants', 'BaseSubsession', 'BaseGroup',
           'BasePlayer', 'Page', 'WaitPage', 'ExtraModel', 'Bot', 'Submission', 'SubmissionMustFail', 'expect',
           'currency_range']
