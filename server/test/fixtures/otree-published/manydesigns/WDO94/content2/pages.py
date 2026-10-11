from ._builtin import Page


class LoggingPage(Page):
    page_name = None

    def is_displayed(self):
        # hack: log start time
        is_displayed = super().is_displayed()
        if is_displayed:
            self.player.log_start_time(type(self).page_name)
        return is_displayed

    def log_conditionally(self, is_displayed):
        if is_displayed:
            self.player.log_start_time(type(self).page_name)
        return is_displayed


class Ahchah0g(LoggingPage):
    page_name = "Welcome"
    form_model = 'player'
    form_fields = ['prolific']


class Ahchah1g(LoggingPage):
    page_name = "Task"


class Ahchah2g(LoggingPage):
    page_name = "Payment"
    form_model = 'player'
    form_fields = ['control_question_1', 'control_question_2']


class Ahchah3g(LoggingPage):
    page_name = "Score"
    form_model = 'player'
    form_fields = ['score_calculated']

    def vars_for_template(self):
        return dict(
            answer_1=self.player.get_answer(1),
            answer_2=self.player.get_answer(2),
            answer_3=self.player.get_answer(3),
            answer_4=self.player.get_answer(4),
            answer_5=self.player.get_answer(5),
            answer_6=self.player.get_answer(6),
            answer_7=self.player.get_answer(7),
            answer_8=self.player.get_answer(8),
            answer_9=self.player.get_answer(9),
            answer_10=self.player.get_answer(10),
            answer_11=self.player.get_answer(11),
            answer_12=self.player.get_answer(12),
        )


class Ahchah4g(LoggingPage):
    page_name = "Questionnaire"
    form_model = 'player'
    form_fields = ['gender', 'age', 'education']

    def vars_for_template(self):
        return dict(
            earnings=self.player.get_earnings(),
            score=self.player.get_score(),
        )


class Ahchah5g(LoggingPage):
    page_name = "Payments"

    def vars_for_template(self):
        return dict(
            score=self.player.get_score(),
            score_calculated=self.player.get_score_calculated(),
            earnings=self.player.get_earnings(),
            better_than_benchmark=self.player.get_better_than_benchmark(),
        )


class Rahshoo0(LoggingPage):
    timeout_seconds = 40
    page_name = "Problem0"
    form_model = 'player'
    form_fields = ['answer_0']

    def before_next_page(self):
        if self.timeout_happened:
            self.player.example_timeout = True


class Rahshoo0x(LoggingPage):
    page_name = "Problem0solution"

    def vars_for_template(self):
        return dict(
            example_timeout=self.player.get_example_timeout(),
            answer_0=self.player.answer_0,
            correct=self.player.answer_0 == 8
        )


class Rahshoo1(LoggingPage):
    timeout_seconds = 40
    page_name = "Problem1"
    form_model = 'player'
    form_fields = ['answer_1']


class Rahshoo2(LoggingPage):
    timeout_seconds = 40
    page_name = "Problem2"
    form_model = 'player'
    form_fields = ['answer_2']


class Rahshoo3(LoggingPage):
    timeout_seconds = 40
    page_name = "Problem3"
    form_model = 'player'
    form_fields = ['answer_3']


class Rahshoo4(LoggingPage):
    timeout_seconds = 40
    page_name = "Problem4"
    form_model = 'player'
    form_fields = ['answer_4']


class Rahshoo5(LoggingPage):
    timeout_seconds = 40
    page_name = "Problem5"
    form_model = 'player'
    form_fields = ['answer_5']


class Rahshoo6(LoggingPage):
    timeout_seconds = 40
    page_name = "Problem6"
    form_model = 'player'
    form_fields = ['answer_6']


class Rahshoo7(LoggingPage):
    timeout_seconds = 40
    page_name = "Problem7"
    form_model = 'player'
    form_fields = ['answer_7']


class Rahshoo8(LoggingPage):
    timeout_seconds = 40
    page_name = "Problem8"
    form_model = 'player'
    form_fields = ['answer_8']


class Rahshoo9(LoggingPage):
    timeout_seconds = 40
    page_name = "Problem9"
    form_model = 'player'
    form_fields = ['answer_9']


class Rahshoo10(LoggingPage):
    timeout_seconds = 40
    page_name = "Problem10"
    form_model = 'player'
    form_fields = ['answer_10']


class Rahshoo11(LoggingPage):
    timeout_seconds = 40
    page_name = "Problem11"
    form_model = 'player'
    form_fields = ['answer_11']


class Rahshoo12(LoggingPage):
    timeout_seconds = 40
    page_name = "Problem12"
    form_model = 'player'
    form_fields = ['answer_12']


page_sequence = [Ahchah0g, Ahchah1g,
                 Rahshoo0, Rahshoo0x,
                 Ahchah2g,
                 Rahshoo1, Rahshoo2, Rahshoo3, Rahshoo4, Rahshoo5, Rahshoo6, Rahshoo7, Rahshoo8, Rahshoo9, Rahshoo10,
                 Rahshoo11, Rahshoo12,
                 Ahchah3g, Ahchah4g, Ahchah5g]
