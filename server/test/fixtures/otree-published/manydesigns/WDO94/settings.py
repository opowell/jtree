from os import environ

SESSION_CONFIGS = [
    dict(
        name='no_competition',
        display_name="No Competition",
        num_demo_participants=2,
        app_sequence=['content']
    ),
    dict(
        name='competition',
        display_name="Competition",
        num_demo_participants=2,
        app_sequence=['content2']
    ),
]

# if you set a property in SESSION_CONFIG_DEFAULTS, it will be inherited by all configs
# in SESSION_CONFIGS, except those that explicitly override it.
# the session config can be accessed from methods in your apps as self.session.config,
# e.g. self.session.config['participation_fee']

SESSION_CONFIG_DEFAULTS = dict(
    real_world_currency_per_point=0.01, participation_fee=1.30, doc=""
)

# ISO-639 code
# for example: de, fr, ja, ko, zh-hans
LANGUAGE_CODE = 'en'

# e.g. EUR, GBP, CNY, JPY
REAL_WORLD_CURRENCY_CODE = 'GBP'
USE_POINTS = False

ROOMS = [
    dict(
        name='koeln',
        display_name='Lab in Köln',
        participant_label_file='_rooms/koeln.txt',
    )
]

ADMIN_USERNAME = 'admin'
# for security, best to set admin password in an environment variable
ADMIN_PASSWORD = environ.get('OTREE_ADMIN_PASSWORD')

DEMO_PAGE_INTRO_HTML = ""

# don't share this with anybody.
SECRET_KEY = 'redacted'

INSTALLED_APPS = ['otree']
