from otree.api import Currency as c, currency_range
from . import pages
from ._builtin import Bot
from .models import Constants
import random
import numpy as np
from otree.api import Submission


class PlayerBot(Bot):
    def play_round(self):

        # Task Progress
        # --------------------------------------------------------------------------------------------------------------
        if self.subsession.round_number == 1:
            yield (pages.p0_TaskProgress)

        # Instructions
        # --------------------------------------------------------------------------------------------------------------
        if self.subsession.round_number == 1:
            yield (pages.p1_Instructions)

        # Comprehension
        # --------------------------------------------------------------------------------------------------------------
        if self.subsession.round_number == 1:
            yield (pages.p2_Comprehension1)
            yield Submission(pages.p2_Comprehension2,
                {'fail1': random.choice([0, 0, 0, 1, 2, 3])},
                check_html=False
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
        p = np.random.dirichlet(np.ones(5), size=1)
        a = np.random.multinomial(100, p[0], size=1)

        asset_a = a[0][0]
        asset_b = a[0][1]
        asset_c = a[0][2]
        asset_d = a[0][3]
        asset_e = a[0][4]

        yield (pages.p3_Decision,
            {
                'asset_a': asset_a,
                'asset_b': asset_b,
                'asset_c': asset_c,
                'asset_d': asset_d,
                'asset_e': asset_e
            }
        )

        # Perceived Riskiness
        # --------------------------------------------------------------------------------------------------------------
        if self.subsession.round_number == Constants.num_rounds:
            yield (pages.p4_Riskiness,
                {'risk_perception': random.choice([1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4])}
            )
