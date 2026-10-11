from otree.api import *


doc = """
#ManyDesigns Morality and Competition experiment.
"""


class Constants(BaseConstants):
    name_in_url = 'production_task_instructions'
    players_per_group = None
    num_rounds = 1

class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    ControlQuestion = models.IntegerField(label="""
    Assume that you have solved 10 grids correctly and miscounted one grid.
    How many Experimental Points would you acquire? """)
    ControlQuestion_count = models.IntegerField(initial = 0)


def ControlQuestion_error_message(player, value):
    if value != 49:
        player.ControlQuestion_count += 1
        return 'This answer is incorrect. Please try again.'

class ProductionTask(Page):
    form_model = 'player'
    form_fields = ['ControlQuestion']



page_sequence = [ProductionTask]
