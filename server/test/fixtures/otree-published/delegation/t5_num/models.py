from otree.api import (
    models, widgets, BaseConstants, BaseSubsession, BaseGroup, BasePlayer,
    Currency as c, currency_range
)
import random
from django.utils.translation import ugettext as _

from django.db.models.signals import pre_save
from django.dispatch import receiver
from otree.models import Participant


# do not record participant's ip address
# --------------------------------------------------------------------------------------------------------------------
@receiver(pre_save, sender=Participant)
def ip_block(sender, instance, **kwargs):
    instance.ip_address = '0.0.0.0'


author = 'Felix Holzmeister'
doc = 'Rasch-based numeracy inventory as proposed by Weller et al (2013)'


# ******************************************************************************************************************** #
# *** CLASS CONSTANTS *** #
# ******************************************************************************************************************** #
class Constants(BaseConstants):

    # oTree settings
    # ---------------------------------------------------------------------------------------------------------------- #
    name_in_url = 't5_num'
    players_per_group = None
    num_rounds = 1

    # numeracy items
    # ---------------------------------------------------------------------------------------------------------------- #
    items = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8']

    questions = [
        # ### Q1 ###
        # Weller et al - Q12
        _('Suppose you have a close friend who has a lump in her breast and must have a mammogram. '
          'Of 100 women like her, 10 of them actually have a malignant tumor and 90 of them do not. '
          'Of the 10 women who actually have a tumor, the mammogram indicates correctly that 9 of '
          'them have a tumor and indicates incorrectly that 1 of them does not. Of the 90 women who '
          'do not have a tumor, the mammogram indicates correctly that 81 of them do not have a tumor '
          'and indicates incorrectly that 9 of them do have a tumor. Imagine that your friend tests '
          'positive (as if she had a tumor), what is the likelihood that she actually has a tumor?'),
        # ### Q2 ###
        # Weller et al - CRT1 (replaced by Toplak et al)
        _('If John can drink one barrel of water in 6 days, and Mary can drink one barrel of '
          'water in 12 days, how long would it take them to drink one barrel of water together?'),
        # ### Q3 ###
        # Weller et al - CRT3 (replaced by Toplak et al)
        _('A man buys a pig for 600 SEK, sells it for 700 SEK, buys it back for '
          '800 SEK, and sells it finally for 900 SEK. How much has he made?'),
        # ### Q4 ###
        # Weller et al - Q3
        _('In a lottery, the chance of winning a car is 1 in 1000. '
          'What percent of lottery tickets win a car?'),
        # ### Q5 ###
        # Weller et al - Q2
        _('In a lottery, the chances of winning a 10.000 SEK prize are 1%. '
          'What is your best guess about how many people would win a 10.000 SEK prize if '
          '1000 people each buy a single lottery ticket?'),
        # ### Q6 ###
        # Weller et al - Q1
        _('Imagine that we roll a fair, six-sided die 1000 times. Out of 1000 rolls, '
          'how many times do you think the die would come up as an even number?'),
        # ### Q7 ###
        # Weller et al - Q9
        _('If the chance of getting a disease is 20 out of 100, '
          'this would be the same as having a ... chance of getting the disease.'),
        # ### Q8 ###
        # Weller et al - Q8b
        _('If the chance of getting a disease is 10%, how many people '
          'would be expected to get the disease out of 1000?')
    ]

    units = [
        _('percent'),  # Q1
        _('days'),     # Q2
        _('SEK'),      # Q3
        _('percent'),  # Q4
        _('people'),   # Q5
        _('times'),    # Q6
        _('percent'),  # Q7
        _('people'),   # Q8
    ]

    args = [
        "min='0' max='100' step='0.01'",  # Q1
        "min='0' max='1000' step='0.1'",  # Q2
        "min='0' max='1000' step='1'",    # Q3
        "min='0' max='100' step='0.01'",  # Q4
        "min='0' max='1000' step='1'",    # Q5
        "min='0' max='1000' step='1'",    # Q6
        "min='0' max='100' step='0.01'",  # Q7
        "min='0' max='1000' step='1'",    # Q8
    ]


