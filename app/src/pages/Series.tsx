import { Box, Container, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { LINKS } from "./links";
import { CompetitionCard } from "../components/CompetitionCard";
import { CompetitionHeader } from "../components/CompetitionHeader";
import { LoadingPageLinear } from "../components/LoadingPageLinear";
import { useTranslation } from "react-i18next";
import { competition, wcif } from "../types";
import { isSpeedcubingCanadaCompetition } from "../helpers/competitionValidator";

export const Series = () => {
  const { t } = useTranslation();
  const { seriesid } = useParams();

  const [competitionData, setCompetitionData] = useState<
    null | { data: competition; wcif: wcif }[]
  >(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async (seriesId: string) => {
      const response = await fetch(LINKS.WCA.API.COMPETITION_SERIES + seriesId);
      const seriesCompetitions = await response.json();

      if (!response.ok) {
        navigate("/", { replace: true });
      }

      const allData = await Promise.all(
        seriesCompetitions.competitionIds.map(async (key: string) => {
          const competitionData = await (
            await fetch(LINKS.WCA.API.COMPETITION_INFO + key)
          ).json();
          const wcifData = await (
            await fetch(LINKS.WCA.API.COMPETITION_INFO + key + "/wcif/public")
          ).json();
          return { data: competitionData, wcif: wcifData };
        }),
      );

      if (
        allData.length === 0 ||
        !isSpeedcubingCanadaCompetition(allData[0].data)
      ) {
        navigate("/", { replace: true });
      }

      setCompetitionData(allData);
    };
    getData(seriesid!);
  }, [navigate, seriesid]);

  if (!competitionData) {
    return <LoadingPageLinear />;
  }

  const registrationOpenDates = competitionData.map(
    (value: { data: competition }) =>
      new Date(value.data.registration_open).getTime(),
  );
  const registrationCloseDates = competitionData.map(
    (value: { data: competition }) =>
      new Date(value.data.registration_close).getTime(),
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
          name={competitionData[0].wcif.series.name}
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
          {competitionData.map(
            (competition: { data: competition; wcif: wcif }) => (
              <CompetitionCard
                {...competition}
                key={competition.data.id}
                shouldShowName
              />
            ),
          )}
        </Box>
      </Box>
      <Box minHeight="70px">
        <Typography gutterBottom>{t("competition.disclaimer")}</Typography>
      </Box>
    </Container>
  );
};
