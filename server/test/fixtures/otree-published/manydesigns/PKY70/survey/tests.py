from otree.api import Currency as c, currency_range
from . import *
from otree.api import Bot
import random


class PlayerBot(Bot):

    def play_round(self):
        yield Demographics, dict(
            age = random.randint(18, 99),
            gender = random.randint(1, 4),
            education= random.randint(1, 7),
            profession = "bot",
            hh_member_0_18 = random.randint(0, 6),
            hh_member_18_99 = random.randint(0, 6),
            citizenship = "Germany",
            hh_income= random.randint(1, 12),
            experience_experiments = random.randint(1, 5),
            experience_gaming = random.randint(1, 5)
            )

        yield Attitudes, dict(
            political_orientation = random.randint(0, 10),
            risk = random.randint(0, 10),
            competitiveness = random.randint(0, 10)
            )

        yield perspective_taking, dict(
            pt1 = random.randint(1, 5),
            pt2 = random.randint(1, 5),
            pt3=random.randint(1, 5),
            pt4=random.randint(1, 5),
            pt5=random.randint(1, 5),
            pt6=random.randint(1, 5),
            pt7=random.randint(1, 5)
            )

        yield empathic_concern, dict(
            ec1 = random.randint(1, 5),
            ec2 = random.randint(1, 5),
            ec3=random.randint(1, 5),
            ec4=random.randint(1, 5),
            ec5=random.randint(1, 5),
            ec6=random.randint(1, 5),
            ec7=random.randint(1, 5)
            )