# ******************************************************************************************************************** #
# *** CLASS SUBSESSION *** #
# ******************************************************************************************************************** #
class Subsession(BaseSubsession):

    # prepare zipped list and shuffle items
    # ---------------------------------------------------------------------------------------------------------------- #
    def creating_session(self):
        for p in self.get_players():

            inventory = list(
                zip(
                    Constants.items,
                    Constants.questions,
                    Constants.units,
                    Constants.args
                )
            )

            random.shuffle(inventory)
            p.participant.vars['inventory'] = inventory


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
    q1 = models.FloatField(
        doc="Suppose you have a close friend who has a lump in her breast and must have a mammogram. "
            "Of 100 women like her, 10 of them actually have a malignant tumor and 90 of them do not. "
            "Of the 10 women who actually have a tumor, the mammogram indicates correctly that 9 of "
            "them have a tumor and indicates incorrectly that 1 of them does not. Of the 90 women who "
            "do not have a tumor, the mammogram indicates correctly that 81 of them do not have a tumor "
            "and indicates incorrectly that 9 of them do have a tumor. Imagine that your friend tests "
            "positive (as if she had a tumor), what is the likelihood that she actually has a tumor?"
    )
    q2 = models.FloatField(
        doc="If John can drink one barrel of water in 6 days, and Mary can drink one barrel of "
            "water in 12 days, how long would it take them to drink one barrel of water together?"
    )
    q3 = models.FloatField(
        doc="A man buys a pig for 600 SEK, sells it for 700 SEK, buys it back for "
            "800 SEK, and sells it finally for 900 SEK. How much has he made?"
    )
    q4 = models.FloatField(
        doc="In a lottery, the chance of winning a car is 1 in 1000. "
            "What percent of lottery tickets win a car?"
    )
    q5 = models.FloatField(
        doc="In a lottery, the chances of winning a 10.000 SEK prize are 1%. "
            "What is your best guess about how many people would win a 10.000 SEK prize if "
            "1000 people each buy a single lottery ticket?"
    )
    q6 = models.FloatField(
        doc="Imagine that we roll a fair, six-sided die 1000 times. Out of 1000 rolls, "
            "how many times do you think the die would come up as an even number?"
    )
    q7 = models.FloatField(
        doc="If the chance of getting a disease is 20 out of 100, "
            "this would be the same as having a ... chance of getting the disease."
    )
    q8 = models.FloatField(
        doc="If the chance of getting a disease is 10%, how many people "
            "would be expected to get the disease out of 1000?"
    )

    # model field: correct answers
    # ---------------------------------------------------------------------------------------------------------------- #
    score = models.IntegerField(
        initial=0,
        doc="numeracy score (number of correct answers; 0 ... 8)"
    )

    # model fields: confidence
    # ---------------------------------------------------------------------------------------------------------------- #
    correct = models.IntegerField(
        doc="How many of the eight questions you answered on the previous screen did you answer correctly? (1 ... 8)"
    )
    percentile = models.IntegerField(
        doc="Compared to a random sample of the Swedish population, how did you score in terms of correct answers. "
            "Please estimate your position in the ranking. (bottom 10%, bottom 20%, ..., top 20%, top 10%)"
    )

    # verify whether answers have been correct
    # ----------------------------------------------------------------------------------------------------------------
    def set_numeracy_score(self):
        self.score += 1 if self.q1 == 50.00 else 0
        self.score += 1 if self.q2 == 4.00 else 0
        self.score += 1 if self.q3 == 200.00 else 0
        self.score += 1 if self.q4 == 0.10 else 0
        self.score += 1 if self.q5 == 10.00 else 0
        self.score += 1 if self.q6 == 500.00 else 0
        self.score += 1 if self.q7 == 20.00 else 0
        self.score += 1 if self.q8 == 100.00 else 0
