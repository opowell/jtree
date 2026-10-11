from otree.api import *


doc = """
Your app description
"""


class Constants(BaseConstants):
    name_in_url = 'production_task_start'
    players_per_group = None
    num_rounds = 1
    production_timeout = 60 * 4
    #production_timeout = 30


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    pass


# PAGES
class ProductionTaskStart(Page):
    @staticmethod
    def before_next_page(player, timeout_happened):
        participant = player.participant
        import time

        # remember to add 'expiry' to PARTICIPANT_FIELDS.
        participant.expiry = time.time() + Constants.production_timeout

page_sequence = [ProductionTaskStart]
