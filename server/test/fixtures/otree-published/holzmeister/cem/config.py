# <imports>
from otree.api import Currency as c
from otree.constants import BaseConstants
# </imports>


# ******************************************************************************************************************** #
# *** CLASS CONSTANTS *** #
# ******************************************************************************************************************** #
class Constants(BaseConstants):

    # ---------------------------------------------------------------------------------------------------------------- #
    # --- Task-specific Settings --- #
    # ---------------------------------------------------------------------------------------------------------------- #

    # type of variation
    # the app allows to vary one of the following parameters: the sure payoff, the probability of the high payoff,
    # or the high or low lottery payoff; the remaining three parameters are held constant for all choices
    # possible values for <variation> are 'sure_payoff' (Cohen et al., 1987; Abdellaoui et al., 2011)
    # 'probability' (Bruner, 2009), 'lottery_hi' (Bruner, 2009), or 'lottery_lo' (Gächter et al., 2007)
    variation = 'sure_payoff'

    # number (n) of choices with <i = 1, 2, ..., n>
    # <num_choices> determines how many choices between a lottery and a sure payoff shall be implemented
    num_choices = 9

    # "high" and "low" payoffs (in currency units set in settings.py) of the lottery "option A"
    # the lottery payoffs remain constant if <variation = 'sure_payoff'> or <variation = 'probability'>
    # if <variation = 'lottery_hi'>, <lottery_hi> constitutes the high lottery payoff for the first choice
    # for subsequent choices <i>, the high lottery outcome is determined by <lottery_hi> + <i-1> * <step_size>
    # if <variation = 'lottery_lo'>, <lottery_lo> constitutes the low lottery payoff for the first choice
    # for subsequent choices <i>, the high lottery outcome is determined by <lottery_lo> - <i-1> * <step_size>
    lottery_hi = 30.00
    lottery_lo = 10.00

    # probability of lottery outcome "high" in %
    # the probability of lottery payoffs is constant if <variation = 'sure_payoff'> or <variation = 'lottery_*'>
    # if <variation = 'probability'>, <probability> determines the likelihood of the high payoff in the first choice
    # for subsequent choices <i>, the probability is determined by <probability> + <i-1> * <step_size>
    probability = 50

    # sure payoff ("option B")
    # the sure payoff remains constant if <variation = 'probability'> or <variation = 'lottery_*'>
    # if <variation = 'sure_payoff'>, <sure_payoff> constitutes the certain payment ("option B") in the first choice
    # for subsequent choices <i>, the certain payment is determined by <sure_payoff> + <i-1> * <step_size>
    sure_payoff = 10.00

    # step size (in units of the parameter defined in <variation>)
    # the variable <variation> defines which of the four parameters is varied across the <num_choices> choices
    # <step_size> constitutes the increment in terms of the varying parameter (while the remaining three are constant)
    # thus, the varying parameter for choice i = 1, 2, ..., n, <var_i>, is defined by <var> + <i-1> * <step_size>
    # if <variation> is set to 'sure_payoff', 'lottery_hi', or 'lottery_lo', <step_size> is in currency units
    # if <variation> is set to 'probability', <step_size> is in percentage units (i.e. <step_size>%)
    step_size = 2.50

    # initial endowment (in currency units set in settings.py)
    # <endowment> defines an additional endowment for the task to capture potential losses if <variation = lottery_lo>
    # if no additional endowment should be implemented, set <endowment> to 0
    endowment = 0.00

    # ---------------------------------------------------------------------------------------------------------------- #
    # --- Overall Settings and Appearance --- #
    # ---------------------------------------------------------------------------------------------------------------- #

    # do not display certain payoff and ask for whether to accept or reject the lottery
    # if <accept_reject = False>, subjects face a table with a lottery on the left and a sure payoff on the right
    # if <accept_reject = True>, only the lottery will be displayed in the table but not the sure payoff
    # subjects are asked to indicate whether they want to accept or to reject each of the lotteries
    # note that <accept_reject = True> is only implementable if <variation> is set to 'probability' or 'lottery_*'
    # if <accept_reject = True>, choice = "A" refers to acceptance while choice = "B" refers to rejection
    accept_reject = False

    # show each lottery pair on a separate page
    # if <one_choice_per_page = True>, each single binary choice between lottery "A" and "B" is shown on a separate page
    # if <one_choice_per_page = False>, all <num_choices> choices are displayed in a table on one page
    one_choice_per_page = False

    # order choices between lottery pairs randomly
    # if <random_order = True>, the ordering of binary decisions is randomized for display
    # if <random_order = False>, binary choices are listed in ascending order of the probability of the "high" outcome
    random_order = False

    # enforce consistency, i.e. only allow for a single switching point
    # if <enforce_consistency = True>, all options "A" above a selected option "A" are automatically selected
    # similarly, all options "B" below a selected option "B" are automatically checked, implying consistent choices
    # note that <enforce_consistency> is only implemented if <one_choice_per_page = False> and <random_order = False>
    enforce_consistency = False

    # show progress bar
    # if <progress_bar = True> and <one_choice_per_page = True>, a progress bar is rendered
    # if <progress_bar = False>, no information with respect to the advance within the task is displayed
    # the progress bar graphically depicts the advance within the task in terms of how many decision have been made
    # further, information in terms of "page x out of <num_choices>" (with x denoting the current choice) is provided
    progress_bar = True

    # show instructions page
    # if <instructions = True>, a separate template "Instructions.html" is rendered prior to the task
    # if <instructions = False>, the task starts immediately (e.g. in case of printed instructions)
    instructions = True

    # show results page summarizing the task's outcome including payoff information
    # if <results = True>, a separate page containing all relevant information is displayed after finishing the task
    # if <results = False>, the template "Decision.html" will not be rendered
    results = True

    # ---------------------------------------------------------------------------------------------------------------- #
    # --- oTree Settings (Don't Modify) --- #
    # ---------------------------------------------------------------------------------------------------------------- #

    name_in_url = 'cem'
    players_per_group = None
    num_rounds = num_choices if one_choice_per_page else 1
