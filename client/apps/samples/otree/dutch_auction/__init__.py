from otree.api import *
import time


doc = """
Dutch auction: each of the 3 bidders in a group values an item at a number from 0 to 100, known
only to them. The price starts at 100 and falls by 5 every 2 seconds; the first bidder to accept
buys at that price. 3 rounds. Adapted from z-Tree's example "dutchauction".
"""


class C(BaseConstants):
    NAME_IN_URL = 'dutch_auction'
    PLAYERS_PER_GROUP = 3
    NUM_ROUNDS = 3
    MAX_VALUE = 100
    START_PRICE = 100
    PRICE_STEP = 5
    TICK_SECONDS = 2


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    start_time = models.FloatField()
    buyer = models.IntegerField(initial=0, doc="id_in_group of the bidder who bought; 0 if nobody did")
    sale_price = models.IntegerField()


class Player(BasePlayer):
    value = models.IntegerField()
    won = models.BooleanField(initial=False)


# FUNCTIONS
def creating_session(subsession: Subsession):
    import random

    for p in subsession.get_players():
        p.value = random.randint(0, C.MAX_VALUE)


def start_auction(group: Group):
    group.start_time = time.time()


def price(group: Group):
    """The price now: it falls by PRICE_STEP every TICK_SECONDS since the auction started."""
    ticks = int((time.time() - group.start_time) // C.TICK_SECONDS)
    return max(0, C.START_PRICE - C.PRICE_STEP * ticks)


def set_payoffs(group: Group):
    for p in group.get_players():
        p.won = p.id_in_group == group.buyer
        p.payoff = p.value - group.sale_price if p.won else 0


# PAGES
class StartWaitPage(WaitPage):
    after_all_players_arrive = start_auction


class Auction(Page):
    # Long enough for the price to fall to 0.
    timeout_seconds = C.START_PRICE // C.PRICE_STEP * C.TICK_SECONDS + 5

    @staticmethod
    def js_vars(player: Player):
        return dict(elapsed=time.time() - player.group.start_time, start=C.START_PRICE,
                    step=C.PRICE_STEP, tick=C.TICK_SECONDS)

    @staticmethod
    def live_method(player: Player, data):
        group = player.group
        if data == 'buy' and group.buyer == 0:
            group.buyer = player.id_in_group
            group.sale_price = price(group)
        if group.buyer != 0:
            # The auction is over for everyone in the group.
            return {0: 'sold'}


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    pass


page_sequence = [StartWaitPage, Auction, ResultsWaitPage, Results]
