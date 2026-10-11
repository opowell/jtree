import time

from otree import settings
from otree.api import *

from .image_utils import encode_image


def get_task_module(player):
    """
    This function is only needed for demo mode, to demonstrate all the different versions.
    You can simplify it if you want.
    """
    from . import task_decoding

    # session = player.session
    # task = session.config.get("task")
    # if task == "matrix":
    #     return task_matrix
    # if task == "transcription":
    #     return task_transcription
    # if task == "decoding":
    #     return task_decoding
    # # default
    return task_decoding


class Constants(BaseConstants):
    name_in_url = "transcription"
    players_per_group = 4
    num_rounds = 1

    # instructions_template = __name__ + "/General_Instructions.html"
    captcha_length = 3

    yellow_role = 'Player Yellow'
    red_role = 'Player Red'
    green_role = 'Player Green'
    blue_role = 'Player Blue'

    payoff_1 = 100

class Subsession(BaseSubsession):
    pass


def creating_session(subsession: Subsession):
    session = subsession.session
    defaults = dict(
        retry_delay=1.0, puzzle_delay=1.0, attempts_per_puzzle=1, max_iterations=None
    )
    session.params = {}
    for param in defaults:
        session.params[param] = session.config.get(param, defaults[param])




class Group(BaseGroup):
    pass



class Player(BasePlayer):
    prolific_ID = models.StringField(label="But first, please enter your Prolific ID here:")
    iteration = models.IntegerField(initial=0)
    num_trials = models.IntegerField(initial=0)
    num_correct = models.IntegerField(initial=0)
    num_failed = models.IntegerField(initial=0)

    rank = models.IntegerField()

    transfer_yellow = models.IntegerField(
        choices=[[-30, '-30'],
                 [-20, '-20'],
                 [-10, '-10'],
                 [0, '0'],
                 [10, '10'],
                 [20, '20'],
                 [30, '30']],
        widget=widgets.RadioSelectHorizontal
    )


    transfer_red = models.IntegerField(
        choices=[[-30, '-30'],
                 [-20, '-20'],
                 [-10, '-10'],
                 [0, '0'],
                 [10, '10'],
                 [20, '20'],
                 [30, '30']],
        widget=widgets.RadioSelectHorizontal
    )


    transfer_green = models.IntegerField(
        choices=[[-30, '-30'],
                 [-20, '-20'],
                 [-10, '-10'],
                 [0, '0'],
                 [10, '10'],
                 [20, '20'],
                 [30, '30']],
        widget=widgets.RadioSelectHorizontal
    )

    transfer_blue = models.IntegerField(
        choices=[[-30, '-30'],
                 [-20, '-20'],
                 [-10, '-10'],
                 [0, '0'],
                 [10, '10'],
                 [20, '20'],
                 [30, '30']],
        widget=widgets.RadioSelectHorizontal
    )

    payoff_2 = models.IntegerField(initial=0)
    payoff_total = models.IntegerField(initial=0)


def rank_players(group: Group):
    num_correct_all = []

    for p in group.get_players():
        num_correct_all.append((p.num_correct, p.id_in_group))

    num_correct_all.sort()

    for p in group.get_players():
        p.rank = 4 - num_correct_all.index((p.num_correct, p.id_in_group))
        print('rank:', p.rank)

    return num_correct_all



def payoffs_part_2(group: Group):
    p1 = group.get_player_by_role(Constants.yellow_role)
    p2 = group.get_player_by_role(Constants.red_role)
    p3 = group.get_player_by_role(Constants.green_role)
    p4 = group.get_player_by_role(Constants.blue_role)

    f = lambda x: -1 if x > 0 else 0 if x == 0 else 1

    p1.payoff_2 = 100 + p2.transfer_yellow + p3.transfer_yellow + p4.transfer_yellow
    p1.payoff_2 += f(p1.transfer_blue) + f(p1.transfer_red) + f(p1.transfer_green)

    p2.payoff_2 = 100 + p1.transfer_red + p3.transfer_red + p4.transfer_red
    p2.payoff_2 += f(p2.transfer_blue) + f(p2.transfer_yellow) + f(p2.transfer_green)

    p3.payoff_2 = 100 + p1.transfer_green + p2.transfer_green + p4.transfer_green
    p3.payoff_2 += f(p3.transfer_blue) + f(p3.transfer_red) + f(p3.transfer_yellow)

    p4.payoff_2 = 100 + p1.transfer_blue + p2.transfer_blue + p3.transfer_blue
    p4.payoff_2 += f(p4.transfer_yellow) + f(p4.transfer_red) + f(p4.transfer_green)

    for p in group.get_players():
        p.payoff_total = Constants.payoff_1 + p.payoff_2
        p.payoff = p.payoff_total * 0.0075


