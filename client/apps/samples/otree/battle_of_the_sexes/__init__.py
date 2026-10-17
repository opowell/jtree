from otree.api import *


doc = """
Battle of the sexes: the two players in each pair want to choose the same option, but player 1
prefers A and player 2 prefers B. They choose at the same time. Adapted from z-Tree's example
"game222".
"""


class C(BaseConstants):
    NAME_IN_URL = 'battle_of_the_sexes'
    PLAYERS_PER_GROUP = 2
    NUM_ROUNDS = 1
    # PAYOFFS[id in group][my choice][the other's choice], choices 1 (A) and 2 (B).
    PAYOFFS = {
        1: {1: {1: 300, 2: 100}, 2: {1: 0, 2: 200}},
        2: {1: {1: 200, 2: 0}, 2: {1: 100, 2: 300}},
    }


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    choice = models.IntegerField(choices=[[1, 'A'], [2, 'B']], widget=widgets.RadioSelect, label="You choose:")


# FUNCTIONS
def other_player(player: Player):
    return player.get_others_in_group()[0]


def set_payoffs(group: Group):
    for p in group.get_players():
        p.payoff = C.PAYOFFS[p.id_in_group][p.choice][other_player(p).choice]


# PAGES
class Decide(Page):
    form_model = 'player'
    form_fields = ['choice']

    @staticmethod
    def vars_for_template(player: Player):
        mine = C.PAYOFFS[player.id_in_group]
        return dict(aa=mine[1][1], ab=mine[1][2], ba=mine[2][1], bb=mine[2][2])


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    @staticmethod
    def vars_for_template(player: Player):
        return dict(my_choice=player.field_display('choice'),
                    other_choice=other_player(player).field_display('choice'))


page_sequence = [Decide, ResultsWaitPage, Results]
