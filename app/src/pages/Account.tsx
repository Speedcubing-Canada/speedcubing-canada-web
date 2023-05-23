import { useTranslation } from "react-i18next";
import {
    Container,
} from "@mui/material";

export const Account = () => {
    const { t } = useTranslation();

  return (
    <Container maxWidth="md">
        <div>Account</div>
    </Container>
  );
};