from otree.api import *


doc = """
Your app description
"""


class Constants(BaseConstants):
    name_in_url = 'production_task'
    players_per_group = None
    num_rounds = 25

    round_list = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]
    answers_list = [12, 37, 18, 27, 12, 40, 34, 40, 24, 19, 15, 19, 30, 18, 22, 30,
    22, 27, 13, 14, 40, 15, 41, 13, 15]

class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    zero_count = models.IntegerField(label="""
    How many zeros are in the grid?""")

    count_correct = models.IntegerField(initial = 0)
    production_points = models.IntegerField(initial = 0)


def creating_session(subsession):
    pass

# PAGES
def get_timeout_seconds(player):
    participant = player.participant
    import time
    return participant.expiry - time.time()

class ProductionTaskGrid(Page):
    form_model = 'player'
    form_fields = ['zero_count']

    timer_text = 'Time left:'

    @staticmethod
    def get_timeout_seconds(player):
        participant = player.participant
        import time
        return participant.expiry - time.time()

    @staticmethod
    def is_displayed(player):
        return get_timeout_seconds(player) > 1

    # Pass on round number.
    @staticmethod
    def vars_for_template(player):
       return dict(
           image_path='production_grids/production_grid{}.png'.format(player.round_number)
           #image_path='production_grids/production_grid26.png'
       )

    @staticmethod
    def before_next_page(player, timeout_happened):
        for round, answer in zip(Constants.round_list, Constants.answers_list):
            if player.round_number == round and player.zero_count == answer:
                player.count_correct = 1
            if player.round_number == round and player.zero_count != answer and player.zero_count != 0:
                player.count_correct = -1

class ProductionTaskEnd(Page):
    @staticmethod
    def is_displayed(player):
        return player.round_number == Constants.num_rounds

    @staticmethod
    def before_next_page(player, timeout_happened):
        for element in player.in_all_rounds():
            if element.count_correct == 1:
                player.production_points += 1*5
            if element.count_correct == -1:
                player.production_points += -1

        player.participant.production_task_points = player.production_points

page_sequence = [ProductionTaskGrid, ProductionTaskEnd]
