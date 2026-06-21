"""Tests for the once-a-year province change limit (recent_location_change)."""

import datetime
from unittest.mock import MagicMock

from backend.lib.residency import PROVINCE_CHANGE_WINDOW, recent_location_change

NOW = datetime.datetime(2026, 6, 20, 12, 0, 0)


def _update(when):
    u = MagicMock()
    u.update_time = when
    return u


def test_no_updates_is_allowed():
    # First-ever province set: no prior updates -> not rate limited.
    user = MagicMock()
    user.updates = []
    assert recent_location_change(user, NOW) is None


def test_change_older_than_a_year_is_allowed():
    # The only change was more than 365 days ago -> allowed to change again.
    user = MagicMock()
    user.updates = [_update(NOW - PROVINCE_CHANGE_WINDOW - datetime.timedelta(days=1))]
    assert recent_location_change(user, NOW) is None


def test_recent_change_is_blocked():
    # A change within the last year -> rate limited (returns that update).
    user = MagicMock()
    recent = _update(NOW - datetime.timedelta(days=30))
    user.updates = [recent]
    assert recent_location_change(user, NOW) is recent


def test_returns_most_recent_in_window_update():
    # Several in-window updates -> the latest one drives the next-allowed date.
    user = MagicMock()
    older = _update(NOW - datetime.timedelta(days=200))
    newer = _update(NOW - datetime.timedelta(days=10))
    user.updates = [older, newer]
    assert recent_location_change(user, NOW) is newer


def test_ignores_updates_without_a_timestamp():
    # Legacy entries with no update_time must not crash or count.
    user = MagicMock()
    user.updates = [_update(None)]
    assert recent_location_change(user, NOW) is None
