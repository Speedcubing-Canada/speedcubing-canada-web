"""Tests for the championships public + admin route helpers.

Follows the repo convention of unit-testing pure helpers with mocked ndb, rather
than spinning up the Flask app / a datastore emulator.
"""

import datetime
from unittest.mock import MagicMock, patch

import pytest
from google.cloud import ndb

from backend.handlers.admin.edit_championships import _apply_fields, _derive_id, filter_and_sort
from backend.handlers.champions_table import (
    _format_champion_result,
    _serialize_champion_result,
    region_championships,
    serialize_champions,
)
from backend.handlers.regional import _upcoming_championship, display_region_key, fetch_registration, registration_status
from backend.lib.residency import resolve_residency
from backend.models.championship import Championship

# ---------------------------------------------------------------------------
# Championship.type_and_area / to_json
# ---------------------------------------------------------------------------


def test_type_and_area_national_fmc():
    champ = MagicMock()
    champ.national_championship = True
    champ.is_fmc = True
    assert Championship.type_and_area(champ) == ("national_fmc", None)


def test_type_and_area_regional_uses_lookup():
    region_key = object()
    region = MagicMock()
    region.championship_name = "Quebec"
    champ = MagicMock()
    champ.national_championship = False
    champ.region = region_key
    champ.province = None
    assert Championship.type_and_area(champ, regions={region_key: region}) == ("regional", "Quebec")


def test_type_and_area_provincial_unknown_when_missing():
    champ = MagicMock()
    champ.national_championship = False
    champ.region = None
    champ.province = None
    assert Championship.type_and_area(champ) == ("unknown", None)


def test_to_json_shape():
    champ = MagicMock()
    champ.national_championship = False
    champ.region = MagicMock()
    champ.region.id.return_value = "qc"
    champ.province = None
    champ.key.id.return_value = "qc_2026"
    champ.competition.id.return_value = "QcChamp2026"
    champ.is_pbq = False
    champ.is_fmc = False
    champ.residency_deadline = None
    champ.residency_timezone = None
    champ.type_and_area.return_value = ("regional", "Quebec")
    region = MagicMock()
    region.championship_name = "Quebec"
    competition = MagicMock()
    competition.name = "Quebec Championship 2026"
    competition.year = 2026

    out = Championship.to_json(champ, regions={champ.region: region}, competition=competition)

    assert out["id"] == "qc_2026"
    assert out["type"] == "regional"
    assert out["area"] == "Quebec"
    assert out["region"] == "qc"
    assert out["competition_id"] == "QcChamp2026"
    assert out["competition_name"] == "Quebec Championship 2026"
    assert out["year"] == 2026


# ---------------------------------------------------------------------------
# regional: registration_status / _upcoming_championship
# ---------------------------------------------------------------------------

NOW = datetime.datetime(2026, 6, 20, tzinfo=datetime.timezone.utc)


def test_registration_status_unknown_when_no_dates():
    assert registration_status(None, None, NOW) is None


def test_registration_status_not_open():
    later = datetime.datetime(2026, 7, 1, tzinfo=datetime.timezone.utc)
    assert registration_status(later, None, NOW) == "not_open"


def test_registration_status_closed():
    opened = datetime.datetime(2026, 1, 1, tzinfo=datetime.timezone.utc)
    closed = datetime.datetime(2026, 6, 1, tzinfo=datetime.timezone.utc)
    assert registration_status(opened, closed, NOW) == "closed"


def test_registration_status_open():
    opened = datetime.datetime(2026, 1, 1, tzinfo=datetime.timezone.utc)
    closes = datetime.datetime(2026, 12, 1, tzinfo=datetime.timezone.utc)
    assert registration_status(opened, closes, NOW) == "open"


def _entry(year, start, end):
    champ = MagicMock()
    comp = MagicMock()
    comp.year = year
    comp.start_date = start
    comp.end_date = end
    return (champ, comp)


def test_upcoming_picks_nearest_future_and_ignores_past():
    today = datetime.date(2026, 6, 20)
    past = _entry(2025, datetime.date(2025, 9, 1), datetime.date(2025, 9, 2))
    soon = _entry(2026, datetime.date(2026, 7, 18), datetime.date(2026, 7, 19))
    later = _entry(2026, datetime.date(2026, 11, 1), datetime.date(2026, 11, 2))
    assert _upcoming_championship([past, later, soon], today)[1] is soon[1]


