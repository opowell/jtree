from otree.api import Currency as c, currency_range, expect, Bot
from . import *


class PlayerBot(Bot):
    def play_round(self):
        import random
        yield BeliefSurvey, dict(belief_production_extensive=50, belief_production_intensive = -2, belief_red_dots = 40, reasoning_red_dots = 'yes', competitiveness=5)
        yield GeneralSurvey, dict(age =13, gender = 0, gender_add = '  ', education = 0, comments = 'hello my friend')
        yield Submission(ThankYou, check_html=False)
