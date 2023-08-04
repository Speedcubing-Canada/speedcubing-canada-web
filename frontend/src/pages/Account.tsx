import {Trans, useTranslation} from "react-i18next";
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
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {API_BASE_URL, signIn, signOut} from '../components/Api';
import {useEffect, useState} from "react";
import {Province, ChipData, chipColor, User} from "../components/Types";
import httpClient from "../httpClient";
import dayjs from "dayjs";
import {GetProvincesWithNA} from "../components/Provinces";

export const Account = () => {
    const {t} = useTranslation();

    const [province, setProvince] = useState<Province | null>(null);
    const [chipData, setChipData] = useState<readonly ChipData[]>([]);

    const [alert, setAlert] = useState(false);
    const [alertType, setAlertType] = useState<AlertColor>("error");
    const [alertContent, setAlertContent] = useState('');

    const provinces: Province[] = GetProvincesWithNA();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true)

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

    let default_province: Province = {label: 'N/A', id: 'na', region: 'N/A'};
    let default_dob = dayjs('2022-01-01');
    let default_WCAID = "";
    if (user != null) {
        if (user.province != null) {
            //set province in the combo box
            for (let i = 0; i < provinces.length; i++) {
                if (provinces[i].id === user.province) {
                    default_province = provinces[i];
                }
            }
        }
        if (user.dob != null) {
            default_dob = dayjs(user.dob);
        }
        if (user.roles != null && user.roles.length > 0 && chipData.length === 0) {
            let tmpChipData = [];
            for (let i = 0; i < user.roles.length; i++) {
                tmpChipData.push({key: i, label: user.roles[i]});
            }
            setChipData(tmpChipData);
        }
        if (user.wca_person != null) {
            default_WCAID = user.wca_person;
        }
    }

    const ListItem = styled('li')(({theme}) => ({
        margin: theme.spacing(0.5),
    }));


    const handleSaveProfile = async () => {
        try {
            const resp = await httpClient.post(API_BASE_URL + "/edit", {
                province: province ? province.id : 'na',
            });
            if (resp.data.success === true) {
                setAlertContent(t("account.success"));
                setAlertType("success");
                setAlert(true);
            } else {
                setAlertContent(t("account.error"));
                setAlertType("error");
                setAlert(true);
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
                            >
                                {t("account.hi")}{user.name}!
                            </Typography>

                            <Autocomplete
                                disablePortal
                                id="combo-box-demo"
                                options={provinces}
                                sx={{width: 300}}
                                value={province || default_province}
                                defaultValue={default_province}
                                onChange={(event, newValue) => {
                                    setProvince(newValue);
                                    if (newValue == null) {
                                    } else if (newValue.id === "qc") {
                                        console.log("Vive le Québec libre!");
                                    }
                                }}
                                renderInput={(params) => <TextField {...params} label="Province"/>}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                            />
                            <Typography variant="subtitle2" gutterBottom>
                                <Trans>{t("account.policy")} </Trans>
                            </Typography>
                            <TextField
                                disabled
                                id="region"
                                label="Region"
                                value={province?.region || default_province.region}
                                variant="outlined"
                            />
                            <TextField
                                disabled
                                id="wcaid"
                                label="WCAID"
                                defaultValue={default_WCAID}
                                variant="outlined"
                            />
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateField
                                    disabled
                                    label="Date of birth"
                                    defaultValue={default_dob}
                                    format="DD-MM-YYYY"
                                />
                            </LocalizationProvider>
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
                                    let color: chipColor | undefined = "default";

                                    if (data.label === 'GLOBAL_ADMIN') {
                                        color = "primary";
                                    }

                                    return (
                                        <ListItem key={data.key}>
                                            <Chip
                                                color={color}
                                                label={data.label}
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
                        {alert ?
                            <Alert
                                action={
                                    <IconButton
                                        aria-label="close"
                                        color="inherit"
                                        size="small"
                                        onClick={() => {
                                            setAlert(false);
                                        }}
                                    >
                                        <CloseIcon fontSize="inherit"/>
                                    </IconButton>
                                }
                                variant="outlined" severity={alertType}>
                                {alertContent}
                            </Alert>
                            : <></>}

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