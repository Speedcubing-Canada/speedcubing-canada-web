from flask import Blueprint, jsonify, request
from google.cloud import ndb

from backend.handlers.admin._list_utils import filter_and_sort as _filter_and_sort
from backend.handlers.admin._list_utils import paginate_records, parse_ids
from backend.lib import auth
from backend.lib.permissions import can_edit_team, require_auth, require_roles
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
                # Do not normalize this field: empty string and None have distinct meanings
                avatar_thumb_url=row.get("avatar_thumb_url"),
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


def _apply_roster(team, data):
    """Replace a team's members while keeping its leaders; returns an error message or None."""
    leaders = {m.wca_id or m.name for m in team.members if m.is_leader}
    members = parse_members(data.get("members"))
    for member in members:
        member.is_leader = (member.wca_id or member.name) in leaders
    if {m.wca_id or m.name for m in members if m.is_leader} != leaders:
        return "Only a site admin can remove or change the team leader"
    team.members = members
    return None


def _editable_team(team_id):
    """The team if the caller may edit it, else an error response."""
    team = Team.get_by_id(team_id)
    if not team:
        return None, (jsonify({"error": "Team not found"}), 404)
    if not can_edit_team(auth.user(), team):
        return None, (jsonify({"error": "Forbidden"}), 403)
    return team, None


@bp.route("/get_teams")
@require_auth
def get_teams():
    me = auth.user()
    records = [t.to_json() for t in Team.query().iter() if can_edit_team(me, t)]
    return jsonify(paginate_records(records, filter_and_sort, default_sort_field="position"))


@bp.route("/get_teams_by_id")
@require_auth
def get_teams_by_id():
    me = auth.user()
    teams = ndb.get_multi([ndb.Key(Team, i) for i in parse_ids()])
    return jsonify({"data": [t.to_json() for t in teams if t and can_edit_team(me, t)]})


@bp.route("/team/<team_id>")
@require_auth
def get_team(team_id):
    team, error = _editable_team(team_id)
    return error or jsonify(team.to_json())


@bp.route("/teams", methods=["POST"])
@require_roles(*Roles.SiteAdminRoles())
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
@require_auth
def update_team(team_id):
    team, error = _editable_team(team_id)
    if error:
        return error
    data = request.get_json() or {}
    if auth.user().has_any_of_given_roles(Roles.SiteAdminRoles()):
        _apply_fields(team, data)
    elif message := _apply_roster(team, data):
        return jsonify({"error": message}), 400
    team.put()
    return jsonify(team.to_json())


@bp.route("/teams/<team_id>", methods=["DELETE"])
@require_roles(*Roles.SiteAdminRoles())
def delete_team(team_id):
    team = Team.get_by_id(team_id)
    if not team:
        return jsonify({"error": "Team not found"}), 404
    team.key.delete()
    return jsonify({"data": {"id": team_id}})
