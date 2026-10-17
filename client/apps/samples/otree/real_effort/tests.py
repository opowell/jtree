from otree.api import Currency as c, currency_range, expect, Bot, Submission
from . import *


def right_answer(player):
    return sum(int(n) for n in player.numbers.split('+'))


def call_live_method(method, group, **kwargs):
    player = group.get_players()[0]
    # Two sums right, one wrong.
    method(1, dict(answer=right_answer(player)))
    method(1, dict(answer=right_answer(player)))
    method(1, dict(answer=right_answer(player) + 1))


class PlayerBot(Bot):
    def play_round(self):
        yield Submission(Work, timeout_happened=True, check_html=False)
        expect(self.player.solved, 2)
        expect(self.player.attempted, 3)
        expect(self.player.payoff, 2)
