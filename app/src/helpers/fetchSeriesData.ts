import { LINKS } from "../pages/links";
import { CompetitionSeries } from "../types";
import { fetchCompetitionData } from "./fetchCompetitionData";

export const fetchSeriesData = async (seriesId: string) => {
  const response = await fetch(
    `${LINKS.WCA.API.COMPETITION_SERIES}${seriesId}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch series data ${response.status} ${response.statusText}`,
    );
  }

  const seriesData: CompetitionSeries = await response.json();

  const competitionData = await Promise.all(
    seriesData.competitionIds.map(fetchCompetitionData),
  );

  return competitionData;
};
