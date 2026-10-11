"""
oTree's otree.settings, as apps read it (settings.DEBUG, settings.USE_POINTS): what the project's
settings.py has (project_settings, set when its session configs are read), else oTree's defaults.
"""

project_settings = None

# Currencies oTree shows without cents (otree/settings.py).
_WHOLE_CURRENCIES = ['KRW', 'JPY', 'HUF', 'IRR', 'COP', 'VND', 'IDR']


def _default(name):
    if name == 'REAL_WORLD_CURRENCY_DECIMAL_PLACES':
        return 0 if __getattr__('REAL_WORLD_CURRENCY_CODE') in _WHOLE_CURRENCIES else 2
    return {
        'DEBUG': False,
        'LANGUAGE_CODE': 'en',
        'REAL_WORLD_CURRENCY_CODE': 'USD',
        'USE_POINTS': True,
        'POINTS_DECIMAL_PLACES': 0,
        'PARTICIPANT_FIELDS': [],
        'SESSION_FIELDS': [],
    }[name]


def __getattr__(name):
    if project_settings is not None and hasattr(project_settings, name):
        return getattr(project_settings, name)
    try:
        return _default(name)
    except KeyError:
        raise AttributeError(name) from None
