import { Box, Container, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export const PageNotFound = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="xl" style={{ textAlign: "center" }}>
      <Box marginTop="4rem">
        <Typography component="h1" variant="h5" fontWeight="bold" gutterBottom>
          {t("competition.error")}
        </Typography>
      </Box>
    </Container>
  );
};
