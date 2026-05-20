import datetime
import logging

import requests
from flask import Blueprint, jsonify
from google.cloud import ndb

from backend.lib.permissions import require_roles
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

    result = []
    for championship, competition in zip(championships, competitions):
        if not competition:
            continue

        champ_type, area = _championship_type_and_area(championship)

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

    champ_type, area = _championship_type_and_area(championship)

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


def _championship_type_and_area(championship):
    if championship.national_championship:
        champ_type = "national_fmc" if championship.is_fmc else "national"
        return champ_type, None

    if championship.region:
        region = championship.region.get()
        return "regional", region.championship_name if region else None

    if championship.province:
        province = championship.province.get()
        return "provincial", province.name if province else None

    return "unknown", None


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
            "url": f"https://worldcubeassociation.org/persons/{p['wca_id']}",
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
            province = _province_at_deadline(user, residency_deadline)
            eligible = bool(province and province in valid_province_keys)

        competitors.append(
            {
                "name": p["name"],
                "wca_id": p["wca_id"],
                "url": f"https://worldcubeassociation.org/persons/{p['wca_id']}",
                "eligible": eligible,
                "events": p["events"],
            }
        )
    return competitors


def _province_at_deadline(user, deadline):
    """Return the user's province key that was current at the deadline."""
    if not user.updates:
        return user.province

    province = None
    for update in user.updates:
        if update.update_time < deadline:
            province = update.province
    return province
