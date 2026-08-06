from backend.models.delegate import Delegate
from flask import Blueprint, jsonify
from google.cloud import ndb

bp = Blueprint("delegates", __name__)
client = ndb.Client()


@bp.route("/delegates")
def list_delegates():
    """Public list of Canada-region WCA delegates (synced by load_db/update_delegates)."""
    with client.context():
        return jsonify([delegate.to_json() for delegate in Delegate.query().iter()])
