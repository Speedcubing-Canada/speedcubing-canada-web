"""Unit tests for team serialization, admin field-parsing, and the CSV import transform.

Pure logic only (no datastore emulator): building in-memory ndb entities and calling the
pure helpers, mirroring test_delegates.py.
"""

from unittest.mock import MagicMock

from backend.handlers.admin.edit_teams import filter_and_sort, parse_members
from backend.load_db.import_teams import group_rows
from backend.models.team import Team, TeamMember


# Team.to_json (mocked self; a keyed ndb entity can't be built without a context, but the
# unkeyed TeamMember can, so a real member exercises the nested serialization).


def test_team_to_json_shape():
    team = MagicMock()
    team.key.id.return_value = "software"
    team.name_en = "Software Team"
    team.name_fr = "Équipe logicielle"
    team.description_en = "We build the site."
    team.description_fr = "On construit le site."
    team.position = 2
    team.members = [TeamMember(name="Alex", wca_id="2017ONDE01", bio_en="Bio", bio_fr="Bio fr", is_leader=True)]

    assert Team.to_json(team) == {
        "id": "software",
        "name_en": "Software Team",
        "name_fr": "Équipe logicielle",
        "description_en": "We build the site.",
        "description_fr": "On construit le site.",
        "position": 2,
        "members": [
            {
                "name": "Alex",
                "wca_id": "2017ONDE01",
                "bio_en": "Bio",
                "bio_fr": "Bio fr",
                "is_leader": True,
            }
        ],
    }


def test_team_to_json_defaults_position_and_empty_members():
    team = MagicMock()
    team.position = None
    team.members = []
    out = Team.to_json(team)
    assert out["position"] == 0
    assert out["members"] == []


# parse_members (admin payload -> TeamMember records)


def test_parse_members_maps_fields_and_skips_blank_names():
    rows = [
        {"name": "Lead", "wca_id": "2008ASIS01", "bio_en": "b", "bio_fr": "", "is_leader": True},
        {"name": "  ", "wca_id": "X", "is_leader": False},  # blank name -> skipped
        {"name": "Member", "wca_id": "", "is_leader": False},  # empty wca_id -> None
    ]

    members = parse_members(rows)

    assert [m.name for m in members] == ["Lead", "Member"]
    assert members[0].wca_id == "2008ASIS01"
    assert members[0].bio_fr is None
    assert members[0].is_leader is True
    assert members[1].wca_id is None


def test_parse_members_handles_none():
    assert parse_members(None) == []


# filter_and_sort (admin list)


def _rec(id, name_en, position):
    return {"id": id, "name_en": name_en, "position": position}


def test_filter_and_sort_filters_by_english_name():
    records = [_rec("a", "Software Team", 1), _rec("b", "Events Team", 0)]
    out = filter_and_sort(records, "soft", "position", "asc")
    assert [r["id"] for r in out] == ["a"]


def test_filter_and_sort_defaults_to_position_and_sorts():
    records = [_rec("a", "B", 2), _rec("b", "A", 0), _rec("c", "C", 1)]
    out = filter_and_sort(records, "", "bogus_field", "asc")
    assert [r["id"] for r in out] == ["b", "c", "a"]


# group_rows (officers-CSV import transform: one row per person, comma-separated offices)


def test_group_rows_pivots_offices_into_teams():
    rows = [
        {"Name": "Alyssa", "Office(s)": "Communications, Events", "Region": "Ontario", "WCA ID": "2014ESPA01"},
        {"Name": "Ben", "Office(s)": "Events", "Region": "Ontario", "WCA ID": ""},
        {"Name": "Wendy", "Office(s)": "Administrative", "Region": "Ontario", "WCA ID": "2023NIEU03"},
    ]

    teams = group_rows(rows)

    assert set(teams) == {"communications", "events", "administration"}
    # A multi-office person joins every listed team, carrying their WCA id to each.
    assert [m["name"] for m in teams["communications"]["members"]] == ["Alyssa"]
    assert [m["name"] for m in teams["events"]["members"]] == ["Alyssa", "Ben"]
    assert teams["communications"]["members"][0]["wca_id"] == "2014ESPA01"
    assert teams["events"]["members"][0]["wca_id"] == "2014ESPA01"
    # Bilingual name + position come from the OFFICE_TEAMS config order.
    assert teams["communications"]["name_en"] == "Communications Team"
    assert teams["communications"]["position"] == 0
    assert teams["events"]["position"] == 1
    assert teams["administration"]["position"] == 2
    # A blank WCA ID becomes None; the sheet has no leaders.
    ben = teams["events"]["members"][1]
    assert ben["wca_id"] is None
    assert ben["is_leader"] is False


def test_group_rows_skips_blank_names_and_unknown_offices():
    rows = [
        {"Name": "", "Office(s)": "Events"},  # no name -> skipped
        {"Name": "Zed", "Office(s)": "Software"},  # unknown office -> skipped, no team created
        {"Name": "Amy", "Office(s)": "Administrative"},
    ]

    teams = group_rows(rows)

    assert set(teams) == {"administration"}
    assert [m["name"] for m in teams["administration"]["members"]] == ["Amy"]
