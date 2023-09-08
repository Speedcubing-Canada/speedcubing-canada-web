import {
  Button,
  Box,
  Container,
  Typography,
  LinearProgress,
} from "@mui/material";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "../components/Link";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { LINKS } from "./links";

export const Series = () => {
  const { t } = useTranslation();
  const { seriesid } = useParams();

  const [data, setData] = useState<any>({});
  const [seriesData, setSeriesData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  const getSeriesData = async (seriesId: string) => {
    const response = await fetch(LINKS.WCA.API.COMPETITION_SERIES + seriesId);
    const seriesData = await response.json();
    return seriesData;
  };

  useEffect(() => {
    const getCompSeriesData = async () => {
      const competitionList = await getSeriesData(seriesid!);
      setSeriesData(competitionList);
    };
    getCompSeriesData();
  }, [seriesid]);

  const compIds = seriesData.competitionIds;
  const seriesName = seriesData.name;

  const getCompetitionData = async (compId: string) => {
    const response = await fetch(LINKS.WCA.API.COMPETITION_INFO + compId);
    const data = await response.json();
    return data;
  };

  const getVenueData = async (compId: string) => {
    const timestamp = new Date().getTime();
    const response = await fetch(
      LINKS.WCA.API.COMPETITION_INFO +
        compId +
        `/wcif/public?cacheBust=${timestamp}`,
    );
    const data = await response.json();
    return data;
  };

  useEffect(() => {
    const getData = async () => {
      const dataPromises = compIds.map((key: string) =>
        getCompetitionData(key),
      );
      const venueDataPromises = compIds.map((key: string) => getVenueData(key));

      const [allData, allVenueData] = await Promise.all([
        Promise.all(dataPromises),
        Promise.all(venueDataPromises),
      ]);

      const infoDataObject = Object.fromEntries(
        compIds.map((key: string, index: number) => [
          key,
          { ...allData[index], ...allVenueData[index] },
        ]),
      );

      setData(infoDataObject);
      setIsLoading(false);
    };
    getData();
  }, [compIds]);

  const competitorsApproved = (competition: any) => {
    return competition.persons.filter((competitor: any) => {
      return (
        competitor.registration && competitor.registration.status === "accepted"
      );
    }).length;
  };

  if (isLoading) {
    return (
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
      </Box>
    );
  }

  console.log(data);

  const currentDate = new Date();
  //Currently the dates of the first competition in the list are used for displaying registration open and close times
  const registrationOpen = new Date(data[compIds[0]].registration_open);
  const registrationClose = new Date(data[compIds[0]].registration_close);

  return (
    <Container maxWidth="xl" style={{ textAlign: "center" }}>
      <Box marginTop="4rem">
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {t(seriesName)}
        </Typography>
        <Typography gutterBottom sx={{ maxWidth: "md", margin: "0 auto" }}>
          {t("competition.series")}
          {/* {t("competition.fee", { fee: CompetitionData.RegistrationFee })} */}
        </Typography>
        <Typography gutterBottom style={{ textAlign: "center" }}>
          <Trans>
            {currentDate < registrationOpen
              ? t("competition.registration.before", { date: registrationOpen })
              : t("competition.registration.after", { date: registrationOpen })}
            {currentDate < registrationClose
              ? t("competition.registration.closes", {
                  date: registrationClose,
                })
              : t("competition.registration.closed", {
                  date: registrationClose,
                })}
          </Trans>
        </Typography>
      </Box>

      <Box
        display="flex"
        justifyContent="center"
        flexWrap="wrap"
        marginTop="2rem"
      >
        {Object.keys(data).map((key) => (
          <Box margin="1rem" padding="1rem" key={key}>
            <Typography variant="h5" fontWeight="bold">
              {data[key].name}
            </Typography>
            <Typography gutterBottom>
              <Trans>
                {t("competition.date", {
                  date: new Date(
                    data[key].start_date + "T12:00:00.000Z",
                  ).toLocaleString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }),
                })}
                {t("competition.city", { city: data[key].city })}
                {t("competition.venue", {
                  venue: data[key].schedule.venues[0].name,
                })}
                {t("competition.address", { address: data[key].venue_address })}
                {currentDate > registrationOpen
                  ? `${t("competition.registration.count", {
                      num: competitorsApproved(data[key]).toString(),
                      total: data[key].competitorLimit,
                    })}`
                  : "\n"}
              </Trans>
            </Typography>
            <Button
              to={data[key].url}
              component={Link}
              variant="contained"
              size="large"
            >
              {t("competition.register")}
            </Button>
          </Box>
        ))}
      </Box>
    </Container>
  );
};
