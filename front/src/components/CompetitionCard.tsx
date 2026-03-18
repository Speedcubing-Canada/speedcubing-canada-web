import { Box, Typography, Button } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { ExternalLink } from "./ExternalLink";
import { Competition, Wcif, WcifPerson } from "../types";

const competitorsApproved = (competition: { data: Competition; wcif: Wcif }) =>
  competition.wcif.persons.filter(
    (competitor: WcifPerson) => competitor.registration?.status === "accepted",
  ).length;

export const CompetitionCard = (competition: {
  data: Competition;
  wcif: Wcif;
  shouldShowName: boolean;
}) => {
  const { t } = useTranslation();

  const currentDate = new Date();
  const registrationOpen = new Date(competition.data.registration_open);

  const venueList = competition.wcif.schedule.venues
    .map((venue: { name: string }) => {
      return venue.name;
    })
    .join(", ");

  return (
    <Box margin="1rem" padding="1rem" maxWidth="400px">
      {competition.shouldShowName && (
        <Typography component="h1" variant="h5" fontWeight="bold" gutterBottom>
          {competition.data.name}
        </Typography>
      )}
      <Typography gutterBottom>
        <Trans>
          <>
            {t("competition.date", {
              date: new Date(
                competition.data.start_date + "T00:00:00.000",
              ).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            })}
            {t("competition.city", { city: competition.data.city })}
            {t("competition.venue", {
              venue: venueList,
            })}
            {t("competition.address", {
              address: competition.data.venue_address,
            })}
            {currentDate > registrationOpen && competition.data.competitor_limit
              ? `${t("competition.registration.count", {
                  num: competitorsApproved(competition).toString(),
                  total: competition.data.competitor_limit,
                })}`
              : "\n"}
          </>
        </Trans>
      </Typography>
      <Button
        to={competition.data.url}
        component={ExternalLink}
        variant="contained"
        size="large"
      >
        {t("competition.register")}
      </Button>
    </Box>
  );
};
