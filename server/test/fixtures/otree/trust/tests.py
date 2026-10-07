from otree.api import Currency as cu, expect, Bot
from . import *


class PlayerBot(Bot):
    cases = ['generous', 'greedy']

    def play_round(self):
        if self.player.role == C.TRUSTOR_ROLE:
            yield Send, dict(sent_amount=4)
        else:
            back = 6 if self.case == 'generous' else 0
            yield SendBack, dict(sent_back_amount=back)
        yield Results
        if self.case == 'generous':
            expect(self.player.payoff, 12 if self.player.role == C.TRUSTOR_ROLE else 6)
        else:
            expect(self.player.payoff, 6 if self.player.role == C.TRUSTOR_ROLE else 12)
