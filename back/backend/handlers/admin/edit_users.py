from json import loads
import datetime
from flask import Blueprint, jsonify, request
from google.cloud import ndb

from backend.models.wca.person import Person
from backend.models.wca.rank import RankAverage, RankSingle
from backend.lib import permissions, auth
from backend.models.province import Province
from backend.models.user import User, UserLocationUpdate, Roles

bp = Blueprint('edit_users', __name__)
client = ndb.Client()


@bp.route('/get_users')
def get_users():
    with client.context():
        me = auth.user()
        if not me or not me.HasAnyRole(Roles.AdminRoles()):
            return jsonify({"error": "Forbidden"}), 403

        # Pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 30, type=int)
        cursor = request.args.get('cursor', None, type=str)
        if cursor:
            cursor = ndb.Cursor(urlsafe=cursor)
            print(cursor)
        if page < 1:
            page = 1
        if per_page not in [10, 20, 30, 40, 50]:
            per_page = 30

        # Sort
        sort_field = request.args.get('sort_field', 'name')
        sort_order = request.args.get('sort_order', 'asc')
        if sort_field not in ['name', 'wca_person', 'roles', 'province']:
            sort_field = 'name'
        if sort_order not in ['asc', 'desc']:
            sort_order = 'asc'

        # Filter
        filter_text = loads(request.args.get('filter', '')).get("q")
        print(filter_text)

        # Query
        if sort_order == 'asc':
            order_field = getattr(User, sort_field)
        else:
            order_field = -getattr(User, sort_field)
        if filter_text:
            text = filter_text.lower()
            limit = text[:-1] + chr(ord(text[-1]) + 1)
            users_to_show = User.query(
                ndb.OR(
                    ndb.AND(
                        User.name_lower >= text,
                        User.name_lower < limit,
                    ),
                    User.wca_person == ndb.Key(Person, filter_text)
                )).order("name_lower", order_field).fetch(per_page)
            has_more = False
        else:
            users_to_show, cursor, has_more = User.query(order_by=[order_field]).fetch_page(per_page,
                                                                                            start_cursor=cursor)

        print(users_to_show)
        # Calculate the total count of results
        total_results = len(users_to_show)

        # Set the Content-Range header
        headers = {
            'Content-Range': f'items 0-{total_results - 1}/{total_results}'
        }
        return jsonify({
            'data': [user.toJson() for user in users_to_show],
            'cursor': cursor.urlsafe().decode() if cursor else '',
            'pageInfo': {
                'hasPreviousPage': page > 1,
                'hasNextPage': has_more,
            }
        })


@bp.route('/get_users_by_id')
def get_users_by_id():
    with client.context():
        me = auth.user()
        if not me or not me.HasAnyRole(Roles.AdminRoles()):
            return jsonify({"error": "Forbidden"}), 403

        user_ids = request.args.get('ids', "[]", type=str).strip("[]").split(",")
        for user_id in user_ids:
            if not user_id.isdigit():
                return jsonify({"error": "Invalid user id: " + user_id}), 400
            else:
                user_id = int(user_id)
        users = User.query(User.key.IN([ndb.Key(User, user_id) for user_id in user_ids])).fetch()
        data = [user.toJson() for user in users]
        return jsonify(
            {'data': data}
        )


# After updating the user's province, write the RankSingle and RankAverage to the
# datastore again to update their provinces.
def RewriteRanks(wca_person):
    if not wca_person:
        return
    for rank_class in (RankSingle, RankAverage):
        ndb.put_multi(rank_class.query(rank_class.person == wca_person.key).fetch())


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
            return jsonify(
                {"error": "You're not authorized to view this user. So you can't edit their location either."}), 403

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
            if role in request.json["roles"] and role not in user.roles:
                user.roles.append(role)
                user_modified = True
            elif role not in request.json["roles"] and role in user.roles:
                user.roles.remove(role)
                user_modified = True

        if user_modified:
            user.put()

        return user.toJson()
