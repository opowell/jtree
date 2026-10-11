from otree.constants import BaseConstants


# ******************************************************************************************************************** #
# *** CLASS CONSTANTS *** #
# ******************************************************************************************************************** #
class Constants(BaseConstants):

    # ---------------------------------------------------------------------------------------------------------------- #
    # --- Task-specific Settings --- #
    # ---------------------------------------------------------------------------------------------------------------- #

    # number (N) of lotteries with <i = 1, 2, ..., N>
    num_lotteries = 5

    # sure_payoff; "low" and "high" payoff of the initial lottery (in currency units set in settings.py)
    # <sure_payoff> determines the 'starting point' for all lotteries in the single choice list (safe option in i = 1)
    # outcomes of subsequent lotteries are defined relative to the 'initial value' by the <delta> options below
    sure_payoff = 16

    # increments of lottery outcomes (refer to the documentation for more detailed information)
    # <delta_lo> defines the (negative) increment of the low outcome over the number of choices (<num_lotteries>)
    # similarly, <delta_hi> defines the (positive) increment of the high outcome for the <num_lotteries> choices
    delta_lo = 4
    delta_hi = 8

    # probability of lottery outcome "high" (in percent)
    # <probability> refers to the likelihood of outcome <lottery_hi> denoted in percent (as Integer or Float)
    # i.e. <probability = x> implies an x%-chance to win the "high" and a (1-x)%-chance to win the "low" payoff
    # note that the probability in this task is constant for each of the <num_lotteries> and only outcomes change
    probability = 50

    # additional lottery to separate risk-loving from risk-neutral preferences
    # if <risk_loving = True>, a lottery with the same expected value but a higher st. dev. as lottery <N> is added
    # note that <risk_loving = True> implies that the overall number of lotteries rendered will be <num_lotteries> + 1
    risk_loving = False

    # ---------------------------------------------------------------------------------------------------------------- #
    # --- Overall Settings and Appearance --- #
    # ---------------------------------------------------------------------------------------------------------------- #

    # order choices between lottery pairs randomly
    # if <random_order = True>, the ordering of binary decisions is randomized for display
    # if <random_order = False>, binary choices are listed in ascending order of the probability of the "high" outcome
    random_order = False

    # show instructions page
    # if <instructions = True>, a separate template "Instructions.html" is rendered prior to the task
    # if <instructions = False>, the task starts immediately (e.g. in case of printed instructions)
    instructions = True

    # show results page summarizing the task's outcome including payoff information
    # if <results = True>, a separate page containing all relevant information is displayed after finishing the task
    # if <results = False>, the template "Decision.html" will not be rendered
    results = True

    # ---------------------------------------------------------------------------------------------------------------- #
    # --- oTree Settings --- #
    # ---------------------------------------------------------------------------------------------------------------- #
    name_in_url = 'scl'
    players_per_group = None
    num_rounds = 1
