from otree.api import Currency as c, currency_range
from ._builtin import Page, WaitPage
from eet.config import *


# set number of pages per list
# --------------------------------------------------------------------------------------------------------------------
if Constants.one_choice_per_page:
    pages_per_list = Constants.n * 2
elif not Constants.one_page:
    pages_per_list = 2
elif Constants.one_page:
    pages_per_list = 1


# ::: variables for all templates ::: #
# :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
def vars_for_all_templates(self):

    # --- page number, page number in list, and list index
    # ---------------------------------------------------------------------------------------------------------------- #
    page = self.subsession.round_number
    page_in_list = (page - 1) % pages_per_list + 1
    list_index = int((page - page_in_list) / pages_per_list)

    if not Constants.revise_decision or \
            (Constants.revise_decision and not page > Constants.num_rounds - Constants.m):
        return {
            'n':                Constants.n,
            'page':             page,
            'page_in_list':     page_in_list,
            'list_index':       list_index,
            'num_choices':      Constants.n * 2,
            'list_ordering':    self.participant.vars['list_ordering'],
            'x_list':           self.participant.vars['x_list'][list_index],
            'y_list':           self.participant.vars['y_list'][list_index],
        }


# #################################################################################################################### #
# ### CLASS INSTRUCTIONS ### #
# #################################################################################################################### #
class Instructions(Page):

    # --- only display instructions in first round
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.subsession.round_number == 1


# #################################################################################################################### #
# ### CLASS GROUPING WAIT PAGE ### #
# #################################################################################################################### #
class GroupingWaitPage(WaitPage):

    # --- only display instructions in first round
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.subsession.round_number == 1

    # --- template
    # ----------------------------------------------------------------------------------------------------------------
    template_name = 'eet/GroupingWaitPage.html'

    # --- group by arrival time on server
    # ----------------------------------------------------------------------------------------------------------------
    group_by_arrival_time = True


# #################################################################################################################### #
# ### CLASS ROLE ASSIGNMENT ### #
# #################################################################################################################### #
class RoleAssignment(Page):

    # --- only display role assignment in round 1
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.subsession.round_number == 1


