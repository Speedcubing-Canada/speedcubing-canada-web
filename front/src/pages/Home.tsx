import { useTranslation } from "react-i18next";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Instagram,
  FacebookOutlined,
  Twitter,
  Email,
} from "@mui/icons-material";
import { Box, Typography, useTheme } from "@mui/material";
import { ExternalLink } from "../components/ExternalLink";
import {
  getLocaleOrFallback,
  INVERTED_LOCALES,
  LOCALE_TO_LANGUAGE,
} from "../locale";
import { LINKS } from "./links";

const SOCIAL_LINKS = [
  {
    nameKey: "main.mailingList",
    to: LINKS.MAILING_LIST,
    Icon: Email,
  },
  {
    nameKey: "main.instagram",
    to: LINKS.INSTAGRAM,
    Icon: Instagram,
  },
  {
    nameKey: "main.facebook",
    to: LINKS.FACEBOOK,
    Icon: FacebookOutlined,
  },
  { nameKey: "main.twitter", to: LINKS.TWITTER, Icon: Twitter },
] as const;

const GAP = 12;
const GAP_PX = `${GAP}px`;

export const Home = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const params = useParams();
  const locale = getLocaleOrFallback(params.locale as string);

  const inverseLocale = INVERTED_LOCALES[locale];

  return (
    <Box
      flex={1}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        component="img"
        src="/logo.svg"
        alt="Speedcubing Canada"
        sx={{
          maxWidth: "50vw",
          marginBottom: `${2 * GAP}px`,
          [theme.breakpoints.down("sm")]: {
            maxWidth: "75vw",
          },
        }}
      />
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="center"
        gap={GAP_PX}
      >
        {SOCIAL_LINKS.map(({ Icon, to, nameKey }) => (
          <ExternalLink key={nameKey} to={to}>
            <Icon fontSize="large" htmlColor="black" titleAccess={t(nameKey)} />
          </ExternalLink>
        ))}
        <Box
          sx={{
            width: "3px",
            height: "35px",
            background: "black",
          }}
        />
        <Box
          component={RouterLink}
          to={`/${inverseLocale}`}
          sx={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <Box
            component="abbr"
            title={LOCALE_TO_LANGUAGE[inverseLocale]}
            sx={{ textDecoration: "none" }}
          >
            <Typography fontSize="24px" fontWeight="bold" color="black">
              {inverseLocale.toUpperCase()}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
