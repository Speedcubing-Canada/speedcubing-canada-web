import { User } from "../components/Types";

export const isAdmin = (user: User | null) => {
  return (
    user?.roles.includes("GLOBAL_ADMIN") ||
    user?.roles.includes("DIRECTOR") ||
    user?.roles.includes("WEBMASTER")
  );
};
