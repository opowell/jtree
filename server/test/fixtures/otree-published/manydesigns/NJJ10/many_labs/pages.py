from otree.api import Currency as c, currency_range
from ._builtin import Page, WaitPage
from .models import Constants

##Organize the pages and check how many buyers actually bought? Don￿'' we try to go for 400 buyers buying? So we do not need to match sellers-buyers?


class consent(Page):
    template_name = 'many_labs/consent.html'
    form_model = 'player'
    form_fields = ['prolific_id']

    def vars_for_template(self):
        return {'min': 0,
                'participation_fee': Constants.participation_fee,
                'max':Constants.price,
                'min_sum':Constants.participation_fee,
                'max_sum':1.7 + Constants.participation_fee,
                }


class Decision_seller_yes(Page):
    template_name = 'many_labs/Decision_seller_yes.html'

    def vars_for_template(self):
        return{'price':Constants.price,
               'participation_fee':Constants.participation_fee,
               'price': Constants.price,
               'value_high': Constants.value_high,
               'value_low': Constants.value_low,
               'participation_fee': Constants.participation_fee,
               'no_lie': Constants.no_lie
               }

    form_model = 'player'
    form_fields = ['selling'
                   ]




class Information(Page):
    template_name = 'many_labs/Information.html'

    def vars_for_template(self):
        return{'price':Constants.price,
               'value_high':Constants.value_high,
               'value_low': Constants.value_low,
               'participation_fee': Constants.participation_fee,
               'no_lie': Constants.no_lie
               }

class survey(Page):
    template_name = 'many_labs/survey.html'
    form_model = 'player'
    form_fields = ['age', 'gender',  'Political', 'price', 'consumer_mistake', 'risk', 'trust', 'moral_tax']



class results(Page):
    template_name = 'many_labs/results.html'

    def vars_for_template(self):
        link = "https://app.prolific.co/submissions/complete?cc=572FB13C"
        return{'payoff':self.player.selling*c(1.70),
               'link': link}



page_sequence = [
    consent,
    Information,
    Decision_seller_yes,
    survey,
    results
]
