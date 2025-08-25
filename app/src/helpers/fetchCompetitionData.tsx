import { LINKS } from "../pages/links";
import { Competition, Wcif } from "../types";

export const fetchCompetitionData = async (compId: string) => {
  const [compResponse, wcifResponse] = await Promise.all([
    fetch(`${LINKS.WCA.API.COMPETITION_INFO}${compId}`),
    fetch(`${LINKS.WCA.API.COMPETITION_INFO}${compId}/wcif/public`),
  ]);

  if (!compResponse.ok) {
    throw new Error(
      `Failed to fetch competition data: ${compResponse.status} ${compResponse.statusText}`,
    );
  }

  if (!wcifResponse.ok) {
    throw new Error(
      `Failed to fetch WCIF data: ${wcifResponse.status} ${wcifResponse.statusText}`,
    );
  }

  const compData: Competition = await compResponse.json();
  const wcifData: Wcif = await wcifResponse.json();

  return { compData, wcif: wcifData };
};
