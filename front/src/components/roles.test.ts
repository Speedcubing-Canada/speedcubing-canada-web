import {
  canAccessAdmin,
  canManageContent,
  canManageUsers,
  hasDelegateOrAdminRole,
  leadsTeams,
} from "./roles";
import { User } from "../types";

const user = (...roles: string[]) => ({ roles }) as User;
const leader = { roles: [], led_teams: ["software"] } as unknown as User;

describe("role predicates", () => {
  it("treats a missing user as having no rights", () => {
    expect(canManageUsers(null)).toBe(false);
    expect(canManageContent(null)).toBe(false);
    expect(leadsTeams(null)).toBe(false);
    expect(canAccessAdmin(null)).toBe(false);
    expect(hasDelegateOrAdminRole(null)).toBe(false);
  });

  it("limits private user data to global admins and webmasters", () => {
    expect(canManageUsers(user("GLOBAL_ADMIN"))).toBe(true);
    expect(canManageUsers(user("WEBMASTER"))).toBe(true);
    expect(canManageUsers(user("DIRECTOR"))).toBe(false);
    expect(canManageUsers(user("COMMS"))).toBe(false);
    expect(canManageUsers(leader)).toBe(false);
  });

  it("opens organization content to directors and comms as well", () => {
    expect(canManageContent(user("DIRECTOR"))).toBe(true);
    expect(canManageContent(user("COMMS"))).toBe(true);
    expect(canManageContent(user("WEBMASTER"))).toBe(true);
    expect(canManageContent(user("SENIOR_DELEGATE"))).toBe(false);
    expect(canManageContent(leader)).toBe(false);
  });

  it("lets a team leader into the admin section without a role", () => {
    expect(leadsTeams(leader)).toBe(true);
    expect(leadsTeams(user())).toBe(false);
    expect(canAccessAdmin(leader)).toBe(true);
    expect(canAccessAdmin(user("COMMS"))).toBe(true);
    expect(canAccessAdmin(user("DELEGATE"))).toBe(false);
  });

  it("covers every delegate rank and directors, but not comms", () => {
    for (const role of ["SENIOR_DELEGATE", "DELEGATE", "TRAINEE_DELEGATE"]) {
      expect(hasDelegateOrAdminRole(user(role))).toBe(true);
    }
    expect(hasDelegateOrAdminRole(user("DIRECTOR"))).toBe(true);
    expect(hasDelegateOrAdminRole(user("COMMS"))).toBe(false);
    expect(hasDelegateOrAdminRole(user())).toBe(false);
  });
});
