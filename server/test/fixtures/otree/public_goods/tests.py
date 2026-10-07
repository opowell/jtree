from otree.api import Currency as cu, currency_range, expect, Bot, SubmissionMustFail
from . import *


class PlayerBot(Bot):
    def play_round(self):
        yield SubmissionMustFail(Contribute, dict(contribution=C.ENDOWMENT + 1))
        yield Contribute, dict(contribution=10 * self.player.id_in_group)
        # 60 contributed, times 1.8, shared by 3: 36 each.
        expect(self.player.payoff, C.ENDOWMENT - 10 * self.player.id_in_group + 36)
        yield Results
