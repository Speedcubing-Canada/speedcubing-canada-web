import { createContext } from "react";
import { User } from "../types";

// The logged-in admin, for forms that disable what the backend would reject.
export const AdminUserContext = createContext<User | null>(null);
