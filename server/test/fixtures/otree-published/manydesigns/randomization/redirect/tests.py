import random
import time

from otree.api import Currency as c, currency_range, expect, Bot
from . import *


class PlayerBot(Bot):

    def play_round(self):

        yield Submission(RedirectWait,
                         check_html=False, timeout_happened=True
                         )
        yield Submission(Redirect,
                         check_html=False
                         )