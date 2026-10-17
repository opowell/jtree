from os import environ

# jtree's samples library: each game as an oTree app, with a session config of its own.
# The same games, in jtree's and z-Tree's formats, are in ../jtree and ../ztree.

SESSION_CONFIGS = [
    dict(name='dictator', display_name='Dictator game', app_sequence=['dictator'], num_demo_participants=2),
    dict(name='ultimatum', display_name='Ultimatum game', app_sequence=['ultimatum'], num_demo_participants=2),
    dict(name='trust', display_name='Trust game', app_sequence=['trust'], num_demo_participants=2),
    dict(name='bargaining', display_name='Bargaining (Nash demand game)', app_sequence=['bargaining'], num_demo_participants=2),
    dict(name='public_goods', display_name='Public goods game', app_sequence=['public_goods'], num_demo_participants=4),
    dict(name='public_goods_punishment', display_name='Public goods game with punishment', app_sequence=['public_goods_punishment'], num_demo_participants=4),
    dict(name='prisoners_dilemma', display_name="Prisoner's dilemma", app_sequence=['prisoners_dilemma'], num_demo_participants=2),
    dict(name='volunteers_dilemma', display_name="Volunteer's dilemma", app_sequence=['volunteers_dilemma'], num_demo_participants=3),
    dict(name='travelers_dilemma', display_name="Traveler's dilemma", app_sequence=['travelers_dilemma'], num_demo_participants=2),
    dict(name='stag_hunt', display_name='Stag hunt', app_sequence=['stag_hunt'], num_demo_participants=2),
    dict(name='battle_of_the_sexes', display_name='Battle of the sexes', app_sequence=['battle_of_the_sexes'], num_demo_participants=2),
    dict(name='matching_pennies', display_name='Matching pennies', app_sequence=['matching_pennies'], num_demo_participants=2),
    dict(name='beauty_contest', display_name='Beauty contest (guess 2/3 of the average)', app_sequence=['beauty_contest'], num_demo_participants=3),
    dict(name='market_entry', display_name='Market entry', app_sequence=['market_entry'], num_demo_participants=4, outside_option=10, capacity=2),
    dict(name='centipede', display_name='Centipede game', app_sequence=['centipede'], num_demo_participants=2),
    dict(name='cournot', display_name='Cournot competition', app_sequence=['cournot'], num_demo_participants=2),
    dict(name='bertrand', display_name='Bertrand competition', app_sequence=['bertrand'], num_demo_participants=2),
    dict(name='common_value_auction', display_name='Common value auction', app_sequence=['common_value_auction'], num_demo_participants=3),
    dict(name='dutch_auction', display_name='Dutch auction', app_sequence=['dutch_auction'], num_demo_participants=3),
    dict(name='double_auction', display_name='Double auction', app_sequence=['double_auction'], num_demo_participants=8),
    dict(name='asset_market', display_name='Asset market', app_sequence=['asset_market'], num_demo_participants=4),
    dict(name='real_effort', display_name='Real-effort task (sums)', app_sequence=['real_effort'], num_demo_participants=1, work_time=60),
    dict(name='survey', display_name='Survey', app_sequence=['survey'], num_demo_participants=1),
]

SESSION_CONFIG_DEFAULTS = dict(real_world_currency_per_point=1.00, participation_fee=0.00, doc="")

PARTICIPANT_FIELDS = []
SESSION_FIELDS = []

LANGUAGE_CODE = 'en'
REAL_WORLD_CURRENCY_CODE = 'USD'
USE_POINTS = True
# Payoffs such as 37.5 kept as they are (oTree's default rounds points to whole numbers), as jtree
# and z-Tree keep them.
POINTS_DECIMAL_PLACES = 2

ADMIN_USERNAME = 'admin'
# For security, set the admin password in an environment variable.
ADMIN_PASSWORD = environ.get('OTREE_ADMIN_PASSWORD')

DEMO_PAGE_INTRO_HTML = """
jtree's samples library: economics experiments, each also written for jtree and for z-Tree.
"""

SECRET_KEY = 'jtree-samples'

INSTALLED_APPS = ['otree']
