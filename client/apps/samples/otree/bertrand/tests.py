from otree.api import Currency as c, currency_range, expect, Bot
from . import *


class PlayerBot(Bot):
    def play_round(self):
        yield Decide, dict(price=40 if self.player.id_in_group == 1 else 60)
        expect(self.player.payoff, 40 if self.player.id_in_group == 1 else 0)
        yield Results
