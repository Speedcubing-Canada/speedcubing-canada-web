import { Button, Box, Container, Typography, SelectChangeEvent, OutlinedInput, MenuItem, ListItemText, Checkbox, Select, FormControl, InputLabel, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link } from "../components/Link";
import { LINKS } from "./links";
import { Province } from "../components/Types";
import { GetProvinces } from "../components/Provinces";
import { useState, useEffect } from "react";
import React from "react";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 10.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const provinces: Province[] = GetProvinces();

export const Competitions = () => {
  const { t } = useTranslation();

  const [data, setData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  const getCompetitions = async () => {
    const response = await fetch(LINKS.WCA.API.COMPETITION_LIST);
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

  const [selectedRegions, setRegions] = React.useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof selectedRegions>) => {
    const {
      target: { value },
    } = event;
    setRegions(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  let showComps: any[] = [];
  Object.keys(data).forEach((key) => {
    let province = data[key].city.split(", ")[1];
    if (selectedRegions.length === 0 || selectedRegions.includes(province)) {
      showComps.push(data[key]);
    }
  });

  console.log(selectedRegions);

  return (
    <Container maxWidth="xl" style={{ textAlign: "center" }}>
      <Box marginTop="4rem">
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {t("competition.upcoming")}
        </Typography>
        <Typography gutterBottom  sx={{ maxWidth: "md", margin: "0 auto"}}>
          {t("competition.upcomingbody")}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {t("competition.showonly")}
            <FormControl sx={{ minWidth: 200, textAlign: "left" }}>
              <InputLabel id="multiple-checkbox-label">{t("competition.province")}</InputLabel>
              <Select
                labelId="province-selection-label"
                id="province-selection"
                multiple
                value={ selectedRegions }
                onChange ={ handleChange }
                input={<OutlinedInput label="Provinces" />}
                renderValue={(selected: any []) => selected.join(', ')}
                MenuProps={MenuProps}
                > 
                  {provinces.map((province: Province) => (
                    <MenuItem key={ province.id } value={ province.label }>
                      <Checkbox checked={ selectedRegions.indexOf(province.label) > -1 } />
                      <ListItemText primary={ province.label } />
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        </Typography>
      </Box> 
      { isLoading
        ? <Box margin="4rem">
            <CircularProgress />
          </Box> 
        : <Box display="flex" justifyContent="center" flexWrap="wrap">
          { showComps.reverse().map((item, index) => (
            <Box margin="1rem" padding="1rem" key = {index}>
              <Typography variant="h5" fontWeight="bold">
                { item.name }
              </Typography>
              <Typography gutterBottom maxWidth="400px">
                {new Date(item.start_date + "T12:00:00.000Z").toLocaleString("en-US", {month: "long"})}
                { " | " }
                { item.city }
              </Typography>
              <Button to={`/en/competitions/${item.id}`} component={Link} variant="contained" size="large">
                {t("competition.learnmore")}
                {/* TODO Currently english is hardcoded into the url, update to support french as well */}
              </Button>
            </Box>
          ))}
        </Box>
      }
    </Container>
  );
};
