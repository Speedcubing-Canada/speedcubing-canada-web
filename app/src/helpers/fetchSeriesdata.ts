import { LINKS } from "../pages/links";
import { CompetitionSeries } from "../types";
import { fetchCompetitionData } from "./fetchCompetitionData";

export const fetchSeriesData = async (seriesId: string) => {
  const response = await fetch(
    `${LINKS.WCA.API.COMPETITION_SERIES}${seriesId}`,
  );
  const seriesData: CompetitionSeries = await response.json();

  if (!response.ok) {
    throw new Error("Error in WCA response.");
  }

  const competitionData = await Promise.all(
    seriesData.competitionIds.map(fetchCompetitionData),
  );

  return competitionData;
};
