from flask import Blueprint, jsonify
from google.cloud import ndb

from backend.lib import permissions, auth
from backend.models.user import User
bp = Blueprint('user', __name__)
client = ndb.Client()


@bp.route('/user_info', methods=['GET'])
@bp.route('/user_info/<user_id>', methods=['GET'])
def user_info(user_id=-1):
    with client.context():
        me = auth.user()
        if not me:
            return jsonify({"error": "Unauthorized"}), 401
        if user_id == -1:
            user = me
        else:
            user = User.get_by_id(user_id)
        if not user:
            return jsonify({"error": "Unrecognized user ID %s" % user_id}), 404
        if not permissions.CanViewUser(user, me):
            return jsonify({"error": "You're not authorized to view this user."}), 403
        return user.toJson()
