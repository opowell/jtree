# A minimal otree.api for the spike: model classes whose instances hold no state, with every
# field read and write going to a JS object (jtree's Player/Group), and the field declarations
# collected as a schema for jtree.

class _Field:
    def __init__(self, kind, **opts):
        self.kind = kind
        self.opts = opts

class models:
    @staticmethod
    def IntegerField(**kw): return _Field('int', **kw)
    @staticmethod
    def FloatField(**kw): return _Field('float', **kw)
    @staticmethod
    def CurrencyField(**kw): return _Field('currency', **kw)
    @staticmethod
    def StringField(**kw): return _Field('string', **kw)
    @staticmethod
    def BooleanField(**kw): return _Field('bool', **kw)

class Currency(float):
    def __repr__(self): return f'cu({float(self)})'
cu = Currency

class _Model:
    _fields = {}

    def __init_subclass__(cls, **kw):
        super().__init_subclass__(**kw)
        cls._fields = {k: v for k, v in vars(cls).items() if isinstance(v, _Field)}
        for k in cls._fields:
            delattr(cls, k)

    def __init__(self, js):
        object.__setattr__(self, '_js', js)

    def __getattr__(self, name):
        # Only called for names not found normally: a field, read from the JS object.
        value = getattr(self._js, name)
        return value

    def __setattr__(self, name, value):
        if name not in type(self)._fields and name not in ('payoff',):
            raise AttributeError(f'{type(self).__name__} has no field {name!r}')
        setattr(self._js, name, value)

    @classmethod
    def schema(cls):
        return {k: dict(kind=f.kind, **f.opts) for k, f in cls._fields.items()}

class BaseConstants: pass
class BaseSubsession(_Model): pass

class BaseGroup(_Model):
    def get_players(self):
        return [self._player_cls(p) for p in self._js.players]

class BasePlayer(_Model):
    @property
    def group(self):
        return self._group_cls(self._js.group)

class Page: pass
class WaitPage: pass
