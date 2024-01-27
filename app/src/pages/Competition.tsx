import { Box, Container, Typography } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { LINKS } from "./links";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getLocaleOrFallback } from "../locale";
import { CompetitionCard } from "../components/CompetitionCard";
import { CompetitionHeader } from "../components/CompetitionHeader";
import { Link } from "../components/Link";
import { PageNotFound } from "../components/PageNotFound";
import { LoadingPageLinear } from "../components/LoadingPageLinear";
import { competition, wcif } from "../types";

export const Competition = () => {
  const { t } = useTranslation();
  const params = useParams();

  const [competitionData, setCompetitionData] = useState<null | {
    data: competition;
    wcif: wcif;
  }>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const [compData, wcifData] = await Promise.all([
        fetch(LINKS.WCA.API.COMPETITION_INFO + params.compid).then(
          (response) => {
            if (!response.ok) {
              setHasError(true);
            }
            return response.json();
          },
        ),
        fetch(
          LINKS.WCA.API.COMPETITION_INFO + params.compid + "/wcif/public",
        ).then((response) => {
          if (!response.ok) {
            setHasError(true);
          }
          return response.json();
        }),
      ]);

      setCompetitionData({ data: compData, wcif: wcifData });
    };
    getData();
  }, [params.compid]);

  if (hasError) {
    return <PageNotFound />;
  }

  if (!competitionData) {
    return <LoadingPageLinear />;
  }

  const registrationOpen = new Date(competitionData.data.registration_open);
  const registrationClose = new Date(competitionData.data.registration_close);

  return (
    <Container
      maxWidth="xl"
      style={{ textAlign: "center", display: "flex", flexDirection: "column" }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <CompetitionHeader
          name={competitionData.data.name}
          registrationOpen={registrationOpen}
          registrationClose={registrationClose}
        />
        {competitionData.wcif.series && (
          <Typography gutterBottom style={{ textAlign: "center" }}>
            <Trans
              components={{
                seriesLink: (
                  <Link to={`./series/${competitionData.wcif.series.id}`} />
                ),
              }}
            >
              {t("competition.isseries")}
            </Trans>
          </Typography>
        )}
        <Box
          display="flex"
          justifyContent="center"
          flexWrap="wrap"
          marginTop="2rem"
        >
          <CompetitionCard {...competitionData} />
        </Box>
      </Box>
      <Box minHeight="70px">
        <Typography gutterBottom>{t("competition.disclaimer")}</Typography>
      </Box>
    </Container>
  );
};
