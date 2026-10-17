from otree.api import Currency as c, currency_range, expect, Bot
from . import *


class PlayerBot(Bot):
    def play_round(self):
        yield Demographics, dict(age=30, gender='Female')
        # Two right, and the bat and ball's tempting answer (2).
        yield CognitiveReflectionTest, dict(crt_bat=2, crt_widget=5, crt_lake=47)
        expect(self.player.crt_score, 2)
        expect('2 of the 3', 'in', self.html)
