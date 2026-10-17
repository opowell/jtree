from otree.api import Currency as c, currency_range, expect, Bot
from . import *


class PlayerBot(Bot):
    def play_round(self):
        expect(abs(self.player.estimate - self.group.value) <= C.NOISE, True)
        # Player 3 bids highest, and pays 70 for the item.
        yield Bid, dict(bid=[30, 50, 70][self.player.id_in_group - 1])
        expect(self.player.payoff, self.group.value - 70 if self.player.id_in_group == 3 else 0)
        yield Results
