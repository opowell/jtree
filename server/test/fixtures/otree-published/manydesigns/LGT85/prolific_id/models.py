from otree.api import (
    models,
    widgets,
    BaseConstants,
    BaseSubsession,
    BaseGroup,
    BasePlayer,
    Currency as c,
    currency_range,
)


author = 'LGT85'

doc = """
Asking for the prolific id
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
    prolific_id = models.StringField(label="Your Prolific ID:")
    timeout = models.BooleanField()

    def prolific_id_error_message(self, value):
        if not value.isalnum():
            return "Your Prolific ID contains characters other than alphanumeric characters. Please recheck your entry."

        if not len(value) == 24:
            return "Your Prolific ID has the wrong length. Please recheck."
