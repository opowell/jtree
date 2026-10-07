"""The bridge between jtree and oTree apps: loads an app, describes it, and runs its functions
on jtree's objects. Called from dialects/otree/index.js; every js_* argument is a jtree object.
"""

import importlib
import json
import sys

from pyodide.ffi import to_js
from js import Object

from otree import api
import otree_template

PAGE_METHODS = ['is_displayed', 'vars_for_template', 'js_vars', 'before_next_page', 'get_timeout_seconds',
                'error_message', 'get_form_fields', 'live_method', 'app_after_this_page']
FIELD_CALLBACKS = ['min', 'max', 'choices', 'error_message']

_apps = {}


class AppInfo:
    """A loaded app: its modules, model classes and pages, in oTree's format (one __init__.py,
    no self) or its older one (models.py and pages.py, methods with self). Models reach it as
    cls._app."""

    def __init__(self, pkg, mod):
        self.pkg = pkg
        self.old = _has_module(pkg, 'models')
        if self.old:
            self.mod = importlib.import_module(pkg + '.models')
            pages = importlib.import_module(pkg + '.pages')
        else:
            self.mod = mod
            pages = mod
        self.Player = self.mod.Player
        self.Group = self.mod.Group
        self.Subsession = self.mod.Subsession
        self.C = getattr(self.mod, 'C', None) or getattr(self.mod, 'Constants', None)
        self.roles = [v for k, v in vars(self.C).items() if k.endswith('_ROLE')] if self.C else []
        for cls in (self.Player, self.Group, self.Subsession):
            cls._app = self
        self.page_sequence = list(getattr(pages, 'page_sequence', []))
        self.pages = {p.__name__: p for p in self.page_sequence}

    def model(self, kind, js):
        return {'player': self.Player, 'group': self.Group, 'subsession': self.Subsession}[kind](js)

    def const(self, name, default=None):
        """A constant, as C.NAME (or the older Constants.name)."""
        if self.C is None:
            return default
        return getattr(self.C, name, getattr(self.C, name.lower(), default))

    def callback(self, obj, field, cb):
        """The field's <field>_<cb> (min, max, choices, error_message) for obj: a function of the
        model, or (older format) the model's method; None if it has none."""
        if self.old:
            return getattr(obj, field + '_' + cb, None) if callable(getattr(type(obj), field + '_' + cb, None)) else None
        fn = getattr(self.mod, field + '_' + cb, None)
        return (lambda *args: fn(obj, *args)) if callable(fn) else None

    def has_callback(self, cls, field, cb):
        return callable(getattr(cls if self.old else self.mod, field + '_' + cb, None))

    def page_call(self, page, method, player, *args, timeout_happened=False):
        """page.method for player: method(player, *args); older pages' methods see self.player etc."""
        fn = getattr(page, method)
        if not self.old:
            return fn(player, *args)
        instance = page()
        _fill_view(instance, player, timeout_happened)
        return getattr(instance, method)(*args)

    def after_all_players_arrive(self, page, obj):
        fn = page.after_all_players_arrive
        if isinstance(fn, str):
            return getattr(obj, fn)() if self.old else getattr(self.mod, fn)(obj)
        if not self.old:
            return fn(obj)
        instance = page()
        instance.group = obj if isinstance(obj, api.BaseGroup) else None
        instance.subsession = obj if isinstance(obj, api.BaseSubsession) else obj.subsession
        instance.session = instance.subsession.session
        instance.round_number = instance.subsession.round_number
        return instance.after_all_players_arrive()

    def has_creating_session(self):
        if self.old:
            return callable(getattr(self.Subsession, 'creating_session', None))
        return callable(getattr(self.mod, 'creating_session', None))

    def creating_session(self, subsession):
        return subsession.creating_session() if self.old else self.mod.creating_session(subsession)

    def form_model(self, page):
        model = page.form_model or 'player'
        return model if isinstance(model, str) else model.__name__.lower()


