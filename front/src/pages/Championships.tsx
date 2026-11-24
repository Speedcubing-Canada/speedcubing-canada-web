import { Box, Container, Drawer, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CanadaRegionMap,
  COLORS,
} from "../components/championships/CanadaRegionMap";
import { RegionPanel } from "../components/championships/RegionPanel";
import { ZamboniLoader } from "../components/championships/ZamboniLoader";
import {
  cachedOverview,
  fallbackRegion,
  fetchOverview,
  RegionId,
  RegionInfo,
  UpcomingChampionship,
} from "../components/championships/data";
import { useResponsiveQuery } from "../components/useResponsiveQuery";

function LegendSwatch({
  color,
  border,
  label,
}: {
  color: string;
  border: string;
  label: string;
}) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box
        sx={{
          width: 16,
          height: 16,
          borderRadius: 1,
          bgcolor: color,
          border: `1.4px solid ${border}`,
        }}
      />
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, color: "text.secondary" }}
      >
        {label}
      </Typography>
    </Stack>
  );
}

const byRegionId = (list: RegionInfo[]) => {
  const byId: Partial<Record<RegionId, RegionInfo>> = {};
  list.forEach((r) => {
    byId[r.id] = r;
  });
  return byId;
};

export const Championships: React.FC = () => {
  const { t } = useTranslation();
  const isSmall = useResponsiveQuery("md");
  const [selected, setSelected] = useState<RegionId | null>(null);
  const [regions, setRegions] = useState(() => byRegionId(cachedOverview()));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void fetchOverview().then((list) => {
      if (!active) return;
      setRegions(byRegionId(list));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  // `waiting` is true while the first overview request is pending and no
  // overview is stored from an earlier visit.
  const waiting = loading && Object.keys(regions).length === 0;

  const upcoming: Partial<Record<RegionId, UpcomingChampionship>> = {};
  (Object.keys(regions) as RegionId[]).forEach((id) => {
    const championship = regions[id]?.upcoming;
    if (championship) upcoming[id] = championship;
  });

  return (
    <Box sx={{ width: "100%" }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 5 }, pb: 1 }}>
        <Typography
          variant="overline"
          sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 2 }}
        >
          {t("championships.overline")}
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            lineHeight: 1.05,
            mb: 1,
            textWrap: "balance",
          }}
        >
          {t("championships.title")}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 620 }}
        >
          {t("championships.subtitle")}
        </Typography>
        <Stack
          direction="row"
          spacing={2.5}
          sx={{ mt: 2 }}
          flexWrap="wrap"
          useFlexGap
        >
          <LegendSwatch
            color={COLORS.announced}
            border={COLORS.announcedBorder}
            label={t("championships.legendAnnounced")}
          />
          <LegendSwatch
            color={COLORS.quiet}
            border={COLORS.quietBorder}
            label={t("championships.legendQuiet")}
          />
        </Stack>
      </Container>

      <Box
        sx={{
          width: "100%",
          maxWidth: 1100,
          mx: "auto",
          height: { xs: "50vh", md: "60vh" },
          position: "relative",
          px: { xs: 1, md: 2 },
          pb: 2,
        }}
      >
        {/* While `waiting`, every region is drawn as not announced. The map
            is blurred and unclickable during that time, so that nobody reads
            it as "no championship anywhere". */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            transition: "filter .5s ease, opacity .5s ease",
            ...(waiting && {
              filter: "blur(6px)",
              opacity: 0.55,
              pointerEvents: "none",
            }),
          }}
        >
          <CanadaRegionMap
            selectedRegion={selected}
            onSelect={setSelected}
            upcoming={upcoming}
          />
        </Box>
        {waiting && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ZamboniLoader />
          </Box>
        )}
      </Box>

      <Drawer
        anchor={isSmall ? "bottom" : "right"}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        ModalProps={{ keepMounted: false }}
        PaperProps={{
          sx: isSmall
            ? {
                height: "78vh",
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }
            : { width: "min(460px, 94vw)" },
        }}
      >
        {selected && (
          <RegionPanel
            key={selected}
            region={regions[selected] ?? fallbackRegion(selected)}
            onClose={() => setSelected(null)}
          />
        )}
      </Drawer>
    </Box>
  );
};
