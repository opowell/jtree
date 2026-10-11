from otree.api import (
    models, widgets, BaseConstants, BaseSubsession, BaseGroup, BasePlayer,
    Currency as c, currency_range
)
import pandas as pd
import random

from django.db.models.signals import pre_save
from django.dispatch import receiver
from otree.models import Participant


# do not record participant's ip address
# --------------------------------------------------------------------------------------------------------------------
@receiver(pre_save, sender=Participant)
def ip_block(sender, instance, **kwargs):
    instance.ip_address = '0.0.0.0'


author = 'Felix Holzmeister'
doc = 'Allocation decision task with five assets as in Banks et al. (2017)'


# ******************************************************************************************************************** #
# *** CLASS CONSTANTS
# ******************************************************************************************************************** #
class Constants(BaseConstants):
    name_in_url = 't2_adt5'
    players_per_group = None

    # import choice sets from *.xlsx-file
    # ----------------------------------------------------------------------------------------------------------------
    f = pd.read_excel('t2_adt5/static/t2_adt5/data/assets.xlsx')
    choice_sets = list(zip(
        f['set'],
        f['a_h'].tolist(), f['a_t'].tolist(),
        f['b_h'].tolist(), f['b_t'].tolist(),
        f['c_h'].tolist(), f['c_t'].tolist(),
        f['d_h'].tolist(), f['d_t'].tolist(),
        f['e_h'].tolist(), f['e_t'].tolist(),
    ))

    num_rounds = len(f['n'])


# ******************************************************************************************************************** #
# *** CLASS SUBSESSION
# ******************************************************************************************************************** #
class Subsession(BaseSubsession):

    # shuffle choice sets on participant level
    # ----------------------------------------------------------------------------------------------------------------
    def creating_session(self):
        for p in self.get_players():
            if self.round_number == 1:
                p.participant.vars['adt5_choice_sets'] = Constants.choice_sets.copy()
                random.shuffle(p.participant.vars['adt5_choice_sets'])


# ******************************************************************************************************************** #
# *** CLASS GROUP
# ******************************************************************************************************************** #
class Group(BaseGroup):
    pass


# ******************************************************************************************************************** #
# *** CLASS PLAYER
# ******************************************************************************************************************** #
class Player(BasePlayer):

    # model fields: comprehension
    # ----------------------------------------------------------------------------------------------------------------
    fail1 = models.IntegerField(
        default=0,
        blank=True,
        doc="number of incorrect answers in comprehension question #1"
    )
    fail2 = models.IntegerField(
        default=0,
        blank=True,
        doc="number of incorrect answers in comprehension question #2"
    )
    fail3 = models.IntegerField(
        default=0,
        blank=True,
        doc="number of incorrect answers in comprehension question #3"
    )

    # model fields: assets
    # ----------------------------------------------------------------------------------------------------------------
    set = models.IntegerField(
        doc="number/id of decision (1 - 10)"
    )
    a_h = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        doc="asset a: outcome heads"
    )
    a_t = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        doc="asset a: outcome tails"
    )
    b_h = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        doc="asset b: outcome heads"
    )
    b_t = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        doc="asset b: outcome tails"
    )
    c_h = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        doc="asset c: outcome heads"
    )
    c_t = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        doc="asset c: outcome tails"
    )
    d_h = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        doc="asset d: outcome heads"
    )
    d_t = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        doc="asset d: outcome tails"
    )
    e_h = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        doc="asset e: outcome heads"
    )
    e_t = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        doc="asset e: outcome tails"
    )

    # model fields: investment decision
    # ----------------------------------------------------------------------------------------------------------------
    asset_a = models.IntegerField(
        default=0,
        blank=True,
        null=True,
        doc="player's investment decision: allocation to asset a"
    )
    asset_b = models.IntegerField(
        default=0,
        blank=True,
        null=True,
        doc="player's investment decision: allocation to asset b"
    )
    asset_c = models.IntegerField(
        default=0,
        blank=True,
        null=True,
        doc="player's investment decision: allocation to asset c"
    )
    asset_d = models.IntegerField(
        default=0,
        blank=True,
        null=True,
        doc="player's investment decision: allocation to asset d"
    )
    asset_e = models.IntegerField(
        default=0,
        blank=True,
        null=True,
        doc="player's investment decision: allocation to asset e"
    )

    # model fields: outcomes
    # ----------------------------------------------------------------------------------------------------------------
    heads = models.DecimalField(
        max_digits=7,
        decimal_places=4,
        doc="portfolio payoff if coin shows up heads"
    )
    tails = models.DecimalField(
        max_digits=7,
        decimal_places=4,
        doc="portfolio payoff if coin shows up tails"
    )

    # set globals for randomly chosen decision
    # ----------------------------------------------------------------------------------------------------------------
    risk_perception = models.IntegerField(
        doc="player's self-reported perception of the risk level associated with the 25 decisions (scale: 1 - 4)"
    )
