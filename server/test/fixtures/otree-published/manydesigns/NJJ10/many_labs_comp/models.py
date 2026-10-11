from otree.api import (
    models, widgets, BaseConstants, BaseSubsession, BaseGroup, BasePlayer,
    Currency as c, currency_range
)
import csv
import random
import itertools


author = 'cerenay'

doc = """
App for the seller part of the many design study. Will be conducted with the buyer data. 
"""


class Constants(BaseConstants):
    players_per_group = None
    name_in_url = 'questions_comp'
    price= c(1.7)
    price_high = c(3.4)
    value_high=c(10)
    value_low=c(1)
    true_value=c(1.1)
    participation_fee=c(1.3)
    no_lie=c(0)
    num_rounds = 1



class Subsession(BaseSubsession):
    pass

    #def creating_session(self):
            # randomize to treatments
     #       conditions = itertools.cycle(['Comp', 'No_comp'])
      #      for player in self.get_players():
       #         player.condition = next(conditions)
        #for player in self.get_players():
        #player.condition = random.choice(['C', 'T1', 'T2', 'T3']);


class Group(BaseGroup):
    pass




class Player(BasePlayer):
        prolific_id = models.StringField(blank=True,
                                         label='Your ID:'
                                         )

        selling = models.IntegerField(
            choices=[
                [1, 'I do not want to disclose any information about the product'],
                [0, 'I want to disclose the most likely value of the product']
            ],
            label="Do you want  to disclose the most likely value of the product?",
            widget=widgets.RadioSelect)

        ## Personalia
        ## Personalia
        age = models.IntegerField(
            label='3- How old are you?',
            min=10, max=90)

        gender = models.StringField(
            choices=['Male', 'Female', 'Other', 'I do not want to answer'],
            label='',
            widget=widgets.RadioSelect)

        edu = models.StringField(
            choices=['Less than high school', 'High school graduate', 'Some College', '2 Year Degree', '4 Year Degree',
                     'Professional degree', 'Doctorate'],
            label='What is your highest academic achievement?',
            widget=widgets.RadioSelect
        )

        Political = models.IntegerField(
            label='',
            choices=[
                [1, '1 - Disagree'],
                [2, '2 - Somewhat Disagree'],
                [3, '3 - Neither disagree nor agree'],
                [4, '4 - Somewhat Agree'],
                [5, '5 - Agree'],
            ],
        )

        consumer_mistake = models.IntegerField(
            label='',
            choices=[
                [1, '1 - Disagree'],
                [2, '2 - Somewhat Disagree'],
                [3, '3 - Neither disagree nor agree'],
                [4, '4 - Somewhat Agree'],
                [5, '5 - Agree'],
            ],
        )

        risk = models.IntegerField(
            label='',
            choices=[
                [1, '1 - Disagree'],
                [2, '2 - Somewhat Disagree'],
                [3, '3 - Neither disagree nor agree'],
                [4, '4 - Somewhat Agree'],
                [5, '5 - Agree'],
            ],
        )

        trust = models.IntegerField(
            label='',
            choices=[
                [1, '1 - Disagree'],
                [2, '2 - Somewhat Disagree'],
                [3, '3 - Neither disagree nor agree'],
                [4, '4 - Somewhat Agree'],
                [5, '5 - Agree'],
            ],
        )
        moral_tax = models.IntegerField(
            label='',
            choices=[
                [1, '1 - Disagree'],
                [2, '2 - Somewhat Disagree'],
                [3, '3 - Neither disagree nor agree'],
                [4, '4 - Somewhat Agree'],
                [5, '5 - Agree'],
            ],
        )

        # beliefs = models.IntegerField(
        #    label='Please ',
        #   choices=[
        #      [0, '0 - Very Liberal'],
        #     [1, '1'],
        #    [2, '2'],
        # put a slider for the belief on the share of sellers cheating

        General = models.StringField(blank=True,
                                     label='Do you have any other comments regarding this experiment?'
                                     )

        prolific_id = models.StringField(blank=True,
                                         label='Your ID:'
                                         )

        price = models.IntegerField()