def _fill_view(instance, player, timeout_happened=False):
    """What an older page's methods use: self.player, self.group, ..."""
    instance.player = player
    instance.group = player.group
    instance.subsession = player.subsession
    instance.participant = player.participant
    instance.session = player.session
    instance.round_number = player.round_number
    instance.timeout_happened = timeout_happened


def _has_module(pkg, name):
    import os
    return os.path.isfile('/apps/' + pkg + '/' + name + '.py')


def _json_value(value):
    if isinstance(value, api.Currency):
        return float(value)
    if isinstance(value, (bool, int, float, str)) or value is None:
        return value
    if isinstance(value, (list, tuple)):
        return [_json_value(v) for v in value]
    if isinstance(value, dict):
        return {str(k): _json_value(v) for k, v in value.items()}
    return str(value)


def load(pkg):
    """Imports (again) the app in package pkg; returns its description as JSON."""
    for name in [n for n in sys.modules if n == pkg or n.startswith(pkg + '.')]:
        del sys.modules[name]
    importlib.invalidate_caches()
    mod = importlib.import_module(pkg)
    info = AppInfo(pkg, mod)
    _apps[pkg] = info
    return json.dumps(describe(info))


def describe(info):
    mod, C = info.mod, info.C
    constants = {k: _json_value(v) for k, v in vars(C).items() if not k.startswith('_')} if C else {}
    fields = {}
    for kind, cls in (('player', info.Player), ('group', info.Group), ('subsession', info.Subsession)):
        fields[kind] = {}
        for name, schema in cls._schema().items():
            schema['callbacks'] = [cb for cb in FIELD_CALLBACKS if info.has_callback(cls, name, cb)]
            fields[kind][name] = schema
    pages = []
    for page in info.page_sequence:
        is_wait = issubclass(page, api.WaitPage)
        p = {
            'name': page.__name__,
            'kind': 'wait' if is_wait else 'page',
            'methods': [m for m in PAGE_METHODS if callable(getattr(page, m, None)) or
                        (m == 'live_method' and isinstance(getattr(page, m, None), str))],
        }
        if is_wait:
            p.update(wait_for_all_groups=bool(page.wait_for_all_groups),
                     group_by_arrival_time=bool(page.group_by_arrival_time),
                     after_all_players_arrive=page.after_all_players_arrive is not None,
                     title_text=str(page.title_text), body_text=str(page.body_text))
        else:
            p.update(form_model=info.form_model(page), form_fields=list(page.form_fields or []),
                     timeout_seconds=page.timeout_seconds)
        pages.append(p)
    return {
        'name': info.const('NAME_IN_URL'),
        'constants': constants,
        'num_rounds': info.const('NUM_ROUNDS', 1),
        'players_per_group': info.const('PLAYERS_PER_GROUP'),
        'roles': info.roles,
        'fields': fields,
        'pages': pages,
        'creating_session': info.has_creating_session(),
        'doc': (getattr(mod, 'doc', None) or mod.__doc__ or '').strip(),
        'format': 'older' if info.old else 'no-self',
    }


def _js(value):
    return to_js(_json_value(value), dict_converter=Object.fromEntries)


def creating_session(pkg, js_period):
    info = _apps[pkg]
    info.creating_session(info.Subsession(js_period))


def after_all_players_arrive(pkg, page_name, js_obj, level):
    """A wait page's after_all_players_arrive, for a group (level 'group') or for all of them ('subsession')."""
    info = _apps[pkg]
    info.after_all_players_arrive(info.pages[page_name], info.model(level, js_obj))


