"""Unit tests for team serialization, admin field-parsing, and the CSV import transform.

Pure logic only (no datastore emulator): building in-memory ndb entities and calling the
pure helpers, mirroring test_delegates.py.
"""

from unittest.mock import MagicMock

from backend.handlers.admin.edit_teams import filter_and_sort, parse_members
from backend.load_db.import_teams import parse_rows
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
    team.members = [
        TeamMember(
            name="Alex",
            wca_id="2017ONDE01",
            bio_en="Bio",
            bio_fr="Bio fr",
            is_leader=True,
            avatar_thumb_url="thumb.jpg",
        )
    ]

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
                "avatar_thumb_url": "thumb.jpg",
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
        {
            "name": "Lead",
            "wca_id": "2008ASIS01",
            "bio_en": "b",
            "bio_fr": "",
            "is_leader": True,
            "avatar_thumb_url": "thumb.jpg",
        },
        {"name": "  ", "wca_id": "X", "is_leader": False},  # blank name -> skipped
        {"name": "Member", "wca_id": "", "is_leader": False, "avatar_thumb_url": ""},  # empty wca_id -> None
    ]

    members = parse_members(rows)

    assert [m.name for m in members] == ["Lead", "Member"]
    assert members[0].wca_id == "2008ASIS01"
    assert members[0].bio_fr is None
    assert members[0].is_leader is True
    assert members[1].wca_id is None
    # avatar_thumb_url round-trips verbatim: "" (synced default avatar) must survive.
    assert members[0].avatar_thumb_url == "thumb.jpg"
    assert members[1].avatar_thumb_url == ""


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


# parse_rows (officers-CSV import: one row per person, comma-separated offices + leads + board)


def test_parse_rows_pivots_offices_into_teams():
    rows = [
        {"Name": "Alyssa", "Office(s)": "Communications, Events", "WCA ID": "2014ESPA01", "Leads": ""},
        {"Name": "Ben", "Office(s)": "Events", "WCA ID": "", "Leads": ""},
        {"Name": "Wendy", "Office(s)": "Administrative", "WCA ID": "2023NIEU03", "Leads": ""},
        {"Name": "Alex", "Office(s)": "Software", "WCA ID": "2017ONDE01", "Leads": "Software"},
    ]

    teams, directors = parse_rows(rows)

    assert set(teams) == {"communications", "events", "administration", "software"}
    assert directors == []
    # A multi-office person joins every listed team, carrying their WCA id to each.
    assert [m["name"] for m in teams["communications"]["members"]] == ["Alyssa"]
    assert [m["name"] for m in teams["events"]["members"]] == ["Alyssa", "Ben"]
    assert teams["events"]["members"][0]["wca_id"] == "2014ESPA01"
    # Bilingual name + position come from the OFFICE_TEAMS config order.
    assert teams["communications"]["name_en"] == "Communications Team"
    assert teams["communications"]["position"] == 0
    # Each team also carries a bilingual description sourced from OFFICE_TEAMS.
    assert teams["communications"]["description_en"]
    assert teams["communications"]["description_fr"]
    # Events is intentionally ordered last; Software and Administration fall in between.
    assert teams["software"]["position"] == 1
    assert teams["administration"]["position"] == 2
    assert teams["events"]["position"] == 3
    # A blank WCA ID becomes None; Ben leads nothing, Alex leads Software.
    ben = teams["events"]["members"][1]
    assert ben["wca_id"] is None and ben["is_leader"] is False
    assert teams["software"]["members"][0]["is_leader"] is True


def test_parse_rows_routes_board_office_to_directors():
    rows = [
        {"Name": "Kristopher De Asis", "Office(s)": "Events, Board", "WCA ID": "2008ASIS01", "Leads": ""},
        # A second Board row for the same person must not duplicate the director.
        {"Name": "Kristopher De Asis", "Office(s)": "Board", "WCA ID": "2008ASIS01", "Leads": ""},
        {"Name": "Joanne Chew", "Office(s)": "Communications, Board", "WCA ID": "2024CHEW09", "Leads": ""},
    ]

    teams, directors = parse_rows(rows)

    # Board members still join their operational team...
    assert [m["name"] for m in teams["events"]["members"]] == ["Kristopher De Asis"]
    # ...and become Directors, keyed by a name slug, deduped, ordered by first appearance.
    assert [(d["id"], d["wca_id"], d["position"]) for d in directors] == [
        ("kristopher-de-asis", "2008ASIS01", 0),
        ("joanne-chew", "2024CHEW09", 1),
    ]


def test_parse_rows_warns_and_drops_second_person_on_slug_collision(caplog):
    # Two distinct people (different WCA ids) whose names slugify to the same id: the second
    # must not silently disappear without at least a warning.
    rows = [
        {"Name": "Jean Roy", "Office(s)": "Board", "WCA ID": "2015ROYJ01", "Leads": ""},
        {"Name": "Jean Roy", "Office(s)": "Board", "WCA ID": "2019ROYJ02", "Leads": ""},
    ]

    teams, directors = parse_rows(rows)

    assert [(d["id"], d["wca_id"]) for d in directors] == [("jean-roy", "2015ROYJ01")]
    assert any("slugify" in message for message in caplog.messages)


def test_parse_rows_skips_blank_names_and_unknown_offices():
    rows = [
        {"Name": "", "Office(s)": "Events"},  # no name -> skipped
        {"Name": "Zed", "Office(s)": "Marketing"},  # unknown office -> skipped, no team created
        {"Name": "Amy", "Office(s)": "Administrative"},
    ]

    teams, directors = parse_rows(rows)

    assert set(teams) == {"administration"}
    assert directors == []
    assert [m["name"] for m in teams["administration"]["members"]] == ["Amy"]
