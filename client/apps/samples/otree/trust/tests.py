from otree.api import Currency as c, currency_range, expect, Bot
from . import *


class PlayerBot(Bot):
    def play_round(self):
        if self.player.id_in_group == 1:
            yield Send, dict(sent=40)
        else:
            yield SendBack, dict(returned=50)
        # 40 sent became 120; 50 of it came back.
        expect(self.player.payoff, 110 if self.player.id_in_group == 1 else 70)
        yield Results
