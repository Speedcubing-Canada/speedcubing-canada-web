"""Unit tests for the delegate sync helpers and serialization.

Pure logic only (province parsing, status priority, role collapsing, to_json) with
mocked ndb/requests, mirroring test_championships_routes.py — no datastore emulator.
"""

from unittest.mock import MagicMock

from backend.handlers.delegates import Delegate  # noqa: F401 (import smoke-check)
from backend.load_db.update_delegates import (
    _delegates_from_roles,
    _pick_status,
    _province_id_from_location,
)


def _role(wca_id, name, status, group_name, location=None, is_default_avatar=False, thumb="thumb.jpg", gender="m"):
    return {
        "user": {
            "wca_id": wca_id,
            "name": name,
            "gender": gender,
            "avatar": {"is_default": is_default_avatar, "thumb_url": thumb},
        },
        "group": {"name": group_name},
        "metadata": {"status": status, "location": location},
    }


# _province_id_from_location


def test_province_from_location_maps_known_province():
    assert _province_id_from_location("Canada (Quebec)") == "qc"
    assert _province_id_from_location("Canada (British Columbia)") == "bc"
    assert _province_id_from_location("Canada (Nova Scotia)") == "ns"


def test_province_from_location_none_when_missing_or_unknown():
    assert _province_id_from_location(None) is None
    assert _province_id_from_location("") is None
    assert _province_id_from_location("USA (Massachusetts)") is None
    assert _province_id_from_location("Canada (Atlantis)") is None


# _pick_status


def test_pick_status_prefers_most_senior():
    assert _pick_status({"delegate", "regional_delegate"}) == "regional_delegate"
    assert _pick_status({"junior_delegate", "trainee_delegate"}) == "junior_delegate"
    assert _pick_status({"trainee_delegate"}) == "trainee_delegate"


def test_pick_status_empty_is_none():
    assert _pick_status(set()) is None


# _delegates_from_roles


def test_delegates_from_roles_filters_and_collapses():
    roles = [
        # Same person, two roles: regional (no location) + delegate (has province).
        _role("2008ASIS01", "Kristopher De Asis", "regional_delegate", "Canada (West)", location=None),
        _role("2008ASIS01", "Kristopher De Asis", "delegate", "Canada (West)", location="Canada (Alberta)"),
        # A non-Canadian-nationality delegate serving Quebec is included.
        _role("2017ONDE01", "Alexandre Ondet", "delegate", "Canada (East)", location="Canada (Quebec)"),
        # A woman delegate — gender is captured for gendered (French) labels.
        _role("2014ESPA01", "Alyssa Esparaz", "delegate", "Canada (East)", location="Canada (Ontario)", gender="f"),
        # Excluded: the "USA & Canada" senior super-region.
        _role("2013SING12", "Abhimanyu Singhal", "senior_delegate", "USA & Canada", location="USA & Canada"),
    ]

    result = _delegates_from_roles(roles)

    assert set(result) == {"2008ASIS01", "2017ONDE01", "2014ESPA01"}

    kris = result["2008ASIS01"]
    assert _pick_status(kris["statuses"]) == "regional_delegate"
    assert kris["province"] == "ab"  # taken from the role that has a location
    assert kris["region_group"] == "Canada (West)"
    assert kris["gender"] == "m"

    ondet = result["2017ONDE01"]
    assert ondet["province"] == "qc"
    assert ondet["avatar_thumb_url"] == "thumb.jpg"

    assert result["2014ESPA01"]["gender"] == "f"


def test_delegates_from_roles_drops_default_avatar():
    roles = [
        _role("2007STRO01", "Sarah Strong", "regional_delegate", "Canada (East)", is_default_avatar=True),
    ]
    assert _delegates_from_roles(roles)["2007STRO01"]["avatar_thumb_url"] is None


# Delegate.to_json


def test_to_json_shape():
    delegate = MagicMock()
    delegate.key.id.return_value = "2017ONDE01"
    delegate.name = "Alexandre Ondet"
    delegate.gender = "m"
    delegate.status = "delegate"
    delegate.province = "qc"
    delegate.region_group = "Canada (East)"
    delegate.avatar_thumb_url = "thumb.jpg"

    out = Delegate.to_json(delegate)

    assert out == {
        "wca_id": "2017ONDE01",
        "name": "Alexandre Ondet",
        "gender": "m",
        "status": "delegate",
        "province": "qc",
        "region_group": "Canada (East)",
        "avatar_thumb_url": "thumb.jpg",
    }
