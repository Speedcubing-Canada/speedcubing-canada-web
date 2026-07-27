import { Box, Container, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { DelegateCard } from "../components/DelegateCard";
import { LoadingPageLinear } from "../components/LoadingPageLinear";
import { fetchDelegates } from "../helpers/fetchDelegates";
import {
  PROVINCE_REGION,
  REGION_ORDER,
  RegionId,
} from "../components/championships/data";

// Regional (and senior) delegates cover the whole country and are shown first,
// separate from the per-region groups.
const PRIORITY_STATUSES = ["regional_delegate", "senior_delegate"];

const byName = (a: { name: string }, b: { name: string }) =>
  a.name.localeCompare(b.name);

const CardGrid = ({ children }: { children: React.ReactNode }) => (
  <Box
    display="flex"
    flexWrap="wrap"
    gap={3}
    justifyContent={{ xs: "center", sm: "flex-start" }}
  >
    {children}
  </Box>
);

export const Delegates = () => {
  const { t } = useTranslation();
  const {
    data: delegates,
    isLoading,
    isError,
  } = useQuery({ queryKey: ["delegates"], queryFn: fetchDelegates });

  if (isLoading) {
    return <LoadingPageLinear />;
  }

  const list = delegates ?? [];
  const regional = list
    .filter((delegate) => PRIORITY_STATUSES.includes(delegate.status))
    .sort(byName);
  // Regional/senior delegates are also listed in their home region (a second time,
  // alongside the country-wide top section), so no status exclusion here.
  const delegatesInRegion = (region: RegionId) =>
    list
      .filter(
        (delegate) =>
          delegate.province && PROVINCE_REGION[delegate.province] === region,
      )
      .sort(byName);

  return (
    <Container maxWidth="md">
      <Box marginY="4rem">
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {t("delegates.title")}
        </Typography>
        <Typography color="text.secondary">{t("delegates.intro")}</Typography>
      </Box>

      {isError || list.length === 0 ? (
        <Box marginY="4rem">
          <Typography color="text.secondary">{t("delegates.empty")}</Typography>
        </Box>
      ) : (
        <>
          {regional.length > 0 && (
            <Box marginY="4rem">
              <Typography
                component="h2"
                variant="h4"
                fontWeight="bold"
                gutterBottom
              >
                {t("delegates.regional")}
              </Typography>
              <CardGrid>
                {regional.map((delegate) => (
                  <DelegateCard
                    key={delegate.wca_id}
                    delegate={delegate}
                    showRegionGroup
                  />
                ))}
              </CardGrid>
            </Box>
          )}

          {REGION_ORDER.map((region) => {
            const regionDelegates = delegatesInRegion(region);
            if (regionDelegates.length === 0) {
              return null;
            }

            return (
              <Box key={region} marginY="4rem">
                <Typography
                  component="h2"
                  variant="h4"
                  fontWeight="bold"
                  gutterBottom
                >
                  {t(`championships.regions.${region}`)}
                </Typography>
                <CardGrid>
                  {regionDelegates.map((delegate) => (
                    <DelegateCard key={delegate.wca_id} delegate={delegate} />
                  ))}
                </CardGrid>
              </Box>
            );
          })}
        </>
      )}
    </Container>
  );
};
