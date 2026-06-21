// Championship domain data + API fetchers.
// Region/province geography is static (matches the SVG map + backend Region/Province
// ids). The dynamic data — announced championships and past champions — is fetched
// from the backend (handlers/regional.py and handlers/champions_table.py).

import { API_BASE_URL } from "../api";
import httpClient from "../../httpClient";

export type RegionId = "bc" | "pr" | "on" | "qc" | "at" | "te";

// Province (2-letter id, matching PROVINCES_DATA in src/types.ts) -> SCC region.
export const PROVINCE_REGION: Record<string, RegionId> = {
  ab: "pr",
  bc: "bc",
  mb: "pr",
  nb: "at",
  nl: "at",
  nt: "te",
  ns: "at",
  nu: "te",
  on: "on",
  pe: "at",
  qc: "qc",
  sk: "pr",
  yt: "te",
};

export const REGION_ORDER: RegionId[] = ["bc", "pr", "on", "qc", "at", "te"];

export interface ChampEvent {
  id: string;
  name: string;
}

// Display order/names for the event picker. The backend champions route is the
// source of truth for which events actually have champions in a given edition.
export const EVENTS: ChampEvent[] = [
  { id: "333", name: "3x3x3" },
  { id: "222", name: "2x2x2" },
  { id: "444", name: "4x4x4" },
  { id: "555", name: "5x5x5" },
  { id: "666", name: "6x6x6" },
  { id: "777", name: "7x7x7" },
  { id: "333bf", name: "3x3 Blind" },
  { id: "333fm", name: "Fewest Moves" },
  { id: "333oh", name: "One-Handed" },
  { id: "clock", name: "Clock" },
  { id: "minx", name: "Megaminx" },
  { id: "pyram", name: "Pyraminx" },
  { id: "skewb", name: "Skewb" },
  { id: "sq1", name: "Square-1" },
  { id: "444bf", name: "4x4 Blind" },
  { id: "555bf", name: "5x5 Blind" },
  { id: "333mbf", name: "Multi-Blind" },
];

export type RegistrationStatus = "not_open" | "open" | "closed" | null;

export interface UpcomingChampionship {
  championship_id: string;
  competition_id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  city: string | null;
  events: string[];
  wca_url: string;
  registration_open: string | null;
  registration_close: string | null;
  registration_status: RegistrationStatus;
}

export interface RegionInfo {
  id: RegionId;
  name: string | null;
  championship_name: string | null;
  provinces: string[]; // lowercase province ids
  editions: number[]; // descending
  announced: boolean;
  upcoming: UpcomingChampionship | null;
}

// A region always exists on the static map, even before the backend overview
// loads or when it has no championship data for that region. This synthesises a
// "nothing announced, no past editions" RegionInfo from the static geography so a
// click never produces a blank panel.
export function fallbackRegion(id: RegionId): RegionInfo {
  return {
    id,
    name: null,
    championship_name: null,
    provinces: Object.keys(PROVINCE_REGION).filter(
      (p) => PROVINCE_REGION[p] === id,
    ),
    editions: [],
    announced: false,
    upcoming: null,
  };
}

export interface ChampionResult {
  wca_id: string | null;
  name: string | null;
  province: string | null; // lowercase province id, when known
  pos: number;
  best: number;
  average: number;
  single_record: string | null;
  average_record: string | null;
  result: string; // pre-formatted WCA time/result string
}

export interface EventChampions {
  event_id: string | null;
  event_name: string | null;
  event_rank: number;
  champions: ChampionResult[];
}

export async function fetchOverview(): Promise<RegionInfo[]> {
  const res = await httpClient.get<RegionInfo[]>(
    `${API_BASE_URL}/championships_overview`,
  );
  return res.ok && res.data ? res.data : [];
}

export async function fetchChampions(
  region: RegionId,
  year: number,
): Promise<EventChampions[]> {
  const res = await httpClient.get<EventChampions[]>(
    `${API_BASE_URL}/champions_by_region/${region}/${year}`,
  );
  return res.ok && res.data ? res.data : [];
}
