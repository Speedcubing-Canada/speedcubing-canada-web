import { User, ROLES_DATA } from "../types";

export const roles = [...ROLES_DATA];

const hasRole = (user: User | null, ...checkRoles: string[]): boolean => {
  if (!user) {
    return false;
  }

  return user.roles.some((role) => checkRoles.includes(role));
};

export const CONTENT_ROLES = ["GLOBAL_ADMIN", "WEBMASTER", "DIRECTOR", "COMMS"];

export const isSiteAdmin = (user: User | null) =>
  hasRole(user, "GLOBAL_ADMIN", "WEBMASTER");

export const canManageContent = (user: User | null) =>
  hasRole(user, ...CONTENT_ROLES);

export const leadsTeams = (user: User | null) =>
  (user?.led_teams?.length ?? 0) > 0;

export const canAccessAdmin = (user: User | null) =>
  canManageContent(user) || leadsTeams(user);

export const hasDelegateOrAdminRole = (user: User | null) =>
  isSiteAdmin(user) ||
  hasRole(user, "DIRECTOR", "SENIOR_DELEGATE", "DELEGATE", "TRAINEE_DELEGATE");
