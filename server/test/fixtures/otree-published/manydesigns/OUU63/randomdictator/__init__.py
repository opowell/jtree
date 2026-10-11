import random

from otree.api import *

doc = """
Random dictator game akin to Vanbergh (2008) based on Charness and Dufwenberg (2006) plus survey and Payoff screen.
"""


def make_field2(label):
    return models.BooleanField(
        label=label,
        widget=widgets.CheckboxInput,
        blank=True
    )


class Constants(BaseConstants):
    name_in_url = 'RD'
    players_per_group = 2
    num_rounds = 1

    role_A = "A"
    role_B = "B"


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    otherpromise = models.BooleanField()

    die_roll = models.IntegerField()

    roll = models.BooleanField(
        label="Please select now whether you want to roll the die or not.",
        choices=[
            [1, "Roll the die"],
            [0, "Do not roll the die"]
        ]
    )

    age = models.IntegerField(min=16, max=100, label="How old are you?")
    gender = models.IntegerField(widget=widgets.RadioSelect,
                                 choices=[
                                     [1, "Male"],
                                     [2, "Female"],
                                     [3, "Non-Binary"]
                                 ], label="What is your gender?"
                                 )
    highest_degree = models.IntegerField(widget=widgets.RadioSelect,
                                         choices=[
                                             [0, "No Degree"],
                                             [1, "GCSE"],
                                             [2, "A-Level"],
                                             [3, "Bachelor's Degree"],
                                             [4, "Master's Degree"],
                                             [5, "Doctorate"]
                                         ], label="What is the highest educational degree you hold?")

    occupation = models.IntegerField(widget=widgets.RadioSelect,
                                     choices=[
                                         [0, "Unemployed"],
                                         [1, "Manual Labour"],
                                         [2, "Managerial and Administrative Labour"],
                                         [3, "Fulltime Student"]
                                     ], label="Which of the following best describes your field of occupation?")

    device = models.IntegerField(widget=widgets.RadioSelect,
                                 choices=[
                                     [1, "PC (Windows)"],
                                     [2, "Mac (OS X)"],
                                     [3, "PC (Linux)"],
                                     [4, "Tablet"],
                                     [5, "Smartphone"],
                                 ],
                                 label="On which type of device did you take part in this study?")


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
    def before_next_page(player: Player, timeout_happened):
        otherp = player.get_others_in_group()[0]
        player.die_roll = random.choice(range(1, 7, 1))
        player.otherpromise = otherp.participant.promise


class P2D(Page):
    form_model = 'player'
    form_fields = ['roll']

    @staticmethod
    def vars_for_template(player: Player):
        if player.otherpromise:
            a = "“I promise to roll the die in stage 3.”"
        else:
            a = "“I do not promise to roll the die in stage 3.”"
        if player.participant.promise:
            b = "“I promise to roll the die in stage 3.”"
        else:
            b = "“I do not promise to roll the die in stage 3.”"
        return {'other_promise_message': a, 'promise_message': b}


class Wait(WaitPage):
    pass


class P3CP(Page):

    @staticmethod
    def is_displayed(player: Player):
        otherp = player.get_others_in_group()[0]
        ran_num = player.die_roll
        other_ran_num = otherp.die_roll
        if player.role == "A":
            if player.roll == 1:
                player.payoff = cu(10)
            else:
                player.payoff = cu(14)
        else:
            if otherp.roll == 1:
                if other_ran_num > 1:
                    player.payoff = cu(12)
                else:
                    player.payoff = cu(0)
            else:
                player.payoff = cu(0)
        return False


class P4S(Page):
    form_model = 'player'
    form_fields = ['age', 'gender', 'highest_degree', 'occupation', 'device']

    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        player.participant.finished = True


class P5R(Page):

    @staticmethod
    def vars_for_template(player: Player):
        otherp = player.get_others_in_group()[0]
        other_roll = otherp.roll
        a = player.roll * "You decided to roll the die." + (1 - player.roll) * "You decided not to roll the die."
        b = other_roll * "The other player decided to roll the die." + (1 - other_roll) * "The other player decided " \
                                                                                          "not to roll the die. "
        ran_num = player.die_roll
        other_pay = otherp.payoff
        payoff_final_curr = player.participant.payoff.to_real_world_currency(player.session)
        payoff_final = player.participant.payoff
        payoff_final_partic_curr = player.participant.payoff_plus_participation_fee()
        partic_fee = player.session.config['participation_fee']
        return dict(
            decision=a,
            decision_other=b,
            ran_num=ran_num,
            other_pay=other_pay,
            other_roll=other_roll,
            payoff_final_curr=payoff_final_curr,
            payoff_final=payoff_final,
            payoff_final_partic_curr=payoff_final_partic_curr,
            partic_fee=partic_fee
        )


page_sequence = [P0WG, P1I, P2D, Wait, P3CP, P4S, P5R]
