import { Box, Container, Typography } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { LINKS } from "./links";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { CompetitionCard } from "../components/CompetitionCard";
import { CompetitionHeader } from "../components/CompetitionHeader";
import { LoadingPageLinear } from "../components/LoadingPageLinear";
import { Competition as CompetitionType, Wcif } from "../types";
import { isSpeedcubingCanadaCompetition } from "../helpers/competitionValidator";

export const Competition = () => {
  const { t } = useTranslation();
  const params = useParams();

  const [competitionData, setCompetitionData] = useState<null | {
    data: CompetitionType;
    wcif: Wcif;
  }>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      const [compData, wcifData] = await Promise.all([
        fetch(LINKS.WCA.API.COMPETITION_INFO + params.compid).then(
          (response) => {
            if (!response.ok) {
              navigate("/", { replace: true });
            }
            return response.json();
          },
        ),
        fetch(
          LINKS.WCA.API.COMPETITION_INFO + params.compid + "/wcif/public",
        ).then((response) => {
          if (!response.ok) {
            navigate("/", { replace: true });
          }
          return response.json();
        }),
      ]);

      if (!isSpeedcubingCanadaCompetition(compData)) {
        navigate("/", { replace: true });
      }

      setCompetitionData({ data: compData, wcif: wcifData });
    };
    getData();
  }, [navigate, params.compid]);

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
                  <Link
                    to={`../competitions/series/${competitionData.wcif.series.id}`}
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
          <CompetitionCard {...competitionData} shouldShowName={false} />
        </Box>
      </Box>
      <Box minHeight="70px">
        <Typography gutterBottom>{t("competition.disclaimer")}</Typography>
      </Box>
    </Container>
  );
};
