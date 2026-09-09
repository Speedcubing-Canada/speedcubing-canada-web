import { useEffect, useState } from "react";
import {
  Admin,
  Resource,
  AppBar,
  TitlePortal,
  Layout,
  LayoutProps,
} from "react-admin";
import UserIcon from "@mui/icons-material/Group";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import GavelIcon from "@mui/icons-material/Gavel";
import StarIcon from "@mui/icons-material/Star";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { Box, Container } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { IconButton } from "@mui/material";

import { UserList } from "../components/UserList";
import { ChampionshipList } from "../components/ChampionshipList";
import { ChampionshipEdit } from "../components/ChampionshipEdit";
import { ChampionshipCreate } from "../components/ChampionshipCreate";
import { ChampionshipShow } from "../components/ChampionshipShow";
import { TeamList } from "../components/TeamList";
import { TeamEdit } from "../components/TeamEdit";
import { TeamCreate } from "../components/TeamCreate";
import { TeamShow } from "../components/TeamShow";
import { PersonList } from "../components/PersonList";
import { PersonEdit } from "../components/PersonEdit";
import { PersonCreate } from "../components/PersonCreate";
import { PersonShow } from "../components/PersonShow";
import dataProvider from "../dataProvider";
import httpClient from "../httpClient";
import { API_BASE_URL } from "../components/api";
import { User } from "../types";
import { AdminDashboard } from "../components/AdminDashboard";
import { UserEdit } from "../components/UserEdit";
import { UserShow } from "../components/UserShow";
import { i18nProvider } from "../i18nProvider";
import { isAdmin } from "../components/roles";

export const AdminPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const response = await httpClient.get<User>(API_BASE_URL + "/user_info");
      if (response.ok && response.data) {
        setUser(response.data);
      } // the else case is expected when user is not logged in (401)
      setLoading(false);
    })();
  }, []);

  const userIsAdmin = isAdmin(user);

  return (
    <div>
      {loading ? (
        <Container sx={{ py: 8 }} maxWidth="md">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        </Container>
      ) : userIsAdmin ? (
        <Admin
          basename="/admin"
          dataProvider={dataProvider}
          i18nProvider={i18nProvider}
          dashboard={() => <AdminDashboard user={user} />}
          layout={MyLayout}
        >
          <Resource
            name="Users"
            list={UserList}
            show={UserShow}
            edit={UserEdit}
            icon={UserIcon}
            recordRepresentation="name"
          />
          {/*
            Resource name is "ChampionshipsAdmin", not "Championships", on purpose:
            react-admin derives the URL from the name (/admin/Championships), and
            react-router would match that case-insensitively against the public
            /:locale/championships map route (locale="admin"), which outranks
            /admin/* on specificity - sending the menu click to the map. A distinct
            token keeps the admin URL out of that collision. The menu label still
            reads "Championships" via the resources.ChampionshipsAdmin i18n key.
          */}
          <Resource
            name="ChampionshipsAdmin"
            list={ChampionshipList}
            show={ChampionshipShow}
            edit={ChampionshipEdit}
            create={ChampionshipCreate}
            icon={EmojiEventsIcon}
            recordRepresentation="competition_name"
          />
          {/* "…Admin" suffix on every resource name for the same route-collision reason
              documented above (TeamsAdmin, DirectorsAdmin, FeaturedMembersAdmin). */}
          <Resource
            name="TeamsAdmin"
            list={TeamList}
            show={TeamShow}
            edit={TeamEdit}
            create={TeamCreate}
            icon={GroupsIcon}
            recordRepresentation="name_en"
          />
          <Resource
            name="DirectorsAdmin"
            list={PersonList}
            show={PersonShow}
            edit={PersonEdit}
            create={PersonCreate}
            icon={GavelIcon}
            recordRepresentation="name"
          />
          <Resource
            name="FeaturedMembersAdmin"
            list={PersonList}
            show={PersonShow}
            edit={PersonEdit}
            create={PersonCreate}
            icon={StarIcon}
            recordRepresentation="name"
          />
        </Admin>
      ) : (
        <Container sx={{ py: 8 }} maxWidth="md">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Alert severity="error">
              You are not authorized to access this page.
            </Alert>
          </Box>
        </Container>
      )}
    </div>
  );
};

const SettingsButton = () => (
  <IconButton color="inherit" href="/">
    <HomeIcon />
  </IconButton>
);

const MyAppBar = () => (
  <AppBar>
    <TitlePortal />
    <SettingsButton />
  </AppBar>
);

const MyLayout = (props: JSX.IntrinsicAttributes & LayoutProps) => (
  <Layout {...props} appBar={MyAppBar} />
);
