from otree.api import *


doc = """
Asset market (Smith, Suchanek and Williams, 1988): traders buy and sell shares for cash in a double
auction, for 10 rounds of 60 seconds. After each round, every share pays a dividend of 0, 8, 28 or
60 (equally likely); after the last, shares are worth nothing. Each trader starts with 3 shares and
720 in cash, and earns their cash at the end. Adapted from jtree's "double-auction" and z-Tree's
"asset_da".
"""


class C(BaseConstants):
    NAME_IN_URL = 'asset_market'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 10
    TRADING_SECONDS = 60
    DIVIDENDS = [0, 8, 28, 60]
    ENDOWMENT_SHARES = 3
    # The shares' expected dividends: 24 a round, for every round.
    ENDOWMENT_CASH = 24 * NUM_ROUNDS * ENDOWMENT_SHARES


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    dividend = models.IntegerField()


class Player(BasePlayer):
    cash = models.IntegerField()
    shares = models.IntegerField()
    # What is not promised to open offers: cash to buy offers, shares to sell offers.
    cash_available = models.IntegerField()
    shares_available = models.IntegerField()
    dividends = models.IntegerField()


class Offer(ExtraModel):
    group = models.Link(Group)
    maker = models.IntegerField(doc="id_in_group of the trader who made it")
    side = models.StringField(doc="buy or sell: what the maker offers to do")
    price = models.IntegerField()
    open = models.BooleanField(initial=True)
    taker = models.IntegerField(doc="id_in_group of the trader who took it; empty if nobody did")


# FUNCTIONS
def start_round(group: Group):
    """Each trader's cash and shares: the endowment, then what they had at the end of the last round."""
    for p in group.get_players():
        if p.round_number == 1:
            p.cash, p.shares = C.ENDOWMENT_CASH, C.ENDOWMENT_SHARES
        else:
            before = p.in_round(p.round_number - 1)
            p.cash, p.shares = before.cash, before.shares
        p.cash_available, p.shares_available = p.cash, p.shares


def state(player: Player):
    offers = Offer.filter(group=player.group)
    row = lambda o: dict(id=o.id, price=o.price, mine=o.maker == player.id_in_group)
    return dict(
        cash=player.cash, cash_available=player.cash_available,
        shares=player.shares, shares_available=player.shares_available,
        buy_offers=[row(o) for o in sorted(offers, key=lambda o: -o.price) if o.open and o.side == 'buy'],
        sell_offers=[row(o) for o in sorted(offers, key=lambda o: o.price) if o.open and o.side == 'sell'],
        trades=[o.price for o in offers if o.taker is not None],
    )


def offer_by_id(group: Group, id):
    offers = [o for o in Offer.filter(group=group, open=True) if o.id == id]
    return offers[0] if offers else None


def pay_dividends(group: Group):
    import random

    group.dividend = random.choice(C.DIVIDENDS)
    for p in group.get_players():
        p.dividends = p.shares * group.dividend
        p.cash += p.dividends
        # Only the cash at the end counts.
        p.payoff = p.cash if p.round_number == C.NUM_ROUNDS else 0


# PAGES
class StartWaitPage(WaitPage):
    after_all_players_arrive = start_round


class Trading(Page):
    timeout_seconds = C.TRADING_SECONDS

    @staticmethod
    def js_vars(player: Player):
        return state(player)

    @staticmethod
    def live_method(player: Player, data):
        group = player.group
        kind = data.get('type') if isinstance(data, dict) else None
        price = data.get('price') if isinstance(data, dict) else None
        if kind == 'buy' and isinstance(price, int) and 0 < price <= player.cash_available:
            # An offer to buy a share: its price is promised to it.
            player.cash_available -= price
            Offer.create(group=group, maker=player.id_in_group, side='buy', price=price)
        elif kind == 'sell' and isinstance(price, int) and price > 0 and player.shares_available >= 1:
            # An offer to sell a share: the share is promised to it.
            player.shares_available -= 1
            Offer.create(group=group, maker=player.id_in_group, side='sell', price=price)
        elif kind in ('accept', 'cancel'):
            offer = offer_by_id(group, data.get('id'))
            if offer is not None:
                maker = group.get_player_by_id(offer.maker)
                if kind == 'cancel' and maker == player:
                    offer.open = False
                    if offer.side == 'buy':
                        player.cash_available += offer.price
                    else:
                        player.shares_available += 1
                elif kind == 'accept' and maker != player:
                    if offer.side == 'sell' and player.cash_available >= offer.price:
                        # The player buys the maker's share.
                        player.shares += 1
                        player.shares_available += 1
                        player.cash -= offer.price
                        player.cash_available -= offer.price
                        maker.shares -= 1
                        maker.cash += offer.price
                        maker.cash_available += offer.price
                        offer.open, offer.taker = False, player.id_in_group
                    elif offer.side == 'buy' and player.shares_available >= 1:
                        # The player sells a share to the maker.
                        player.shares -= 1
                        player.shares_available -= 1
                        player.cash += offer.price
                        player.cash_available += offer.price
                        maker.shares += 1
                        maker.shares_available += 1
                        maker.cash -= offer.price
                        offer.open, offer.taker = False, player.id_in_group
        return {p.id_in_group: state(p) for p in group.get_players()}


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = pay_dividends


class Results(Page):
    pass


page_sequence = [StartWaitPage, Trading, ResultsWaitPage, Results]
