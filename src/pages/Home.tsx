import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Instagram,
  FacebookOutlined,
  Twitter,
  Email,
} from "@mui/icons-material";
import { Box, Typography, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Link } from "../components/Link";
import {
  getLocaleOrFallback,
  INVERTED_LOCALES,
  LOCALE_TO_LANGUAGE,
} from "../locale";
import { LINKS } from "./links";

const SOCIAL_LINKS = [
  {
    name: "Mailing list", // TODO: localization
    to: LINKS.MAILING_LIST,
    Icon: Email,
  },
  {
    name: "Instagram",
    to: LINKS.INSTAGRAM,
    Icon: Instagram,
  },
  {
    name: "Facebook",
    to: LINKS.FACEBOOK,
    Icon: FacebookOutlined,
  },
  { name: "Twitter", to: LINKS.TWITTER, Icon: Twitter },
] as const;

const GAP = 12;
const GAP_PX = `${GAP}px`;

export const Home = () => {
  const theme = useTheme();
  const params = useParams();
  const locale = getLocaleOrFallback(params.locale as string);

  const inverseLocale = INVERTED_LOCALES[locale];

  const useStyles = makeStyles({
    logo: {
      maxWidth: "50vw",
      marginBottom: 2 * GAP,
      [theme.breakpoints.down("sm")]: {
        maxWidth: "75vw",
      },
    },
    noTextDecoration: {
      textDecoration: "none",
    },
    verticalLine: {
      width: "3px",
      height: "35px",
      background: "black",
    },
  });

  const classes = useStyles();

  return (
    <Box
      flex={1}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <img src="/logo.svg" alt="Speedcubing Canada" className={classes.logo} />
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="center"
        gap={GAP_PX}
      >
        {SOCIAL_LINKS.map(({ Icon, to, name }) => (
          <Link key={name} to={to} aria-label={name}>
            <Icon fontSize="large" htmlColor="black" />
          </Link>
        ))}
        <div className={classes.verticalLine} />
        <RouterLink
          to={`/${inverseLocale}`}
          className={classes.noTextDecoration}
        >
          <abbr
            title={LOCALE_TO_LANGUAGE[inverseLocale]}
            className={classes.noTextDecoration}
          >
            <Typography fontSize="24px" fontWeight="bold" color="black">
              {inverseLocale.toUpperCase()}
            </Typography>
          </abbr>
        </RouterLink>
      </Box>
    </Box>
  );
};
