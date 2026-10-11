from otree.api import Currency as c, currency_range
from . import models
from ._builtin import Page, WaitPage
from .models import Constants
from django.utils.translation import ugettext as _


# variables for all templates
# --------------------------------------------------------------------------------------------------------------------
def vars_for_all_templates(self):
    return {
        'lottery_lo':  c(Constants.lottery_lo),
        'lottery_hi':  c(Constants.lottery_hi),
        'probability': "{0:.1f}".format(Constants.probability) + "%"
    }


# ******************************************************************************************************************** #
# *** CLASS INSTRUCTIONS *** #
# ******************************************************************************************************************** #
class Instructions(Page):

    # only display instruction in round 1
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.subsession.round_number == 1


# ******************************************************************************************************************** #
# *** PAGE DECISION *** #
# ******************************************************************************************************************** #
class Decision(Page):

    # form model
    # ----------------------------------------------------------------------------------------------------------------
    form_model = 'player'

    # form fields
    # ----------------------------------------------------------------------------------------------------------------
    def get_form_fields(self):

        # unzip list of form_fields from <cem_choices> list
        form_fields = [list(t) for t in zip(*self.participant.vars['cem_choices'])][1]

        # provide form field associated with pagination or full list
        if Constants.one_choice_per_page:
            page = self.subsession.round_number
            return [form_fields[page - 1]]
        else:
            return form_fields

    # variables for template
    # ----------------------------------------------------------------------------------------------------------------
    def vars_for_template(self):

        # specify info for progress bar
        total = Constants.num_choices
        page = self.subsession.round_number
        progress = page / total * 100

        if Constants.one_choice_per_page:
            return {
                'page':      page,
                'total':     total,
                'progress':  progress,
                'choices':   [self.player.participant.vars['cem_choices'][page-1]]
            }
        else:
            return {
                'choices':   self.player.participant.vars['cem_choices']
            }

    # set payoff, determine consistency, and set switching row
    # ----------------------------------------------------------------------------------------------------------------
    def before_next_page(self):

        # unzip indices and form fields from <cem_choices> list
        round_number = self.subsession.round_number
        form_fields = [list(t) for t in zip(*self.participant.vars['cem_choices'])][1]
        indices = [list(t) for t in zip(*self.participant.vars['cem_choices'])][0]
        index = indices[round_number - 1]

        # if choices are displayed sequentially
        # ------------------------------------------------------------------------------------------------------------
        if Constants.one_choice_per_page:

            # replace current choice in <choices_made>
            current_choice = getattr(self.player, form_fields[round_number - 1])
            self.participant.vars['cem_choices_made'][index - 1] = current_choice

            # if current choice equals index to pay ...
            if index == self.player.participant.vars['cem_index_to_pay']:
                # set payoff
                self.player.set_payoffs()

            # after final choice
            if round_number == Constants.num_choices:
                # determine consistency
                self.player.set_consistency()
                # set switching row
                self.player.set_switching_row()

        # if choices are displayed in tabular format
        # ------------------------------------------------------------------------------------------------------------
        if not Constants.one_choice_per_page:

            # replace choices in <choices_made>
            for j, choice in zip(indices, form_fields):
                choice_i = getattr(self.player, choice)
                self.participant.vars['cem_choices_made'][j - 1] = choice_i

            # set payoff
            self.player.set_payoffs()
            # determine consistency
            self.player.set_consistency()
            # set switching row
            self.player.set_switching_row()


# ******************************************************************************************************************** #
# *** PAGE RESULTS *** #
# ******************************************************************************************************************** #
class Results(Page):

    # skip results until last page
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        if Constants.one_choice_per_page:
            return self.subsession.round_number == Constants.num_rounds
        return True

    # variables for template
    # ----------------------------------------------------------------------------------------------------------------
    def vars_for_template(self):

        # unzip <cem_choices> into list of lists
        choices = [list(t) for t in zip(*self.participant.vars['cem_choices'])]
        indices = choices[0]

        # payoff information
        index_to_pay = self.player.participant.vars['cem_index_to_pay']
        round_to_pay = indices.index(index_to_pay) + 1
        choice_to_pay = self.participant.vars['cem_choices'][round_to_pay - 1]

        if Constants.one_choice_per_page:
            return {
                'choice_to_pay':  [choice_to_pay],
                'option_to_pay':  self.player.in_round(round_to_pay).option_to_pay,
                'accept_reject':  _("accept") if self.player.in_round(round_to_pay).option_to_pay == "A" else _("reject"),
                'payoff':         self.player.in_round(round_to_pay).payoff,
            }
        else:
            return {
                'choice_to_pay':  [choice_to_pay],
                'option_to_pay':  self.player.option_to_pay,
                'accept_reject':  _("accept") if self.player.option_to_pay == "A" else _("reject"),
                'payoff':         self.player.payoff
            }


# ******************************************************************************************************************** #
# *** PAGE SEQUENCE *** #
# ******************************************************************************************************************** #
page_sequence = [Decision]

if Constants.instructions:
    page_sequence.insert(0, Instructions)

if Constants.results:
    page_sequence.append(Results)
