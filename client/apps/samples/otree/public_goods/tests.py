from otree.api import Currency as c, currency_range, expect, Bot
from . import *

CONTRIBUTIONS = [0, 5, 10, 20]


class PlayerBot(Bot):
    def play_round(self):
        contribution = CONTRIBUTIONS[self.player.id_in_group - 1]
        yield Contribute, dict(contribution=contribution)
        # 35 contributed, doubled and shared among 4: 17.5 each.
        expect(self.player.payoff, 20 - contribution + 17.5)
        yield Results
