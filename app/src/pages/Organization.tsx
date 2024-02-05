import { AccountCircle, Download } from "@mui/icons-material";
import {
  ListSubheader,
  ListItemIcon,
  ListItemButton,
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Link } from "../components/Link";
import { DOCUMENT_TYPES, DOCUMENTS } from "./documents";

const DIRECTORS = [
  { name: "Kristopher De Asis", wcaId: "2008ASIS01" },
  { name: "Jonathan Esparaz", wcaId: "2013ESPA01" },
  { name: "Abdullah Gulab", wcaId: "2014GULA02" },
  { name: "Tarandeep Mittal", wcaId: "2014MITT02" },
  { name: "Liam Orovec", wcaId: "2014OROV01" },
] as const;

const WCA_PROFILE_URL = "https://www.worldcubeassociation.org/persons/";

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
        <List>
          {DIRECTORS.map(({ name, wcaId }) => (
            <ListItem
              key={wcaId}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="WCA Profile"
                  component={Link}
                  to={WCA_PROFILE_URL + wcaId}
                >
                  <AccountCircle />
                </IconButton>
              }
            >
              <ListItemText
                primary={name}
                secondary={t("directors.boardMember")}
              />
            </ListItem>
          ))}
        </List>
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
                component={Link}
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
