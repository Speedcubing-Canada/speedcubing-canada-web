import { Avatar, Box, Link, Paper, Typography } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { fetchWcaPerson } from "../helpers/fetchWcaPerson";
import { localized } from "../helpers/localized";
import { FeaturedMember } from "../helpers/fetchPeople";
import { LINKS } from "../pages/links";

// A richer card than PersonCard: avatar + name (+ WCA link when present) alongside a
// localized role ("what they do/did for SCC") and an optional bio paragraph. Used for the
// "Featured Members" section of the Organization page.
export const FeaturedMemberCard = ({ member }: { member: FeaturedMember }) => {
  const wcaId = member.wca_id ?? undefined;
  // null = not yet synced server-side; only then fall back to a WCA fetch.
  const shouldFetch = member.avatar_thumb_url == null && !!wcaId;

  const { data } = useQuery({
    queryKey: ["wca-person", wcaId],
    queryFn: () => fetchWcaPerson(wcaId as string),
    staleTime: 1000 * 60 * 60,
    enabled: shouldFetch,
  });

  const avatar = shouldFetch
    ? data && !data.avatarIsDefault
      ? data.avatarThumbUrl
      : undefined
    : member.avatar_thumb_url || undefined;
  const name = member.name ?? "";
  const role = localized(member, "role");
  const bio = localized(member, "bio");

  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        gap: 2,
        p: 2,
        borderRadius: 3,
        width: "100%",
        maxWidth: 560,
        alignItems: "flex-start",
      }}
    >
      <Avatar
        src={avatar}
        alt={name}
        sx={{ width: 72, height: 72, bgcolor: "grey.100", flexShrink: 0 }}
      >
        <AccountCircle
          sx={{ width: "100%", height: "100%" }}
          color="disabled"
        />
      </Avatar>

      <Box display="flex" flexDirection="column" gap={0.5}>
        <Typography fontWeight="bold">
          {wcaId ? (
            <Link
              href={LINKS.WCA.PROFILE + wcaId}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              color="inherit"
            >
              {name}
            </Link>
          ) : (
            name
          )}
        </Typography>

        {role && (
          <Typography variant="body2" color="primary" fontWeight={500}>
            {role}
          </Typography>
        )}

        {bio && (
          <Typography variant="body2" color="text.secondary">
            {bio}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};
