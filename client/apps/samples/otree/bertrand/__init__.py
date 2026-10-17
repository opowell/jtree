from otree.api import *


doc = """
Bertrand competition (Kruse et al., 1994): the two firms in each pair set a price from 0 to 100 for
the same good. The cheaper firm makes the sale and earns its price; the other earns nothing. A tie
is decided at random. Adapted from oTree's sample game "bertrand".
"""


class C(BaseConstants):
    NAME_IN_URL = 'bertrand'
    PLAYERS_PER_GROUP = 2
    NUM_ROUNDS = 1
    MAXIMUM_PRICE = cu(100)


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    winning_price = models.CurrencyField()


class Player(BasePlayer):
    price = models.CurrencyField(min=0, max=C.MAXIMUM_PRICE, label="Your price:")
    won = models.BooleanField()


# FUNCTIONS
def set_payoffs(group: Group):
    import random

    players = group.get_players()
    group.winning_price = min([p.price for p in players])
    winner = random.choice([p for p in players if p.price == group.winning_price])
    for p in players:
        p.won = p == winner
        p.payoff = p.price if p.won else cu(0)


# PAGES
class Decide(Page):
    form_model = 'player'
    form_fields = ['price']


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    pass


page_sequence = [Decide, ResultsWaitPage, Results]
