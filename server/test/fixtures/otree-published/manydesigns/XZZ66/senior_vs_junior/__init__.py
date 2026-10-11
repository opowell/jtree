from otree.api import *
import random
import time

doc = """
Senior vs Junior
Seniors 1, 3
Juniors 2, 4
Pairs 1-2, 3-4
"""


class Constants(BaseConstants):
    name_in_url = 'senior_vs_junior'
    players_per_group = 4
    num_rounds = 40


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):

    pID = models.StringField(label='Please enter your Prolific ID:')

    take = models.IntegerField(label="What percentage would you like to take from Player B?",
                                     min=0, max=100, default=0)
    ones = models.IntegerField(label="How many 1s are there in the grid?", min=0)
    check_slider = models.BooleanField()
    age = models.IntegerField(label="Please enter your age", min=18, max=100)
    sex = models.IntegerField(label="Please select your gender",
                              choices=[
                                  [1, "Male"],
                                  [2, "Female"],
                                  [66, "Other"],
                                  [88, "Prefer not to tell"]
                              ])
    field = models.StringField(label="Please enter your field of study")
    employment = models.IntegerField(label="Please select which best describes your job:",
                                     choices=[
                                         [1, "Employee"],
                                         [2, "Leading position"],
                                         [0, "None of the above"]
                                     ])


def creating_session(subsession):
    if subsession.round_number == 1:
        # assign groups randomly to control or competitive treatment
        for g in subsession.get_groups():
            # g.control = random.choice([True, False])
            # 1, 3 are seniors, and 2, 4 are juniors
            g.get_player_by_id(1).participant.is_senior = True
            g.get_player_by_id(2).participant.is_senior = False
            g.get_player_by_id(3).participant.is_senior = True
            g.get_player_by_id(4).participant.is_senior = False
            for p in g.get_players():
                p.participant.control = p.session.config['control']
                p.participant.score = 0
                p.participant.take = 0
                p.participant.victory = True
                p.participant.pID = ""


def get_timeout_seconds(player):
    participant = player.participant
    return participant.expiry - time.time()


def set_payoffs(group):
    # How much % the seniors took
    take1 = group.get_player_by_id(1).participant.take
    take3 = group.get_player_by_id(3).participant.take
    # Score of the junior after reduced by what the seniors took
    reduced2 = group.get_player_by_id(2).participant.score * (1 - take1 / 100)
    reduced4 = group.get_player_by_id(4).participant.score * (1 - take3 / 100)
    # Score of the seniors after increased by what they took
    increased1 = group.get_player_by_id(1).participant.score + group.get_player_by_id(2).participant.score * (take1 / 100)
    increased3 = group.get_player_by_id(3).participant.score + group.get_player_by_id(4).participant.score * (take3 / 100)
    # Adjusted scores
    score1 = 0
    score2 = 0
    score3 = 0
    score4 = 0
    ran = random.choice([True, False])
    # Final scores to the seniors
    # Treatment when only the juniors compete (Control)
    if group.session.config['control']:
        score1 = increased1
        score3 = increased3
    # Treatment when everyone competes
    else:
        # If player 1 wins
        if increased1 > increased3:
            score1 = increased1
            score3 = 0
            group.get_player_by_id(3).participant.victory = False
        # If player 3 wins
        elif increased1 < increased3:
            score3 = increased3
            score1 = 0
            group.get_player_by_id(1).participant.victory = False
        else:
            if ran:
                score1 = increased1
                score3 = 0
                group.get_player_by_id(3).participant.victory = False
            else:
                score3 = increased3
                score1 = 0
                group.get_player_by_id(1).participant.victory = False

    # Final score for the juniors
    # If player 2 wins
    if reduced2 > reduced4:
        score2 = reduced2
        score4 = 0
        group.get_player_by_id(4).participant.victory = False
    # If player 4 wins
    elif reduced2 < reduced4:
        score4 = reduced4
        score2 = 0
        group.get_player_by_id(2).participant.victory = False
    else:
        if ran:
            score2 = reduced2
            score4 = 0
            group.get_player_by_id(4).participant.victory = False
        else:
            score4 = reduced4
            score2 = 0
            group.get_player_by_id(2).participant.victory = False

    # Assign payments
    # Seniors
    if group.session.config['control']:
        group.get_player_by_id(1).participant.payoff += score1 * 0.08
        group.get_player_by_id(3).participant.payoff += score3 * 0.08
    else:
        group.get_player_by_id(1).participant.payoff += score1 * 0.16
        group.get_player_by_id(3).participant.payoff += score3 * 0.16

    # Juniors
    group.get_player_by_id(2).participant.payoff += score2 * 0.08
    group.get_player_by_id(4).participant.payoff += score4 * 0.08


