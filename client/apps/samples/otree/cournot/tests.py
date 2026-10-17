from otree.api import Currency as c, currency_range, expect, Bot
from . import *


class PlayerBot(Bot):
    def play_round(self):
        # 20 and 10 units: the price is 60 - 30 = 30.
        units = 20 if self.player.id_in_group == 1 else 10
        yield Decide, dict(units=units)
        expect(self.player.payoff, 30 * units)
        yield Results
