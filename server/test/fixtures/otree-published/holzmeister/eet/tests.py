from otree.api import Currency as c, currency_range
from . import pages
from ._builtin import Bot
from eet.config import *
import math

class PlayerBot(Bot):

    def play_round(self):

        # list index (for multiple lists)
        # ------------------------------------------------------------------------------------------------------------
        page = self.subsession.round_number
        pages_per_list = Constants.n * 2
        page_in_list = (page - 1) % pages_per_list + 1
        list_index = int((page - page_in_list) / pages_per_list)

        # choices made by bots
        # ------------------------------------------------------------------------------------------------------------
        x_choices = [[] for _ in range(Constants.m)]
        for k in range(Constants.m):
            for j, field in enumerate(self.session.vars['x_fields']):
                if j + 1 < self.player.participant.vars['bot_x_switching_point'][k]:
                    x_choices[k].append('R')
                else:
                    x_choices[k].append('L')

        y_choices = [[] for _ in range(Constants.m)]
        for k in range(Constants.m):
            for j, field in enumerate(self.session.vars['y_fields']):
                if j + 1 < self.player.participant.vars['bot_y_switching_point'][k]:
                    y_choices[k].append('R')
                else:
                    y_choices[k].append('L')

        x_list = list(zip(self.session.vars['x_fields'], x_choices[list_index - 1]))
        y_list = list(zip(self.session.vars['y_fields'], y_choices[list_index - 1]))
        xy_list = x_list + y_list

        # ------------------------------------------------------------------------------------------------------------ #
        # INSTRUCTIONS
        # ------------------------------------------------------------------------------------------------------------ #
        if Constants.instructions:
            if page == 1:
                yield (pages.Instructions)

        if Constants.role_fixed:
            if page == 1:
                yield (pages.RoleAssignment)

        # ------------------------------------------------------------------------------------------------------------ #
        # DECISION
        # ------------------------------------------------------------------------------------------------------------ #
        if (not Constants.revise_decision
            and self.player.role() == 'active') \
                or (self.player.role() == 'active'
                    and Constants.revise_decision
                    and self.subsession.round_number <= Constants.num_rounds - Constants.m):

            # if default (x- and y-list are displayed on separate screens; one_page == False)
            # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
            if not Constants.one_page and not Constants.one_choice_per_page:
                if self.participant.vars['list_ordering'] == 'xy' and page % 2 == 1:
                    yield (pages.Decision, {i: j for i, j in x_list})

                if self.participant.vars['list_ordering'] == 'xy' and page % 2 == 0:
                    yield (pages.Decision, {i: j for i, j in y_list})

                if self.participant.vars['list_ordering'] == 'yx' and page % 2 == 1:
                    yield (pages.Decision, {i: j for i, j in y_list})

                if self.participant.vars['list_ordering'] == 'yx' and page % 2 == 0:
                    yield (pages.Decision, {i: j for i, j in x_list})

            # if x- and y-list are displayed on a single screen (one_page == True)
            # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
            if Constants.one_page:
                yield (pages.Decision, {i: j for i, j in xy_list})

            # if choices are displayed one-by-one on separate screens (one_choice_per_page == True)
            # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
            if Constants.one_choice_per_page:

                current_choice = self.participant.vars['xy_list'][list_index][page_in_list - 1]
                field_index = int(current_choice[0][2:])

                if field_index < self.player.participant.vars['bot_y_switching_point'][list_index]:
                    yield (pages.Decision, {current_choice[0]: 'R'})
                else:
                    yield (pages.Decision, {current_choice[0]: 'L'})

        # ------------------------------------------------------------------------------------------------------------ #
        # REVISION
        # ------------------------------------------------------------------------------------------------------------ #
        if self.player.role() == 'active' \
                and Constants.revise_decision \
                and self.round_number > Constants.num_rounds - Constants.m:

            yield (pages.Revision, {i: j for i, j in xy_list})

        # ------------------------------------------------------------------------------------------------------------ #
        # RESULTS
        # ------------------------------------------------------------------------------------------------------------ #
        if Constants.results:
            if page == Constants.num_rounds:
                yield (pages.Results)
