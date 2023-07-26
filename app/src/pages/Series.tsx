import { Button, Box, Container, Typography } from "@mui/material";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "../components/Link";
import { LINKS } from "./links";
import { useParams } from "react-router-dom";
import { ConstructionOutlined } from "@mui/icons-material";

export const Series = () => {
  const { t } = useTranslation();
  const { seriesid } = useParams ();
  const CompetitionData = { 
    SeriesName: "Ajax 3x3x3",
    CompIds: ["Ajax333Morning2023", "Ajax333Afternoon2023", "Ajax333Evening2023"],
    RegistrationFee: 30,  
    RegistrationOpen: new Date("2024-01-01")
  }; //get this from API

  const currentDate = new Date();

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
          {currentDate < CompetitionData.RegistrationOpen
          ? t("series.registration.before", { date: CompetitionData.RegistrationOpen })
          : t("series.registration.after", { date: CompetitionData.RegistrationOpen })
          }
        </Typography>
      </Box>

      <Box display="flex" justifyContent="center">
        {CompetitionData.CompIds.map((key) => (
            <Box margin="1rem" padding="1rem" key = {key}>
              <Typography variant="h5" fontWeight="bold">
                {key}
                </Typography>
            </Box>
        ))}
      </Box>
    </Container>
  );
};