# puzzle-specific stuff


class Puzzle(ExtraModel):
    """A model to keep record of all generated puzzles"""

    player = models.Link(Player)
    iteration = models.IntegerField(initial=0)
    attempts = models.IntegerField(initial=0)
    timestamp = models.FloatField(initial=0)
    # can be either simple text, or a json-encoded definition of the puzzle, etc.
    text = models.LongStringField()
    # solution may be the same as text, if it's simply a transcription task
    solution = models.LongStringField()
    response = models.LongStringField()
    response_timestamp = models.FloatField()
    is_correct = models.BooleanField()


def generate_puzzle(player: Player) -> Puzzle:
    """Create new puzzle for a player"""
    task_module = get_task_module(player)
    fields = task_module.generate_puzzle_fields()
    player.iteration += 1
    return Puzzle.create(
        player=player, iteration=player.iteration, timestamp=time.time(), **fields
    )


def get_current_puzzle(player):
    puzzles = Puzzle.filter(player=player, iteration=player.iteration)
    if puzzles:
        [puzzle] = puzzles
        return puzzle


def encode_puzzle(puzzle: Puzzle):
    """Create data describing puzzle to send to client"""
    task_module = get_task_module(puzzle.player)  # noqa
    # generate image for the puzzle
    image = task_module.render_image(puzzle)
    data = encode_image(image)
    return dict(image=data)


def get_progress(player: Player):
    """Return current player progress"""
    return dict(
        num_trials=player.num_trials,
        num_correct=player.num_correct,
        num_incorrect=player.num_failed,
        iteration=player.iteration,
    )


def play_game(player: Player, message: dict):
    """Main game workflow
    Implemented as reactive scheme: receive message from vrowser, react, respond.

    Generic game workflow, from server point of view:
    - receive: {'type': 'load'} -- empty message means page loaded
    - check if it's game start or page refresh midgame
    - respond: {'type': 'status', 'progress': ...}
    - respond: {'type': 'status', 'progress': ..., 'puzzle': data} -- in case of midgame page reload

    - receive: {'type': 'next'} -- request for a next/first puzzle
    - generate new puzzle
    - respond: {'type': 'puzzle', 'puzzle': data}

    - receive: {'type': 'answer', 'answer': ...} -- user answered the puzzle
    - check if the answer is correct
    - respond: {'type': 'feedback', 'is_correct': true|false, 'retries_left': ...} -- feedback to the answer

    If allowed by config `attempts_pre_puzzle`, client can send more 'answer' messages
    When done solving, client should explicitely request next puzzle by sending 'next' message

    Field 'progress' is added to all server responses to indicate it on page.

    To indicate max_iteration exhausted in response to 'next' server returns 'status' message with iterations_left=0
    """
    session = player.session
    my_id = player.id_in_group
    params = session.params
    task_module = get_task_module(player)

    now = time.time()
    # the current puzzle or none
    current = get_current_puzzle(player)

    message_type = message['type']

    # page loaded
    if message_type == 'load':
        p = get_progress(player)
        if current:
            return {
                my_id: dict(type='status', progress=p, puzzle=encode_puzzle(current))
            }
        else:
            return {my_id: dict(type='status', progress=p)}

    if message_type == "cheat" and settings.DEBUG:
        return {my_id: dict(type='solution', solution=current.solution)}

    # client requested new puzzle
    if message_type == "next":
        if current is not None:
            if current.response is None:
                raise RuntimeError("trying to skip over unsolved puzzle")
            if now < current.timestamp + params["puzzle_delay"]:
                raise RuntimeError("retrying too fast")
            if current.iteration == params['max_iterations']:
                return {
                    my_id: dict(
                        type='status', progress=get_progress(player), iterations_left=0
                    )
                }
        # generate new puzzle
        z = generate_puzzle(player)
        p = get_progress(player)
        return {my_id: dict(type='puzzle', puzzle=encode_puzzle(z), progress=p)}

    # client gives an answer to current puzzle
    if message_type == "answer":
        if current is None:
            raise RuntimeError("trying to answer no puzzle")

        if current.response is not None:  # it's a retry
            if current.attempts >= params["attempts_per_puzzle"]:
                raise RuntimeError("no more attempts allowed")
            if now < current.response_timestamp + params["retry_delay"]:
                raise RuntimeError("retrying too fast")

            # undo last updation of player progress
            player.num_trials -= 1
            if current.is_correct:
                player.num_correct -= 1
            else:
                player.num_failed -= 1

        # check answer
        answer = message["answer"]

        if answer == "" or answer is None:
            raise ValueError("bogus answer")

        current.response = answer
        current.is_correct = task_module.is_correct(answer, current)
        current.response_timestamp = now
        current.attempts += 1

        # update player progress
        if current.is_correct:
            player.num_correct += 1
        else:
            player.num_failed += 1
        player.num_trials += 1

        retries_left = params["attempts_per_puzzle"] - current.attempts
        p = get_progress(player)
        return {
            my_id: dict(
                type='feedback',
                is_correct=current.is_correct,
                retries_left=retries_left,
                progress=p,
            )
        }

    raise RuntimeError("unrecognized message from client")


