from os import environ

# if you set a property in SESSION_CONFIG_DEFAULTS, it will be inherited by all configs
# in SESSION_CONFIGS, except those that explicitly override it.
# the session config can be accessed from methods in your apps as self.session.config,
# e.g. self.session.config['participation_fee']

SESSION_CONFIG_DEFAULTS = {
    'real_world_currency_per_point': 1.00,
    'participation_fee': 1.30,
    'doc': "",
}

SESSION_CONFIGS = [
    {
        'name': 'many_labs',
        'display_name': "Questions",
        'num_demo_participants': 2,
        'app_sequence': ['many_labs'],
    },
    {
        'name': 'many_labs_comp',
        'display_name': "Questions_comp",
        'num_demo_participants': 2,
        'app_sequence': ['many_labs_comp'],
    },
]


# ISO-639 code
# for example: de, fr, ja, ko, zh-hans
LANGUAGE_CODE = 'en'

# e.g. EUR, GBP, CNY, JPY
REAL_WORLD_CURRENCY_CODE = 'GBP'
USE_POINTS = False

ROOMS = [

    {
        'name': 'live_demo_c',
        'display_name': 'Room for live demo of the experiment-c',
    },
    {
        'name': 'live_demo_nc',
        'display_name': 'Room for live demo of the experiment-nc',
    },
]


ADMIN_USERNAME = 'admin'
# for security, best to set admin password in an environment variable
ADMIN_PASSWORD = 'redacted'

DEMO_PAGE_INTRO_HTML = """ """

SECRET_KEY = 'redacted'

# if an app is included in SESSION_CONFIGS, you don't need to list it here
INSTALLED_APPS = ['otree']
