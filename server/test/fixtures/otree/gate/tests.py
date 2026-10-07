from otree.api import Bot
from . import *


class PlayerBot(Bot):
    def play_round(self):
        # P1 skips in round 1; the others go on.
        yield Choose, dict(skip=self.participant.code == 'P1')
