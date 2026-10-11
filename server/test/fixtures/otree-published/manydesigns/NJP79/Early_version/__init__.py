
from otree.api import *
c = cu

doc = ''
class Constants(BaseConstants):
    name_in_url = 'Early_version'
    players_per_group = 4
    num_rounds = 1
    proposer_1_role = 'Proposer 1'
    proposer_2_role = 'Proposer 2'
    proposer_3_role = 'Proposer 3'
    responder_role = 'Responder'
class Subsession(BaseSubsession):
    pass
class Group(BaseGroup):
    Offer_actual_1 = models.CurrencyField(label='Please choose the amount (between 0 and 5 GBP, rounded to 1 decimal) that you want to send to the responder', max=5, min=0)
    Offer_actual_2 = models.CurrencyField(label='Please choose the amount (between 0 and 5 GBP, rounded to 1 decimal) that you want to send to the responder', max=5, min=0)
    Offer_actual_3 = models.CurrencyField(label='Please choose the amount (between 0 and 5 GBP, rounded to 1 decimal) that you want to send to the responder', max=5, min=0)
    Accept = models.BooleanField(choices=[[True, 'Yes'], [False, 'No']], label='Would you like to accept one of the three offers?')
    Offer_communicated_1 = models.CurrencyField(label='Please choose the amount (between 0 and 5 GBP, rounded to 1 decimal) that you want to communicate to the responder', max=5, min=0)
    Offer_communicated_2 = models.CurrencyField(label='Please choose the amount (between 0 and 5 GBP, rounded to 1 decimal) that you want to communicate to the responder', max=5, min=0)
    Offer_communicated_3 = models.CurrencyField(label='Please choose the amount (between 0 and 5 GBP, rounded to 1 decimal) that you want to communicate to the responder', max=5, min=0)
    Choice = models.StringField(choices=[], label='Which offer would you like to accept?')
class Player(BasePlayer):
    pass
def custom_export(players):
    yield ['participant_code', 'id_in_group']
    for p in players:
        pp = p.participant
        yield [pp.code, p.id_in_group]
class Instructions(Page):
    form_model = 'player'
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
page_sequence = [Instructions, Proposer_1_Offer, Proposer_2_Offer, Proposer_3_Offer, Responder_Wait, Responder_Offers, Responder_Choice]