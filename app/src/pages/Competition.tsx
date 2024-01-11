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

export const Competition = () => {
  const { t } = useTranslation();
  const { compid, localeParam } = useParams();
  const locale = getLocaleOrFallback(localeParam as string);

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
    return <PageNotFound />;
  }

  if (isLoading) {
    return <LoadingPageLinear />;
  }

  const registrationOpen = new Date(competitionData.registration_open);
  const registrationClose = new Date(competitionData.registration_close);

  return (
    <Container
      maxWidth="xl"
      style={{ textAlign: "center", display: "flex", flexDirection: "column" }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <CompetitionHeader
          name={competitionData.name}
          registrationOpen={registrationOpen}
          registrationClose={registrationClose}
        />
        {competitionData.series && (
          <Typography gutterBottom style={{ textAlign: "center" }}>
            <Trans
              components={{
                seriesLink: (
                  <Link
                    to={`/${locale}/competitions/series/${competitionData.series.id}`}
                  />
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
