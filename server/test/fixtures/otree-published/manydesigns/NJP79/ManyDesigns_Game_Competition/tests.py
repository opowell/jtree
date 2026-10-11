import ManyDesigns_Game_Competition as pages
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
        if self.player.role == Constants.responder_role and self.group.Accept == True:
            yield Responder_Choice, dict(Choice="2")
        yield Explain, dict(explain="xyz")
        yield Payoffs
        yield End, dict(remarks="xyz")