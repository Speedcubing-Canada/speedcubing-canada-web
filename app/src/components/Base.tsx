import { useEffect } from "react";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import {
  Box,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import {
  Home,
  Info,
  CorporateFare,
  QuestionAnswer,
  AccountCircle,
  Leaderboard,
} from "@mui/icons-material";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { getLocaleOrFallback, SAVED_LOCALE } from "../locale";

const ROUTES = [
  "home",
  "about",
  "organization",
  "faq",
  "rankings",
  "account",
] as const;

const ICONS = {
  home: Home,
  about: Info,
  organization: CorporateFare,
  faq: QuestionAnswer,
  account: AccountCircle,
  rankings: Leaderboard,
} as const;

const ROUTE_NAME_TO_ROUTE = {
  home: "",
  about: "about",
  organization: "organization",
  faq: "faq",
  rankings: "rankings",
  account: "account",
} as const;

export const Base = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const pathWithoutLocale = pathname.split("/").at(-1);
  const params = useParams();
  const locale = getLocaleOrFallback(params.locale as string);

  useEffect(() => {
    localStorage.setItem(SAVED_LOCALE, locale);
    i18n.changeLanguage(locale);
  }, [locale]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathWithoutLocale]);

  return (
    <Box minHeight="100vh" flex={1} display="flex" flexDirection="column">
      <Box display="flex" flex={1}>
        <Outlet />
      </Box>
      <Paper
        sx={{ position: "sticky", bottom: 0, left: 0, right: 0, zIndex: 1100 }}
        elevation={2}
      >
        <BottomNavigation showLabels value={pathWithoutLocale}>
          {ROUTES.map((r) => {
            const Icon = ICONS[r];
            const route = ROUTE_NAME_TO_ROUTE[r];
            const routeWithLocale = `${locale}/${route}`;

            return (
              <BottomNavigationAction
                key={r}
                label={t(`routes.${r}`)}
                icon={<Icon />}
                to={routeWithLocale}
                value={route}
                component={Link}
              />
            );
          })}
        </BottomNavigation>
      </Paper>
    </Box>
  );
};
