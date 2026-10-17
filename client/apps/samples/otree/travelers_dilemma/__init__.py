from otree.api import *


doc = """
Traveler's dilemma (Basu, 1994): the two players in each pair claim between 2 and 100 points at the
same time. Both get the lower claim; whoever claimed less also gets 2 points more, and whoever
claimed more gets 2 points less. Adapted from oTree's sample game "traveler_dilemma".
"""


class C(BaseConstants):
    NAME_IN_URL = 'travelers_dilemma'
    PLAYERS_PER_GROUP = 2
    NUM_ROUNDS = 1
    MIN_CLAIM = cu(2)
    MAX_CLAIM = cu(100)
    ADJUSTMENT = cu(2)


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    lower_claim = models.CurrencyField()


class Player(BasePlayer):
    claim = models.CurrencyField(min=C.MIN_CLAIM, max=C.MAX_CLAIM, label="Your claim:")
    adjustment = models.CurrencyField()


# FUNCTIONS
def other_player(player: Player):
    return player.get_others_in_group()[0]


def set_payoffs(group: Group):
    p1, p2 = group.get_players()
    group.lower_claim = min(p1.claim, p2.claim)
    for p in [p1, p2]:
        other = other_player(p)
        if p.claim < other.claim:
            p.adjustment = C.ADJUSTMENT
        elif p.claim > other.claim:
            p.adjustment = -C.ADJUSTMENT
        else:
            p.adjustment = cu(0)
        p.payoff = group.lower_claim + p.adjustment


# PAGES
class Claim(Page):
    form_model = 'player'
    form_fields = ['claim']


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    @staticmethod
    def vars_for_template(player: Player):
        return dict(other_claim=other_player(player).claim)


page_sequence = [Claim, ResultsWaitPage, Results]
