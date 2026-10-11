from otree.api import *


doc = """
Instructions for the Slider Task.  Includes practice sliders.
"""


class Constants(BaseConstants):
    name_in_url = 'slider_instructions'
    players_per_group = None
    num_rounds = 1

    show_up_fee = 1.30
    expected_time = 10

    # for the practice:

    slider_width = 200

    # where the slider starts at
    initial_value = 0

    # where they want to set the slider to
    target_value = 50

    # area set aside for sliders in pixels - deliberately smaller than most computer resolutions
    slider_box_width = 800
    slider_box_height = 600

    # different seed than main task
    slider_xs = [93, 282, 235, 289, 365, 186, 165, 475, 169, 275, 140, 186, 258, 59, 518, 201, 220, 257, 317, 24, 409, 160, 39, 310, 262, 340, 137, 231, 434, 17, 100, 90, 301, 65, 359, 38, 459, 328, 458, 194, 5, 96, 217, 203, 368, 535, 104, 158, 114, 467, 143, 252, 528, 89, 219, 464, 374, 509, 290, 225, 147, 521, 44, 474, 22, 466, 530, 34, 88, 247, 373, 189, 401, 345, 288, 490, 51, 482, 382, 3, 422, 226, 200, 98, 526, 187, 59, 83, 112, 451, 355, 56, 114, 331, 132, 334, 75, 189, 392, 15]
    slider_ys = [191, 12, 473, 89, 530, 446, 530, 389, 86, 341, 456, 106, 72, 163, 476, 314, 499, 424, 12, 57, 249, 15, 374, 125, 373, 17, 326, 456, 70, 255, 220, 137, 61, 146, 20, 535, 539, 362, 34, 31, 86, 206, 450, 451, 158, 511, 345, 544, 222, 365, 16, 450, 439, 172, 174, 301, 362, 539, 340, 504, 234, 520, 355, 142, 361, 509, 141, 282, 508, 412, 283, 19, 105, 266, 337, 337, 350, 131, 228, 188, 374, 537, 109, 233, 393, 271, 92, 66, 292, 387, 398, 508, 518, 439, 96, 282, 164, 255, 220, 231]



class Subsession(BaseSubsession):
    pass


class Group(BaseGroup):
    pass


class Player(BasePlayer):
    num_sliders = models.IntegerField(initial=0)
    num_keystrokes = models.IntegerField(initial=0)

    treatment = models.StringField(initial='test')


# PAGES
class Introduction(Page):
    pass


class SliderRules(Page):
    pass


class Practice(Page):
    form_model = 'player'
    form_fields = ['num_sliders', 'num_keystrokes']

    # I changed this function from random allocation to pulling from the session name, as ManyDesigns will do the randomization for us.
    @staticmethod
    def before_next_page(player: Player, timeout_happened):
        session_name = player.session.config['name']
        if session_name == 'TRA':  # so TRA is the competition treatment
            player.treatment = 'Competition'
            player.participant.treatment = 'Competition'  # this is so we can nab it in other apps - also set in settings.py under PARTICIPANT_FIELDS
        else:  # it's TR1, which is the no competition treatment
            player.treatment = 'No Competition'
            player.participant.treatment = 'No Competition'  # this is so we can nab it in other apps - also set in settings.py under PARTICIPANT_FIELDS

    @staticmethod
    def vars_for_template(player: Player):
        slider_list = []
        for i, X in enumerate(Constants.slider_xs):
            slider_list.append([i, X, Constants.slider_ys[i]])
        return dict(slider_list=slider_list)




page_sequence = [Introduction, SliderRules, Practice]
