from otree.api import (
    Page,
    WaitPage,
    models,
    BaseConstants,
    BaseSubsession,
    BaseGroup,
    BasePlayer,
    Currency as c,
)

doc = """
2-Player Group Tasks: Ball-catch & Solidarity Game
"""


class Constants(BaseConstants):
    name_in_url = 'tasks'
    players_per_group = 2
    num_rounds = 1
    endowment = c(200)
    loss_share = 1
    reward = 10
    cost = 2
    timeout_dropped = 0
    timeout_reg = 30


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    transfer_AtoB = models.CurrencyField(
        initial=-1,
        min=0,
        max=Constants.endowment,
    )
    transfer_BtoA = models.CurrencyField(
        initial=-1,
        min=0,
        max=Constants.endowment,
    )
    dropouts = models.IntegerField()
    total_keep = models.IntegerField()


class Player(BasePlayer):
    catches = models.IntegerField()
    clicks = models.IntegerField()
    total_cost = models.IntegerField()
    total_reward = models.IntegerField()
    score = models.IntegerField()
    rank = models.IntegerField()
    rank_playerA = models.IntegerField(initial=99)
    rank_playerB = models.IntegerField(initial=99)
    num_page_loads_decisive = models.IntegerField(initial=0)
    rand = models.IntegerField(initial=99)
    keep = models.IntegerField()
    q2_fail_no = models.IntegerField(initial=0)
    q3_fail_no = models.IntegerField(initial=0)
    q4_fail_no = models.IntegerField(initial=0)
    q2_failed_too_many = models.BooleanField(initial=False)
    q3_failed_too_many = models.BooleanField(initial=False)
    q4_failed_too_many = models.BooleanField(initial=False)
    quiz2 = models.IntegerField(
        label='How many tokens does the other person receive when losing his/her endowment, in case you transfer nothing?')
    quiz3 = models.IntegerField(label="What is the minimum number of tokens you can transfer to the other person?")
    quiz4 = models.IntegerField(label="What is the maximum number of tokens you can transfer to the other person?")
    payoff_sol = models.CurrencyField()
    dropouts_in_group = models.IntegerField()
    dropout = models.BooleanField(initial=False)


# FUNCTIONS
def set_ranking(group: Group):
    import random
    import copy

    p1 = group.get_player_by_id(1)
    p2 = group.get_player_by_id(2)

    scores = list((
        p1.score,
        p2.score,
    ))

    scores_sorted = sorted(enumerate(scores), reverse=True, key=lambda x: x[1])

    for i in range(len(scores_sorted) - 1):
        a = copy.deepcopy(scores_sorted[i])
        b = copy.deepcopy(scores_sorted[i + 1])

        if a[1] == b[1]:
            if random.random() >= 0.5:
                scores_sorted[i] = b
                scores_sorted[i + 1] = a

    scores_rank = [x[0] for x in scores_sorted]

    p1.rank = scores_rank.index(0) + 1
    p2.rank = scores_rank.index(1) + 1

    players = group.get_players()
    for p in players:
        p.rank_playerA = p1.rank
        p.rank_playerB = p2.rank

        p.participant.vars['rank_playerA'] = p.rank_playerA
        p.participant.vars['rank_playerB'] = p.rank_playerB


def set_payoffs(group: Group):
    players = group.get_players()
    for p in players:
        if p.rand < 5 or p.rand == 99:
            p.keep = 1
        else:
            p.keep = 0
    keeps = [p.keep for p in players]
    group.total_keep = sum(keeps)

    p1 = group.get_player_by_id(1)
    p2 = group.get_player_by_id(2)
    for p in players:
        if group.total_keep == 2:
            p.payoff_sol = Constants.endowment
        elif group.total_keep == 1 and p1.keep == 1:
                p1.payoff_sol = Constants.endowment - group.transfer_AtoB
                p2.payoff_sol = group.transfer_AtoB
        elif group.total_keep == 1 and p2.keep == 1:
                p1.payoff_sol = group.transfer_BtoA
                p2.payoff_sol = Constants.endowment - group.transfer_BtoA
        else:
            p1.payoff_sol = 0
            p2.payoff_sol = 0

    for p in players:
        p.participant.vars['keep_earnings'] = p.keep
        p.participant.vars['group_keep'] = group.total_keep
        p.participant.vars['rand'] = p.rand

    # Calculate final payoffs depending on whether there are dropouts until this point
    dropouts = [p.participant.vars['is_dropout'] for p in players]
    group.dropouts = sum(dropouts)
    for p in players:
        p.dropouts_in_group = group.dropouts
        if group.dropouts == 0:
            p.payoff = p.payoff_sol
        else:
            if p.participant.vars['is_dropout']:
                p.payoff = 0
            else:
                p.payoff = Constants.endowment

        p.participant.vars['group_dropouts'] = group.dropouts
        p.dropout = p.participant.vars['is_dropout']

