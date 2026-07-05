import { screen } from "@testing-library/react";
import { renderWithProviders, i18n } from "../test/renderWithProviders";
import { FAQ } from "./FAQ";

describe("FAQ page", () => {
  it("renders the page heading", () => {
    renderWithProviders(<FAQ />);

    expect(
      screen.getByRole("heading", { name: i18n.t("faq.title") }),
    ).toBeInTheDocument();
  });
});
