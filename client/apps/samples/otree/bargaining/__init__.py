from otree.api import *


doc = """
Bargaining (Nash demand game): the two players in each pair ask for a share of 100 points at the
same time. If their requests add up to 100 or less, each gets what they asked for; otherwise both
get nothing. Adapted from oTree's sample game "bargaining".
"""


class C(BaseConstants):
    NAME_IN_URL = 'bargaining'
    PLAYERS_PER_GROUP = 2
    NUM_ROUNDS = 1
    AMOUNT_SHARED = cu(100)


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    total_requests = models.CurrencyField()


class Player(BasePlayer):
    request = models.CurrencyField(min=0, max=C.AMOUNT_SHARED, label="Points you ask for:")


# FUNCTIONS
def set_payoffs(group: Group):
    players = group.get_players()
    group.total_requests = sum([p.request for p in players])
    for p in players:
        p.payoff = p.request if group.total_requests <= C.AMOUNT_SHARED else cu(0)


# PAGES
class Request(Page):
    form_model = 'player'
    form_fields = ['request']


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    pass


page_sequence = [Request, ResultsWaitPage, Results]
