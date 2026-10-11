from otree.api import (
    models, widgets, BaseConstants, BaseSubsession, BaseGroup, BasePlayer,
    Currency as c, currency_range
)
from cem.config import *
import random
from random import randrange


author = 'Felix Holzmeister'

doc = """
Certainty equivalent method as proposed by Cohen et al. (1987) and Abdellaoui et al. (2011),
as well as variations thereof suggested by Bruner (2009) and Gächter et al. (2010).
"""


# ******************************************************************************************************************** #
# *** CLASS SUBSESSION
# ******************************************************************************************************************** #
class Subsession(BaseSubsession):

    # initiate lists before session starts in round 1
    # ----------------------------------------------------------------------------------------------------------------
    def creating_session(self):
        if self.round_number == 1:

            n = Constants.num_choices
            for p in self.get_players():

                # create list of lottery indices
                # ----------------------------------------------------------------------------------------------------
                indices = [j for j in range(1, n + 1)]

                # create list corresponding to form_field variables including all choices
                # ----------------------------------------------------------------------------------------------------
                form_fields = ['choice_' + str(k) for k in indices]

                # create list of probabilities
                # ----------------------------------------------------------------------------------------------------
                if Constants.variation == 'probability':
                    probabilities = [Constants.probability + (k - 1) * Constants.step_size for k in indices]
                else:
                    probabilities = [Constants.probability for k in indices]

                # create list of high lottery payoffs
                # ----------------------------------------------------------------------------------------------------
                if Constants.variation == 'lottery_hi':
                    lottery_hi = [c(Constants.lottery_hi + (k - 1) * Constants.step_size) for k in indices]
                else:
                    lottery_hi = [c(Constants.lottery_hi) for k in indices]

                # create list of low lottery payoffs
                # ----------------------------------------------------------------------------------------------------
                if Constants.variation == 'lottery_lo':
                    lottery_lo = [c(Constants.lottery_lo - (k - 1) * Constants.step_size) for k in indices]
                else:
                    lottery_lo = [c(Constants.lottery_lo) for k in indices]

                # create list of sure payoffs
                # ----------------------------------------------------------------------------------------------------
                if Constants.variation == 'sure_payoff':
                    sure_payoffs = [c(Constants.sure_payoff + (k-1) * Constants.step_size) for k in indices]
                else:
                    sure_payoffs = [c(Constants.sure_payoff) for k in indices]

                # create list of choices
                # ----------------------------------------------------------------------------------------------------
                p.participant.vars['cem_choices'] = list(
                    zip(
                        indices,
                        form_fields,
                        probabilities,
                        lottery_hi,
                        lottery_lo,
                        sure_payoffs
                    )
                )

                # randomly determine index/choice of binary decision to pay
                # ----------------------------------------------------------------------------------------------------
                p.participant.vars['cem_index_to_pay'] = random.choice(indices)
                p.participant.vars['cem_choice_to_pay'] = 'choice_' + str(p.participant.vars['cem_index_to_pay'])

                # randomize order of lotteries if <random_order = True>
                # ----------------------------------------------------------------------------------------------------
                if Constants.random_order:
                    random.shuffle(p.participant.vars['cem_choices'])

                # initiate list for choices made
                # ----------------------------------------------------------------------------------------------------
                p.participant.vars['cem_choices_made'] = [None for j in range(1, n + 1)]

            # generate random switching point for PlayerBot in tests.py
            # --------------------------------------------------------------------------------------------------------
            for participant in self.session.get_participants():
                participant.vars['cem-bot_switching_point'] = random.randint(1, n)


# ******************************************************************************************************************** #
# *** CLASS GROUP
# ******************************************************************************************************************** #
class Group(BaseGroup):
    pass


# ******************************************************************************************************************** #
# *** CLASS PLAYER
# ******************************************************************************************************************** #
class Player(BasePlayer):

    # add model fields to class player
    # ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    for j in range(1, Constants.num_choices + 1):
        locals()['choice_' + str(j)] = models.StringField()
    del j

    random_draw = models.IntegerField()
    choice_to_pay = models.StringField()
    option_to_pay = models.StringField()
    inconsistent = models.IntegerField()
    switching_row = models.IntegerField()

    # set player's payoff
    # ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    def set_payoffs(self):

        # random draw to determine whether to pay the "high" or "low" outcome of the randomly picked lottery
        # ------------------------------------------------------------------------------------------------------------
        self.random_draw = randrange(1, 100)

        # set <choice_to_pay> to participant.var['choice_to_pay'] determined creating_session
        # ------------------------------------------------------------------------------------------------------------
        self.choice_to_pay = self.participant.vars['cem_choice_to_pay']

        # determine whether the lottery (option "A") or the sure payoff (option "B") was chosen
        # ------------------------------------------------------------------------------------------------------------
        self.option_to_pay = getattr(self, self.choice_to_pay)

        # set player's payoff
        # ------------------------------------------------------------------------------------------------------------
        indices = [list(t) for t in zip(*self.participant.vars['cem_choices'])][0]
        index_to_pay = indices.index(self.participant.vars['cem_index_to_pay']) + 1
        choice_to_pay = self.participant.vars['cem_choices'][index_to_pay - 1]

        if self.option_to_pay == 'A':
            if self.random_draw <= choice_to_pay[2]:
                self.payoff = Constants.endowment + choice_to_pay[3]
            else:
                self.payoff = Constants.endowment + choice_to_pay[4]
        else:
            self.payoff = Constants.endowment + choice_to_pay[5]

        # set payoff as global variable
        # ------------------------------------------------------------------------------------------------------------
        self.participant.vars['cem_payoff'] = self.payoff

    # determine consistency
    # ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    def set_consistency(self):

        n = Constants.num_choices

        # replace A's by 1's and B's by 0's
        self.participant.vars['cem_choices_made'] = [
            1 if j == 'A' else 0 for j in self.participant.vars['cem_choices_made']
        ]

        # check for multiple switching behavior
        for j in range(1, n):
            choices = self.participant.vars['cem_choices_made']
            self.inconsistent = 1 if choices[j] > choices[j - 1] else 0
            if self.inconsistent == 1:
                break

    # determine switching row
    # ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    def set_switching_row(self):

        # set switching point to row number of first 'B' choice
        if self.inconsistent == 0:
            self.switching_row = sum(self.participant.vars['cem_choices_made']) + 1
