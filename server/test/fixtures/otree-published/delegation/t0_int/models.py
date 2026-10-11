from otree.api import (
    models, widgets, BaseConstants, BaseSubsession, BaseGroup, BasePlayer,
    Currency as c, currency_range
)
# from django.conf import settings
# import os
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
doc = 'Introduction and treatment allocation'


# ******************************************************************************************************************** #
# *** CLASS CONSTANTS *** #
# ******************************************************************************************************************** #
class Constants(BaseConstants):
    name_in_url = 't0_int'
    players_per_group = None
    num_rounds = 1

    # read pid's for testing with bots
    # ----------------------------------------------------------------------------------------------------------------
    # fp = list(open(os.path.join(settings.BASE_DIR, '_rooms\\PIDs - FinanceProfessionals.txt')))
    # gp = list(open(os.path.join(settings.BASE_DIR, '_rooms\\PIDs - GeneralPopulation.txt')))


# ******************************************************************************************************************** #
# *** CLASS SUBSESSION *** #
# ******************************************************************************************************************** #
class Subsession(BaseSubsession):

    # treatment allocation to participants
    # ----------------------------------------------------------------------------------------------------------------
    def creating_session(self):

        # copies of pid lists
        # self.session.vars['fp'] = list.copy(Constants.fp)[:1000]
        # self.session.vars['gp'] = list.copy(Constants.gp)[:1000]

        for p in self.get_players():

            # subject pool allocation
            # ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

            # randomly assign pool if session config is undefined
            if self.session.config['subject_pool'] == '':
                p.participant.vars['subject_pool'] = p.subject_pool = random.choice(['FP', 'GP', 'GP'])

            # assign session configuration
            elif self.session.config['subject_pool'] != '':
                p.participant.vars['subject_pool'] = p.subject_pool = self.session.config['subject_pool']

            # random treatment allocation
            # ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
            if self.session.config['random_allocation']:

                # treatment allocation for general population sample (delegation to professional or algorithm)
                if p.subject_pool == 'GP':
                    p.participant.vars['treatment'] = p.treatment = random.choice(['pro_flat', 'pro_lin', 'algo'])

                # treatment allocation for financial professionals (other people's money or own decision)
                elif p.subject_pool == 'FP':
                    p.participant.vars['treatment'] = p.treatment = random.choice(['opm_flat', 'opm_lin', 'own_lin'])

            # fixed treatment allocation (via session configs) for testing purposes
            # ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
            elif not self.session.config['random_allocation']:
                p.participant.vars['treatment'] = p.treatment = self.session.config['treatment']

            # randomly determine customer's risk levels to be displayed in FP/OPM treatments
            # ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
            if p.subject_pool == 'FP' and p.treatment != 'own_lin':
                p.participant.vars['risk_level'] = p.risk_level = random.randint(1, 4)
            else:
                p.participant.vars['risk_level'] = None

            # assign random participant label if using bots for testing
            # ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
            # if self.session.config['use_browser_bots']and self.round_number == 1:
            #     if p.subject_pool == 'FP':
            #         fp_pid = random.choice(self.session.vars['fp'])
            #         self.session.vars['fp'].remove(fp_pid)
            #         p.participant.label = fp_pid
            #
            #     if p.subject_pool == 'GP':
            #         gp_pid = random.choice(self.session.vars['gp'])
            #         self.session.vars['gp'].remove(gp_pid)
            #         p.participant.label = gp_pid


# ******************************************************************************************************************** #
# *** CLASS GROUP *** #
# ******************************************************************************************************************** #
class Group(BaseGroup):
    pass


# ******************************************************************************************************************** #
# *** CLASS PLAYER *** #
# ******************************************************************************************************************** #
class Player(BasePlayer):

    # model fields: os and browser information
    # ----------------------------------------------------------------------------------------------------------------
    os_name = models.StringField(
        blank=True,
        doc="operating system"
    )
    os_version = models.StringField(
        blank=True,
        doc="operating system version"
    )
    browser_name = models.StringField(
        blank=True,
        doc="browser"
    )
    browser_version = models.StringField(
        blank=True,
        doc="browser version number"
    )

    # model fields: subject pool and treatment
    # ----------------------------------------------------------------------------------------------------------------
    subject_pool = models.StringField(
        doc="""
            'FP' ... financial professionals; \n
            'GP' ... general population
            """
    )
    treatment = models.StringField(
        doc="""
            financial professional (FP): \n
              'opm_flat': other people's money, flat incentives \n
              'opm_lin':  other people's money, linear incentives \n
              'own_lin':  own account, linear incentives \n
            general population (GP): \n
              'pro_flat': delegation to professional with flat incentives \n
              'pro_lin':  delegation to professional with linear incentives \n
              'algo':     delegation to algorithm / robo advisor
            """
    )
    risk_level = models.IntegerField(
        doc="""
            clients' risk level (1 - 4; randomly assigned; for professionals only) \n
            professionals in 'opm_flat' and 'opm_lin' are asked to take clients' risk 
            level into account when deciding on the account of their customers.
            """
    )
