import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../test/renderWithProviders";
import httpClient, { HttpResponse } from "../httpClient";
import { Championships } from "./Championships";

const OVERVIEW = [
  {
    id: "qc",
    name: "Quebec",
    championship_name: "Quebec",
    provinces: ["qc"],
    editions: [2026],
    announced: true,
    upcoming: {
      championship_id: "qc_2026_pbq",
      competition_id: "ChampionnatQCSilencieux2026",
      name: "Championnat Québécois Silencieux 2026",
      start_date: "2026-12-06",
      end_date: "2026-12-06",
      city: "Montréal",
      latitude: 45.5019,
      longitude: -73.5674,
      events: ["333fm"],
      wca_url: "https://worldcubeassociation.org",
      registration_open: null,
      registration_close: null,
      registration_status: null,
    },
  },
];

// The pin of an upcoming championship has the championship's name as its SVG title.
const pin = () => screen.queryByText(OVERVIEW[0].upcoming.name);

describe("Championships page", () => {
  beforeEach(() => {
    window.localStorage.clear();
    // jsdom has no SVG layout. The map measures its regions with getBBox on mount.
    (SVGElement.prototype as unknown as { getBBox: () => DOMRect }).getBBox =
      () => new DOMRect(0, 0, 10, 10);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a progress bar until the first overview arrives, then the pins", async () => {
    const { promise, resolve } = Promise.withResolvers<HttpResponse<unknown>>();
    vi.spyOn(httpClient, "get").mockReturnValue(promise);

    renderWithProviders(<Championships />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(pin()).not.toBeInTheDocument();

    resolve({ ok: true, status: 200, data: OVERVIEW });
    await waitFor(() => expect(pin()).toBeInTheDocument());
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("draws the map from the previous visit while the overview is loading", async () => {
    vi.spyOn(httpClient, "get").mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: OVERVIEW,
    });
    const firstVisit = renderWithProviders(<Championships />);
    await waitFor(() => expect(pin()).toBeInTheDocument());
    firstVisit.unmount();

    vi.spyOn(httpClient, "get").mockReturnValue(new Promise(() => {}));
    renderWithProviders(<Championships />);

    expect(pin()).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("keeps the map from the previous visit when the request fails", async () => {
    vi.spyOn(httpClient, "get").mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: OVERVIEW,
    });
    const firstVisit = renderWithProviders(<Championships />);
    await waitFor(() => expect(pin()).toBeInTheDocument());
    firstVisit.unmount();

    const failed = vi
      .spyOn(httpClient, "get")
      .mockResolvedValue({ ok: false, status: 0 });
    renderWithProviders(<Championships />);
    await waitFor(() => expect(failed).toHaveBeenCalled());

    expect(pin()).toBeInTheDocument();
  });
});
