import random

from otree.api import Currency as c, currency_range, expect, Bot
from . import *

class PlayerBot(Bot):

    def play_round(self):

        rand_consent = random.random()
        rand_check = random.random()

        yield Captcha

#        if rand_consent <= 0.005:
#            yield Consent, dict(consent=False)
#            yield Submission(Return,
#                             check_html=False
#                             )
#        else:
#            yield Consent, dict(consent=True)
        yield Consent, dict(consent=True)
        if rand_check <= 0.04:
            yield Check, dict(check="red")
            yield Submission(Return,
                             check_html=False
                             )
        elif rand_check <= 0.1:
            yield Check, dict(check="Turquoise")
        else:
            yield Check, dict(check="turquoise")
#        yield Check, dict(check="turquoise")