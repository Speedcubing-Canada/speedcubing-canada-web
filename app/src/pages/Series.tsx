  import { Button, Box, Container, Typography } from "@mui/material";
  import { useTranslation, Trans } from "react-i18next";
  import { Link } from "../components/Link";
  import { LINKS } from "./links";
  import { useParams } from "react-router-dom";
  import { ConstructionOutlined } from "@mui/icons-material";
  import { compileFunction } from "vm";
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

    useEffect(() => {
      const getData = async () => {
        const dataPromises = CompetitionData.CompIds.map((key) => getCompetitionData(key));
        const allData = await Promise.all(dataPromises);
        const infoDataObject = Object.fromEntries(CompetitionData.CompIds.map((key, index) => [key, allData[index]]));
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
      <Container maxWidth="md">
        <Box marginY="4rem">
          <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom style={{ textAlign: "center" }}>
            {t(CompetitionData.SeriesName)}
          </Typography>
          <Typography gutterBottom style={{ textAlign: "center" }}>
              {t("series.body1")}
              {t("series.fee", { fee: CompetitionData.RegistrationFee })}
          </Typography>
          <Typography gutterBottom style={{ textAlign: "center" }}>
            {currentDate < registrationOpen
            ? t("series.registration.before", { date: registrationOpen })
            : t("series.registration.after", { date: registrationOpen })
            }
          </Typography>
        </Box>

        <Box display="flex" justifyContent="center">
          {Object.keys(data).map((key) => (
              <Box margin="1rem" padding="1rem" key = {key}>
                <Typography variant="h5" fontWeight="bold">
                { data[key].name }  
                </Typography>
                <Typography gutterBottom>
                  {t("series.date", {date: new Date(data[key].start_date).toLocaleString('en-US', {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'})})}
                  {t("series.city", {city: data[key].city})}
                  {t("series.venue", {venue: data[key].venue_details})}
                  {t("series.address", {address: data[key].venue_address})}
                </Typography>
              </Box>
          ))}
        </Box>
      </Container>
    );
  };
