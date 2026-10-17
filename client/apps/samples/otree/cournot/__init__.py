from otree.api import *


doc = """
Cournot competition: the two firms in each pair decide how many units to produce, from 0 to 30. The
price per unit is 60 minus the units both produce, and each firm earns the price times its units.
Adapted from oTree's sample game "cournot".
"""


class C(BaseConstants):
    NAME_IN_URL = 'cournot'
    PLAYERS_PER_GROUP = 2
    NUM_ROUNDS = 1
    TOTAL_CAPACITY = 60
    MAX_UNITS = 30


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    unit_price = models.CurrencyField()
    total_units = models.IntegerField()


class Player(BasePlayer):
    units = models.IntegerField(min=0, max=C.MAX_UNITS, label="Units you produce:")


# FUNCTIONS
def other_player(player: Player):
    return player.get_others_in_group()[0]


def set_payoffs(group: Group):
    players = group.get_players()
    group.total_units = sum([p.units for p in players])
    group.unit_price = C.TOTAL_CAPACITY - group.total_units
    for p in players:
        p.payoff = group.unit_price * p.units


# PAGES
class Decide(Page):
    form_model = 'player'
    form_fields = ['units']


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    @staticmethod
    def vars_for_template(player: Player):
        return dict(other_units=other_player(player).units)


page_sequence = [Decide, ResultsWaitPage, Results]
