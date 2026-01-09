from functools import wraps
from flask import jsonify

from backend.models.user import Roles


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
        from backend.lib import auth
        user = auth.user()
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function


def can_edit_location(user, editor):
    if not editor:
        return False
    return editor.has_any_of_given_roles(Roles.AdminRoles()) or user == editor


def can_view_user(user, viewer):
    if not viewer:
        return False
    return (user == viewer or
            viewer.has_any_of_given_roles(Roles.DelegateRoles()) or
            viewer.has_any_of_given_roles(Roles.AdminRoles()))


def can_view_roles(user, viewer):
    if not viewer:
        return False
    return (viewer.has_any_of_given_roles(Roles.DelegateRoles()) or
            viewer.has_any_of_given_roles(Roles.AdminRoles()))


def editable_roles(user, editor):
    if not editor:
        return []
    if editor.has_any_of_given_roles([Roles.GLOBAL_ADMIN]):
        return Roles.AllRoles()
    elif editor.has_any_of_given_roles([Roles.WEBMASTER, Roles.DIRECTOR]):
        return [Roles.WEBMASTER, Roles.DIRECTOR]
    else:
        return []
