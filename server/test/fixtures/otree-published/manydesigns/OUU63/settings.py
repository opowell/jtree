from os import environ

SESSION_CONFIGS = [
     dict(
         name='manydesings_base',
         app_sequence=['promises', 'tournament', 'randomdictator'],
         num_demo_participants=4,
         treatment=0,
         force_solve=False
     ),
     dict(
         name='manydesings_comp',
         app_sequence=['promises', 'tournament', 'randomdictator'],
         num_demo_participants=4,
         treatment=1,
         force_solve=False
     )
]

# if you set a property in SESSION_CONFIG_DEFAULTS, it will be inherited by all configs
# in SESSION_CONFIGS, except those that explicitly override it.
# the session config can be accessed from methods in your apps as self.session.config,
# e.g. self.session.config['participation_fee']

SESSION_CONFIG_DEFAULTS = dict(
    real_world_currency_per_point=0.05, participation_fee=1.30, doc=""
)

PARTICIPANT_FIELDS = ['promise', 'treatment', 'finished', 'prolific_id', 'stage2pay', 'id_aux']
SESSION_FIELDS = ['prolific_completion_url']

# ISO-639 code
# for example: de, fr, ja, ko, zh-hans
LANGUAGE_CODE = 'en'

# e.g. EUR, GBP, CNY, JPY
REAL_WORLD_CURRENCY_CODE = 'GBP'
USE_POINTS = True

ROOMS = [dict(
        name='RB',
        display_name='MDB'
    ),
    dict(
        name='RC',
        display_name='MDC'
    )
]

ADMIN_USERNAME = 'admin'
# for security, best to set admin password in an environment variable
ADMIN_PASSWORD = environ.get('OTREE_ADMIN_PASSWORD')

DEMO_PAGE_INTRO_HTML = """ """

SECRET_KEY = 'redacted'
