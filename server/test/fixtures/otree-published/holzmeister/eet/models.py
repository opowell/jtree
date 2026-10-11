from otree.api import (
    models, widgets, BaseConstants, BaseSubsession, BaseGroup, BasePlayer,
    Currency as c, currency_range
)
from eet.config import *
import random


author = 'Felix Holzmeister & Rudolf Kerschbamer'

doc = """
This oTree application allows to implement the Equality Equivalence Test (EET) as proposed by Kerschbamer (2015)
with any arbitrary parametrization as well as treatment variations and different graphical representations.
"""


# ::: parametrization in config.py
# :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
e = Constants.e
g = Constants.g
s = Constants.s
t = Constants.t
a = Constants.a
m = Constants.m

n = Constants.n


# #################################################################################################################### #
# ### CLASS SUBSESSION ### #
# #################################################################################################################### #
class Subsession(BaseSubsession):

    # ::: list of x-list and y-list form fields ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
    def creating_session(self):

        # --- group matching if <group_randomly = True>
        # ------------------------------------------------------------------------------------------------------------
        if Constants.group_randomly:
            self.group_randomly() if self.round_number == 1 else self.group_like_round(1)

        # --- create lists of x and y form fields
        # ------------------------------------------------------------------------------------------------------------
        self.session.vars['x_fields'] = ['x_' + str(j) for j in range(1, n + 1)]
        self.session.vars['y_fields'] = ['y_' + str(j) for j in range(1, n + 1)]
        self.session.vars['xy_fields'] = self.session.vars['x_fields'] + self.session.vars['y_fields']

        # --- lists of active player's payoffs ('mp') in x- and y-list
        # ------------------------------------------------------------------------------------------------------------
        mp_x = mp_y = []

        # ... in case of symmetric test design
        if not Constants.asymmetric_s:
            mp_x = [
                [e + (j - t) * s * k / g[0] for j in range(2 * t + 1)]
                for k in g
            ]
            mp_y = [
                [e + (j - t) * s * k / g[0] for j in range(2 * t + 1)]
                for k in g
            ]

        # ... in case of asymmetric step sizes
        elif Constants.asymmetric_s:
            mp_x = [
                [e + sign(j - t) * s * t * ((2 ** abs(j - t) - 1) / (2 ** t - 1)) for j in range(2 * t + 1)]
                for _ in g
            ]
            mp_y = [
                [e + sign(j - t) * s * t * ((2 ** abs(j - t) - 1) / (2 ** t - 1)) for j in range(2 * t + 1)]
                for _ in g
            ]

        # ... in case of asymmetric test size
        if Constants.asymmetric_t:

            # ...in case of symmetric step sizes
            if not Constants.asymmetric_s:
                mp_x = [
                    [x[0] + (j - a) * s * g[i] / g[0] for j in range(a)] + mp_x[i]
                    for i, x in enumerate(mp_x)
                ]
                mp_y = [
                    mp_y[i] + [y[-1] + (j + 1) * s * g[i] / g[0] for j in range(a)]
                    for i, y in enumerate(mp_y)
                ]

            # ...in case of asymmetric step sizes
            elif Constants.asymmetric_s:
                mp_x = [
                    [x[0] - (x[1] - x[0]) * 2 * (2 ** (a - j) - 1) for j in range(a)] + mp_x[i]
                    for i, x in enumerate(mp_x)
                ]
                mp_y = [
                    mp_y[i] + [y[-1] + (y[-1] - y[-2]) * 2 * (2 ** (j + 1) - 1) for j in range(a)]
                    for i, y in enumerate(mp_y)
                ]

        # ... in case of reduced-form version
        if Constants.reduced_form:
            mp_x = mp_y = [[e - s * k / g[0], e + s * k / g[0]] for k in g]


        # --- lists of inactive player's payoffs ('op') in x-list and y-list
        # ------------------------------------------------------------------------------------------------------------
        op_x = [[e + k for _ in range(0, n)] for k in g]
        op_y = [[e - k for _ in range(0, n)] for k in g]

        # --- list of equal material payoffs
        # ------------------------------------------------------------------------------------------------------------
        e_xy = [[e for _ in range(0, n)] for _ in g]

        # --- store payoff lists as globals for reference
        # ------------------------------------------------------------------------------------------------------------
        self.session.vars['mp_x'] = mp_x
        self.session.vars['mp_y'] = mp_y
        self.session.vars['op_x'] = op_x
        self.session.vars['op_y'] = op_y

        # --- print 'my'-payoffs of list(s) in console
        # ------------------------------------------------------------------------------------------------------------
        if self.round_number == 1:
            print(':::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::')
            print('The settings in config.py imply the following "my"-payoffs in x- and y-list(s):')

            print('')
            print('x-list(s):')
            for i, x_list in enumerate(self.session.vars['mp_x']):
                print('  list #' + str(i + 1) + ':', [round(x, 2) for x in x_list])

            print('')
            print('y-list(s):')
            for i, y_list in enumerate(self.session.vars['mp_y']):
                print('  list #' + str(i + 1) + ':', [round(y, 2) for y in y_list])
            print(':::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::')

        # --- for each player ...
        # ------------------------------------------------------------------------------------------------------------
        for p in self.get_players():

            #  initiate lists for choices made in x- and y-list
            p.participant.vars['x_choices'] = [[None for _ in range(0, n)] for _ in g]
            p.participant.vars['y_choices'] = [[None for _ in range(0, n)] for _ in g]

            # zipped list of decision problems (x-list)
            p.participant.vars['x_list'] = [[list(j) for j in zip(
                self.session.vars['x_fields'],
                mp_x[k], op_x[k], e_xy[k], e_xy[k]
            )] for k in range(0, m)]

            # zipped list of decision problems (y-list)
            p.participant.vars['y_list'] = [[list(j) for j in zip(
                self.session.vars['y_fields'],
                mp_y[k], op_y[k], e_xy[k], e_xy[k]
            )] for k in range(0, m)]

            # randomly determine order of x- and y-lists if <counterbalance = True>
            p.participant.vars['list_ordering'] = random.choice(['xy', 'yx']) \
                if Constants.counterbalance else 'xy'

            # zipped list of all decisions depending on list ordering
            if p.participant.vars['list_ordering'] == 'xy':
                p.participant.vars['xy_list'] = [x + y for x, y in zip(
                    p.participant.vars['x_list'], p.participant.vars['y_list']
                )]
            elif p.participant.vars['list_ordering'] == 'yx':
                p.participant.vars['xy_list'] = [y + x for x, y in zip(
                    p.participant.vars['y_list'], p.participant.vars['x_list']
                )]

            #  shuffle x- and y-lists if <shuffle_lists = True>
            if Constants.shuffle_lists:
                random.shuffle(p.participant.vars['x_list'][0])
                random.shuffle(p.participant.vars['y_list'][0])
                random.shuffle(p.participant.vars['xy_list'][0])

        # --- generate random switching point for PlayerBot in tests.py
        # ------------------------------------------------------------------------------------------------------------
        for p in self.session.get_participants():
            p.vars['bot_x_switching_point'] = [random.randint(0, n + 1) / 2 + random.randint(0, n + 1) / 2
                                               for _ in range(m)]
            p.vars['bot_y_switching_point'] = [random.randint(0, n + 1) / 2 + random.randint(0, n + 1) / 2
                                               for _ in range(m)]

    # ::: variables for admin report ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
    def vars_for_admin_report(self):

        # --- (x,y)-scores
        # ------------------------------------------------------------------------------------------------------------

        # gather data for (x,y)-scores
        x_scores = filter(lambda x: x is not None, [p.x_score for p in self.get_players()])
        y_scores = filter(lambda y: y is not None, [p.y_score for p in self.get_players()])

        # count occurrences of (x,y)-pairs for bubble chart
        xy_list = [list(xy) for xy in zip(x_scores, y_scores)]
        xy_set = set(map(tuple, xy_list))
        xy_scores = list(map(list, xy_set))

        # append occurrences to xy-tuples
        for j, xy in enumerate(xy_scores):
            xy_scores[j].append(xy_list.count(xy))

        # count occurrences in benevolent/malevolent domains
        xb_yb = sum(j[0] > 0 and j[1] > 0 for j in xy_list)
        xm_ym = sum(j[0] < 0 and j[1] < 0 for j in xy_list)
        xb_ym = sum(j[0] > 0 > j[1] for j in xy_list)
        xm_yb = sum(j[0] < 0 < j[1] for j in xy_list)
        bm_freq = [xm_yb, xb_yb, xb_ym, xm_ym]

        # --- archetypes
        # ------------------------------------------------------------------------------------------------------------

        # gather data for archetype histogram
        types = list(filter(lambda a: a is not None, [p.archetype for p in self.get_players()]))

        # count occurrences of archetypes
        arch_occ = dict((j, types.count(j)) for j in set(types))

        # create list of frequencies
        type_list = [value for key, value in archetypes.items()]
        type_freq = [0 for j in range(len(type_list))]
        for key, value in arch_occ.items():
            index = type_list.index(key)
            type_freq[index] = value

        # --- summary statistics table
        # ------------------------------------------------------------------------------------------------------------
        id_in_session = [p.id_in_subsession for p in self.get_players()]
        sigma_lb = ['{0:.4f}'.format(p.sigma_lb) if p.sigma_lb is not None else None for p in self.get_players()]
        sigma_mp = ['{0:.4f}'.format(p.sigma_mp) if p.sigma_mp is not None else None for p in self.get_players()]
        sigma_ub = ['{0:.4f}'.format(p.sigma_ub) if p.sigma_ub is not None else None for p in self.get_players()]
        gamma_lb = ['{0:.4f}'.format(p.gamma_lb) if p.gamma_lb is not None else None for p in self.get_players()]
        gamma_mp = ['{0:.4f}'.format(p.gamma_mp) if p.gamma_mp is not None else None for p in self.get_players()]
        gamma_ub = ['{0:.4f}'.format(p.gamma_ub) if p.gamma_ub is not None else None for p in self.get_players()]
        wtp_a_lb = ['{0:.4f}'.format(p.wtp_a_lb) if p.wtp_a_lb is not None else None for p in self.get_players()]
        wtp_a_mp = ['{0:.4f}'.format(p.wtp_a_mp) if p.wtp_a_mp is not None else None for p in self.get_players()]
        wtp_a_ub = ['{0:.4f}'.format(p.wtp_a_ub) if p.wtp_a_ub is not None else None for p in self.get_players()]
        wtp_d_lb = ['{0:.4f}'.format(p.wtp_d_lb) if p.wtp_d_lb is not None else None for p in self.get_players()]
        wtp_d_mp = ['{0:.4f}'.format(p.wtp_d_mp) if p.wtp_d_mp is not None else None for p in self.get_players()]
        wtp_d_ub = ['{0:.4f}'.format(p.wtp_d_ub) if p.wtp_d_ub is not None else None for p in self.get_players()]
        x_score = ['{0:.2f}'.format(p.x_score) if p.x_score is not None else None for p in self.get_players()]
        y_score = ['{0:.2f}'.format(p.y_score) if p.y_score is not None else None for p in self.get_players()]
        archetype = [p.archetype for p in self.get_players()]

        data = list(zip(
            id_in_session,
            sigma_lb, sigma_mp, sigma_ub,
            gamma_lb, gamma_mp, gamma_ub,
            wtp_a_lb, wtp_a_mp, wtp_a_ub,
            wtp_d_lb, wtp_d_mp, wtp_d_ub,
            x_score, y_score,
            archetype
        ))

        # --- return data for admin report
        # ------------------------------------------------------------------------------------------------------------
        return {
            'xy_scores':    xy_scores,
            'bm_freq':      bm_freq,
            'archetypes':   type_list,
            'type_freq':    type_freq,
            'data':         data
        }


