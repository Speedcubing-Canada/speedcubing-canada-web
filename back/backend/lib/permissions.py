from backend.models.user import Roles


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
