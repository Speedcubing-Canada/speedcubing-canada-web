import React, { useEffect, useState } from "react";
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
  ListItem,
  IconButton,
  Drawer,
} from "@mui/material";
import { Home, Info, CorporateFare, QuestionAnswer } from "@mui/icons-material";
import MenuIcon from '@mui/icons-material/Menu';
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { getLocaleOrFallback, SAVED_LOCALE } from "../locale";

const ROUTES = ["home", "about", "organization", "faq"] as const;

const ICONS = {
  home: Home,
  about: Info,
  organization: CorporateFare,
  faq: QuestionAnswer,
} as const;

const ROUTE_NAME_TO_ROUTE = {
  home: "",
  about: "about",
  organization: "organization",
  faq: "faq",
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

  const [width, setWidth] = React.useState(window.innerWidth);
  const breakpoint = 700;

  const [drawerState, setDrawerState] = useState(false);

  useEffect(() => {
    window.addEventListener("resize", () => setWidth(window.innerWidth));
  } , []);

  return (
    ( width > breakpoint
      ? <Box minHeight="100vh" flex={1} display="flex" flexDirection="column">
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
      : 
      <Box minHeight="90vh" flex={1} display="flex" flexDirection="column"> 
        <Paper
          sx={{ position: "sticky", top: 0, zIndex: 1000 }}
          elevation={2}
        >
          <IconButton onClick={() => setDrawerState(true)}>
            <MenuIcon sx={{ fontSize: 40, color: "black" }} />
          </IconButton>
        </Paper>
        <Drawer
          open={drawerState}
          anchor="left"
          onClose={() => setDrawerState(false)}
        >
          <List>
            {ROUTES.map((r) => {
              const Icon = ICONS[r];
              const route = ROUTE_NAME_TO_ROUTE[r];
              const routeWithLocale = `${locale}/${route}`;

              return (
                <ListItem key={r} disablePadding>
                  <ListItemButton component={Link} to={routeWithLocale} onClick={() => setDrawerState(false)}>
                    <ListItemIcon>
                      {<Icon />}
                    </ListItemIcon>
                    <ListItemText primary={t(`routes.${r}`)} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Drawer>
        <Box display="flex" flex={1}>
          <Outlet />
        </Box> 
      </Box>
    )
  );
};
