from otree.api import Currency as c, currency_range, Bot, expect
from . import *
import random


class PlayerBot(Bot):

    def play_round(self):
        yield Introduction
        yield Instructions
        yield Quiz1, dict(quiz1=200)
        yield Quiz2, dict(quiz2=0)
        yield Quiz3, dict(quiz3=0)
        yield Quiz4, dict(quiz4=200)
        if self.player.id_in_group == 1:
            yield DecisionA1, dict(give_playerAtoB=random.randint(0, 100), give_playerAtoC=random.randint(0, 100))
            yield DecisionA2, dict(give2_playerAtoB=random.randint(0, 100), give2_playerAtoC=random.randint(0, 100))
        elif self.player.id_in_group == 2:
            yield DecisionB1, dict(give_playerBtoA=random.randint(0, 100), give_playerBtoC=random.randint(0, 100))
            yield DecisionB2, dict(give2_playerBtoA=random.randint(0, 100), give2_playerBtoC=random.randint(0, 100))
        else:
            yield DecisionC1, dict(give_playerCtoA=random.randint(0, 100), give_playerCtoB=random.randint(0, 100))
            yield DecisionC2, dict(give2_playerCtoA=random.randint(0, 100), give2_playerCtoB=random.randint(0, 100))
        yield Submission(Dice)
        yield Results
