from otree.api import Currency as c, currency_range, expect, Bot
from . import *


class PlayerBot(Bot):
    def play_round(self):
        if self.player.id_in_group == 1:
            yield Decide, dict(keep=70)
        expect(self.player.payoff, 70 if self.player.id_in_group == 1 else 30)
        yield Results
