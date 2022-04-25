import {
  Box,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import { Home, Info, CorporateFare, QuestionAnswer } from "@mui/icons-material";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ROUTES = ["home", "about", "organization", "faq"] as const;
const ICONS = {
  home: Home,
  about: Info,
  organization: CorporateFare,
  faq: QuestionAnswer,
} as const;

export const Base = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const currentRoute = pathname === "/" ? "/home" : pathname;

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Outlet />
      <Paper
        sx={{ position: "sticky", bottom: 0, left: 0, right: 0, zIndex: 1100 }}
        elevation={2}
      >
        <BottomNavigation showLabels value={currentRoute}>
          {ROUTES.map((r) => {
            const Icon = ICONS[r];
            const route = `/${r}`;

            return (
              <BottomNavigationAction
                key={r}
                label={t(`routes.${r}`)}
                icon={<Icon />}
                to={route}
                value={route}
                component={Link}
              />
            );
          })}
          =
        </BottomNavigation>
      </Paper>
    </Box>
  );
};
