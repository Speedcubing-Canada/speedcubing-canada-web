import { fetchCollection } from "./fetchCollection";

// Shape returned by the backend /delegates endpoint (handlers/delegates.py).
export interface Delegate {
  wca_id: string;
  name: string;
  gender: string | null; // "m" | "f" | "o"; drives gendered labels (French "déléguée")
  status: string; // regional_delegate | senior_delegate | delegate | junior_delegate | trainee_delegate
  province: string | null; // 2-letter id (qc, on, ...); null for regional delegates
  region_group: string | null;
  avatar_thumb_url: string | null;
}

export const fetchDelegates = (): Promise<Delegate[]> =>
  fetchCollection<Delegate>("/delegates", "delegates");
