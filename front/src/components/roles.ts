import { User, ROLES_DATA } from "../types";

export const roles = [...ROLES_DATA];

const hasRole = (user: User | null, ...checkRoles: string[]): boolean => {
  if (!user) {
    return false;
  }

  return user.roles.some((role) => checkRoles.includes(role));
};

// Private user data, championships, maintenance actions and every team.
export const canManageUsers = (user: User | null) =>
  hasRole(user, "GLOBAL_ADMIN", "WEBMASTER");

// The public organization page: directors and featured members.
export const canManageContent = (user: User | null) =>
  canManageUsers(user) || hasRole(user, "DIRECTOR", "COMMS");

export const leadsTeams = (user: User | null) =>
  (user?.led_teams?.length ?? 0) > 0;

export const canAccessAdmin = (user: User | null) =>
  canManageContent(user) || leadsTeams(user);

export const hasDelegateOrAdminRole = (user: User | null) =>
  canManageUsers(user) ||
  hasRole(user, "DIRECTOR", "SENIOR_DELEGATE", "DELEGATE", "TRAINEE_DELEGATE");