# #################################################################################################################### #
# ### CLASS DECISION ### #
# #################################################################################################################### #
class Decision(Page):

    # --- only displayed if player has role 'active'
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        if not Constants.revise_decision:
            return self.player.role() == 'active'
        else:
            return self.player.role() == 'active' and \
                   self.subsession.round_number <= Constants.num_rounds - Constants.m

    # form model
    form_model = 'player'

    # ::: form fields and variables for template if <one_choice_per_page == True> ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
    if Constants.one_choice_per_page:

        # --- form fields
        # ------------------------------------------------------------------------------------------------------------
        def get_form_fields(self):

            # page number, page number in list, and list index
            page = self.subsession.round_number
            page_in_list = (page - 1) % pages_per_list + 1
            list_index = int((page - page_in_list) / pages_per_list)

            # unzip list of form_fields from <xy_list>
            form_fields = [list(t) for t in zip(*self.participant.vars['xy_list'][list_index])][0]

            # return form fields
            return [form_fields[page_in_list - 1]]

        # --- variables for template
        # ------------------------------------------------------------------------------------------------------------
        def vars_for_template(self):

            # page number, page number in list, and list index
            page = self.subsession.round_number
            page_in_list = (page - 1) % pages_per_list + 1
            list_index = int((page - page_in_list) / pages_per_list)

            return {
                'choice':   [self.participant.vars['xy_list'][list_index][page_in_list - 1]],
                'show_x':   False,
                'show_y':   False
            }

    # ::: form fields and variables for template if <one_page == True> ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
    elif Constants.one_page:

        # --- form fields
        # ------------------------------------------------------------------------------------------------------------
        def get_form_fields(self):
            return self.session.vars['xy_fields']

        # --- variables for template
        # ------------------------------------------------------------------------------------------------------------
        def vars_for_template(self):
            return {
                'show_x':  True,
                'show_y':  True
            }

    # ::: form fields and variables for template if <one_page == False> ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
    elif not Constants.one_page:

        # --- form fields
        # ------------------------------------------------------------------------------------------------------------
        def get_form_fields(self):

            # page number and page number in list
            page = self.subsession.round_number
            page_in_list = (page - 1) % pages_per_list + 1

            # list ordering
            list_ordering = self.participant.vars['list_ordering']

            # return form fields
            if page_in_list == 1 and list_ordering == 'xy':
                return self.session.vars['x_fields']
            if page_in_list == 1 and list_ordering == 'yx':
                return self.session.vars['y_fields']
            if page_in_list == 2 and list_ordering == 'xy':
                return self.session.vars['y_fields']
            if page_in_list == 2 and list_ordering == 'yx':
                return self.session.vars['x_fields']

        # --- variables for template
        # ------------------------------------------------------------------------------------------------------------
        def vars_for_template(self):

            # page number, page number in list, and list index
            page = self.subsession.round_number
            page_in_list = (page - 1) % pages_per_list + 1

            # list ordering
            list_ordering = self.participant.vars['list_ordering']

            # return which list to show
            if page_in_list == 1 and list_ordering == 'xy':
                return {
                    'show_x':   True,
                    'show_y':   False
                }
            if page_in_list == 1 and list_ordering == 'yx':
                return {
                    'show_x':   False,
                    'show_y':   True
                }
            if page_in_list == 2 and list_ordering == 'xy':
                return {
                    'show_x':   False,
                    'show_y':   True
                }
            if page_in_list == 2 and list_ordering == 'yx':
                return {
                    'show_x':   True,
                    'show_y':   False
                }

    # ::: determine consistency, switching row, (x,y)-scores, utility function parameters, and  archetypes ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
    def before_next_page(self):

        # --- page number, page number in list, and list index
        # ------------------------------------------------------------------------------------------------------------
        page = self.subsession.round_number
        page_in_list = (page - 1) % pages_per_list + 1
        list_index = int((page - page_in_list) / pages_per_list)

        # --- set list index and revision dummy in database
        # ------------------------------------------------------------------------------------------------------------
        self.player.list = list_index + 1
        self.player.revision = False

        # --- choices if decision problems are displayed one-by-one
        # ------------------------------------------------------------------------------------------------------------
        if Constants.one_choice_per_page:

            # determine whether decision belongs to x- or y-list
            item = [list(t) for t in zip(*self.participant.vars['xy_list'][list_index])][0][page_in_list - 1][0]

            # determine choices in x-list
            if item == 'x':
                for j, choice in enumerate(self.session.vars['x_fields']):
                    if self.participant.vars['x_choices'][list_index][j] is None:
                        choice_j = getattr(self.player, choice)
                        self.participant.vars['x_choices'][list_index][j] = choice_j

            # determine choices in y-list
            if item == 'y':
                for j, choice in enumerate(self.session.vars['y_fields']):
                    if self.participant.vars['y_choices'][list_index][j] is None:
                        choice_j = getattr(self.player, choice)
                        self.participant.vars['y_choices'][list_index][j] = choice_j

        # --- choices if decision problems are displayed in lists
        # ------------------------------------------------------------------------------------------------------------
        else:
            # determine choices in x-list
            for j, choice in enumerate(self.session.vars['x_fields']):
                if self.participant.vars['x_choices'][list_index][j] is None:
                    choice_j = getattr(self.player, choice)
                    self.participant.vars['x_choices'][list_index][j] = choice_j

            # determine choices in y-list
            for j, choice in enumerate(self.session.vars['y_fields']):
                if self.participant.vars['y_choices'][list_index][j] is None:
                    choice_j = getattr(self.player, choice)
                    self.participant.vars['y_choices'][list_index][j] = choice_j

        # --- after all decisions have been made ...
        # ------------------------------------------------------------------------------------------------------------
        if page == Constants.num_rounds:
            # set row, choice, and decision to pay
            self.player.set_choice_to_pay()
            # determine consistency
            self.player.consistency()
            # determine (x,y)-score
            self.player.xy_scores()
            # set archetype
            self.player.archetypes()
            # determine parameters of piecewise-linear model
            self.player.piecewise_linear_model()


