import {useTranslation} from "react-i18next";
import {
    Box,
    Container, Typography,
} from "@mui/material";
import * as React from 'react';
import LinearProgress from '@mui/material/LinearProgress';

export const Rankings = () => {
    const {t} = useTranslation();

    const [progress, setProgress] = React.useState(0);
    const [buffer, setBuffer] = React.useState(10);

    const progressRef = React.useRef(() => {
    });
    React.useEffect(() => {
        progressRef.current = () => {
            if (progress > 100) {
                setProgress(0);
                setBuffer(10);
            } else {
                const diff = Math.random() * 10;
                const diff2 = Math.random() * 10;
                setProgress(progress + diff);
                setBuffer(progress + diff + diff2);
            }
        };
    });

    React.useEffect(() => {
        const timer = setInterval(() => {
            progressRef.current();
        }, 500);

        return () => {
            clearInterval(timer);
        };
    }, []);


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
            <Box sx={{width: '100%'}}>
                <LinearProgress variant="buffer" value={progress} valueBuffer={buffer}/>
            </Box>
        </Container>
    );
};