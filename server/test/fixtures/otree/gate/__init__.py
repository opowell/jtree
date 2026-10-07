"""A gate, in oTree's format: a participant who chooses to skip goes straight to the last app."""
from otree.api import *


class C(BaseConstants):
    NAME_IN_URL = 'gate'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 2


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    skip = models.BooleanField(label='Skip ahead?')


class Choose(Page):
    form_model = 'player'
    form_fields = ['skip']

    @staticmethod
    def app_after_this_page(player: Player, upcoming_apps):
        if player.skip:
            return upcoming_apps[-1]


page_sequence = [Choose]