# #################################################################################################################### #
# ### PAGE REVISION ### #
# #################################################################################################################### #
class Revision(Page):

    # only displayed to 'active' players in last round
    def is_displayed(self):
        return self.player.role() == 'active' and \
               self.round_number > Constants.num_rounds - Constants.m

    # form model
    form_model = 'player'

    # --- form fields
    # ----------------------------------------------------------------------------------------------------------------
    def get_form_fields(self):
        return self.session.vars['xy_fields']

    # --- variables for template
    # ----------------------------------------------------------------------------------------------------------------
    def vars_for_template(self):

        # page number, page number in list, and list index
        list_indices = [i for i, g in enumerate(Constants.g)]
        list_index = list_indices[len(Constants.g) - Constants.num_rounds + self.round_number - 1]

        # set list index and revision dummy in database
        self.player.list = list_index + 1
        self.player.revision = True

        # zipped lists of rows and choices made in x- and y-lists
        x_list = [row + [self.participant.vars['x_choices'][list_index][j]]
                  for j, row in enumerate(sorted(self.player.participant.vars['x_list'][list_index]))]
        y_list = [row + [self.participant.vars['y_choices'][list_index][j]]
                  for j, row in enumerate(sorted(self.player.participant.vars['y_list'][list_index]))]

        return {
            'x_list':           x_list,
            'y_list':           y_list,
            'list_ordering':    self.participant.vars['list_ordering'],
        }

    # ::: determine consistency, switching row, (x,y)-scores, utility function parameters, and  archetypes ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
    def before_next_page(self):

        # --- determine choices in x-list
        # ------------------------------------------------------------------------------------------------------------
        for j, choice in enumerate(self.session.vars['x_fields']):
            choice_j = getattr(self.player, choice)
            self.participant.vars['x_choices'][0][j] = choice_j

        # --- determine choices in y-list
        # ------------------------------------------------------------------------------------------------------------
        for j, choice in enumerate(self.session.vars['y_fields']):
            choice_j = getattr(self.player, choice)
            self.participant.vars['y_choices'][0][j] = choice_j

        # --- after all decisions have been made ...
        # ------------------------------------------------------------------------------------------------------------
        if self.subsession.round_number == Constants.num_rounds:
            # set row, choice, and decision to pay
            self.player.set_choice_to_pay()
            # determine consistency
            self.player.consistency()
            # determine (x,y)-score
            self.player.xy_scores()
            # set archetype
            self.player.archetypes()
            # determine parameters of piecewise-linear model
            self.player.piecewise_linear_model()


# #################################################################################################################### #
# ### WAIT PAGE ### #
# #################################################################################################################### #
class ResultsWaitPage(WaitPage):

    # template
    template_name = 'eet/ResultsWaitPage.html'

    # only display in last round
    def is_displayed(self):
        return self.subsession.round_number == Constants.num_rounds

    # set payoff after both players arrive
    def after_all_players_arrive(self):
        self.group.set_payoffs()


# #################################################################################################################### #
# ### CLASS RESULTS ### #
# #################################################################################################################### #
class Results(Page):

    # only display results after both lists have been completed
    # ----------------------------------------------------------------------------------------------------------------
    def is_displayed(self):
        return self.subsession.round_number == Constants.num_rounds

    # variables for template
    # ----------------------------------------------------------------------------------------------------------------
    def vars_for_template(self):

        row_to_pay = self.participant.vars['rows_to_pay'][0]
        decision_to_pay = row_to_pay[5]
        p1_payoff = row_to_pay[1] if decision_to_pay == 'L' else row_to_pay[3]
        p2_payoff = row_to_pay[2] if decision_to_pay == 'L' else row_to_pay[4]

        return {
            'id_to_pay':        self.group.id_to_pay,
            'id_in_group':      self.player.id_in_group,
            'rows_to_pay':      self.player.participant.vars['rows_to_pay'],
            'decision_to_pay':  self.player.participant.vars['rows_to_pay'][0][5],
            'p1_payoff':        p1_payoff,
            'p2_payoff':        p2_payoff
        }


# #################################################################################################################### #
# ### PAGE SEQUENCE ### #
# #################################################################################################################### #
page_sequence = [
    GroupingWaitPage,
    Instructions,
    RoleAssignment,
    Decision,
    Revision,
    ResultsWaitPage,
    Results
]

if not Constants.instructions:
    page_sequence.remove(Instructions)

if not Constants.group_by_arrival:
    page_sequence.remove(GroupingWaitPage)

if not Constants.role_fixed:
    page_sequence.remove(RoleAssignment)

if not Constants.revise_decision:
    page_sequence.remove(Revision)

if not Constants.results:
    page_sequence.remove(Results)
