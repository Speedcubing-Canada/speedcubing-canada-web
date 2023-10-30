import {
  Button,
  Box,
  Container,
  Typography,
  LinearProgress,
} from "@mui/material";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "../components/Link";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { LINKS } from "./links";

export const Series = () => {
  const { t } = useTranslation();
  const { seriesid } = useParams();

  const [competitionData, setCompetitionData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getData = async (seriesId: string) => {
      const seriesCompetitions = await (
        await fetch(LINKS.WCA.API.COMPETITION_SERIES + seriesId)
      ).json();

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

  if (isLoading) {
    return (
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
      </Box>
    );
  }

  const competitorsApproved = (competition: any) => {
    return competition.persons.filter((competitor: any) => {
      return (
        competitor.registration && competitor.registration.status === "accepted"
      );
    }).length;
  };

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
          <Box margin="1rem" padding="1rem" key={index}>
            <Typography variant="h5" fontWeight="bold">
              {competition.name}
            </Typography>
            <Typography gutterBottom>
              <Trans>
                {t("competition.date", {
                  date: new Date(
                    competition.start_date + "T12:00:00.000Z",
                  ).toLocaleString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }),
                })}
                {t("competition.city", { city: competition.city })}
                {t("competition.venue", {
                  venue: competition.schedule.venues[0].name, //If multiple venues are listed, use the first one
                })}
                {t("competition.address", {
                  address: competition.venue_address,
                })}
                {currentDate > registrationOpen
                  ? `${t("competition.registration.count", {
                      num: competitorsApproved(competition).toString(),
                      total: competition.competitorLimit,
                    })}`
                  : "\n"}
              </Trans>
            </Typography>
            <Button
              to={competition.url}
              component={Link}
              variant="contained"
              size="large"
            >
              {t("competition.register")}
            </Button>
          </Box>
        ))}
      </Box>
    </Container>
  );
};
