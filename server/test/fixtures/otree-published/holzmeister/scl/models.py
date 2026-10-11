from otree.api import (
    models, widgets, BaseConstants, BaseSubsession, BaseGroup, BasePlayer,
    Currency as c, currency_range
)
from scl.config import *
import random


author = 'Felix Holzmeister'
doc = """
Lottery choice task as proposed by Eckel/Grossman (2002), Evolution and Human Behavior 23 (4), 281–295.
"""


# ******************************************************************************************************************** #
# *** CLASS SUBSESSION *** #
# ******************************************************************************************************************** #
class Subsession(BaseSubsession):

    def creating_session(self):
        for p in self.get_players():

            n = Constants.num_lotteries

            # create list of lottery indices
            # --------------------------------------------------------------------------------------------------------
            indices = [j for j in range(1, n + 1)]

            # create list of low and high outcomes (matched by index)
            # --------------------------------------------------------------------------------------------------------
            outcomes_lo = [c(Constants.sure_payoff - Constants.delta_lo * j) for j in range(0, n)]
            outcomes_hi = [c(Constants.sure_payoff + Constants.delta_hi * j) for j in range(0, n)]

            # append indices and outcomes by "risk loving" lottery if <risk_loving = True>
            # --------------------------------------------------------------------------------------------------------
            if Constants.risk_loving:
                indices.append(n + 1)
                outcomes_lo.append(c(outcomes_lo[-1] - Constants.delta_hi))
                outcomes_hi.append(c(outcomes_hi[-1] + Constants.delta_hi))

            # create list of lotteries
            # --------------------------------------------------------------------------------------------------------
            p.participant.vars['scl_lotteries'] = list(
                zip(indices, outcomes_lo, outcomes_hi)
            )

            # randomize order of lotteries if <random_order = True>
            # --------------------------------------------------------------------------------------------------------
            if Constants.random_order:
                random.shuffle(
                    p.participant.vars['scl_lotteries']
                )


# ******************************************************************************************************************** #
# *** CLASS GROUP *** #
# ******************************************************************************************************************** #
class Group(BaseGroup):
    pass


# ******************************************************************************************************************** #
# *** CLASS PLAYER *** #
# ******************************************************************************************************************** #
class Player(BasePlayer):

    # add model fields to class player
    # ----------------------------------------------------------------------------------------------------------------
    lottery_choice = models.IntegerField()
    outcome_to_pay = models.StringField()
    outcome_lo = models.CurrencyField()
    outcome_hi = models.CurrencyField()

    # set payoffs
    # ----------------------------------------------------------------------------------------------------------------
    def set_payoffs(self):

        # choose outcome to pay (high or low) dependent on <probability>
        # ------------------------------------------------------------------------------------------------------------
        p = Constants.probability
        rnd = random.randint(1, 100)
        self.outcome_to_pay = "high" if rnd <= p else "low"

        # select lottery choice out of list of lotteries
        # ------------------------------------------------------------------------------------------------------------
        lottery_selected = [i for i in self.participant.vars['scl_lotteries'] if i[0] == self.lottery_choice]
        lottery_selected = lottery_selected[0]

        # store payoffs of chosen lottery in the model
        # ------------------------------------------------------------------------------------------------------------
        self.outcome_lo = lottery_selected[1]
        self.outcome_hi = lottery_selected[2]

        # set player's payoff
        # ------------------------------------------------------------------------------------------------------------
        if self.outcome_to_pay == "high":
            self.payoff = self.outcome_hi
        else:
            self.payoff = self.outcome_lo

        # set payoff as global variable
        # ------------------------------------------------------------------------------------------------------------
        self.participant.vars['scl_payoff'] = self.payoff
