from otree.api import *


doc = """
(Simple) Comprehension Questions for the Slider Task
"""


class Constants(BaseConstants):
    name_in_url = 'compqs'
    players_per_group = None
    num_rounds = 1

    q1_answer = True
    q2_answer = True
    q3_answer = True

    piece_rate = 0.08
    prize_value = 3.00

    target_value = 50

    time_allowed = 120


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    q1_correct = models.BooleanField()
    q2_correct = models.BooleanField()
    q3_correct = models.BooleanField()


# PAGES
class Q1(Page):
    form_model = 'player'
    form_fields = ['q1_correct']


class Q2A(Page):
    form_model = 'player'
    form_fields = ['q2_correct']

    @staticmethod
    def is_displayed(player: Player):
        if player.participant.treatment == 'Competition':
            return False
        else:
            return True


class Q2B(Page):
    form_model = 'player'
    form_fields = ['q2_correct']

    @staticmethod
    def is_displayed(player: Player):
        if player.participant.treatment == 'Competition':
            return True
        else:
            return False


class Q3(Page):
    form_model = 'player'
    form_fields = ['q3_correct']

    @staticmethod
    def is_displayed(player: Player):
        if player.participant.treatment == 'Competition':
            return True
        else:
            return False


class Recap(Page):
    pass


class GetReady(Page):
    pass


page_sequence = [Q1, Q2A, Q2B, Q3, Recap, GetReady]
