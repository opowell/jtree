from otree.api import *


doc = """
Public goods game with punishment (Fehr and Gächter, 2000): after contributing, players see the
others' contributions and can pay to take points from them. Each point paid takes 2 points from its
target. 10 rounds, in the same groups of 4.
"""


class C(BaseConstants):
    NAME_IN_URL = 'public_goods_punishment'
    PLAYERS_PER_GROUP = 4
    NUM_ROUNDS = 10
    ENDOWMENT = cu(20)
    MULTIPLIER = 2
    MAX_PUNISHMENT = 3
    PUNISHMENT_EFFECT = 2


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    total_contribution = models.CurrencyField()
    individual_share = models.CurrencyField()


def punishment_field(id_in_group):
    return models.IntegerField(min=0, max=C.MAX_PUNISHMENT, label="Points you pay to punish player {}:".format(id_in_group))


class Player(BasePlayer):
    contribution = models.CurrencyField(min=0, max=C.ENDOWMENT, label="Your contribution:")
    pun1 = punishment_field(1)
    pun2 = punishment_field(2)
    pun3 = punishment_field(3)
    pun4 = punishment_field(4)
    sent_punishment = models.IntegerField()
    received_punishment = models.IntegerField()


# FUNCTIONS
def set_share(group: Group):
    players = group.get_players()
    group.total_contribution = sum([p.contribution for p in players])
    group.individual_share = group.total_contribution * C.MULTIPLIER / C.PLAYERS_PER_GROUP


def set_payoffs(group: Group):
    players = group.get_players()
    for p in players:
        others = p.get_others_in_group()
        p.sent_punishment = sum([getattr(p, 'pun{}'.format(o.id_in_group)) for o in others])
        p.received_punishment = sum([getattr(o, 'pun{}'.format(p.id_in_group)) for o in others])
        p.payoff = (C.ENDOWMENT - p.contribution + group.individual_share
                    - p.sent_punishment - C.PUNISHMENT_EFFECT * p.received_punishment)


# PAGES
class Contribute(Page):
    form_model = 'player'
    form_fields = ['contribution']


class ContributionsWaitPage(WaitPage):
    after_all_players_arrive = set_share


class Punish(Page):
    form_model = 'player'

    @staticmethod
    def get_form_fields(player: Player):
        return ['pun{}'.format(o.id_in_group) for o in player.get_others_in_group()]

    @staticmethod
    def vars_for_template(player: Player):
        return dict(others=player.get_others_in_group())


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    pass


page_sequence = [Contribute, ContributionsWaitPage, Punish, ResultsWaitPage, Results]
