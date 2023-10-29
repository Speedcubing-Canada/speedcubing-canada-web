import { useEffect, useState } from "react";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import {
  Box,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  List,
  ListItemIcon,
  ListItemButton,
  ListItemText,
  IconButton,
  Drawer,
  useMediaQuery,
  Theme,
  useTheme,
} from "@mui/material";
import {
  Home,
  Info,
  CorporateFare,
  QuestionAnswer,
  Menu,
  Stadium,
} from "@mui/icons-material";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { getLocaleOrFallback, SAVED_LOCALE } from "../locale";

const ROUTE_NAMES = [
  "home",
  "about",
  "organization",
  "faq",
  "competitions",
] as const;

const ICONS = {
  home: Home,
  about: Info,
  organization: CorporateFare,
  faq: QuestionAnswer,
  competitions: Stadium,
} as const;

const ROUTE_NAME_TO_PATH = {
  home: "",
  about: "about",
  organization: "organization",
  faq: "faq",
  competitions: "competitions",
} as const;

type RouteName = (typeof ROUTE_NAMES)[number];
type NavigationIcon = (typeof ICONS)[keyof typeof ICONS];
type Path = (typeof ROUTE_NAME_TO_PATH)[keyof typeof ROUTE_NAME_TO_PATH];
type PathWithLocale = `${ReturnType<typeof getLocaleOrFallback>}/${Path}`;

type NavigationBarItem = {
  routeName: RouteName;
  Icon: NavigationIcon;
  path: Path;
  pathWithLocale: PathWithLocale;
};

export const Base = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const pathWithoutLocale = pathname.split("/").at(-1);
  const params = useParams();
  const locale = getLocaleOrFallback(params.locale as string);
  const theme = useTheme();
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(SAVED_LOCALE, locale);
    i18n.changeLanguage(locale);
  }, [locale]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathWithoutLocale]);

  const navigationBarItems: NavigationBarItem[] = ROUTE_NAMES.map(
    (routeName) => {
      const path = ROUTE_NAME_TO_PATH[routeName];

      return {
        routeName,
        Icon: ICONS[routeName],
        path,
        pathWithLocale: `${locale}/${path}`,
      };
    },
  );

  return isSmall ? (
    <Box minHeight="90vh" flex={1} display="flex" flexDirection="column">
      <Paper sx={{ position: "sticky", top: 0, zIndex: 1100 }} elevation={2}>
        <IconButton onClick={() => setIsDrawerOpen(true)}>
          <Menu sx={{ fontSize: 40, color: "black" }} />
        </IconButton>
      </Paper>
      <Drawer
        open={isDrawerOpen}
        anchor="left"
        onClose={() => setIsDrawerOpen(false)}
      >
        <List>
          {navigationBarItems.map(
            ({ routeName, Icon, path, pathWithLocale }) => {
              const color =
                pathWithoutLocale === path
                  ? theme.palette.primary.main
                  : undefined;

              return (
                <ListItemButton
                  key={routeName}
                  component={Link}
                  to={pathWithLocale}
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <ListItemIcon sx={{ color }}>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={t(`routes.${routeName}`)}
                    sx={{ color }}
                  />
                </ListItemButton>
              );
            },
          )}
        </List>
      </Drawer>
      <Box display="flex" flex={1}>
        <Outlet />
      </Box>
    </Box>
  ) : (
    <Box minHeight="100vh" flex={1} display="flex" flexDirection="column">
      <Box display="flex" flex={1}>
        <Outlet />
      </Box>
      <Paper
        sx={{ position: "sticky", bottom: 0, left: 0, right: 0, zIndex: 1100 }}
        elevation={2}
      >
        <BottomNavigation showLabels value={pathWithoutLocale}>
          {navigationBarItems.map(
            ({ routeName, Icon, path, pathWithLocale }) => (
              <BottomNavigationAction
                key={routeName}
                label={t(`routes.${routeName}`)}
                component={Link}
                to={pathWithLocale}
                icon={<Icon />}
                value={path}
              />
            ),
          )}
        </BottomNavigation>
      </Paper>
    </Box>
  );
};
