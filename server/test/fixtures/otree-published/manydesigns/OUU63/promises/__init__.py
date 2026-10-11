import uuid

from otree.api import *

doc = """
Instructions for the Stage 1 and 3 plus decision on promises to be sent at the end of Stage 1
"""


class Constants(BaseConstants):
    name_in_url = 'PS'
    players_per_group = 2
    num_rounds = 1

    role_A = "A"
    role_B = "B"

    curr_unit = "£1"


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):

    id_aux = models.LongStringField()


class Player(BasePlayer):
    promise = models.BooleanField(label="Please select the message you want to send to the other participant at the "
                                        "end of this stage. ",
                                  choices=[
                                      [1, "I promise to roll the die in stage 3."],
                                      [0, "I do not promise to roll the die in stage 3."]
                                  ]
                                  )
    prolific_id = models.LongStringField(max_length=24, label="Please enter your Prolific-ID:")


def prolific_id_error_message(player, values):
    # print('values is', values)
    if len(values) != 24 or not values.isalnum():
        return "Your Prolific ID must contain exactly 24 characters. " \
               "These are either alphabetic (a-z) or numeric (0-9)."


def save_to_partvars(player: Player):
    participant = player.participant
    participant.promise = player.promise
    participant.treatment = player.session.config['treatment']
    participant.prolific_id = player.prolific_id


def creating_session(subsession: Subsession):

    subsession.session.vars['prolific_completion_url'] = "https://app.prolific.co/submissions/complete?cc=572FB13C"


# PAGES
class P4P(Page):
    form_model = 'player'
    form_fields = ['promise']


class Wait(WaitPage):

    @staticmethod
    def after_all_players_arrive(group: Group):
        group.id_aux = str(uuid.uuid4())
        players = group.get_players()
        for p in players:
            p.participant.id_aux = group.id_aux


class P5M(Page):

    @staticmethod
    def vars_for_template(player: Player):
        otherp = player.get_others_in_group()
        otherpromise = otherp[0].promise
        if otherpromise:
            return dict(
                mess='The other player sent the message: “I promise to roll the die in stage 3.”'
            )
        else:
            return dict(
                mess='The other player sent the message: “I do not promise to roll the die in stage 3.”'
            )

    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        save_to_partvars(player)


class P1W(Page):
    form_model = "player"
    form_fields = ['prolific_id']


class P2S1(Page):
    pass


class P3S3(Page):
    pass


class P0WG(WaitPage):

    group_by_arrival_time = True


page_sequence = [P0WG, P1W, P2S1, P3S3, P4P, Wait, P5M]
