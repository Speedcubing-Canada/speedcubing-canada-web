from flask import Blueprint, jsonify, request
from google.cloud import ndb

from backend.handlers.admin._list_utils import filter_and_sort as _filter_and_sort
from backend.handlers.admin._list_utils import paginate_records
from backend.lib.permissions import require_roles
from backend.models.team import Team, TeamMember
from backend.models.user import Roles

bp = Blueprint("edit_teams", __name__)

_SORT_FIELDS = ("id", "name_en", "position")


def filter_and_sort(records, q, sort_field, sort_order):
    """Filter by English-name substring then sort. Pure helper for testing."""
    return _filter_and_sort(
        records, q, sort_field, sort_order, search_field="name_en", sort_fields=_SORT_FIELDS, default_sort_field="position"
    )


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
    records = [t.to_json() for t in Team.query().iter()]
    return jsonify(paginate_records(records, filter_and_sort, default_sort_field="position"))


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
