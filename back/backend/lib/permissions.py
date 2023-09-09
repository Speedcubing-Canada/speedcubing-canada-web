from backend.models.user import Roles


def can_edit_location(user, editor):
    if not editor:
        return False
    if editor.HasAnyRole(Roles.AdminRoles()):
        return True
    return user == editor


def can_view_user(user, viewer):
    if not viewer:
        return False
    return (user == viewer or
            viewer.HasAnyRole(Roles.DelegateRoles()) or
            viewer.HasAnyRole(Roles.AdminRoles()))


def can_view_roles(user, viewer):
    if not viewer:
        return False
    return (viewer.HasAnyRole(Roles.DelegateRoles()) or
            viewer.HasAnyRole(Roles.AdminRoles()))


def editable_roles(user, editor):
    if not editor:
        return []
    if editor.HasAnyRole([Roles.GLOBAL_ADMIN]):
        return Roles.AllRoles()
    elif editor.HasAnyRole([Roles.WEBMASTER, Roles.DIRECTOR]):
        return [Roles.WEBMASTER, Roles.DIRECTOR]
    else:
        return []
