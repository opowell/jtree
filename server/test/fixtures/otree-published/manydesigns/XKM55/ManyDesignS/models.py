from otree.api import (
    models, widgets, BaseConstants, BaseSubsession, BaseGroup, BasePlayer,
    Currency as c, currency_range
)
import random
import itertools

doc = """
OY, For many designs

"""



class Constants(BaseConstants):
    name_in_url = 'ManyDesignS'
    players_per_group = 2
    num_rounds = 25 #Should be 25
    instructions_template = 'ManyDesignS/Instructions.html'


class Subsession(BaseSubsession):
    def creating_session(self):
        conditions=itertools.cycle(['single','single','multi','multi'])
        for p in self.get_players():
            x=''
            for __ in range(6):
                x+=str(random.randint(1,6))
            p.dice=x #Get the 6 dice randomly
            p.RealSum=sum([int(z) for z in p.dice])
            p.Check=False
            if self.round_number==1:
                #p.condition=next(conditions)
                p.condition="single"
                if p.condition=="multi":
                    p.Thr=random.randint(50,500)
                elif p.condition=="single":
                    p.Thr=random.randint(50,950)
            else:
                p.condition=p.in_round(1).condition
                p.Thr=p.in_round(1).Thr
class Group(BaseGroup):
    def set_payoffs(self):
        p1 = self.get_player_by_id(1)
        p2 = self.get_player_by_id(2)
        if p1.ReportedSum>p2.ReportedSum:
            p1.outcome=p1.ReportedSum
            p2.outcome=0
        elif p1.ReportedSum<p2.ReportedSum:
            p2.outcome=p2.ReportedSum
            p1.outcome=0
        else:
            if random.random()>0.5:
                p1.outcome=p1.ReportedSum
                p2.outcome=0
            else:
                p2.outcome=p2.ReportedSum
                p1.outcome=0


class Player(BasePlayer):
    RealSum=models.IntegerField()
    ReportedSum=models.IntegerField(min=6, max=36)
    outcome=models.IntegerField()
    Check=models.BooleanField(initial=False)
    dice=models.StringField()
    condition=models.StringField()
    prolificID=models.StringField()
    Thr=models.IntegerField()
    def live_rec(self, data):
        if self.condition=="multi":
            if self.Check==False:
                self.outcome-=1
            if data=="check":
                self.Check=True
            return {self.id_in_group:[self.RealSum,self.get_others_in_group()[0].RealSum]}
        elif self.condition=="single":
            if self.Check==False:
                self.outcome-=1
            if data=="check":
                self.Check=True
            return {self.id_in_group:self.RealSum}
