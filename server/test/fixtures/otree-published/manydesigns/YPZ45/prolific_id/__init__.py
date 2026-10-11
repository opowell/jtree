from otree.api import *


doc = """
This app just prompts the user to enter in their prolific id (alphanumeric string, 24 characters), and stores it.
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
    prolific_id = models.StringField(label='Please enter your Prolific ID')


# PAGES
class EnterID(Page):
    form_model = 'player'
    form_fields = ['prolific_id']


page_sequence = [EnterID]
