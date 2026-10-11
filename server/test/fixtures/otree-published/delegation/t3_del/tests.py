from otree.api import Currency as c, currency_range
from . import pages
from ._builtin import Bot
from .models import Constants
import random


class PlayerBot(Bot):
    def play_round(self):

        # Task Progress
        # --------------------------------------------------------------------------------------------------------------
        if self.participant.vars['subject_pool'] == 'GP':
            yield (pages.p0_TaskProgress)

        # Instructions
        # --------------------------------------------------------------------------------------------------------------
        if self.participant.vars['subject_pool'] == 'GP':
            yield (pages.p1_Instructions)

        # Delegation Decision
        # --------------------------------------------------------------------------------------------------------------
        if self.participant.vars['subject_pool'] == 'GP':
            yield (pages.p2_DelegationDecision,
                {
                    'delegation':   random.choice([0, 1]),
                    'wtp':          random.randint(0,5) * 10,
                    'risk':         random.choice([1, 2, 2, 3, 3, 3, 4, 4])
                }
            )