def call_page(pkg, page_name, method, js_player, *args):
    """page.method(player, *args); the result as a JS value. For before_next_page, the first of
    args is timeout_happened (older pages see it as self.timeout_happened)."""
    info = _apps[pkg]
    player = info.Player(js_player)
    if method == 'before_next_page':
        timeout = bool(args[0]) if args else False
        return _js(info.page_call(info.pages[page_name], method, player, *([] if info.old else [timeout]),
                                  timeout_happened=timeout))
    return _js(info.page_call(info.pages[page_name], method, player, *args))


def field_callback(pkg, model, field, callback, js_player):
    """The app's <field>_<callback>(player) (min, max or choices); for a group field, of the player's group."""
    info = _apps[pkg]
    obj = info.Player(js_player) if model == 'player' else info.Group(js_player.group)
    return _js(info.callback(obj, field, callback)())


def validate(pkg, page_name, js_player, js_values):
    """Field <name>_error_message(player, value) checks, then the page's error_message(player, values).
    js_values: the form's checked values by full name ('player.x'). Returns messages by full name
    ('' for the page), or None."""
    info = _apps[pkg]
    page = info.pages[page_name]
    player = info.Player(js_player)
    values = {}
    for full, value in js_values.to_py().items():
        values[full.split('.', 1)[1]] = value
    model = info.form_model(page)
    obj = player if model == 'player' else player.group
    errors = {}
    for name, value in values.items():
        fn = info.callback(obj, name, 'error_message')
        if fn is not None:
            message = fn(value)
            if message:
                errors[model + '.' + name] = str(message)
    if not errors and callable(getattr(page, 'error_message', None)):
        result = info.page_call(page, 'error_message', player, values)
        if isinstance(result, dict):
            errors.update({model + '.' + k: str(v) for k, v in result.items() if v})
        elif result:
            errors[''] = str(result)
    return _js(errors) if errors else None


# --- Pages' templates ---------------------------------------------------------------------

def _read(pkg, name):
    """The text of template name: in the app's folder (or its templates/ folders), or in its
    project's _templates; or None."""
    import os
    base = '/apps/' + pkg
    paths = [os.path.join(base, name), os.path.join(base, 'templates', name)]
    if os.path.isdir(base + '/templates'):
        paths += [os.path.join(base, 'templates', d, name) for d in os.listdir(base + '/templates')]
    paths.append(os.path.join(base, '_project_templates', name))
    for path in paths:
        if os.path.isfile(path):
            with open(path, encoding='utf-8') as f:
                return f.read()
    return None


def _form(info, page, player):
    """The page's form fields, as the template renderer describes them."""
    model = info.form_model(page)
    obj = player if model == 'player' else player.group
    cls = type(obj)
    names = info.page_call(page, 'get_form_fields', player) if callable(getattr(page, 'get_form_fields', None)) else (page.form_fields or [])
    out = []
    for name in names:
        field = cls._fields[name]
        opts = field.opts
        f = {'name': name, 'full': model + '.' + name, 'type': 'number' if field.kind == 'currency' else field.kind,
             'label': opts.get('label'), 'widget': opts.get('widget'), 'long': opts.get('long', False),
             'choices': opts.get('choices'), 'min': opts.get('min'), 'max': opts.get('max')}
        for cb in ('choices', 'min', 'max'):
            fn = info.callback(obj, name, cb)
            if fn is not None:
                f[cb] = fn()
        for k in ('min', 'max'):
            if f[k] is not None:
                value = _json_value(f[k])
                # 100, not 100.0 (a currency's float), in the page's input.
                f[k] = int(value) if isinstance(value, float) and value.is_integer() else value
        out.append(f)
    return out


