import {Trans, useTranslation} from "react-i18next";
import {useEffect, useReducer, useState} from "react";
import {
    AlertColor,
    Box,
    Container, Typography,
} from "@mui/material";
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import {DateField} from "@mui/x-date-pickers";
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import {styled} from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from "dayjs";

import {API_BASE_URL, signIn, signOut} from '../components/Api';
import {Province, ChipData, chipColor, User, State, Action} from "../components/Types";
import httpClient from "../httpClient";
import {getProvincesWithNA} from "../components/Provinces";


const initialState: State = {
    alert: false,
    alertType: "error",
    alertContent: ""
};

const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case "SHOW_ALERT":
            return {
                ...state,
                alert: true,
                alertType: action.alertType,
                alertContent: action.alertContent
            };
        case "HIDE_ALERT":
            return {
                ...state,
                alert: false
            };
        default:
            return state;
    }
};


export const Account = () => {
    const {t} = useTranslation();

    const [province, setProvince] = useState<Province | null>(null);
    const [chipData, setChipData] = useState<readonly ChipData[]>([]);

    const [state, dispatch] = useReducer(reducer, initialState);

    const provinces: Province[] = getProvincesWithNA();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const defaultProvince : Province = provinces.find(({ id }) => id === user?.province) || {label: 'N/A', id: 'na', region: 'N/A', region_id: 'na'}
    const defaultDOB = user?.dob ? dayjs(user.dob) : dayjs('2022-01-01');
    const defaultWCAID = user?.wca_person || "";


    const showAlert = (alertType: AlertColor, alertContent: string) => {
        dispatch({
            type: "SHOW_ALERT",
            alertType,
            alertContent
        });
    };

    const hideAlert = () => {
        dispatch({
            type: "HIDE_ALERT"
        });
    };

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

    if (user != null) {
        if (user.roles != null && user.roles.length > 0 && chipData.length === 0) {
            let tmpChipData = [];
            for (let i = 0; i < user.roles.length; i++) {
                tmpChipData.push({key: i, label: user.roles[i]});
            }
            setChipData(tmpChipData);
        }
    }


    const ListItem = styled('li')(({theme}) => ({
        margin: theme.spacing(0.5),
    }));


    const handleSaveProfile = async () => {
        hideAlert();
        try {
            const resp = await httpClient.post(API_BASE_URL + "/edit", {
                province: province ? province.id : 'na',
            });
            if (resp.data.success === true) {
                showAlert("success", t("account.success"));
            } else {
                showAlert("error", t("account.error"));
            }
        } catch (error: any) {
            if (error.response.status === 401) {
                console.log("Invalid credentials" + error.response.status);
            } else if (error.response.status === 403) {
                console.log("Forbidden" + error.response.status);
            } else if (error.response.status === 404) {
                console.log("Not found" + error.response.status);
            }
        }
    };

    const handleSignIn = async () => {
        setLoading(true);
        signIn();
    }

    return (
        <Container maxWidth="md">
            <Box marginY="4rem">
                <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
                    {t("account.title")}
                </Typography>
            </Box>
            {loading ? <CircularProgress/>
                : user != null ? (
                    <div>
                        <Box marginY="2rem">
                            <Typography
                                component="h2"
                                variant="h5"
                                fontWeight="bold"
                                gutterBottom
                                marginY="1rem"
                            >
                                {t("account.hi")}{user.name}!
                            </Typography>

                            <Autocomplete
                                disablePortal
                                id="combo-box-demo"
                                options={provinces}
                                sx={{width: 300}}
                                value={province || defaultProvince}
                                defaultValue={defaultProvince}
                                onChange={(event, newValue) => {
                                    setProvince(newValue);
                                    if (newValue?.id === "qc") {
                                        console.log("Vive le Québec libre!");
                                    }
                                }}
                                renderInput={(params) => <TextField {...params} label="Province"/>}
                                getOptionLabel={(option) => t('provinces.' + option.id)}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                            />
                            <Typography variant="subtitle2" gutterBottom>
                                <Trans>{t("account.policy")} </Trans>
                            </Typography>

                            <Stack direction="row" spacing={2} alignItems="center" marginY="1rem">
                                <TextField
                                    disabled
                                    id="region"
                                    label={t("account.region")}
                                    value={province ? t('regions.' + province?.region_id) : t('regions.' + defaultProvince.region_id)}
                                    variant="outlined"
                                />
                                <TextField
                                    disabled
                                    id="wcaid"
                                    label="WCAID"
                                    defaultValue={defaultWCAID}
                                    variant="outlined"
                                />
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateField
                                        disabled
                                        label={t("account.dob")}
                                        defaultValue={defaultDOB}
                                        format="DD-MM-YYYY"
                                    />
                                </LocalizationProvider>
                            </Stack>
                            <Typography variant="subtitle2" gutterBottom>
                                {t("account.roles")}
                            </Typography>
                            <Paper
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    flexWrap: 'wrap',
                                    listStyle: 'none',
                                    p: 0.5,
                                    m: 0,
                                }}
                                component="ul"
                            >
                                {chipData.map((data) => {
                                    const color: chipColor | undefined = data.label === 'GLOBAL_ADMIN' ? "primary" : "default"

                                    return (
                                        <ListItem key={data.key}>
                                            <Chip
                                                color={color}
                                                label={t("account.role." + data.label) || data.label}
                                            />
                                        </ListItem>
                                    );
                                })}
                            </Paper>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid xs={10}>
                                <Button
                                    variant="outlined"
                                    component="span"

                                    onClick={handleSaveProfile}>
                                    {t("account.save")}
                                </Button>
                            </Grid>
                            <Grid xs={2}>
                                <Button
                                    variant="outlined"
                                    component="span"

                                    onClick={signOut}>
                                    {t("account.signout")}
                                </Button>
                            </Grid>
                        </Grid>
                        {state.alert && (
                            <Box marginY="1rem">
                                <Alert
                                    action={
                                        <IconButton
                                            aria-label="close"
                                            color="inherit"
                                            size="small"
                                            onClick={hideAlert}
                                        >
                                            <CloseIcon fontSize="inherit"/>
                                        </IconButton>
                                    }
                                    variant="outlined"
                                    severity={state.alertType}
                                >
                                    {state.alertContent}
                                </Alert>
                            </Box>
                        )}

                    </div>
                ) : (
                    <div>
                        <Box marginY="2rem">
                            <Typography variant="subtitle1" gutterBottom>
                                <Trans>{t("account.welcome")} </Trans>
                            </Typography>
                            <Button
                                variant="outlined"
                                component="span"

                                onClick={handleSignIn}>
                                {t("account.signin")}
                            </Button>
                        </Box>
                    </div>
                )}

        </Container>
    );
};