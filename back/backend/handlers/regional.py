import datetime
import logging
from concurrent.futures import ThreadPoolExecutor

import requests
from flask import Blueprint, jsonify
from google.cloud import ndb

from backend.models.championship import Championship
from backend.models.province import Province
from backend.models.region import Region

logger = logging.getLogger(__name__)

bp = Blueprint("regional", __name__)
client = ndb.Client()

_WCA_COMPETITION_BASE_URL = "https://www.worldcubeassociation.org/api/v0/competitions"
# Timeout of the WCA API request that reads a competition's registration window.
# The championships overview does not respond until that request ends, and the
# registration window is only a detail of the page, so a slow WCA API is given up on.
_WCA_TIMEOUT_SECONDS = 8


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
    now = now or datetime.datetime.now(datetime.UTC)
    try:
        resp = requests.get(f"{_WCA_COMPETITION_BASE_URL}/{competition_id}", timeout=_WCA_TIMEOUT_SECONDS)
        if resp.status_code != 200:
            logger.warning("WCA competition fetch failed for %s: %s", competition_id, resp.status_code)
            return None
        data = resp.json()
    except (requests.RequestException, ValueError) as exc:
        logger.warning("WCA competition fetch error for %s: %s", competition_id, exc)
        return None

    reg_open = data.get("registration_open")
    reg_close = data.get("registration_close")
    return {
        "registration_open": reg_open,
        "registration_close": reg_close,
        "registration_status": registration_status(_parse_iso(reg_open), _parse_iso(reg_close), now),
    }


def add_registrations(upcoming_championships):
    """Fill in the registration window of each upcoming championship payload, in place.

    Each window costs one WCA API request. The requests run at the same time, so the
    caller waits for the slowest request and not for the sum of them. A payload for
    which ``fetch_registration`` returns ``None`` keeps its registration fields unchanged.

    ``fetch_registration`` runs in worker threads, which have no ndb context, so it
    must not read the datastore.
    """
    if not upcoming_championships:
        return
    with ThreadPoolExecutor(max_workers=len(upcoming_championships)) as pool:
        registrations = pool.map(fetch_registration, [u["competition_id"] for u in upcoming_championships])
        for upcoming, registration in zip(upcoming_championships, registrations, strict=True):
            if registration:
                upcoming.update(registration)


def _degrees(microdegrees):
    return None if microdegrees is None else microdegrees / 1_000_000


def display_region_key(championship, competition, province_region, region_province_count):
    """Return the region key a championship represents on the map, or ``None`` to skip.

    Regional championships map to their region. A provincial championship maps to its
    province's region only when that region has a single province (BC/ON/QC) - otherwise
    it is a sub-provincial championship within a multi-province region and is not the
    region's headline championship. Quiet (PBQ) championships map like regular ones.

    A national championship maps to the region of the province that hosts it, or to
    ``None`` when its competition or host province is unknown. The national FMC
    championship never appears: it is held in several cities at once.
    """
    if championship.national_championship:
        if championship.is_fmc or competition is None:
            return None
        return province_region.get(competition.province)
    if championship.region:
        return championship.region
    if championship.province:
        region_key = province_region.get(championship.province)
        if region_key is not None and region_province_count.get(region_key, 0) == 1:
            return region_key
    return None


def _upcoming_championship(entries, today):
    """Pick the nearest championship that has not ended from ``[(championship, competition)]``."""
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
        for championship, competition in zip(championships, competitions, strict=False):
            region_key = display_region_key(championship, competition, province_region, region_province_count)
            if region_key is not None:
                entries_by_region.setdefault(region_key, []).append((championship, competition))

        today = datetime.date.today()
        output = []
        for region in regions:
            entries = entries_by_region.get(region.key, [])
            # The frontend offers each year in ``editions`` as a past edition and loads
            # that year's regional champions. A championship that has not ended yet has
            # no champions. National champions are listed on the WCA website and are not
            # repeated on this page. Both kinds are left out, because either would show
            # as an edition with an empty champions list.
            editions = sorted(
                {comp.year for champ, comp in entries if comp and comp.end_date < today and not champ.national_championship},
                reverse=True,
            )

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
                    "latitude": _degrees(competition.latitude),
                    "longitude": _degrees(competition.longitude),
                    "events": [e.id() for e in competition.events],
                    "wca_url": competition.get_wca_link(),
                    "registration_open": None,
                    "registration_close": None,
                    "registration_status": None,
                }

            output.append(
                {
                    "id": region.key.id(),
                    "name": region.name,
                    "championship_name": region.championship_name,
                    "provinces": sorted(provinces_by_region.get(region.key, [])),
                    "editions": editions,
                    # ``announced`` repeats ``upcoming is not None``. The frontend no longer
                    # reads it. It stays for browser tabs still running an older frontend
                    # and can be removed after the next release.
                    "announced": upcoming_json is not None,
                    "upcoming": upcoming_json,
                },
            )

        add_registrations([region_json["upcoming"] for region_json in output if region_json["upcoming"]])
        return jsonify(output)
