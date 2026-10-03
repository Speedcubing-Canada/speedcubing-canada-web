import {
  Box,
  Button,
  Chip,
  Divider,
  Icon,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "../../cubingicon.css"; // @font-face + .cubing-icon rules (otherwise glyphs don't load here)
import { EVENTS, EventChampions, fetchChampions, RegionInfo } from "./data";

// Cubing-event glyph (same font classes as MyCubingIcon, so it loads identically),
// but rendered as a flex box that centres the glyph in its parent square.
function EventIcon({ id, selected }: { id: string; selected: boolean }) {
  return (
    <Icon
      baseClassName={`cubing-icon event-${id}`}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
        lineHeight: 1,
        fontSize: 26,
        color: selected ? "primary.main" : "text.secondary",
      }}
    />
  );
}

function formatDateRange(
  start: string | null,
  end: string | null,
  locale: string,
): string {
  if (!start) return "";
  const startDate = new Date(start);
  const long: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  if (!end || start === end) return startDate.toLocaleDateString(locale, long);
  const endDate = new Date(end);
  const startShort = startDate.toLocaleDateString(locale, {
    month: "long",
    day: "numeric",
  });
  return `${startShort} - ${endDate.toLocaleDateString(locale, long)}`;
}

function formatDate(date: string | null, locale: string): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export interface RegionPanelProps {
  region: RegionInfo;
  onClose: () => void;
}

function NextChampionshipSection({
  upcoming,
  hasPast,
}: {
  upcoming: import("./data").UpcomingChampionship | null;
  hasPast: boolean;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  if (upcoming) {
    return (
      <Box
        sx={{
          borderRadius: 3,
          p: 2.75,
          color: "primary.contrastText",
          background: "linear-gradient(135deg,#d32f2f,#b3261f)",
          boxShadow: "0 16px 38px rgba(211,47,47,.26)",
        }}
      >
        <Typography
          variant="overline"
          sx={{ opacity: 0.85, fontWeight: 700, letterSpacing: 1.2 }}
        >
          {t("championships.nextChampionship")}
        </Typography>
        <Typography
          variant="h6"
          sx={{ fontWeight: 800, lineHeight: 1.15, mb: 1.5 }}
        >
          {upcoming.name}
        </Typography>
        <Stack spacing={1.1}>
          <DetailRow
            icon={<EventOutlinedIcon fontSize="small" />}
            label={formatDateRange(
              upcoming.start_date,
              upcoming.end_date,
              locale,
            )}
          />
          {upcoming.city && (
            <DetailRow
              icon={<PlaceOutlinedIcon fontSize="small" />}
              label={upcoming.city}
            />
          )}
          <DetailRow
            icon={<HowToRegOutlinedIcon fontSize="small" />}
            label={
              upcoming.registration_status === "open"
                ? t("championships.registrationOpen")
                : upcoming.registration_status === "closed"
                ? t("championships.registrationClosed")
                : upcoming.registration_status === "not_open" &&
                  upcoming.registration_open
                ? t("championships.registrationOpens", {
                    date: formatDate(upcoming.registration_open, locale),
                  })
                : t("championships.registrationTbd")
            }
          />
        </Stack>
        <Button
          fullWidth
          href={upcoming.wca_url}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<OpenInNewRoundedIcon />}
          sx={{
            mt: 2.25,
            bgcolor: "#fff",
            color: "primary.main",
            fontWeight: 700,
            "&:hover": { bgcolor: "#f3f3f3" },
          }}
        >
          {upcoming.registration_status === "open"
            ? t("championships.register")
            : t("championships.viewOnWca")}
        </Button>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        borderRadius: 3,
        p: 2.75,
        border: "1.5px dashed",
        borderColor: "divider",
        bgcolor: "action.hover",
      }}
    >
      <Typography
        variant="overline"
        sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1.2 }}
      >
        {t("championships.nextChampionship")}
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 800, color: "text.secondary", mb: 0.5 }}
      >
        {t("championships.notAnnounced")}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {hasPast
          ? t("championships.notAnnouncedBody")
          : t("championships.noChampionshipYet")}
      </Typography>
    </Box>
  );
}

