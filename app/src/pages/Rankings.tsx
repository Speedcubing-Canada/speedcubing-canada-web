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

import {
  EventID,
  Province,
  Ranking,
  ACTIVE_EVENTS,
  User,
} from "../components/types";
import { getProvinces } from "../components/provinces";
import { API_BASE_URL, PRODUCTION } from "../components/api";
import httpClient, { HttpResponse } from "../httpClient";
import {
  getCachedRankingsPreferredProvinceId,
  removeCachedRankingsPreferredProvinceId,
  setCachedRankingsPreferredProvinceId,
} from "../helpers/rankingsProvinceCache";
import { RankList } from "../components/RankList";
import { MyCubingIcon } from "../components/MyCubingIcon";
import UseResponsiveQuery from "../components/UseResponsiveQuery";

const provinces: Province[] = getProvinces();
const events = ACTIVE_EVENTS;

const getProvinceById = (provinceId: string | null): Province | null => {
  if (!provinceId) {
    return null;
  }
  return provinces.find(({ id }) => id === provinceId) || null;
};

export const Rankings = () => {
  const { t } = useTranslation();
  const isSmall = UseResponsiveQuery("sm");

  const [province, setProvince] = useState<Province | null>(null);
  const [provinceInitialized, setProvinceInitialized] = useState(false);
  const [eventId, setEventId] = useState<EventID>("333");
  const [usingAverage, setUsingAverage] = useState(false);
  const [loading, setLoading] = useState(true);

  const [ranking, setRanking] = useState<Ranking[] | null>(null);

  const switchHandler = (event: {
    target: { checked: boolean | ((prevState: boolean) => boolean) };
  }) => {
    setUsingAverage(event.target.checked);
  };

  const handleProvinceChange = (
    event: React.SyntheticEvent,
    newValue: Province | null,
  ) => {
    setProvince(newValue);
    if (newValue?.id) {
      setCachedRankingsPreferredProvinceId(newValue.id);
    } else {
      removeCachedRankingsPreferredProvinceId();
    }
  };

  const handleEventChange = (
    event: React.MouseEvent<HTMLElement>,
    newEvent: EventID | null,
  ) => {
    if (newEvent == null) {
      return;
    }
    setEventId(newEvent);
  };
  const handleEventChangeMobile = (
    event: React.SyntheticEvent,
    newValue: EventID | null,
  ) => {
    if (newValue == null) {
      return;
    }
    setEventId(newValue);
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      let defaultProvince: Province | null = provinces[0] || null;

      const storedProvinceId = getCachedRankingsPreferredProvinceId();
      const storedProvince = getProvinceById(storedProvinceId);

      if (storedProvinceId && !storedProvince) {
        removeCachedRankingsPreferredProvinceId();
      }

      if (storedProvince) {
        if (!mounted) {
          return;
        }
        setProvince(storedProvince);
        setProvinceInitialized(true);
        return;
      }

      const response = await httpClient.get<User>(API_BASE_URL + "/user_info");
      if (response.ok && response.data?.province) {
        const userProvince = getProvinceById(response.data.province);
        if (userProvince) {
          defaultProvince = userProvince;
          setCachedRankingsPreferredProvinceId(userProvince.id);
        }
      }

      if (!mounted) {
        return;
      }

      setProvince(defaultProvince);
      setProvinceInitialized(true);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!provinceInitialized) {
      return;
    }

    setLoading(true);
    setRanking(null);
    const use_average_str = usingAverage ? "1" : "0";

    (async () => {
      if (!eventId || !province?.id) {
        setLoading(false);
        return;
      }

      let response: HttpResponse<Ranking[], unknown>;
      if (!PRODUCTION) {
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
        console.log("Error fetching rankings:", response.error);
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
