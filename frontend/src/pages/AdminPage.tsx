import {useEffect, useState} from "react";
import {Admin, Resource, AppBar, TitlePortal, Layout, LayoutProps} from "react-admin";
import UserIcon from "@mui/icons-material/Group";
import {useTranslation} from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import {
    Box,
    Container,
} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import {IconButton} from '@mui/material';

import {UserList} from "../components/UserList";
import dataProvider from "../dataProvider";
import httpClient from "../httpClient";
import {API_BASE_URL} from "../components/Api";
import {User} from "../components/Types";
import {AdminDashboard} from "../components/AdminDashboard";
import {UserEdit} from "../components/UserEdit";
import {UserShow} from "../components/UserShow";
import {i18nProvider} from "../i18nProvider";

export const checkAdmin = (user: User | null) => {
    return !!(user?.roles.includes("GLOBAL_ADMIN")
        || user?.roles.includes("DIRECTOR")
        || user?.roles.includes("WEBMASTER"));
}

const SettingsButton = () => (
    <IconButton color="inherit" href="/">
        <HomeIcon/>
    </IconButton>
);

const MyAppBar = () => (
    <AppBar>
        <TitlePortal/>
        <SettingsButton/>
    </AppBar>
);
const MyLayout = (props: JSX.IntrinsicAttributes & LayoutProps) => <Layout {...props} appBar={MyAppBar}/>;

export const AdminPage = () => {
    const {t} = useTranslation();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const resp = await httpClient.get(API_BASE_URL + "/user_info");
                setUser(resp.data);

            } catch (error) {
                console.log("Not authenticated");
            }
            setLoading(false);
        })();
    }, []);


    const isAdmin = checkAdmin(user);

    return (
        <div>
            {loading ? <Container sx={{py: 8}} maxWidth="md">
                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <CircularProgress/>
                    </Box>
                </Container>
                : isAdmin ? (
                        <Admin basename="/admin"
                               dataProvider={dataProvider}
                               i18nProvider={i18nProvider}
                               dashboard={AdminDashboard}
                               layout={MyLayout}>
                            <Resource name="Users"
                                      list={UserList}
                                      show={UserShow}
                                      edit={UserEdit}
                                      icon={UserIcon}
                                      recordRepresentation="name"/>

                        </Admin>)
                    :
                    <Container sx={{py: 8}} maxWidth="md">
                        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <Alert severity="error">You are not authorized to access this page.</Alert>
                        </Box>
                    </Container>
            }
        </div>
    );
}
