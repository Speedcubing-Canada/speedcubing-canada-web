import { Box, Container, Typography, LinearProgress } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { LINKS } from "./links";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getLocaleOrFallback } from "../locale";
import { CompetitionCard } from "../components/CompetitionCard";
import { CompetitionHeader } from "../components/CompetitionHeader";

export const Competition = () => {
  const { t } = useTranslation();
  const { compid, localeParam } = useParams();
  const locale = getLocaleOrFallback(localeParam as string);
  const navigate = useNavigate();

  const [competitionData, setCompetitionData] = useState<any>({});
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      const [compData, wcifData] = await Promise.all([
        fetch(LINKS.WCA.API.COMPETITION_INFO + compid).then((response) => {
          if (!response.ok) {
            setHasError(true);
          }
          return response.json();
        }),
        fetch(LINKS.WCA.API.COMPETITION_INFO + compid + "/wcif/public").then(
          (response) => {
            if (!response.ok) {
              setHasError(true);
            }
            return response.json();
          },
        ),
      ]);

      setCompetitionData({ ...compData, ...wcifData });
      setIsLoading(false);
    };
    getData();
  }, [compid]);

  if (hasError) {
    return (
      <Container maxWidth="xl" style={{ textAlign: "center" }}>
        <Box marginTop="4rem">
          <Typography
            component="h1"
            variant="h5"
            fontWeight="bold"
            gutterBottom
          >
            {t("competition.error")}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (competitionData.series) {
    navigate(`/${locale}/competitions/series/${competitionData.series.id}`);
  }

  if (isLoading) {
    return (
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
      </Box>
    );
  }

  const registrationOpen = new Date(competitionData.registration_open);
  const registrationClose = new Date(competitionData.registration_close);

  return (
    <Container maxWidth="xl" style={{ textAlign: "center" }}>
      <CompetitionHeader
        name={competitionData.name}
        registrationOpen={registrationOpen}
        registrationClose={registrationClose}
        series={false}
      />
      <CompetitionCard {...competitionData} />
    </Container>
  );
};
