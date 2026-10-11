from os import environ

# if you set a property in SESSION_CONFIG_DEFAULTS, it will be inherited by all configs
# in SESSION_CONFIGS, except those that explicitly override it.
# the session config can be accessed from methods in your apps as self.session.config,
# e.g. self.session.config['participation_fee']

EXTENSION_APPS = []

SESSION_CONFIG_DEFAULTS = {
    'real_world_currency_per_point': 1/100,
    'participation_fee': 1.30,
    'doc': "",
}

SESSION_CONFIGS = [
    {
        'name': 'PKY70_control',
        'display_name': "Control condition",
        'num_demo_participants': 2,
        'app_sequence': ['instructions', 'tasks_control', 'survey', 'payment_info'],
    },
    {
        'name': 'PKY70_treatment',
        'display_name': "Treatment condition",
        'num_demo_participants': 2,
        'app_sequence': ['instructions', 'tasks_treatment', 'survey', 'payment_info'],
    },
]
# PARTICIPANT LEVEL VARIABLES
PARTICIPANT_FIELDS = ['rank_playerA', 'rank_playerB', 'bonus_payoff', 'is_dropout', 'keep_earnings', 'rand',
                      'group_keep', 'group_dropouts']

# ISO-639 code
# for example: de, fr, ja, ko, zh-hans
LANGUAGE_CODE = 'en'

# e.g. EUR, GBP, CNY, JPY
REAL_WORLD_CURRENCY_CODE = 'GBP'
USE_POINTS = True
POINTS_CUSTOM_NAME = 'tokens'
USE_THOUSAND_SEPARATOR = True

ROOMS = [
    {
        'name': 'PKY70_room1',
        'display_name': "PKY70: Room 1",
    },
    {
        'name': 'PKY70_room2',
        'display_name': "PKY70: Room 2",
    },
]

ADMIN_USERNAME = 'PKY70'
# for security, best to set admin password in an environment variable

OTREE_REST_KEY = 'htK!LDY3@APNyeX$'

DEMO_PAGE_INTRO_HTML = """ Welcome to the demo page of our experiment. """

SECRET_KEY = 'redacted'

# if an app is included in SESSION_CONFIGS, you don't need to list it here
INSTALLED_APPS = ['otree']
