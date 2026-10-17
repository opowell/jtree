from otree.api import *


doc = """
Real-effort task: add up sums of three two-digit numbers, one after another, for 60 seconds. Each
correct sum earns a point. The session config's work_time changes the 60 seconds.
"""


class C(BaseConstants):
    NAME_IN_URL = 'real_effort'
    PLAYERS_PER_GROUP = None
    NUM_ROUNDS = 1
    NUMBERS_PER_SUM = 3
    MIN_NUMBER = 10
    MAX_NUMBER = 99


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    numbers = models.StringField(doc="The sum to do now, as its numbers separated by +")
    attempted = models.IntegerField(initial=0)
    solved = models.IntegerField(initial=0)


# FUNCTIONS
def new_sum(player: Player):
    import random

    player.numbers = '+'.join(str(random.randint(C.MIN_NUMBER, C.MAX_NUMBER)) for _ in range(C.NUMBERS_PER_SUM))


def creating_session(subsession: Subsession):
    for p in subsession.get_players():
        new_sum(p)


def state(player: Player):
    return dict(numbers=player.numbers.replace('+', ' + '), attempted=player.attempted, solved=player.solved)


# PAGES
class Work(Page):
    @staticmethod
    def get_timeout_seconds(player: Player):
        return player.session.config.get('work_time', 60)

    @staticmethod
    def js_vars(player: Player):
        return state(player)

    @staticmethod
    def live_method(player: Player, data):
        if isinstance(data, dict) and 'answer' in data:
            player.attempted += 1
            if data['answer'] == sum(int(n) for n in player.numbers.split('+')):
                player.solved += 1
            new_sum(player)
        return {player.id_in_group: state(player)}

    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        player.payoff = player.solved


class Results(Page):
    pass


page_sequence = [Work, Results]
