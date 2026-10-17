from otree.api import Currency as c, currency_range, expect, Bot
from . import *


class PlayerBot(Bot):
    def play_round(self):
        # Both choose A, which player 1 prefers.
        yield Decide, dict(choice=1)
        expect(self.player.payoff, 300 if self.player.id_in_group == 1 else 200)
        yield Results
