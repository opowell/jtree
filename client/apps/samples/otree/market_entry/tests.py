from otree.api import Currency as c, currency_range, expect, Bot
from . import *


class PlayerBot(Bot):
    def play_round(self):
        # Only player 1 enters: 10 + 20 × (2 − 1) = 30; the others stay out, for 10.
        yield Decide, dict(enter=self.player.id_in_group == 1)
        expect(self.player.payoff, 30 if self.player.id_in_group == 1 else 10)
        yield Results
