import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test/renderWithProviders";
import { Home } from "./Home";

describe("Home page", () => {
  it("renders the logo and the language toggle", () => {
    renderWithProviders(<Home />, { route: "/en" });

    expect(screen.getByAltText("Speedcubing Canada")).toBeInTheDocument();
    // On the English page the toggle links to the French version.
    expect(screen.getByText("FR")).toBeInTheDocument();
  });

  it("toggles to English from the French page", () => {
    renderWithProviders(<Home />, { route: "/fr" });

    // On the French page the toggle links to the English version.
    expect(screen.getByText("EN")).toBeInTheDocument();
  });
});
