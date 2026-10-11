from otree.api import Currency as c, currency_range, expect, Bot
from . import *
from otree.api import Submission


class PlayerBot(Bot):
    def play_round(self):
        yield Submission(Finished, check_html=False)

