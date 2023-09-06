import {useTranslation} from "react-i18next";
import {Box, Container, Typography} from "@mui/material";
import {Link} from "../components/Link";
import {LINKS} from "./links";
export const Quebec = () => {
        const {t} = useTranslation();
        window.location.href = LINKS.DISCORD_QC;

        return (
            <Container maxWidth="md">
                <Box marginY="4rem">
                    <Typography component="h1" variant="h3" fontWeight="bold" gutterBottom>
                        {t("provinces.qc")}
                    </Typography>
                    <Typography gutterBottom>
                        {t("quebec.body")}
                    </Typography>
                    <Link to={LINKS.DISCORD_QC}>Discord</Link>
                </Box>
            </Container>

        );
    }
;