  import { Button, Box, Container, Typography } from "@mui/material";
  import { useTranslation, Trans } from "react-i18next";
  import { Link } from "../components/Link";
  import { useParams } from "react-router-dom";
  import { useState, useEffect } from "react";

  export const Series = () => {
    const { t } = useTranslation();
    const { seriesid } = useParams ();
    const CompetitionData = { 
      SeriesName: "Ajax 3x3x3",
      CompIds: ["Ajax333Morning2023", "Ajax333Afternoon2023", "Ajax333Evening2023"],
      RegistrationFee: 30
    }; 
    //TODO: find way to get reg fee and venue name, also make it use the entire width of the page

    const [data, setData] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);

    const getCompetitionData = async (compId: string) => {
      const response = await fetch(`https://www.worldcubeassociation.org/api/v0/competitions/${compId}`);
      const data = await response.json();
      return data;
    }

    const getVenueData = async (compId: string) => {
      const response = await fetch (`https://www.worldcubeassociation.org/api/v0/competitions/${compId}/wcif/public`);
      const data = await response.json();
      return data
    }

    useEffect(() => {
      const getData = async () => {
        const dataPromises = CompetitionData.CompIds.map((key) => getCompetitionData(key));
        const venueDataPromises = CompetitionData.CompIds.map((key) => getVenueData(key));

        const [allData, allVenueData] = await Promise.all([Promise.all(dataPromises), Promise.all(venueDataPromises)]);

        const infoDataObject = Object.fromEntries(CompetitionData.CompIds.map((key, index) => [key, {...allData[index], ...allVenueData[index] }]));

        setData(infoDataObject);
        setIsLoading(false);
      };
      getData();
    }, []);

    if (isLoading) {
      return <div>Loading...</div>
    }

    const currentDate = new Date();
    const registrationOpen = new Date(data[CompetitionData.CompIds[0]].registration_open);

    return (
      <Container maxWidth="xl" style={{ textAlign: "center" }}>
        <Box marginY="4rem">
          <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
            {t(CompetitionData.SeriesName)}
          </Typography>
          <Typography gutterBottom sx={{ maxWidth: "md", margin: "0 auto" }}>
              {t("competition.series")}
              {t("competition.fee", { fee: CompetitionData.RegistrationFee })}
          </Typography>
          <Typography gutterBottom style={{ textAlign: "center" }}>
            {currentDate < registrationOpen
            ? t("competition.registration.before", { date: registrationOpen })
            : t("competition.registration.after", { date: registrationOpen })
            }
          </Typography>
        </Box>

        <Box display="flex" justifyContent="center" flexWrap="wrap">
          {Object.keys(data).map((key) => (
              <Box margin="1rem" padding="1rem" key = {key}>
                <Typography variant="h5" fontWeight="bold">
                { data[key].name }  
                </Typography>
                <Typography gutterBottom maxWidth="400px"> 
                {/* 400px was picked somewhat arbitrarily based on what looked decent */}
                  {t("competition.date", {date: new Date(data[key].start_date).toLocaleString('en-US', {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})})}
                  {t("competition.city", {city: data[key].city})}
                  {t("competition.venue", {venue: data[key].schedule.venues[0].name})}
                  {t("competition.address", {address: data[key].venue_address})}
                  <Button to={data[key].url} component={Link} variant="contained" size="large">
                    {t("competition.register")}
                  </Button>
                </Typography>
              </Box>
          ))}
        </Box>
      </Container>
    );
  };
