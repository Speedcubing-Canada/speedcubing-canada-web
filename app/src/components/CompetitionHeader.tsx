import { Box, Typography } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";

export const CompetitionHeader = ({
  name,
  registrationOpen,
  registrationClose,
  series,
}: {
  name: string;
  registrationOpen: Date;
  registrationClose: Date;
  series: boolean;
}) => {
  const { t } = useTranslation();

  const currentDate = new Date();
  const isRegistrationOpen = currentDate > registrationOpen;
  const isRegistrationClosed = currentDate > registrationClose;

  return (
    <Box marginTop="4rem">
      <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
        {name}
      </Typography>
      <Typography gutterBottom sx={{ maxWidth: "md", margin: "0 auto" }}>
        {series ? t("competition.series") : ""}
      </Typography>
      <Typography gutterBottom style={{ textAlign: "center" }}>
        <Trans>
          {isRegistrationOpen
            ? t("competition.registration.after", { date: registrationOpen })
            : t("competition.registration.before", { date: registrationOpen })}
          {isRegistrationClosed
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
