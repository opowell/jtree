"""One page, in oTree's format."""
from otree.api import *


class C(BaseConstants):
    NAME_IN_URL = 'final'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    pass


class Final(Page):
    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        player.participant.vars['final'] = True


page_sequence = [Final]
