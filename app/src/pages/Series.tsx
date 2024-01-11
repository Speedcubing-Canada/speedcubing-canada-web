import { Box, Container, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { LINKS } from "./links";
import { CompetitionCard } from "../components/CompetitionCard";
import { CompetitionHeader } from "../components/CompetitionHeader";
import { PageNotFound } from "../components/PageNotFound";
import { LoadingPageLinear } from "../components/LoadingPageLinear";
import { useTranslation } from "react-i18next";

export const Series = () => {
  const { t } = useTranslation();
  const { seriesid } = useParams();

  const [competitionData, setCompetitionData] = useState<any>({});
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getData = async (seriesId: string) => {
      const response = await fetch(LINKS.WCA.API.COMPETITION_SERIES + seriesId);
      const seriesCompetitions = await response.json();

      if (!response.ok) {
        setHasError(true);
        return;
      }

      let allData = await Promise.all(
        seriesCompetitions.competitionIds.map(async (key: string) => {
          const competitionData = await (
            await fetch(LINKS.WCA.API.COMPETITION_INFO + key)
          ).json();
          const wcifData = await (
            await fetch(LINKS.WCA.API.COMPETITION_INFO + key + "/wcif/public")
          ).json();
          return { ...competitionData, ...wcifData };
        }),
      );

      setCompetitionData(allData);
      setIsLoading(false);
    };
    getData(seriesid!);
  }, [seriesid]);

  if (hasError) {
    return <PageNotFound />;
  }

  if (isLoading) {
    return <LoadingPageLinear />;
  }

  const registrationOpenDates = competitionData.map(
    (data: { registration_open: string }) => new Date(data.registration_open),
  );
  const isRegistrationDifferent = !registrationOpenDates.every(
    (item: any) => item.getTime() === registrationOpenDates[0].getTime(),
  );
  const registrationOpen = new Date(Math.min(...registrationOpenDates));
  const registrationClose = new Date(
    Math.min(
      ...competitionData.map(
        (data: { registration_close: string }) =>
          new Date(data.registration_close),
      ),
    ),
  );

  return (
    <Container
      maxWidth="xl"
      style={{ textAlign: "center", display: "flex", flexDirection: "column" }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <CompetitionHeader
          name={competitionData[0].series.name}
          registrationOpen={registrationOpen}
          registrationClose={registrationClose}
          isRegistrationDifferent={isRegistrationDifferent}
          isSeries
        />
        <Box
          display="flex"
          justifyContent="center"
          flexWrap="wrap"
          marginTop="2rem"
        >
          {competitionData.map((competition: any) => (
            <CompetitionCard {...competition} key={competition.id} />
          ))}
        </Box>
      </Box>
      <Box minHeight="70px">
        <Typography gutterBottom>{t("competition.disclaimer")}</Typography>
      </Box>
    </Container>
  );
};
