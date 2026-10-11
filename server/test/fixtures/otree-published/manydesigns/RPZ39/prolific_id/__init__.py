from otree.api import *


doc = """
Your app description
"""


class Constants(BaseConstants):
    name_in_url = 'prolific_id'
    players_per_group = None
    num_rounds = 1


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    prolific_id = models.StringField(label = '')


# PAGES
class prolific_id(Page):
    form_model = 'player'
    form_fields = ['prolific_id']


page_sequence = [prolific_id]
