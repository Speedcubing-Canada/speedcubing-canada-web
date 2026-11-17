import { fireEvent, render, screen } from "@testing-library/react";
import {
  Admin,
  Resource,
  TestMemoryRouter,
  testDataProvider,
} from "react-admin";
import { UserEdit } from "./UserEdit";
import { AdminUserContext } from "./AdminUserContext";
import { i18nProvider } from "../i18nProvider";
import { User } from "../types";

const dataProvider = testDataProvider({
  getOne: () =>
    Promise.resolve({ data: { id: "3", roles: [], province: "qc" } as never }),
});

const renderEdit = (...roles: string[]) =>
  render(
    <TestMemoryRouter initialEntries={["/Users/3"]}>
      <AdminUserContext.Provider value={{ roles } as User}>
        <Admin i18nProvider={i18nProvider} dataProvider={dataProvider}>
          <Resource name="Users" edit={UserEdit} />
        </Admin>
      </AdminUserContext.Provider>
    </TestMemoryRouter>,
  );

const disabledRoles = async () => {
  fireEvent.mouseDown(await screen.findByRole("combobox", { name: /role/i }));
  const options = await screen.findAllByRole("option");
  return options
    .filter((option) => option.getAttribute("aria-disabled") === "true")
    .map((option) => option.textContent);
};

describe("UserEdit role choices", () => {
  it("locks global admin and the synced delegate roles for a webmaster", async () => {
    renderEdit("WEBMASTER");
    expect(await disabledRoles()).toEqual([
      "Global Admin",
      "Senior Delegate",
      "Delegate",
      "Trainee Delegate",
    ]);
  });

  it("lets a global admin grant global admin", async () => {
    renderEdit("GLOBAL_ADMIN");
    expect(await disabledRoles()).toEqual([
      "Senior Delegate",
      "Delegate",
      "Trainee Delegate",
    ]);
  });
});
