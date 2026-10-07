from otree.api import Currency as c, currency_range, expect, Bot, SubmissionMustFail, Submission
from . import *


class PlayerBot(Bot):
    def play_round(self):
        p = self.player
        if self.round_number == 1:
            yield Intro
        if self.round_number == 1:
            expect('Before:', 'not in', self.html)
        else:
            expect('Before: 1:' + str(p.in_round(1).amount) + ';', 'in', self.html)
        expect('Others: 2', 'in', self.html)
        amount = {1: 2, 2: 5, 3: 9}[p.id_in_group]
        color = 'blue' if p.id_in_group == 2 else 'red'
        agree = p.id_in_group != 3
        yield SubmissionMustFail(Decide, dict(amount=7, color=color, agree=agree))
        yield SubmissionMustFail(Decide, dict(amount=C.ENDOWMENT + self.round_number + 1, color=color, agree=agree))
        yield SubmissionMustFail(Decide, dict(amount=amount, color='green', agree=agree))
        yield SubmissionMustFail(Decide, dict(amount=amount, color=color, agree=agree, note='bad'))
        late = p.id_in_group == 3 and self.round_number == 2
        yield Submission(Decide, dict(amount=amount, color=color, agree=agree, note='hi'), timeout_happened=late)

        # What set_payoffs works out, worked out again.
        players = self.group.get_players()
        total = sum(q.amount for q in players)
        by_id = {q.id_in_group: q for q in players}
        pairs = [(a, b) for a, b in C.PAIRS if by_id[a].color == by_id[b].color]
        lowest = min(players, key=lambda q: q.amount)
        matrix = {(True, 'red'): 2, (True, 'blue'): 1, (False, 'red'): 0, (False, 'blue'): -1}
        expected = C.ENDOWMENT - p.amount + total / 3 + C.BONUS[p.color] + matrix[(p.agree, p.color)]
        if p == lowest and pairs:
            expected += len(pairs)
        expect(round(float(p.payoff), 6), round(float(expected), 6))
        idx = p.id_in_group
        extra = idx * 10 // 3 % 4 + (8 if 0 < p.amount <= 5 else 0) + (100 if p.role == C.LEADER_ROLE else 0)
        expect(p.extra, extra)
        expect(p.half, {2: 1, 5: 2, 9: 4}[p.amount])
        expect(p.note, 'late' if late else 'hi')
        expect(p.participant.vars['visits'], self.round_number)
        expect(self.session.vars['lucky'] in [1, 2, 3], True)
        expect(self.group.ranking, '3,2,1')
        expect(self.group.summary, '3 players, total 16.0, not all agree')

        # The results page.
        expect('Your payoff: ' + '%.2f' % float(expected), 'in', self.html)
        expect('You chose ' + ('Blue' if color == 'blue' else 'Red') + '; extra ' + str(extra) + '; half ' + str(p.half) + '.', 'in', self.html)
        expect('Rich' if expected > 15 else 'Fine' if expected > 10 else 'Poor', 'in', self.html)
        expect('Ranking 3,2,1; 3 players, total 16.0, not all agree', 'in', self.html)
        expect('<td>' + str(idx) + '</td><td>' + str(p.amount) + '</td>', 'in', self.html)
        expect('title="' + p.role + ' player"', 'in', self.html)
        expect('Lucky ' + str(self.session.vars['lucky']), 'in', self.html)
        yield Results
