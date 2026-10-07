"""One page, in oTree's format."""
from otree.api import *


class C(BaseConstants):
    NAME_IN_URL = 'middle'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    pass


class Middle(Page):
    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        player.participant.vars['middle'] = True


page_sequence = [Middle]
