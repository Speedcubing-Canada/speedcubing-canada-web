import { User, ROLES_DATA } from "../types";

export const roles = [...ROLES_DATA];

const hasRole = (user: User | null, ...checkRoles: string[]): boolean => {
  if (!user) {
    return false;
  }

  return user.roles.some((role) => checkRoles.includes(role));
};

export const isAdmin = (user: User | null) =>
  hasRole(user, "GLOBAL_ADMIN", "DIRECTOR", "WEBMASTER");

export const hasDelegateOrAdminRole = (user: User | null) =>
  isAdmin(user) ||
  hasRole(user, "SENIOR_DELEGATE", "DELEGATE", "CANDIDATE_DELEGATE");
