"""Unit tests for _fetch_avatar (mocked requests, no datastore emulator)."""

from unittest.mock import MagicMock, patch

import requests

from backend.load_db.update_org_avatars import _fetch_avatar


def _response(status_code=200, person=None):
    resp = MagicMock()
    resp.status_code = status_code
    resp.json.return_value = {"person": person}
    return resp


@patch("backend.load_db.update_org_avatars.requests.get")
def test_fetch_avatar_returns_thumb_url(mock_get):
    mock_get.return_value = _response(person={"avatar": {"is_default": False, "thumb_url": "thumb.jpg"}})
    assert _fetch_avatar("2017ONDE01") == "thumb.jpg"


@patch("backend.load_db.update_org_avatars.requests.get")
def test_fetch_avatar_default_avatar_is_empty_string(mock_get):
    mock_get.return_value = _response(person={"avatar": {"is_default": True, "thumb_url": "default.jpg"}})
    assert _fetch_avatar("2017ONDE01") == ""


@patch("backend.load_db.update_org_avatars.requests.get")
def test_fetch_avatar_missing_thumb_url_is_empty_string(mock_get):
    mock_get.return_value = _response(person={"avatar": {"is_default": False}})
    assert _fetch_avatar("2017ONDE01") == ""
    mock_get.return_value = _response(person={})
    assert _fetch_avatar("2017ONDE01") == ""


@patch("backend.load_db.update_org_avatars.requests.get")
def test_fetch_avatar_non_200_is_none(mock_get):
    # a non-200 must never wipe a stored avatar.
    for status in (404, 429, 500):
        mock_get.return_value = _response(status_code=status)
        assert _fetch_avatar("2017ONDE01") is None


@patch("backend.load_db.update_org_avatars.requests.get")
def test_fetch_avatar_request_exception_is_none(mock_get):
    mock_get.side_effect = requests.ConnectionError()
    assert _fetch_avatar("2017ONDE01") is None
