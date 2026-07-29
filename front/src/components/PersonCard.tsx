import { Avatar, Box, Paper, Typography } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { ReactNode } from "react";
import { fetchWcaPerson } from "../helpers/fetchWcaPerson";
import { LINKS } from "../pages/links";

interface PersonCardProps {
  // Omit for people with no WCA profile (e.g. some team members).
  wcaId?: string;
  name: string;
  subtitle?: string;
  // Pass an explicit URL (or null for the default avatar) to skip the WCA API fetch by wcaId.
  avatarUrl?: string | null;
  // Optional badge rendered under the name (e.g. a delegate rank chip); content/translation is
  // the caller's responsibility.
  chip?: ReactNode;
}

// A compact avatar tile for a person. Links to the WCA profile and lifts on hover when a
// wcaId is given, otherwise renders un-linked. Falls back to a generic icon while loading,
// on error, or when there is no photo.
export const PersonCard = ({
  wcaId,
  name,
  subtitle,
  avatarUrl,
  chip,
}: PersonCardProps) => {
  const shouldFetch = avatarUrl === undefined && !!wcaId;

  const { data } = useQuery({
    queryKey: ["wca-person", wcaId],
    queryFn: () => fetchWcaPerson(wcaId as string),
    staleTime: 1000 * 60 * 60,
    enabled: shouldFetch,
  });

  const resolvedAvatar = shouldFetch
    ? data && !data.avatarIsDefault
      ? data.avatarThumbUrl
      : undefined
    : avatarUrl ?? undefined;

  const linkProps = wcaId
    ? {
        href: LINKS.WCA.PROFILE + wcaId,
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};

  return (
    <Paper
      variant="outlined"
      component={wcaId ? "a" : "div"}
      {...linkProps}
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
        ...(wcaId && {
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
        }),
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

        {chip}

        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};
