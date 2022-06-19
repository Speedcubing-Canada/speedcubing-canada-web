import { Box, Container, Typography } from "@mui/material";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "../components/Link";

const QUESTIONS = [
  "when-is-the-next-wca-competition-in-my-area",
  "im-going-to-my-first-wca-competition-what-do-i-need-to-know",
  "who-are-the-wca-delegates-in-my-area",
  "how-can-i-organize-a-wca-competition",
  "how-can-i-volunteer-with-speedcubing-canada",
  "affiliated-with-the-wca",
  "why-the-change-from-canadiancubing-to-speedcubing-canada",
] as const;

const INTERPOLATE = {
  "when-is-the-next-wca-competition-in-my-area": {
    wcaComps: (
      <Link to="https://www.worldcubeassociation.org/competitions?region=Canada" />
    ),
  },
  "im-going-to-my-first-wca-competition-what-do-i-need-to-know": {
    regs: <Link to="https://www.worldcubeassociation.org/regulations/" />,
    tutorial: <Link to="https://www.youtube.com/watch?v=dPL3eV-A0ww" />,
  },
  "who-are-the-wca-delegates-in-my-area": {
    delegates: <Link to="https://www.worldcubeassociation.org/delegates" />,
  },
  "how-can-i-organize-a-wca-competition": {
    delegates: <Link to="https://www.worldcubeassociation.org/delegates" />,
    orgGuidelines: (
      <Link to="https://www.worldcubeassociation.org/organizer-guidelines" />
    ),
  },
  "how-can-i-volunteer-with-speedcubing-canada": {},
  "affiliated-with-the-wca": {
    regionalOrg: (
      <Link to="https://www.worldcubeassociation.org/organizations" />
    ),
  },
  "why-the-change-from-canadiancubing-to-speedcubing-canada": {},
} as const;

export const FAQ = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md">
      <Box marginY="4rem">
        <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
          {t("faq.title")}
        </Typography>

        {QUESTIONS.map((key) => (
          <Box marginY="2rem" key={key}>
            <Typography
              component="h2"
              variant="h5"
              fontWeight="bold"
              gutterBottom
            >
              {t(`faq.${key}.q`)}
            </Typography>
            <Typography gutterBottom>
              <Trans components={INTERPOLATE[key]}>{t(`faq.${key}.a`)}</Trans>
            </Typography>
          </Box>
        ))}
      </Box>
    </Container>
  );
};
