import {Admin, Resource, ShowGuesser} from "react-admin";
import UserIcon from "@mui/icons-material/Group";
import {useTranslation} from "react-i18next";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import {
    AlertColor,
    Box,
    Container, Typography,
} from "@mui/material";

import {UserList} from "../components/UserList";
import dataProvider from "../dataProvider";
import {useEffect, useState} from "react";
import httpClient from "../httpClient";
import {API_BASE_URL} from "../components/Api";
import {User} from "../components/Types";
import {AdminDashboard} from "../components/AdminDashboard";
import {UserEdit} from "../components/UserEdit";
import {UserShow} from "../components/UserShow";

export const checkAdmin = (user: User | null) => {
    return !!(user?.roles.includes("GLOBAL_ADMIN")
        || user?.roles.includes("DIRECTOR")
        || user?.roles.includes("WEBMASTER"));
}


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
                        <Admin basename="/admin" dataProvider={dataProvider} dashboard={AdminDashboard}>
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
