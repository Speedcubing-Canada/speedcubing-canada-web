import { Box, Container, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { CompetitionCard } from "../components/CompetitionCard";
import { CompetitionHeader } from "../components/CompetitionHeader";
import { LoadingPageLinear } from "../components/LoadingPageLinear";
import { useTranslation } from "react-i18next";
import { isSpeedcubingCanadaCompetition } from "../helpers/competitionValidator";
import { useQuery } from "@tanstack/react-query";
import { fetchSeriesData } from "../helpers/fetchSeriesdata";

export const Series = () => {
  const { t } = useTranslation();
  const { seriesid } = useParams();
  const navigate = useNavigate();

  const { isLoading, isError, data } = useQuery({
    queryKey: ["series", seriesid],
    enabled: !!seriesid,
    queryFn: () => fetchSeriesData(seriesid!),
  });

  if (isLoading) {
    return <LoadingPageLinear />;
  }

  const hasSCCOrganizer = data?.some((competition) =>
    isSpeedcubingCanadaCompetition(competition.compData),
  );

  if (isError || !data || !hasSCCOrganizer) {
    navigate("/", { replace: true });
    return;
  }

  const registrationDates = data.map((competition) => ({
    open: new Date(competition.compData.registration_open).getTime(),
    close: new Date(competition.compData.registration_close).getTime(),
  }));

  const earliestRegistrationOpen = new Date(
    Math.min(...registrationDates.map((d) => d.open)),
  );
  const earliestRegistrationClose = new Date(
    Math.min(...registrationDates.map((d) => d.close)),
  );
  const isRegistrationDifferent = !registrationDates.every(
    (d) => d.open === registrationDates[0].open,
  );

  return (
    <Container
      maxWidth="xl"
      sx={{ textAlign: "center", display: "flex", flexDirection: "column" }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <CompetitionHeader
          name={data[0].wcif.series.name}
          registrationOpen={earliestRegistrationOpen}
          registrationClose={earliestRegistrationClose}
          doSeriesRegistrationsDiffer={isRegistrationDifferent}
          isSeries
        />
        <Box
          display="flex"
          justifyContent="center"
          flexWrap="wrap"
          marginTop="2rem"
        >
          {data.map(({ compData, wcif }) => (
            <CompetitionCard
              wcif={wcif}
              data={compData}
              key={compData.id}
              shouldShowName
            />
          ))}
        </Box>
      </Box>
      <Box minHeight="70px">
        <Typography gutterBottom>{t("competition.disclaimer")}</Typography>
      </Box>
    </Container>
  );
};
