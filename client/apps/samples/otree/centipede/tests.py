from otree.api import Currency as c, currency_range, expect, Bot
from . import *


class PlayerBot(Bot):
    def play_round(self):
        # Player 1 passes (the pot doubles to 20), player 2 passes (40), player 1 takes: 32 and 8.
        if self.player.id_in_group == 1:
            yield Move1, dict(take1=False)
            yield Move3, dict(take3=True)
        else:
            yield Move2, dict(take2=False)
        expect(self.player.payoff, 32 if self.player.id_in_group == 1 else 8)
        yield Results
