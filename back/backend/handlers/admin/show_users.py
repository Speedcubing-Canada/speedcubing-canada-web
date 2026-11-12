import re

from flask import Blueprint, jsonify
from google.cloud import ndb

from backend.handlers.admin._list_utils import list_envelope, parse_ids, parse_list_params
from backend.lib.permissions import require_roles
from backend.models.user import Roles, User
from backend.models.wca.person import Person

bp = Blueprint("show_users", __name__)
client = ndb.Client()

WCA_ID = re.compile(r"^\d{4}[A-Z]{4}\d{2}$")
# Datastore drops entities lacking a sort property, so sparse ones (roles, wca_person) are not sortable.
SORT_FIELDS = ("key", "name")


def _search(q):
    """All users matching an exact WCA ID or a word prefix for each word of q, sorted by name."""
    if WCA_ID.match(q.upper()):
        return User.query(User.wca_person == ndb.Key(Person, q.upper())).fetch()
    words = q.lower().split()
    # Datastore can prefix-match a single token; the remaining words are checked in Python.
    query = User.query(User.name_tokens >= words[0], User.name_tokens < words[0] + "\ufffd")
    users = [u for u in query.fetch() if all(any(t.startswith(w) for t in u.name_tokens) for w in words[1:])]
    return sorted(users, key=lambda u: u.name)


@bp.route("/get_users")
@require_roles(*Roles.SiteAdminRoles())
def get_users():
    page, per_page, sort_field, sort_order, q = parse_list_params("name")
    start = (page - 1) * per_page

    if q:
        users = _search(q)
        total = len(users)
        users = users[start : start + per_page]
    else:
        sort_field = {"id": "key"}.get(sort_field, sort_field)
        prop = getattr(User, sort_field if sort_field in SORT_FIELDS else "name")
        query = User.query()
        total = query.count()
        users = query.order(-prop if sort_order == "desc" else prop).fetch(per_page, offset=start)

    return jsonify(list_envelope([user.to_json() for user in users], total, page, per_page))


@bp.route("/reindex_users", methods=["POST"])
@require_roles(*Roles.SiteAdminRoles())
def reindex_users():
    """Re-put every user so computed properties added after signup get indexed."""
    users = User.query().fetch()
    ndb.put_multi(users)
    return jsonify({"data": {"users": len(users)}})


@bp.route("/get_users_by_id")
@require_roles(*Roles.SiteAdminRoles())
def get_users_by_id():
    ids = parse_ids()
    users = [u for u in ndb.get_multi([ndb.Key(User, i) for i in ids]) if u]
    return jsonify({"data": [u.to_json() for u in users]})
