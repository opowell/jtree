from otree.api import Currency as c, currency_range, expect, Bot
from . import *


class PlayerBot(Bot):
    def play_round(self):
        # Player 1 hunts stag, player 2 hare.
        yield Decide, dict(stag=self.player.id_in_group == 1)
        expect(self.player.payoff, 0 if self.player.id_in_group == 1 else 60)
        yield Results
