import { Box, Container, Typography } from "@mui/material";
import { useTranslation, Trans } from "react-i18next";
import { ExternalLink } from "../components/ExternalLink";
import { LINKS } from "./links";

const QUESTIONS = [
  "when-is-the-next-wca-competition-in-my-area",
  "im-going-to-my-first-wca-competition-what-do-i-need-to-know",
  "who-are-the-wca-delegates-in-my-area",
  "why-doesnt-my-name-appear-on-the-rankings",
  "why-does-this-person-appear-in-my-province",
  "how-can-i-volunteer-with-speedcubing-canada",
  "affiliated-with-the-wca",
  "why-the-change-from-canadiancubing-to-speedcubing-canada",
] as const;

export const FAQ = () => {
  const { t, i18n } = useTranslation();

  const INTERPOLATE = {
    "when-is-the-next-wca-competition-in-my-area": {
      wcaComps: <ExternalLink to={LINKS.WCA.COMPS_CANADA} />,
      mailingList: <ExternalLink to={LINKS.MAILING_LIST} />,
    },
    "im-going-to-my-first-wca-competition-what-do-i-need-to-know": {
      regs: <ExternalLink to={LINKS.WCA.REGS} />,
      firstComp: (
        <ExternalLink
          to={i18n.language === "fr" ? LINKS.FIRST_COMP_FR : LINKS.FIRST_COMP}
        />
      ),
      compBasics: (
        <ExternalLink
          to={i18n.language === "fr" ? LINKS.COMP_BASICS_FR : LINKS.COMP_BASICS}
        />
      ),
    },
    "who-are-the-wca-delegates-in-my-area": {
      delegates: <ExternalLink to={LINKS.WCA.DELEGATES} />,
    },
    "why-doesnt-my-name-appear-on-the-rankings": {
      wca: <ExternalLink to={LINKS.WCA.HOME} />,
    },
    "why-does-this-person-appear-in-my-province": {
      report: <ExternalLink to={LINKS.REPORT} />,
    },
    "how-can-i-volunteer-with-speedcubing-canada": {},
    "affiliated-with-the-wca": {
      regionalOrg: <ExternalLink to={LINKS.WCA.REGIONAL_ORGS} />,
    },
    "why-the-change-from-canadiancubing-to-speedcubing-canada": {},
  } as const;

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
