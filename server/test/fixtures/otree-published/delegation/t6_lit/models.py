from otree.api import (
    models, widgets, BaseConstants, BaseSubsession, BaseGroup, BasePlayer,
    Currency as c, currency_range
)

from django.db.models.signals import pre_save
from django.dispatch import receiver
from otree.models import Participant


# do not record participant's ip address
# --------------------------------------------------------------------------------------------------------------------
@receiver(pre_save, sender=Participant)
def ip_block(sender, instance, **kwargs):
    instance.ip_address = '0.0.0.0'


author = 'Felix Holzmeister'
doc = 'Financial Literacy Inventory based on Lussardi and Mitchell (2014)'


# ******************************************************************************************************************** #
# *** CLASS CONSTANTS *** #
# ******************************************************************************************************************** #
class Constants(BaseConstants):
    name_in_url = 't6_lit'
    players_per_group = None
    num_rounds = 1


# ******************************************************************************************************************** #
# *** CLASS SUBSESSION *** #
# ******************************************************************************************************************** #
class Subsession(BaseSubsession):
    pass


# ******************************************************************************************************************** #
# *** CLASS GROUP *** #
# ******************************************************************************************************************** #
class Group(BaseGroup):
    pass


# ******************************************************************************************************************** #
# *** CLASS PLAYER *** #
# ******************************************************************************************************************** #
class Player(BasePlayer):

    # model fields: answers to the questions
    # ----------------------------------------------------------------------------------------------------------------
    q1 = models.StringField(
        doc="Suppose you had 1,000 SEK in a savings account and the interest rate is 20%"
            "per year and you never withdraw money or interest payments. After 5 years,"
            " how much would you have on this account in total?"
            "('more than 2,000 SEK', 'exactly 2,000 SEK', 'less than 2,000 SEK', 'do not know')"
    )
    q2 = models.StringField(
        doc="Imagine that the interest rate on your savings account was 1% per year and"
            "inflation was 2% per year. After 1 year, how much would you be able to buy with"
            "the money in this account?"
            "('more than today', 'exactly the same', 'less than today', 'do not know')"
    )
    q3 = models.StringField(
        doc="Suppose that in the year 2025, your income after tax has doubled and prices of all"
            "goods have doubled too. In 2025, how much will you be able to buy with your income?"
            "('more than today', 'exactly the same', 'less than today', 'do not know')"
    )
    q4 = models.StringField(
        doc="When an investor spreads his money among different assets,"
            "does the risk of losing money in general:"
            "('increase', 'decrease', 'stay the same', 'do not know')"
    )
    q5 = models.StringField(
        doc="If the interest rate falls, what should happen to bond prices?"
            "('rise', 'fallö', 'stay the same', 'none of the above', 'do not know')"
    )
    q6 = models.StringField(
        doc="Which of the following statements is correct?"
            "If somebody buys the stock of firm B in the stock market:"
            "('he owns a part of firm B', 'he has lent money to firm B', "
            "'he is liable for the firm B's debt', 'none of the above', 'do not know')"
    )

    # model field: correct answers
    # ----------------------------------------------------------------------------------------------------------------
    score = models.IntegerField(
        initial=0,
        doc="financial literacy score (number of correct answers; 0 ... 6)"
    )

    # verify whether answers have been correct
    # ----------------------------------------------------------------------------------------------------------------
    def set_literacy_score(self):
        self.score += 1 if self.q1 == 'more' else 0
        self.score += 1 if self.q2 == 'less' else 0
        self.score += 1 if self.q3 == 'same' else 0
        self.score += 1 if self.q4 == 'decr' else 0
        self.score += 1 if self.q5 == 'rise' else 0
        self.score += 1 if self.q6 == 'owns' else 0
