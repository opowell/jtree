# An oTree project's settings, for jtree's tests: its apps are the folders next to this file.
from os import environ

SESSION_CONFIGS = [
    dict(
        name='trust_then_guess',
        display_name='Trust, then guess',
        app_sequence=['trust', 'guess'],
        num_demo_participants=2,
        bonus=3,
    ),
    dict(name='public_goods', app_sequence=['public_goods'], num_demo_participants=3),
    dict(name='gate', app_sequence=['gate', 'middle', 'final'], num_demo_participants=2),
]

SESSION_CONFIG_DEFAULTS = dict(
    real_world_currency_per_point=0.5, participation_fee=5.00, doc='A test project.'
)

PARTICIPANT_FIELDS = []
SESSION_FIELDS = []
LANGUAGE_CODE = 'en'
REAL_WORLD_CURRENCY_CODE = 'EUR'
USE_POINTS = True
SECRET_KEY = environ.get('OTREE_SECRET_KEY', 'test')
