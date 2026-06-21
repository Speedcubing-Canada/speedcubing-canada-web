import datetime

from flask import Blueprint, jsonify, request
from google.cloud import ndb

from backend.lib import auth, permissions
from backend.lib.permissions import require_auth
from backend.lib.residency import PROVINCE_CHANGE_WINDOW, recent_location_change
from backend.models.province import Province
from backend.models.user import User, UserLocationUpdate
from backend.models.wca.rank import RankAverage, RankSingle

bp = Blueprint("user", __name__)
client = ndb.Client()


@bp.route("/user_info", methods=["GET"])
@bp.route("/user_info/<user_id>", methods=["GET"])
@require_auth
def user_info(user_id=-1):
    me = auth.user()
    if user_id == -1:
        user = me
    else:
        user = User.get_by_id(user_id)
    if not user:
        return jsonify({"error": "Unrecognized user ID %s" % user_id}), 404
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
    if user_id == -1:
        user = me
    else:
        user = User.get_by_id(user_id)
    if not user:
        return jsonify({"error": "Unrecognized user ID %s" % user_id}), 404
    if not permissions.can_view_user(user, me):
        return jsonify({"error": "You're not authorized to view this user. So you can't edit their location either."}), 403

    province_id = request.json["province"]
    if province_id == "na":
        province_id = ""

    if province_id not in [
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
    ]:
        return jsonify({"error": "Invalid province ID %s" % province_id}), 400

    old_province_id = user.province.id() if user.province else ""
    changed_location = old_province_id != province_id
    user_modified = False
    if permissions.can_edit_location(user, me) and changed_location:
        # A member may only change their own province once per rolling year (to stop
        # gaming eligibility for more than one region's title). Admins editing another
        # user from the dashboard (user != me) bypass this.
        if user.key == me.key:
            recent = recent_location_change(user, datetime.datetime.now())
            if recent is not None:
                next_allowed = recent.update_time + PROVINCE_CHANGE_WINDOW
                return jsonify(
                    {
                        "error": "You can only change your province once per year.",
                        "code": "province_change_rate_limited",
                        "next_allowed": next_allowed.isoformat(),
                    }
                ), 403
        if province_id:
            user.province = ndb.Key(Province, province_id)
        else:
            del user.province
        if user.wca_person and old_province_id != province_id:
            wca_person = user.wca_person.get()
            if wca_person:
                wca_person.province = user.province
                wca_person.put()
            rewrite_ranks(wca_person)
        user_modified = True

        if changed_location:
            # Also save the Update.
            update = UserLocationUpdate()
            update.updater = me.key
            update.update_time = datetime.datetime.now()
            if province_id:
                update.province = ndb.Key(Province, province_id)
            user.updates.append(update)

    elif changed_location:
        return jsonify({"error": "You're not authorized to edit this user's location."}), 403

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
