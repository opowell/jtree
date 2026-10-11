from otree.api import Currency as c, currency_range, expect, Bot
from . import *
import time


class PlayerBot(Bot):
    def play_round(self):
        import random
        #for i in range(1, 26):
        yield ProductionTaskGrid, dict(zero_count=random.randint(0,56))
        if self.round_number == 1:
            yield ProductionTaskEnd
