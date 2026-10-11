import time
import random
from otree.api import *
from otree import settings


doc = """
Slider task akin to Gill and Prowse (2012). Task is sequential to avoid sliders being lost in case of page refreshes.
Code is based on a captcha task by Maxim Vasilyev (Github user name: qwiglydee).
"""


class Constants(BaseConstants):
    name_in_url = "SL"
    players_per_group = 2
    num_rounds = 1

    high = cu(28)
    low = cu(14)

    role_A = "A"
    role_B = "B"


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):

    coin = models.IntegerField(initial=-1)


class Player(BasePlayer):

    # current state of the game
    # for multi-round games: increment the round and reset iteration
    game_round = models.IntegerField(initial=0)
    game_iteration = models.IntegerField(initial=0)

    # stats are updated after game round, in before_next_page
    total = models.IntegerField(initial=0)
    correct = models.IntegerField(initial=0)
    incorrect = models.IntegerField(initial=0)


# slider-specific stuff


class Trial(ExtraModel):
    """A model to keep record of all generated sliders"""

    player = models.Link(Player)
    round = models.IntegerField(initial=0)
    iteration = models.IntegerField(initial=0)
    timestamp = models.LongStringField()

    solution = models.IntegerField()

    # the following fields remain null for unanswered trials
    answer_timestamp = models.LongStringField()
    answer = models.IntegerField()
    is_correct = models.BooleanField()
    retries = models.IntegerField(initial=0)


def flip_coin(group: Group):
    if group.coin == -1:
        group.coin = random.choice([0, 1])


def generate_slider(player: Player) -> Trial:
    """Create new slider for a player"""
    return Trial.create(
        player=player
    )


def get_last_trial(player):
    """Get last (current) slider for a player"""
    trials = Trial.filter(player=player)
    trial = trials[-1] if len(trials) else None
    return trial


def check_answer(trial: Trial, answer: str):
    """Check given answer for a slider and update its status"""
    if answer == "" or answer is None:
        raise ValueError("Unexpected empty answer from client")
    trial.answer = answer
    trial.is_correct = int(answer) == 50


def summarize_trials(player: Player):
    """Returns summary stats for a player
    Used to provide info for client, and to update player class after a game round
    """
    total = len(Trial.filter(player=player))
    correct = len(Trial.filter(player=player, is_correct=True))
    incorrect = len(Trial.filter(player=player, is_correct=False))
    return {
        'total': total,
        'correct': correct,
        'incorrect': incorrect,
    }

# gameplay logic


def play_game(player: Player, data: dict):
    """Handles iterations of the game on a live page
    Messages:
    - client > server {} -- empty message means page reload
    - server < client {'next': true} -- request for next (or first) slider
    - server > client {'image': data, 'stats': ...} -- slider image
    - server < client {'answer': data} -- answer to a slider
    - server > client {'feedback': true|false, 'stats': ...} -- feedback on the answer
    - server > client {'gameover': true} -- all iterations played
    if DEBUG=1
    - server < client {'cheat': true} -- request solution
    - server > client {'solution': str} -- solution
    """
    conf = player.session.config
    trial_delay = conf.get('trial_delay', 0.1)
    retry_delay = conf.get('retry_delay', 0.1)
    force_solve = conf.get('force_solve', False)
    allow_skip = conf.get('allow_skip', True)
    allow_retry = conf.get('allow_retry', False) or force_solve
    max_iter = conf.get('num_iterations', 0)

    now = time.time()

    # get last trial, if any
    last = get_last_trial(player)

    if data == {}:
        if last:  # reloaded in middle of round, return current slider
            stats = summarize_trials(player)
            data = random.choice(range(0, 101, 1))
            return {player.id_in_group: {"image": data, "stats": stats}}
        else:  # initial load, generate first slider
            trial = generate_slider(player)
            trial.timestamp = str(now)
            trial.iteration = 1
            player.game_iteration = 1
            stats = summarize_trials(player)
            pos = random.choice(range(0, 101, 1))
            return {player.id_in_group: {"image": pos, "stats": stats}}

    # generate next slider and return image
    if "next" in data:
        if not last:
            raise RuntimeError("Missing current slider!")
        if now - float(last.timestamp) < trial_delay:
            raise RuntimeError("Client advancing too fast!")
        if force_solve and last.is_correct is not True:
            raise RuntimeError("Attempted to skip unsolved slider!")
        if not allow_skip and last.answer is None:
            raise RuntimeError("Attempted to skip unanswered slider!")
        if max_iter and last.iteration >= max_iter:
            return {player.id_in_group: {"gameover": True}}

        # new trial
        trial = generate_slider(player)
        trial.timestamp = str(now)
        trial.iteration = last.iteration + 1 if last else 1
        player.game_iteration = trial.iteration

        # get total counters
        stats = summarize_trials(player)

        # return image
        data = random.choice(range(0, 101, 1))
        return {player.id_in_group: {"image": data, "stats": stats}}

    # check given answer and return feedback
    if "answer" in data:
        if not last:
            raise RuntimeError("Missing current slider")
        if last.answer is not None:  # retrying
            if not allow_retry:
                raise RuntimeError("Client retries the same slider!")
            if now - float(last.answer_timestamp) < retry_delay:
                raise RuntimeError("Client retrying too fast!")

        check_answer(last, data["answer"])
        last.answer_timestamp = str(now)
        last.retries += 1

        # get total counters
        stats = summarize_trials(player)

        # return feedback
        return {player.id_in_group: {'feedback': last.is_correct, 'stats': stats}}

    if "cheat" in data and settings.DEBUG:
        if not last:
            raise RuntimeError("Missing current slider")
        return {player.id_in_group: {'solution': last.solution}}

    # otherwise
    raise ValueError("Invalid message from client!")


