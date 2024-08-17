import { Box, Typography } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";

export const CompetitionHeader = ({
  name,
  registrationOpen,
  registrationClose,
  doSeriesRegistrationsDiffer = false,
  isSeries = false,
}: {
  name: string;
  registrationOpen: Date;
  registrationClose: Date;
  doSeriesRegistrationsDiffer?: boolean;
  isSeries?: boolean;
}) => {
  const { t } = useTranslation();

  const currentDate = new Date();
  const hasRegistrationOpened = currentDate > registrationOpen;
  const hasRegistrationClosed = currentDate > registrationClose;

  return (
    <Box marginTop="4rem">
      <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
        {name}
      </Typography>
      <Typography gutterBottom sx={{ maxWidth: "md", margin: "0 auto" }}>
        {isSeries ? t("competition.series") : ""}
      </Typography>
      <Typography gutterBottom style={{ textAlign: "center" }}>
        <Trans>
          {hasRegistrationOpened
            ? t("competition.registration.after", {
                date: formatDate(registrationOpen),
              })
            : doSeriesRegistrationsDiffer
            ? t("competition.registration.differentopen", {
                date: formatDate(registrationOpen),
              })
            : t("competition.registration.before", {
                date: formatDate(registrationOpen),
              })}
          {hasRegistrationClosed
            ? t("competition.registration.closed", {
                date: formatDate(registrationClose),
              })
            : t("competition.registration.closes", {
                date: formatDate(registrationClose),
              })}
        </Trans>
      </Typography>
    </Box>
  );
};

/**
 * Formats a date to the following style: "Thursday, September 12, 2024 at 8:00 PM EDT"
 */
const formatDate = (date: Date): string =>
  date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
