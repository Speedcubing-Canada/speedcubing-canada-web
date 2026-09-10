import datetime

from flask import Blueprint, jsonify, request
from google.cloud import ndb

from backend.lib import auth, permissions
from backend.lib.permissions import require_auth
from backend.lib.residency import PROVINCE_CHANGE_WINDOW, most_recent_location_change_within_window
from backend.models.province import Province
from backend.models.user import User, UserLocationUpdate
from backend.models.wca.rank import RankAverage, RankSingle

bp = Blueprint("user", __name__)
client = ndb.Client()

_VALID_PROVINCE_IDS = {
    "",
    "na",
    "qc",
    "on",
    "mb",
    "sk",
    "ab",
    "bc",
    "nb",
    "pe",
    "nl",
    "ns",
    "yt",
    "nt",
    "nu",
}


@bp.route("/user_info", methods=["GET"])
@bp.route("/user_info/<user_id>", methods=["GET"])
@require_auth
def user_info(user_id=-1):
    me = auth.user()
    user = me if user_id == -1 else User.get_by_id(user_id)
    if not user:
        return jsonify({"error": f"Unrecognized user ID {user_id}"}), 404
    if not permissions.can_view_user(user, me):
        return jsonify({"error": "You're not authorized to view this user."}), 403
    return user.to_json()


# After updating the user's province, write the RankSingle and RankAverage to the
# datastore again to update their provinces.
def rewrite_ranks(wca_person):
    if not wca_person:
        return
    for rank_class in (RankSingle, RankAverage):
        ndb.put_multi(rank_class.query(rank_class.person == wca_person.key).fetch())


@bp.route("/edit", methods=["POST"])
@bp.route("/edit/<user_id>", methods=["POST"])
@require_auth
def edit(user_id=-1):
    me = auth.user()
    user = me if user_id == -1 else User.get_by_id(user_id)
    if not user:
        return jsonify({"error": f"Unrecognized user ID {user_id}"}), 404
    if not permissions.can_view_user(user, me):
        return jsonify({"error": "You're not authorized to view this user. So you can't edit their location either."}), 403

    province_id = request.json["province"]
    if province_id == "na":
        province_id = ""

    if province_id not in _VALID_PROVINCE_IDS:
        return jsonify({"error": f"Invalid province ID {province_id}"}), 400

    old_province_id = user.province.id() if user.province else ""
    changed_location = old_province_id != province_id
    user_modified = False

    if changed_location and not permissions.can_edit_location(user, me):
        return jsonify({"error": "You're not authorized to edit this user's location."}), 403

    # A member may only change their own province once per rolling year (to stop
    # gaming eligibility for more than one region's title). Admins editing another
    # user from the dashboard (user != me) aren't rate-limited.
    if changed_location and user.key == me.key:
        recent = most_recent_location_change_within_window(user, datetime.datetime.now())
        if recent is not None:
            next_allowed = recent.update_time + PROVINCE_CHANGE_WINDOW
            return jsonify(
                {
                    "error": "You can only change your province once per year.",
                    "code": "province_change_rate_limited",
                    "next_allowed": next_allowed.isoformat(),
                },
            ), 403

    if changed_location:
        if province_id:
            user.province = ndb.Key(Province, province_id)
        else:
            del user.province

        if user.wca_person:
            wca_person = user.wca_person.get()
            if wca_person:
                wca_person.province = user.province
                wca_person.put()
                rewrite_ranks(wca_person)

        # Log the historical tracking record
        update = UserLocationUpdate()
        update.updater = me.key
        update.update_time = datetime.datetime.now()
        if province_id:
            update.province = ndb.Key(Province, province_id)
        user.updates.append(update)

        user_modified = True

    if "roles" in request.json:
        for role in permissions.editable_roles(user, me):
            if role in request.json["roles"] and role not in user.roles:
                user.roles.append(role)
                user_modified = True
            elif role not in request.json["roles"] and role in user.roles:
                user.roles.remove(role)
                user_modified = True

    if user_modified:
        user.put()

    return user.to_json()
