import { Button, Box, Container, Typography, LinearProgress } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "../components/Link";
import { LINKS } from "./links";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getLocaleOrFallback } from "../locale";

export const Competition = () => {
  const { t } = useTranslation();
  const { compid, localeParam } = useParams ();
  const locale = getLocaleOrFallback(localeParam as string);
  const navigate = useNavigate();

  const [competitionData, setCompetitionData] = useState<any>(null);
  const [venueData, setVenueData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCompetitionData = async (compId: string) => {
    const response = await fetch(LINKS.WCA.API.COMPETITION_INFO + compId);
    const data = await response.json();
    return data;
  }

  const getVenueData = async (compId: string) => {
    const timestamp = new Date().getTime(); 
    const response = await fetch (LINKS.WCA.API.COMPETITION_INFO + compId + `/wcif/public?cacheBust=${timestamp}`);
    const data = await response.json();
    return data
  }

  useEffect(() => {
    const getData = async () => {
      const [compData, venueData] = await Promise.all([getCompetitionData(compid!), getVenueData(compid!)]);
      setCompetitionData(compData);
      setVenueData(venueData)
      setIsLoading(false);

      if (venueData.series) {
        navigate(`/${locale}/competitions/series/${venueData.series.id}`);
      }
    };
    getData();
  }, [compid, locale, navigate]);

  if (isLoading) {
    return (
      <Box sx={{ width: '100%' }}>  
        <LinearProgress />
      </Box>
    );
  }

  const competitorsApproved = (competition: any) => {
    return competition.persons.filter((competitor: any) => {
      return competitor.registration && competitor.registration.status === "accepted";
    }).length;
  };

  const currentDate = new Date();
  const registrationOpen = new Date(competitionData.registration_open);
  const registrationClose = new Date(competitionData.registration_close); 

  return (
      <Container maxWidth="xl" style={{ textAlign: "center" }}>
        <Box marginTop="4rem">
          <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
            {t(competitionData.name)}
          </Typography>
          <Typography gutterBottom style={{ textAlign: "center" }}>
            <Trans>
              { currentDate < registrationOpen
              ? t("competition.registration.before", { date: registrationOpen })
              : t("competition.registration.after", { date: registrationOpen })
              }
              { currentDate < registrationClose 
              ? t("competition.registration.closes", { date: registrationClose})
              : t("competition.registration.closed", { date: registrationClose})
              }
            </Trans>
          </Typography>
        </Box>
        <Box display="flex" justifyContent="center" flexWrap="wrap">
          <Box margin="1rem" padding="1rem">
            <Typography gutterBottom>
              <Trans>
                {t("competition.date", {date: new Date(competitionData.start_date + "T12:00:00.000Z").toLocaleString('en-US', {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})})}
                {t("competition.city", {city: competitionData.city})}
                {t("competition.venue", {venue: venueData.schedule.venues[0].name})}
                {t("competition.address", {address: competitionData.venue_address})}
                { currentDate > registrationOpen
                  ? `${t("competition.registration.count", {num: competitorsApproved(venueData).toString(), total: venueData.competitorLimit})}`
                  : "\n"
                }
              </Trans>
            </Typography>
            <Button to={competitionData.url} component={Link} variant="contained" size="large">
              {t("competition.register")}
            </Button>
          </Box>
        </Box>
      </Container>
  );
};
