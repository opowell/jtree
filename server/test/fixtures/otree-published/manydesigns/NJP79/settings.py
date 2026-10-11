from os import environ
SESSION_CONFIG_DEFAULTS = dict(real_world_currency_per_point=1, participation_fee=0)
SESSION_CONFIGS = [dict(name='ManyDesigns_Competition', num_demo_participants=8, app_sequence=['ManyDesigns_Instructions_Competition', 'ManyDesigns_Game_Competition'], participation_fee=1.3), dict(name='ManyDesigns_Control', num_demo_participants=8, app_sequence=['ManyDesigns_Instructions_Control', 'ManyDesigns_Game_Control'], participation_fee=1.3)]
LANGUAGE_CODE = 'en'
REAL_WORLD_CURRENCY_CODE = 'GBP'
USE_POINTS = False
DEMO_PAGE_INTRO_HTML = ''
PARTICIPANT_FIELDS = ['currency_range(cu(0), cu(5), cu(0.1))']
SESSION_FIELDS = []
ROOMS = [dict(name='ManyDesigns_Competition', display_name='ManyDesigns Competition'), dict(name='ManyDesigns_Control', display_name='ManyDesigns Control')]

ADMIN_USERNAME = 'admin'
# for security, best to set admin password in an environment variable
ADMIN_PASSWORD = environ.get('OTREE_ADMIN_PASSWORD')

SECRET_KEY = 'redacted'

# if an app is included in SESSION_CONFIGS, you don't need to list it here
INSTALLED_APPS = ['otree']


