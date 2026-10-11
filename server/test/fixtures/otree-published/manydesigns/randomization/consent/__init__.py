from otree.api import *

doc = """
ManyDesigns:
- Captcha
- Consent Form
"""


class Constants(BaseConstants):
    name_in_url = 'consent'
    players_per_group = None
    num_rounds = 1

    waitingtime_consent = 10000
    waitingtime_check = 5000


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):

    consent = models.BooleanField()
    check = models.StringField()


# ------------------------------------------------------------------------------
# PAGES


class Captcha(Page):
    pass


class Consent(Page):
    form_model = 'player'
    form_fields = ['consent']

    @staticmethod
    def before_next_page(player, timeout_happened):
        participant = player.participant
        participant.consent = player.consent

    def vars_for_template(player):
        return dict(
            waitingtime=Constants.waitingtime_consent
        )


class Check(Page):

    @staticmethod
    def is_displayed(player):
        return player.consent is True

    form_model = 'player'
    form_fields = ['check']

    def vars_for_template(player):
        return dict(
            waitingtime=Constants.waitingtime_check
        )

class Return(Page):
    @staticmethod
    def is_displayed(player):
        return player.consent is False or (player.check != "turquoise" and player.check != "Turquoise")


page_sequence = [
    Captcha,
    Consent,
    Check,
    Return
]
