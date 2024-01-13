import { Box, Typography, Button } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "./Link";

const competitorsApproved = (competition: any) =>
  competition.persons.filter(
    (competitor: any) =>
      competitor.registration && competitor.registration.status === "accepted",
  ).length;

export const CompetitionCard = (competition: any) => {
  const { t } = useTranslation();

  const currentDate = new Date();
  const registrationOpen = new Date(competition.registration_open);

  return (
    <Box margin="1rem" padding="1rem" maxWidth="400px">
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
            venue: competition.schedule.venues[0].name,
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
  );
};
