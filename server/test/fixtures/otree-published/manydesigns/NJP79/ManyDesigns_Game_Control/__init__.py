
from otree.api import *
c = cu

doc = 'This is the game for the control condition, which does not involve direct competition between the proposers. '
class Constants(BaseConstants):
    name_in_url = 'ManyDesigns_Game_Control'
    players_per_group = 4
    num_rounds = 1
    proposer_1_role = 'Proposer 1'
    proposer_2_role = 'Proposer 2'
    proposer_3_role = 'Proposer 3'
    responder_role = 'Responder'
    endowment = cu(5)
    instructions_template = 'ManyDesigns_Game_Control/instructions.html'
class Subsession(BaseSubsession):
    pass
def set_payoffs(group):
    proposer_1 = group.get_player_by_role(Constants.proposer_1_role)
    proposer_2 = group.get_player_by_role(Constants.proposer_2_role)
    proposer_3 = group.get_player_by_role(Constants.proposer_3_role)
    responder = group.get_player_by_role(Constants.responder_role)
    import random
    random_draw = random.randint(1,3)
    if group.Timeout_1 == False and group.Timeout_2 == False and group.Timeout_3 == False and random_draw == 1:
        group.Random = 1
    if group.Timeout_1 == False and group.Timeout_2 == False and group.Timeout_3 == False and random_draw == 2:
        group.Random = 2
    if group.Timeout_1 == False and group.Timeout_2 == False and group.Timeout_3 == False and random_draw == 3:
        group.Random = 3
    random_draw_2 = random.randint(1,2)
    if group.Timeout_1 == True and group.Timeout_2 == False and group.Timeout_3 == False and random_draw_2 ==1:
        group.Random = 2
    if group.Timeout_1 == True and group.Timeout_2 == False and group.Timeout_3 == False and random_draw_2 ==2:
        group.Random = 3
    if group.Timeout_1 == False and group.Timeout_2 == True and group.Timeout_3 == False and random_draw_2 ==1:
        group.Random = 1
    if group.Timeout_1 == False and group.Timeout_2 == True and group.Timeout_3 == False and random_draw_2 ==2:
        group.Random = 3
    if group.Timeout_1 == False and group.Timeout_2 == False and group.Timeout_3 == True and random_draw_2 ==1:
        group.Random = 1
    if group.Timeout_1 == False and group.Timeout_2 == False and group.Timeout_3 == True and random_draw_2 ==2:
        group.Random = 2
    if group.Timeout_1 == False and group.Timeout_2 == True and group.Timeout_3 == True:
        group.Random = 1
    if group.Timeout_1 == True and group.Timeout_2 == False and group.Timeout_3 == True:
        group.Random = 2
    if group.Timeout_1 == True and group.Timeout_2 == True and group.Timeout_3 == False:
        group.Random = 3
    if group.Accept == False:
        proposer_1.payoff = 0
        proposer_2.payoff = 0 
        proposer_3.payoff = 0 
        responder.payoff = 0
    if group.Accept == True and group.Random == 1: 
        proposer_1.payoff = Constants.endowment - group.Offer_actual_1
        proposer_2.payoff = 0 
        proposer_3.payoff = 0 
        responder.payoff = group.Offer_actual_1
    if group.Accept == True and group.Random == 2:
        proposer_1.payoff = 0
        proposer_2.payoff = Constants.endowment - group.Offer_actual_2 
        proposer_3.payoff = 0 
        responder.payoff = group.Offer_actual_2
    if group.Accept == True and group.Random == 3:
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
    if proposer_1.timeout == True and proposer_2.timeout == True and proposer_3.timeout == True: 
        group.All_timeout = True
def Accept_choices(group):
    if group.All_timeout == False: 
        choices = [[True, "Accept"], [False, "Reject"]]
    if group.All_timeout == True: 
        choices = [[False, "Reject"]]
    return choices
class Group(BaseGroup):
    Offer_actual_1 = models.CurrencyField()
    Offer_actual_2 = models.CurrencyField()
    Offer_actual_3 = models.CurrencyField()
    Offer_communicated_1 = models.CurrencyField()
    Offer_communicated_2 = models.CurrencyField()
    Offer_communicated_3 = models.CurrencyField()
    Accept = models.BooleanField(label='Would you like to accept the set of 3 communicated offers?')
    All_timeout = models.BooleanField(initial=False)
    Timeout_1 = models.BooleanField(initial=False)
    Timeout_2 = models.BooleanField(initial=False)
    Timeout_3 = models.BooleanField(initial=False)
    Random = models.IntegerField(initial=0)
class Player(BasePlayer):
    timeout = models.BooleanField(initial=False)
    offer_actual = models.CurrencyField(label='Please choose the amount (between £0.00 and £5.00, in increments of cents) that you want to offer to the responder. This is your <b>actual</b> offer.', max=Constants.endowment, min=0)
    offer_communicated = models.CurrencyField(label='Please choose the amount (between £0.00 and £5.00, in increments of cents) that you want to communicate to the responder. This is your <b>communicated</b> offer.', max=Constants.endowment, min=0)
    explain = models.LongStringField(blank=True, label='Please explain your choices:')
    remarks = models.LongStringField(blank=True, label='Please leave your optional comments and remarks here:')
def custom_export(players):
    yield ['participant_code', 'id_in_group']
    for p in players:
        pp = p.participant
        yield [pp.code, p.id_in_group]
class Group_Wait(WaitPage):
    group_by_arrival_time = True
    title_text = 'Searching for other participants'
    body_text = 'Please wait while we match you to other participants. This may take a few minutes.'
class Role(Page):
    form_model = 'player'
    timeout_seconds = 180
class Proposers_Offers(Page):
    form_model = 'player'
    form_fields = ['offer_actual', 'offer_communicated']
    timeout_seconds = 180
    @staticmethod
    def is_displayed(player):
        return player.role != Constants.responder_role
    @staticmethod
    def before_next_page(player, timeout_happened):
        if timeout_happened:
            player.timeout = True
class Responder_Wait(WaitPage):
    after_all_players_arrive = 'set_offers'
    title_text = 'Waiting for proposers'
    body_text = 'Waiting for proposers to determine their offers. This may take a few minutes.'
    @staticmethod
    def is_displayed(player):
        return player.role == Constants.responder_role
class Responder_Offers(Page):
    form_model = 'group'
    form_fields = ['Accept']
    timeout_seconds = 180
    @staticmethod
    def is_displayed(player):
        return player.role == Constants.responder_role
class Explain(Page):
    form_model = 'player'
    form_fields = ['explain']
    timeout_seconds = 180
class Payoffs_Wait(WaitPage):
    after_all_players_arrive = 'set_payoffs'
    title_text = 'Waiting for other participants'
    body_text = 'Waiting for other participants to determine their decisions. This may take a few minutes.'
class Payoffs(Page):
    form_model = 'player'
    timeout_seconds = 180
class End(Page):
    form_model = 'player'
    form_fields = ['remarks']
page_sequence = [Group_Wait, Role, Proposers_Offers, Responder_Wait, Responder_Offers, Explain, Payoffs_Wait, Payoffs, End]