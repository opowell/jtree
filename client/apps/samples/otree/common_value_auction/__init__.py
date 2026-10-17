from otree.api import *


doc = """
Common value auction: an item is worth the same to the 3 bidders in each group, a number from 0 to
100 that none of them knows. Each gets an estimate of it, at most 10 away, and bids. The highest
bidder wins the item and pays their bid, which can be more than it is worth (the winner's curse).
Adapted from oTree's sample game "common_value_auction".
"""


class C(BaseConstants):
    NAME_IN_URL = 'common_value_auction'
    PLAYERS_PER_GROUP = 3
    NUM_ROUNDS = 1
    MAX_VALUE = 100
    NOISE = 10


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    value = models.IntegerField(doc="The item's value, the same for every bidder")
    highest_bid = models.IntegerField()


class Player(BasePlayer):
    estimate = models.IntegerField(doc="The bidder's estimate of the value, at most NOISE away from it")
    bid = models.IntegerField(min=0, max=C.MAX_VALUE, label="Your bid:")
    won = models.BooleanField(initial=False)


# FUNCTIONS
def creating_session(subsession: Subsession):
    import random

    for group in subsession.get_groups():
        group.value = random.randint(0, C.MAX_VALUE)
        for p in group.get_players():
            p.estimate = min(C.MAX_VALUE, max(0, group.value + random.randint(-C.NOISE, C.NOISE)))


def set_payoffs(group: Group):
    import random

    players = group.get_players()
    group.highest_bid = max([p.bid for p in players])
    winner = random.choice([p for p in players if p.bid == group.highest_bid])
    for p in players:
        p.won = p == winner
        p.payoff = group.value - p.bid if p.won else 0


# PAGES
class Bid(Page):
    form_model = 'player'
    form_fields = ['bid']


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    pass


page_sequence = [Bid, ResultsWaitPage, Results]
