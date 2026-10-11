from os import environ

SESSION_CONFIGS = [
    dict(
        name='senior_vs_junior_Juniors_Competition',
        app_sequence=['senior_vs_junior'],
        num_demo_participants=4,
        control=True
    ),
    dict(
        name='senior_vs_junior_All_Competition',
        app_sequence=['senior_vs_junior'],
        num_demo_participants=4,
        control=False
    ),
]

# if you set a property in SESSION_CONFIG_DEFAULTS, it will be inherited by all configs
# in SESSION_CONFIGS, except those that explicitly override it.
# the session config can be accessed from methods in your apps as self.session.config,
# e.g. self.session.config['participation_fee']

SESSION_CONFIG_DEFAULTS = dict(
    real_world_currency_per_point=1.00, participation_fee=1.30, doc=""
)

PARTICIPANT_FIELDS = ['is_senior', 'take', 'score', 'control', 'expiry', 'victory', 'pID']
SESSION_FIELDS = []

# ISO-639 code
# for example: de, fr, ja, ko, zh-hans
LANGUAGE_CODE = 'en'

# e.g. EUR, GBP, CNY, JPY
REAL_WORLD_CURRENCY_CODE = 'GBP'
USE_POINTS = False

ADMIN_USERNAME = 'koczka'
# for security, best to set admin password in an environment variable
ADMIN_PASSWORD = environ.get('OTREE_ADMIN_PASSWORD')

DEMO_PAGE_INTRO_HTML = """ """

SECRET_KEY = 'redacted'
