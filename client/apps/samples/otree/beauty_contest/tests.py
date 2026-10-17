from otree.api import Currency as c, currency_range, expect, Bot
from . import *


class PlayerBot(Bot):
    def play_round(self):
        # The average is 40, and 2/3 of it 26.67: 20 is closest.
        yield Guess, dict(guess=[20, 40, 60][self.player.id_in_group - 1])
        expect(self.player.payoff, 100 if self.player.id_in_group == 1 else 0)
        yield Results
