from otree.api import Currency as c, currency_range
from . import pages
from ._builtin import Bot
from .models import Constants
import random


class PlayerBot(Bot):
    def play_round(self):

        # Task Progress
        # --------------------------------------------------------------------------------------------------------------
        if self.subsession.round_number == 1:
            yield (pages.p0_TaskProgress)

        # Instructions
        # --------------------------------------------------------------------------------------------------------------
        if self.subsession.round_number == 1:

            if self.participant.vars['subject_pool'] == 'FP' \
               and not self.participant.vars['treatment'] == 'own_lin':
                    yield (pages.p1_Instructions0)

            yield (pages.p1_Instructions1)
            yield (pages.p1_Instructions2)
            yield (pages.p1_Instructions3)
            yield (pages.p1_Instructions4)

        # Comprehension
        # --------------------------------------------------------------------------------------------------------------
        if self.subsession.round_number == 1:
            yield (pages.p2_Comprehension1)
            yield (pages.p2_Comprehension2,
                 {'fail1': random.choice([0, 0, 0, 1, 2, 3])}
            )
            yield (pages.p2_Comprehension3,
                {'fail2': random.choice([0, 0, 0, 1, 2, 3])}
            )
            yield (pages.p2_Comprehension4,
                {'fail3': random.choice([0, 0, 0, 1, 2, 3])}
            )

        # Start
        # --------------------------------------------------------------------------------------------------------------
        if self.subsession.round_number == 1:
            yield (pages.p2_Start)

        # Decision
        # --------------------------------------------------------------------------------------------------------------
        asset_a = random.randrange(0, 100)
        asset_b = 100 - asset_a

        yield (pages.p3_Decision,
            {
                'asset_a': asset_a,
                'asset_b': asset_b
            }
        )
