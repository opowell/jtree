from otree.api import *


doc = """
Your app description
"""


class Constants(BaseConstants):
    name_in_url = 'completion_code'
    players_per_group = None
    num_rounds = 1

    # The Completion URL / Completion Code will be provided by the project coordinators (PCs).
    # (i.e. fill this in when you get it)
    completion_code = '572FB13C'


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    pass

# PAGES
class Finished(Page):
    pass


page_sequence = [Finished]
