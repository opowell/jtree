from otree.api import Currency as c, currency_range
from ._builtin import Page, WaitPage
from .models import Constants


# ******************************************************************************************************************** #
# *** CLASS FEEDBACK
# ******************************************************************************************************************** #
class p1_ThankYou(Page):

    # variables for template
    # ----------------------------------------------------------------------------------------------------------------
    def vars_for_template(self):

        label = self.participant.label if self.participant.label != None else "n/a in demo version"

        return {
            'label':        label,
            'subject_pool': self.participant.vars['subject_pool'],
            'treatment':    self.participant.vars['treatment'],
        }


# ******************************************************************************************************************** #
# *** PAGE SEQUENCE *** #
# ******************************************************************************************************************** #
page_sequence = [
    p1_ThankYou
]
