import { LINKS } from "../pages/links";

export interface WcaSearchResult {
  wca_id: string;
  name: string;
  location: string | null; // e.g. "Canada (Ontario)"; null when the API omits it
}

// Searches the WCA persons index by name (used by the admin WcaPersonSearchInput to look up
// a member's WCA ID). Returns [] on any failure so the autocomplete degrades gracefully.
export const searchWcaPersons = async (
  query: string,
): Promise<WcaSearchResult[]> => {
  const q = query.trim();
  if (q.length < 3) {
    return [];
  }
  try {
    const res = await fetch(
      `${LINKS.WCA.API.SEARCH_USERS}${encodeURIComponent(q)}`,
    );
    if (!res.ok) {
      return [];
    }
    const json = await res.json();
    return (json.result ?? [])
      .filter((r: { wca_id?: string }) => Boolean(r.wca_id))
      .map((r: { wca_id: string; name: string; location?: string | null }) => ({
        wca_id: r.wca_id,
        name: r.name,
        location: r.location ?? null,
      }));
  } catch {
    return [];
  }
};
