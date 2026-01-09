import { Role, User } from "./Types";

export const roles: Role[] = [
  { id: "GLOBAL_ADMIN", name: "Global Admin" },
  { id: "DIRECTOR", name: "Director" },
  { id: "WEBMASTER", name: "Webmaster" },
  { id: "SENIOR_DELEGATE", name: "Senior Delegate" },
  { id: "DELEGATE", name: "Delegate" },
  { id: "CANDIDATE_DELEGATE", name: "Junior Delegate" },
];

export const isAdmin = (user: User | null) => {
  return (
    user?.roles.includes("GLOBAL_ADMIN") ||
    user?.roles.includes("DIRECTOR") ||
    user?.roles.includes("WEBMASTER")
  );
};
