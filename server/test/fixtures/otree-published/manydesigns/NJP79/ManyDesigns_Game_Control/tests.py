import ManyDesigns_Game_Control as pages
from . import *
c = cu

class PlayerBot(Bot):
    def play_round(self):
        yield Role
        if self.player.role != Constants.responder_role:
            yield Proposers_Offers, dict(
                offer_actual=Constants.endowment,
                offer_communicated=Constants.endowment,
            )
        if self.player.role == Constants.responder_role:
            yield Responder_Offers, dict(Accept=True)
        yield Explain, dict(explain="xyz")
        yield Payoffs
        yield End, dict(remarks="xyz")