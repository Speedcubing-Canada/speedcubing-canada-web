from functools import wraps

from flask import jsonify
from google.cloud import ndb

from backend.models.team import Team
from backend.models.user import Roles

client = ndb.Client()


def require_roles(*roles):
    """Decorator to require specific user roles for accessing an endpoint.

    Usage:
        @require_roles(Roles.GLOBAL_ADMIN, Roles.WEBMASTER)
        def my_endpoint():
            ...
    """

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            with client.context():
                from backend.lib import auth

                user = auth.user()
                if not user:
                    return jsonify({"error": "Unauthorized"}), 401
                if not user.has_any_of_given_roles(list(roles)):
                    return jsonify({"error": "Forbidden"}), 403
                return f(*args, **kwargs)

        return decorated_function

    return decorator


def require_auth(f):
    """Decorator to require authentication (any logged-in user).

    Usage:
        @require_auth
        def my_endpoint():
            ...
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        with client.context():
            from backend.lib import auth

            user = auth.user()
            if not user:
                return jsonify({"error": "Unauthorized"}), 401
            return f(*args, **kwargs)

    return decorated_function


def can_access_user(user, viewer):
    if not viewer:
        return False
    return user == viewer or viewer.has_any_of_given_roles(Roles.SiteAdminRoles())


def editable_roles(editor):
    if not editor:
        return []
    if editor.has_any_of_given_roles([Roles.GLOBAL_ADMIN]):
        return [Roles.GLOBAL_ADMIN] + Roles.GrantableRoles()
    if editor.has_any_of_given_roles([Roles.WEBMASTER]):
        return Roles.GrantableRoles()
    return []


def _wca_id(user):
    return user.wca_person.id() if user.wca_person else None


def can_edit_team(user, team):
    return user.has_any_of_given_roles(Roles.SiteAdminRoles()) or team.is_led_by(_wca_id(user))


def led_team_ids(user):
    wca_id = _wca_id(user)
    return [t.key.id() for t in Team.query() if t.is_led_by(wca_id)] if wca_id else []