def render(pkg, page_name, js_player, static_url='/static/'):
    """The HTML of the page for the player: its template, with player, group, subsession,
    participant, session, C and what vars_for_template gives."""
    info = _apps[pkg]
    page = info.pages[page_name]
    player = info.Player(js_player)
    context = {'player': player, 'group': player.group, 'subsession': player.subsession,
               'participant': player.participant, 'session': player.session, 'C': info.C, 'Constants': info.C}
    if callable(getattr(page, 'vars_for_template', None)):
        context.update(info.page_call(page, 'vars_for_template', player) or {})
    text = _read(pkg, page.template_name or page_name + '.html')
    if text is None:
        text = '{{ block title }}' + page_name + '{{ endblock }}{{ block content }}{{ formfields }}{{ next_button }}{{ endblock }}'
    chats = {}

    def chat(channel, nickname):
        # oTree's default: the player's group in this round; a channel given is the app's.
        key = info.Player.__module__.split('.')[0] + '/' + (
            f'{player.round_number}-{player.group.id_in_subsession}' if channel is None else str(channel))
        name = str(nickname) if nickname is not None else f'Player {player.id_in_group}'
        chats[key] = name
        return key, name

    renderer = otree_template.Renderer(lambda name: _read(pkg, name), _form(info, page, player), static_url, chat)
    html = _timer(page, player) + renderer.render(text, context)
    # The chats on the page, and the player's nickname in each (see dialects/otree/index.js).
    js_player.otreeChats = _js(chats)
    return html


def _timer(page, player):
    """oTree's countdown for a page with a timeout; otree.js counts it down."""
    info = player._app
    seconds = info.page_call(page, 'get_timeout_seconds', player) if callable(getattr(page, 'get_timeout_seconds', None)) else page.timeout_seconds
    if not seconds:
        return ''
    text = page.timer_text or 'Time left to complete this page:'
    return ('<div class="otree-timer alert alert-warning">' + otree_template.escape(text) +
            ' <span class="otree-timer__time-left" data-seconds="' + str(int(seconds)) + '"></span></div>')



# --- Projects -----------------------------------------------------------------------------

def _settings(settings_dir):
    """The settings module of the oTree project whose settings.py was put in settings_dir."""
    import importlib.util
    path = settings_dir + '/settings.py'
    spec = importlib.util.spec_from_file_location('otree_settings_' + str(abs(hash(settings_dir))), path)
    settings = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(settings)
    return settings


def project_rooms(settings_dir):
    """The project's ROOMS, as JSON: [{name, display_name, participant_label_file}]."""
    return json.dumps(_json_value(list(getattr(_settings(settings_dir), 'ROOMS', []) or [])))


def session_configs(settings_dir):
    """The SESSION_CONFIGS of the oTree project whose settings.py was put in settings_dir (in
    Python's file system), each merged with SESSION_CONFIG_DEFAULTS, as JSON."""
    settings = _settings(settings_dir)
    defaults = dict(getattr(settings, 'SESSION_CONFIG_DEFAULTS', {}) or {})
    out = []
    for config in getattr(settings, 'SESSION_CONFIGS', []) or []:
        merged = dict(defaults)
        merged.update(config)
        out.append(_json_value(merged))
    return json.dumps(out)


# --- Live pages ---------------------------------------------------------------------------

def live(pkg, page_name, js_player, js_data):
    """The page's live_method(player, data): what to send to whom, as [[id_in_group, data]]
    (0 for the whole group), or None."""
    info = _apps[pkg]
    fn = info.pages[page_name].live_method
    player = info.Player(js_player)
    data = js_data.to_py() if hasattr(js_data, 'to_py') else js_data
    if isinstance(fn, str):
        # A function of the module, or (older format) the player's method.
        result = getattr(player, fn)(data) if info.old else getattr(info.mod, fn)(player, data)
    else:
        result = fn(player, data)
    if result is None:
        return None
    if not isinstance(result, dict):
        raise TypeError('live_method should return a dict, of id_in_group (0 for everyone) to data')
    return _js([[int(k), v] for k, v in result.items()])


def js_vars(pkg, page_name, js_player):
    """The page's js_vars(player), for its scripts as js_vars; or None."""
    info = _apps[pkg]
    page = info.pages[page_name]
    if not callable(getattr(page, 'js_vars', None)):
        return None
    return _js(info.page_call(page, 'js_vars', info.Player(js_player)) or {})


