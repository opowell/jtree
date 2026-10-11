# Don't change anything in this file.
import content.player
from .. import models
import otree.api


class Page(otree.api.Page):
    subsession: models.Subsession
    group: models.Group
    player: content.player.Player


class WaitPage(otree.api.WaitPage):
    subsession: models.Subsession
    group: models.Group
    player: content.player.Player


class Bot(otree.api.Bot):
    subsession: models.Subsession
    group: models.Group
    player: content.player.Player
