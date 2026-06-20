"""Tests for update_champions: residency-based eligibility, locking, and champion selection."""

import datetime
from unittest.mock import MagicMock, patch

from backend.load_db.update_champions import (
    compute_eligible_competitors,
    fetch_users_for_competitors,
    resolve_eligibility,
    resolve_residency,
    select_champions,
)

BASE = "backend.load_db.update_champions"


def _key(id_):
    k = MagicMock()
    k.id.return_value = id_
    return k


def _result(person_id, pos, best=1000, event=None, event_id="333", round_type="final", person_country=None):
    r = MagicMock()
    r.person = _key(person_id)
    r.pos = pos
    r.best = best
    # Real ndb Keys compare equal by value, so results for the same event must
    # share one key object for the per-event grouping to work.
    r.event = event if event is not None else _key(event_id)
    r.round_type = round_type
    r.person_country = person_country
    return r


def _update(province, when):
    u = MagicMock()
    u.province = province
    u.update_time = when
    return u


# ---------------------------------------------------------------------------
# resolve_residency
# ---------------------------------------------------------------------------


def test_residency_uses_current_province_when_no_updates():
    user = MagicMock()
    user.updates = []
    user.province = "BC"
    assert resolve_residency(user, datetime.datetime(2026, 1, 1)) == "BC"


def test_residency_uses_latest_update_before_deadline():
    user = MagicMock()
    user.province = "BC"
    user.updates = [
        _update("AB", datetime.datetime(2025, 1, 1)),
        _update("SK", datetime.datetime(2025, 6, 1)),
        _update("ON", datetime.datetime(2027, 1, 1)),  # after the deadline, ignored
    ]
    # Deadline is 2026 -> latest update before it is the 2025-06 move to SK.
    assert resolve_residency(user, datetime.datetime(2026, 1, 1)) == "SK"


def test_residency_unknown_when_all_updates_after_deadline():
    user = MagicMock()
    user.province = "BC"
    user.updates = [_update("AB", datetime.datetime(2027, 1, 1))]
    assert resolve_residency(user, datetime.datetime(2026, 1, 1)) is None


# ---------------------------------------------------------------------------
# resolve_eligibility (residency + locking)
# ---------------------------------------------------------------------------


def _championship(year=2026, region=None, key="champ"):
    c = MagicMock()
    c.year = year
    c.region = region
    c.key = key
    return c


@patch(f"{BASE}.ProvinceChampionshipEligibility")
def test_provincial_resident_is_eligible_and_locked(MockProvElig):
    user = MagicMock()
    user.updates = []
    user.province = "AB"
    user.province_eligibilities = []
    champ = _championship(region=None)

    eligible, modified = resolve_eligibility(
        user, champ, valid_province_keys=["AB"], residency_deadline=datetime.datetime(2026, 1, 1), is_regional=False
    )

    assert eligible is True
    assert modified is True
    # The eligibility was recorded on the user (locking).
    assert len(user.province_eligibilities) == 1
    assert user.province_eligibilities[0].championship == "champ"


def test_provincial_non_resident_is_ineligible_and_not_recorded():
    user = MagicMock()
    user.updates = []
    user.province = "ON"
    user.province_eligibilities = []
    champ = _championship(region=None)

    eligible, modified = resolve_eligibility(
        user, champ, valid_province_keys=["AB"], residency_deadline=datetime.datetime(2026, 1, 1), is_regional=False
    )

    assert eligible is False
    assert modified is False
    assert user.province_eligibilities == []


def test_regional_lock_blocks_second_region_same_year():
    # User already locked into region "Prairies" for 2026.
    existing = MagicMock()
    existing.year = 2026
    existing.region = "Prairies"
    user = MagicMock()
    user.regional_eligibilities = [existing]

    champ = _championship(year=2026, region="Pacific")

    eligible, modified = resolve_eligibility(
        user, champ, valid_province_keys=["BC"], residency_deadline=datetime.datetime(2026, 1, 1), is_regional=True
    )

    assert eligible is False
    assert modified is False


def test_regional_lock_allows_same_region_recompute():
    existing = MagicMock()
    existing.year = 2026
    existing.region = "Prairies"
    user = MagicMock()
    user.regional_eligibilities = [existing]

    champ = _championship(year=2026, region="Prairies")

    eligible, modified = resolve_eligibility(
        user, champ, valid_province_keys=["AB"], residency_deadline=datetime.datetime(2026, 1, 1), is_regional=True
    )

    assert eligible is True
    assert modified is False  # already recorded, nothing new to persist


def test_lock_from_previous_year_does_not_apply():
    existing = MagicMock()
    existing.year = 2025
    existing.region = "Prairies"
    user = MagicMock()
    user.updates = []
    user.province = "BC"
    user.regional_eligibilities = [existing]

    champ = _championship(year=2026, region="Pacific")

    with patch(f"{BASE}.RegionalChampionshipEligibility"):
        eligible, modified = resolve_eligibility(
            user, champ, valid_province_keys=["BC"], residency_deadline=datetime.datetime(2026, 1, 1), is_regional=True
        )

    # The 2025 lock is irrelevant; residency in BC (in Pacific) makes them eligible.
    assert eligible is True
    assert modified is True


