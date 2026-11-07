import { useEffect, useState, SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Link,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import DownloadIcon from "@mui/icons-material/Download";

import { API_BASE_URL } from "../components/api";
import httpClient from "../httpClient";
import { hasDelegateOrAdminRole } from "../components/roles";
import { ACTIVE_EVENTS, EventID } from "../types";
import { MyCubingIcon } from "../components/MyCubingIcon";
import { useResponsiveQuery } from "../components/useResponsiveQuery";
import { getLocaleOrFallback } from "../locale";
import { dataGridLocaleText } from "../helpers/dataGridLocale";
import { useCurrentUser } from "../helpers/useCurrentUser";
import { LINKS } from "./links";

interface ChampionshipSummary {
  id: string;
  competition_name: string;
  competition_id: string;
  year: number;
  start_date: string | null;
  type: string;
  area: string | null;
  is_pbq: boolean;
}

interface Competitor {
  name: string;
  wca_id: string;
  eligible: boolean | null;
  events: string[];
}

interface EligibilityData {
  championship_id: string;
  competition_name: string;
  competition_id: string;
  year: number;
  type: string;
  area: string | null;
  is_pbq: boolean;
  competitors: Competitor[];
}

const eligibilityColor = (
  eligible: boolean | null,
): "success" | "error" | "default" => {
  if (eligible === true) return "success";
  if (eligible === false) return "error";
  return "default";
};

const eligibilityOrder = (e: boolean | null) =>
  e === true ? 0 : e === false ? 1 : 2;

const exportCSV = (data: EligibilityData) => {
  const header = ["Name", "WCA ID", "Events", "Eligible"];
  const rows = data.competitors.map((c) => [
    c.name,
    c.wca_id,
    c.events.join(";"),
    c.eligible === true ? "Yes" : c.eligible === false ? "No" : "Unknown",
  ]);
  const csvContent = [header, ...rows]
    .map((row) =>
      row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${data.competition_id}_eligibility.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const ChampionshipEligibility = () => {
  const { t, i18n } = useTranslation();
  const isSmall = useResponsiveQuery("sm");
  const locale = getLocaleOrFallback(i18n.language);

  const { user, loading: userLoading } = useCurrentUser();
  const isAllowed = hasDelegateOrAdminRole(user);

  const [championships, setChampionships] = useState<ChampionshipSummary[]>([]);
  const [champLoading, setChampLoading] = useState(false);

  const [selected, setSelected] = useState<ChampionshipSummary | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);

  const [eventId, setEventId] = useState<EventID>("333");

  useEffect(() => {
    if (!isAllowed) return;
    setChampLoading(true);
    void (async () => {
      const resp = await httpClient.get<ChampionshipSummary[]>(
        API_BASE_URL + "/championships",
      );
      if (resp.ok && resp.data) setChampionships(resp.data);
      setChampLoading(false);
    })();
  }, [isAllowed]);

  useEffect(() => {
    if (!selected) return;
    setEligibility(null);
    setEligibilityError(null);
    setEligibilityLoading(true);
    void (async () => {
      const resp = await httpClient.get<EligibilityData>(
        `${API_BASE_URL}/championship_eligibility/${selected.id}`,
      );
      if (resp.ok && resp.data) {
        setEligibility(resp.data);
      } else {
        setEligibilityError(t("eligibility.loadError"));
      }
      setEligibilityLoading(false);
    })();
  }, [selected]);

  // Shared by the desktop toggle group and the mobile autocomplete.
  const handleEventChange = (_: SyntheticEvent, newEvent: EventID | null) => {
    if (newEvent != null) setEventId(newEvent);
  };

  if (userLoading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" marginY="5rem">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!isAllowed) {
    return (
      <Container maxWidth="md">
        <Box marginY="4rem">
          <Alert severity="error">{t("eligibility.unauthorized")}</Alert>
        </Box>
      </Container>
    );
  }

  const eventsInChampionship: EventID[] = eligibility
    ? ACTIVE_EVENTS.filter((e) =>
        eligibility.competitors.some((c) => c.events.includes(e)),
      )
    : [];

  const currentEvent = eventsInChampionship.includes(eventId)
    ? eventId
    : eventsInChampionship[0];

  const competitors =
    eligibility?.competitors.filter((c) =>
      c.events.includes(currentEvent ?? ""),
    ) ?? [];

  const sortedCompetitors = competitors.toSorted((a, b) => {
    const diff = eligibilityOrder(a.eligible) - eligibilityOrder(b.eligible);
    return diff === 0 ? a.name.localeCompare(b.name) : diff;
  });

  const counts = competitors.reduce(
    (acc, competitor) => {
      if (competitor.eligible === true) acc.eligible += 1;
      else if (competitor.eligible === false) acc.ineligible += 1;
      else acc.unknown += 1;
      return acc;
    },
    { eligible: 0, ineligible: 0, unknown: 0 },
  );

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: t("eligibility.name"),
      flex: 2,
      minWidth: 160,
      renderCell: (params) => (
        <Link
          href={`${LINKS.WCA.PROFILE}${params.row.wca_id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: "wca_id",
      headerName: "WCA ID",
      width: 130,
    },
    {
      field: "eligible",
      headerName: t("eligibility.eligible"),
      width: 140,
      renderCell: (params) => {
        const val = params.value as boolean | null;
        if (val === null)
          return (
            <Chip
              size="small"
              label={t("eligibility.unknown")}
              color="default"
            />
          );
        return (
          <Chip
            size="small"
            label={
              val ? t("eligibility.eligible") : t("eligibility.ineligible")
            }
            color={eligibilityColor(val)}
          />
        );
      },
    },
  ];

  const rows = sortedCompetitors.map((c) => ({
    id: c.wca_id,
    name: c.name,
    wca_id: c.wca_id,
    eligible: c.eligible,
  }));

  return (
    <Container maxWidth="md">
      <Box marginTop="4rem" marginBottom="2rem">
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {t("eligibility.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("eligibility.subtitle")}
        </Typography>
      </Box>

      {champLoading ? (
        <CircularProgress size={24} />
      ) : (
        <Autocomplete<ChampionshipSummary>
          disablePortal
          options={championships}
          sx={{ maxWidth: 480 }}
          value={selected}
          onChange={(_, newValue) => setSelected(newValue)}
          getOptionLabel={(c) =>
            c.is_pbq ? `${c.competition_name} (Quiet)` : c.competition_name
          }
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderInput={(params) => (
            <TextField {...params} label={t("eligibility.championship")} />
          )}
        />
      )}

      {eligibilityLoading && (
        <Box display="flex" justifyContent="center" marginY="3rem">
          <CircularProgress />
        </Box>
      )}

      {eligibilityError && (
        <Box marginY="2rem">
          <Alert severity="error">{eligibilityError}</Alert>
        </Box>
      )}

      {eligibility && eventsInChampionship.length > 0 && (
        <Box marginTop="2rem">
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1}
            marginBottom="1rem"
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {eligibility.competition_name}
              {eligibility.is_pbq && (
                <Chip label="Quiet" size="small" sx={{ ml: 1 }} />
              )}
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => exportCSV(eligibility)}
            >
              {t("eligibility.exportCsv")}
            </Button>
          </Box>

          {isSmall ? (
            <Autocomplete
              disablePortal
              options={eventsInChampionship}
              sx={{ width: 300, mb: 2 }}
              value={currentEvent ?? null}
              onChange={handleEventChange}
              getOptionLabel={(e) => t("events._" + e)}
              renderInput={(params) => (
                <TextField {...params} label={t("eligibility.event")} />
              )}
            />
          ) : (
            <ToggleButtonGroup
              value={currentEvent ?? ""}
              exclusive
              onChange={handleEventChange}
              sx={{ flexWrap: "wrap", mb: 2 }}
            >
              {eventsInChampionship.map((e) => (
                <ToggleButton key={e} value={e} aria-label={t("events._" + e)}>
                  <MyCubingIcon
                    event={e}
                    size="2x"
                    selected={currentEvent === e}
                  />
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}

          {currentEvent && (
            <>
              <Box display="flex" gap={1} marginBottom="0.5rem">
                <Chip
                  size="small"
                  color="success"
                  label={t("eligibility.eligibleCount", {
                    count: counts.eligible,
                  })}
                />
                <Chip
                  size="small"
                  color="error"
                  label={t("eligibility.ineligibleCount", {
                    count: counts.ineligible,
                  })}
                />
                <Chip
                  size="small"
                  label={t("eligibility.unknownCount", {
                    count: counts.unknown,
                  })}
                />
              </Box>
              <Box
                sx={{
                  height: Math.min(500, 60 + rows.length * 52),
                  width: "100%",
                }}
              >
                <DataGrid
                  rows={rows}
                  columns={columns}
                  hideFooter={rows.length <= 100}
                  disableRowSelectionOnClick
                  localeText={dataGridLocaleText(locale)}
                />
              </Box>
            </>
          )}
        </Box>
      )}

      {eligibility && eventsInChampionship.length === 0 && (
        <Box marginY="2rem">
          <Alert severity="info">{t("eligibility.noRegistrations")}</Alert>
        </Box>
      )}
    </Container>
  );
};
