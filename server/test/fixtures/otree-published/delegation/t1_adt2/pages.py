from otree.api import Currency as c, currency_range
from . import models
from ._builtin import Page, WaitPage
from .models import Constants
from settings import LANGUAGE_CODE

from django.utils.translation import ugettext as _


# task progress
# --------------------------------------------------------------------------------------------------------------------
task = 1
task_total = 6
task_progress = task / task_total * 100
n = 2


# variables for all templates
# --------------------------------------------------------------------------------------------------------------------
def vars_for_all_templates(self):
    return {
        'task':             task,
        'task_total':       task_total,
        'task_progress':    task_progress,
        'language':         LANGUAGE_CODE,
        'subject_pool':     self.participant.vars['subject_pool'],
        'treatment':        self.participant.vars['treatment'],
        'risk_level':       self.participant.vars['risk_level']
    }


# ******************************************************************************************************************** #
# *** CLASS TASK PROGRESS
# ******************************************************************************************************************** #
class p0_TaskProgress(Page):

    # only display in round 1
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.subsession.round_number == 1

    # timeout
    # ----------------------------------------------------------------------------------------------------------------
    timeout_seconds = 5


# ******************************************************************************************************************** #
# *** CLASS INSTRUCTIONS
# ******************************************************************************************************************** #
class p1_Instructions0(Page):

    # only display in round 1 of FP/OPM treatments
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.subsession.round_number == 1 \
               and self.participant.vars['subject_pool'] == 'FP' \
               and not self.participant.vars['treatment'] == 'own_lin'


class p1_Instructions1(Page):

    # only display in round 1
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.subsession.round_number == 1


class p1_Instructions2(Page):

    # only display in round 1
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.subsession.round_number == 1


class p1_Instructions3(Page):

    # only display in round 1
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.subsession.round_number == 1


class p1_Instructions4(Page):

    # only display in round 1
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.subsession.round_number == 1


# ******************************************************************************************************************** #
# *** CLASS COMPREHENSION
# ******************************************************************************************************************** #
class p2_Comprehension1(Page):

    # only display in round 1
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.subsession.round_number == 1


class p2_Comprehension2(Page):

    # form model and form fields
    # ----------------------------------------------------------------------------------------------------------------
    form_model = 'player'
    form_fields = ['fail1']

    # only display in round 1
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.subsession.round_number == 1


class p2_Comprehension3(Page):

    # form model and form fields
    # ----------------------------------------------------------------------------------------------------------------
    form_model = 'player'
    form_fields = ['fail2']

    # only display in round 1
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.subsession.round_number == 1


class p2_Comprehension4(Page):

    # form model and form fields
    # ----------------------------------------------------------------------------------------------------------------
    form_model = 'player'
    form_fields = ['fail3']

    # only display in round 1
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.subsession.round_number == 1


class p2_Start(Page):

    # only display in round 1
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.subsession.round_number == 1


# ******************************************************************************************************************** #
# *** CLASS DECISION
# ******************************************************************************************************************** #
class p3_Decision(Page):

    # form model and form fields
    # ----------------------------------------------------------------------------------------------------------------
    form_model = 'player'
    form_fields = [
        'asset_a',
        'asset_b'
    ]

    # variables for template
    # ----------------------------------------------------------------------------------------------------------------
    def vars_for_template(self):

        # specify info for progress bar
        # ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        total = Constants.num_rounds
        page = self.subsession.round_number
        progress = page / total * 100

        # asset payoffs
        # ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        choice_sets = self.participant.vars['adt2_choice_sets']
        set = self.player.set = choice_sets[page - 1][0]

        a_h = self.player.a_h = choice_sets[page - 1][1]
        a_t = self.player.a_t = choice_sets[page - 1][2]
        b_h = self.player.b_h = choice_sets[page - 1][3]
        b_t = self.player.b_t = choice_sets[page - 1][4]

        return {
            'page':             page,
            'total':            total,
            'progress':         progress,
            'set':              set,
            'n':                n,
            'a_h':              a_h,
            'a_t':              a_t,
            'b_h':              b_h,
            'b_t':              b_t,
            'y_title':          _('Your Investment')
        }

    # before next page...
    # ----------------------------------------------------------------------------------------------------------------
    def before_next_page(self):

        # payoffs
        # ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        a_h = float(self.player.a_h)
        a_t = float(self.player.a_t)
        b_h = float(self.player.b_h)
        b_t = float(self.player.b_t)

        # outcome if "heads" is drawn
        # ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        heads = sum([
            a_h * self.player.asset_a,
            b_h * self.player.asset_b
        ]) / 100
        self.player.heads = heads

        # outcome if "tails" is drawn
        # ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        tails = sum([
            a_t * self.player.asset_a,
            b_t * self.player.asset_b
        ]) / 100
        self.player.tails = tails


# ******************************************************************************************************************** #
# *** CLASS PAGE SEQUENCE
# ******************************************************************************************************************** #
page_sequence = [
    p0_TaskProgress,
    p1_Instructions0,
    p1_Instructions1,
    p1_Instructions2,
    p1_Instructions3,
    p1_Instructions4,
    p2_Comprehension1,
    p2_Comprehension2,
    p2_Comprehension3,
    p2_Comprehension4,
    p2_Start,
    p3_Decision
]
