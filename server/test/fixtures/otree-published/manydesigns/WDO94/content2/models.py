import random

from otree.api import (
    BaseConstants,
    BaseSubsession,
    BaseGroup,
    models
)

# noinspection PyUnresolvedReferences
from content2.player import Player

doc = """
Content
"""


class Constants(BaseConstants):
    name_in_url = 'kev7loXi'
    players_per_group = None
    number_of_observers = 2
    num_rounds = 1


class Group(BaseGroup):
    pass


class Subsession(BaseSubsession):
    pass
