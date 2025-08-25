import { Button, Box, Container, Typography } from "@mui/material";
import { useTranslation, Trans } from "react-i18next";
import { ExternalLink } from "../components/ExternalLink";
import { LINKS } from "./links";

export const About = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md">
      <Box marginY="4rem">
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {t("about.title")}
        </Typography>
        <Typography gutterBottom>
          <Trans
            components={{
              wca: <ExternalLink to={LINKS.WCA.HOME} />,
              regionalOrg: <ExternalLink to={LINKS.WCA.REGIONAL_ORGS} />,
            }}
          >
            {t("about.body")}
          </Trans>
        </Typography>
      </Box>

      <Box marginY="4rem">
        <Typography component="h2" variant="h3" fontWeight="bold" gutterBottom>
          {t("history.title")}
        </Typography>
        <Typography gutterBottom>
          <Trans
            components={{
              wc2003: <ExternalLink to={LINKS.WCA.WC2003} />,
            }}
          >
            {t("history.body1")}
          </Trans>
        </Typography>
        <Typography
          gutterBottom
          component="blockquote"
          borderLeft="3px black solid"
          marginLeft="1rem"
          paddingLeft="1rem"
        >
          <Trans
            components={{
              wca: <ExternalLink to={LINKS.WCA.HOME} />,
            }}
          >
            {t("history.quote")}
          </Trans>
        </Typography>
        <Typography gutterBottom>
          <Trans
            components={{
              canadianOpen: <ExternalLink to={LINKS.WCA.CO2007} />,
            }}
          >
            {t("history.body2")}
          </Trans>
        </Typography>
      </Box>

      <Box marginY="4rem">
        <Typography component="h2" variant="h3" fontWeight="bold" gutterBottom>
          {t("comps.title")}
        </Typography>
        <Typography gutterBottom>{t("comps.body")}</Typography>
        <Box marginTop="2rem">
          <Button
            to={LINKS.WCA.COMPS_CANADA}
            component={ExternalLink}
            variant="contained"
            size="large"
          >
            {t("comps.cta")}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
