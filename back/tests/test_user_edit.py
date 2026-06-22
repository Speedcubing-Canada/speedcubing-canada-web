"""Tests for the once-a-year province change limit (most_recent_location_change_within_window)."""

import datetime
from unittest.mock import MagicMock

from backend.lib.residency import PROVINCE_CHANGE_WINDOW, most_recent_location_change_within_window
from backend.models.user import User

NOW = datetime.datetime(2026, 6, 20, 12, 0, 0)


def _location_update(province_id, when):
    u = MagicMock()
    u.update_time = when
    u.province = None if province_id is None else MagicMock()
    if province_id is not None:
        u.province.id.return_value = province_id
    return u


def _user(updates):
    user = MagicMock()
    user.key.id.return_value = 1
    user.name = "Test"
    user.roles = []
    user.dob = None
    user.province = None
    user.wca_person = None
    user.email = None
    user.updates = updates
    return user


def test_to_json_includes_updates_most_recent_first():
    older = _location_update("on", NOW - datetime.timedelta(days=400))
    newer = _location_update("qc", NOW - datetime.timedelta(days=10))
    result = User.to_json(_user([older, newer]))
    assert [u["province"] for u in result["updates"]] == ["qc", "on"]
    assert result["updates"][0]["update_time"] == newer.update_time.isoformat()


def test_to_json_updates_handles_none_province_and_skips_missing_timestamp():
    no_province = _location_update(None, NOW - datetime.timedelta(days=5))
    no_time = _location_update("ab", None)
    result = User.to_json(_user([no_time, no_province]))
    assert result["updates"] == [{"province": None, "update_time": no_province.update_time.isoformat()}]


def test_to_json_empty_updates():
    assert User.to_json(_user([]))["updates"] == []


def _update(when):
    u = MagicMock()
    u.update_time = when
    return u


def test_no_updates_is_allowed():
    # First-ever province set: no prior updates -> not rate limited.
    user = MagicMock()
    user.updates = []
    assert most_recent_location_change_within_window(user, NOW) is None


def test_change_older_than_a_year_is_allowed():
    # The only change was more than 365 days ago -> allowed to change again.
    user = MagicMock()
    user.updates = [_update(NOW - PROVINCE_CHANGE_WINDOW - datetime.timedelta(days=1))]
    assert most_recent_location_change_within_window(user, NOW) is None


def test_recent_change_is_blocked():
    # A change within the last year -> rate limited (returns that update).
    user = MagicMock()
    recent = _update(NOW - datetime.timedelta(days=30))
    user.updates = [recent]
    assert most_recent_location_change_within_window(user, NOW) is recent


def test_returns_most_recent_in_window_update():
    # Several in-window updates -> the latest one drives the next-allowed date.
    user = MagicMock()
    older = _update(NOW - datetime.timedelta(days=200))
    newer = _update(NOW - datetime.timedelta(days=10))
    user.updates = [older, newer]
    assert most_recent_location_change_within_window(user, NOW) is newer


def test_ignores_updates_without_a_timestamp():
    # Legacy entries with no update_time must not crash or count.
    user = MagicMock()
    user.updates = [_update(None)]
    assert most_recent_location_change_within_window(user, NOW) is None