# PAGES
class Welcome(Page):
    form_model = 'player'
    form_fields = ['pID']

    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        player.participant.pID = player.pID

    @staticmethod
    def is_displayed(player: Player):
        return player.round_number == 1


class Instructions(Page):
    pass

    @staticmethod
    def is_displayed(player: Player):
        return player.round_number == 1


class Take(Page):
    form_model = 'player'
    form_fields = ['take']

    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        player.participant.take = player.take

    @staticmethod
    def is_displayed(player: Player):
        return player.round_number == 1 and player.participant.is_senior


class TakeWaitPage(WaitPage):
    pass

    @staticmethod
    def is_displayed(player: Player):
        return player.round_number == 1 and not player.participant.is_senior


class Info(Page):
    pass

    @staticmethod
    def vars_for_template(player: Player):
        take1 = player.group.get_player_by_id(1).take
        take3 = player.group.get_player_by_id(3).take
        return dict(
            take1=take1,
            take3=take3
        )

    @staticmethod
    def is_displayed(player: Player):
        return player.round_number == 1 and not player.participant.is_senior


class InfoWaitPage(WaitPage):
    pass

    @staticmethod
    def is_displayed(player: Player):
        return player.round_number == 1 and player.participant.is_senior


class StartWaitPage(WaitPage):

    @staticmethod
    def after_all_players_arrive(group: Group):
        for p in group.get_players():
            participant = p.participant
            participant.expiry = time.time() + 5 * 60

    @staticmethod
    def is_displayed(player: Player):
        return player.round_number == 1


