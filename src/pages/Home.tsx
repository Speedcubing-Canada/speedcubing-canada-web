import { Instagram, FacebookOutlined, Twitter } from "@mui/icons-material";
import { Box, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Link } from "../components/Link";

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    to: "https://www.instagram.com/speedcubingcanada/",
    Icon: Instagram,
  },
  {
    name: "Facebook",
    to: "https://www.facebook.com/speedcubingcan",
    Icon: FacebookOutlined,
  },
  { name: "Twitter", to: "https://twitter.com/SpeedcubingCAN", Icon: Twitter },
] as const;

const GAP = 12;
const GAP_PX = `${GAP}px`;

export const Home = () => {
  const theme = useTheme();

  const useStyles = makeStyles({
    logo: {
      maxWidth: "50vw",
      marginBottom: 2 * GAP,
      [theme.breakpoints.down("sm")]: {
        maxWidth: "75vw",
      },
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
      </Box>
    </Box>
  );
};
