"""Unit tests for the shared Director/FeaturedMember serialization + admin field-parsing.

Pure logic only (no datastore emulator), mirroring test_delegates.py.
"""

from unittest.mock import MagicMock

from backend.handlers.admin._person_crud import apply_person_fields, filter_and_sort
from backend.models.site_person import Director, FeaturedMember

# to_json / apply_person_fields use a mocked self: a keyed ndb entity can't be built
# without an active context, so mirror test_delegates.py and call the methods unbound.


def test_person_to_json_shape():
    member = MagicMock()
    member.key.id.return_value = "jane"
    member.name = "Jane Doe"
    member.wca_id = "2015DOEJ01"
    member.role_en = "Founder"
    member.role_fr = "Fondatrice"
    member.bio_en = "Started it all."
    member.bio_fr = "A tout démarré."
    member.position = 1
    member.avatar_thumb_url = "thumb.jpg"

    assert FeaturedMember.to_json(member) == {
        "id": "jane",
        "name": "Jane Doe",
        "wca_id": "2015DOEJ01",
        "role_en": "Founder",
        "role_fr": "Fondatrice",
        "bio_en": "Started it all.",
        "bio_fr": "A tout démarré.",
        "position": 1,
        "avatar_thumb_url": "thumb.jpg",
    }


def test_director_defaults_position():
    director = MagicMock()
    director.position = None
    assert Director.to_json(director)["position"] == 0


def test_apply_person_fields_sets_fields_and_blanks_to_none():
    director = MagicMock()
    apply_person_fields(
        director,
        {
            "name": "  Chris  ",
            "wca_id": "2008ASIS01",
            "role_en": "President",
            "role_fr": "",
            "bio_en": "  ",
            "position": "3",
        },
    )

    assert director.name == "Chris"
    assert director.wca_id == "2008ASIS01"
    assert director.role_en == "President"
    assert director.role_fr is None
    assert director.bio_en is None
    assert director.position == 3


def test_filter_and_sort_by_name_and_position_default():
    records = [
        {"id": "b", "name": "Bob", "position": 2},
        {"id": "a", "name": "Ann", "position": 0},
    ]
    assert [r["id"] for r in filter_and_sort(records, "", "bogus", "asc")] == ["a", "b"]
    assert [r["id"] for r in filter_and_sort(records, "bob", "position", "asc")] == ["b"]
