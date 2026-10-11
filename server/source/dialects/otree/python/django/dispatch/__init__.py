"""Django's signals, as oTree's older apps connect to them (pre_save, to keep a participant's IP address out, say)."""


class Signal:
    """A signal its receivers connect to; jtree does not send Django's model signals."""

    def __init__(self, *args, **kw):
        self.receivers = []

    def connect(self, receiver, sender=None, **kw):
        self.receivers.append((receiver, sender))

    def disconnect(self, receiver=None, sender=None, **kw):
        self.receivers = [(r, s) for r, s in self.receivers if r is not receiver]

    def send(self, sender, **kw):
        return [(r, r(sender=sender, **kw)) for r, s in self.receivers if s is None or s is sender]


def receiver(signal, **kw):
    """@receiver(signal, sender=...): connects the function."""
    def connect(fn):
        for s in signal if isinstance(signal, (list, tuple)) else [signal]:
            s.connect(fn, **kw)
        return fn
    return connect
