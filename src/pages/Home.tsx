import { Instagram, FacebookOutlined, Twitter } from "@mui/icons-material";
import { Container, Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
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

export const Home = () => {
  const { t } = useTranslation();

  return (
    <Box flex={1} display="flex" flexDirection="column" justifyContent="center">
      <Container maxWidth="md">
        <Typography
          component="h1"
          variant="h3"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
        >
          {t("main.sc")}
        </Typography>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="center"
          gap="12px"
        >
          {SOCIAL_LINKS.map(({ Icon, to, name }) => (
            <Link key={name} to={to} aria-label={name}>
              <Icon fontSize="large" htmlColor="black" />
            </Link>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