# --- Bots (tests.py) ----------------------------------------------------------------------

_bots = {}
_next_bot = [0]


def has_bots(pkg):
    """Whether the app has bots: a tests.py with a PlayerBot."""
    try:
        tests = importlib.import_module(pkg + '.tests')
    except ModuleNotFoundError:
        return False
    return hasattr(tests, 'PlayerBot')


def bot_start(pkg, js_player, case_index):
    """Starts the app's PlayerBot for a player's round; returns its handle."""
    info = _apps[pkg]
    tests = importlib.import_module(pkg + '.tests')
    cls = tests.PlayerBot
    bot = cls.__new__(cls)
    player = info.Player(js_player)
    bot.player = player
    bot.group = player.group
    bot.subsession = player.subsession
    bot.participant = player.participant
    bot.session = player.session
    bot.round_number = player.round_number
    cases = getattr(cls, 'cases', None)
    bot.case = cases[case_index % len(cases)] if cases else None
    steps = bot.play_round()
    _next_bot[0] += 1
    handle = _next_bot[0]
    _bots[handle] = steps if steps is not None else iter(())
    return handle


def bot_next(handle, html=None):
    """The bot's next step, as JSON: {page, data, timeout_happened, must_fail}; or None when it
    has done its round. html: the page its player is on now, for the bot's checks (self.html)."""
    steps = _bots[handle]
    bot = getattr(steps, 'gi_frame', None) and steps.gi_frame.f_locals.get('self')
    if bot is not None:
        bot.html = html or ''
    try:
        step = next(steps)
    except StopIteration:
        del _bots[handle]
        return None
    must_fail = False
    check_html = True
    if isinstance(step, api.Submission):
        page, data, timeout, must_fail = step.page_class, step.post_data, step.timeout_happened, step.must_fail
        check_html = step.check_html
    elif isinstance(step, (tuple, list)):
        page, data, timeout = step[0], (step[1] if len(step) > 1 else {}), False
    else:
        page, data, timeout = step, {}, False
    return json.dumps({'page': page.__name__, 'data': _json_value(dict(data or {})), 'timeout_happened': bool(timeout),
                       'must_fail': must_fail, 'check_html': bool(check_html)})


# --- Exports ------------------------------------------------------------------------------

def has_custom_export(pkg):
    return callable(getattr(_apps[pkg].mod, 'custom_export', None))


def custom_export(pkg, js_app):
    """The rows of the app's custom_export(players), for all its players in a session (js_app:
    the session's jtree App), as JSON."""
    info = _apps[pkg]
    players = [info.Player(p) for period in js_app.periods if period is not None
               for g in period.groups for p in g.players]
    return json.dumps([[_json_value(v) for v in row] for row in info.mod.custom_export(players)])


# --- Admin reports ------------------------------------------------------------------------

def has_admin_report(pkg):
    """Whether the app has an admin report: an admin_report.html template."""
    return _read(pkg, 'admin_report.html') is not None


def admin_report(pkg, js_period, static_url='/static/'):
    """The app's admin report for a round (js_period: a jtree Period): admin_report.html, with
    subsession, session, C and what vars_for_admin_report(subsession) gives."""
    info = _apps[pkg]
    subsession = info.Subsession(js_period)
    context = {'subsession': subsession, 'session': subsession.session, 'C': info.C, 'Constants': info.C}
    if info.old:
        fn = getattr(subsession, 'vars_for_admin_report', None)
        if callable(fn):
            context.update(fn() or {})
    else:
        fn = getattr(info.mod, 'vars_for_admin_report', None)
        if callable(fn):
            context.update(fn(subsession) or {})
    renderer = otree_template.Renderer(lambda name: _read(pkg, name), [], static_url)
    return renderer.render_plain(_read(pkg, 'admin_report.html'), context)

