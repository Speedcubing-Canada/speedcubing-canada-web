import { fetchCollection } from "./fetchCollection";

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
  // "" = synced, default avatar; null = not yet synced (card falls back to a WCA fetch).
  avatar_thumb_url: string | null;
}

export type Director = PersonRecord;
export type FeaturedMember = PersonRecord;

export const fetchDirectors = (): Promise<Director[]> =>
  fetchCollection<PersonRecord>("/directors", "directors");

export const fetchFeaturedMembers = (): Promise<FeaturedMember[]> =>
  fetchCollection<PersonRecord>("/featured_members", "featured members");
