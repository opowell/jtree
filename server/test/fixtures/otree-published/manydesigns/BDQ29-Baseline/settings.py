from os import environ

SESSION_CONFIGS = [
    dict(
        name="mds_bs",
        display_name="MD Base",
        num_demo_participants=4,
        app_sequence=["md_b"],
        task='decoding',
        attempts_per_puzzle=1,
    )
    ]


SESSION_CONFIG_DEFAULTS = dict(
    real_world_currency_per_point=0.0075, participation_fee=1.30, doc=""
)

PARTICIPANT_FIELDS = ['is_dropout']
SESSION_FIELDS = ['params']

# ISO-639 code
# for example: de, fr, ja, ko, zh-hans
LANGUAGE_CODE = "en"

# e.g. EUR, GBP, CNY, JPY
REAL_WORLD_CURRENCY_CODE = "GBP"
USE_POINTS = False

ADMIN_USERNAME = "admin"
# for security, best to set admin password in an environment variable
ADMIN_PASSWORD = environ.get("OTREE_ADMIN_PASSWORD")

DEMO_PAGE_TITLE = "Many Designs"
DEMO_PAGE_INTRO_HTML = """

"""

SECRET_KEY = 'redacted'

# adjustments for testing
# generating session configs for all varieties of features
import sys


if sys.argv[1] == 'test':
    MAX_ITERATIONS = 5
    FREEZE_TIME = 0.1
    TRIAL_PAUSE = 0.2
    TRIAL_TIMEOUT = 0.3


    for task in ['decoding']:
        SESSION_CONFIGS.extend(
            [
                dict(
                    name=f"testing_{task}_defaults",
                    num_demo_participants=1,
                    app_sequence=['md_b'],
                    puzzle_delay=TRIAL_PAUSE,
                    retry_delay=FREEZE_TIME,
                ),
                dict(
                    name=f"testing_{task}_retrying",
                    num_demo_participants=1,
                    app_sequence=['md_b'],
                    puzzle_delay=TRIAL_PAUSE,
                    retry_delay=FREEZE_TIME,
                    attempts_per_puzzle=5,
                ),
                dict(
                    name=f"testing_{task}_limited",
                    num_demo_participants=1,
                    app_sequence=['md_b'],
                    puzzle_delay=TRIAL_PAUSE,
                    retry_delay=FREEZE_TIME,
                    max_iterations=MAX_ITERATIONS,
                ),
            ]
        )


ROOMS = [
    dict(
        name='mds_bs_1001',
        display_name='MD Base Room'
    )
]
