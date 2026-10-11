from os import environ

SESSION_CONFIGS = [
    dict(
        name='individual_treatment',
        display_name="#ManyDesigns NO COMPETITION",
        app_sequence=['prolific_id', 'welcome', 'production_task_instructions', 'production_task_start',
        'production_task', 'perception_task', 'survey_goodbye'],
        num_demo_participants=3,
        use_browser_bots = False
    ),
    dict(
        name='competition_treatment',
        display_name="#ManyDesigns COMPETITION",
        app_sequence=['prolific_id', 'welcome_competition', 'production_task_instructions', 'production_task_start',
        'production_task', 'perception_task', 'survey_goodbye'],
        num_demo_participants=3,
        use_browser_bots = False
    ),
]

# if you set a property in SESSION_CONFIG_DEFAULTS, it will be inherited by all configs
# in SESSION_CONFIGS, except those that explicitly override it.
# the session config can be accessed from methods in your apps as self.session.config,
# e.g. self.session.config['participation_fee']

SESSION_CONFIG_DEFAULTS = dict(
    real_world_currency_per_point=1.00, participation_fee=0.00, doc=""
)

PARTICIPANT_FIELDS = ['expiry', 'production_task_points', 'dot_points', 'grid_id']
SESSION_FIELDS = ['visual_grid_iterator', 'competition_treatment']

# ISO-639 code
# for example: de, fr, ja, ko, zh-hans
LANGUAGE_CODE = 'en'

# e.g. EUR, GBP, CNY, JPY
REAL_WORLD_CURRENCY_CODE = 'USD'
USE_POINTS = True

ROOMS = [
    dict(
        name='econ101',
        display_name='Econ 101 class',
        participant_label_file='_rooms/econ101.txt',
    ),
    dict(name='live_demo', display_name='Room for live demo (no participant labels)'),
]

ADMIN_USERNAME = 'admin'
# for security, best to set admin password in an environment variable
ADMIN_PASSWORD = environ.get('OTREE_ADMIN_PASSWORD')

DEMO_PAGE_INTRO_HTML = """
Here are some oTree games.
"""


SECRET_KEY = 'redacted'

INSTALLED_APPS = ['otree']
