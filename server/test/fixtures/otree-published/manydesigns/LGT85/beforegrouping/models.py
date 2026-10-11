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
import random
author = 'LGT85'

doc = """
This will appear just before grouping and gives a random waiting time to participants. The parameters
are set in the settings.py file. Another benefit of the app is that it moves to the next page only if the 
participant stays in the browser.

Since the #Manydesigns project had its own randomization procedure, this app, minimum and maximum waiting times were set to 1.
"""

# Set   session.configs['random_wait_min'] 
# Set   session.configs['random_wait_max'] 



class Constants(BaseConstants):
    name_in_url = 'beforegrouping'
    players_per_group = None
    num_rounds = 1


class Subsession(BaseSubsession):
    def creating_session(self):
        for p in self.get_players():
            p.waiting_time = random.randint(self.session.config['random_wait_min_sec'], self.session.config['random_wait_max_sec'])


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    waiting_time = models.IntegerField()
    timeout = models.BooleanField()
    

    def set_arrival_time(self):
        self.participant.vars['arrival_time'] = time.time()
        # this is for the next app
        



