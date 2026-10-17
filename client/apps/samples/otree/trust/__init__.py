from otree.api import *


doc = """
Trust game (Berg, Dickhaut and McCabe, 1995): in each pair, player 1 has 100 points and sends some
to player 2. What is sent is tripled; player 2 then decides how much of it to send back. Adapted
from oTree's sample game "trust".
"""


class C(BaseConstants):
    NAME_IN_URL = 'trust'
    PLAYERS_PER_GROUP = 2
    NUM_ROUNDS = 1
    ENDOWMENT = cu(100)
    MULTIPLIER = 3


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    sent = models.CurrencyField(min=0, max=C.ENDOWMENT, label="Points you send:")
    returned = models.CurrencyField(min=0, label="Points you send back:")


class Player(BasePlayer):
    pass


# FUNCTIONS
def returned_max(group: Group):
    return group.sent * C.MULTIPLIER


def set_payoffs(group: Group):
    p1 = group.get_player_by_id(1)
    p2 = group.get_player_by_id(2)
    p1.payoff = C.ENDOWMENT - group.sent + group.returned
    p2.payoff = group.sent * C.MULTIPLIER - group.returned


# PAGES
class Send(Page):
    form_model = 'group'
    form_fields = ['sent']

    @staticmethod
    def is_displayed(player: Player):
        return player.id_in_group == 1


class SendWaitPage(WaitPage):
    pass


class SendBack(Page):
    form_model = 'group'
    form_fields = ['returned']

    @staticmethod
    def is_displayed(player: Player):
        return player.id_in_group == 2

    @staticmethod
    def vars_for_template(player: Player):
        return dict(tripled=player.group.sent * C.MULTIPLIER)


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    @staticmethod
    def vars_for_template(player: Player):
        return dict(tripled=player.group.sent * C.MULTIPLIER)


page_sequence = [Send, SendWaitPage, SendBack, ResultsWaitPage, Results]
