from otree.api import *


doc = """
Matching pennies: in each pair, both players choose heads or tails at the same time. The matcher
wins 100 points if the choices match, the mismatcher if they differ. 4 rounds; the players swap
roles after round 2. Adapted from oTree's sample game "matching_pennies".
"""


class C(BaseConstants):
    NAME_IN_URL = 'matching_pennies'
    PLAYERS_PER_GROUP = 2
    NUM_ROUNDS = 4
    STAKES = cu(100)


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    side = models.StringField(choices=[['Heads', 'Heads'], ['Tails', 'Tails']], widget=widgets.RadioSelect, label="I choose:")
    won = models.BooleanField()


# FUNCTIONS
def is_matcher(player: Player):
    """Player 1 is the matcher in the first half of the rounds, player 2 after."""
    return (player.id_in_group == 1) == (player.round_number <= C.NUM_ROUNDS / 2)


def other_player(player: Player):
    return player.get_others_in_group()[0]


def set_payoffs(group: Group):
    for p in group.get_players():
        p.won = (p.side == other_player(p).side) == is_matcher(p)
        p.payoff = C.STAKES if p.won else cu(0)


# PAGES
class Decide(Page):
    form_model = 'player'
    form_fields = ['side']

    @staticmethod
    def vars_for_template(player: Player):
        return dict(matcher=is_matcher(player))


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    @staticmethod
    def vars_for_template(player: Player):
        return dict(matcher=is_matcher(player), other_side=other_player(player).side)


page_sequence = [Decide, ResultsWaitPage, Results]
