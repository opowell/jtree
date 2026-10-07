from otree.api import Currency as c, currency_range, SubmissionMustFail
from . import pages
from ._builtin import Bot
from .models import Constants


class PlayerBot(Bot):
    def play_round(self):
        yield SubmissionMustFail(pages.Contribute, {'contribution': 13})
        yield (pages.Contribute, {'contribution': 10 * self.player.id_in_group})
        if self.round_number == Constants.num_rounds:
            # 60 contributed, doubled, shared by 3: 40 each.
            assert self.player.payoff == Constants.endowment - 10 * self.player.id_in_group + 40
            assert 'You contributed {}'.format(10 * self.player.id_in_group) in self.html
            yield pages.Results
