from otree.api import Currency as cu, expect, Bot, Submission
from . import *


class PlayerBot(Bot):
    def play_round(self):
        if self.round_number == 1:
            yield Submission(Intro, timeout_happened=self.player.id_in_group > 1)
        yield Guess, dict(guess=30)
        expect(self.player.payoff, C.PRIZE)
        if self.round_number == C.NUM_ROUNDS:
            yield Survey, dict(age=30, likes='y', happy=True, comment='')
            expect(self.participant.vars['treatment'], 'in', ['high', 'low'])
