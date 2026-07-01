import datetime
import logging

import requests
from flask import Blueprint, jsonify
from google.cloud import ndb

from backend.lib.permissions import require_roles
from backend.lib.residency import resolve_residency
from backend.models.championship import Championship
from backend.models.user import Roles, User

bp = Blueprint("championship_eligibility", __name__)
client = ndb.Client()

_DELEGATE_AND_ADMIN_ROLES = (
    Roles.GLOBAL_ADMIN,
    Roles.DIRECTOR,
    Roles.WEBMASTER,
    Roles.SENIOR_DELEGATE,
    Roles.DELEGATE,
    Roles.CANDIDATE_DELEGATE,
)


@bp.route("/championships")
@require_roles(*_DELEGATE_AND_ADMIN_ROLES)
def list_championships():
    championships = list(Championship.query().iter())
    competitions = ndb.get_multi([c.competition for c in championships])

    region_keys = [c.region for c in championships if c.region]
    province_keys = [c.province for c in championships if c.province]
    regions = {r.key: r for r in ndb.get_multi(region_keys) if r}
    provinces = {p.key: p for p in ndb.get_multi(province_keys) if p}

    result = []
    for championship, competition in zip(championships, competitions):
        if not competition:
            continue

        champ_type, area = championship.type_and_area(regions, provinces)

        result.append(
            {
                "id": championship.key.id(),
                "competition_name": competition.name,
                "competition_id": competition.key.id(),
                "year": competition.year,
                "start_date": competition.start_date.isoformat() if competition.start_date else None,
                "type": champ_type,
                "area": area,
                "is_pbq": bool(championship.is_pbq),
            }
        )

    result.sort(key=lambda x: (-x["year"], x["competition_name"]))
    return jsonify(result)


@bp.route("/championship_eligibility/<championship_id>")
@require_roles(*_DELEGATE_AND_ADMIN_ROLES)
def championship_eligibility(championship_id):
    championship = Championship.get_by_id(championship_id)
    if not championship:
        return jsonify({"error": "Championship not found"}), 404

    competition = championship.competition.get()
    if not competition:
        return jsonify({"error": "Competition not found"}), 404

    wcif_url = f"https://api.worldcubeassociation.org/competitions/{competition.key.id()}/wcif/public"
    try:
        resp = requests.get(wcif_url, timeout=15)
        if resp.status_code != 200:
            logging.error("WCIF fetch failed for %s: %s", competition.key.id(), resp.status_code)
            return jsonify({"error": f"Failed to fetch WCIF (HTTP {resp.status_code})"}), 502
        wcif = resp.json()
    except Exception as exc:
        logging.error("WCIF fetch error for %s: %s", competition.key.id(), exc)
        return jsonify({"error": "Failed to fetch competition data from WCA"}), 502

    registered = _parse_registrations(wcif)

    if championship.national_championship:
        competitors = _eligibility_national(registered)
    else:
        competitors = _eligibility_regional_or_provincial(championship, competition, registered)

    champ_type, area = championship.type_and_area()

    return jsonify(
        {
            "championship_id": championship_id,
            "competition_name": competition.name,
            "competition_id": competition.key.id(),
            "year": competition.year,
            "type": champ_type,
            "area": area,
            "is_pbq": bool(championship.is_pbq),
            "competitors": competitors,
        }
    )


def _parse_registrations(wcif):
    """Return list of dicts for accepted registrants."""
    registered = []
    for person in wcif.get("persons", []):
        reg = person.get("registration")
        if not reg or reg.get("status") != "accepted":
            continue
        wca_id = person.get("wcaId")
        if not wca_id:
            continue
        registered.append(
            {
                "wca_id": wca_id,
                "name": person.get("name", ""),
                "wca_user_id": person.get("wcaUserId"),
                "events": reg.get("eventIds", []),
                "country_iso2": person.get("countryIso2", ""),
            }
        )
    return registered


def _eligibility_national(registered):
    return [
        {
            "name": p["name"],
            "wca_id": p["wca_id"],
            "eligible": p["country_iso2"] == "CA",
            "events": p["events"],
        }
        for p in registered
    ]


def _eligibility_regional_or_provincial(championship, competition, registered):
    valid_province_keys = championship.get_eligible_province_keys()
    residency_deadline = championship.residency_deadline or datetime.datetime.combine(
        competition.start_date, datetime.time(0, 0, 0)
    )

    wca_user_ids = [p["wca_user_id"] for p in registered if p["wca_user_id"]]
    user_keys = [ndb.Key(User, str(uid)) for uid in wca_user_ids]
    users = ndb.get_multi(user_keys)
    user_by_wca_user_id = {u.key.id(): u for u in users if u is not None}

    competitors = []
    for p in registered:
        user = user_by_wca_user_id.get(str(p["wca_user_id"]))
        if user is None:
            eligible = None
        else:
            province = resolve_residency(user, residency_deadline)
            eligible = bool(province and province in valid_province_keys)

        competitors.append(
            {
                "name": p["name"],
                "wca_id": p["wca_id"],
                "eligible": eligible,
                "events": p["events"],
            }
        )
    return competitors
