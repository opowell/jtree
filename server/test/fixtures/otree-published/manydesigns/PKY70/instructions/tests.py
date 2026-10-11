from otree.api import Currency as c, currency_range
from . import *
from otree.api import Bot


class PlayerBot(Bot):
    def play_round(self):
        yield Introduction
        yield Consent, dict(TC=1)
        yield Instruction
        yield Instruction2
        yield Instruction3
        if self.player.id_in_group == 1:
            yield Practice, dict(catches=45, clicks=10)
        elif self.player.id_in_group == 2:
            yield Practice, dict(catches=67, clicks=22)
        else:
            yield Practice, dict(catches=85, clicks=36)