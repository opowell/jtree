"""
oTree's otree.settings, as apps read it (settings.DEBUG): oTree's defaults, else what the project's
settings.py has (jtree_otree.project_settings, set when its session configs are read).
"""
DEBUG = False
LANGUAGE_CODE = 'en'
REAL_WORLD_CURRENCY_CODE = 'USD'
USE_POINTS = True
POINTS_DECIMAL_PLACES = 0
REAL_WORLD_CURRENCY_DECIMAL_PLACES = 2

project_settings = None


def __getattr__(name):
    if project_settings is not None and hasattr(project_settings, name):
        return getattr(project_settings, name)
    raise AttributeError(name)
