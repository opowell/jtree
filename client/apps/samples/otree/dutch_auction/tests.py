from otree.api import Currency as c, currency_range, expect, Bot, Submission
from . import *


def call_live_method(method, **kwargs):
    # Player 1 buys at once, at the starting price.
    method(1, 'buy')


class PlayerBot(Bot):
    def play_round(self):
        yield Submission(Auction, check_html=False)
        expect(self.group.sale_price, 100)
        expect(self.player.payoff, self.player.value - 100 if self.player.id_in_group == 1 else 0)
        yield Results
