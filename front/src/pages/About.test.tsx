import { screen } from "@testing-library/react";
import { renderWithProviders, i18n } from "../test/renderWithProviders";
import { About } from "./About";

describe("About page", () => {
  it("renders the page heading", () => {
    renderWithProviders(<About />);

    expect(
      screen.getByRole("heading", { name: i18n.t("about.title") }),
    ).toBeInTheDocument();
  });
});
