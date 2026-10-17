from otree.api import Currency as c, currency_range, expect, Bot, Submission
from . import *


def call_live_method(method, round_number, **kwargs):
    # In round 1, player 1 offers a share for 50, and player 2 buys it.
    if round_number == 1:
        state = method(1, dict(type='sell', price=50))[1]
        method(2, dict(type='accept', id=state['sell_offers'][0]['id']))


class PlayerBot(Bot):
    def play_round(self):
        yield Submission(Trading, timeout_happened=True, check_html=False)
        if self.round_number == 1:
            shares = {1: 2, 2: 4}.get(self.player.id_in_group, 3)
            cash = {1: 770, 2: 670}.get(self.player.id_in_group, 720)
            expect(self.player.shares, shares)
            expect(self.player.cash, cash + shares * self.group.dividend)
        yield Results
