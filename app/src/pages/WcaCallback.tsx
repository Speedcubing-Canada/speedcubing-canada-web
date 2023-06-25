import { useTranslation } from "react-i18next";
import {
    Container,
} from "@mui/material";
import { getToken } from '../logic/auth';

export const WcaCallback = () => {
    const { t } = useTranslation();
    getToken();
  return (
    <Container maxWidth="md">
        <div>Logging you in</div>

    </Container>
  );
};