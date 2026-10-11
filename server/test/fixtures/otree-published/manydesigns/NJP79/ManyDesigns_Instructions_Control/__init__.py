
from otree.api import *
c = cu

doc = 'This contains the first part of the experiment for the control condition, which does not involve direct competition between the proposers.'
class Constants(BaseConstants):
    name_in_url = 'ManyDesigns_Instructions_Control'
    players_per_group = None
    num_rounds = 1
    instructions_template = 'ManyDesigns_Instructions_Control/instructions.html'
class Subsession(BaseSubsession):
    pass
class Group(BaseGroup):
    pass
class Player(BasePlayer):
    prolific_id = models.StringField(label='Please enter your Prolific ID')
    quiz1 = models.StringField(choices=[['1', '1 offer, an actual offer'], ['2', '1 offer, a communicated offer'], ['3', '2 offers, one actual and one communicated offer']], label='How many offers do proposers make?', widget=widgets.RadioSelect)
    quiz2 = models.StringField(choices=[['1', 'Everyone receives £2.50'], ['2', 'Nobody receives anything'], ['3', 'The game starts again']], label='What happens when the responder decides to reject the set of 3 communicated offers?', widget=widgets.RadioSelect)
    quiz3 = models.StringField(choices=[['1', 'The responder chooses one communicated offer and the money is divided according to the proposer’s actual offer'], ['4', 'One of the communicated offers is randomly selected and the money is divided according to the proposer’s communicated offer'], ['2', 'The responder chooses one communicated offer and the money is divided according to the proposer’s communicated offer'], ['3', 'One of the communicated offers is randomly selected and the money is divided according to the proposer’s actual offer']], label='What is the next step when a responder decides to accept the set of 3 communicated offers?', widget=widgets.RadioSelect)
    quiz4 = models.BooleanField(choices=[[True, 'True'], [False, 'False']], label='When the set of 3 communicated offers is accepted, everyone receives £5.00.')
    num_failed_attempts_quiz1 = models.IntegerField(initial=0)
    num_failed_attempts_quiz2 = models.IntegerField(initial=0)
    num_failed_attempts_quiz3 = models.IntegerField(initial=0)
    num_failed_attempts_quiz4 = models.IntegerField(initial=0)
    manipulation_check = models.IntegerField(choices=[[1, '1. Disagree completely'], [2, '2.'], [3, '3.'], [4, '4.'], [5, '5.'], [6, '6.'], [7, '7. Agree completely']], label='Proposers are in competition with each other.', widget=widgets.RadioSelect)
def custom_export(players):
    yield ['participant_code', 'id_in_group']
    for p in players:
        pp = p.participant
        yield [pp.code, p.id_in_group]
class Welcome(Page):
    form_model = 'player'
    form_fields = ['prolific_id']
    @staticmethod
    def error_message(player, values):
        characters = dict(prolific_id = 24)
        errors = {f: 'Your Prolific ID should contain exactly 24 alphanumeric characters.' for f in characters if len(values[f]) != characters[f] }
        if errors: return errors
class Instruction(Page):
    form_model = 'player'
class Quiz_1(Page):
    form_model = 'player'
    form_fields = ['quiz1']
    @staticmethod
    def error_message(player, values):
        solutions = dict(quiz1="3")
        errors = {f: 'Wrong' for f in solutions if values[f] != solutions[f]}
        if errors: player.num_failed_attempts_quiz1 += 1 
        if errors: return 'Your answer is incorrect, please give the correct answer. You can find a short summary of the instructions at the bottom of this page.'
class Quiz_2(Page):
    form_model = 'player'
    form_fields = ['quiz2']
    @staticmethod
    def error_message(player, values):
        solutions = dict(quiz2="2")
        errors = {f: 'Wrong' for f in solutions if values[f] != solutions[f]}
        if errors: player.num_failed_attempts_quiz2 += 1 
        if errors: return 'Your answer is incorrect, please give the correct answer. You can find a short summary of the instructions at the bottom of this page.'
class Quiz_3(Page):
    form_model = 'player'
    form_fields = ['quiz3']
    @staticmethod
    def error_message(player, values):
        solutions = dict(quiz3="3")
        errors = {f: 'Wrong' for f in solutions if values[f] != solutions[f]}
        if errors: player.num_failed_attempts_quiz3 += 1 
        if errors: return 'Your answer is incorrect, please give the correct answer. You can find a short summary of the instructions at the bottom of this page.'
class Quiz_4(Page):
    form_model = 'player'
    form_fields = ['quiz4']
    @staticmethod
    def error_message(player, values):
        solutions = dict(quiz4=False)
        errors = {f: 'Wrong' for f in solutions if values[f] != solutions[f]}
        if errors: player.num_failed_attempts_quiz4 += 1 
        if errors: return 'Your answer is incorrect, please give the correct answer. You can find a short summary of the instructions at the bottom of this page.'
class Manipulation_Check(Page):
    form_model = 'player'
    form_fields = ['manipulation_check']
class Start(Page):
    form_model = 'player'
page_sequence = [Welcome, Instruction, Quiz_1, Quiz_2, Quiz_3, Quiz_4, Manipulation_Check, Start]