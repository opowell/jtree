
from otree.api import *
c = cu

doc = ''
class Constants(BaseConstants):
    name_in_url = 'Control'
    players_per_group = 4
    num_rounds = 1
    proposer_1_role = 'Proposer 1'
    proposer_2_role = 'Proposer 2'
    proposer_3_role = 'Proposer 3'
    responder_role = 'Responder'
    endowment = cu(5)
class Subsession(BaseSubsession):
    pass
def set_payoffs(group):
    proposer_1 = group.get_player_by_role(Constants.proposer_1_role)
    proposer_2 = group.get_player_by_role(Constants.proposer_2_role)
    proposer_3 = group.get_player_by_role(Constants.proposer_3_role)
    responder = group.get_player_by_role(Constants.responder_role)
    import random
    random_draw = random.randint(1,3)
    if group.Accept == False:
        proposer_1.payoff = 0
        proposer_2.payoff = 0 
        proposer_3.payoff = 0 
        responder.payoff = 0
    if group.Accept == True and random_draw == 1:
        proposer_1.payoff = Constants.endowment - group.Offer_actual_1
        proposer_2.payoff = 0 
        proposer_3.payoff = 0 
        responder.payoff = group.Offer_actual_1
    if group.Accept == True and random_draw == 2:
        proposer_1.payoff = 0
        proposer_2.payoff = Constants.endowment - group.Offer_actual_2 
        proposer_3.payoff = 0 
        responder.payoff = group.Offer_actual_2
    if group.Accept == True and random_draw == 3:
        proposer_1.payoff = 0
        proposer_2.payoff = 0 
        proposer_3.payoff = Constants.endowment - group.Offer_actual_3 
        responder.payoff = group.Offer_actual_3
    
    
class Group(BaseGroup):
    Offer_actual_1 = models.CurrencyField(label='Please choose the amount (between 0 and 5 GBP) that you want to send to the responder', max=5, min=0)
    Offer_actual_2 = models.CurrencyField(label='Please choose the amount (between 0 and 5 GBP) that you want to send to the responder', max=5, min=0)
    Offer_actual_3 = models.CurrencyField(label='Please choose the amount (between 0 and 5 GBP) that you want to send to the responder', max=5, min=0)
    Accept = models.BooleanField(choices=[[True, 'Yes'], [False, 'No']], label='Would you like to accept one of the three offers?')
    Offer_communicated_1 = models.CurrencyField(label='Please choose the amount (between 0 and 5 GBP) that you want to communicate to the responder', max=5, min=0)
    Offer_communicated_2 = models.CurrencyField(label='Please choose the amount (between 0 and 5 GBP) that you want to communicate to the responder', max=5, min=0)
    Offer_communicated_3 = models.CurrencyField(label='Please choose the amount (between 0 and 5 GBP) that you want to communicate to the responder', max=5, min=0)
    Choice = models.StringField(choices=[['1', 'Proposer 1'], ['2', 'Proposer 2'], ['3', 'Proposer 3']], label='Which offer would you like to accept?', widget=widgets.RadioSelect)
class Player(BasePlayer):
    pass
def custom_export(players):
    yield ['participant_code', 'id_in_group']
    for p in players:
        pp = p.participant
        yield [pp.code, p.id_in_group]
class Proposer_1_Offer(Page):
    form_model = 'group'
    form_fields = ['Offer_actual_1', 'Offer_communicated_1']
    @staticmethod
    def is_displayed(player):
        return player.role == Constants.proposer_1_role
class Proposer_2_Offer(Page):
    form_model = 'group'
    form_fields = ['Offer_actual_2', 'Offer_communicated_2']
    @staticmethod
    def is_displayed(player):
        return player.role == Constants.proposer_2_role
class Proposer_3_Offer(Page):
    form_model = 'group'
    form_fields = ['Offer_actual_3', 'Offer_communicated_3']
    @staticmethod
    def is_displayed(player):
        return player.role == Constants.proposer_3_role
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
class Payoffs_Wait(WaitPage):
    after_all_players_arrive = 'set_payoffs'
    @staticmethod
    def is_displayed(player):
        return player.role == Constants.responder_role
class Payoffs(Page):
    form_model = 'player'
    @staticmethod
    def is_displayed(player):
        return player.role == Constants.responder_role
page_sequence = [Proposer_1_Offer, Proposer_2_Offer, Proposer_3_Offer, Responder_Wait, Responder_Offers, Payoffs_Wait, Payoffs]