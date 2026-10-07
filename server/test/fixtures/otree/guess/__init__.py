"""Guess two thirds of the average, in oTree's format, with a timed intro and a survey."""
from otree.api import *


class C(BaseConstants):
    NAME_IN_URL = 'guess'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 2
    PRIZE = cu(10)


class Subsession(BaseSubsession):
    two_thirds = models.FloatField()


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    treatment = models.StringField()
    intro_timed_out = models.BooleanField()
    guess = models.IntegerField(min=0, max=100, label='Your guess (0 to 100):')
    is_winner = models.BooleanField(initial=False)
    age = models.IntegerField(min=13, max=125, label='Your age:')
    likes = models.StringField(choices=[['y', 'Yes'], ['n', 'No']], widget=widgets.RadioSelect, label='Did you like it?')
    happy = models.BooleanField(label='Are you happy?')
    comment = models.LongStringField(blank=True, label='Anything else?')


def creating_session(subsession: Subsession):
    if subsession.round_number == 1:
        for p in subsession.get_players():
            p.participant.vars['treatment'] = 'high' if p.participant.id_in_session % 2 else 'low'
        subsession.session.vars['created'] = 1
    for p in subsession.get_players():
        p.treatment = p.participant.vars['treatment']


def guess_error_message(player: Player, value):
    if value == 50:
        return 'Not 50, please.'


def set_winners(subsession: Subsession):
    players = subsession.get_players()
    guesses = [p.guess for p in players]
    subsession.two_thirds = sum(guesses) / len(guesses) * 2 / 3
    best = min(abs(g - subsession.two_thirds) for g in guesses)
    for p in players:
        p.is_winner = abs(p.guess - subsession.two_thirds) == best
        p.payoff = C.PRIZE if p.is_winner else cu(0)


class Intro(Page):
    timeout_seconds = 1

    @staticmethod
    def is_displayed(player: Player):
        return player.round_number == 1

    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        player.intro_timed_out = timeout_happened


class Guess(Page):
    form_model = 'player'
    form_fields = ['guess']


class AllGuessed(WaitPage):
    wait_for_all_groups = True
    after_all_players_arrive = 'set_winners'


class Survey(Page):
    form_model = 'player'
    form_fields = ['age', 'likes', 'happy', 'comment']

    @staticmethod
    def is_displayed(player: Player):
        return player.round_number == C.NUM_ROUNDS

    @staticmethod
    def error_message(player: Player, values):
        if values['likes'] == 'n' and values['happy']:
            return "You said you did not like it but are happy?"


page_sequence = [Intro, Guess, AllGuessed, Survey]
