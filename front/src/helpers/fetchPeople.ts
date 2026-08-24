import { API_BASE_URL } from "../components/api";
import httpClient from "../httpClient";

// Shared shape returned by /directors and /featured_members (handlers/people.py).
export interface PersonRecord {
  id: string;
  name: string | null;
  wca_id: string | null; // drives the WCA avatar + profile link when present
  role_en: string | null; // board title, or "what they do/did for SCC"
  role_fr: string | null;
  bio_en: string | null;
  bio_fr: string | null;
  position: number;
  // Server-synced WCA avatar; "" = synced but default avatar, null = not yet
  // synced (card falls back to a client-side WCA fetch).
  avatar_thumb_url: string | null;
}

export type Director = PersonRecord;
export type FeaturedMember = PersonRecord;

const fetchPeople = async (
  path: string,
  label: string,
): Promise<PersonRecord[]> => {
  const res = await httpClient.get<PersonRecord[]>(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(
      typeof res.error === "string" ? res.error : `Failed to load ${label}`,
    );
  }
  return res.data ?? [];
};

export const fetchDirectors = (): Promise<Director[]> =>
  fetchPeople("/directors", "directors");

export const fetchFeaturedMembers = (): Promise<FeaturedMember[]> =>
  fetchPeople("/featured_members", "featured members");
