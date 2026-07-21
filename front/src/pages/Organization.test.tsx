import { screen } from "@testing-library/react";
import { renderWithProviders, i18n } from "../test/renderWithProviders";
import { Organization, DIRECTORS } from "./Organization";

vi.mock("../helpers/fetchWcaPerson", () => ({
  fetchWcaPerson: vi.fn().mockResolvedValue({
    avatarThumbUrl: "",
    avatarIsDefault: true,
  }),
}));

describe("Organization page", () => {
  it("renders the heading and every listed director", () => {
    renderWithProviders(<Organization />);

    expect(
      screen.getByRole("heading", { name: i18n.t("organization.title") }),
    ).toBeInTheDocument();
    DIRECTORS.forEach(({ name }) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });
});
