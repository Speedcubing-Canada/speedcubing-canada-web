import datetime

from backend.handlers.admin._list_utils import filter_and_sort as _filter_and_sort
from backend.handlers.admin._list_utils import paginate_records
from backend.lib.permissions import require_roles
from backend.load_db.setup_geography import setup_regions_and_provinces
from backend.load_db.update_champions import update_champions
from backend.load_db.update_championships import update_championships
from backend.models.championship import Championship
from backend.models.province import Province
from backend.models.region import Region
from backend.models.user import Roles
from backend.models.wca.competition import Competition
from flask import Blueprint, jsonify, request
from google.cloud import ndb

bp = Blueprint("edit_championships", __name__)
client = ndb.Client()

_SORT_FIELDS = ("id", "year", "type", "area", "competition_name")
_NATIONAL_TYPES = ("national", "national_fmc")
_VALID_TYPES = _NATIONAL_TYPES + ("regional", "provincial")


def _serialize_all(championships):
    """Serialize many championships with batched competition/region/province lookups."""
    competitions = ndb.get_multi([c.competition for c in championships])
    regions = {r.key: r for r in ndb.get_multi([c.region for c in championships if c.region]) if r}
    provinces = {p.key: p for p in ndb.get_multi([c.province for c in championships if c.province]) if p}
    return [
        c.to_json(regions=regions, provinces=provinces, competition=comp)
        for c, comp in zip(championships, competitions, strict=True)
    ]


def filter_and_sort(records, q, sort_field, sort_order):
    """Filter by competition-name substring then sort. Pure helper for testing."""
    return _filter_and_sort(
        records,
        q,
        sort_field,
        sort_order,
        search_field="competition_name",
        sort_fields=_SORT_FIELDS,
        default_sort_field="year",
    )


@bp.route("/get_championships")
@require_roles(*Roles.AdminRoles())
def get_championships():
    records = _serialize_all(list(Championship.query().iter()))
    return jsonify(paginate_records(records, filter_and_sort, default_sort_field="year", default_sort_order="desc"))


@bp.route("/get_championships_by_id")
@require_roles(*Roles.AdminRoles())
def get_championships_by_id():
    raw_ids = request.args.get("ids", "[]", type=str).strip("[]").split(",")
    ids = [i.strip().strip('"') for i in raw_ids if i.strip()]
    championships = [c for c in ndb.get_multi([ndb.Key(Championship, i) for i in ids]) if c]
    return jsonify({"data": _serialize_all(championships)})


@bp.route("/championship/<championship_id>")
@require_roles(*Roles.AdminRoles())
def get_championship(championship_id):
    championship = Championship.get_by_id(championship_id)
    if not championship:
        return jsonify({"error": "Championship not found"}), 404
    return jsonify(_serialize_all([championship])[0])


def _apply_fields(championship, data, competition):
    """Set a championship's editable fields from a react-admin payload."""
    champ_type = data.get("type")
    championship.competition = competition.key
    championship.national_championship = champ_type in _NATIONAL_TYPES
    championship.is_fmc = champ_type == "national_fmc" or bool(data.get("is_fmc"))
    championship.is_pbq = bool(data.get("is_pbq"))

    region = Region.get_by_id(data["region"]) if champ_type == "regional" and data.get("region") else None
    province = Province.get_by_id(data["province"]) if champ_type == "provincial" and data.get("province") else None
    championship.region = region.key if region else None
    championship.province = province.key if province else None

    deadline = data.get("residency_deadline")
    if deadline:
        # The frontend sends a UTC ISO string (``...Z``). ``residency_deadline`` is a
        # naive ``DateTimeProperty`` (presumed UTC, like the rest of the codebase), so
        # normalize to UTC and drop the tzinfo before storing.
        parsed = datetime.datetime.fromisoformat(deadline.replace("Z", "+00:00"))
        championship.residency_deadline = parsed.astimezone(datetime.timezone.utc).replace(tzinfo=None)
    else:
        championship.residency_deadline = None
    championship.residency_timezone = data.get("residency_timezone") or None


def _derive_id(data, competition):
    champ_type = data.get("type")
    year = competition.year
    is_pbq = bool(data.get("is_pbq"))
    if champ_type in _NATIONAL_TYPES:
        return Championship.nationals_id(year, champ_type == "national_fmc" or bool(data.get("is_fmc")))
    if champ_type == "regional":
        region = Region.get_by_id(data.get("region"))
        return Championship.regionals_id(year, region, is_pbq) if region else None
    if champ_type == "provincial":
        province = Province.get_by_id(data.get("province"))
        return Championship.province_championship_id(year, province, is_pbq) if province else None
    return None


@bp.route("/championships", methods=["POST"])
@require_roles(*Roles.AdminRoles())
def create_championship():
    data = request.get_json() or {}
    if data.get("type") not in _VALID_TYPES:
        return jsonify({"error": "Invalid championship type"}), 400
    competition = Competition.get_by_id(data.get("competition_id"))
    if not competition:
        return jsonify({"error": "Unknown competition"}), 400

    championship_id = _derive_id(data, competition)
    if not championship_id:
        return jsonify({"error": "Could not determine championship id (check type/region/province)"}), 400
    if Championship.get_by_id(championship_id):
        return jsonify({"error": f"Championship {championship_id} already exists"}), 409

    championship = Championship(id=championship_id)
    _apply_fields(championship, data, competition)
    championship.put()
    # Champion data is not updated automatically. Use the admin dashboard's recompute button after manual changes.
    return jsonify(_serialize_all([championship])[0])


@bp.route("/championships/<championship_id>", methods=["POST"])
@require_roles(*Roles.AdminRoles())
def update_championship(championship_id):
    championship = Championship.get_by_id(championship_id)
    if not championship:
        return jsonify({"error": "Championship not found"}), 404
    data = request.get_json() or {}
    if data.get("type") not in _VALID_TYPES:
        return jsonify({"error": "Invalid championship type"}), 400
    competition = Competition.get_by_id(data.get("competition_id"))
    if not competition:
        return jsonify({"error": "Unknown competition"}), 400

    new_id = _derive_id(data, competition)
    if not new_id:
        return jsonify({"error": "Could not determine championship id (check type/region/province)"}), 400
    if new_id != championship_id:
        return jsonify(
            {
                "error": f"This change requires a different championship ID ({new_id}). "
                "Delete this record and create a new one."
            }
        ), 400

    _apply_fields(championship, data, competition)
    championship.put()
    # Champion data is not updated automatically. Use the admin dashboard's recompute button after manual changes.
    return jsonify(_serialize_all([championship])[0])


@bp.route("/championships/<championship_id>", methods=["DELETE"])
@require_roles(*Roles.AdminRoles())
def delete_championship(championship_id):
    championship = Championship.get_by_id(championship_id)
    if not championship:
        return jsonify({"error": "Championship not found"}), 404
    championship.key.delete()
    # Champion data is not updated automatically. Use the admin dashboard's recompute button after manual changes.
    return jsonify({"data": {"id": championship_id}})


@bp.route("/recompute_championships", methods=["POST"])
@require_roles(*Roles.AdminRoles())
def recompute_championships():
    """Re-run the geography setup + championship/champion classification on demand.

    Mirrors the export pipeline's classification steps (load_db.py) so an admin can
    refresh championships from already-loaded competitions without redeploying or
    waiting for the next WCA export. require_roles already opens an ndb context.
    """
    setup_regions_and_provinces()
    update_championships()
    update_champions(recompute_all=True)
    championships = list(Championship.query().iter())
    return jsonify({"data": {"championships": len(championships)}})