class General_Instructions(Page):
    form_model = 'player'
    form_fields = ['prolific_ID']

class MyWaitPage_0(WaitPage):
    pass


class Instructions_Part_1(Page):
    pass



class Part_1(Page):
    timeout_seconds = 180

    live_method = play_game

    @staticmethod
    def js_vars(player: Player):
        return dict(params=player.session.params)

    @staticmethod
    def vars_for_template(player: Player):
        task_module = get_task_module(player)
        return dict(DEBUG=settings.DEBUG,
                    input_type=task_module.INPUT_TYPE,
                    placeholder=task_module.INPUT_HINT)

    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        if not timeout_happened and not player.session.params['max_iterations']:
            raise RuntimeError("malicious page submission")


class MyWaitPage(WaitPage):

    @staticmethod
    def after_all_players_arrive(group):
        return rank_players(group)


class Results_Part_1(Page):
    timeout_seconds = 60



class Instructions_Part_2(Page):
    pass


class MyWaitPage_2(WaitPage):
    pass


class Part_2_Yellow(Page):
    timeout_seconds = 60

    def is_displayed(player: Player):
        return player.id_in_group == 1

    form_model = 'player'
    form_fields = ['transfer_red',
                    'transfer_green',
                    'transfer_blue']


class Part_2_Red(Page):
    timeout_seconds = 60
    def is_displayed(player: Player):
        return player.id_in_group == 2

    form_model = 'player'
    form_fields = ['transfer_yellow',
                    'transfer_green',
                    'transfer_blue']


class Part_2_Green(Page):
    timeout_seconds = 60

    def is_displayed(player: Player):
        return player.id_in_group == 3

    form_model = 'player'
    form_fields = ['transfer_yellow',
                    'transfer_red',
                    'transfer_blue']


class Part_2_Blue(Page):
    timeout_seconds = 60
    def is_displayed(player: Player):
        return player.id_in_group == 4

    form_model = 'player'
    form_fields = ['transfer_yellow',
                    'transfer_red',
                    'transfer_green']



class MyWaitPage_3(WaitPage):

    @staticmethod
    def after_all_players_arrive(group):
        return payoffs_part_2(group)


class Final_Results(Page):
    pass


page_sequence = [General_Instructions,
                 MyWaitPage_0,
                 Instructions_Part_1,
                 Part_1,
                 MyWaitPage,
                 Results_Part_1,
                 Instructions_Part_2,
                 MyWaitPage_2,
                 Part_2_Yellow,
                 Part_2_Red,
                 Part_2_Green,
                 Part_2_Blue,
                 MyWaitPage_3,
                 Final_Results]
