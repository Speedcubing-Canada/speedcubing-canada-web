import { Avatar, Box, Chip, Paper, Typography } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchWcaPerson } from "../helpers/fetchWcaPerson";
import { LINKS } from "../pages/links";

// WCA delegate ranks, most senior first. Encoded on the card as a colored chip:
// primary/filled (top) -> neutral/filled -> primary/outlined -> neutral/outlined.
const STATUS_STYLE: Record<
  string,
  { key: string; color: "primary" | "default"; variant: "filled" | "outlined" }
> = {
  regional_delegate: { key: "regional", color: "primary", variant: "filled" },
  senior_delegate: { key: "senior", color: "primary", variant: "filled" },
  delegate: { key: "delegate", color: "default", variant: "filled" },
  junior_delegate: { key: "junior", color: "primary", variant: "outlined" },
  trainee_delegate: { key: "trainee", color: "default", variant: "outlined" },
};

interface PersonCardProps {
  wcaId: string;
  name: string;
  subtitle?: string;
  // Delegates pass their avatar (string, or null for the default WCA avatar) from
  // the backend. Directors omit it entirely, so the card fetches from the WCA API.
  avatarUrl?: string | null;
  // A WCA delegate status; when present, renders a colored rank chip.
  status?: string;
  // WCA gender ("f" for the feminine label, e.g. French "déléguée").
  gender?: string | null;
}

// A compact, linked avatar tile for a WCA member. The whole card links to the WCA
// profile; it lifts on hover. Name/subtitle come from local data; the photo comes
// either from a passed-in URL (delegates) or a WCA API fetch (directors), falling
// back to a generic icon while loading, on error, or when there is no photo.
export const PersonCard = ({
  wcaId,
  name,
  subtitle,
  avatarUrl,
  status,
  gender,
}: PersonCardProps) => {
  const { t } = useTranslation();
  const shouldFetch = avatarUrl === undefined;

  const { data } = useQuery({
    queryKey: ["wca-person", wcaId],
    queryFn: () => fetchWcaPerson(wcaId),
    staleTime: 1000 * 60 * 60,
    enabled: shouldFetch,
  });

  const resolvedAvatar = shouldFetch
    ? data && !data.avatarIsDefault
      ? data.avatarThumbUrl
      : undefined
    : avatarUrl ?? undefined;

  const statusStyle = status ? STATUS_STYLE[status] : undefined;

  return (
    <Paper
      variant="outlined"
      component="a"
      href={LINKS.WCA.PROFILE + wcaId}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 1,
        p: 2,
        width: 180,
        borderRadius: 3,
        color: "inherit",
        textDecoration: "none",
        transition: "transform 150ms ease, box-shadow 150ms ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.10)",
        },
        "&:hover .person-card-name": { color: "primary.main" },
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          "&:hover": { transform: "none" },
        },
      }}
    >
      <Avatar
        src={resolvedAvatar}
        alt={name}
        sx={{ width: 96, height: 96, bgcolor: "grey.100" }}
      >
        <AccountCircle
          sx={{ width: "100%", height: "100%" }}
          color="disabled"
        />
      </Avatar>

      <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <Typography
          className="person-card-name"
          fontWeight="bold"
          sx={{ transition: "color 150ms ease" }}
        >
          {name}
        </Typography>

        {statusStyle && (
          <Chip
            size="small"
            label={t(`delegates.status.${statusStyle.key}`, {
              context: gender === "f" ? "female" : undefined,
            })}
            color={statusStyle.color}
            variant={statusStyle.variant}
          />
        )}

        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};
