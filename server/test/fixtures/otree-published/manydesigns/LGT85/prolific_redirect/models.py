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
This app is responsible from redirecting participants to prolific at the end of the experiment.
"""



class Constants(BaseConstants):
    name_in_url = 'prolific_redirect'
    players_per_group = None
    num_rounds = 1



class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    pass
