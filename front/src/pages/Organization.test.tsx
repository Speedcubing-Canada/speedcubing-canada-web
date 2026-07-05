import { screen } from "@testing-library/react";
import { renderWithProviders, i18n } from "../test/renderWithProviders";
import { Organization } from "./Organization";

describe("Organization page", () => {
  it("renders the heading and a listed director", () => {
    renderWithProviders(<Organization />);

    expect(
      screen.getByRole("heading", { name: i18n.t("organization.title") }),
    ).toBeInTheDocument();
    expect(screen.getByText("Kristopher De Asis")).toBeInTheDocument();
  });
});
