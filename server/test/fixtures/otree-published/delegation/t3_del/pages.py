from otree.api import Currency as c, currency_range
from ._builtin import Page, WaitPage
from .models import Constants

from django.utils.translation import ugettext as _

# task progress
# --------------------------------------------------------------------------------------------------------------------
task = 3
task_total = 6
task_progress = task / task_total * 100


# variables for all templates
# ----------------------------------------------------------------------------------------------------------------
def vars_for_all_templates(self):
    return {
        'task':             task,
        'task_total':       task_total,
        'task_progress':    task_progress,
        'subject_pool':     self.participant.vars['subject_pool'],
        'treatment':        self.player.participant.vars['treatment']
    }


# ******************************************************************************************************************** #
# *** CLASS TASK PROGRESS
# ******************************************************************************************************************** #
class p0_TaskProgress(Page):

    # only display to general population sample
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.participant.vars['subject_pool'] == 'GP'

    # timeout
    # ----------------------------------------------------------------------------------------------------------------
    timeout_seconds = 5


# ******************************************************************************************************************** #
# *** CLASS INSTRUCTIONS
# ******************************************************************************************************************** #
class p1_Instructions(Page):

    # only display to general population sample
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.participant.vars['subject_pool'] == 'GP'


# ******************************************************************************************************************** #
# *** CLASS DELEGATION DECISION
# ******************************************************************************************************************** #
class p2_DelegationDecision(Page):

    # form model and form fields
    # ----------------------------------------------------------------------------------------------------------------
    form_model = 'player'
    form_fields = [
        'delegation',
        'wtp',
        'risk'
    ]

    # only display to general population sample
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.participant.vars['subject_pool'] == 'GP'

    # variables for template
    # ----------------------------------------------------------------------------------------------------------------
    def vars_for_template(self):

        # decision maker depending on treatment
        # ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
        decision_maker = _('a financial professional') \
            if not self.participant.vars['treatment'] == 'algo' \
            else _('a robo-advisor')

        return {
            'decision_maker': decision_maker
        }

    # before next page
    # ----------------------------------------------------------------------------------------------------------------
    def before_next_page(self):

        if self.player.delegation == 0:
            self.player.wtp = None
            self.player.risk = None


# ******************************************************************************************************************** #
# *** PAGE SEQUENCE *** #
# ******************************************************************************************************************** #
page_sequence = [
    p0_TaskProgress,
    p1_Instructions,
    p2_DelegationDecision
]
