import { Download, OpenInNew } from "@mui/icons-material";
import {
  ListSubheader,
  ListItemIcon,
  ListItemButton,
  Box,
  Container,
  Typography,
  List,
  ListItemText,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { ExternalLink } from "../components/ExternalLink";
import { PersonCard } from "../components/PersonCard";
import { DOCUMENT_TYPES, DOCUMENTS } from "./documents";

export const DIRECTORS = [
  { name: "Kristopher De Asis", wcaId: "2008ASIS01" },
  { name: "Joanne Chew", wcaId: "2024CHEW09" },
  { name: "Alex Mutch", wcaId: "2014MUTC01" },
] as const;

export const Organization = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md">
      <Box marginY="4rem">
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {t("organization.title")}
        </Typography>
      </Box>

      <Box marginY="4rem">
        <Typography component="h2" variant="h4" fontWeight="bold" gutterBottom>
          {t("directors.title")}
        </Typography>
        <Box
          display="flex"
          flexWrap="wrap"
          gap={3}
          justifyContent={{ xs: "center", sm: "flex-start" }}
        >
          {DIRECTORS.map(({ name, wcaId }) => (
            <PersonCard
              key={wcaId}
              wcaId={wcaId}
              name={name}
              subtitle={t("directors.boardMember")}
            />
          ))}
        </Box>
      </Box>

      <Box marginY="4rem">
        <Typography component="h2" variant="h4" fontWeight="bold" gutterBottom>
          {t("officers.title")}
        </Typography>
        <ListItemButton
          component={ExternalLink}
          to="https://docs.google.com/spreadsheets/d/1qZAEH93FfKqOO3gqJPVNPezUHKgBaM8pg2zetBEE4Js/edit?usp=sharing"
        >
          <ListItemIcon>
            <OpenInNew />
          </ListItemIcon>
          <ListItemText primary={t("officers.list")} />
        </ListItemButton>
      </Box>

      <Box marginY="4rem">
        <Typography component="h2" variant="h4" fontWeight="bold" gutterBottom>
          {t("documents.title")}
        </Typography>
        {DOCUMENT_TYPES.map((documentType) => (
          <List
            key={documentType}
            subheader={
              <ListSubheader component="div" id="nested-list-subheader">
                {t(`documents.${documentType}`)}
              </ListSubheader>
            }
          >
            {DOCUMENTS[documentType].map(({ name, id }) => (
              <ListItemButton
                key={id}
                component={ExternalLink}
                to={`/documents/${id}.pdf`}
              >
                <ListItemIcon>
                  <Download />
                </ListItemIcon>
                <ListItemText primary={name} />
              </ListItemButton>
            ))}
          </List>
        ))}
      </Box>
    </Container>
  );
};
