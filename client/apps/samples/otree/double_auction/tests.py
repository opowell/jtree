from otree.api import Currency as c, currency_range, expect, Bot, Submission
from . import *


def call_live_method(method, **kwargs):
    # Seller 5 asks 100, and buyer 1 takes it: the buyer earns 400 - 100, the seller 100 - 20.
    method(5, dict(type='offer', price=100))
    method(1, dict(type='accept'))


class PlayerBot(Bot):
    def play_round(self):
        yield Submission(Trading, timeout_happened=True, check_html=False)
        expect(self.player.payoff, {1: 300, 5: 80}.get(self.player.id_in_group, 0))
        yield Results
