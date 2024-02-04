import { useTranslation } from "react-i18next";
import {
  Box,
  Container,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from "@mui/material";
import * as React from "react";
import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";

import { eventID, Province } from "../components/Types";
import { getProvinces } from "../components/provinces";
import { API_BASE_URL, PRODUCTION } from "../components/api";
import httpClient from "../httpClient";
import { RankList } from "../components/RankList";
import { MyCubingIcon } from "../components/MyCubingIcon";
import useResponsiveQuery from "../components/useResponsiveQuery";

const provinces: Province[] = getProvinces();
const events: eventID[] = [
  "333",
  "222",
  "444",
  "555",
  "666",
  "777",
  "333bf",
  "333fm",
  "333oh",
  "clock",
  "minx",
  "pyram",
  "skewb",
  "sq1",
  "444bf",
  "555bf",
  "333mbf",
];

export const Rankings = () => {
  const { t } = useTranslation();
  const isSmall = useResponsiveQuery("sm");

  const [province, setProvince] = useState<Province | null>(provinces[0]);
  const [eventId, setEventId] = useState<eventID>("333");
  const [usingAverage, setUsingAverage] = useState(false);
  const [loading, setLoading] = useState(true);

  const [ranking, setRanking] = useState<any | null>(null);

  const switchHandler = (event: {
    target: { checked: boolean | ((prevState: boolean) => boolean) };
  }) => {
    setUsingAverage(event.target.checked);
  };

  const handleProvinceChange = (
    event: any,
    newValue: React.SetStateAction<Province | null>,
  ) => {
    setProvince(newValue);

    if (province != null) {
      console.log(ranking);
      if (province.id === "qc") {
        console.log("Vive le Québec libre!");
      }
    }
  };

  const handleEventChange = (
    event: React.MouseEvent<HTMLElement>,
    newEvent: eventID | null,
  ) => {
    if (newEvent === null) {
      return;
    }
    setEventId(newEvent);
  };
  const handleEventChangeMobile = (
    event: any,
    newValue: React.SetStateAction<eventID | null>,
  ) => {
    if (newValue === null) {
      return;
    }
    setEventId(newValue as eventID);
  };

  useEffect(() => {
    setLoading(true);
    setRanking(null);
    const use_average_str = usingAverage ? "1" : "0";

    (async () => {
      try {
        if (
          eventId === null ||
          province?.id === null ||
          usingAverage === null ||
          province === undefined
        ) {
          return null;
        }

        let resp;
        if (!PRODUCTION) {
          resp = await httpClient.get(
            API_BASE_URL +
              "/test_rankings?event=" +
              eventId +
              "&province=" +
              province?.id +
              "&use_average=" +
              use_average_str,
          ); //allows to not have the WCA DB locally
        } else {
          resp = await httpClient.get(
            API_BASE_URL +
              "/province_rankings/" +
              eventId +
              "/" +
              province?.id +
              "/" +
              use_average_str,
          );
        }

        setRanking(resp);
      } catch (error: any) {
        if (error?.code === "ERR_NETWORK") {
          console.log("Network error" + error);
        } else {
          console.log("Error" + error);
        }
      }
      setLoading(false);
    })();
  }, [eventId, province, usingAverage]);

  return (
    <Container maxWidth="md">
      <Box marginTop="4rem" marginBottom="2rem">
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {t("rankings.title")}
        </Typography>
      </Box>

      <Stack direction="column" spacing={2} alignItems="center">
        {isSmall ? (
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={events}
            sx={{ width: 300 }}
            value={eventId}
            onChange={handleEventChangeMobile}
            renderInput={(params) => (
              <TextField {...params} label={t("rankings.event")} />
            )}
            getOptionLabel={(option) => t("events._" + option)}
          />
        ) : (
          <ToggleButtonGroup
            value={eventId}
            exclusive
            onChange={handleEventChange}
          >
            {events.map((wcaEvent) => (
              <ToggleButton
                key={wcaEvent}
                value={wcaEvent}
                aria-label={wcaEvent}
              >
                <MyCubingIcon
                  event={wcaEvent}
                  size="2x"
                  selected={eventId === wcaEvent}
                />
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}

        <Stack
          direction={isSmall ? "column" : "row"}
          spacing={2}
          alignItems="center"
        >
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={provinces}
            sx={{ width: 300 }}
            value={province}
            onChange={handleProvinceChange}
            renderInput={(params) => <TextField {...params} label="Province" />}
            getOptionLabel={(option) => t("provinces." + option.id)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>{t("rankings.single")}</Typography>
            <Switch
              checked={usingAverage}
              onChange={switchHandler}
              color="default"
            />
            <Typography>{t("rankings.average")}</Typography>
          </Stack>
        </Stack>
      </Stack>
      {loading ? (
        <Box
          marginY="5rem"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : ranking != null && province != null ? (
        <div>
          <Typography marginY="1rem">
            {t("rankings.rankfor")}{" "}
            {t("province_with_pronouns." + province?.id)} {t("rankings.in")}{" "}
            {t("events._" + eventId)} {t("rankings.for")}{" "}
            {usingAverage ? t("rankings.average") : t("rankings.single")}
          </Typography>
          <RankList data={ranking} />
        </div>
      ) : province == null ? (
        <div>
          <Typography marginY="1rem">{t("rankings.choose")}</Typography>
        </div>
      ) : (
        <div>
          <Typography marginY="1rem">{t("rankings.unavailable")}</Typography>
        </div>
      )}
    </Container>
  );
};
