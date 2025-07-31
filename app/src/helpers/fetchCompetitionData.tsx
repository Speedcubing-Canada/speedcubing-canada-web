import { LINKS } from "../pages/links";
import { Competition, Wcif } from "../types";

export const fetchCompetitionData = async (compId: string) => {
  const [compResponse, wcifResponse] = await Promise.all([
    fetch(`${LINKS.WCA.API.COMPETITION_INFO}${compId}`),
    fetch(`${LINKS.WCA.API.COMPETITION_INFO}${compId}/wcif/public`),
  ]);

  const compData: Competition = await compResponse.json();
  const wcifData: Wcif = await wcifResponse.json();

  return { compData, wcif: wcifData };
};
