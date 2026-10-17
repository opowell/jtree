from otree.api import *


doc = """
Centipede game (McKelvey and Palfrey, 1992): the two players in each pair take turns, player 1
first. The mover can take 80% of the pot, which ends the game (the other gets 20%), or pass, which
doubles it. After 6 passes, the pot is shared equally.
"""


class C(BaseConstants):
    NAME_IN_URL = 'centipede'
    PLAYERS_PER_GROUP = 2
    NUM_ROUNDS = 1
    INITIAL_POT = cu(10)
    POT_MULTIPLIER = 2
    TAKER_SHARE = 0.8
    NUM_MOVES = 6


class Subsession(BaseSubsession):
    pass


def take_field():
    return models.BooleanField(choices=[[True, 'Take'], [False, 'Pass']], widget=widgets.RadioSelect, label="You:")


class Group(BaseGroup):
    pot = models.CurrencyField(initial=C.INITIAL_POT)
    taken_at = models.IntegerField(initial=0, doc="The move at which the pot was taken; 0 if it never was")
    take1 = take_field()
    take2 = take_field()
    take3 = take_field()
    take4 = take_field()
    take5 = take_field()
    take6 = take_field()


class Player(BasePlayer):
    pass


# FUNCTIONS
def mover(move):
    """Player 1 moves on moves 1, 3 and 5; player 2 on moves 2, 4 and 6."""
    return 1 if move % 2 == 1 else 2


def set_payoffs(group: Group):
    for p in group.get_players():
        if group.taken_at == 0:
            p.payoff = group.pot / 2
        elif p.id_in_group == mover(group.taken_at):
            p.payoff = group.pot * C.TAKER_SHARE
        else:
            p.payoff = group.pot - group.pot * C.TAKER_SHARE


# PAGES
def move_page(move):
    """The page of a move: shown to its mover, unless the pot has been taken."""

    class MovePage(Page):
        form_model = 'group'
        form_fields = ['take{}'.format(move)]
        template_name = 'centipede/Move.html'

        @staticmethod
        def is_displayed(player: Player):
            return player.id_in_group == mover(move) and player.group.taken_at == 0

        @staticmethod
        def vars_for_template(player: Player):
            pot = player.group.pot
            return dict(move=move, last=move == C.NUM_MOVES, take=pot * C.TAKER_SHARE,
                        leave=pot - pot * C.TAKER_SHARE, doubled=pot * C.POT_MULTIPLIER)

        @staticmethod
        def before_next_page(player: Player, timeout_happened):
            group = player.group
            if getattr(group, 'take{}'.format(move)):
                group.taken_at = move
            else:
                group.pot = group.pot * C.POT_MULTIPLIER

    MovePage.__name__ = MovePage.__qualname__ = 'Move{}'.format(move)
    return MovePage


def move_wait_page(move):
    class MoveWaitPage(WaitPage):
        pass

    MoveWaitPage.__name__ = MoveWaitPage.__qualname__ = 'MoveWaitPage{}'.format(move)
    return MoveWaitPage


Move1, Move2, Move3, Move4, Move5, Move6 = [move_page(m) for m in range(1, C.NUM_MOVES + 1)]
MoveWaitPage1, MoveWaitPage2, MoveWaitPage3, MoveWaitPage4, MoveWaitPage5 = [move_wait_page(m) for m in range(1, C.NUM_MOVES)]


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = set_payoffs


class Results(Page):
    @staticmethod
    def vars_for_template(player: Player):
        return dict(taker=mover(player.group.taken_at))


page_sequence = [Move1, MoveWaitPage1, Move2, MoveWaitPage2, Move3, MoveWaitPage3, Move4, MoveWaitPage4,
                 Move5, MoveWaitPage5, Move6, ResultsWaitPage, Results]
