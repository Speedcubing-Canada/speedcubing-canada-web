import {
  Button,
  Box,
  Container,
  Typography,
  LinearProgress,
} from "@mui/material";
import { useTranslation, Trans } from "react-i18next";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { LINKS } from "./links";
import { CompetitionCard } from "../components/CompetitionCard";

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
    return (
      <Container maxWidth="xl" style={{ textAlign: "center" }}>
        <Box marginTop="4rem">
          <Typography
            component="h1"
            variant="h5"
            fontWeight="bold"
            gutterBottom
          >
            {t("competition.error")}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
      </Box>
    );
  }

  const currentDate = new Date();
  //Currently the dates of the first competition in the list are used for displaying registration open and close times
  const registrationOpen = new Date(competitionData[0].registration_open);
  const registrationClose = new Date(competitionData[0].registration_close);

  return (
    <Container maxWidth="xl" style={{ textAlign: "center" }}>
      <Box marginTop="4rem">
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {competitionData[0].series.name}
        </Typography>
        <Typography gutterBottom sx={{ maxWidth: "md", margin: "0 auto" }}>
          {t("competition.series")}
        </Typography>
        <Typography gutterBottom style={{ textAlign: "center" }}>
          <Trans>
            {currentDate < registrationOpen
              ? t("competition.registration.before", { date: registrationOpen })
              : t("competition.registration.after", { date: registrationOpen })}
            {currentDate < registrationClose
              ? t("competition.registration.closes", {
                  date: registrationClose,
                })
              : t("competition.registration.closed", {
                  date: registrationClose,
                })}
          </Trans>
        </Typography>
      </Box>

      <Box
        display="flex"
        justifyContent="center"
        flexWrap="wrap"
        marginTop="2rem"
      >
        {competitionData.map((competition: any, index: number) => (
          <CompetitionCard {...competition} />
        ))}
      </Box>
    </Container>
  );
};
