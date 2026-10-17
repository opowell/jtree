from otree.api import *


doc = """
Stag hunt: the two players in each pair choose, at the same time, to hunt stag or hare. A stag needs
both hunters (100 points each); hare is safe (60 points) whatever the other does; hunting stag alone
gets nothing.
"""


class C(BaseConstants):
    NAME_IN_URL = 'stag_hunt'
    PLAYERS_PER_GROUP = 2
    NUM_ROUNDS = 1
    STAG_PAYOFF = cu(100)
    HARE_PAYOFF = cu(60)


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    stag = models.BooleanField(
        choices=[[True, 'Stag'], [False, 'Hare']],
        widget=widgets.RadioSelect,
        label="You hunt:",
    )


# FUNCTIONS
def other_player(player: Player):
    return player.get_others_in_group()[0]


def set_payoffs(group: Group):
    for p in group.get_players():
        if p.stag:
            p.payoff = C.STAG_PAYOFF if other_player(p).stag else cu(0)
        else:
            p.payoff = C.HARE_PAYOFF


# PAGES
class Decide(Page):
    form_model = 'player'
    form_fields = ['stag']


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    @staticmethod
    def vars_for_template(player: Player):
        return dict(other_hunt=other_player(player).field_display('stag'),
                    my_hunt=player.field_display('stag'))


page_sequence = [Decide, ResultsWaitPage, Results]
