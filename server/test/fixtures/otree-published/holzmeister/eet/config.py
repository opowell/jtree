from otree.api import (
    models, widgets, BaseConstants, BaseSubsession, BaseGroup, BasePlayer,
    Currency as c, currency_range
)


# #################################################################################################################### #
# ### CLASS CONSTANTS ### #
# #################################################################################################################### #
class Constants(BaseConstants):

    # ::: Test Parametrization ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #

    # e determines the locus of the equal-material-payoff allocation (m,o) = (e,e).
    # Note that option 'right' implies a payoff equal to e for both players in all binary decisions.
    e = 10

    # g is a 'gap' variable characterizing the vertical distance to (e,e).
    # The 'other' payoff in option 'left' is determined by (e+g) for the x-list and (e-g) for the y-list.
    # Note that g is restricted to be strictly smaller than e (to prevent negative payoffs).
    g = 3

    # s is a 'step size' variable characterizing the horizontal distance between two adjacent allocations.
    # That is, the 'my' payoff varies in steps of size s around the locus payoff e.
    s = 1

    # t is a 'test size' variable determining the number of steps (of size s) which are made to the left
    # and to the right starting from the point just above or below the equal-payoff allocation (m,o) = (e,e).
    # t is restricted to be an integer smaller or equal to g/s and must be larger or equal to 1.
    t = 2


    # ::: List Variations and Modifications of Parameterization ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #

    # <asymmetric_s = True> replaces the symmetric default step size between two adjacent decisions to increase
    # the power of the test to discriminate between selfish and different variants of non-selfish behavior.
    # Asymmetric step-sizes imply that step sizes are smaller at the centre but larger at the borders.
    # The specific functional form to determine asymmetric steps can be modified in <models.py:65>.
    asymmetric_s = False

    # <asymmetric_t = True> replaces the symmetric default test size specification by extending the x-list to the left
    # and the y-list to the right in order to examine whether subjects put more weight on the material payoff of the
    # passive person than on their own material payoff. <a = [int]> determines how many choices are added on each list.
    # Note that <asymmetric_t = True> implies that the number of choices per list increases from 2t + 1 to 2t + a + 1.
    asymmetric_t = False
    a = 1

    # <multiple_lists = True> implements multi-list versions of the equality equivalence test, potentially allowing
    # for more precise estimates of the shape of indifference curves. The additional lists differ in the gap variable
    # g, which are set as the elements of the variable <multiple_g>. In case of symmetric versions of the test, the
    # 'my'-payoffs for additional lists are scaled in such a way that all allocations lie on linear lines; this can
    # be easily changed by adapting the determination of 'my'-payoffs in <models.py:54>.
    multiple_lists = False
    multiple_g = [g, g + 1, g + 2]

    # <reduced_form = True> implements a short version of the test with only two binary choices per list, i.e., a
    # total of only four decisions to be made. These choices are constructed the same way as in the standard version
    # of the test. However, the test size is set to 1 and the 'my'-payoff equal to e is dropped from both lists.
    reduced_form = False


    # ::: Role Assignment ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #

    # If <role_fixed = True>, roles are assigned ex ante depending on the player's id's.
    # If <player.id_in_group = 1>, the participant is assigned the role of the active player,
    # if <player.id_in_group = 2>, the participant is assigned the role of the passive player.
    role_fixed = True

    # If <role_uncertain = True>, each player decides in the role of the active player.
    # Only after both players in a group have made their decisions it is randomly determined which
    # player's decisions are relevant for payout, i.e., who is the active and who the passive player.
    role_uncertain = False

    # If <role_double = True>, each player decides in the role of the active player.
    # At the same time, each player is assigned the role of a passive player as well.
    # That is, subjects get two payoffs: one as an active and one as a passive player.
    role_double = False


    # ::: Group Matching ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #

    # If <group_randomly = True>, players will be randomly matched in pairs (independent of a player's id).
    # If <group_randomly = False>, players will be matched in ascending order of their <id_in_subsession>,
    # i.e., player 1 and 2 will form a group, player 3 and 4, etc.
    group_randomly = False

    # If <group_by_arrival = True>, players will be matched according to their arrival time on the server.
    # That is, the first player arriving will be matched with the second, the third arriving with the forth, etc.
    # If <group_by_arrival = False>, group matching is determined by the argument of <group_randomly>.
    group_by_arrival = False


    # ::: Overall Settings and Appearance ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #

    # Show instructions page.
    # If <instructions = True>, a separate template "Instructions.html" is rendered prior to the task;
    # if <instructions = False>, the task starts immediately (e.g. in case of printed instructions).
    instructions = True

    # Show results page summarizing the task's outcome including payoff information.
    # If <results = True>, a separate page containing all relevant information is displayed after finishing the task.
    # If <results = False>, the "Results" template will not be rendered (i.e., players are not informed about payoffs).
    results = True

    # If <one_page = True>, both the x- and y-list will be displayed on a single page.
    # If <one_page = False>, each of the two lists will be shown on a separate page.
    one_page = False

    # If <counterbalance = False>, the ordering of lists is deterministic: the x-list is displayed before the y-list.
    # If <counterbalance = True>, the ordering of the x- and y-lists on screen will be randomized for each player.
    counterbalance = True

    # If <one_choice_per_page = True>, all decision problems of both the x- and y-list will be displayed sequentially
    # on separate pages; if <one_choice_per_page = False>, the x- and y-lists will be displayed in a list format.
    one_choice_per_page = False

    # If <shuffle_lists = False>, choices in the x- and y-list will be displayed in ascending order of 'my' payoffs.
    # If <shuffle_lists = True>, the order of choices within each of the two lists will be randomly determined.
    # If <one_choice_per_page = True>, lists will be shuffled jointly (making <counterbalance> obsolete).
    shuffle_lists = False

    # Enforce consistency, i.e., only allow for a single switching point per list (implemented using JavaScript).
    # If <enforce_consistency = True>, all options "Left" below a selected option "Left" are automatically selected.
    # Similarly, options "Right" above a selected option "Right" are automatically checked, implying consistent choices.
    # Note that <enforce_consistency> is only implemented if <one_choice_per_page = False> and <shuffle_lists = False>.
    enforce_consistency = True

    # Allow active player(s) to revise their decision.
    # If <revise_decision = True>, subjects will have the opportunity to revise the decisions they have made on
    # separate screens. That is, after all choices have been submitted, participants will face one or more screens
    # (depending on the number of lists) summarizing their decisions in tabular form and allowing them to change the
    # inputs they made previously. This might in particular be reasonable if <one_choice_per_page = True> and/or
    # <shuffle_lists = True> to provide subjects an opportunity to correct potential inconsistencies.
    revise_decision = False


    # ::: oTree Settings (modify only if custom features require it!) ::: #
    # :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: #
    name_in_url = 'eet'
    players_per_group = 2
    num_rounds = 1

    # set additional lists to zero if <asymmetric_t = False>
    if not asymmetric_t:
        a = 0

    # set number of items in x- and y-list
    n = 2 * t + a + 1
    if reduced_form:
        n = 2

    # set number of rounds
    if one_choice_per_page:
        num_rounds = 2 * n
    elif one_page:
        num_rounds = 1
    else:
        num_rounds = 2

    # multiple lists
    if not multiple_lists:
        g = [g]
        m = 1
    if multiple_lists:
        g = multiple_g
        m = len(g)
        num_rounds *= m

    # revise decision
    if revise_decision:
        num_rounds += m
