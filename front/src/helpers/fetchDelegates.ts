import { API_BASE_URL } from "../components/api";
import httpClient from "../httpClient";

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

export const fetchDelegates = async (): Promise<Delegate[]> => {
  const res = await httpClient.get<Delegate[]>(`${API_BASE_URL}/delegates`);
  if (!res.ok) {
    throw new Error(
      typeof res.error === "string" ? res.error : "Failed to load delegates",
    );
  }
  return res.data ?? [];
};
