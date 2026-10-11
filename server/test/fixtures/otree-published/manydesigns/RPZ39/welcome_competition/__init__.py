from otree.api import *


doc = """
Your app description
"""


class Constants(BaseConstants):
    name_in_url = 'welcome_competition'
    players_per_group = None
    num_rounds = 1


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    competition_treatment = models.IntegerField()


# PAGES
class Welcome(Page):

        @staticmethod
        def before_next_page(player, timeout_happened):
            player.session.competition_treatment = 1
            player.competition_treatment = 1


page_sequence = [Welcome]
