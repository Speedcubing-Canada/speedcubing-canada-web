import { API_BASE_URL } from "../components/api";
import httpClient from "../httpClient";

// Shape returned by the backend /teams endpoint (handlers/teams.py).
export interface TeamMember {
  name: string;
  wca_id: string | null; // drives the WCA avatar + profile link when present
  bio_en: string | null;
  bio_fr: string | null;
  is_leader: boolean;
  // Server-synced WCA avatar; "" = synced but default avatar, null = not yet
  // synced (card falls back to a client-side WCA fetch).
  avatar_thumb_url: string | null;
}

export interface Team {
  id: string;
  name_en: string | null;
  name_fr: string | null;
  description_en: string | null;
  description_fr: string | null;
  position: number;
  members: TeamMember[];
}

export const fetchTeams = async (): Promise<Team[]> => {
  const res = await httpClient.get<Team[]>(`${API_BASE_URL}/teams`);
  if (!res.ok) {
    throw new Error(
      typeof res.error === "string" ? res.error : "Failed to load teams",
    );
  }
  return res.data ?? [];
};
