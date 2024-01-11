import { Box, Typography } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";

export const CompetitionHeader = ({
  name,
  registrationOpen,
  registrationClose,
  isRegistrationDifferent = false,
  isSeries = false,
}: {
  name: string;
  registrationOpen: Date;
  registrationClose: Date;
  isRegistrationDifferent?: boolean;
  isSeries?: boolean;
}) => {
  const { t } = useTranslation();

  const currentDate = new Date();
  const hasRegistrationOpen = currentDate > registrationOpen;
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
          {hasRegistrationOpen
            ? t("competition.registration.after", { date: registrationOpen })
            : isRegistrationDifferent
            ? t("competition.registration.differentopen", {
                date: registrationOpen,
              })
            : t("competition.registration.before", { date: registrationOpen })}
          {hasRegistrationClosed
            ? t("competition.registration.closed", {
                date: registrationClose,
              })
            : t("competition.registration.closes", {
                date: registrationClose,
              })}
        </Trans>
      </Typography>
    </Box>
  );
};
