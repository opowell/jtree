"""Live bidding, in oTree's format: bids sent with liveSend go to everyone in the group."""
from otree.api import *


class C(BaseConstants):
    NAME_IN_URL = 'live_bids'
    PLAYERS_PER_GROUP = 2
    NUM_ROUNDS = 1
    MIN_BID = 5


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    highest = models.IntegerField(initial=0)
    highest_by = models.IntegerField()


class Player(BasePlayer):
    bids = models.IntegerField(initial=0)


class Offer(ExtraModel):
    player = models.Link(Player)
    group = models.Link(Group)
    amount = models.IntegerField()


def custom_export(players):
    yield ['participant', 'round', 'amount', 'highest_then']
    for p in players:
        for offer in Offer.filter(player=p):
            yield [p.participant.code, p.round_number, offer.amount, offer.group.highest]


class Bid(Page):
    @staticmethod
    def js_vars(player: Player):
        return dict(min_bid=C.MIN_BID, my_id=player.id_in_group)

    @staticmethod
    def live_method(player: Player, data):
        group = player.group
        player.bids += 1
        amount = data['amount']
        if amount < C.MIN_BID or amount <= group.highest:
            return {player.id_in_group: dict(error='Bid more than ' + str(max(group.highest, C.MIN_BID - 1)))}
        group.highest = amount
        group.highest_by = player.id_in_group
        Offer.create(player=player, group=group, amount=amount)
        offers = Offer.filter(group=group)
        assert [o.player for o in offers][-1] == player
        return {0: dict(highest=amount, by=player.id_in_group, offers=len(offers))}


page_sequence = [Bid]