def quiz2_error_message(player, value):
    print('value is', value)
    if value != 0:
        player.q2_fail_no += 1
        if player.q2_fail_no >= 3:
            player.q2_failed_too_many = True
        else:
            return 'If one looses, the whole endowment is lost and one only receives what the other person transferred to them.'


def quiz3_error_message(player, value):
    print('value is', value)
    if value != 0:
        player.q3_fail_no += 1
        if player.q3_fail_no >= 3:
            player.q3_failed_too_many = True
        else:
            return 'You are free to decide if and how many tokens from your endowment you transfer to the other person.'


def quiz4_error_message(player, value):
    print('value is', value)
    if value != 200:
        player.q4_fail_no += 1
        if player.q4_fail_no >= 3:
            player.q4_failed_too_many = True
        else:
            return 'You are free to decide if and how many tokens from your endowment you transfer to the other person.'


def vars_for_template1(player: Player):
    return dict(
        image_pathA='solidarity/images/symbol{}.png'.format(player.participant.vars['rank_playerA']),
        image_pathB='solidarity/images/symbol{}.png'.format(player.participant.vars['rank_playerB'])
    )


# PAGES
class GWAIT(WaitPage):
    group_by_arrival_time = True

    @staticmethod
    def after_all_players_arrive(group: Group):
        for p in group.get_players():
            participant = p.participant
            participant.is_dropout = False


class Matching(Page):

    @staticmethod
    def get_timeout_seconds(player):
        participant = player.participant
        if participant.is_dropout:
            return Constants.timeout_dropped  # instant timeout
        else:
            return Constants.timeout_reg * 3  # 3 * constant time limit

    @staticmethod
    def before_next_page(player, timeout_happened):
        participant = player.participant
        if timeout_happened:
            participant.is_dropout = True


class Task1(Page):
    form_model = 'player'
    form_fields = ['catches', 'clicks']

    @staticmethod
    def get_timeout_seconds(player):
        participant = player.participant
        if participant.is_dropout:
            return Constants.timeout_dropped  # instant timeout
        else:
            return Constants.timeout_reg * 4  # 4 * constant time limit

    @staticmethod
    def vars_for_template(player: Player):
        player.num_page_loads_decisive += 1

    @staticmethod
    def before_next_page(player, timeout_happened):
        participant = player.participant
        if timeout_happened:
            participant.is_dropout = True

        player.total_reward = player.catches * Constants.reward
        player.total_cost = player.clicks * Constants.cost
        player.score = player.total_reward - player.total_cost


class ResultsWaitPage(WaitPage):
    after_all_players_arrive = 'set_ranking'
    body_text = "Waiting for the other person to finish the first task."


class Results_ballcatch(Page):

    @staticmethod
    def get_timeout_seconds(player):
        participant = player.participant
        if participant.is_dropout:
            return Constants.timeout_dropped  # instant timeout
        else:
            return Constants.timeout_reg * 3  # 3* constant time limit

    @staticmethod
    def before_next_page(player, timeout_happened):
        participant = player.participant
        if timeout_happened:
            participant.is_dropout = True


class Instructions(Page):
    @staticmethod
    def get_timeout_seconds(player):
        participant = player.participant
        if participant.is_dropout:
            return Constants.timeout_dropped  # instant timeout, 1 second
        else:
            return Constants.timeout_reg * 6  # 6* constant time limit

    @staticmethod
    def before_next_page(player, timeout_happened):
        participant = player.participant
        if timeout_happened:
            participant.is_dropout = True


class Quiz2(Page):
    form_model = 'player'
    form_fields = ['quiz2']

    @staticmethod
    def get_timeout_seconds(player):
        participant = player.participant
        if participant.is_dropout:
            return Constants.timeout_dropped  # instant timeout, 1 second
        else:
            return Constants.timeout_reg * 4  # 4* constant time limit

    @staticmethod
    def before_next_page(player, timeout_happened):
        participant = player.participant
        if timeout_happened:
            participant.is_dropout = True


class Failed2(Page):
    @staticmethod
    def is_displayed(player: Player):
        return player.q2_failed_too_many

    @staticmethod
    def get_timeout_seconds(player):
        participant = player.participant
        if participant.is_dropout:
            return Constants.timeout_dropped  # instant timeout, 1 second
        else:
            return Constants.timeout_reg * 2  # 2* constant time limit

    @staticmethod
    def before_next_page(player, timeout_happened):
        participant = player.participant
        if timeout_happened:
            participant.is_dropout = True