def test_upcoming_none_when_all_past():
    today = datetime.date(2026, 6, 20)
    past = _entry(2025, datetime.date(2025, 9, 1), datetime.date(2025, 9, 2))
    assert _upcoming_championship([past], today) is None


# ---------------------------------------------------------------------------
# regional.display_region_key (single-province mapping + PBQ/national exclusion)
# ---------------------------------------------------------------------------

BC_REGION = object()
PR_REGION = object()
BC_PROVINCE = object()
AB_PROVINCE = object()
PROVINCE_REGION = {BC_PROVINCE: BC_REGION, AB_PROVINCE: PR_REGION}
REGION_PROVINCE_COUNT = {BC_REGION: 1, PR_REGION: 3}


def _champ(region=None, province=None, national=False, pbq=False):
    c = MagicMock()
    c.region = region
    c.province = province
    c.national_championship = national
    c.is_pbq = pbq
    return c


def test_display_region_regional_maps_to_region():
    assert display_region_key(_champ(region=PR_REGION), PROVINCE_REGION, REGION_PROVINCE_COUNT) is PR_REGION


def test_display_region_single_province_provincial_maps_to_region():
    # BC provincial championship -> BC region (single province).
    assert display_region_key(_champ(province=BC_PROVINCE), PROVINCE_REGION, REGION_PROVINCE_COUNT) is BC_REGION


def test_display_region_multi_province_provincial_skipped():
    # Alberta provincial championship within multi-province Prairies -> not the region's championship.
    assert display_region_key(_champ(province=AB_PROVINCE), PROVINCE_REGION, REGION_PROVINCE_COUNT) is None


def test_display_region_national_and_pbq_excluded():
    assert display_region_key(_champ(region=PR_REGION, national=True), PROVINCE_REGION, REGION_PROVINCE_COUNT) is None
    assert display_region_key(_champ(province=BC_PROVINCE, pbq=True), PROVINCE_REGION, REGION_PROVINCE_COUNT) is None


# ---------------------------------------------------------------------------
# champions_table.region_championships
# ---------------------------------------------------------------------------


@patch("backend.handlers.champions_table.Championship")
@patch("backend.handlers.champions_table.Province")
def test_region_championships_single_province_matches_provincial(MockProvince, MockChampionship):
    region = MagicMock()
    bc_province_key = object()
    MockProvince.query.return_value.fetch.return_value = [bc_province_key]  # single-province region

    main = _champ(province=bc_province_key)
    main.year = 2025
    pbq = _champ(province=bc_province_key, pbq=True)
    pbq.year = 2025
    other_year = _champ(province=bc_province_key)
    other_year.year = 2024
    MockChampionship.query.return_value.iter.return_value = [main, pbq, other_year]

    assert region_championships(region, 2025) == [main]


@patch("backend.handlers.champions_table.Championship")
@patch("backend.handlers.champions_table.Province")
def test_region_championships_multi_province_matches_regional(MockProvince, MockChampionship):
    region = MagicMock()
    MockProvince.query.return_value.fetch.return_value = [object(), object(), object()]  # multi-province

    regional = _champ(region=region.key)
    regional.year = 2024
    provincial = _champ(province=object())  # an Alberta-style provincial champ, should be ignored
    provincial.year = 2024
    MockChampionship.query.return_value.iter.return_value = [regional, provincial]

    assert region_championships(region, 2024) == [regional]


# ---------------------------------------------------------------------------
# edit_championships: filter_and_sort / _derive_id
# ---------------------------------------------------------------------------


def _record(id_, name, year, type_="regional", area=None):
    return {"id": id_, "competition_name": name, "year": year, "type": type_, "area": area}


def test_filter_and_sort_filters_by_competition_name():
    records = [_record("a", "Quebec Championship", 2026), _record("b", "Ontario Open", 2025)]
    out = filter_and_sort(records, q="quebec", sort_field="year", sort_order="desc")
    assert [r["id"] for r in out] == ["a"]


def test_filter_and_sort_sorts_year_desc_then_asc():
    records = [_record("a", "A", 2024), _record("b", "B", 2026), _record("c", "C", 2025)]
    desc = filter_and_sort(records, q="", sort_field="year", sort_order="desc")
    assert [r["year"] for r in desc] == [2026, 2025, 2024]
    asc = filter_and_sort(records, q="", sort_field="year", sort_order="asc")
    assert [r["year"] for r in asc] == [2024, 2025, 2026]


