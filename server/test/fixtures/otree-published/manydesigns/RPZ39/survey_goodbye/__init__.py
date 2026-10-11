from otree.api import *


doc = """
#ManyDesigns Morality and Competition experiment.
"""


class Constants(BaseConstants):
    name_in_url = 'survey_goodbye'
    players_per_group = None
    num_rounds = 1
    production_timeout = 10


class Subsession(BaseSubsession):
    def set_payoffs(subsession):
        # IN the competition treatment, we have to match participants.
        if subsession.session.competition_treatment == 1:
            players = subsession.get_players()
            N = len(players)
            already_used = []
            i = 0
            for X in players:
                i+= 1
                matched = 0
                if X not in already_used and X.finished == 1:
                    matched, no_partner, j = 0, 0, 0
                    while matched != 1 and no_partner == 0:
                        Y = players[j]
                        if X.participant.grid_id == Y.participant.grid_id and Y not in already_used and Y.finished == 1:
                            if Y != X:
                                X.partner = Y.participant.id_in_session
                                Y.partner = X.participant.id_in_session
                                matched = 1

                        if j == N - 1 and matched == 0:
                            no_partner = 1
                        j += 1
                if no_partner == 1:
                    return "no more matches available"

                if matched == 1:
                    if X.total_points > Y.total_points:
                        X.total_payoff = 1.3 + 2 * X.total_points / 100
                        Y.total_payoff = 1.3
                    if X.total_points < Y.total_points:
                        Y.total_payoff = 1.3 + 2 * Y.total_points / 100
                        X.total_payoff = 1.3
                    if X.total_points == Y.total_points:
                        import random
                        r = random.randint(0,1)
                        if r == 1:
                            X.total_payoff = 1.3 + 2 * X.total_points / 100
                            Y.total_payoff = 1.3
                        else:
                            Y.total_payoff = 1.3 + 2 * Y.total_points / 100
                            X.total_payoff = 1.3
                    already_used.append(X)
                    already_used.append(Y)

        else:
            for player in subsession.get_players():
                if player.finished == 1:
                    player.total_payoff = 1.3 + player.total_points / 100

class Group(BaseGroup):
    pass


class Player(BasePlayer):
    total_points = models.IntegerField()
    donation_amount = models.FloatField()
    finished = models.IntegerField(initial = 0)
    partner = models.IntegerField()
    total_payoff = models.FloatField()

    age = models.IntegerField(label="6. What is your age?", min = 0, max = 120)
    gender = models.IntegerField(
        label = '7.	Please select the gender that you identify with:',
        choices = [[0, 'Male'], [1, 'Female'], [2, 'Rather not say'], [3, 'Other (please specify below)']]
    )
    gender_add = models.StringField(blank = True, label = '')
    education = models.IntegerField(
        choices = [[0, 'Primary school'],
        [1, 'Secondary school up to 16 years'],
        [2, 'Higher or secondary or further education (A-levels, BTEC, etc.)'],
        [3, 'College or university'],
        [4, 'Post-graduate degree'],
        [5, 'Prefer not to say']
        ],
        label = '8.	What is the highest level of education you have completed?'
    )
    belief_production_extensive = models.IntegerField(label = """1. If you consider your
    performance in the Production Task in comparison to another randomly
    selected person who participated in the experiment, what do you think is
    the percentage chance that you obtained more Experimental Points in the
    Production Task than this other person? (please choose a number between 0 and 100)""",
    min = 0,
    max = 100)

    belief_production_intensive = models.IntegerField(label = """2. What do you expect was
    the difference between the number of Experimental Points that you obtained
    in the Production Task in comparison to this other randomly selected person?
    (i.e., if you subtracted their score from yours, what would you expect the
    number to be?)""")

    belief_red_dots = models.IntegerField(label = """3.	If you think
    about other people in the experiment who saw the exact same grid of colored
    dots as you in the Visual Perception Task, what do you expect they estimated
    on average for the number of red dots? """,
    min = 0,
    max = 100)

    reasoning_red_dots = models.StringField(label = """4. How did you arrive at
    your estimate for the number of red dots?""",
    blank = True)

    competitiveness = models.IntegerField(label = """5. How competitive do you
    consider yourself to be? (please select a number on a scale from 0 to 10, where 0 means "not competitive at all" and 10 means "extremely competitive")
    """,
    min = 0,
    max = 10)

    comments = models.LongStringField(label = """9.	Do you have any comments
    about the experiment? Or anything you’d like to tell us? """,
    blank = True)

# PAGES
class BeliefSurvey(Page):
    form_model = 'player'
    form_fields = ['belief_production_extensive',
    'belief_production_intensive', 'belief_red_dots', 'reasoning_red_dots',
    'competitiveness']

class GeneralSurvey(Page):
    form_model = 'player'
    form_fields = ['age', 'gender', 'gender_add', 'education', 'comments']

    ## Calculate total points
    @staticmethod
    def before_next_page(player, timeout_happened):
        player.total_points = player.participant.production_task_points + player.participant.dot_points
        player.donation_amount = (100 - player.participant.dot_points) / 100

        player.finished = 1
        players = player.subsession.get_players()
        num_finished = sum([p.finished for p in players])
        if num_finished >= len(players) * 0.4:
            player.subsession.set_payoffs()

class ThankYou(Page):
    pass

page_sequence = [BeliefSurvey, GeneralSurvey, ThankYou]
