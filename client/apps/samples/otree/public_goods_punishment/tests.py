from otree.api import Currency as c, currency_range, expect, Bot
from . import *


class PlayerBot(Bot):
    def play_round(self):
        me = self.player.id_in_group
        yield Contribute, dict(contribution=10)
        # Player 1 punishes player 2 with 3 points; nobody else punishes.
        yield Punish, {'pun{}'.format(o): (3 if me == 1 and o == 2 else 0) for o in range(1, 5) if o != me}
        # Each: 20 - 10 + 40 * 2 / 4 = 30.
        expect(self.player.payoff, {1: 27, 2: 24}.get(me, 30))
        yield Results