def custom_export(players):
    """Dumps all the sliders generated"""
    yield [
        "session",
        "participant_code",
        "game_round",
        "game_iteration",
        "timestamp",
        "width",
        "height",
        "solution",
        "answer_timestamp",
        "answer",
        "is_correct",
        "retries",
    ]
    for p in players:
        participant = p.participant
        session = p.session
        for z in Trial.filter(player=p):
            yield [
                session.code,
                participant.code,
                z.round,
                z.iteration,
                z.timestamp,
                z.solution,
                z.answer_timestamp,
                z.answer,
                z.is_correct,
                z.retries,
            ]


def groupcoin(group: Group):
    flip_coin(group)
    p = group.get_players()
    for play in p:
        get_slider_stats(play)
    for play in p:
        calculate_payoffs(play)


def save_to_partvars2(player: Player):
    participant = player.participant
    participant.stage2pay = player.payoff


def get_slider_stats(player: Player):
    stats = summarize_trials(player)
    player.total = stats['total']
    player.correct = stats['correct']
    player.incorrect = stats['incorrect']


def calculate_payoffs(player: Player):
    otherp = player.get_others_in_group()[0]

    if player.participant.treatment == 1:
        if player.correct == otherp.correct:
            if player.id_in_group > otherp.id_in_group:
                player.payoff = player.group.coin * Constants.high + (1 - player.group.coin) * Constants.low
            else:
                player.payoff = (1 - player.group.coin) * Constants.high + player.group.coin * Constants.low
        else:
            player.payoff = (player.correct > otherp.correct) * Constants.high + \
                            (player.correct < otherp.correct) * Constants.low
    if player.participant.treatment == 0:
        if player.id_in_group > otherp.id_in_group:
            player.payoff = player.group.coin * Constants.high + (1 - player.group.coin) * Constants.low
        else:
            player.payoff = (1 - player.group.coin) * Constants.high + player.group.coin * Constants.low


def group_by_arrival_time_method(subsession: Subsession, waiting_players):
    # print('in group_by_arrival_time_method')
    hashs = set([p.participant.id_aux for p in waiting_players])
    m_players = [[p for p in waiting_players if p.participant.id_aux == x] for x in hashs]
    # print(m_players)

    if len(m_players[0]) == 2:
        # print('about to create a group')
        return m_players[0]
    # print('not enough players yet to create a group')


# PAGES
class P0WG(WaitPage):

    group_by_arrival_time = True


class P1I(Page):

    @staticmethod
    def vars_for_template(player: Player):
        treat = player.participant.treatment
        return {'treat': treat}


class P2S(Page):
    timeout_seconds = 300
    live_method = play_game

    @staticmethod
    def vars_for_template(player: Player):
        session = player.session

        return dict(
            DEBUG=settings.DEBUG, manual_advance=session.config.get('manual_advance')
        )

    @staticmethod
    def js_vars(player: Player):
        conf = player.session.config
        return dict(
            trial_delay=conf.get('trial_delay', 1.0),
            retry_delay=conf.get('retry_delay', 1.0),
            force_solve=conf.get('force_solve', False),
            allow_skip=conf.get('allow_skip', False),
        )


class P3R(Page):

    @staticmethod
    def vars_for_template(player: Player):
        a = player.payoff == Constants.high
        b = a * "the winner" + (1-a) * "the loser"
        d = (1-a) * "the winner" + a * "the loser"
        treat = player.participant.treatment
        otherp = player.get_others_in_group()[0]
        othercorrect = otherp.correct
        coin = player.correct == othercorrect
        return {'winlose': b, 'treat': treat, 'othercorrect': othercorrect, 'otherpay': otherp.payoff, 'coin': coin,
                'otherwinlose': d}

    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        save_to_partvars2(player)


class Wait(WaitPage):

    after_all_players_arrive = groupcoin


page_sequence = [P0WG, P1I, P2S, Wait, P3R]
