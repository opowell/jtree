from otree.api import *


doc = """
Beauty contest (guess 2/3 of the average): each of 3 players in a group guesses a number from 0 to
100. The guess closest to 2/3 of the average guess wins 100 points, shared if there is a tie.
3 rounds. Adapted from oTree's sample game "guess_two_thirds".
"""


class C(BaseConstants):
    NAME_IN_URL = 'beauty_contest'
    PLAYERS_PER_GROUP = 3
    NUM_ROUNDS = 3
    MAX_GUESS = 100
    PRIZE = cu(100)


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    target = models.FloatField()
    num_winners = models.IntegerField()


class Player(BasePlayer):
    guess = models.IntegerField(min=0, max=C.MAX_GUESS, label="Your guess:")
    won = models.BooleanField(initial=False)


# FUNCTIONS
def set_payoffs(group: Group):
    players = group.get_players()
    group.target = round(sum([p.guess for p in players]) / len(players) * 2 / 3, 2)
    best = min([abs(p.guess - group.target) for p in players])
    winners = [p for p in players if abs(p.guess - group.target) == best]
    group.num_winners = len(winners)
    for p in players:
        p.won = p in winners
        p.payoff = C.PRIZE / group.num_winners if p.won else cu(0)


# PAGES
class Guess(Page):
    form_model = 'player'
    form_fields = ['guess']


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    @staticmethod
    def vars_for_template(player: Player):
        return dict(guesses=', '.join(str(g) for g in sorted(p.guess for p in player.group.get_players())))


page_sequence = [Guess, ResultsWaitPage, Results]
