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
doc = 'Concluding information'


# ******************************************************************************************************************** #
# *** CLASS CONSTANTS *** #
# ******************************************************************************************************************** #
class Constants(BaseConstants):
    name_in_url = 't7_final'
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
    pass
