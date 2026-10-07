from otree.api import Currency as c, currency_range
from ._builtin import Page, WaitPage
from .models import Constants


class Contribute(Page):
    form_model = 'player'
    form_fields = ['contribution']

    def vars_for_template(self):
        return dict(round_text='Round {}'.format(self.round_number))

    def error_message(self, values):
        if values['contribution'] == 99 and self.player.id_in_group == 1:
            return 'Player 1 may not give 99.'


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = 'set_payoffs'


class Results(Page):
    def is_displayed(self):
        return self.round_number == Constants.num_rounds

    def before_next_page(self):
        self.participant.vars['saw_results'] = not self.timeout_happened


page_sequence = [Contribute, ResultsWaitPage, Results]
