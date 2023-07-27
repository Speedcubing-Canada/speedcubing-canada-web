import { Button, Box, Container, Typography } from "@mui/material";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "../components/Link";
import { LINKS } from "./links";
import { useParams } from "react-router-dom";
import { ConstructionOutlined, KeyTwoTone } from "@mui/icons-material";
import { compileFunction } from "vm";
import { useState, useEffect } from "react";
import { getLocaleOrFallback } from "../locale";

export const Competitions = () => {
  const { t } = useTranslation();

  const [data, setData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  const getCompetitions = async () => {
    const response = await fetch("https://www.worldcubeassociation.org/api/v0/competitions?country_iso2=CA")
    const data = await response.json();
    return data;
  }

  useEffect(() => {
    const getData = async () => {
      const competitions = await getCompetitions();
      setData(competitions);
      setIsLoading(false);
    };
    getData();
  }, []); 

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Container maxWidth="xl" style={{ textAlign: "center" }}>
      <Box marginY="4rem">
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {t("competition.upcoming")}
        </Typography> 
        <Typography gutterBottom sx={{ maxWidth: "md", margin: "0 auto"}}>
          {t("competition.upcomingbody")}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="center" flexWrap="wrap">
      { Object.keys(data).reverse().map((key) => (
        <Box margin="1rem" padding="1rem" key = {key}>
          <Typography variant="h5" fontWeight="bold">
            { data[key].name }
          </Typography>
          <Typography gutterBottom maxWidth="400px">
            {new Date(data[key].start_date + "T12:00:00.000Z").toLocaleString("en-US", {month: "long"})}
            { " | " }
            {data[key].city}
          </Typography>
          <Button to={`/en/competitions/${data[key].id}`} component={Link} variant="contained" size="large">
            {t("competition.learnmore")}
            {/* TODO Currently english is hardcoded into the url, update to support french as well */}
          </Button>
        </Box>
      ))}
      </Box>
    </Container>
  );
};
