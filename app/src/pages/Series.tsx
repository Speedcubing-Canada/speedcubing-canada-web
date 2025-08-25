import { Box, Container, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { LINKS } from "./links";
import { CompetitionCard } from "../components/CompetitionCard";
import { CompetitionHeader } from "../components/CompetitionHeader";
import { LoadingPageLinear } from "../components/LoadingPageLinear";
import { useTranslation } from "react-i18next";
import { CompetitionSeries } from "../types";
import { isSpeedcubingCanadaCompetition } from "../helpers/competitionValidator";
import { useQuery } from "@tanstack/react-query";
import { fetchCompetitionData } from "../helpers/fetchCompetitionData";

const fetchSeriesData = async (seriesId: string) => {
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
export const Series = () => {
  const { t } = useTranslation();
  const { seriesid } = useParams();
  const navigate = useNavigate();

  const { isLoading, isError, data } = useQuery({
    queryKey: ["series", seriesid],
    enabled: !!seriesid,
    queryFn: () => fetchSeriesData(seriesid!),
  });

  if (isLoading) {
    return <LoadingPageLinear />;
  }

  const hasSCCOrganizer = data?.some((competition) =>
    isSpeedcubingCanadaCompetition(competition.compData),
  );

  if (isError || !data || !hasSCCOrganizer) {
    navigate("/", { replace: true });
    return;
  }

  const registrationOpenDates = data.map((competition) =>
    new Date(competition.compData.registration_open).getTime(),
  );

  const registrationCloseDates = data.map((competition) =>
    new Date(competition.compData.registration_close).getTime(),
  );

  const earliestRegistrationOpen = new Date(Math.min(...registrationOpenDates));
  const earliestRegistrationClose = new Date(
    Math.min(...registrationCloseDates),
  );

  const isRegistrationDifferent = !registrationOpenDates.every(
    (item: number) => item === registrationOpenDates[0],
  );

  return (
    <Container
      maxWidth="xl"
      style={{ textAlign: "center", display: "flex", flexDirection: "column" }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <CompetitionHeader
          name={data[0].wcif.series.name}
          registrationOpen={earliestRegistrationOpen}
          registrationClose={earliestRegistrationClose}
          doSeriesRegistrationsDiffer={isRegistrationDifferent}
          isSeries
        />
        <Box
          display="flex"
          justifyContent="center"
          flexWrap="wrap"
          marginTop="2rem"
        >
          {data.map(({ compData, wcif }) => (
            <CompetitionCard
              wcif={wcif}
              data={compData}
              key={compData.id}
              shouldShowName
            />
          ))}
        </Box>
      </Box>
      <Box minHeight="70px">
        <Typography gutterBottom>{t("competition.disclaimer")}</Typography>
      </Box>
    </Container>
  );
};
