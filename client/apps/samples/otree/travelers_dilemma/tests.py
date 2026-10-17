from otree.api import Currency as c, currency_range, expect, Bot
from . import *


class PlayerBot(Bot):
    def play_round(self):
        yield Claim, dict(claim=50 if self.player.id_in_group == 1 else 80)
        expect(self.player.payoff, 52 if self.player.id_in_group == 1 else 48)
        yield Results
