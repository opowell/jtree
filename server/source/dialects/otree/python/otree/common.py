"""
oTree's otree.common, as its older apps import from it (Currency, currency_range, safe_json).
"""
import json

from .api import Currency, currency_range


def safe_json(obj):
    """obj as JSON, safe in a page's <script> (as oTree's)."""
    return json.dumps(obj).replace('</', '<\\/')


__all__ = ['Currency', 'currency_range', 'safe_json']
