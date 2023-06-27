import datetime

from backend.models.user import Roles

def CanEditLocation(user, editor):
  if not editor:
    return False
  if editor.HasAnyRole(Roles.AdminRoles()):
    return True
  return user == editor

def CanViewUser(user, viewer):
  if not viewer:
    return False
  return (user == viewer or
          viewer.HasAnyRole(Roles.DelegateRoles()) or
          viewer.HasAnyRole(Roles.AdminRoles()))

def CanViewRoles(user, viewer):
  if not viewer:
    return False
  return (viewer.HasAnyRole(Roles.DelegateRoles()) or
          viewer.HasAnyRole(Roles.AdminRoles()))

def EditableRoles(user, editor):
  if not editor:
    return []
  if editor.HasAnyRole([Roles.GLOBAL_ADMIN]):
    return Roles.AllRoles()
  elif editor.HasAnyRole([Roles.WEBMASTER, Roles.DIRECTOR]):
    return [Roles.WEBMASTER, Roles.DIRECTOR]
  else:
    return []
