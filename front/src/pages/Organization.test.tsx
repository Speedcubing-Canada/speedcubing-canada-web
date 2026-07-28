import { screen } from "@testing-library/react";
import { renderWithProviders, i18n } from "../test/renderWithProviders";
import { Organization } from "./Organization";

const { DIRECTORS, FEATURED, TEAMS } = vi.hoisted(() => ({
  DIRECTORS: [
    {
      id: "president",
      name: "Kristopher De Asis",
      wca_id: "2008ASIS01",
      role_en: "President",
      role_fr: "Président",
      bio_en: null,
      bio_fr: null,
      position: 0,
    },
  ],
  FEATURED: [
    {
      id: "jane",
      name: "Jane Doe",
      wca_id: null,
      role_en: "Founder",
      role_fr: "Fondatrice",
      bio_en: "Started it all.",
      bio_fr: "A tout démarré.",
      position: 0,
    },
  ],
  TEAMS: [
    {
      id: "software",
      name_en: "Software Team",
      name_fr: "Équipe logicielle",
      description_en: "We build the site.",
      description_fr: "On construit le site.",
      position: 0,
      members: [
        {
          name: "Alex Mutch",
          wca_id: "2014MUTC01",
          bio_en: null,
          bio_fr: null,
          is_leader: true,
        },
        {
          name: "Sam Smith",
          wca_id: null,
          bio_en: null,
          bio_fr: null,
          is_leader: false,
        },
      ],
    },
  ],
}));

vi.mock("../helpers/fetchWcaPerson", () => ({
  fetchWcaPerson: vi.fn().mockResolvedValue({
    avatarThumbUrl: "",
    avatarIsDefault: true,
  }),
}));

vi.mock("../helpers/fetchPeople", () => ({
  fetchDirectors: vi.fn().mockResolvedValue(DIRECTORS),
  fetchFeaturedMembers: vi.fn().mockResolvedValue(FEATURED),
}));

vi.mock("../helpers/fetchTeams", () => ({
  fetchTeams: vi.fn().mockResolvedValue(TEAMS),
}));

describe("Organization page", () => {
  it("renders the board, featured members and teams", async () => {
    renderWithProviders(<Organization />);

    // The page shows a loading state until the directors/teams queries resolve, so
    // wait for content before asserting the (always-present) heading.
    expect(await screen.findByText("Kristopher De Asis")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: i18n.t("organization.title") }),
    ).toBeInTheDocument();

    // Board (director from the DB, with its role as subtitle).
    expect(screen.getByText("President")).toBeInTheDocument();

    // Featured member with bio.
    expect(
      screen.getByRole("heading", { name: i18n.t("featuredMembers.title") }),
    ).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Started it all.")).toBeInTheDocument();

    // Team section: heading, team name, members, and the leader chip.
    expect(
      screen.getByRole("heading", { name: i18n.t("teams.title") }),
    ).toBeInTheDocument();
    expect(screen.getByText("Software Team")).toBeInTheDocument();
    expect(screen.getByText("Alex Mutch")).toBeInTheDocument();
    expect(screen.getByText("Sam Smith")).toBeInTheDocument();
    expect(screen.getByText(i18n.t("teams.leader"))).toBeInTheDocument();
  });
});
