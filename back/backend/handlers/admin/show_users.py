from json import loads
from flask import Blueprint, jsonify, request
from google.cloud import ndb

from backend.models.wca.person import Person
from backend.lib.permissions import require_roles
from backend.models.user import User, Roles

bp = Blueprint("show_users", __name__)
client = ndb.Client()


@bp.route("/get_users")
@require_roles(*Roles.AdminRoles())
def get_users():
    # Pagination
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 30, type=int)
    cursor = request.args.get("cursor", None, type=str)
    if cursor:
        cursor = ndb.Cursor(urlsafe=cursor)
    if page < 1:
        page = 1
    if per_page not in (5, 10, 25, 50):
        per_page = 25

    # Sort
    sort_field = request.args.get("sort_field", "name")
    sort_order = request.args.get("sort_order", "asc")
    if sort_field not in ("id", "name", "wca_person", "roles", "province"):
        sort_field = "name"
    if sort_order.lower() not in ("asc", "desc"):
        sort_order = "asc"

    # Filter
    filter_text = loads(request.args.get("filter", "{}")).get("q")

    # Query
    order_field = getattr(User, sort_field) if sort_order == "asc" else -getattr(User, sort_field)
    if filter_text:
        text = filter_text.lower()
        limit = text[:-1] + chr(ord(text[-1]) + 1)
        users_to_show = (
            User.query(
                ndb.OR(
                    ndb.AND(
                        User.name_lower >= text,
                        User.name_lower < limit,
                    ),
                    User.wca_person == ndb.Key(Person, filter_text),
                )
            )
            .order("name_lower", order_field)
            .fetch(per_page)
        )
        has_more = False
    else:
        users_to_show, cursor, has_more = User.query(order_by=[order_field]).fetch_page(per_page, start_cursor=cursor)
    return jsonify(
        {
            "data": [user.to_json() for user in users_to_show],
            "cursor": cursor.urlsafe().decode() if cursor else "",
            "pageInfo": {
                "hasPreviousPage": page > 1,
                "hasNextPage": has_more,
            },
        }
    )


@bp.route("/get_users_by_id")
@require_roles(*Roles.AdminRoles())
def get_users_by_id():
    raw_ids = request.args.get("ids", "[]", type=str).strip("[]").split(",")

    clean_ids = []
    for uid in raw_ids:
        uid = uid.strip()
        if not uid.isdigit():
            return jsonify({"error": f"Invalid user id: {uid}"}), 400
        clean_ids.append(int(uid))

    users = User.query(User.key.IN([ndb.Key(User, i) for i in clean_ids])).fetch()

    data = [user.to_json() for user in users]
    return jsonify({"data": data})
