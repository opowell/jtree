from otree.api import *


doc = """
Dictator game: in each pair, player 1 decides how to split 100 points between themselves and
player 2, who has no say. Adapted from oTree's sample game "dictator".
"""


class C(BaseConstants):
    NAME_IN_URL = 'dictator'
    PLAYERS_PER_GROUP = 2
    NUM_ROUNDS = 1
    ENDOWMENT = cu(100)


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    keep = models.CurrencyField(min=0, max=C.ENDOWMENT, label="Points you keep:")


# FUNCTIONS
def set_payoffs(group: Group):
    p1 = group.get_player_by_id(1)
    p2 = group.get_player_by_id(2)
    p1.payoff = p1.keep
    p2.payoff = C.ENDOWMENT - p1.keep


# PAGES
class Decide(Page):
    form_model = 'player'
    form_fields = ['keep']

    @staticmethod
    def is_displayed(player: Player):
        return player.id_in_group == 1


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    @staticmethod
    def vars_for_template(player: Player):
        kept = player.group.get_player_by_id(1).keep
        return dict(kept=kept, given=C.ENDOWMENT - kept)


page_sequence = [Decide, ResultsWaitPage, Results]
