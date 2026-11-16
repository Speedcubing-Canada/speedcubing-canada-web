import { API_BASE_URL } from "../components/api";
import httpClient from "../httpClient";

// Shared GET-and-unwrap used by the simple public collection endpoints
// (delegates, directors, featured members, teams).
export const fetchCollection = async <T>(
  path: string,
  label: string,
): Promise<T[]> => {
  const res = await httpClient.get<T[]>(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(
      typeof res.error === "string" ? res.error : `Failed to load ${label}`,
    );
  }
  return res.data ?? [];
};
