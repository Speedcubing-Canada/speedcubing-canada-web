import {
  Button,
  Box,
  Container,
  Typography,
  LinearProgress,
} from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "../components/Link";
import { LINKS } from "./links";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getLocaleOrFallback } from "../locale";

export const Competition = () => {
  const { t } = useTranslation();
  const { compid, localeParam } = useParams();
  const locale = getLocaleOrFallback(localeParam as string);
  const navigate = useNavigate();

  const [competitionData, setCompetitionData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      const [compData, wcifData] = await Promise.all([
        fetch(LINKS.WCA.API.COMPETITION_INFO + compid).then((response) =>
          response.json(),
        ),
        fetch(LINKS.WCA.API.COMPETITION_INFO + compid + "/wcif/public").then(
          (response) => response.json(),
        ),
      ]);

      setCompetitionData({ ...compData, ...wcifData });
      setIsLoading(false);
    };
    getData();
  }, [compid]);

  if (competitionData.series) {
    navigate(`/${locale}/competitions/series/${competitionData.series.id}`);
  }

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
  const registrationOpen = new Date(competitionData.registration_open);
  const registrationClose = new Date(competitionData.registration_close);

  return (
    <Container maxWidth="xl" style={{ textAlign: "center" }}>
      <Box marginTop="4rem">
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {t(competitionData.name)}
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
      <Box display="flex" justifyContent="center" flexWrap="wrap">
        <Box margin="1rem" padding="1rem">
          <Typography gutterBottom>
            <Trans>
              {t("competition.date", {
                date: new Date(
                  competitionData.start_date + "T12:00:00.000Z",
                ).toLocaleString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }),
              })}
              {t("competition.city", { city: competitionData.city })}
              {t("competition.venue", {
                venue: competitionData.schedule.venues[0].name,
              })}
              {t("competition.address", {
                address: competitionData.venue_address,
              })}
              {currentDate > registrationOpen
                ? `${t("competition.registration.count", {
                    num: competitorsApproved(competitionData).toString(),
                    total: competitionData.competitorLimit,
                  })}`
                : "\n"}
            </Trans>
          </Typography>
          <Button
            to={competitionData.url}
            component={Link}
            variant="contained"
            size="large"
          >
            {t("competition.register")}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
