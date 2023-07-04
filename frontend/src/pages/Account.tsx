import {Trans, useTranslation} from "react-i18next";
import {
    Box,
    Container, Typography,
} from "@mui/material";
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import {API_BASE_URL, GetUser, signIn, signOut} from '../components/Api';
import {useState} from "react";
import {Province} from "../components/Types";
import httpClient from "../httpClient";

export const Account = () => {
    const {t} = useTranslation();

    const [province, setProvince] = useState<Province | null>(null);

    const provinces: Province[] = [
        {label: 'Alberta', id: 'ab'},
        {label: 'British Columbia', id: 'bc'},
        {label: 'Manitoba', id: 'mb'},
        {label: 'New Brunswick', id: 'nb'},
        {label: 'Newfoundland and Labrador', id: 'nl'},
        {label: 'Northwest Territories', id: 'nt'},
        {label: 'Nova Scotia', id: 'ns'},
        {label: 'Nunavut', id: 'nu'},
        {label: 'Ontario', id: 'on'},
        {label: 'Prince Edward Island', id: 'pe'},
        {label: 'Quebec', id: 'qc'},
        {label: 'Saskatchewan', id: 'sk'},
        {label: 'Yukon', id: 'yt'},
        {label: 'N/A', id: 'na'},
    ];

    const user = GetUser();//TODO: display something else while loading
    let default_province = {label: 'N/A', id: 'na'};
    if (user != null && user.province != null) {
        //set province in the combo box
        for (let i = 0; i < provinces.length; i++) {
            if (provinces[i].id === user.province) {
                default_province = provinces[i];
            }
        }
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
                            Sign in with the WCA
                        </Button>
                    </Box>
                </div>
            )}

        </Container>
    );
};