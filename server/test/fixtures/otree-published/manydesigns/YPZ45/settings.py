from os import environ

SESSION_CONFIGS = [

    dict(
        name='TRA',
        app_sequence=['prolific_id', 'slider_instructions', 'payment_instructions', 'compqs', 'new_slider', 'completion_code'],
        num_demo_participants=1,
    ),

    dict(
        name='TR1',
        app_sequence=['prolific_id', 'slider_instructions', 'payment_instructions', 'compqs', 'new_slider', 'completion_code'],
        num_demo_participants=1,
    ),

    dict(
        name='slider_test',
        app_sequence=['new_slider'],
        num_demo_participants=1,
    )

]

ROOMS = [
    dict(
        name='TRA',
        display_name='TRA',
    ),
    dict(
        name='TR1',
        display_name='TR1'
    ),
]

# if you set a property in SESSION_CONFIG_DEFAULTS, it will be inherited by all configs
# in SESSION_CONFIGS, except those that explicitly override it.
# the session config can be accessed from methods in your apps as self.session.config,
# e.g. self.session.config['participation_fee']

SESSION_CONFIG_DEFAULTS = dict(
    real_world_currency_per_point=1.00, participation_fee=0.00, doc=""
)

PARTICIPANT_FIELDS = ['treatment']
SESSION_FIELDS = []

# ISO-639 code
# for example: de, fr, ja, ko, zh-hans
LANGUAGE_CODE = 'en'

# e.g. EUR, GBP, CNY, JPY
REAL_WORLD_CURRENCY_CODE = 'USD'
USE_POINTS = True

ADMIN_USERNAME = 'admin'
# for security, best to set admin password in an environment variable
ADMIN_PASSWORD = 'redacted'

DEMO_PAGE_INTRO_HTML = """ """

OTREE_AUTH_LEVEL = 'STUDY'

SECRET_KEY = 'redacted'
