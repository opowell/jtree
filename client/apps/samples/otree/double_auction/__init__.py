from otree.api import *


doc = """
Double auction with induced values (Smith, 1962): 4 buyers and 4 sellers trade units of a good for
2 minutes. Buyers post bids and sellers asks, each better than the best standing one, or accept the
best one standing. Each trader trades up to 4 units, and earns the value (buyers) or price (sellers)
of each unit minus its price (buyers) or cost (sellers). 2 rounds. Adapted from z-Tree's example
"noda".
"""


class C(BaseConstants):
    NAME_IN_URL = 'double_auction'
    PLAYERS_PER_GROUP = 8
    NUM_ROUNDS = 2
    TRADING_SECONDS = 120
    # Players 1 to 4 buy, 5 to 8 sell. Unit k is worth VALUES[k] to a buyer, and costs a seller COSTS[k].
    VALUES = [400, 300, 200, 200]
    COSTS = [20, 120, 220, 220]
    MAX_PRICE = 1000


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    units_traded = models.IntegerField(initial=0)


class Offer(ExtraModel):
    group = models.Link(Group)
    type = models.StringField(doc="bid or ask")
    price = models.IntegerField()
    maker = models.IntegerField(doc="id_in_group of the trader who made it")
    open = models.BooleanField(initial=True)
    trade_price = models.IntegerField(doc="The price it was traded at; empty if it was not")


# FUNCTIONS
def is_buyer(player: Player):
    return player.id_in_group <= C.PLAYERS_PER_GROUP // 2


def best_offer(group: Group, type):
    """The best open offer of a type: the highest bid, or the lowest ask."""
    offers = Offer.filter(group=group, type=type, open=True)
    if not offers:
        return None
    return max(offers, key=lambda o: o.price) if type == 'bid' else min(offers, key=lambda o: o.price)


def state(player: Player):
    group = player.group
    offers = Offer.filter(group=group)
    units = C.VALUES if is_buyer(player) else C.COSTS
    return dict(
        bids=sorted([o.price for o in offers if o.open and o.type == 'bid'], reverse=True),
        asks=sorted([o.price for o in offers if o.open and o.type == 'ask']),
        trades=[o.trade_price for o in offers if o.trade_price is not None],
        units_traded=player.units_traded,
        next_unit=units[player.units_traded] if player.units_traded < len(units) else None,
        profit=player.payoff,
    )


def trade(group: Group, offer: Offer, taker: Player):
    maker = group.get_player_by_id(offer.maker)
    buyer, seller = (taker, maker) if is_buyer(taker) else (maker, taker)
    buyer.payoff += C.VALUES[buyer.units_traded] - offer.price
    seller.payoff += offer.price - C.COSTS[seller.units_traded]
    buyer.units_traded += 1
    seller.units_traded += 1
    offer.trade_price = offer.price
    # The offer, and the traders' other offers, close.
    for o in Offer.filter(group=group, open=True):
        if o == offer or o.maker in (buyer.id_in_group, seller.id_in_group):
            o.open = False


# PAGES
class StartWaitPage(WaitPage):
    pass


class Trading(Page):
    timeout_seconds = C.TRADING_SECONDS

    @staticmethod
    def js_vars(player: Player):
        return dict(buyer=is_buyer(player), state=state(player))

    @staticmethod
    def vars_for_template(player: Player):
        return dict(buyer=is_buyer(player), num_units=len(C.VALUES))

    @staticmethod
    def live_method(player: Player, data):
        group = player.group
        buyer = is_buyer(player)
        if player.units_traded < len(C.VALUES) and isinstance(data, dict):
            if data.get('type') == 'offer':
                # A bid (buyer) or ask (seller): it must be better than the best standing one.
                price = data.get('price')
                type = 'bid' if buyer else 'ask'
                best = best_offer(group, type)
                if isinstance(price, int) and 0 <= price <= C.MAX_PRICE and (
                        best is None or (price > best.price if buyer else price < best.price)):
                    Offer.create(group=group, type=type, price=price, maker=player.id_in_group)
            elif data.get('type') == 'accept':
                # Takes the best offer of the other side.
                offer = best_offer(group, 'ask' if buyer else 'bid')
                if offer is not None and group.get_player_by_id(offer.maker).units_traded < len(C.VALUES):
                    trade(group, offer, player)
        return {p.id_in_group: state(p) for p in group.get_players()}


class Results(Page):
    pass


page_sequence = [StartWaitPage, Trading, Results]
