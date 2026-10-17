from otree.api import Currency as c, currency_range, expect, Bot
from . import *


class PlayerBot(Bot):
    def play_round(self):
        # Both choose heads: the matcher wins, player 1 in rounds 1 and 2, player 2 in rounds 3 and 4.
        yield Decide, dict(side='Heads')
        expect(self.player.payoff, 100 if is_matcher(self.player) else 0)
        yield Results
