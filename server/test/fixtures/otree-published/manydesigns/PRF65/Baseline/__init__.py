
from otree.api import *
c = cu

doc = ''
class Constants(BaseConstants):
    name_in_url = 'Baseline'
    players_per_group = None
    num_rounds = 1
    multiplier = 2.5
    endowment = 0.05
class Subsession(BaseSubsession):
    pass
def set_payoff(group):
    group.showup = round(1.30,2)
    group.number_yes = len([p for p in group.get_players() if p.choice == 'Yes'])
    group.proportion = group.number_yes / len([p for p in group.get_players()])*100

    for p in group.get_players():
        if p.guess >= group.proportion-5 and p.guess <= group.proportion+5:
            p.guessget = Constants.endowment
        else: p.guessget = 0
    for p in group.get_players():
        p.payoffs = p.choiceget + p.guessget + p.pointget + group.showup
        p.payoffs = round(p.payoffs,2)
class Group(BaseGroup):
    number_yes = models.IntegerField()
    proportion = models.FloatField()
    showup = models.CurrencyField()
class Player(BasePlayer):
    idname = models.StringField(label='<b>Please enter your Prolific ID.</b>')
    choice = models.StringField(choices=[['Yes', 'Yes'], ['No', 'No']], label='Please indicate whether the computer’s number chosen is the same as your number chosen.')
    guess = models.IntegerField(label='Guess (please input a number between 0 and 100, inclusive)', max=100, min=0)
    risky = models.IntegerField(label='Please indicate the number of points (between 0 and 40, inclusive) you wish to put in the risky investment.', max=40, min=0)
    riskless = models.IntegerField(max=40, min=0)
    point = models.FloatField(min=0)
    age = models.IntegerField(label='1. Your age (please input a number)', min=18)
    gender = models.StringField(choices=[['Male', 'Male'], ['Female', 'Female'], ['Other', ' Other']], label='2. Your gender', widget=widgets.RadioSelect)
    other = models.StringField(blank=True, label='If you choose "<b>other</b>", please specify:')
    country = models.StringField(label='3. Your country of citizenship')
    preference = models.IntegerField(choices=[[0, '0'], [1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5'], [6, '6'], [7, '7'], [8, '8'], [9, '9'], [10, '10']], label='4. Are you generally a person who is fully prepared to take risks or do you try to avoid taking risks? Please choose a value on the scale below, where the value 0 means ‘not at all willing to take risks’ and the value 10 means ‘very willing to take risks.’', widget=widgets.RadioSelectHorizontal)
    win = models.StringField(choices=[['succeeded', 'succeeded'], ['failed', 'failed']])
    choiceget = models.CurrencyField()
    guessget = models.CurrencyField()
    pointget = models.CurrencyField()
    payoffs = models.CurrencyField()
class Welcome(Page):
    form_model = 'player'
    form_fields = ['idname']
class Instruction(Page):
    form_model = 'player'
class Choice(Page):
    form_model = 'player'
    form_fields = ['choice']
    @staticmethod
    def vars_for_template(player):
        import random
        return dict(
        number = random.randint(1,6))
    @staticmethod
    def before_next_page(player, timeout_happened):
        
        if player.choice == 'Yes': 
            player.choiceget = round(1,2)
        else: 
            player.choiceget = round(0,2)    
class Proportion(Page):
    form_model = 'player'
    form_fields = ['guess']
class Risk(Page):
    form_model = 'player'
    form_fields = ['risky']
    @staticmethod
    def before_next_page(player, timeout_happened):
        import random
        r = random.random()
        player.riskless = 40 - player.risky
        if r > 0.5:
            player.point = player.riskless
            player.win = 'failed'
        else:
            player.point = player.riskless + Constants.multiplier * player.risky
            player.win = 'succeeded'
        
        player.pointget = round(player.point/100,2)   
class Questionnaire(Page):
    form_model = 'player'
    form_fields = ['age', 'gender', 'other', 'country', 'preference']
class ResultsM(Page):
    form_model = 'player'
class MyWaitPage(WaitPage):
    template_name = 'Baseline/Gotowaitpage.html'
    after_all_players_arrive = 'set_payoff'
class ResultsF(Page):
    form_model = 'player'
page_sequence = [Welcome, Instruction, Choice, Proportion, Risk, Questionnaire, ResultsM, MyWaitPage, ResultsF]