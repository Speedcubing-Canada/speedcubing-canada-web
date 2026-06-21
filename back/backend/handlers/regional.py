import datetime
import logging

import requests
from flask import Blueprint, jsonify
from google.cloud import ndb

from backend.models.championship import Championship
from backend.models.province import Province
from backend.models.region import Region

bp = Blueprint("regional", __name__)
client = ndb.Client()

_WCA_COMPETITION_URL = "https://www.worldcubeassociation.org/api/v0/competitions/%s"


def _parse_iso(value):
    if not value:
        return None
    try:
        return datetime.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def registration_status(registration_open, registration_close, now):
    """Return ``not_open`` / ``open`` / ``closed`` / ``None`` for a registration window."""
    if registration_open is None and registration_close is None:
        return None
    if registration_open and now < registration_open:
        return "not_open"
    if registration_close and now >= registration_close:
        return "closed"
    return "open"


def fetch_registration(competition_id, now=None):
    """Fetch a competition's registration window from the WCA API.

    Returns ``{registration_open, registration_close, registration_status}`` (ISO
    strings, status derived from ``now``), or ``None`` if the WCA API can't be
    reached. Only called for the small set of upcoming championships.
    """
    now = now or datetime.datetime.now(datetime.timezone.utc)
    try:
        resp = requests.get(_WCA_COMPETITION_URL % competition_id, timeout=10)
        if resp.status_code != 200:
            logging.warning("WCA competition fetch failed for %s: %s", competition_id, resp.status_code)
            return None
        data = resp.json()
    except Exception as exc:  # noqa: BLE001 - degrade gracefully on any network/parse error
        logging.warning("WCA competition fetch error for %s: %s", competition_id, exc)
        return None

    reg_open = data.get("registration_open")
    reg_close = data.get("registration_close")
    return {
        "registration_open": reg_open,
        "registration_close": reg_close,
        "registration_status": registration_status(_parse_iso(reg_open), _parse_iso(reg_close), now),
    }


def display_region_key(championship, province_region, region_province_count):
    """Return the region key a championship represents on the map, or ``None`` to skip.

    Regional championships map to their region. A provincial championship maps to its
    province's region only when that region has a single province (BC/ON/QC) — otherwise
    it is a sub-provincial championship within a multi-province region and is not the
    region's headline championship. National and PBQ championships never appear.
    """
    if championship.national_championship or championship.is_pbq:
        return None
    if championship.region:
        return championship.region
    if championship.province:
        region_key = province_region.get(championship.province)
        if region_key is not None and region_province_count.get(region_key, 0) == 1:
            return region_key
    return None


def _upcoming_championship(entries, today):
    """Pick the nearest non-past regional championship from ``[(championship, competition)]``."""
    future = [(c, comp) for c, comp in entries if comp and comp.end_date >= today]
    if not future:
        return None
    return min(future, key=lambda pair: pair[1].start_date)


@bp.route("/championships_overview")
def championships_overview():
    with client.context():
        regions = [r for r in Region.query().iter() if not r.obsolete]

        provinces_by_region = {}
        province_region = {}
        for province in Province.query().iter():
            provinces_by_region.setdefault(province.region, []).append(province.key.id())
            province_region[province.key] = province.region

        region_province_count = {region_key: len(ids) for region_key, ids in provinces_by_region.items()}
        championships = list(Championship.query().iter())
        competitions = ndb.get_multi([c.competition for c in championships])
        entries_by_region = {}
        for championship, competition in zip(championships, competitions):
            region_key = display_region_key(championship, province_region, region_province_count)
            if region_key is not None:
                entries_by_region.setdefault(region_key, []).append((championship, competition))

        today = datetime.date.today()
        output = []
        for region in regions:
            entries = entries_by_region.get(region.key, [])
            # Past editions only — a championship that has not happened yet is surfaced
            # via ``upcoming``, not as a past edition to browse champions for.
            editions = sorted({comp.year for _, comp in entries if comp and comp.end_date < today}, reverse=True)

            upcoming = _upcoming_championship(entries, today)
            upcoming_json = None
            if upcoming:
                championship, competition = upcoming
                upcoming_json = {
                    "championship_id": championship.key.id(),
                    "competition_id": competition.key.id(),
                    "name": competition.name,
                    "start_date": competition.start_date.isoformat() if competition.start_date else None,
                    "end_date": competition.end_date.isoformat() if competition.end_date else None,
                    "city": competition.city_name,
                    "events": [e.id() for e in competition.events],
                    "wca_url": competition.get_wca_link(),
                    "registration_open": None,
                    "registration_close": None,
                    "registration_status": None,
                }
                registration = fetch_registration(competition.key.id())
                if registration:
                    upcoming_json.update(registration)

            output.append(
                {
                    "id": region.key.id(),
                    "name": region.name,
                    "championship_name": region.championship_name,
                    "provinces": sorted(provinces_by_region.get(region.key, [])),
                    "editions": editions,
                    "announced": upcoming_json is not None,
                    "upcoming": upcoming_json,
                }
            )

        return jsonify(output)
