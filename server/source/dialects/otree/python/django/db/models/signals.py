"""Django's model signals (jtree does not send them: its models are not Django's)."""
from django.dispatch import Signal

pre_save = Signal()
post_save = Signal()
pre_delete = Signal()
post_delete = Signal()
pre_init = Signal()
post_init = Signal()
