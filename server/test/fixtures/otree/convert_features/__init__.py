from otree.api import *
import random

doc = """
What jtree's converter translates from Python (see test/otree-convert.test.js): its bots check it,
as the oTree app and as the jtree app it converts to.
"""


class C(BaseConstants):
    NAME_IN_URL = 'convert_features'
    PLAYERS_PER_GROUP = 3
    NUM_ROUNDS = 2
    ENDOWMENT = cu(10)
    LEADER_ROLE = 'Leader'
    FOLLOWER_ROLE = 'Follower'
    OTHER_ROLE = 'Other'
    BONUS = {'red': 3, 'blue': 1}
    PAIRS = [(1, 2), (2, 3)]


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    total = models.CurrencyField(initial=0)
    ranking = models.StringField()
    summary = models.StringField()


class Player(BasePlayer):
    amount = models.IntegerField(min=0, label='How much?')
    color = models.StringField(choices=[['red', 'Red'], ['blue', 'Blue']], widget=widgets.RadioSelect)
    agree = models.BooleanField()
    note = models.StringField(blank=True)
    extra = models.IntegerField(initial=0)
    half = models.IntegerField()


# FUNCTIONS
def amount_max(player: Player):
    return C.ENDOWMENT + player.round_number


def amount_error_message(player: Player, value):
    if value == 7:
        return 'Not 7'


def creating_session(subsession: Subsession):
    session = subsession.session
    if subsession.round_number == 1:
        session.vars['lucky'] = random.randint(1, 3)
    for p in subsession.get_players():
        p.participant.vars.setdefault('visits', 0)


def set_payoffs(group: Group):
    players = group.get_players()
    amounts = [p.amount for p in players]
    group.total = sum(amounts)
    by_id = {p.id_in_group: p for p in players}
    pairs = [(a, b) for a, b in C.PAIRS if by_id[a].color == by_id[b].color]
    ranked = sorted(players, key=lambda p: (-p.amount, p.id_in_group))
    group.ranking = ','.join(str(p.id_in_group) for p in ranked)
    lowest = min(players, key=lambda p: p.amount)
    matrix = {(True, 'red'): 2, (True, 'blue'): 1, (False, 'red'): 0, (False, 'blue'): -1}
    i = 0
    while True:
        i += 1
        if i >= 3:
            break
    for idx, p in enumerate(players, start=1):
        p.payoff = C.ENDOWMENT - p.amount + group.total / len(players)
        p.payoff += C.BONUS.get(p.color, 0) + matrix[(p.agree, p.color)]
        if p == lowest and pairs:
            p.payoff += len(pairs)
        p.extra = idx * 10 // 3 % 4 + (2 ** i if 0 < p.amount <= 5 else 0)
        p.half = round(p.amount / 2)
    group.get_player_by_role(C.LEADER_ROLE).extra += 100
    everyone = 'all' if all(p.agree for p in players) else 'not all'
    group.summary = f'{len(players)} players, total {group.total:.1f}, {everyone} agree'


def describe(player: Player):
    return 'Player {}'.format(player.id_in_group)


# PAGES
class Intro(Page):
    @staticmethod
    def is_displayed(player: Player):
        return player.round_number == 1


class Decide(Page):
    form_model = 'player'
    form_fields = ['amount', 'color', 'agree', 'note']

    @staticmethod
    def get_timeout_seconds(player: Player):
        return 600 + player.round_number

    @staticmethod
    def vars_for_template(player: Player):
        others = player.get_others_in_group()
        return dict(history=[p.amount for p in player.in_previous_rounds()], others=[o.id_in_group for o in others])

    @staticmethod
    def error_message(player: Player, values):
        if values['note'] == 'bad':
            return 'Bad note'

    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        player.participant.vars['visits'] += 1
        if timeout_happened:
            player.note = 'late'


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    @staticmethod
    def vars_for_template(player: Player):
        return dict(color_label=player.field_display('color'), lucky=player.session.vars['lucky'])


page_sequence = [Intro, Decide, ResultsWaitPage, Results]
