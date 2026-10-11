from otree.api import Currency as c, currency_range
from . import models
from ._builtin import Page, WaitPage
from .models import Constants

from django.utils.translation import ugettext as _


def vars_for_all_templates(self):
    return {
        'timer':    _('Time left to complete this page:')
    }


# ******************************************************************************************************************** #
# *** INTRODUCTION *** #
# ******************************************************************************************************************** #
class p1_Introduction(Page):

    # form model and form fields
    # ----------------------------------------------------------------------------------------------------------------
    form_model = 'player'
    form_fields = [
        'os_name',
        'os_version',
        'browser_name',
        'browser_version'
    ]


# ******************************************************************************************************************** #
# *** OVERVIEW *** #
# ******************************************************************************************************************** #
class p2_Overview(Page):
    pass


# ******************************************************************************************************************** #
# *** PAGE SEQUENCE *** #
# ******************************************************************************************************************** #
page_sequence = [
    p1_Introduction,
    p2_Overview
]
