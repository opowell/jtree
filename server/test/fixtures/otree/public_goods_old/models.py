from otree.api import (
    models, widgets, BaseConstants, BaseSubsession, BaseGroup, BasePlayer,
    Currency as c, currency_range
)

doc = """
A public goods game, in oTree's older format (models.py, pages.py, Django templates).
"""


class Constants(BaseConstants):
    name_in_url = 'public_goods_old'
    players_per_group = 3
    num_rounds = 2
    endowment = c(100)
    multiplier = 2


class Subsession(BaseSubsession):
    def creating_session(self):
        for p in self.get_players():
            p.participant.vars['old_format'] = True


class Group(BaseGroup):
    total_contribution = models.CurrencyField()
    individual_share = models.CurrencyField()

    def set_payoffs(self):
        players = self.get_players()
        self.total_contribution = sum([p.contribution for p in players])
        self.individual_share = self.total_contribution * Constants.multiplier / Constants.players_per_group
        for p in players:
            p.payoff = Constants.endowment - p.contribution + self.individual_share


class Player(BasePlayer):
    contribution = models.CurrencyField(min=0, label='How much will you contribute?')

    def contribution_max(self):
        return Constants.endowment

    def contribution_error_message(self, value):
        if value == 13:
            return 'Not 13.'

    def role(self):
        return 'first' if self.id_in_group == 1 else 'other'
