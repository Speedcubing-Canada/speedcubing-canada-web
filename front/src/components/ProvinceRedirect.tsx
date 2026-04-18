import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Box, Container, Typography } from "@mui/material";
import { ExternalLink } from "./ExternalLink";
import { ProvinceID } from "../types";

type ProvinceRedirectProps = {
  province: ProvinceID;
  redirectUrl: string;
  linkTitle: string;
};

export const ProvinceRedirect = ({
  province,
  redirectUrl,
  linkTitle,
}: ProvinceRedirectProps) => {
  const { t } = useTranslation();

  useEffect(() => {
    window.location.replace(redirectUrl);
  }, [redirectUrl]);

  return (
    <Container maxWidth="md">
      <Box marginY="4rem">
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {t(`provinces.${province}`)}
        </Typography>
        <Typography gutterBottom>{t("province_redirect.body")}</Typography>
        <Typography>
          <ExternalLink to={redirectUrl}>{linkTitle}</ExternalLink>
        </Typography>
      </Box>
    </Container>
  );
};
