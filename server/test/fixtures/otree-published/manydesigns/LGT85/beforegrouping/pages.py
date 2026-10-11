from otree.api import Currency as c, currency_range
from ._builtin import Page, WaitPage
from .models import Constants


class Loading(Page):
    def get_timeout_seconds(self):
        return self.session.config['beforegrouping_page_timeout_seconds']

    def before_next_page(self):
        if self.timeout_happened:
            self.player.timeout = True

    def app_after_this_page(self, upcoming_apps):
        if self.player.timeout:
            return "timeoutblock"


    def js_vars(self):
        return dict(waiting_time=self.player.waiting_time)

    def before_next_page(self):
        self.player.set_arrival_time()


page_sequence = [Loading]
