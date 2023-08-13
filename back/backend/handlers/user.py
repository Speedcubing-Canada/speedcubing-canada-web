import datetime

from flask import Blueprint, request, jsonify
from google.cloud import ndb

from backend.lib import permissions, auth
from backend.models.province import Province
from backend.models.user import User, UserLocationUpdate
from backend.models.wca.rank import RankAverage, RankSingle

bp = Blueprint('user', __name__)
client = ndb.Client()


# After updating the user's province, write the RankSingle and RankAverage to the
# datastore again to update their provinces.
def RewriteRanks(wca_person):
    if not wca_person:
        return
    for rank_class in (RankSingle, RankAverage):
        ndb.put_multi(rank_class.query(rank_class.person == wca_person.key).fetch())


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
        return jsonify({
            "id": user.key.id(),
            "name": user.name,
            "roles": user.roles,
            "dob": user.dob.isoformat() if user.dob else None,
            "province": user.province.id() if user.province else None,
            "wca_person": user.wca_person.id() if user.wca_person else None
        })


@bp.route('/edit', methods=['POST'])
@bp.route('/edit/<user_id>', methods=['POST'])
def edit(user_id=-1):
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
            return jsonify({"error": "You're not authorized to view this user. So you can't edit their location either."}), 403

        province_id = request.json['province']
        if province_id == 'na':
            province_id = ''

        old_province_id = user.province.id() if user.province else ''
        changed_location = old_province_id != province_id
        user_modified = False
        if permissions.CanEditLocation(user, me) and changed_location:
            if province_id:
                user.province = ndb.Key(Province, province_id)
            else:
                del user.province
            if user.wca_person and old_province_id != province_id:
                wca_person = user.wca_person.get()
                if wca_person:
                    wca_person.province = user.province
                    wca_person.put()
                RewriteRanks(wca_person)
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

        for role in permissions.EditableRoles(user, me):
            if role in request.json and role not in user.roles:
                user.roles.append(role)
                user_modified = True
            elif role not in request.json and role in user.roles:
                user.roles.remove(role)
                user_modified = True

        if user_modified:
            user.put()

        return jsonify({"success": True})