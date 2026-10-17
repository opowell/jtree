from otree.api import Currency as c, currency_range, expect, Bot
from . import *


class PlayerBot(Bot):
    def play_round(self):
        request = 60 if self.player.id_in_group == 1 else 30
        yield Request, dict(request=request)
        expect(self.player.payoff, request)
        yield Results