# #################################################################################################################### #
# ### CLASS GROUP ### #
# #################################################################################################################### #
class Group(BaseGroup):

    # ::: add model fields to group class ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
    role_assignment = models.StringField()
    id_to_pay = models.StringField()

    # ::: set player's payoffs ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
    def set_payoffs(self):

        p1 = self.get_player_by_id(1)
        p2 = self.get_player_by_id(2)

        for p in self.get_players():

            # --- rows, decisions, and id's to pay
            # --------------------------------------------------------------------------------------------------------
            p1_row_to_pay = [list(j) for j in p.participant.vars['xy_list'][p1.list_to_pay - 1]
                             if j[0] == p1.choice_to_pay]
            p1_row_to_pay[0].append(p1.decision_to_pay)
            p1_row_to_pay[0].append(p1.id_in_group)

            p2_row_to_pay = []

            if Constants.role_uncertain or Constants.role_double:
                p2_row_to_pay = [list(j) for j in p.participant.vars['xy_list'][p2.list_to_pay - 1]
                                 if j[0] == p2.choice_to_pay]
                p2_row_to_pay[0].append(p2.decision_to_pay)
                p2_row_to_pay[0].append(p2.id_in_group)

            # --- fixed roles
            # --------------------------------------------------------------------------------------------------------
            if Constants.role_fixed:
                # add role assignment to database
                self.role_assignment = 'fixed'
                # decisions of player_id = 1 are implemented
                self.id_to_pay = '1'

                # rows to pay "on group level"
                p.participant.vars['rows_to_pay'] = p1_row_to_pay

            # --- uncertain roles
            # --------------------------------------------------------------------------------------------------------
            if Constants.role_uncertain:
                # add role assignment to database
                self.role_assignment = 'uncertain'
                # randomly determine role for payments
                self.id_to_pay = random.choice(['1', '2'])

                # rows to pay "on group level"
                p.participant.vars['rows_to_pay'] = p1_row_to_pay if self.id_to_pay == '1' else p2_row_to_pay

            # --- double roles
            # --------------------------------------------------------------------------------------------------------
            if Constants.role_double:
                # add role assignment to database
                self.role_assignment = 'double'
                # decisions of both players are implemented
                self.id_to_pay = '1,2'

                # rows to pay "on group level"
                p.participant.vars['rows_to_pay'] = p1_row_to_pay + p2_row_to_pay

            # --- set payoffs
            # --------------------------------------------------------------------------------------------------------

            # ... according to player 1's decision
            if self.id_to_pay == '1' or self.id_to_pay == '1,2':
                if p1.decision_to_pay == 'L':
                    p1.payoff = p.participant.vars['rows_to_pay'][0][1]
                    p2.payoff = p.participant.vars['rows_to_pay'][0][2]
                elif p1.decision_to_pay == 'R':
                    p1.payoff = p.participant.vars['rows_to_pay'][0][3]
                    p2.payoff = p.participant.vars['rows_to_pay'][0][4]

            # ... according to player 2's decision
            if self.id_to_pay == '2':
                if p2.decision_to_pay == 'L':
                    p2.payoff = p.participant.vars['rows_to_pay'][0][1]
                    p1.payoff = p.participant.vars['rows_to_pay'][0][2]
                elif p2.decision_to_pay == 'R':
                    p2.payoff = p.participant.vars['rows_to_pay'][0][3]
                    p1.payoff = p.participant.vars['rows_to_pay'][0][4]

            # ... according to both players' decisions
            if self.id_to_pay == '1,2':
                if p2.decision_to_pay == 'L':
                    p2.payoff += p.participant.vars['rows_to_pay'][1][1]
                    p1.payoff += p.participant.vars['rows_to_pay'][1][2]
                elif p2.decision_to_pay == 'R':
                    p2.payoff += p.participant.vars['rows_to_pay'][1][3]
                    p1.payoff += p.participant.vars['rows_to_pay'][1][4]


