"""A trust game, in oTree's format: the trustor sends part of an endowment, which is tripled;
the trustee sends some of it back. Two rounds."""
from otree.api import *


class C(BaseConstants):
    NAME_IN_URL = 'trust'
    PLAYERS_PER_GROUP = 2
    NUM_ROUNDS = 2
    ENDOWMENT = cu(10)
    MULTIPLIER = 3
    TRUSTOR_ROLE = 'Trustor'
    TRUSTEE_ROLE = 'Trustee'


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    sent_amount = models.CurrencyField(min=0, max=C.ENDOWMENT, label='How much do you send?')
    sent_back_amount = models.CurrencyField(min=0, label='How much do you send back?')


class Player(BasePlayer):
    pass


def sent_back_amount_max(group: Group):
    return group.sent_amount * C.MULTIPLIER


def set_payoffs(group: Group):
    trustor = group.get_player_by_role(C.TRUSTOR_ROLE)
    trustee = group.get_player_by_role(C.TRUSTEE_ROLE)
    trustor.payoff = C.ENDOWMENT - group.sent_amount + group.sent_back_amount
    trustee.payoff = group.sent_amount * C.MULTIPLIER - group.sent_back_amount


class Send(Page):
    form_model = 'group'
    form_fields = ['sent_amount']

    @staticmethod
    def is_displayed(player: Player):
        return player.role == C.TRUSTOR_ROLE


class SendBackWaitPage(WaitPage):
    pass


class SendBack(Page):
    form_model = 'group'
    form_fields = ['sent_back_amount']

    @staticmethod
    def is_displayed(player: Player):
        return player.role == C.TRUSTEE_ROLE

    @staticmethod
    def vars_for_template(player: Player):
        return dict(tripled_amount=player.group.sent_amount * C.MULTIPLIER)


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    @staticmethod
    def vars_for_template(player: Player):
        return dict(earned=sum(p.payoff for p in player.in_all_rounds()))


page_sequence = [Send, SendBackWaitPage, SendBack, ResultsWaitPage, Results]
