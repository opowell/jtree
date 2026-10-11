"""
Django's translation functions, as oTree's older apps use them (ugettext as _): their texts as
they are written (jtree does not translate them yet).
"""


def gettext(message):
    return message


ugettext = gettext
gettext_lazy = gettext
ugettext_lazy = gettext
gettext_noop = gettext
ugettext_noop = gettext


def ngettext(singular, plural, number):
    return singular if number == 1 else plural


ungettext = ngettext


def pgettext(context, message):
    return message


pgettext_lazy = pgettext
