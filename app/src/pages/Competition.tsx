import { Button, Box, Container, Typography } from "@mui/material";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "../components/Link";
import { LINKS } from "./links";
import { useParams } from "react-router-dom";
import { ConstructionOutlined, KeyTwoTone } from "@mui/icons-material";
import { compileFunction } from "vm";
import { useState, useEffect } from "react";

export const Competition = () => {
  const { t } = useTranslation();
  const { compid } = useParams (); 

  const [competitionData, setCompetitionData] = useState<any>(null);
  const [venueData, setVenueData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCompetitionData = async (compId: string) => {
    const response = await fetch(LINKS.WCA.API.COMPETITION_INFO + compId);
    const data = await response.json();
    return data;
  }

  const getVenueData = async (compId: string) => {
    const response = await fetch (LINKS.WCA.API.COMPETITION_INFO + compId + "/wcif/public");
    const data = await response.json();
    return data
  }

  useEffect(() => {
    const getData = async () => {
      const [compData, venueData] = await Promise.all([getCompetitionData(compid!), getVenueData(compid!)]);
      setCompetitionData(compData);
      setVenueData(venueData)
      setIsLoading(false);
    };
    getData();
  }, [compid]);

  if (isLoading) {
    return <div>Loading...</div>
  }

  const currentDate = new Date();
  const registrationOpen = new Date(competitionData.registration_open);

  return (
      <Container maxWidth="xl" style={{ textAlign: "center" }}>
        <Box marginTop="4rem">
          <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
            {t(competitionData.name)}
          </Typography>
          <Typography gutterBottom sx={{ maxWidth: "md", margin: "0 auto" }}>
              {t("competition.fee", { fee: "30" })}
              {/* Dummy placeholder until reg fee data is accessable */}
          </Typography>
          <Typography gutterBottom style={{ textAlign: "center" }}>
            {currentDate < registrationOpen
            ? t("competition.registration.before", { date: registrationOpen })
            : t("competition.registration.after", { date: registrationOpen })
            }
          </Typography>
        </Box>

        <Box display="flex" justifyContent="center" flexWrap="wrap">
          <Box margin="1rem" padding="1rem">
            <Typography gutterBottom maxWidth="100%" dangerouslySetInnerHTML={{
              __html: `${t("competition.date", {date: new Date(competitionData.start_date + "T12:00:00.000Z").toLocaleString('en-US', {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})})}` +
              `${t("competition.city", {city: competitionData.city})}` +
              `${t("competition.venue", {venue: venueData.schedule.venues[0].name})}` +
              `${t("competition.address", {address: competitionData.venue_address})}`
            }}>
            </Typography>
            <Button to={competitionData.url} component={Link} variant="contained" size="large">
              {t("competition.register")}
            </Button>
          </Box>
        </Box>
      </Container>
  );
};
