from flask import Blueprint, jsonify, request
from google.cloud import ndb

from backend.lib.permissions import require_roles
from backend.models.team import Team, TeamMember
from backend.models.user import Roles

bp = Blueprint("edit_teams", __name__)

_SORT_FIELDS = ("id", "name_en", "position")


def _sort_key(field):
    def key(record):
        value = record.get(field)
        # Keep None values together and comparable against real values.
        return (value is None, value)

    return key


def filter_and_sort(records, q, sort_field, sort_order):
    """Filter by English-name substring then sort. Pure helper for testing."""
    if q:
        needle = q.lower()
        records = [r for r in records if needle in (r.get("name_en") or "").lower()]
    if sort_field not in _SORT_FIELDS:
        sort_field = "position"
    records = sorted(records, key=_sort_key(sort_field), reverse=(sort_order.lower() == "desc"))
    return records


def parse_members(raw_members):
    """Turn a react-admin ``members`` array into ``TeamMember`` records (skips empty rows)."""
    members = []
    for row in raw_members or []:
        name = (row.get("name") or "").strip()
        if not name:
            continue
        members.append(
            TeamMember(
                name=name,
                wca_id=(row.get("wca_id") or "").strip() or None,
                bio_en=(row.get("bio_en") or "").strip() or None,
                bio_fr=(row.get("bio_fr") or "").strip() or None,
                is_leader=bool(row.get("is_leader")),
            )
        )
    return members


def _apply_fields(team, data):
    """Set a team's editable fields from a react-admin payload."""
    team.name_en = (data.get("name_en") or "").strip() or None
    team.name_fr = (data.get("name_fr") or "").strip() or None
    team.description_en = (data.get("description_en") or "").strip() or None
    team.description_fr = (data.get("description_fr") or "").strip() or None
    team.position = int(data.get("position") or 0)
    team.members = parse_members(data.get("members"))


@bp.route("/get_teams")
@require_roles(*Roles.AdminRoles())
def get_teams():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 25, type=int)
    if page < 1:
        page = 1
    if per_page < 1:
        per_page = 25
    sort_field = request.args.get("sort_field", "position").strip('"')
    sort_order = request.args.get("sort_order", "asc").strip('"')
    q = request.args.get("q", "", type=str).strip('"')

    records = filter_and_sort([t.to_json() for t in Team.query().iter()], q, sort_field, sort_order)
    total = len(records)
    start = (page - 1) * per_page
    end = start + per_page
    return jsonify(
        {
            "data": records[start:end],
            "total": total,
            "pageInfo": {"hasPreviousPage": page > 1, "hasNextPage": end < total},
        }
    )


@bp.route("/get_teams_by_id")
@require_roles(*Roles.AdminRoles())
def get_teams_by_id():
    raw_ids = request.args.get("ids", "[]", type=str).strip("[]").split(",")
    ids = [i.strip().strip('"') for i in raw_ids if i.strip()]
    teams = [t for t in ndb.get_multi([ndb.Key(Team, i) for i in ids]) if t]
    return jsonify({"data": [t.to_json() for t in teams]})


@bp.route("/team/<team_id>")
@require_roles(*Roles.AdminRoles())
def get_team(team_id):
    team = Team.get_by_id(team_id)
    if not team:
        return jsonify({"error": "Team not found"}), 404
    return jsonify(team.to_json())


@bp.route("/teams", methods=["POST"])
@require_roles(*Roles.AdminRoles())
def create_team():
    data = request.get_json() or {}
    team_id = (data.get("id") or "").strip()
    if not team_id:
        return jsonify({"error": "An id (slug) is required"}), 400
    if Team.get_by_id(team_id):
        return jsonify({"error": f"Team {team_id} already exists"}), 409
    team = Team(id=team_id)
    _apply_fields(team, data)
    team.put()
    return jsonify(team.to_json())


@bp.route("/teams/<team_id>", methods=["POST"])
@require_roles(*Roles.AdminRoles())
def update_team(team_id):
    team = Team.get_by_id(team_id)
    if not team:
        return jsonify({"error": "Team not found"}), 404
    _apply_fields(team, request.get_json() or {})
    team.put()
    return jsonify(team.to_json())


@bp.route("/teams/<team_id>", methods=["DELETE"])
@require_roles(*Roles.AdminRoles())
def delete_team(team_id):
    team = Team.get_by_id(team_id)
    if not team:
        return jsonify({"error": "Team not found"}), 404
    team.key.delete()
    return jsonify({"data": {"id": team_id}})
