import { Role, User, ROLES_DATA } from "./types";

export const roles = ROLES_DATA as unknown as Role[];

export const isAdmin = (user: User | null) => {
  return (
    user?.roles.includes("GLOBAL_ADMIN") ||
    user?.roles.includes("DIRECTOR") ||
    user?.roles.includes("WEBMASTER")
  );
};
