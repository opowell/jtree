from otree.api import (
    Page,
    WaitPage,
    models,
    widgets,
    BaseConstants,
    BaseSubsession,
    BaseGroup,
    BasePlayer,
    Currency as c,
    currency_range,
)

doc = """
Welcome, Instructions and Practice round Task 1.
"""


class Constants(BaseConstants):
    name_in_url = 'consent'
    players_per_group = None
    num_rounds = 1
    reward = 10
    cost = 2
    AvgDur = "10-15"


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    catches = models.IntegerField()
    clicks = models.IntegerField()
    total_cost = models.IntegerField()
    total_reward = models.IntegerField()
    score = models.IntegerField()
    num_page_loads_practice = models.IntegerField(initial=0)

# FUNCTIONS


# PAGES
class Instructions(Page):
    pass


class Practice(Page):
    form_model = 'player'
    form_fields = ['catches', 'clicks']

    @staticmethod
    def before_next_page(player, timeout_happened):
        player.total_reward = player.catches * Constants.reward
        player.total_cost = player.clicks * Constants.cost
        player.score = player.total_reward - player.total_cost

    @staticmethod
    def vars_for_template(player: Player):
        player.num_page_loads_practice += 1


page_sequence = [
    Instructions,
    Practice,
]
