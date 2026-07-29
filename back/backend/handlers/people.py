from flask import Blueprint, jsonify
from google.cloud import ndb

from backend.models.site_person import Director, FeaturedMember

bp = Blueprint("people", __name__)
client = ndb.Client()


@bp.route("/directors")
def list_directors():
    """Public list of SCC's Board of Directors, ordered for display."""
    with client.context():
        return jsonify([d.to_json() for d in Director.query().order(Director.position).iter()])


@bp.route("/featured_members")
def list_featured_members():
    """Public list of featured SCC members, ordered for display."""
    with client.context():
        return jsonify([m.to_json() for m in FeaturedMember.query().order(FeaturedMember.position).iter()])
