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
import { DOCUMENT_TYPES, DOCUMENTS } from "./documents";

// Downloadable SCC documents plus the external officers spreadsheet. Split out of the
// Organization page (which now focuses on the board, featured members, and teams) into its
// own entry in the "information" navigation submenu.
export const Documents = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md">
      <Box marginY="4rem">
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {t("documents.title")}
        </Typography>
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
