
from otree.api import *
c = cu

doc = ''
class Constants(BaseConstants):
    name_in_url = 'Competition'
    players_per_group = 4
    num_rounds = 1
    proposer_1_role = 'Proposer 1'
    proposer_2_role = 'Proposer 2'
    proposer_3_role = 'Proposer 3'
    responder_role = 'Responder'
    endowment = cu(5)
    instructions_template = 'Competition/instructions.html'
class Subsession(BaseSubsession):
    pass
def set_payoffs(group):
    proposer_1 = group.get_player_by_role(Constants.proposer_1_role)
    proposer_2 = group.get_player_by_role(Constants.proposer_2_role)
    proposer_3 = group.get_player_by_role(Constants.proposer_3_role)
    responder = group.get_player_by_role(Constants.responder_role)    
    if group.Accept == False:
        proposer_1.payoff = 0
        proposer_2.payoff = 0 
        proposer_3.payoff = 0 
        responder.payoff = 0
    if group.Accept == True and group.Choice == "1":
        proposer_1.payoff = Constants.endowment - group.Offer_actual_1
        proposer_2.payoff = 0 
        proposer_3.payoff = 0 
        responder.payoff = group.Offer_actual_1
    if group.Accept == True and group.Choice == "2":
        proposer_1.payoff = 0
        proposer_2.payoff = Constants.endowment - group.Offer_actual_2 
        proposer_3.payoff = 0 
        responder.payoff = group.Offer_actual_2
    if group.Accept == True and group.Choice == "3":
        proposer_1.payoff = 0
        proposer_2.payoff = 0 
        proposer_3.payoff = Constants.endowment - group.Offer_actual_3 
        responder.payoff = group.Offer_actual_3
    
    
class Group(BaseGroup):
    Offer_actual_1 = models.CurrencyField(label='Please choose the amount (between 0 and 5 GBP) that you want to send to the responder', max=5, min=0)
    Offer_actual_2 = models.CurrencyField(label='Please choose the amount (between 0 and 5 GBP) that you want to send to the responder', max=5, min=0)
    Offer_actual_3 = models.CurrencyField(label='Please choose the amount (between 0 and 5 GBP) that you want to send to the responder', max=5, min=0)
    Offer_communicated_1 = models.CurrencyField(label='Please choose the amount (between 0 and 5 GBP) that you want to communicate to the responder', max=5, min=0)
    Offer_communicated_2 = models.CurrencyField(label='Please choose the amount (between 0 and 5 GBP) that you want to communicate to the responder', max=5, min=0)
    Offer_communicated_3 = models.CurrencyField(label='Please choose the amount (between 0 and 5 GBP) that you want to communicate to the responder', max=5, min=0)
    Accept = models.BooleanField(choices=[[True, 'Yes'], [False, 'No']], label='Would you like to accept one of the three offers?')
    Choice = models.StringField(choices=[['1', 'Proposer 1'], ['2', 'Proposer 2'], ['3', 'Proposer 3']], label='Which offer would you like to accept?', widget=widgets.RadioSelect)
class Player(BasePlayer):
    prolific_id = models.StringField(label='Enter your Prolific ID')
    quiz1 = models.StringField(choices=[['1', '1 offer, an actual offer'], ['2', '1 offer, a communicated offer'], ['3', '2 offers, one actual and one communicated offer']], label='How many offers do proposers make?', widget=widgets.RadioSelect)
    quiz2 = models.StringField(choices=[['1', 'Everyone receives £ 2.50'], ['2', 'Nobody receives anything'], ['3', 'The game starts again']], label='What happens when the responder decides to reject the set of 3 offers?', widget=widgets.RadioSelect)
    quiz3 = models.StringField(choices=[['1', 'The responder picks one proposer and the money is divided according to the proposer’s actual offer'], ['2', 'The responder picks one proposer and the money is divided according to the proposer’s communicated offer']], label='What is the next step when a responder decides to accept the set of 3 offers?', widget=widgets.RadioSelect)
    quiz4 = models.BooleanField(choices=[[True, 'True'], [False, 'False']], label='When the set of offers is accepted, everyone receives £ 5.00')
    num_failed_attempts_quiz1 = models.IntegerField(initial=0)
    num_failed_attempts_quiz2 = models.IntegerField(initial=0)
    num_failed_attempts_quiz3 = models.IntegerField(initial=0)
    num_failed_attempts_quiz4 = models.IntegerField(initial=0)
    manipulation_check = models.IntegerField(choices=[[1, 'Not at all'], [2, '2'], [3, '3'], [4, 'Neutral'], [5, '5'], [6, '6'], [7, 'Very much']], label='Proposers are in competition with each other.', widget=widgets.RadioSelect)
    timeout = models.BooleanField(initial=False)
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
class Instructions_1(Page):
    form_model = 'player'
