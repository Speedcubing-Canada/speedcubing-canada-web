import { Suspense, useEffect, useState } from "react";
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
  Menu,
  MenuItem,
  Collapse,
  useMediaQuery,
  Theme,
  useTheme,
} from "@mui/material";

import {
  Home,
  Info,
  CorporateFare,
  QuestionAnswer,
  Groups,
  Segment,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  AccountCircle,
  Leaderboard,
  EmojiEvents,
  Description,
} from "@mui/icons-material";

import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { getLocaleOrFallback, SAVED_LOCALE_KEY } from "../locale";
import { LoadingPageLinear } from "./LoadingPageLinear";
import { useScrollbarWidth } from "../helpers/scrollbarWidth";
import { useBodyScrollable } from "../helpers/useBodyScrollable";

// Flat list of every public leaf route. App.tsx maps over this to generate the
// locale-less redirects (e.g. "/about" -> "/en/about"), so it must contain
// every navigable page (but not the "information" grouping, which has no page).
export const ROUTE_NAMES = [
  "home",
  "about",
  "organization",
  "faq",
  "delegates",
  "documents",
  "rankings",
  "championships",
  "account",
] as const;

const ICONS = {
  home: Home,
  about: Info,
  organization: CorporateFare,
  faq: QuestionAnswer,
  delegates: Groups,
  documents: Description,
  account: AccountCircle,
  rankings: Leaderboard,
  championships: EmojiEvents,
} as const;

const ROUTE_NAME_TO_PATH = {
  home: "",
  about: "about",
  organization: "organization",
  faq: "faq",
  delegates: "delegates",
  documents: "documents",
  rankings: "rankings",
  championships: "championships",
  account: "account",
} as const;

type RouteName = (typeof ROUTE_NAMES)[number];

// The bottom bar / drawer is a shallow tree: mostly single leaves, plus one
// "information" group that expands to a handful of secondary pages.
const INFORMATION_GROUP = "information" as const;

type NavItem =
  | { kind: "leaf"; routeName: RouteName }
  | {
      kind: "group";
      groupName: typeof INFORMATION_GROUP;
      Icon: (typeof ICONS)[keyof typeof ICONS];
      children: RouteName[];
    };

const NAV_ITEMS: NavItem[] = [
  { kind: "leaf", routeName: "home" },
  {
    kind: "group",
    groupName: INFORMATION_GROUP,
    Icon: Segment,
    children: ["about", "organization", "faq", "delegates", "documents"],
  },
  { kind: "leaf", routeName: "rankings" },
  { kind: "leaf", routeName: "championships" },
  { kind: "leaf", routeName: "account" },
];

const INFORMATION_CHILDREN =
  (NAV_ITEMS.find(
    (item): item is Extract<NavItem, { kind: "group" }> =>
      item.kind === "group",
  )?.children as RouteName[]) ?? [];

