from otree.api import *


doc = """
#ManyDesigns Morality and Competition experiment.
"""


class Constants(BaseConstants):
    name_in_url = 'perception_task'
    players_per_group = None
    num_rounds = 1
    perception_time = 5


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):

    ControlQuestion1 = models.IntegerField(label="""
    How many Experimental Points would you receive?""")
    ControlQuestion2 = models.FloatField(label="""
    How much would be donated to the charity GiveDirectly.org on your behalf? (in GBP pence)""")
    ControlQuestion_count = models.IntegerField()

    clicked_charity_info = models.IntegerField()
    grid_id = models.IntegerField(initial = 0)
    red_dots = models.IntegerField(label = "How many red dots did the grid have?",
    min = 0,
    max = 100)

    actual_dots = models.IntegerField()
    NetEERD = models.IntegerField(initial = 0)

def ControlQuestion1_error_message(player, value):
    if value != 58:
        player.ControlQuestion_count += 1
        return 'This answer is incorrect. Please try again.'

def ControlQuestion2_error_message(player, value):
    if value < 1:
        player.ControlQuestion_count += 1
        return 'Hint: You should provide your answer in GBP pence. Note that 1 GBP is equal to 100 pence.'
    if value != 42:
        player.ControlQuestion_count += 1
        return 'This answer is incorrect. Please try again.'

def creating_session(subsession):
    session = subsession.session
    session.visual_grid_iterator = 1
    players = subsession.get_players()
    for player in players:
        player.participant.vars['grid_id'] = 0

# PAGES
class VisualPerceptionTask(Page):
    @staticmethod
    def before_next_page(player, timeout_happened):
        player.ControlQuestion_count = 0

class VisualPerceptionTaskImplications(Page):
    form_model = 'player'
    form_fields = ['clicked_charity_info', 'ControlQuestion1', 'ControlQuestion2']

    # Assign grid in a balanced way: Iterate through possible grids.
    # Every two consecutively joining players see the same grid.
    @staticmethod
    def before_next_page(player, timeout_happened):
        if player.session.vars['visual_grid_iterator'] == 15:
            player.session.vars['visual_grid_iterator'] = 1

        if 1 <= player.session.vars['visual_grid_iterator'] <= 2:
            player.grid_id = 1
            player.participant.vars['grid_id'] = 1
        if 3 <= player.session.vars['visual_grid_iterator'] <= 4:
            player.grid_id = 2
            player.participant.vars['grid_id'] = 2
        if 5 <= player.session.vars['visual_grid_iterator'] <= 6:
            player.grid_id = 3
            player.participant.vars['grid_id'] = 3
        if 7 <= player.session.vars['visual_grid_iterator'] <= 8:
            player.grid_id = 4
            player.participant.vars['grid_id'] = 4
        if 9 <= player.session.vars['visual_grid_iterator'] <= 10:
            player.grid_id = 5
            player.participant.vars['grid_id'] = 5
        if 11 <= player.session.vars['visual_grid_iterator'] <= 12:
            player.grid_id = 6
            player.participant.vars['grid_id'] = 6
        if 13 <= player.session.vars['visual_grid_iterator'] <= 14:
            player.grid_id = 7
            player.participant.vars['grid_id'] = 7

        player.session.vars['visual_grid_iterator'] += 1

class VisualPerceptionTaskStart(Page):
    pass

class VisualPerceptionTaskShow(Page):
     timeout_seconds = Constants.perception_time

     # Pass on dot number id.
     @staticmethod
     def vars_for_template(player):
        return dict(
            image_path='perception_grids/perception_task_grid_{}.png'.format(player.grid_id)
        )

class VisualPerceptionTaskAnswer(Page):
    form_model = 'player'
    form_fields = ['red_dots']

    @staticmethod
    def before_next_page(player, timeout_happened):
        player.participant.dot_points = player.red_dots

        # Calculate the net excess estimated red dots.
        if player.grid_id == 1:
            player.actual_dots = 36
        if player.grid_id == 2:
            player.actual_dots = 43
        if player.grid_id == 3:
            player.actual_dots = 47
        if player.grid_id == 4:
            player.actual_dots = 50
        if player.grid_id == 5:
            player.actual_dots = 64
        if player.grid_id == 6:
            player.actual_dots = 57
        if player.grid_id == 7:
            player.actual_dots = 53

        player.NetEERD = player.red_dots - player.actual_dots

page_sequence = [VisualPerceptionTask, VisualPerceptionTaskImplications,
VisualPerceptionTaskStart, VisualPerceptionTaskShow, VisualPerceptionTaskAnswer]
