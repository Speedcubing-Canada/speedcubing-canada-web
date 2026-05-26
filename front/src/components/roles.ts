import { User, ROLES_DATA } from "../types";

export const roles = [...ROLES_DATA];

export const isAdmin = (user: User | null) => {
  return (
    user?.roles.includes("GLOBAL_ADMIN") ||
    user?.roles.includes("DIRECTOR") ||
    user?.roles.includes("WEBMASTER")
  );
};

export const isDelegateOrAdmin = (user: User | null) => {
  return (
    user?.roles.includes("SENIOR_DELEGATE") ||
    user?.roles.includes("DELEGATE") ||
    user?.roles.includes("CANDIDATE_DELEGATE") ||
    isAdmin(user)
  );
};
