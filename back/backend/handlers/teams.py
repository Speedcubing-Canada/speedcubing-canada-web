from backend.models.team import Team
from flask import Blueprint, jsonify
from google.cloud import ndb

bp = Blueprint("teams", __name__)
client = ndb.Client()


@bp.route("/teams")
def list_teams():
    """Public list of SCC teams and their members, ordered for display."""
    with client.context():
        return jsonify([team.to_json() for team in Team.query().order(Team.position).iter()])