class Task(Page):
    form_model = 'player'
    form_fields = ['ones']

    timer_text = 'Time left to complete this section:'

    get_timeout_seconds = get_timeout_seconds

    @staticmethod
    def is_displayed(player):
        return get_timeout_seconds(player) > 3

    @staticmethod
    def vars_for_template(player):
        take1 = player.group.get_player_by_id(1).participant.take
        take3 = player.group.get_player_by_id(3).participant.take
        return dict(
            reduced2=player.group.get_player_by_id(2).participant.score * (1 - take1 / 100),
            reduced4=player.group.get_player_by_id(4).participant.score * (1 - take3 / 100),
            increased1=player.group.get_player_by_id(1).participant.score + player.group.get_player_by_id(
                2).participant.score * (take1 / 100),
            increased3=player.group.get_player_by_id(3).participant.score + player.group.get_player_by_id(
                4).participant.score * (take3 / 100),
            image_path='senior_vs_junior/{}.png'.format(player.round_number)
        )

    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        # Checking if they gave the correct answer in the given round
        if player.round_number == 1:
            if player.ones == 16:
                player.participant.score += 1
        elif player.round_number == 2:
            if player.ones == 13:
                player.participant.score += 1
        elif player.round_number == 3:
            if player.ones == 15:
                player.participant.score += 1
        elif player.round_number == 4:
            if player.ones == 12:
                player.participant.score += 1
        elif player.round_number == 5:
            if player.ones == 13:
                player.participant.score += 1
        elif player.round_number == 6:
            if player.ones == 11:
                player.participant.score += 1
        elif player.round_number == 7:
            if player.ones == 15:
                player.participant.score += 1
        elif player.round_number == 8:
            if player.ones == 16:
                player.participant.score += 1
        elif player.round_number == 9:
            if player.ones == 19:
                player.participant.score += 1
        elif player.round_number == 10:
            if player.ones == 18:
                player.participant.score += 1
        elif player.round_number == 11:
            if player.ones == 16:
                player.participant.score += 1
        elif player.round_number == 12:
            if player.ones == 15:
                player.participant.score += 1
        elif player.round_number == 13:
            if player.ones == 17:
                player.participant.score += 1
        elif player.round_number == 14:
            if player.ones == 16:
                player.participant.score += 1
        elif player.round_number == 15:
            if player.ones == 18:
                player.participant.score += 1
        elif player.round_number == 16:
            if player.ones == 21:
                player.participant.score += 1
        elif player.round_number == 17:
            if player.ones == 16:
                player.participant.score += 1
        elif player.round_number == 18:
            if player.ones == 17:
                player.participant.score += 1
        elif player.round_number == 19:
            if player.ones == 18:
                player.participant.score += 1
        elif player.round_number == 20:
            if player.ones == 21:
                player.participant.score += 1
        elif player.round_number == 21:
            if player.ones == 16:
                player.participant.score += 1
        elif player.round_number == 22:
            if player.ones == 16:
                player.participant.score += 1
        elif player.round_number == 23:
            if player.ones == 23:
                player.participant.score += 1
        elif player.round_number == 24:
            if player.ones == 20:
                player.participant.score += 1
        elif player.round_number == 25:
            if player.ones == 20:
                player.participant.score += 1
        elif player.round_number == 26:
            if player.ones == 16:
                player.participant.score += 1
        elif player.round_number == 27:
            if player.ones == 12:
                player.participant.score += 1
        elif player.round_number == 28:
            if player.ones == 24:
                player.participant.score += 1
        elif player.round_number == 29:
            if player.ones == 18:
                player.participant.score += 1
        elif player.round_number == 30:
            if player.ones == 18:
                player.participant.score += 1
        elif player.round_number == 31:
            if player.ones == 18:
                player.participant.score += 1
        elif player.round_number == 32:
            if player.ones == 12:
                player.participant.score += 1
        elif player.round_number == 33:
            if player.ones == 13:
                player.participant.score += 1
        elif player.round_number == 34:
            if player.ones == 19:
                player.participant.score += 1
        elif player.round_number == 35:
            if player.ones == 20:
                player.participant.score += 1
        elif player.round_number == 36:
            if player.ones == 14:
                player.participant.score += 1
        elif player.round_number == 37:
            if player.ones == 21:
                player.participant.score += 1
        elif player.round_number == 38:
            if player.ones == 15:
                player.participant.score += 1
        elif player.round_number == 39:
            if player.ones == 16:
                player.participant.score += 1
        elif player.round_number == 40:
            if player.ones == 4:
                player.participant.score += 1


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs

    @staticmethod
    def is_displayed(player: Player):
        return player.round_number == Constants.num_rounds


class Control(Page):
    form_model = 'player'
    form_fields = ['age', 'sex', 'field', 'employment']

    @staticmethod
    def is_displayed(player: Player):
        return player.round_number == Constants.num_rounds


class Results(Page):
    pass

    @staticmethod
    def is_displayed(player: Player):
        return player.round_number == Constants.num_rounds

    @staticmethod
    def vars_for_template(player: Player):
        take1 = player.group.get_player_by_id(1).participant.take
        take3 = player.group.get_player_by_id(3).participant.take
        return dict(
            take1=take1,
            take3=take3,
            reduced2=player.group.get_player_by_id(2).participant.score * (1 - take1 / 100),
            reduced4=player.group.get_player_by_id(4).participant.score * (1 - take3 / 100),
            increased1=player.group.get_player_by_id(1).participant.score + player.group.get_player_by_id(2).participant.score * (take1/100),
            increased3=player.group.get_player_by_id(3).participant.score + player.group.get_player_by_id(4).participant.score * (take3/100)
        )


def custom_export(players):
    # header row
    yield ['session', 'participant_code', 'prolificID', 'is_senior', 'take', 'score', 'control', 'age', 'sex', 'field', 'employment', 'payoff']
    for p in players:
        participant = p.participant
        session = p.session
        if p.round_number == 40:
            yield [session.code, participant.code, participant.pID,
                   participant.is_senior, participant.take, participant.score, participant.control,
                   p.age, p.sex, p.field, p.employment, participant.payoff_plus_participation_fee()]


page_sequence = [Welcome, Instructions, Take, TakeWaitPage, Info, InfoWaitPage,
                 StartWaitPage, Task, ResultsWaitPage, Control, Results]