class Quiz3(Page):
    form_model = 'player'
    form_fields = ['quiz3']

    @staticmethod
    def get_timeout_seconds(player):
        participant = player.participant
        if participant.is_dropout:
            return Constants.timeout_dropped  # instant timeout, 1 second
        else:
            return Constants.timeout_reg * 4  # 4* constant time limit

    @staticmethod
    def before_next_page(player, timeout_happened):
        participant = player.participant
        if timeout_happened:
            participant.is_dropout = True


class Failed3(Page):
    @staticmethod
    def is_displayed(player: Player):
        return player.q3_failed_too_many

    @staticmethod
    def get_timeout_seconds(player):
        participant = player.participant
        if participant.is_dropout:
            return Constants.timeout_dropped  # instant timeout, 1 second
        else:
            return Constants.timeout_reg * 2  # 2* constant time limit

    @staticmethod
    def before_next_page(player, timeout_happened):
        participant = player.participant
        if timeout_happened:
            participant.is_dropout = True


class Quiz4(Page):
    form_model = 'player'
    form_fields = ['quiz4']

    @staticmethod
    def get_timeout_seconds(player):
        participant = player.participant
        if participant.is_dropout:
            return Constants.timeout_dropped  # instant timeout, 1 second
        else:
            return Constants.timeout_reg * 4  # 4* constant time limit

    @staticmethod
    def before_next_page(player, timeout_happened):
        participant = player.participant
        if timeout_happened:
            participant.is_dropout = True


class Failed4(Page):
    @staticmethod
    def is_displayed(player: Player):
        return player.q4_failed_too_many

    @staticmethod
    def get_timeout_seconds(player):
        participant = player.participant
        if participant.is_dropout:
            return Constants.timeout_dropped  # instant timeout, 1 second
        else:
            return Constants.timeout_reg * 2  # 2* constant time limit

    @staticmethod
    def before_next_page(player, timeout_happened):
        participant = player.participant
        if timeout_happened:
            participant.is_dropout = True


class Decision_A(Page):
    form_model = 'group'
    form_fields = ['transfer_AtoB']

    vars_for_template = vars_for_template1

    @staticmethod
    def is_displayed(player):
        return player.id_in_group == 1

    @staticmethod
    def get_timeout_seconds(player):
        participant = player.participant
        if participant.is_dropout:
            return Constants.timeout_dropped  # instant timeout, 1 second
        else:
            return Constants.timeout_reg * 4  # 4* constant time limit

    @staticmethod
    def before_next_page(player, timeout_happened):
        participant = player.participant
        if timeout_happened:
            participant.is_dropout = True


class Decision_B(Page):
    form_model = 'group'
    form_fields = ['transfer_BtoA']

    vars_for_template = vars_for_template1

    @staticmethod
    def is_displayed(player):
        return player.id_in_group == 2

    @staticmethod
    def get_timeout_seconds(player):
        participant = player.participant
        if participant.is_dropout:
            return Constants.timeout_dropped  # instant timeout, 1 second
        else:
            return Constants.timeout_reg * 4  # 4* constant time limit

    @staticmethod
    def before_next_page(player, timeout_happened):
        participant = player.participant
        if timeout_happened:
            participant.is_dropout = True


class Dice(Page):
    form_model = 'player'

    def live_method(player, data):
        if player.rand == 99:
            player.rand = data
        else:
            player.rand = player.rand

    @staticmethod
    def get_timeout_seconds(player):
        participant = player.participant
        if participant.is_dropout:
            return Constants.timeout_dropped  # instant timeout, 1 second
        else:
            return Constants.timeout_reg * 3  # 3* constant time limit

    @staticmethod
    def before_next_page(player, timeout_happened):
        participant = player.participant
        if timeout_happened:
            participant.is_dropout = True


class ResultsWaitPage2(WaitPage):
    after_all_players_arrive = 'set_payoffs'
    body_text = "Waiting for the other person to finish the second task."


class Results(Page):

    @staticmethod
    def get_timeout_seconds(player):
        participant = player.participant
        if participant.is_dropout:
            return Constants.timeout_dropped  # instant timeout, 1 second
        else:
            return Constants.timeout_reg * 3  # 3* constant time limit


page_sequence = [
    GWAIT,
    Matching,
    Task1,
    ResultsWaitPage,
    Results_ballcatch,
    Instructions,
    Quiz2,
    Failed2,
    Quiz3,
    Failed3,
    Quiz4,
    Failed4,
    Decision_A,
    Decision_B,
    Dice,
    ResultsWaitPage2,
    Results]
