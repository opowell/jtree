from otree.api import Currency as c, currency_range
from . import pages
from ._builtin import Bot
from .models import Constants
import random


class PlayerBot(Bot):
    def play_round(self):

        # Task Progress
        # --------------------------------------------------------------------------------------------------------------
        yield (pages.p0_TaskProgress)

        # Instructions
        # --------------------------------------------------------------------------------------------------------------
        yield (pages.p1_Instructions)

        # Survey 1
        # --------------------------------------------------------------------------------------------------------------
        yield (pages.p2_Survey1,
            {
                'risk_gen':     random.randint(0, 10),
                'time_gen':     random.randint(0, 10)
            }
        )

        # Survey 2
        # --------------------------------------------------------------------------------------------------------------
        yield (pages.p2_Survey2,
            {
                'risk_fin':     random.randint(0, 10),
                'trust_gen':    random.randint(0, 10),
                'trust_fin':    random.randint(0, 10),
                'trust_algo':   random.randint(0, 10)
            }
        )

        # Survey 3
        # --------------------------------------------------------------------------------------------------------------
        yield (pages.p2_Survey3,
            {
                'altruism':     random.randint(0, 1000) * 10
            }
        )

        # Survey 4
        # --------------------------------------------------------------------------------------------------------------
        yield (pages.p2_Survey4,
            {
                'blame_others': random.randint(0, 10),
                'blame_tempt':  random.randint(0, 10),
            }
        )

        # Survey 5
        # --------------------------------------------------------------------------------------------------------------
        yield (pages.p2_Survey5,
            {
                'del_prof':     random.randint(0, 10),
                'del_algo':     random.randint(0, 10),
                'experts':      random.randint(0, 10),
                'responsible':  random.randint(0, 10),
                'investments':  random.randint(0, 10),
            }
        )
