from otree.api import *


doc = """
Public goods game: each of 4 players in a group has 20 points and decides how many to contribute to
a group project. Contributions are doubled and shared equally among the group. 10 rounds, in the
same groups. Adapted from oTree's sample game "public_goods_simple".
"""


class C(BaseConstants):
    NAME_IN_URL = 'public_goods'
    PLAYERS_PER_GROUP = 4
    NUM_ROUNDS = 10
    ENDOWMENT = cu(20)
    MULTIPLIER = 2


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    total_contribution = models.CurrencyField()
    individual_share = models.CurrencyField()


class Player(BasePlayer):
    contribution = models.CurrencyField(min=0, max=C.ENDOWMENT, label="Your contribution:")


# FUNCTIONS
def set_payoffs(group: Group):
    players = group.get_players()
    group.total_contribution = sum([p.contribution for p in players])
    group.individual_share = group.total_contribution * C.MULTIPLIER / C.PLAYERS_PER_GROUP
    for p in players:
        p.payoff = C.ENDOWMENT - p.contribution + group.individual_share


# PAGES
class Contribute(Page):
    form_model = 'player'
    form_fields = ['contribution']


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    pass


page_sequence = [Contribute, ResultsWaitPage, Results]
