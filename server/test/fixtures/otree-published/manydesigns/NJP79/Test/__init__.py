
from otree.api import *
c = cu

doc = ''
class Constants(BaseConstants):
    name_in_url = 'Test'
    players_per_group = 4
    num_rounds = 1
    proposer_1_role = 'Proposer 1'
    proposer_2_role = 'Proposer 2'
    proposer_3_role = 'Proposer 3'
    responder_role = 'Responder'
    endowment = cu(5)
    instructions_template = 'Test/instructions.html'
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
    
    
def set_offers(group):
    proposer_1 = group.get_player_by_role(Constants.proposer_1_role)
    proposer_2 = group.get_player_by_role(Constants.proposer_2_role)
    proposer_3 = group.get_player_by_role(Constants.proposer_3_role)
    group.Offer_actual_1 = proposer_1.offer_actual
    group.Offer_actual_2 = proposer_2.offer_actual
    group.Offer_actual_3 = proposer_3.offer_actual
    group.Offer_communicated_1 = proposer_1.offer_communicated
    group.Offer_communicated_2 = proposer_2.offer_communicated
    group.Offer_communicated_3 = proposer_3.offer_communicated
    
    if proposer_1.timeout == True:
        group.Timeout_1 = True
    if proposer_2.timeout == True:
        group.Timeout_2 = True
    if proposer_3.timeout == True:
        group.Timeout_3 = True
def Choice_choices(group):
    proposer_1 = group.get_player_by_role(Constants.proposer_1_role)
    proposer_2 = group.get_player_by_role(Constants.proposer_2_role)
    proposer_3 = group.get_player_by_role(Constants.proposer_3_role)
    if proposer_1.timeout == True and proposer_2.timeout == False and proposer_3.timeout == False:
        choices = [[2, "Proposer 2"], [3, "Proposer 3"]]
    if proposer_1.timeout == False and proposer_2.timeout == True and proposer_3.timeout == False:
        choices = [[1, "Proposer 1"], [3, "Proposer 3"]]
    if proposer_1.timeout == False and proposer_2.timeout == False and proposer_3.timeout == True:
        choices = [[1, "Proposer 1"], [2, "Proposer 2"]]
    if proposer_1.timeout == True and proposer_2.timeout == True and proposer_3.timeout == False: 
        choices = [[3, "Proposer 3"]]
    if proposer_1.timeout == True and proposer_2.timeout == False and proposer_3.timeout == True: 
        choices = [[2, "Proposer 2"]]
    if proposer_1.timeout == False and proposer_2.timeout == True and proposer_3.timeout == True: 
        choices = [[1, "Proposer 1"]]
    if proposer_1.timeout == False and proposer_2.timeout == False and proposer_3.timeout == False: 
        choices = [ [1, "Proposer 1"], [2, "Proposer 2"], [3, "Proposer 3"]]
    if proposer_1.timeout == True and proposer_2.timeout == True and proposer_3.timeout == True: 
        choices = []
    return choices
def Accept_choices(group):
    if group.All_timeout == False: 
        choices = [[True, "Yes"], [False, "No"]]
    if group.All_timeout == True: 
        choices = [[False, "No"]]
    return choices
class Group(BaseGroup):
    Offer_actual_1 = models.CurrencyField()
    Offer_actual_2 = models.CurrencyField()
    Offer_actual_3 = models.CurrencyField()
    Offer_communicated_1 = models.CurrencyField()
    Offer_communicated_2 = models.CurrencyField()
    Offer_communicated_3 = models.CurrencyField()
    Accept = models.BooleanField(label='Would you like to accept one of the three offers?')
    Choice = models.StringField(label='Which offer would you like to accept?', widget=widgets.RadioSelect)
    All_timeout = models.BooleanField(initial=False)
    Timeout_1 = models.BooleanField(initial=False)
    Timeout_2 = models.BooleanField(initial=False)
    Timeout_3 = models.BooleanField(initial=False)
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
    offer_actual = models.CurrencyField(label='Please choose the amount (between £ 0.00 and £ 5.00) that you want to offer to the responder. This is your ACTUAL offer.', max=Constants.endowment, min=0)
    offer_communicated = models.CurrencyField(label='Please choose the amount (between £ 0.00 and £ 5.00) that you want to communicate to the responder. This is your COMMUNICATED offer.', max=Constants.endowment, min=0)
def custom_export(players):
    yield ['participant_code', 'id_in_group']
    for p in players:
        pp = p.participant
        yield [pp.code, p.id_in_group]
class Proposers_Offers(Page):
    form_model = 'player'
    form_fields = ['offer_actual', 'offer_communicated']
    timeout_seconds = 10
    timer_text = 'Time left to reach a decision:'
    @staticmethod
    def is_displayed(player):
        return player.role != Constants.responder_role
    @staticmethod
    def before_next_page(player, timeout_happened):
        if timeout_happened:
            player.timeout = True
            player.offer_actual = cu(-0.01)
            player.offer_communicated = cu(-0.01)
class Responder_Wait(WaitPage):
    after_all_players_arrive = 'set_offers'
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
page_sequence = [Proposers_Offers, Responder_Wait, Responder_Offers, Responder_Choice, Payoffs_Wait, Payoffs]