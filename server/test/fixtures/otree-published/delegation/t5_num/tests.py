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
            yield (pages.p1_Instructions)

        # Numeracy Inventory
        # ------------------------------------------------------------------------------------------------------------ #
        yield (pages.p2_Numeracy,
            {
                'q1':   random.choices(
                            [50.00, 10.00, 90.00],
                            [0.50, 0.25, 0.25]
                        ),
                'q2':   random.choices(
                            [4.00, 3.00, 9.00],
                            [0.60, 0.10, 0.30]
                        ),
                'q3':   random.choices(
                            [200.00, 100.00],
                            [0.60, 0.40]
                        ),
                'q4':   random.choices(
                            [0.10, 1.00],
                            [0.80, 0.20]
                        ),
                'q5':   random.choices(
                            [10.00, 1.00, 100.00],
                            [0.70, 0.20, 0.10]
                        ),
                'q6':   random.choices(
                            [500.00, 1000.00],
                            [0.90, 0.10]
                        ),
                'q7':   random.choices(
                            [20.00, 2.00],
                            [0.90, 0.10]
                        ),
                'q8':   random.choices(
                            [100.00, 10.00],
                            [0.80, 0.20]
                        )
            }
        )

        # Confidence
        # ------------------------------------------------------------------------------------------------------------ #
        yield (pages.p3_Confidence,
            {
                'correct':      random.choices(
                                    [1, 2, 3, 4, 5, 6, 7, 8],
                                    [0.02, 0.06, 0.12, 0.18, 0.22, 0.26, 0.10, 0.04]
                                ),
                'percentile':   random.choices(
                                    [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
                                    [0.01, 0.04, 0.08, 0.12, 0.11, 0.14, 0.17, 0.20, 0.09, 0.04]
                                )
            }
        )
