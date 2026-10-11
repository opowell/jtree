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
        yield (pages.p2_Literacy,
            {
                'q1':   random.choices(
                            ['more', 'same', 'less', 'n.a.'],
                            [0.70, 0.15, 0.10, 0.05]
                        ),
                'q2':   random.choices(
                            ['more', 'same', 'less', 'n.a.'],
                            [0.20, 0.20, 0.50, 0.10]
                        ),
                'q3':   random.choices(
                            ['more', 'same', 'less', 'n.a.'],
                            [0.05, 0.60, 0.30, 0.05]
                        ),
                'q4':   random.choices(
                            ['incr', 'decr', 'same', 'n.a.'],
                            [0.10, 0.80, 0.10, 0.00]
                        ),
                'q5':   random.choices(
                            ['rise', 'fall', 'same', 'none', 'n.a.'],
                            [0.70, 0.10, 0.10, 0.05, 0.05]
                        ),
                'q6':   random.choices(
                            ['owns', 'lent', 'debt', 'none', 'n.a.'],
                            [0.80, 0.10, 0.05, 0.02, 0.03]
                        )
            }
        )
