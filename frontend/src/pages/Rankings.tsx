import {useTranslation} from "react-i18next";
import {
    Box,
    Container, Typography,
} from "@mui/material";
import * as React from 'react';
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import {eventID, Province, useAverage} from "../components/Types";
import {GetProvinces} from "../components/Provinces";
import {useState} from "react";
import {GetRanking} from "../components/Api";

export const Rankings = () => {
    const {t} = useTranslation();

    const provinces: Province[] = GetProvinces();
    const [province, setProvince] = useState<Province | null>(provinces[0]);
    const [eventId, setEventId] = useState<eventID>("333");
    const [useAverage, setUseAverage] = useState(false);

    const switchHandler = (event: { target: { checked: boolean | ((prevState: boolean) => boolean); }; }) => {
        setUseAverage(event.target.checked);
        console.log(ranking);
    };

    const ranking = GetRanking(eventId, province?.id, useAverage);

    const handleProvinceChange = (event: any, newValue: React.SetStateAction<Province | null>) => {
        setProvince(newValue);

        if (province == null) {
            // Handle the case when the province value is null.
        } else {
            // Do something with the ranking data (it will be updated automatically when the hook fetches new data).
            console.log(ranking);
            if (province.id === "qc") {
                console.log("Vive le Québec libre!");
            }
        }
    };


    return (
        <Container maxWidth="md">

            <Box marginY="4rem">
                <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>

                </Typography>
            </Box>
            <Box
                flex={1}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
            >
                <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
                    {t("rankings.soon")}
                </Typography>
            </Box>

            <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={provinces}
                sx={{width: 300}}
                value={province}
                onChange={handleProvinceChange}
                renderInput={(params) => <TextField {...params} label="Province"/>}
                isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            <Stack direction="row" spacing={1} alignItems="center">
                <Typography>Single</Typography>
                <Switch checked={useAverage}
                        onChange={switchHandler}
                        color="primary"/>
                <Typography>Average</Typography>
            </Stack>
        </Container>
    );
};