from otree.api import *
import random

doc = """
Instructions for Payment.  Also randomly allocates treatment.
"""


class Constants(BaseConstants):
    name_in_url = 'payment_instructions'
    players_per_group = None
    num_rounds = 1

    prize_value = 3.00
    piece_rate = 0.08

    time_allowed = 120


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    pass
    # treatment = models.StringField()


# PAGES
# class Allocation(WaitPage):
#     # I changed this function from random allocation to pulling from the session name, as ManyDesigns will do the randomization for us.
#     @staticmethod
#     def after_all_players_arrive(group: Group):
#         for p in group.get_players():  # really just the one - should probably define this at the group level instead, but I think this will make more sense when it comes to analyzing the data
#             session_name = p.session.config['name']
#             if session_name == 'TRA':  # so TRA is the competition treatment
#                 p.treatment = 'Competition'
#                 p.participant.treatment = 'Competition'  # this is so we can nab it in other apps - also set in settings.py under PARTICIPANT_FIELDS
#             else:  # it's TR1, which is the no competition treatment
#                 p.treatment = 'No Competition'
#                 p.participant.treatment = 'No Competition'  # this is so we can nab it in other apps - also set in settings.py under PARTICIPANT_FIELDS


class PaymentInstructions(Page):
    pass


page_sequence = [PaymentInstructions]
