import { Box, Container, Typography } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CompetitionCard } from "../components/CompetitionCard";
import { CompetitionHeader } from "../components/CompetitionHeader";
import { LoadingPageLinear } from "../components/LoadingPageLinear";
import { isSpeedcubingCanadaCompetition } from "../helpers/competitionValidator";
import { useQuery } from "@tanstack/react-query";
import { fetchCompetitionData } from "../helpers/fetchCompetitionData";

export const Competition = () => {
  const { t } = useTranslation();
  const { compid } = useParams();
  const navigate = useNavigate();

  const { isLoading, isError, data } = useQuery({
    queryKey: ["competition", compid],
    queryFn: () => fetchCompetitionData(compid!),
    enabled: !!compid,
  });

  if (isLoading) {
    return <LoadingPageLinear />;
  }

  if (isError || !data || !isSpeedcubingCanadaCompetition(data.compData)) {
    navigate("/", { replace: true });
    return;
  }

  const { compData, wcif } = data;

  const registrationOpen = new Date(compData.registration_open);
  const registrationClose = new Date(compData.registration_close);

  return (
    <Container
      maxWidth="xl"
      sx={{ textAlign: "center", display: "flex", flexDirection: "column" }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <CompetitionHeader
          name={compData.name}
          registrationOpen={registrationOpen}
          registrationClose={registrationClose}
        />
        {wcif.series && (
          <Typography gutterBottom sx={{ textAlign: "center" }}>
            <Trans
              components={{
                seriesLink: (
                  <Link to={`../competitions/series/${wcif.series.id}`} />
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
          <CompetitionCard wcif={wcif} data={compData} shouldShowName={false} />
        </Box>
      </Box>
      <Box minHeight="70px">
        <Typography gutterBottom>{t("competition.disclaimer")}</Typography>
      </Box>
    </Container>
  );
};
