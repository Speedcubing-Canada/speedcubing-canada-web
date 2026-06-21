import datetime

from flask import Blueprint, jsonify, request
from google.cloud import ndb

from backend.lib.permissions import require_roles
from backend.load_db.setup_geography import setup_regions_and_provinces
from backend.load_db.update_champions import update_champions
from backend.load_db.update_championships import update_championships
from backend.models.championship import Championship
from backend.models.province import Province
from backend.models.region import Region
from backend.models.user import Roles
from backend.models.wca.competition import Competition

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
        c.to_json(regions=regions, provinces=provinces, competition=comp) for c, comp in zip(championships, competitions)
    ]


def _sort_key(field):
    def key(record):
        value = record.get(field)
        # Keep None values together and comparable against real values.
        return (value is None, value)

    return key


def filter_and_sort(records, q, sort_field, sort_order):
    """Filter by competition-name substring then sort. Pure helper for testing."""
    if q:
        needle = q.lower()
        records = [r for r in records if needle in (r.get("competition_name") or "").lower()]
    if sort_field not in _SORT_FIELDS:
        sort_field = "year"
    records = sorted(records, key=_sort_key(sort_field), reverse=(sort_order.lower() == "desc"))
    return records


@bp.route("/get_championships")
@require_roles(*Roles.AdminRoles())
def get_championships():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 25, type=int)
    if page < 1:
        page = 1
    if per_page < 1:
        per_page = 25
    sort_field = request.args.get("sort_field", "year").strip('"')
    sort_order = request.args.get("sort_order", "desc").strip('"')
    q = request.args.get("q", "", type=str).strip('"')

    records = filter_and_sort(_serialize_all(list(Championship.query().iter())), q, sort_field, sort_order)

    total = len(records)
    start = (page - 1) * per_page
    end = start + per_page
    return jsonify(
        {
            "data": records[start:end],
            "total": total,
            "pageInfo": {
                "hasPreviousPage": page > 1,
                "hasNextPage": end < total,
            },
        }
    )


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
    championship.residency_deadline = datetime.datetime.fromisoformat(deadline.replace("Z", "+00:00")) if deadline else None
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
        return jsonify({"error": "Championship %s already exists" % championship_id}), 409

    championship = Championship(id=championship_id)
    _apply_fields(championship, data, competition)
    championship.put()
    # TODO: if we changed a championship we should recompute champions and eligibilities.
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

    _apply_fields(championship, data, competition)
    championship.put()
    # TODO: if we changed a championship we should recompute champions and eligibilities.
    return jsonify(_serialize_all([championship])[0])


@bp.route("/championships/<championship_id>", methods=["DELETE"])
@require_roles(*Roles.AdminRoles())
def delete_championship(championship_id):
    championship = Championship.get_by_id(championship_id)
    if not championship:
        return jsonify({"error": "Championship not found"}), 404
    championship.key.delete()
    # TODO: if we changed a championship we should recompute champions and eligibilities.
    return jsonify({"data": {"id": championship_id}})


@bp.route("/recompute_championships")
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
