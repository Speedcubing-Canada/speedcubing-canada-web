import re

# Maps raw extracted area names (lowercased) to canonical province/region names.
# Covers French adjective forms, abbreviations, and "Canadian X" regional prefixes.
AREA_NAME_MAP: dict[str, str] = {
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
# Group 1 is the area, group 2 the quiet/PBQ marker (absent for a regular championship).
_REGIONAL_RES = (
    re.compile(r"Championnat\s+(.+?)\s+(?:(PBQ|Silencieux|FMC)\s+)?(\d{4})", re.IGNORECASE),
    re.compile(r"(.+?)\s+(?:(PBQ|Quiet|FMC)\s+)?Championship\s+(\d{4})", re.IGNORECASE),
)


def classify_competition(name: str, national_years: set[int] | None = None) -> tuple[bool, str | None, bool]:
    """Returns (is_national, area_name, is_pbq) for a competition name.

    area_name is the normalized province/region name for regional/provincial
    championships, or None for regular national championships.
    For FMC national championships area_name is "fmc".
    national_years: set of int years that have a national championship.
    """
    if _NATIONAL_RE.search(name):
        return True, None, False

    if national_years is not None:
        fmc_match = _FMC_CANADA_RE.match(name)
        if fmc_match and int(fmc_match.group(1)) in national_years:
            return True, "fmc", False

    for pattern in _REGIONAL_RES:
        match = pattern.match(name)
        if match:
            raw = match.group(1).strip()
            return False, AREA_NAME_MAP.get(raw.lower(), raw), match.group(2) is not None

    return False, None, False