# #################################################################################################################### #
# ### CLASS PLAYER ### #
# #################################################################################################################### #
class Player(BasePlayer):

    # ::: add model fields to player class ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
    list = models.IntegerField()
    revision = models.BooleanField()

    for j in range(1, n + 1):
        locals()['x_' + str(j)] = models.StringField(
            doc="binary choice problem #" + str(j) + " in x-list"
        )
    del j
    for j in range(1, n + 1):
        locals()['y_' + str(j)] = models.StringField(
            doc="binary choice problem #" + str(j) + " in y-list"
        )
    del j

    inconsistent_x = models.IntegerField(
        doc="1 if inconsistent within x-list; 0 otherwise"
    )
    inconsistent_y = models.IntegerField(
        doc="1 if inconsistent within x-list; 0 otherwise"
    )

    x_score = models.FloatField(
        doc="x-score: non-parametric index of distributional concerns in the domain of disadvantageous inequality"
    )
    y_score = models.FloatField(
        doc="y-score: non-parametric index of distributional concerns in the domain of advantageous inequality"
    )
    archetype = models.StringField(
        doc="archetype of distributional preferences as defined by Kerschbamer (2015)"
    )

    sigma_lb = models.FloatField(
        doc="lower bound of the parameter interval for sigma (disadvantageous inequality) in the piecewise-linear model"
    )
    sigma_ub = models.FloatField(
        doc="upper bound of the parameter interval for sigma (disadvantageous inequality) in the piecewise-linear model"
    )
    sigma_mp = models.FloatField(
        doc="midpoint of the parameter interval for sigma (disadvantageous inequality) in the piecewise-linear model"
    )

    gamma_lb = models.FloatField(
        doc="lower bound of the parameter interval for gamma (advantageous inequality) in the piecewise-linear model"
    )
    gamma_ub = models.FloatField(
        doc="upper bound of the parameter interval for gamma (advantageous inequality) in the piecewise-linear model"
    )
    gamma_mp = models.FloatField(
        doc="midpoint of the parameter interval for gamma (advantageous inequality) in the piecewise-linear model"
    )

    wtp_d_lb = models.FloatField(
        doc="lower bound of the willingness-to-pay interval in the domain of disadvantageous inequality"
    )
    wtp_d_ub = models.FloatField(
        doc="upper bound of the willingness-to-pay interval in the domain of disadvantageous inequality"
    )
    wtp_d_mp = models.FloatField(
        doc="midpoint of the willingness-to-pay interval in the domain of disadvantageous inequality"
    )

    wtp_a_lb = models.FloatField(
        doc="lower bound of the willingness-to-pay interval in the domain of advantageous inequality"
    )
    wtp_a_ub = models.FloatField(
        doc="upper bound of the willingness-to-pay interval in the domain of advantageous inequality"
    )
    wtp_a_mp = models.FloatField(
        doc="midpoint of the willingness-to-pay interval in the domain of advantageous inequality"
    )

    list_to_pay = models.IntegerField()
    choice_to_pay = models.StringField()
    decision_to_pay = models.StringField()

    # ::: set player roles to 'active' and 'inactive' ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
    def role(self):
        if Constants.role_fixed:
            if self.id_in_group == 1:
                return 'active'
            if self.id_in_group == 2:
                return 'inactive'
        else:
            return 'active'

    # ::: set row, choice, and decision to pay ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
    def set_choice_to_pay(self):

        # randomly determine which row to pay
        self.list_to_pay = random.randint(1, Constants.m)
        self.participant.vars['row_to_pay'] = random.choice(self.participant.vars['xy_list'][self.list_to_pay - 1])

        # set choice to pay
        self.choice_to_pay = self.participant.vars['row_to_pay'][0]

        # determine decision to pay
        decision_to_pay_in_all_rounds = [p.__getattribute__(self.choice_to_pay) for p in self.in_all_rounds()]
        self.decision_to_pay = [j for j in decision_to_pay_in_all_rounds if j is not None][0]

    # ::: determine consistency :::
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
    def consistency(self):

        # if player role is 'active'...
        if self.role() == 'active':

            # check for multiple switching behavior in x-list
            x_choices = self.participant.vars['x_choices'] = [
                [1 if j == 'R' else 0 for j in self.participant.vars['x_choices'][k]]
                for k in range(0, m)
            ]
            for k in range(0, m):
                for j in range(1, n):
                    self.inconsistent_x = 1 if x_choices[k][j] > x_choices[k][j - 1] else 0
                    if self.inconsistent_x == 1:
                        break

            # check for multiple switching behavior in y-list
            y_choices = self.participant.vars['y_choices'] = [
                [1 if j == 'R' else 0 for j in self.participant.vars['y_choices'][k]]
                for k in range(0, m)
            ]
            for k in range(0, m):
                for j in range(1, n):
                    self.inconsistent_y = 1 if y_choices[k][j] > y_choices[k][j - 1] else 0
                    if self.inconsistent_y == 1:
                        break

    # ::: determine (x,y)-score if lists have been answered consistently :::
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
    def xy_scores(self):

        # if player role is 'active' and <multiple_lists = False>
        if self.role() == 'active' and not Constants.multiple_lists:

            # determine x-score
            u = t if not Constants.asymmetric_t else t + a
            xr_choices = sum(self.participant.vars['x_choices'][0])
            self.x_score = (u + 0.5) - xr_choices if self.inconsistent_x == 0 else None

            # determine y-score
            yr_choices = sum(self.participant.vars['y_choices'][0])
            self.y_score = yr_choices - (t + 0.5) if self.inconsistent_y == 0 else None

    # ::: set archetype of distributional preferences ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
    def archetypes(self):

        # if player role is 'active' and <multiple_lists = False>
        if self.role() == 'active' and not Constants.multiple_lists:

            # if all choices are consistent...
            if self.inconsistent_x == 0 and self.inconsistent_y == 0:
                aid = 1
                aid += 3 if self.y_score == -0.5 or self.y_score == 0.5 else 0
                aid += 6 if self.y_score < -0.5 else 0
                aid += 1 if self.x_score == -0.5 or self.x_score == 0.5 else 0
                aid += 2 if self.x_score > 0.5 else 0

                self.archetype = archetypes[aid]

    # ::: determine parameters of piecewise linear motivational function ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
    def piecewise_linear_model(self):

        # --- determine sigma parameter and willingness to pay in piecewise linear model
        # ------------------------------------------------------------------------------------------------------------
        if self.role() == 'active' and self.inconsistent_x == 0:

            # number of 'left' choices in x-list
            xl_choices = [n - sum(self.participant.vars['x_choices'][k]) for k in range(0, m)]

            x_lb = [self.session.vars['mp_x'][k][xl_choices[k] - 1] - e
                    if 0 not in xl_choices else None
                    for k in range(0, m)]

            x_ub = [self.session.vars['mp_x'][k][xl_choices[k]] - e
                    if n not in xl_choices else None
                    for k in range(0, m)]

            o_lb = [x_lb[j] + g[j]
                    if 0 not in xl_choices else None
                    for j in range(0, m)]
            o_ub = [x_ub[j] + g[j]
                    if n not in xl_choices else None
                    for j in range(0, m)]

            self.sigma_lb = (sum([x * o for (x, o) in zip(x_lb, o_lb)]) / sum([o ** 2 for o in o_lb])) \
                if 0 not in xl_choices else None
            self.sigma_ub = (sum([x * o for (x, o) in zip(x_ub, o_ub)]) / sum([o ** 2 for o in o_ub])) \
                if n not in xl_choices else None
            self.sigma_mp = (self.sigma_lb + self.sigma_ub) / 2 \
                if self.sigma_lb is not None and self.sigma_ub is not None else None

            self.wtp_d_lb = self.sigma_lb / (1 - self.sigma_lb) if self.sigma_lb is not None else None
            self.wtp_d_ub = self.sigma_ub / (1 - self.sigma_ub) if self.sigma_ub is not None else None
            self.wtp_d_mp = self.sigma_mp / (1 - self.sigma_mp) if self.sigma_mp is not None else None


        # --- determine gamma parameter and willingness to pay in piecewise linear model
        # ------------------------------------------------------------------------------------------------------------
        if self.role() == 'active' and self.inconsistent_y == 0:

            # number of 'right' choices in y-list
            yr_choices = [sum(self.participant.vars['y_choices'][k]) for k in range(0, m)]

            y_lb = [self.session.vars['mp_y'][k][yr_choices[k] - 1] - e
                    if 0 not in yr_choices else None
                    for k in range(0, m)]
            y_ub = [self.session.vars['mp_y'][k][yr_choices[k]] - e
                    if n not in yr_choices else None
                    for k in range(0, m)]

            o_lb = [y_lb[j] + g[j]
                    if 0 not in yr_choices else None
                    for j in range(0, m)]
            o_ub = [y_ub[j] + g[j]
                    if n not in yr_choices else None
                    for j in range(0, m)]

            self.gamma_lb = (sum([y * o for (y, o) in zip(y_lb, o_lb)]) / sum([o ** 2 for o in o_lb])) \
                if 0 not in yr_choices else None
            self.gamma_ub = (sum([y * o for (y, o) in zip(y_ub, o_ub)]) / sum([o ** 2 for o in o_ub])) \
                if n not in yr_choices else None
            self.gamma_mp = (self.gamma_lb + self.gamma_ub) / 2 \
                if self.gamma_lb is not None and self.gamma_ub is not None else None

            self.wtp_a_lb = self.gamma_lb / (1 - self.gamma_lb) if self.gamma_lb is not None else None
            self.wtp_a_ub = self.gamma_ub / (1 - self.gamma_ub) if self.gamma_ub is not None else None
            self.wtp_a_mp = self.gamma_mp / (1 - self.gamma_mp) if self.gamma_mp is not None else None


# ::: dictionary of archetypes
# :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
archetypes = {
    1: 'Inequality-Averse',
    2: 'Maximin',
    3: 'Altruistic',
    4: 'Envious',
    5: 'Selfish',
    6: 'Kiss-Up',
    7: 'Spiteful',
    8: 'Kick-Down',
    9: 'Equality-Averse'
}


# ::: define sign-function
# :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
def sign(x):
    if x > 0:
        return 1
    elif x < 0:
        return -1
    elif x == 0:
        return 0