function PastChampionsSection({
  region,
  edition,
  setEdition,
  eventId,
  setEventId,
  champions,
  loading,
  regionName,
}: {
  region: RegionInfo;
  edition: number | null;
  setEdition: (e: number | null) => void;
  eventId: string | null;
  setEventId: (e: string | null) => void;
  champions: EventChampions[];
  loading: boolean;
  regionName: string;
}) {
  const { t } = useTranslation();
  const hasPast = region.editions.length > 0;
  const availableEvents = EVENTS.filter((ev) =>
    champions.some((c) => c.event_id === ev),
  );
  const selectedEvent = champions.find((c) => c.event_id === eventId);

  return (
    <>
      <Divider sx={{ my: 3.5 }} />
      <Typography
        variant="overline"
        sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 1.5 }}
      >
        {t("championships.pastChampions")}
      </Typography>

      {hasPast ? (
        <>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              fontWeight: 600,
              mt: 1.5,
              mb: 1,
            }}
          >
            {t("championships.edition")}
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {region.editions.map((y) => (
              <Chip
                key={y}
                label={y}
                onClick={() => setEdition(y)}
                color={y === edition ? "primary" : "default"}
                variant={y === edition ? "filled" : "outlined"}
                sx={{ fontWeight: 600 }}
              />
            ))}
          </Stack>

          {loading ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5 }}>
              {t("championships.loadingChampions")}
            </Typography>
          ) : availableEvents.length === 0 ? (
            <Box
              sx={{
                mt: 2,
                p: 2.5,
                borderRadius: 2,
                bgcolor: "action.hover",
                textAlign: "center",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "text.secondary" }}
              >
                {t("championships.noChampionsTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("championships.noChampionsBody")}
              </Typography>
            </Box>
          ) : (
            <>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: "text.secondary",
                  fontWeight: 600,
                  mt: 2.5,
                  mb: 1,
                }}
              >
                {t("championships.event")}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {availableEvents.map((ev) => {
                  const sel = ev === eventId;
                  return (
                    <IconButton
                      key={ev}
                      onClick={() => setEventId(ev)}
                      title={t(`events._${ev}`)}
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: sel ? "primary.main" : "divider",
                        bgcolor: sel
                          ? "rgba(211,47,47,.08)"
                          : "background.paper",
                      }}
                    >
                      <EventIcon id={ev} selected={sel} />
                    </IconButton>
                  );
                })}
              </Stack>

              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mt: 3, mb: 1.5 }}
              >
                {regionName} {edition} {"·"}{" "}
                {eventId ? t(`events._${eventId}`) : ""}
              </Typography>

              <Stack spacing={1.25}>
                {(selectedEvent?.champions ?? []).map((champ) => (
                  <Box
                    key={`${champ.wca_id ?? champ.name}-${champ.pos}`}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.75,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                    }}
                  >
                    <EmojiEventsRoundedIcon sx={{ color: "#d9a93a" }} />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 700, lineHeight: 1.2 }}
                      >
                        {champ.wca_id ? (
                          <a
                            href={`https://www.worldcubeassociation.org/persons/${champ.wca_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "inherit", textDecoration: "none" }}
                          >
                            {champ.name}
                          </a>
                        ) : (
                          champ.name
                        )}
                      </Typography>
                      {champ.province && (
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          {champ.province.toUpperCase()}
                        </Typography>
                      )}
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 800,
                        color: "primary.main",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {champ.result}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </>
          )}
        </>
      ) : (
        <Box
          sx={{
            mt: 2,
            p: 2.5,
            borderRadius: 2,
            bgcolor: "action.hover",
            textAlign: "center",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: "text.secondary" }}
          >
            {t("championships.noPastTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("championships.noPastBody")}
          </Typography>
        </Box>
      )}
    </>
  );
}

export const RegionPanel: React.FC<RegionPanelProps> = ({
  region,
  onClose,
}) => {
  const { t } = useTranslation();
  const [edition, setEdition] = useState<number | null>(
    region.editions[0] ?? null,
  );
  const [eventId, setEventId] = useState<string | null>(null);
  const [champions, setChampions] = useState<EventChampions[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset to the latest edition only when the region itself changes.
    setEdition(region.editions[0] ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region.id]);

  // Fetch the champions for the selected edition.
  useEffect(() => {
    if (edition == null) {
      setChampions([]);
      return;
    }
    let active = true;
    setLoading(true);
    void fetchChampions(region.id, edition).then((data) => {
      if (!active) return;
      setChampions(data);
      setEventId(data[0]?.event_id ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [region.id, edition]);

  const upcoming = region.upcoming;
  const hasPast = region.editions.length > 0;
  const regionName = t(`championships.regions.${region.id}`);
  const year = new Date().getFullYear();
  const heldThisYear = region.editions.includes(year);

  return (
    <Box sx={{ p: { xs: 2.5, md: 3.5 }, pb: 6 }}>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 1.5 }}
          >
            {t("championships.org")}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.05 }}>
            {regionName}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          aria-label={t("championships.close")}
          sx={{ mt: -0.5 }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </Stack>

      <Box sx={{ mt: 1.5, mb: 3 }}>
        {region.announced ? (
          <Chip
            label={t("championships.statusAnnounced", { year })}
            color="primary"
            size="small"
            sx={{ fontWeight: 700 }}
          />
        ) : heldThisYear ? (
          <Chip
            label={t("championships.statusHeld", { year })}
            size="small"
            sx={{ fontWeight: 700 }}
          />
        ) : (
          <Chip
            label={
              hasPast
                ? t("championships.statusPending", { year })
                : t("championships.statusNone")
            }
            size="small"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
        )}
      </Box>

      <NextChampionshipSection upcoming={upcoming} hasPast={hasPast} />

      <PastChampionsSection
        region={region}
        edition={edition}
        setEdition={setEdition}
        eventId={eventId}
        setEventId={setEventId}
        champions={champions}
        loading={loading}
        regionName={regionName}
      />
    </Box>
  );
};

function DetailRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      <Box sx={{ opacity: 0.85, display: "flex" }}>{icon}</Box>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
    </Stack>
  );
}
