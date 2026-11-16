import { formatLink, LINKS } from "../pages/links";
import { Competition, Wcif } from "../types";

export const fetchCompetitionData = async (
  compId: string,
): Promise<{ compData: Competition; wcif: Wcif }> => {
  const [compData, wcif] = await Promise.all([
    fetch(formatLink(LINKS.WCA.API.COMPETITION_INFO, { compId })).then(
      (response) => response.json(),
    ),
    fetch(formatLink(LINKS.WCA.API.COMPETITION_WCIF, { compId })).then(
      (response) => response.json(),
    ),
  ]);

  return { compData, wcif };
};
