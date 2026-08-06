"""Tests for setup_regions_and_provinces: canonical upsert + stale deletion."""

from unittest.mock import MagicMock, patch

from backend.load_db.setup_geography import setup_regions_and_provinces

CANONICAL_REGIONS = {"at", "qc", "on", "pr", "bc", "te"}
CANONICAL_PROVINCES = {"nl", "pe", "ns", "nb", "qc", "on", "mb", "sk", "ab", "bc", "yt", "nt", "nu"}


def _entity_factory():
    """Return a side_effect that builds a fresh mock entity per ``id`` kwarg."""

    def make(id):
        entity = MagicMock()
        entity.key.id.return_value = id
        return entity

    return make


@patch("backend.load_db.setup_geography.Province")
@patch("backend.load_db.setup_geography.Region")
def test_setup_creates_canonical_and_deletes_stale(MockRegion, MockProvince):
    # Nothing exists yet -> every entity goes through the constructor path.
    MockRegion.get_by_id.return_value = None
    MockProvince.get_by_id.return_value = None
    MockRegion.side_effect = _entity_factory()
    MockProvince.side_effect = _entity_factory()

    # A stale region ("nw") and province ("xx") that are no longer canonical.
    stale_region = MagicMock()
    stale_region.key.id.return_value = "nw"
    stale_province = MagicMock()
    stale_province.key.id.return_value = "xx"
    MockRegion.query.return_value.iter.return_value = [stale_region]
    MockProvince.query.return_value.iter.return_value = [stale_province]

    setup_regions_and_provinces()

    created_regions = {call.kwargs["id"] for call in MockRegion.call_args_list}
    created_provinces = {call.kwargs["id"] for call in MockProvince.call_args_list}
    assert created_regions == CANONICAL_REGIONS
    assert created_provinces == CANONICAL_PROVINCES

    # Stale entities are deleted; canonical ones are not.
    stale_region.key.delete.assert_called_once()
    stale_province.key.delete.assert_called_once()


@patch("backend.load_db.setup_geography.Province")
@patch("backend.load_db.setup_geography.Region")
def test_setup_is_idempotent_updates_existing_in_place(MockRegion, MockProvince):
    # Existing canonical entities are returned by get_by_id -> updated in place,
    # constructor is never called, and nothing is deleted.
    existing = {}

    def region_by_id(id):
        existing.setdefault(("r", id), MagicMock())
        m = existing[("r", id)]
        m.key.id.return_value = id
        return m

    def province_by_id(id):
        existing.setdefault(("p", id), MagicMock())
        m = existing[("p", id)]
        m.key.id.return_value = id
        return m

    MockRegion.get_by_id.side_effect = region_by_id
    MockProvince.get_by_id.side_effect = province_by_id
    MockRegion.query.return_value.iter.return_value = [region_by_id(r) for r in CANONICAL_REGIONS]
    MockProvince.query.return_value.iter.return_value = [province_by_id(p) for p in CANONICAL_PROVINCES]

    setup_regions_and_provinces()

    MockRegion.assert_not_called()  # never constructed a new Region
    MockProvince.assert_not_called()
    for entity in existing.values():
        entity.key.delete.assert_not_called()
