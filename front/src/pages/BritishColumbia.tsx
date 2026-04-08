import { useTranslation } from "react-i18next";
import { Box, Container, Typography } from "@mui/material";
import { ExternalLink } from "../components/ExternalLink";
import { LINKS } from "./links";
import { useEffect } from "react";

export const BritishColumbia = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.location.replace(LINKS.GOOGLE_DOC_BC);
  }, []);

  return (
    <Container maxWidth="md">
      <Box marginY="4rem">
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {t("provinces.bc")}
        </Typography>
        <Typography gutterBottom>{t("province_redirect.body")}</Typography>
        <Typography>
          <ExternalLink to={LINKS.GOOGLE_DOC_BC}>Google Doc</ExternalLink>
        </Typography>
      </Box>
    </Container>
  );
};
