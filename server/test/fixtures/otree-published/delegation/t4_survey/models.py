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
doc = 'Survey Questions'


# ******************************************************************************************************************** #
# *** CLASS CONSTANTS *** #
# ******************************************************************************************************************** #
class Constants(BaseConstants):
    name_in_url = 't4_survey'
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

    # model fields - survey 1
    # ----------------------------------------------------------------------------------------------------------------
    risk_gen = models.IntegerField(
        min=0,
        max=10,
        doc="Are you generally a person who is willing to take risks or do "
            "you try to avoid taking risks?"
    )
    time_gen = models.IntegerField(
        min=0,
        max=10,
        doc="How willing are you to give up something that is beneficial for "
            "you today in order to benefit more from that in the future?"
    )

    # model fields - survey 2
    # ----------------------------------------------------------------------------------------------------------------
    risk_fin = models.IntegerField(
        min=0,
        max=10,
        doc="I am generally willing to take risks in financial matters."
    )
    trust_gen = models.IntegerField(
        min=0,
        max=10,
        doc="I generally trust other people."
    )
    trust_fin = models.IntegerField(
        min=0,
        max=10,
        doc="I generally trust employees from the finance industry."
    )
    trust_algo = models.IntegerField(
        min=0,
        max=10,
        doc="I generally trust robo-advisors (i.e. computer programs) in financial matters."
    )

    # model fields - survey 3
    # ----------------------------------------------------------------------------------------------------------------
    altruism = models.IntegerField(
        min=0,
        max=10000,
        doc="charitable giving in a hypothetical dictator game (0 - 10000)"
    )

    # model fields - survey 4
    # ----------------------------------------------------------------------------------------------------------------
    blame_others = models.IntegerField(
        min=0,
        max=10,
        doc="If you hurt yourself accidentally, do you sometimes blame somebody who happens to "
            "be nearby even though you realize, on reflection, that they were not responsible?"
    )
    blame_tempt = models.IntegerField(
        min=0,
        max=10,
        doc="Can you easily resist the temptation to blame others for the accidents that happen to you?"
    )

    # model fields - survey 5
    # ----------------------------------------------------------------------------------------------------------------
    investments = models.IntegerField(
        min=0,
        max=10,
        doc="I frequently invest in stocks and mutual funds myself (not through the national pension system)."
    )
    del_prof = models.IntegerField(
        min=0,
        max=10,
        blank=True,
        doc="I delegate my investment decisions (e.g., purchase of stocks, bonds, investment funds, real estate) "
            "to financial advisers at banks or other institutions and refrain from taking decisions myself."
    )
    del_algo = models.IntegerField(
        min=0,
        max=10,
        blank=True,
        doc="I delegate my investment decisions (e.g., purchase of stocks, bonds, investment funds, real estate) "
            "to robo-advisors at banks or other institutions and refrain from taking decisions myself."
    )
    experts = models.IntegerField(
        min=0,
        max=10,
        blank=True,
        doc="I use the expertise of financial advisers for my investments/pension savings."
    )
    responsible = models.IntegerField(
        min=0,
        max=10,
        doc="I am solely responsible for financial decisions in my household."
    )
