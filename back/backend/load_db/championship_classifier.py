"""Pure-Python logic for classifying competition names into championships.

Kept in its own module so it can be unit-tested without GCP dependencies.
"""

import re

# Maps raw extracted area names (lowercased) to canonical province/region names.
# Covers French adjective forms, abbreviations, and "Canadian X" regional prefixes.
AREA_NAME_MAP = {
    "québécois": "Quebec",
    "québécoise": "Quebec",
    "ontarien": "Ontario",
    "ontarienne": "Ontario",
    "bc": "British Columbia",
    "prairie": "Prairies",
    "canadian prairie": "Prairies",
    "canadian atlantic": "Atlantic",
    "canadian territories": "Territories",
}

# Matches true national championships only (not regional ones that contain "Canadian")
_NATIONAL_RE = re.compile(r"(Canadian\s+(Championship|Open)\b|Championnat\s+Canadien\b)", re.IGNORECASE)
# FMC national championship are only held on championship years, so it requires context
_FMC_CANADA_RE = re.compile(r"^FMC Canada (\d{4})$", re.IGNORECASE)
_PBQ_RE = re.compile(r"(.*?)\s+(PBQ|Quiet|FMC)\s+Championship\s+(\d{4})", re.IGNORECASE)
_FRENCH_RE = re.compile(r"Championnat\s+(.+?)\s+(\d{4})", re.IGNORECASE)
_ENGLISH_RE = re.compile(r"(.+?)\s+Championship\s+(\d{4})", re.IGNORECASE)


def classify_competition(name, national_years=None):
    """Returns (is_national, area_name, is_pbq) for a competition name.

    area_name is the normalized province/region name for regional/provincial
    championships, or None for regular national championships.
    For FMC national championships area_name is "fmc" — a signal to the caller
    to set is_fmc on the Championship entity and append "_fmc" to the ID.
    national_years: set of int years that have a national championship. When
    provided, "FMC Canada YYYY" is classified as national for years in the set.
    """
    if _NATIONAL_RE.search(name):
        return True, None, False

    if national_years is not None:
        fmc_match = _FMC_CANADA_RE.match(name)
        if fmc_match and int(fmc_match.group(1)) in national_years:
            return True, "fmc", False

    pbq_match = _PBQ_RE.match(name)
    if pbq_match:
        raw = pbq_match.group(1).strip()
        return False, AREA_NAME_MAP.get(raw.lower(), raw), True

    french_match = _FRENCH_RE.match(name)
    if french_match:
        raw = french_match.group(1).strip()
        return False, AREA_NAME_MAP.get(raw.lower(), raw), False

    english_match = _ENGLISH_RE.match(name)
    if english_match:
        raw = english_match.group(1).strip()
        return False, AREA_NAME_MAP.get(raw.lower(), raw), False

    return False, None, False
