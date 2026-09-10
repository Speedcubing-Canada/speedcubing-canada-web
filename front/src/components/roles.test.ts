import { isAdmin, canUpdateProvinces, hasDelegateOrAdminRole } from "./roles";
import { User } from "../types";

const user = (...roles: string[]) => ({ roles }) as User;

describe("role predicates", () => {
  it("treats a missing user as having no rights", () => {
    expect(isAdmin(null)).toBe(false);
    expect(canUpdateProvinces(null)).toBe(false);
    expect(hasDelegateOrAdminRole(null)).toBe(false);
  });

  it("recognises the three admin roles but not delegates", () => {
    expect(isAdmin(user("GLOBAL_ADMIN"))).toBe(true);
    expect(isAdmin(user("DIRECTOR"))).toBe(true);
    expect(isAdmin(user("WEBMASTER"))).toBe(true);
    expect(isAdmin(user("SENIOR_DELEGATE"))).toBe(false);
    expect(isAdmin(user())).toBe(false);
  });

  it("limits province updates to global admins and webmasters", () => {
    expect(canUpdateProvinces(user("GLOBAL_ADMIN"))).toBe(true);
    expect(canUpdateProvinces(user("WEBMASTER"))).toBe(true);
    // A director is an admin elsewhere, but may not move people between provinces.
    expect(canUpdateProvinces(user("DIRECTOR"))).toBe(false);
  });

  it("covers admins and every delegate rank", () => {
    for (const role of ["SENIOR_DELEGATE", "DELEGATE", "CANDIDATE_DELEGATE"]) {
      expect(hasDelegateOrAdminRole(user(role))).toBe(true);
    }
    expect(hasDelegateOrAdminRole(user("DIRECTOR"))).toBe(true);
    expect(hasDelegateOrAdminRole(user())).toBe(false);
  });
});