def test_province_and_regional_tiers_lock_independently():
    # A provincial lock must not affect regional eligibility resolution.
    prov_lock = MagicMock()
    prov_lock.year = 2026
    prov_lock.province = "AB"
    user = MagicMock()
    user.updates = []
    user.province = "AB"
    user.province_eligibilities = [prov_lock]
    user.regional_eligibilities = []

    champ = _championship(year=2026, region="Prairies")

    with patch(f"{BASE}.RegionalChampionshipEligibility"):
        eligible, modified = resolve_eligibility(
            user, champ, valid_province_keys=["AB"], residency_deadline=datetime.datetime(2026, 1, 1), is_regional=True
        )

    assert eligible is True
    assert modified is True


# ---------------------------------------------------------------------------
# select_champions
# ---------------------------------------------------------------------------

FINAL = "final"
FINAL_KEYS = {FINAL}


def test_top_eligible_finisher_is_champion():
    event = _key("333")
    results = [_result("alice", pos=1, event=event), _result("bob", pos=2, event=event)]
    champions = select_champions(results, {"alice", "bob"}, FINAL_KEYS, year=2026)
    assert champions[event] == [results[0]]


def test_ineligible_winner_skipped_for_next_eligible():
    event = _key("333")
    winner = _result("ineligible", pos=1, event=event)
    runner_up = _result("eligible", pos=2, event=event)
    champions = select_champions([winner, runner_up], {"eligible"}, FINAL_KEYS, year=2026)
    assert champions[event] == [runner_up]


def test_dnf_results_are_skipped():
    event = _key("333")
    dnf = _result("alice", pos=1, best=-1, event=event)
    real = _result("bob", pos=2, best=900, event=event)
    champions = select_champions([dnf, real], {"alice", "bob"}, FINAL_KEYS, year=2026)
    assert champions[event] == [real]


def test_non_final_rounds_are_skipped():
    semi = _result("alice", pos=1, round_type="semi")
    champions = select_champions([semi], {"alice"}, FINAL_KEYS, year=2026)
    assert champions == {}


def test_ties_at_winning_position_all_kept():
    event = _key("333")
    t1 = _result("alice", pos=1, event=event)
    t2 = _result("bob", pos=1, event=event)
    loser = _result("carol", pos=3, event=event)
    champions = select_champions([t1, t2, loser], {"alice", "bob", "carol"}, FINAL_KEYS, year=2026)
    assert set(champions[event]) == {t1, t2}


@patch(f"{BASE}.ndb")
def test_pre_2009_mbo_mapped_to_mbf(mock_ndb):
    mbf_key = object()
    mock_ndb.Key.return_value = mbf_key
    mbo = _result("alice", pos=1, event_id="333mbo")
    mbf = _result("bob", pos=1, event_id="333mbf")
    champions = select_champions([mbo, mbf], {"alice", "bob"}, FINAL_KEYS, year=2008)
    # The 333mbo champion is recorded under the 333mbf key; the real 333mbf result is dropped.
    assert champions[mbf_key] == [mbo]
    assert len(champions) == 1


# ---------------------------------------------------------------------------
# compute_eligible_competitors
# ---------------------------------------------------------------------------


@patch(f"{BASE}.ndb")
@patch(f"{BASE}.Country")
def test_national_eligibility_is_citizenship_based(MockCountry, mock_ndb):
    canada_key = object()
    mock_ndb.Key.return_value = canada_key

    championship = MagicMock()
    championship.national_championship = True

    canadian = _result("alice", pos=1, person_country=canada_key)
    foreigner = _result("bob", pos=2, person_country=object())

    eligible = compute_eligible_competitors(championship, MagicMock(), [canadian, foreigner])

    assert eligible == {"alice"}


@patch(f"{BASE}.ndb")
@patch(f"{BASE}.ProvinceChampionshipEligibility")
@patch(f"{BASE}.User")
def test_provincial_eligibility_filters_by_residency(MockUser, MockProvElig, mock_ndb):
    championship = MagicMock()
    championship.national_championship = False
    championship.region = None
    championship.residency_deadline = datetime.datetime(2026, 1, 1)
    championship.year = 2026
    championship.get_eligible_province_keys.return_value = ["AB"]

    resident = MagicMock()
    resident.updates = []
    resident.province = "AB"
    resident.province_eligibilities = []
    resident.wca_person = _key("alice")

    non_resident = MagicMock()
    non_resident.updates = []
    non_resident.province = "ON"
    non_resident.province_eligibilities = []
    non_resident.wca_person = _key("bob")

    MockUser.query.return_value.fetch.return_value = [resident, non_resident]

    competition = MagicMock()
    competition.start_date = datetime.date(2026, 7, 1)
    results = [_result("alice", pos=1), _result("bob", pos=2)]

    eligible = compute_eligible_competitors(championship, competition, results)

    assert eligible == {"alice"}
    mock_ndb.put_multi.assert_called_once()


# ---------------------------------------------------------------------------
# fetch_users_for_competitors (IN-query batching)
# ---------------------------------------------------------------------------


@patch(f"{BASE}.User")
def test_fetch_users_batches_over_in_query_limit(MockUser):
    competitors = [object() for _ in range(65)]  # 3 chunks of <=30
    MockUser.query.return_value.fetch.side_effect = [["u1"], ["u2"], ["u3"]]

    users = fetch_users_for_competitors(competitors)

    assert users == ["u1", "u2", "u3"]
    assert MockUser.query.call_count == 3
    # Every chunk passed to IN() must respect the 30-value cap.
    for call in MockUser.wca_person.IN.call_args_list:
        assert len(call.args[0]) <= 30
