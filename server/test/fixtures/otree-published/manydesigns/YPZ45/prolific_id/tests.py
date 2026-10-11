from otree.api import Currency as c, currency_range, expect, Bot
from . import *
import random
import string


class PlayerBot(Bot):
    def play_round(self):
        # Prolific IDs have 24 alphanumeric characters - please ensure the question field in your survey accepts both numbers and letters.
        random_string = ''.join(random.choices(string.ascii_letters + string.digits, k=24))
        yield EnterID, dict(prolific_id=random_string)
