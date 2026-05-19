"""Tests for update_province_records()."""

from unittest.mock import MagicMock, patch

from backend.load_db.update_province_records import update_province_records

BASE = "backend.load_db.update_province_records"


def _rank(best, is_province_record=False):
    r = MagicMock()
    r.best = best
    r.is_province_record = is_province_record
    return r


def _wire(MockEvent, MockProvince, MockRankSingle, MockRankAverage, single_iter, stale_iter=None):
    """Configure mocks for one event and one province, with RankAverage returning nothing."""
    MockEvent.query.return_value.fetch.return_value = [MagicMock()]
    MockProvince.query.return_value.fetch.return_value = [MagicMock()]

    and_q = MagicMock()
    and_q.order.return_value.iter.return_value = iter(single_iter)
    stale_q = MagicMock()
    stale_q.iter.return_value = iter(stale_iter or [])
    MockRankSingle.query.side_effect = [and_q, stale_q]

    avg_q = MagicMock()
    avg_q.order.return_value.iter.return_value = iter([])
    avg_stale_q = MagicMock()
    avg_stale_q.iter.return_value = iter([])
    MockRankAverage.query.side_effect = [avg_q, avg_stale_q]


@patch(f"{BASE}.ndb")
@patch(f"{BASE}.RankAverage")
@patch(f"{BASE}.RankSingle")
@patch(f"{BASE}.Province")
@patch(f"{BASE}.Event")
def test_best_time_becomes_province_record(MockEvent, MockProvince, MockRankSingle, MockRankAverage, mock_ndb):
    best = _rank(500)
    worse = _rank(600)
    _wire(MockEvent, MockProvince, MockRankSingle, MockRankAverage, [best, worse])

    update_province_records()

    assert best.is_province_record is True


@patch(f"{BASE}.ndb")
@patch(f"{BASE}.RankAverage")
@patch(f"{BASE}.RankSingle")
@patch(f"{BASE}.Province")
@patch(f"{BASE}.Event")
def test_tied_times_are_all_province_records(MockEvent, MockProvince, MockRankSingle, MockRankAverage, mock_ndb):
    tied1 = _rank(500)
    tied2 = _rank(500)
    worse = _rank(600)
    _wire(MockEvent, MockProvince, MockRankSingle, MockRankAverage, [tied1, tied2, worse])

    update_province_records()

    assert tied1.is_province_record is True
    assert tied2.is_province_record is True


@patch(f"{BASE}.ndb")
@patch(f"{BASE}.RankAverage")
@patch(f"{BASE}.RankSingle")
@patch(f"{BASE}.Province")
@patch(f"{BASE}.Event")
def test_stale_record_is_cleared(MockEvent, MockProvince, MockRankSingle, MockRankAverage, mock_ndb):
    best = _rank(500)
    stale = _rank(600, is_province_record=True)
    _wire(MockEvent, MockProvince, MockRankSingle, MockRankAverage, [best], stale_iter=[stale])

    update_province_records()

    assert stale.is_province_record is False


@patch(f"{BASE}.ndb")
@patch(f"{BASE}.RankAverage")
@patch(f"{BASE}.RankSingle")
@patch(f"{BASE}.Province")
@patch(f"{BASE}.Event")
def test_current_record_not_cleared_when_still_best(MockEvent, MockProvince, MockRankSingle, MockRankAverage, mock_ndb):
    best = _rank(500, is_province_record=True)
    # best appears in both the AND query and the stale query — it must stay True
    _wire(MockEvent, MockProvince, MockRankSingle, MockRankAverage, [best], stale_iter=[best])

    update_province_records()

    assert best.is_province_record is True


@patch(f"{BASE}.ndb")
@patch(f"{BASE}.RankAverage")
@patch(f"{BASE}.RankSingle")
@patch(f"{BASE}.Province")
@patch(f"{BASE}.Event")
def test_put_multi_receives_new_and_cleared_records(MockEvent, MockProvince, MockRankSingle, MockRankAverage, mock_ndb):
    best = _rank(500)
    stale = _rank(600, is_province_record=True)
    _wire(MockEvent, MockProvince, MockRankSingle, MockRankAverage, [best], stale_iter=[stale])

    update_province_records()

    mock_ndb.put_multi.assert_called_once()
    passed = mock_ndb.put_multi.call_args[0][0]
    assert best in passed
    assert stale in passed
