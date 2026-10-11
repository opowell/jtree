from otree.api import Currency as c, currency_range
from . import pages
from ._builtin import Bot
from .models import Constants


class PlayerBot(Bot):
    def play_round(self):

        # Introduction
        # --------------------------------------------------------------------------------------------------------------
        yield (pages.p1_Introduction)

        # Overview
        # --------------------------------------------------------------------------------------------------------------
        yield (pages.p2_Overview)