def test_filter_and_sort_handles_none_values():
    records = [_record("a", "A", 2026, area="Quebec"), _record("b", "B", 2026, area=None)]
    out = filter_and_sort(records, q="", sort_field="area", sort_order="asc")
    # Should not raise; the None area sorts last.
    assert out[-1]["id"] == "b"


@patch("backend.handlers.admin.edit_championships.Region")
def test_derive_id_regional(MockRegion):
    region = MagicMock()
    region.key.id.return_value = "bc"
    MockRegion.get_by_id.return_value = region
    competition = MagicMock()
    competition.year = 2026
    assert _derive_id({"type": "regional", "region": "bc"}, competition) == "bc_2026"


def test_derive_id_national_fmc():
    competition = MagicMock()
    competition.year = 2026
    assert _derive_id({"type": "national_fmc"}, competition) == "2026_fmc"


# ---------------------------------------------------------------------------
# edit_championships._apply_fields (residency-deadline tz normalization)
# ---------------------------------------------------------------------------

# _apply_fields assigns to a real Championship's ndb properties (a naive
# DateTimeProperty and a Competition KeyProperty), so these tests run inside an
# in-memory ndb context — no datastore I/O, just property validation.
_ndb_client = ndb.Client()


@pytest.fixture
def ndb_context():
    with _ndb_client.context():
        yield


def _competition(comp_id="WorldChamp2026", year=2026):
    comp = MagicMock()
    comp.key = ndb.Key("Competition", comp_id)
    comp.year = year
    return comp


def test_apply_fields_normalizes_utc_z_deadline_to_naive(ndb_context):
    # Regression: residency_deadline is a naive DateTimeProperty, so a tz-aware value
    # raises BadValueError on assignment. The frontend DateTimeInput sends a "Z"-suffixed
    # UTC string; _apply_fields must store it as naive-UTC.
    champ = Championship()
    data = {
        "type": "national",
        "residency_deadline": "2026-08-01T05:00:00Z",
        "residency_timezone": "America/Toronto",
    }
    _apply_fields(champ, data, _competition())  # must not raise
    assert champ.residency_deadline == datetime.datetime(2026, 8, 1, 5, 0, 0)
    assert champ.residency_deadline.tzinfo is None
    assert champ.residency_timezone == "America/Toronto"


def test_apply_fields_converts_offset_deadline_to_utc(ndb_context):
    champ = Championship()
    _apply_fields(champ, {"type": "national", "residency_deadline": "2026-08-01T00:00:00-04:00"}, _competition())
    # 00:00 at -04:00 == 04:00 UTC, stored naive.
    assert champ.residency_deadline == datetime.datetime(2026, 8, 1, 4, 0, 0)
    assert champ.residency_deadline.tzinfo is None


def test_apply_fields_clears_deadline_when_absent(ndb_context):
    champ = Championship()
    _apply_fields(champ, {"type": "national"}, _competition())
    assert champ.residency_deadline is None
    assert champ.residency_timezone is None


def test_apply_fields_deadline_is_comparable_in_resolve_residency(ndb_context):
    # Ties the write path (_apply_fields) to the read path (resolve_residency): both
    # sides must be naive so the comparison doesn't raise "can't compare offset-naive
    # and offset-aware datetimes".
    champ = Championship()
    _apply_fields(champ, {"type": "national", "residency_deadline": "2026-01-01T00:00:00Z"}, _competition())

    older, newer = MagicMock(), MagicMock()
    older.province, older.update_time = "AB", datetime.datetime(2025, 6, 1)
    newer.province, newer.update_time = "ON", datetime.datetime(2027, 1, 1)
    user = MagicMock()
    user.province = "BC"
    user.updates = [older, newer]

    assert resolve_residency(user, champ.residency_deadline) == "AB"


# ---------------------------------------------------------------------------
# regional.fetch_registration
# ---------------------------------------------------------------------------

REG_NOW = datetime.datetime(2026, 6, 20, tzinfo=datetime.timezone.utc)


