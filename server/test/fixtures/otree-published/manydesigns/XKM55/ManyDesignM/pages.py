from ._builtin import Page, WaitPage
from .models import Constants


class Introduction(Page):
    form_model = 'player'
    form_fields = ['prolificID']
    def vars_for_template(self):
        return {'condition':self.player.condition}
    def is_displayed(self):
        return self.player.round_number==1



class Report(Page):
    form_model = 'player'
    form_fields = ['ReportedSum']
    def vars_for_template(self):
        return {'dice':[int(z) for z in self.player.dice],'condition':self.player.condition}


class WaitForPlayer(WaitPage):
    group_by_arrival_time = True
    def vars_for_template(self):
        return {'body_text': "Waiting for another player to join. please wait."}
    def is_displayed(self):
        return self.round_number == 1 and self.player.condition=="multi"


class ResultsWaitPage(WaitPage):
    def after_all_players_arrive(self):
        self.group.set_payoffs()
    def is_displayed(self):
        return self.player.condition=="multi"
    def vars_for_template(self):
        return {'body_text': "Waiting for the other player to report"}


class Results(Page):
    live_method = 'live_rec'
    def vars_for_template(self):
        if self.player.condition=="multi":
            other_player=self.player.get_others_in_group()[0]
            if other_player.ReportedSum>self.player.ReportedSum:
                who_won="the other player wins " + str(other_player.ReportedSum) + " points"
            elif other_player.ReportedSum<self.player.ReportedSum:
                who_won="you win "+ str(self.player.ReportedSum) + " points"
            else:
                who_won="it's a tie: the computer selected a winner randomly. You win " +str(self.player.outcome) + " points"
            points=sum([x.outcome for x in self.player.in_all_rounds()])+50
            return {
                'other_player': other_player.ReportedSum,
                'who_won':who_won,
                'points':points,
                'condition':self.player.condition
            }
        elif self.player.condition=="single":
            self.player.outcome=self.player.ReportedSum
            points=sum([x.outcome for x in self.player.in_all_rounds()])+50
            who_won="you win "+ str(self.player.ReportedSum) + " points"
            return {
                'who_won':who_won,
                'points':points,
                'condition':self.player.condition
            }
            


class End(Page):
    def vars_for_template(self):
        points=sum([x.outcome for x in self.player.in_all_rounds()])+50
        if points>self.player.Thr:
            self.player.payoff=1
            bonus=True
        else:
            self.player.payoff=0
            bonus=False
        return {
            'Thr': self.player.Thr,
            'points':points,
            'bonus':bonus
        }  
    def is_displayed(self):
        return self.player.round_number==Constants.num_rounds

#ADD AN END PAGE, CALCULATE OUTCOMES + 50 points

page_sequence = [
    WaitForPlayer,
    Introduction,
    Report,
    ResultsWaitPage,
    Results,
    End
]