class Instructions_2(Page):
    form_model = 'player'
class Quiz_1(Page):
    form_model = 'player'
    form_fields = ['quiz1']
    @staticmethod
    def error_message(player, values):
        solutions = dict(quiz1="3")
        errors = {f: 'Wrong' for f in solutions if values[f] != solutions[f]}
        if errors: player.num_failed_attempts_quiz1 += 1 
        if errors: return 'This answer is wrong'
class Quiz_2(Page):
    form_model = 'player'
    form_fields = ['quiz2']
    @staticmethod
    def error_message(player, values):
        solutions = dict(quiz2="2")
        errors = {f: 'Wrong' for f in solutions if values[f] != solutions[f]}
        if errors: player.num_failed_attempts_quiz2 += 1 
        if errors: return 'This answer is wrong'
class Quiz_3(Page):
    form_model = 'player'
    form_fields = ['quiz3']
    @staticmethod
    def error_message(player, values):
        solutions = dict(quiz3="1")
        errors = {f: 'Wrong' for f in solutions if values[f] != solutions[f]}
        if errors: player.num_failed_attempts_quiz3 += 1 
        if errors: return 'This answer is wrong'
class Quiz_4(Page):
    form_model = 'player'
    form_fields = ['quiz4']
    @staticmethod
    def error_message(player, values):
        solutions = dict(quiz4=False)
        errors = {f: 'Wrong' for f in solutions if values[f] != solutions[f]}
        if errors: player.num_failed_attempts_quiz4 += 1 
        if errors: return 'This answer is wrong'
class Manipulation_Check(Page):
    form_model = 'player'
    form_fields = ['manipulation_check']
class Start(Page):
    form_model = 'player'
class Role(Page):
    form_model = 'player'
class Proposer_1_Offer(Page):
    form_model = 'group'
    form_fields = ['Offer_actual_1', 'Offer_communicated_1']
    timeout_seconds = 60
    timer_text = 'Time left to submit your offers. If you do not submit an offer within this time, we will assume that you send the entire endowment to the responder.'
    @staticmethod
    def is_displayed(player):
        return player.role == Constants.proposer_1_role
    @staticmethod
    def before_next_page(player, timeout_happened):
        group = player.group
        if timeout_happened:
            player.timeout = True
            group.Offer_actual_1 = Constants.endowment
            group.Offer_communicated_1 = Constants.endowment
class Proposer_2_Offer(Page):
    form_model = 'group'
    form_fields = ['Offer_actual_2', 'Offer_communicated_2']
    timeout_seconds = 60
    timer_text = 'Time left to submit your offers. If you do not submit an offer within this time, we will assume that you send the entire endowment to the responder.'
    @staticmethod
    def is_displayed(player):
        return player.role == Constants.proposer_2_role
    @staticmethod
    def before_next_page(player, timeout_happened):
        group = player.group
        if timeout_happened:
            player.timeout = True
            group.Offer_actual_2 = Constants.endowment
            group.Offer_communicated_2 = Constants.endowment
class Proposer_3_Offer(Page):
    form_model = 'group'
    form_fields = ['Offer_actual_3', 'Offer_communicated_3']
    timeout_seconds = 60
    timer_text = 'Time left to submit your offers. If you do not submit an offer within this time, we will assume that you send the entire endowment to the responder.'
    @staticmethod
    def is_displayed(player):
        return player.role == Constants.proposer_3_role
    @staticmethod
    def before_next_page(player, timeout_happened):
        group = player.group
        if timeout_happened:
            player.timeout = True
            group.Offer_actual_3 = Constants.endowment
            group.Offer_communicated_3 = Constants.endowment
class Responder_Wait(WaitPage):
    title_text = 'Waiting for offers'
    body_text = 'Waiting for the proposers to send you an offer.'
    @staticmethod
    def is_displayed(player):
        return player.role == Constants.responder_role
class Responder_Offers(Page):
    form_model = 'group'
    form_fields = ['Accept']
    @staticmethod
    def is_displayed(player):
        return player.role == Constants.responder_role
class Responder_Choice(Page):
    form_model = 'group'
    form_fields = ['Choice']
    @staticmethod
    def is_displayed(player):
        group = player.group
        return player.role == Constants.responder_role and group.Accept == True
class Payoffs_Wait(WaitPage):
    after_all_players_arrive = 'set_payoffs'
class Payoffs(Page):
    form_model = 'player'
page_sequence = [Welcome, Instructions_1, Instructions_2, Quiz_1, Quiz_2, Quiz_3, Quiz_4, Manipulation_Check, Start, Role, Proposer_1_Offer, Proposer_2_Offer, Proposer_3_Offer, Responder_Wait, Responder_Offers, Responder_Choice, Payoffs_Wait, Payoffs]