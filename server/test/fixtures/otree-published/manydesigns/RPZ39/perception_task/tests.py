from otree.api import Currency as c, currency_range, expect, Bot
from . import *


class PlayerBot(Bot):
    def play_round(self):
        import random
        yield VisualPerceptionTask
        yield VisualPerceptionTaskImplications, dict(clicked_charity_info=0, ControlQuestion1 = 58, ControlQuestion2 = 42)
        yield VisualPerceptionTaskStart
        yield Submission(VisualPerceptionTaskShow, check_html=False)
        yield VisualPerceptionTaskAnswer, dict(red_dots=random.randint(0,100))
