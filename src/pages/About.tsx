import { Button, Box, Container, Typography } from "@mui/material";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "../components/Link";

export const About = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <Box marginY="4rem">
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {t("about.title")}
        </Typography>
        <Typography gutterBottom>
          <Trans
            components={{
              wca: <Link to="https://www.worldcubeassociation.org/" />,
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
              wc2003: (
                <Link to="https://www.worldcubeassociation.org/competitions/WC2003" />
              ),
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
              wca: <Link to="https://www.worldcubeassociation.org/" />,
            }}
          >
            {t("history.quote")}
          </Trans>
        </Typography>
        <Typography gutterBottom>
          <Trans
            components={{
              canadianOpen: (
                <Link to="https://www.worldcubeassociation.org/competitions/CanadianOpen2007" />
              ),
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
            to="https://www.worldcubeassociation.org/competitions?region=Canada"
            component={Link}
            variant="contained"
          >
            {t("comps.cta")}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
