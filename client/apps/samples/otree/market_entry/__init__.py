from otree.api import *


doc = """
Market entry: each of 4 players in a group decides whether to enter a market with room for 2.
Staying out pays 10 points; an entrant gets 10 + 20 × (2 − the number of entrants), which is less
than staying out when the market is crowded. 5 rounds. The session config's outside_option and
capacity change the 10 and the 2.
"""


class C(BaseConstants):
    NAME_IN_URL = 'market_entry'
    PLAYERS_PER_GROUP = 4
    NUM_ROUNDS = 5
    PER_PLACE = 20


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    num_enter = models.IntegerField()


class Player(BasePlayer):
    enter = models.BooleanField(choices=[[True, 'Enter'], [False, 'Stay out']], widget=widgets.RadioSelect, label="You:")


# FUNCTIONS
def outside_option(session):
    return session.config.get('outside_option', 10)


def capacity(session):
    return session.config.get('capacity', 2)


def set_payoffs(group: Group):
    players = group.get_players()
    group.num_enter = sum([p.enter for p in players])
    for p in players:
        p.payoff = outside_option(group.session) + (C.PER_PLACE * (capacity(group.session) - group.num_enter) if p.enter else 0)


# PAGES
class Decide(Page):
    form_model = 'player'
    form_fields = ['enter']

    @staticmethod
    def vars_for_template(player: Player):
        return dict(outside_option=outside_option(player.session), capacity=capacity(player.session))


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    pass


page_sequence = [Decide, ResultsWaitPage, Results]
