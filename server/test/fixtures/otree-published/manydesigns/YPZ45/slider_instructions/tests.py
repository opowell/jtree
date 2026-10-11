from otree.api import Currency as c, currency_range, expect, Bot
from . import *
from otree.api import Submission
import random

# page_sequence = [Introduction, SliderRules, Practice]


class PlayerBot(Bot):
    def play_round(self):
        yield Introduction
        yield SliderRules

        num_keys = random.randint(0, 6)
        num_slide = random.randint(3, 10)
        yield Submission(Practice, dict(num_keystrokes=num_keys, num_sliders=num_slide),
                         check_html=False)

