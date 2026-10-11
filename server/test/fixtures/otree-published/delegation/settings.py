from os import environ

SESSION_CONFIG_DEFAULTS = {
    'real_world_currency_per_point': 1.00,
    'participation_fee': 100.00,
    'doc': "",
}

SESSION_CONFIGS = [
    {
        'name': 'FP',
        'display_name': 'Online Experiment - Part I - Financial Professionals',
        'use_browser_bots': False,
        'num_demo_participants': 1,
        'subject_pool': 'FP',
        'random_allocation': True,
        'treatment': '',
        'app_sequence': [
            't0_int',
            't1_adt2',
            't2_adt5',
            't4_survey',
            't5_num',
            't6_lit',
            't7_final'
        ],
        'doc': """
            sample: financial professionals;
            treatments: 'opm_flat', 'opm_lin', 'own_lin';
            treatment allocation: random;
        """
    },
    {
        'name': 'GP',
        'display_name': 'Online Experiment - Part I - General Population',
        'use_browser_bots': False,
        'num_demo_participants': 1,
        'subject_pool': 'GP',
        'random_allocation': True,
        'treatment': '',
        'app_sequence': [
            't0_int',
            't1_adt2',
            't2_adt5',
            't3_del',
            't4_survey',
            't5_num',
            't6_lit',
            't7_final'
        ],
        'doc': """
            sample: general population;
            treatments: 'pro_flat', 'pro_lin', 'algo';
            treatment allocation: random;
        """
    },
    {
        'name': 'bot',
        'use_browser_bots': True,
        'display_name': 'Automated Test Using Bots',
        'num_demo_participants': 1,
        'subject_pool': '',
        'random_allocation': True,
        'treatment': '',
        'app_sequence': [
            't0_int',
            't1_adt2',
            't2_adt5',
            't3_del',
            't4_survey',
            't5_num',
            't6_lit',
            't7_final'
        ]
    }
]

ROOMS = [
    {
        'name': 'FP',
        'display_name': 'Financial Professionals',
        'participant_label_file': '_rooms/PIDs - FinanceProfessionals.txt'
    },
    {
        'name': 'GP',
        'display_name': 'General Population',
        'participant_label_file': '_rooms/PIDs - GeneralPopulation.txt'
    }
]

LANGUAGE_CODE = 'se'
REAL_WORLD_CURRENCY_CODE = 'SEK'
USE_POINTS = True
POINTS_CUSTOM_NAME = 'SEK'
POINTS_DECIMAL_PLACES = 2
BOTS_CHECK_HTML = False

AUTH_LEVEL = environ.get('OTREE_AUTH_LEVEL')
DEBUG = (environ.get('OTREE_PRODUCTION') in {None, '', '0'})

ADMIN_USERNAME = 'c4341053'
ADMIN_PASSWORD = environ.get('OTREE_ADMIN_PASSWORD')

DEMO_PAGE_INTRO_HTML = """
Online experiment on delegation decisions (general population) and decisions 
with other people's money (finance professionals) in Sweden.
"""

SECRET_KEY = 'redacted'

INSTALLED_APPS = ['otree']
EXTENSION_APPS = ['otree_tools']
