from otree.api import Currency as c, currency_range, expect, Bot
from . import *
from otree.api import Submission
import random

# page_sequence = [Sliders, Results]


class PlayerBot(Bot):
    def play_round(self):
        if self.player.participant.treatment == 'No Competition':
            num_keys = random.randint(0, 5)
        else:
            num_keys = random.randint(0, 25)
        yield Submission(Sliders, dict(num_keystrokes=num_keys, num_sliders=random.randint(5, 35)), check_html=False)
        yield Results
