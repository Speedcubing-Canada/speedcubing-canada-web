import re

from flask import Blueprint, jsonify, request
from google.cloud import ndb

from backend.lib.permissions import require_roles
from backend.models.user import Roles, User
from backend.models.wca.person import Person

bp = Blueprint("show_users", __name__)
client = ndb.Client()

WCA_ID = re.compile(r"^\d{4}[A-Z]{4}\d{2}$")
SORT_FIELDS = ("key", "name", "wca_person", "roles", "province")


@bp.route("/get_users")
@require_roles(*Roles.AdminRoles())
def get_users():
    page = max(request.args.get("page", 1, type=int), 1)
    per_page = request.args.get("per_page", 25, type=int)
    if per_page < 1:
        per_page = 25
    sort_field = request.args.get("sort_field", "name").strip('"')
    sort_order = request.args.get("sort_order", "asc").strip('"').lower()
    q = request.args.get("q", "", type=str).strip('"').strip()

    sort_field = {"id": "key", "wca_id": "wca_person"}.get(sort_field, sort_field)
    if sort_field not in SORT_FIELDS:
        sort_field = "name"
    prop = getattr(User, sort_field)
    order = [prop if sort_order == "asc" else -prop]

    query = User.query()
    if WCA_ID.match(q.upper()):
        query = query.filter(User.wca_person == ndb.Key(Person, q.upper()))
        order = []
    elif q:
        text = q.lower()
        query = query.filter(User.name_tokens >= text, User.name_tokens < text + "�")
        # Datastore requires the inequality property to sort first.
        order = [User.name_tokens, User.name]

    total = query.count()
    users = query.order(*order).fetch(per_page, offset=(page - 1) * per_page)
    return jsonify(
        {
            "data": [user.to_json() for user in users],
            "total": total,
            "pageInfo": {"hasPreviousPage": page > 1, "hasNextPage": page * per_page < total},
        },
    )


@bp.route("/reindex_users", methods=["POST"])
@require_roles(*Roles.AdminRoles())
def reindex_users():
    """Re-put every user so computed properties added after signup get indexed."""
    count = 0
    query = User.query().order(User.key)
    users = query.fetch(200)
    while users:
        ndb.put_multi(users)
        count += len(users)
        users = query.filter(User.key > users[-1].key).fetch(200)
    return jsonify({"data": {"users": count}})


@bp.route("/get_users_by_id")
@require_roles(*Roles.AdminRoles())
def get_users_by_id():
    raw_ids = request.args.get("ids", "[]", type=str).strip("[]").split(",")

    clean_ids = []
    for raw_uid in raw_ids:
        uid = raw_uid.strip()
        if not uid.isdigit():
            return jsonify({"error": f"Invalid user id: {uid}"}), 400
        clean_ids.append(int(uid))

    users = User.query(User.key.IN([ndb.Key(User, i) for i in clean_ids])).fetch()

    data = [user.to_json() for user in users]
    return jsonify({"data": data})
