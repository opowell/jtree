from otree.api import Currency as c, currency_range, expect, Bot
from . import *
import random

# page_sequence = [Q1, Q2A, Q2B, Q3, Recap, GetReady]


class PlayerBot(Bot):
    def play_round(self):
        prob_correct = .95  # these compqs are fairly simple, so most should get them right
        q1_answer = random.choices([True, False], weights=[prob_correct, 1-prob_correct])
        yield Q1, dict(q1_correct=q1_answer)
        q2_answer = random.choices([True, False], weights=[prob_correct, 1 - prob_correct])
        if self.participant.treatment == 'No Competition':
            yield Q2A, dict(q2_correct=q2_answer)
        if self.participant.treatment == 'Competition':
            yield Q2B, dict(q2_correct=q2_answer)
            q3_answer = random.choices([True, False], weights=[prob_correct, 1 - prob_correct])
            yield Q3, dict(q3_correct=q3_answer)
        yield Recap
        yield GetReady
