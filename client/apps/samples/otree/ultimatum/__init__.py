from otree.api import *


doc = """
Ultimatum game: in each pair, player 1 offers player 2 a share of 100 points. If player 2 accepts,
the points are split as offered; if not, both get nothing.
"""


class C(BaseConstants):
    NAME_IN_URL = 'ultimatum'
    PLAYERS_PER_GROUP = 2
    NUM_ROUNDS = 1
    PIE_SIZE = cu(100)


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    offer = models.CurrencyField(min=0, max=C.PIE_SIZE, label="Your offer to player 2:")
    accepted = models.BooleanField(
        choices=[[True, 'Accept'], [False, 'Reject']],
        widget=widgets.RadioSelect,
        label="Do you accept this offer?",
    )


class Player(BasePlayer):
    pass


# FUNCTIONS
def set_payoffs(group: Group):
    p1 = group.get_player_by_id(1)
    p2 = group.get_player_by_id(2)
    p1.payoff = C.PIE_SIZE - group.offer if group.accepted else cu(0)
    p2.payoff = group.offer if group.accepted else cu(0)


# PAGES
class Offer(Page):
    form_model = 'group'
    form_fields = ['offer']

    @staticmethod
    def is_displayed(player: Player):
        return player.id_in_group == 1


class OfferWaitPage(WaitPage):
    pass


class Respond(Page):
    form_model = 'group'
    form_fields = ['accepted']

    @staticmethod
    def is_displayed(player: Player):
        return player.id_in_group == 2

    @staticmethod
    def vars_for_template(player: Player):
        return dict(kept=C.PIE_SIZE - player.group.offer)


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    pass


page_sequence = [Offer, OfferWaitPage, Respond, ResultsWaitPage, Results]
