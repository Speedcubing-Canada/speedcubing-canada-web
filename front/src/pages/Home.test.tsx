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
});
