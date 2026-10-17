from otree.api import *


doc = """
Volunteer's dilemma (Diekmann, 1985): each of 3 players in a group decides whether to volunteer. If
at least one does, everyone gets 100 points; each volunteer pays 40 points. Adapted from oTree's
sample game "volunteer_dilemma".
"""


class C(BaseConstants):
    NAME_IN_URL = 'volunteers_dilemma'
    PLAYERS_PER_GROUP = 3
    NUM_ROUNDS = 1
    BENEFIT = cu(100)
    COST = cu(40)


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    num_volunteers = models.IntegerField()


class Player(BasePlayer):
    volunteer = models.BooleanField(
        choices=[[True, 'Volunteer'], [False, 'Do not volunteer']],
        widget=widgets.RadioSelect,
        label="Your choice:",
    )


# FUNCTIONS
def set_payoffs(group: Group):
    players = group.get_players()
    group.num_volunteers = sum([p.volunteer for p in players])
    for p in players:
        p.payoff = (C.BENEFIT if group.num_volunteers > 0 else cu(0)) - (C.COST if p.volunteer else cu(0))


# PAGES
class Decide(Page):
    form_model = 'player'
    form_fields = ['volunteer']


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    pass


page_sequence = [Decide, ResultsWaitPage, Results]