export const Base = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const params = useParams();
  const savedLocale = localStorage.getItem(SAVED_LOCALE_KEY) ?? "";
  const hasLocaleParam = Boolean(params.locale);
  // page path after the locale segment, e.g. "/en/organization/" -> "organization",
  // "/en" and "/en/" -> "" (Home). Province pages (/qc, /bc, ...) have no locale param.
  const pathSegments = pathname.split("/").filter(Boolean);
  const pathWithoutLocale = hasLocaleParam
    ? pathSegments[1] ?? ""
    : pathSegments[0] ?? "";
  const locale = hasLocaleParam
    ? getLocaleOrFallback(params.locale as string)
    : getLocaleOrFallback(savedLocale);
  const theme = useTheme();
  const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Whether the current page is one of the "information" sub-pages.
  const isInformationActive = INFORMATION_CHILDREN.some(
    (routeName) => ROUTE_NAME_TO_PATH[routeName] === pathWithoutLocale,
  );

  const [isInformationExpanded, setIsInformationExpanded] =
    useState(isInformationActive);

  useEffect(() => {
    if (!hasLocaleParam) {
      return;
    }

    localStorage.setItem(SAVED_LOCALE_KEY, locale);
    i18n.changeLanguage(locale);
  }, [hasLocaleParam, locale]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setIsDrawerOpen(false);
    setMenuAnchor(null);
  }, [pathname]);

  const bodyScrollable = useBodyScrollable();
  const scrollbarWidth = useScrollbarWidth();
  const paddingWidth = bodyScrollable ? 0 : scrollbarWidth;

  // Value that highlights the selected bottom-nav action. Sub-pages highlight
  // the "information" group instead of any single leaf.
  const activeBottomValue = isInformationActive
    ? INFORMATION_GROUP
    : pathWithoutLocale;

  const renderDrawerLeaf = (routeName: RouteName, nested = false) => {
    const path = ROUTE_NAME_TO_PATH[routeName];
    const Icon = ICONS[routeName];
    const color =
      pathWithoutLocale === path ? theme.palette.primary.main : undefined;

    return (
      <ListItemButton
        key={routeName}
        component={Link}
        to={`${locale}/${path}`}
        sx={nested ? { pl: 4 } : undefined}
        onClick={() => {
          if (pathWithoutLocale === path) {
            setIsDrawerOpen(false);
          }
        }}
      >
        <ListItemIcon sx={{ color }}>
          <Icon />
        </ListItemIcon>
        <ListItemText primary={t(`routes.${routeName}`)} sx={{ color }} />
      </ListItemButton>
    );
  };

  return (
    <Box
      minHeight={isSmall ? "90vh" : "100vh"}
      flex={1}
      display="flex"
      flexDirection="column"
    >
      {isSmall && (
        <>
          <Paper
            sx={{ position: "sticky", top: 0, zIndex: 1100 }}
            elevation={2}
          >
            <IconButton onClick={() => setIsDrawerOpen(true)}>
              <MenuIcon sx={{ fontSize: 40, color: "black" }} />
            </IconButton>
          </Paper>
          <Drawer
            open={isDrawerOpen}
            anchor="left"
            onClose={() => setIsDrawerOpen(false)}
          >
            <List>
              {NAV_ITEMS.map((item) => {
                if (item.kind === "leaf") {
                  return renderDrawerLeaf(item.routeName);
                }

                const color = isInformationActive
                  ? theme.palette.primary.main
                  : undefined;

                return (
                  <Box key={item.groupName}>
                    <ListItemButton
                      onClick={() =>
                        setIsInformationExpanded((expanded) => !expanded)
                      }
                    >
                      <ListItemIcon sx={{ color }}>
                        <item.Icon />
                      </ListItemIcon>
                      <ListItemText
                        primary={t(`routes.${item.groupName}`)}
                        sx={{ color }}
                      />
                      {isInformationExpanded ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse
                      in={isInformationExpanded}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List disablePadding>
                        {item.children.map((routeName) =>
                          renderDrawerLeaf(routeName, true),
                        )}
                      </List>
                    </Collapse>
                  </Box>
                );
              })}
            </List>
          </Drawer>
        </>
      )}
      <Box display="flex" flex={1}>
        <Suspense fallback={<LoadingPageLinear />}>
          <Outlet />
        </Suspense>
      </Box>
      {!isSmall && (
        <Paper
          sx={{
            position: "sticky",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
          }}
          elevation={2}
        >
          <BottomNavigation
            showLabels
            value={activeBottomValue}
            sx={{
              paddingRight: `${paddingWidth}px`,
            }}
          >
            {NAV_ITEMS.map((item) => {
              if (item.kind === "leaf") {
                const path = ROUTE_NAME_TO_PATH[item.routeName];
                const Icon = ICONS[item.routeName];

                return (
                  <BottomNavigationAction
                    key={item.routeName}
                    label={t(`routes.${item.routeName}`)}
                    component={Link}
                    to={`${locale}/${path}`}
                    icon={<Icon />}
                    value={path}
                  />
                );
              }

              return (
                <BottomNavigationAction
                  key={item.groupName}
                  label={t(`routes.${item.groupName}`)}
                  icon={<item.Icon />}
                  value={item.groupName}
                  onClick={(event) => setMenuAnchor(event.currentTarget)}
                />
              );
            })}
          </BottomNavigation>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            transformOrigin={{ vertical: "bottom", horizontal: "center" }}
            MenuListProps={{ sx: { py: 0 } }}
            PaperProps={{
              elevation: 0,
              sx: {
                mb: 1.25,
                p: 0.5,
                minWidth: 208,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                overflow: "visible",
              },
            }}
          >
            {INFORMATION_CHILDREN.map((routeName) => {
              const path = ROUTE_NAME_TO_PATH[routeName];
              const Icon = ICONS[routeName];

              return (
                <MenuItem
                  key={routeName}
                  component={Link}
                  to={`${locale}/${path}`}
                  selected={pathWithoutLocale === path}
                  onClick={() => setMenuAnchor(null)}
                  sx={{
                    borderRadius: 1.5,
                    py: 1,
                    px: 1.5,
                    minHeight: 44,
                    "& .MuiListItemIcon-root": { minWidth: 36 },
                    "&.Mui-selected": {
                      backgroundColor: "action.selected",
                      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
                        color: "primary.main",
                      },
                    },
                  }}
                >
                  <ListItemIcon>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText
                    primaryTypographyProps={{
                      fontWeight: 500,
                      letterSpacing: 0.2,
                    }}
                  >
                    {t(`routes.${routeName}`)}
                  </ListItemText>
                </MenuItem>
              );
            })}
          </Menu>
        </Paper>
      )}
    </Box>
  );
};
