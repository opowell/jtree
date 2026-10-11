from django.contrib.staticfiles.utils import get_files
from django.contrib.staticfiles.storage import StaticFilesStorage
import random
from otree.api import (
    models,
    widgets,
    BaseConstants,
    BaseSubsession,
    BaseGroup,
    BasePlayer,
    Currency as c,
    currency_range,
)
import time
from scipy.stats import rankdata
from .filenames import filenames
author = 'LGT85'

doc = """
Although the name might mislead you, this app contains the core of the experiment including instructions and results.

Another thing that should be noted is that the captcha task actually uses images, rather than generating it on the fly.
This was done to improve the performance of the experiment to avoid the lag that would occur when generating the captcha.

Another alternative was to use JavaScript to generate the captcha. However, we didn't want to use a client-sided solution
since it might have lead to non-standart generation or potentially introduce cheating.

The captcas were generated with Clapcha package (https://github.com/kuszaj/claptcha) and the files were saved in ../_static folder.
The filenames of the captchas are stored in the filenames.py file.
"""


class Constants(BaseConstants):
    name_in_url = 'captcha'
    players_per_group = 4
    num_rounds = 1
    player_names = ["J","K","L","M"]


class Subsession(BaseSubsession):
    def creating_session(self):
        for p in self.get_players():
            p.competition = self.session.config['competition']

    def group_by_arrival_time_method(self, waiting_players):
        num_waiting = len(waiting_players)
        self.session.vars['num_waiting'] = num_waiting
        print("number of waiting players:", self.session.vars['num_waiting'], " ", time.strftime('%X %x %Z'))
        if len(waiting_players) >= Constants.players_per_group:
            print("creating group")
            return waiting_players[:Constants.players_per_group]
        for p in waiting_players:
            if p.waiting_too_long():
                return [p]



class Group(BaseGroup):
    # decision
    selected_id_in_group = models.IntegerField()
    selected_takeaway = models.IntegerField()

    def assign_names_group(self):
        for p in self.get_players():
            p.assign_names()


    def calculate_payoffs(self):
        players_in_group = self.get_players() # ordered by id in group but doublecheck
        # calculate initial payoffs
        for p in players_in_group:
            p.payoff_before = c(p.points * self.session.config['real_world_currency_per_point'])


        self.selected_id_in_group = random.choice(range(1,Constants.players_per_group+1))
        self.selected_takeaway = self.get_player_by_id(self.selected_id_in_group).takeaway

        # calculating payoffs after redistribution
        for p in players_in_group:
            p.is_dictator = True if p.id_in_group == self.selected_id_in_group else False
            
            if p.is_dictator:
                p.payoff_after = p.payoff_before + sum([(self.selected_takeaway/100) * q.payoff_before for q in p.get_others_in_group()])

            if not p.is_dictator:
                p.payoff_after = p.payoff_before * (1 - self.selected_takeaway/100)
                
            p.payoff = p.payoff_after


    # rank calculation
    def calculate_ranks(self):
        players = self.get_players()
        players_ranked = sorted(players, key=lambda p: p.payoff_after, reverse=True)

        for i,p in enumerate(players_ranked):
            p.rank = i + 1


    def final_calculation(self):
        self.calculate_payoffs()
        self.calculate_ranks()

    def get_performance_data_ranked(self):
        #self.calculate_ranks()
        players = self.get_players()
        players_ranked = sorted(players, key=lambda p: p.rank)

        payoffs = [p.payoff_after for p in players_ranked]
        names = [p.visible_name for p in players_ranked]
        ids = [p.id_in_group for p in players_ranked]

        return dict(payoffs=payoffs, names=names, ids=ids)

    def get_performance_data_alph(self):
        players = self.get_players()

        payoffs = [p.payoff_after for p in players]
        names = [p.visible_name for p in players]
        ids = [p.id_in_group for p in players]

        return dict(payoffs=payoffs, names=names, ids=ids)




class Player(BasePlayer):
    timeout = models.BooleanField(initial=False)
    visible_name = models.StringField()
    # captcha
    random_file = models.StringField()
    points = models.IntegerField(initial=0)
    payoff_before = models.CurrencyField(initial=0)
    payoff_after = models.CurrencyField()

    user_input = models.StringField(label="Please enter the letters and numbers you see above")

    # decision
    competition = models.BooleanField()
    takeaway = models.IntegerField(initial=0)
    is_dictator = models.BooleanField()

    # results
    rank = models.IntegerField()

    def assign_names(self):
        print("assigning names function is run")
        self.visible_name = Constants.player_names[self.id_in_group - 1]


    def get_random_image(self):
        random_file = random.choice(filenames).split('/',1)[-1]
        self.random_file = random_file
        return random_file

    def asses_the_answer(self, answer):
        random_file_key = self.random_file[5:-7:2]
        if random_file_key == answer or answer == "secretcode":
            self.points += 1


    def live_get_answer(self, data):
        self.asses_the_answer(data)
        new_image = self.get_random_image()
        return{self.id_in_group: new_image}


    def waiting_too_long(self):
        return time.time() - self.participant.vars['arrival_time'] > self.session.config['matching_timeout_mins'] * 60


        
