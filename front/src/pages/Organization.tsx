import { Box, Chip, Container, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { PersonCard } from "../components/PersonCard";
import { FeaturedMemberCard } from "../components/FeaturedMemberCard";
import { LoadingPageLinear } from "../components/LoadingPageLinear";
import { fetchDirectors, fetchFeaturedMembers } from "../helpers/fetchPeople";
import { fetchTeams } from "../helpers/fetchTeams";
import { localized } from "../helpers/localized";

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

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <Typography component="h2" variant="h4" fontWeight="bold" gutterBottom>
    {children}
  </Typography>
);

// Leaders first, otherwise stable (backend order).
const leaderFirst = (a: { is_leader: boolean }, b: { is_leader: boolean }) =>
  Number(b.is_leader) - Number(a.is_leader);

export const Organization = () => {
  const { t } = useTranslation();

  const { data: directors, isLoading: directorsLoading } = useQuery({
    queryKey: ["directors"],
    queryFn: fetchDirectors,
  });
  const { data: featured } = useQuery({
    queryKey: ["featured-members"],
    queryFn: fetchFeaturedMembers,
  });
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: fetchTeams,
  });

  if (directorsLoading || teamsLoading) {
    return <LoadingPageLinear />;
  }

  const directorsList = directors ?? [];
  const featuredList = featured ?? [];
  const teamsList = teams ?? [];

  return (
    <Container maxWidth="md">
      <Box marginY="4rem">
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {t("organization.title")}
        </Typography>
      </Box>

      {directorsList.length > 0 && (
        <Box marginY="4rem">
          <SectionHeading>{t("directors.title")}</SectionHeading>
          <CardGrid>
            {directorsList.map((director) => (
              <PersonCard
                key={director.id}
                wcaId={director.wca_id ?? undefined}
                name={director.name ?? ""}
                subtitle={
                  localized(director, "role") ?? t("directors.boardMember")
                }
              />
            ))}
          </CardGrid>
        </Box>
      )}

      {featuredList.length > 0 && (
        <Box marginY="4rem">
          <SectionHeading>{t("featuredMembers.title")}</SectionHeading>
          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            alignItems="center"
          >
            {featuredList.map((member) => (
              <FeaturedMemberCard key={member.id} member={member} />
            ))}
          </Box>
        </Box>
      )}

      {teamsList.length > 0 && (
        <Box marginY="4rem">
          <SectionHeading>{t("teams.title")}</SectionHeading>
          {teamsList.map((team) => {
            const description = localized(team, "description");
            return (
              <Box key={team.id} marginBottom="3rem">
                <Typography
                  component="h3"
                  variant="h5"
                  fontWeight="bold"
                  gutterBottom
                >
                  {localized(team, "name")}
                </Typography>
                {description && (
                  <Typography color="text.secondary" marginBottom="1rem">
                    {description}
                  </Typography>
                )}
                <CardGrid>
                  {[...team.members].sort(leaderFirst).map((member, index) => (
                    <PersonCard
                      key={member.wca_id ?? `${team.id}-${index}`}
                      wcaId={member.wca_id ?? undefined}
                      name={member.name}
                      chip={
                        member.is_leader ? (
                          <Chip
                            size="small"
                            color="primary"
                            label={t("teams.leader")}
                          />
                        ) : undefined
                      }
                    />
                  ))}
                </CardGrid>
              </Box>
            );
          })}
        </Box>
      )}
    </Container>
  );
};
