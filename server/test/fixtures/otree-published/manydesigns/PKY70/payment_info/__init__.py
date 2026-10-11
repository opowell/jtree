from otree.api import (
    Page,
    WaitPage,
    models,
    widgets,
    BaseConstants,
    BaseSubsession,
    BaseGroup,
    BasePlayer,
    Currency as c,
    currency_range,
)


doc = """
This application provides a webpage instructing participants how to get paid.
"""


class Constants(BaseConstants):
    name_in_url = 'payment_info'
    players_per_group = None
    num_rounds = 1
    endowment = c(200)


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    pass


# FUNCTIONS


# PAGES
class PaymentInfo(Page):

    @staticmethod
    def vars_for_template(player: Player):
        return {
            'participation_fee': player.session.config['participation_fee'],
            'bonus_tokens': player.participant.payoff,
            'final_payment': player.participant.payoff_plus_participation_fee(),
            'group_dropout': player.participant.group_dropouts,
            'dropout': player.participant.is_dropout,
            'keep': player.participant.keep_earnings,
            'rand': player.participant.rand,
            'keep_group': player.participant.group_keep,
            'transfers': Constants.endowment - player.participant.payoff,
        }

class Redirect(Page):

    @staticmethod
    def vars_for_template(player: Player):
        return {
            'dropout': player.participant.is_dropout,
        }

    @staticmethod
    def js_vars(player: Player):
        return dict(
            redirect_url='https://www.ecosia.com',
            dropout_url='https://www.google.com'
        )

page_sequence = [
    PaymentInfo,
    Redirect
]
