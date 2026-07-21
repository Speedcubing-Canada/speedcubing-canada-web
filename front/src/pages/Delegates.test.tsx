import { screen } from "@testing-library/react";
import { renderWithProviders, i18n } from "../test/renderWithProviders";
import { Delegates } from "./Delegates";

const { SAMPLE } = vi.hoisted(() => ({
  SAMPLE: [
    {
      wca_id: "2008ASIS01",
      name: "Kristopher De Asis",
      gender: "m",
      status: "regional_delegate",
      province: null,
      region_group: "Canada (West)",
      avatar_thumb_url: null,
    },
    {
      wca_id: "2017ONDE01",
      name: "Alexandre Ondet",
      gender: "m",
      status: "delegate",
      province: "qc",
      region_group: "Canada (East)",
      avatar_thumb_url: null,
    },
    {
      wca_id: "2017YANG62",
      name: "Marco Yang",
      gender: "m",
      status: "junior_delegate",
      province: "on",
      region_group: "Canada (East)",
      avatar_thumb_url: null,
    },
  ],
}));

vi.mock("../helpers/fetchDelegates", () => ({
  fetchDelegates: vi.fn().mockResolvedValue(SAMPLE),
}));

describe("Delegates page", () => {
  it("renders the regional section, per-region groups and rank chips", async () => {
    renderWithProviders(<Delegates />);

    // Every delegate renders (async — waits for the query to resolve).
    expect(await screen.findByText("Kristopher De Asis")).toBeInTheDocument();
    expect(screen.getByText("Alexandre Ondet")).toBeInTheDocument();
    expect(screen.getByText("Marco Yang")).toBeInTheDocument();

    // Regional delegates get their own priority section...
    expect(
      screen.getByRole("heading", { name: i18n.t("delegates.regional") }),
    ).toBeInTheDocument();
    // ...and the others are grouped by region.
    expect(
      screen.getByRole("heading", {
        name: i18n.t("championships.regions.qc"),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: i18n.t("championships.regions.on"),
      }),
    ).toBeInTheDocument();

    // Rank chips differentiate status.
    expect(
      screen.getByText(i18n.t("delegates.status.regional")),
    ).toBeInTheDocument();
    expect(
      screen.getByText(i18n.t("delegates.status.junior")),
    ).toBeInTheDocument();
  });
});
