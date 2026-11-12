from flask import Blueprint, jsonify, request
from google.cloud import ndb

from backend.handlers.admin._list_utils import filter_and_sort as _filter_and_sort
from backend.handlers.admin._list_utils import paginate_records, parse_ids
from backend.lib import auth
from backend.lib.permissions import led_team_ids, require_auth, require_roles
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


def _team_scope():
    """None = every team; otherwise the ids of the teams the caller leads (may be empty)."""
    me = auth.user()
    return None if me.has_any_of_given_roles(Roles.SiteAdminRoles()) else set(led_team_ids(me))


def _forbidden():
    return jsonify({"error": "Forbidden"}), 403


@bp.route("/get_teams")
@require_auth
def get_teams():
    scope = _team_scope()
    if scope == set():
        return _forbidden()
    records = [t.to_json() for t in Team.query().iter() if scope is None or t.key.id() in scope]
    return jsonify(paginate_records(records, filter_and_sort, default_sort_field="position"))


@bp.route("/get_teams_by_id")
@require_auth
def get_teams_by_id():
    scope = _team_scope()
    ids = parse_ids()
    teams = [t for t in ndb.get_multi([ndb.Key(Team, i) for i in ids]) if t and (scope is None or t.key.id() in scope)]
    return jsonify({"data": [t.to_json() for t in teams]})


@bp.route("/team/<team_id>")
@require_auth
def get_team(team_id):
    scope = _team_scope()
    if scope is not None and team_id not in scope:
        return _forbidden()
    team = Team.get_by_id(team_id)
    if not team:
        return jsonify({"error": "Team not found"}), 404
    return jsonify(team.to_json())


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
    scope = _team_scope()
    if scope is not None and team_id not in scope:
        return _forbidden()
    team = Team.get_by_id(team_id)
    if not team:
        return jsonify({"error": "Team not found"}), 404
    data = request.get_json() or {}
    if scope is None:
        _apply_fields(team, data)
    else:
        # A leader edits the roster only; leadership itself is decided by site admins.
        leaders = {m.wca_id or m.name for m in team.members if m.is_leader}
        members = parse_members(data.get("members"))
        for member in members:
            member.is_leader = (member.wca_id or member.name) in leaders
        if {m.wca_id or m.name for m in members if m.is_leader} != leaders:
            return jsonify({"error": "Only a site admin can remove or change the team leader"}), 400
        team.members = members
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
