from otree.api import Currency as c, currency_range, expect, Bot
from . import *


class PlayerBot(Bot):
    def play_round(self):
        # Player 1 volunteers; the others do not.
        yield Decide, dict(volunteer=self.player.id_in_group == 1)
        expect(self.player.payoff, 60 if self.player.id_in_group == 1 else 100)
        yield Results
