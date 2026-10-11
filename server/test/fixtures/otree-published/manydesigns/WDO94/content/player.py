import json
from datetime import datetime

from otree.api import BasePlayer, models, widgets, currency_range
from otree.api import Currency as c


correct_answers = [False, True]


class Player(BasePlayer):
    page_start_times = models.LongStringField(initial="{}")
    control_question_1 = models.BooleanField(widget=widgets.RadioSelect, choices=[(True, "True"), (False, "False")])
    control_question_2 = models.BooleanField(widget=widgets.RadioSelect, choices=[(True, "True"), (False, "False")])
    control_question_wrong_1 = models.LongStringField()
    control_question_wrong_2 = models.LongStringField()
    score_calculated = models.IntegerField(min=0, max=200)
    treatment = models.IntegerField(initial=0)
    true_score = models.IntegerField()
    example_timeout = models.BooleanField(initial=False)
    bonus = models.CurrencyField()

    answer_0 = models.IntegerField(choices=[1, 2, 3, 4, 5, 6, 7, 8], widget=widgets.RadioSelectHorizontal)

    answer_1 = models.IntegerField(choices=[1, 2, 3, 4, 5, 6, 7, 8], widget=widgets.RadioSelectHorizontal)
    answer_2 = models.IntegerField(choices=[1, 2, 3, 4, 5, 6, 7, 8], widget=widgets.RadioSelectHorizontal)
    answer_3 = models.IntegerField(choices=[1, 2, 3, 4, 5, 6, 7, 8], widget=widgets.RadioSelectHorizontal)
    answer_4 = models.IntegerField(choices=[1, 2, 3, 4, 5, 6, 7, 8], widget=widgets.RadioSelectHorizontal)
    answer_5 = models.IntegerField(choices=[1, 2, 3, 4, 5, 6, 7, 8], widget=widgets.RadioSelectHorizontal)
    answer_6 = models.IntegerField(choices=[1, 2, 3, 4, 5, 6, 7, 8], widget=widgets.RadioSelectHorizontal)
    answer_7 = models.IntegerField(choices=[1, 2, 3, 4, 5, 6, 7, 8], widget=widgets.RadioSelectHorizontal)
    answer_8 = models.IntegerField(choices=[1, 2, 3, 4, 5, 6, 7, 8], widget=widgets.RadioSelectHorizontal)
    answer_9 = models.IntegerField(choices=[1, 2, 3, 4, 5, 6, 7, 8], widget=widgets.RadioSelectHorizontal)
    answer_10 = models.IntegerField(choices=[1, 2, 3, 4, 5, 6, 7, 8], widget=widgets.RadioSelectHorizontal)
    answer_11 = models.IntegerField(choices=[1, 2, 3, 4, 5, 6, 7, 8], widget=widgets.RadioSelectHorizontal)
    answer_12 = models.IntegerField(choices=[1, 2, 3, 4, 5, 6, 7, 8], widget=widgets.RadioSelectHorizontal)
    age = models.StringField(choices=["18-27", "28-37", "38-47", "48-57", "58+"])
    gender = models.StringField(choices=["Female", "Male", "I do not identify as binary"])
    education = models.StringField(choices=["PhD or equivalent doctoral level qualification",
                                            "Masters or equivalent higher degree level qualification",
                                            "Postgraduate academic below-Masters level qualification (e.g. Certificate or Diploma)",
                                            "Bachelors or equivalent first degree qualification",
                                            "Post-secondary academic below-degree level qualification (up to 1 year)",
                                            "Post-secondary academic below-degree level qualification (2 and more years)",
                                            "Post-secondary vocational training (up to 1 year)",
                                            "Post-secondary vocational training (2 and more years)",
                                            "Completed secondary school", "Completed primary school",
                                            "None of the above"])
    prolific = models.StringField()

    def get_score(self):
        self.true_score = 0
        if self.answer_1 == 7:
            self.true_score += 12
        if self.answer_2 == 8:
            self.true_score += 18
        if self.answer_3 == 4:
            self.true_score += 12
        if self.answer_4 == 7:
            self.true_score += 18
        if self.answer_5 == 6:
            self.true_score += 12
        if self.answer_6 == 5:
            self.true_score += 18
        if self.answer_7 == 2:
            self.true_score += 12
        if self.answer_8 == 5:
            self.true_score += 18
        if self.answer_9 == 4:
            self.true_score += 12
        if self.answer_10 == 4:
            self.true_score += 18
        if self.answer_11 == 7:
            self.true_score += 12
        if self.answer_12 == 1:
            self.true_score += 18
        return self.true_score

    def get_score_calculated(self):
        return self.score_calculated

    def get_earnings(self):
        self.bonus = c(1.00)
        if self.get_better_than_benchmark():
            self.bonus += c(0.7)
        self.payoff = self.bonus
        return self.participant.payoff_plus_participation_fee()

    def get_better_than_benchmark(self):
        return self.get_score_calculated() >= 78

    def get_answer(self, num):
        answer = self.__getattribute__("answer_" + repr(num))
        if answer == 0:
            return "-"
        return answer

    def assert_answer(self, answer, question_number):
        if answer != correct_answers[question_number - 1]:
            self.add_wrong_answer("control_question_wrong_" + repr(question_number), answer)
            return "The answer above is not correct"
        return None

    def get_example_timeout(self):
        return self.example_timeout

    def control_question_1_error_message(self, value):
        return self.assert_answer(value, 1)

    def control_question_2_error_message(self, value):
        return self.assert_answer(value, 2)

    def log_start_time(self, page_name):
        start_times = json.loads(self.page_start_times)
        if page_name not in start_times:
            start_times[page_name] = self.now_in_ms()
            self.page_start_times = json.dumps(start_times)

    def add_wrong_answer(self, field_name, wrong_answer):
        value = self.__getattribute__(field_name)
        wrong_answer_with_time = "(" + repr(self.now_in_ms()) + ";" + repr(wrong_answer) + ")"
        if value is None:
            value = wrong_answer_with_time
        else:
            value = value + "," + wrong_answer_with_time
        self.__setattr__(field_name, value)


    @staticmethod
    def now_in_ms():
        return int(datetime.now().timestamp() * 1000)
