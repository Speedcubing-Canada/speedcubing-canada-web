"""Tests for classify_competition() using real names from canadian_test_comps.csv."""

import pytest

from backend.load_db.championship_classifier import classify_competition


# ---------------------------------------------------------------------------
# National championships
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "name",
    [
        "Canadian Championship 2019",
        "Canadian Championship 2023",
        "Canadian Open 2007",
        "Canadian Open 2009",
        "Canadian Open 2011",
        "Canadian Open 2013",
        "Canadian Open 2015",
        "Canadian Open 2017",
        "Championnat Canadien 2025",
    ],
)
def test_national_championships(name):
    is_national, area, is_pbq = classify_competition(name)
    assert is_national, f"Expected national: {name!r}"
    assert area is None
    assert not is_pbq


# ---------------------------------------------------------------------------
# Regional championships — all championships are at this single depth.
# Some regions group multiple provinces (Atlantic, Prairies, Territories);
# others map 1:1 to a province (BC, Ontario, Quebec each are their own region).
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "name, expected_area",
    [
        # Single-province regions
        ("BC Championship 2024", "British Columbia"),
        ("BC Championship 2026", "British Columbia"),
        ("Ontario Championship 2024", "Ontario"),
        ("Championnat Québécois 2024", "Quebec"),
        ("Championnat Québécois 2026", "Quebec"),
        # Multi-province regions
        ("Canadian Prairie Championship 2024", "Prairies"),
        ("Canadian Atlantic Championship 2026", "Atlantic"),
        ("Canadian Territories Championship 2024", "Territories"),
    ],
)
def test_regional_championships(name, expected_area):
    is_national, area, is_pbq = classify_competition(name)
    assert not is_national, f"Should not be national: {name!r}"
    assert area == expected_area, f"Wrong area for {name!r}: got {area!r}"
    assert not is_pbq


# ---------------------------------------------------------------------------
# "Canadian X" regional names must NOT be misclassified as national
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "name",
    [
        "Canadian Prairie Championship 2024",
        "Canadian Atlantic Championship 2026",
        "Canadian Territories Championship 2024",
    ],
)
def test_canadian_regional_not_national(name):
    is_national, _, _ = classify_competition(name)
    assert not is_national, f"Regional championship misclassified as national: {name!r}"


# ---------------------------------------------------------------------------
# FMC Canada — national championship only on years that have a nationals
# ---------------------------------------------------------------------------

# Championship years from the CSV: 2019, 2023, 2025
_KNOWN_NATIONAL_YEARS = {2019, 2023, 2025}


@pytest.mark.parametrize(
    "name",
    [
        "FMC Canada 2023",
        "FMC Canada 2025",
    ],
)
def test_fmc_canada_championship_year_is_national(name):
    is_national, area, is_pbq = classify_competition(name, national_years=_KNOWN_NATIONAL_YEARS)
    assert is_national, f"Expected national: {name!r}"
    assert area is None
    assert not is_pbq


@pytest.mark.parametrize(
    "name",
    [
        "FMC Canada 2022",
        "FMC Canada 2024",
    ],
)
def test_fmc_canada_non_championship_year_is_not_matched(name):
    is_national, area, _ = classify_competition(name, national_years=_KNOWN_NATIONAL_YEARS)
    assert not is_national, f"Should not be national: {name!r}"
    assert area is None


def test_fmc_canada_without_national_years_is_not_matched():
    # Without the national_years context the classifier cannot know — leaves it unmatched
    is_national, area, _ = classify_competition("FMC Canada 2025")
    assert not is_national
    assert area is None


def test_fmc_other_competitions_not_caught():
    # Only "FMC Canada YYYY" is the national FMC; other FMC comps must not match
    for name in ("FMC and What Calgary 2024", "FMC à Montréal 2025"):
        is_national, area, _ = classify_competition(name, national_years=_KNOWN_NATIONAL_YEARS)
        assert not is_national, f"Should not be national: {name!r}"
        assert area is None, f"Should not have area: {name!r}"


# ---------------------------------------------------------------------------
# Non-championship competitions should not match anything
# ---------------------------------------------------------------------------


@pytest.mark.parametrize(
    "name",
    [
        "Battle of Waterloo 2024",
        "Edmonton River Valley Rumble 2024",
        "FMC Canada 2024",
        "Canada's Best in the West 2024",
        "Halifax Fall 2023",
        "Montréal Open 2023",
    ],
)
def test_non_championships_not_matched(name):
    is_national, area, _ = classify_competition(name)
    assert not is_national, f"Should not be national: {name!r}"
    assert area is None, f"Should not have area: {name!r} (got {area!r})"
