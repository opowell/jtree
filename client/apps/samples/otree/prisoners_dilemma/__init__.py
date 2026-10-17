from otree.api import *


doc = """
Prisoner's dilemma: the two players in each pair choose, at the same time, to cooperate or to
defect. Each does better by defecting, whatever the other does, but both do better if both
cooperate. Adapted from oTree's sample game "prisoner".
"""


class C(BaseConstants):
    NAME_IN_URL = 'prisoners_dilemma'
    PLAYERS_PER_GROUP = 2
    NUM_ROUNDS = 1
    # My payoff, by my choice and the other's.
    BOTH_COOPERATE = cu(200)
    BOTH_DEFECT = cu(100)
    DEFECT_ALONE = cu(300)
    COOPERATE_ALONE = cu(0)


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    cooperate = models.BooleanField(
        choices=[[True, 'Cooperate'], [False, 'Defect']],
        widget=widgets.RadioSelect,
        label="Your choice:",
    )


# FUNCTIONS
def other_player(player: Player):
    return player.get_others_in_group()[0]


def set_payoffs(group: Group):
    for p in group.get_players():
        other = other_player(p)
        if p.cooperate:
            p.payoff = C.BOTH_COOPERATE if other.cooperate else C.COOPERATE_ALONE
        else:
            p.payoff = C.DEFECT_ALONE if other.cooperate else C.BOTH_DEFECT


# PAGES
class Decide(Page):
    form_model = 'player'
    form_fields = ['cooperate']


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    @staticmethod
    def vars_for_template(player: Player):
        return dict(other_decision=other_player(player).field_display('cooperate'),
                    my_decision=player.field_display('cooperate'))


page_sequence = [Decide, ResultsWaitPage, Results]
