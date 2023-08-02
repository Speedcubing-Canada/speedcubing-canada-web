import {Trans, useTranslation} from "react-i18next";
import {
    Box,
    Container, Typography,
} from "@mui/material";
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import {DateField} from "@mui/x-date-pickers";
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {API_BASE_URL, GetUser, signIn, signOut} from '../components/Api';
import {useState} from "react";
import {Province} from "../components/Types";
import httpClient from "../httpClient";
import dayjs from "dayjs";

export const Account = () => {
    const {t} = useTranslation();

    const [province, setProvince] = useState<Province | null>(null);
    const [dob, setDob] = useState<| null>(null);

    const provinces: Province[] = [
        {label: 'Alberta', id: 'ab', region: 'Prairies'},
        {label: 'British Columbia', id: 'bc', region: 'British Columbia'},
        {label: 'Manitoba', id: 'mb', region: 'Prairies'},
        {label: 'New Brunswick', id: 'nb', region: 'Atlantic'},
        {label: 'Newfoundland and Labrador', id: 'nl', region: 'Atlantic'},
        {label: 'Northwest Territories', id: 'nt', region: 'Territories'},
        {label: 'Nova Scotia', id: 'ns', region: 'Atlantic'},
        {label: 'Nunavut', id: 'nu', region: 'Territories'},
        {label: 'Ontario', id: 'on', region: 'Ontario'},
        {label: 'Prince Edward Island', id: 'pe', region: 'Atlantic'},
        {label: 'Quebec', id: 'qc', region: 'Quebec'},
        {label: 'Saskatchewan', id: 'sk', region: 'Prairies'},
        {label: 'Yukon', id: 'yt', region: 'Territories'},
        {label: 'N/A', id: 'na', region: 'N/A'},
    ];// TODO: have translations for provinces

    const user = GetUser();//TODO: display something else while loading
    let default_province = {label: 'N/A', id: 'na', region: 'N/A'};
    if (user != null && user.province != null) {
        //set province in the combo box
        for (let i = 0; i < provinces.length; i++) {
            if (provinces[i].id === user.province) {
                default_province = provinces[i];
            }
        }
    }
    let default_dob = dayjs('2022-01-01');
    if (user != null && user.dob != null) {
        default_dob = dayjs(user.dob);
    }


    const handleSaveProfile = async () => {
        try {
            const resp = await httpClient.post(API_BASE_URL + "/edit", {
                province: province ? province.id : 'na',
            });
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

    return (
        <Container maxWidth="md">
            <Box marginY="4rem">
                <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
                    {t("account.title")}
                </Typography>
            </Box>
            {user != null ? (
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
                            defaultValue={default_province.region}
                            variant="outlined"
                        />
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateField
                                disabled
                                label="Date of birth"
                                value={dob || default_dob}
                                defaultValue={default_dob}
                                format="DD-MM-YYYY"
                            />
                        </LocalizationProvider>
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

                            onClick={signIn}>
                            {t("account.signin")}
                        </Button>
                    </Box>
                </div>
            )}

        </Container>
    );
};