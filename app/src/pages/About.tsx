import { Button, Box, Container, Typography } from "@mui/material";
import { useTranslation, Trans } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { LINKS } from "./links";
import { getLocaleOrFallback } from "../locale";

export const About = () => {
  const { t } = useTranslation();
  const params = useParams();
  const locale = getLocaleOrFallback(params.locale as string);

  return (
    <Container maxWidth="md">
      <Box marginY="4rem">
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {t("about.title")}
        </Typography>
        <Typography gutterBottom>
          <Trans
            components={{
              wca: <Link to={LINKS.WCA.HOME} />,
              regionalOrg: <Link to={LINKS.WCA.REGIONAL_ORGS} />,
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
              wc2003: <Link to={LINKS.WCA.WC2003} />,
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
              wca: <Link to={LINKS.WCA.HOME} />,
            }}
          >
            {t("history.quote")}
          </Trans>
        </Typography>
        <Typography gutterBottom>
          <Trans
            components={{
              canadianOpen: <Link to={LINKS.WCA.CO2007} />,
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
            to={`/${locale}/competitions/`}
            component={Link}
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