@patch("backend.handlers.regional.requests")
def test_fetch_registration_derives_status(mock_requests):
    resp = MagicMock()
    resp.status_code = 200
    resp.json.return_value = {
        "registration_open": "2026-01-01T00:00:00Z",
        "registration_close": "2026-12-01T00:00:00Z",
    }
    mock_requests.get.return_value = resp

    out = fetch_registration("WorldChamp2026", now=REG_NOW)

    assert out["registration_open"] == "2026-01-01T00:00:00Z"
    assert out["registration_close"] == "2026-12-01T00:00:00Z"
    assert out["registration_status"] == "open"


@patch("backend.handlers.regional.requests")
def test_fetch_registration_returns_none_on_http_error(mock_requests):
    resp = MagicMock()
    resp.status_code = 404
    mock_requests.get.return_value = resp
    assert fetch_registration("Nope2026", now=REG_NOW) is None


@patch("backend.handlers.regional.requests")
def test_fetch_registration_returns_none_on_request_exception(mock_requests):
    import requests as real_requests

    mock_requests.RequestException = real_requests.RequestException
    mock_requests.get.side_effect = real_requests.RequestException("boom")
    assert fetch_registration("Boom2026", now=REG_NOW) is None


# ---------------------------------------------------------------------------
# champions_table: serialization
# ---------------------------------------------------------------------------


@patch("backend.handlers.champions_table.formatters")
def test_serialize_champion_result(mock_fmt):
    mock_fmt.format_time.return_value = "7.42"
    result = MagicMock()
    result.person.id.return_value = "2017ONDE01"
    result.person_name = "Alexandre Ondet"
    result.pos = 1
    result.best = 742
    result.average = 800
    result.fmt.id.return_value = "a"  # average format -> shows the average
    result.regional_single_record = "NR"
    result.regional_average_record = ""

    out = _serialize_champion_result(result, province_id="qc")

    assert out["wca_id"] == "2017ONDE01"
    assert out["name"] == "Alexandre Ondet"
    assert out["province"] == "qc"
    assert out["result"] == "7.42"
    assert out["single_record"] == "NR"
    assert out["average_record"] is None
    mock_fmt.format_time.assert_called_once_with(800, result.event, True)


@patch("backend.handlers.champions_table.formatters")
def test_champion_result_falls_back_to_single_when_no_average(mock_fmt):
    # Mean-format event but average is missing (0) -> show the single, not "0.00".
    mock_fmt.format_time.return_value = "4:38.70"
    result = MagicMock()
    result.average = 0
    result.best = 27870
    result.fmt.id.return_value = "m"

    assert _format_champion_result(result) == "4:38.70"
    mock_fmt.format_time.assert_called_once_with(27870, result.event, False)


def test_champion_result_dnf_when_no_single_or_average():
    result = MagicMock()
    result.average = -1
    result.best = -1
    result.fmt.id.return_value = "a"
    assert _format_champion_result(result) == "DNF"


@patch("backend.handlers.champions_table.formatters")
@patch("backend.handlers.champions_table.ndb")
def test_serialize_champions_orders_by_event_rank(mock_ndb, mock_fmt):
    mock_fmt.format_time.return_value = "x"

    r333, r444 = MagicMock(), MagicMock()
    for r in (r333, r444):
        r.person = None
        r.regional_single_record = ""
        r.regional_average_record = ""
        r.average = 0
        r.best = 1000
        r.fmt.id.return_value = "a"
    r333.key, r444.key = object(), object()

    ev333_key, ev444_key = MagicMock(), MagicMock()
    ev333_key.id.return_value = "333"
    ev444_key.id.return_value = "444"
    ev333, ev444 = MagicMock(), MagicMock()
    ev333.key, ev333.name, ev333.rank = ev333_key, "3x3x3", 1
    ev444.key, ev444.name, ev444.rank = ev444_key, "4x4x4", 5

    champ333, champ444 = MagicMock(), MagicMock()
    champ333.champions, champ333.event = [r333.key], ev333_key
    champ444.champions, champ444.event = [r444.key], ev444_key

    # get_multi is called for results, then events, then persons (empty).
    mock_ndb.get_multi.side_effect = [[r333, r444], [ev333, ev444], []]

    # Pass champions out of rank order to prove sorting.
    out = serialize_champions([champ444, champ333])

    assert [c["event_id"] for c in out] == ["333", "444"]
    assert out[0]["event_name"] == "3x3x3"
    assert len(out[0]["champions"]) == 1
