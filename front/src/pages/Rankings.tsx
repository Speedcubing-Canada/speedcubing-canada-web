import { useTranslation } from "react-i18next";
import {
  Box,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";

import { EventID, Province, Ranking, ACTIVE_EVENTS } from "../types";
import { API_BASE_URL } from "../components/api";
import httpClient, { HttpResponse } from "../httpClient";
import {
  removeCachedRankingsPreferredProvinceId,
  setCachedRankingsPreferredProvinceId,
} from "../helpers/rankingsProvinceCache";
import { RankList } from "../components/RankList";
import { MyCubingIcon } from "../components/MyCubingIcon";
import { useResponsiveQuery } from "../components/useResponsiveQuery";
import { useProvincePreference } from "../helpers/useProvincePreference";

export const Rankings = () => {
  const { t } = useTranslation();
  const isSmall = useResponsiveQuery("sm");

  const { provinces, province, setProvince, provinceInitialized } =
    useProvincePreference();
  const [eventId, setEventId] = useState<EventID>("333");
  const [usingAverage, setUsingAverage] = useState(false);
  const [loading, setLoading] = useState(true);

  const [ranking, setRanking] = useState<Ranking[] | null>(null);

  const handleProvinceChange = (
    _event: React.SyntheticEvent,
    newValue: Province | null,
  ) => {
    setProvince(newValue);
    if (newValue?.id) {
      setCachedRankingsPreferredProvinceId(newValue.id);
    } else {
      removeCachedRankingsPreferredProvinceId();
    }
  };

  // Shared by the desktop toggle group and the mobile autocomplete.
  const handleEventChange = (
    _event: React.SyntheticEvent,
    newEvent: EventID | null,
  ) => {
    if (newEvent != null) {
      setEventId(newEvent);
    }
  };

  useEffect(() => {
    if (!provinceInitialized) {
      return;
    }

    setLoading(true);
    setRanking(null);
    const use_average_str = usingAverage ? "1" : "0";

    void (async () => {
      if (!eventId || !province?.id) {
        setLoading(false);
        return;
      }

      let response: HttpResponse<Ranking[], unknown>;
      if (import.meta.env.MODE === "development") {
        const params = new URLSearchParams({
          event: eventId,
          province: province?.id || "",
          use_average: use_average_str,
        });
        response = await httpClient.get<Ranking[]>(
          `${API_BASE_URL}/test_rankings?${params.toString()}`,
        ); //allows to not have the WCA DB locally
      } else {
        response = await httpClient.get<Ranking[]>(
          API_BASE_URL +
            "/province_rankings/" +
            eventId +
            "/" +
            province?.id +
            "/" +
            use_average_str,
        );
      }

      if (response.ok && response.data) {
        setRanking(response.data);
      } else {
        console.error("Error fetching rankings:", response.error);
      }
      setLoading(false);
    })();
  }, [eventId, province, usingAverage, provinceInitialized]);

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
            options={ACTIVE_EVENTS}
            sx={{ width: 300 }}
            value={eventId}
            onChange={handleEventChange}
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
            {ACTIVE_EVENTS.map((wcaEvent) => (
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
          <Autocomplete<Province>
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
              onChange={(event) => setUsingAverage(event.target.checked)}
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
