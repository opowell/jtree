from otree.api import Currency as c, currency_range
from . import models
from ._builtin import Page, WaitPage
from .models import Constants
from settings import LANGUAGE_CODE

from django.utils.translation import ugettext as _


# task progress
# --------------------------------------------------------------------------------------------------------------------
task = 2
task_total = 6
task_progress = task / task_total * 100
n = 5


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
class p1_Instructions(Page):

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
        'asset_b',
        'asset_c',
        'asset_d',
        'asset_e'
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
        choice_sets = self.participant.vars['adt5_choice_sets']
        set = self.player.set = choice_sets[page - 1][0]

        a_h = self.player.a_h = choice_sets[page - 1][1]
        a_t = self.player.a_t = choice_sets[page - 1][2]
        b_h = self.player.b_h = choice_sets[page - 1][3]
        b_t = self.player.b_t = choice_sets[page - 1][4]
        c_h = self.player.c_h = choice_sets[page - 1][5]
        c_t = self.player.c_t = choice_sets[page - 1][6]
        d_h = self.player.d_h = choice_sets[page - 1][7]
        d_t = self.player.d_t = choice_sets[page - 1][8]
        e_h = self.player.e_h = choice_sets[page - 1][9]
        e_t = self.player.e_t = choice_sets[page - 1][10]

        return {
            'page':         page,
            'total':        total,
            'progress':     progress,
            'set':          set,
            'n':            n,
            'a_h':          a_h,
            'a_t':          a_t,
            'b_h':          b_h,
            'b_t':          b_t,
            'c_h':          c_h,
            'c_t':          c_t,
            'd_h':          d_h,
            'd_t':          d_t,
            'e_h':          e_h,
            'e_t':          e_t,
            'y_title':      _('Your Investment')
        }

    # before next page...
    # ----------------------------------------------------------------------------------------------------------------
    def before_next_page(self):
        round = self.subsession.round_number
        choice_sets = self.participant.vars['adt5_choice_sets']

        # payoffs
        # ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        a_h = float(self.player.a_h)
        a_t = float(self.player.a_t)
        b_h = float(self.player.b_h)
        b_t = float(self.player.b_t)
        c_h = float(self.player.c_h)
        c_t = float(self.player.c_t)
        d_h = float(self.player.d_h)
        d_t = float(self.player.d_t)
        e_h = float(self.player.e_h)
        e_t = float(self.player.e_t)

        # outcome if "heads" is drawn
        # ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        heads = sum([
            a_h * self.player.asset_a,
            b_h * self.player.asset_b,
            c_h * self.player.asset_c,
            d_h * self.player.asset_d,
            e_h * self.player.asset_e
        ]) / 100
        self.player.heads = heads

        # outcome if "tails" is drawn
        # ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        tails = sum([
            a_t * self.player.asset_a,
            b_t * self.player.asset_b,
            c_t * self.player.asset_c,
            d_t * self.player.asset_d,
            e_t * self.player.asset_e
        ]) / 100
        self.player.tails = tails


# ******************************************************************************************************************** #
# *** CLASS RISKINESS
# ******************************************************************************************************************** #
class p4_Riskiness(Page):

    # form model and form fields
    # ----------------------------------------------------------------------------------------------------------------
    form_model = 'player'
    form_fields = ['risk_perception']

    # only display in last round
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.subsession.round_number == Constants.num_rounds


# ******************************************************************************************************************** #
# *** CLASS PAGE SEQUENCE
# ******************************************************************************************************************** #
page_sequence = [
    p0_TaskProgress,
    p1_Instructions,
    p2_Comprehension1,
    p2_Comprehension2,
    p2_Comprehension3,
    p2_Comprehension4,
    p2_Start,
    p3_Decision,
    p4_Riskiness
]
