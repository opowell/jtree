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
This application provides webpages showing survey items.
"""


class Constants(BaseConstants):
    name_in_url = 'questionnaire'
    players_per_group = None
    num_rounds = 1


class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    PROLIFIC_PID = models.StringField(
        label="Please enter your Prolific ID."
    )
    # Demographics
    age = models.IntegerField(label="Please enter your age.")
    gender = models.IntegerField(
        label="Please select your gender.",
        widget=widgets.RadioSelectHorizontal,
        choices=[
            [1, 'Male'],
            [2, 'Female'],
            [3, 'Other'],
            [4, 'I prefer not to say.'],
        ]
    )
    education = models.IntegerField(
        label="What is your highest level of education?",
        widget=widgets.RadioSelect,
        choices=[
            [1, 'High school or lower'],
            [2, 'Bachelor degree'],
            [3, 'Master degree'],
            [4, 'Doctoral degree'],
            [5, 'Other'],
            [6, 'I prefer not to say.']
        ]
    )
    # Employment status (part-time full time student, unemployed ...)

    employment = models.IntegerField(
        label="What is your employment status?",
        widget=widgets.RadioSelect,
        choices=[
            [1, 'Unemployed, actively searching for work'],
            [2, 'Unemployed, NOT actively searching for work'],
            [3, 'Part-time, working less than 35 hours per week '],
            [4, 'Full-time,working 35 or more hours per week'],
            [5, 'Student'],
            [6, 'Retired'],
            [7, 'Other'],
            [8, 'I prefer not to say.']
        ]
    )
    hh_member_0_18 = models.IntegerField(label="How many people below the age of 18 live in your household?")
    hh_member_18_99 = models.IntegerField(label="How many people (including yourself) aged 18 years or older live in your household?")
    citizenship = models.StringField(label="What is your country of residence?")
    hh_income = models.IntegerField(
        label="Approximately what is your household's net monthly income? "
              "This refers to the amount that is made up of all income and remains after deduction"
              " of taxes and social security contributions.",
        widget=widgets.RadioSelect,
        choices=[
            [1, '< £1000'],
            [2, '£1000 - £2000'],
            [3, '£2000 - £3000'],
            [4, '£3000 - £4000'],
            [5, '> £4000'],
            [6, 'I prefer not to say.']
        ]
    )
    experience_experiments = models.IntegerField(
        label="Please estimate how many studies you have participated in (excluding this study).",
        widget=widgets.RadioSelect,
        choices=[
            [1, 'None'],
            [2, '1 - 5 studies'],
            [3, '5 - 10 studies'],
            [4, '>15 studies'],
            [5, 'I prefer not to say.']
        ]
    )
    experience_gaming = models.IntegerField(
        label="How often do you play games on your smartphone or other devices?.",
        widget=widgets.RadioSelect,
        choices=[
            [1, 'Never.'],
            [2, 'A couple of times a month.'],
            [3, 'Several times a week.'],
            [4, 'Every day.'],
            [5, 'I prefer not to say.']
        ]
    )
    # Attitudes
    political_orientation = models.IntegerField()
    risk = models.IntegerField()
    competitiveness = models.IntegerField()

    # Perspective taking
    pt1 = models.IntegerField()
    pt2 = models.IntegerField()
    pt3 = models.IntegerField()
    pt4 = models.IntegerField()
    pt5 = models.IntegerField()
    pt6 = models.IntegerField()
    pt7 = models.IntegerField()

    # Empathic concern
    ec1 = models.IntegerField()
    ec2 = models.IntegerField()
    ec3 = models.IntegerField()
    ec4 = models.IntegerField()
    ec5 = models.IntegerField()
    ec6 = models.IntegerField()
    ec7 = models.IntegerField()


# FUNCTIONS

def age_error_message(player, value):
    print('value is', value)
    if value < 14 or value > 99:
        return 'Your age must be between 14 and 99 years.'

# PAGES
class Demographics(Page):
    form_model = 'player'
    form_fields = ['PROLIFIC_PID', 'age', 'gender', 'education', 'employment', 'hh_income', 'hh_member_0_18',
                   'hh_member_18_99', 'citizenship', 'experience_experiments', 'experience_gaming']

    @staticmethod
    def is_displayed(player):
        participant = player.participant

        return participant.is_dropout == False


class Attitudes(Page):
    form_model = 'player'
    form_fields = ['political_orientation', 'risk', 'competitiveness']

    @staticmethod
    def is_displayed(player):
        participant = player.participant

        return participant.is_dropout == False

class perspective_taking(Page):
    form_model = 'player'
    form_fields = ['pt1', 'pt2', 'pt3', 'pt4', 'pt5', 'pt6', 'pt7']

    @staticmethod
    def is_displayed(player):
        participant = player.participant

        return participant.is_dropout == False

class empathic_concern(Page):
    form_model = 'player'
    form_fields = ['ec1', 'ec2', 'ec3', 'ec4', 'ec5', 'ec6', 'ec7']

    @staticmethod
    def is_displayed(player):
        participant = player.participant

        return participant.is_dropout == False

page_sequence = [
    Demographics,
    Attitudes,
    perspective_taking,
    empathic_concern,
]
