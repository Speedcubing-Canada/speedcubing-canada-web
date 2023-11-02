import { useTranslation } from "react-i18next";
import { styled } from "@mui/material/styles";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Instagram,
  FacebookOutlined,
  Twitter,
  Email,
} from "@mui/icons-material";
import { Box, Typography, useTheme } from "@mui/material";
import { Link } from "../components/Link";
import {
  getLocaleOrFallback,
  INVERTED_LOCALES,
  LOCALE_TO_LANGUAGE,
} from "../locale";
import { LINKS } from "./links";

const PREFIX = "Home";

const classes = {
  logo: `${PREFIX}-logo`,
  noTextDecoration: `${PREFIX}-noTextDecoration`,
  verticalLine: `${PREFIX}-verticalLine`,
};

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

  const StyledBox = styled(Box)({
    [`& .${classes.logo}`]: {
      maxWidth: "50vw",
      marginBottom: 2 * GAP,
      [theme.breakpoints.down("sm")]: {
        maxWidth: "75vw",
      },
    },
    [`& .${classes.noTextDecoration}`]: {
      textDecoration: "none",
    },
    [`& .${classes.verticalLine}`]: {
      width: "3px",
      height: "35px",
      background: "black",
    },
  });

  return (
    <StyledBox
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
        {SOCIAL_LINKS.map(({ Icon, to, nameKey }) => (
          <Link key={nameKey} to={to}>
            <Icon fontSize="large" htmlColor="black" titleAccess={t(nameKey)} />
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
    </StyledBox>
  );
};
