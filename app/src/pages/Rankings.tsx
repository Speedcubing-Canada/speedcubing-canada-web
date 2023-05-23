import { useTranslation } from "react-i18next";
import {
    Container,
} from "@mui/material";

export const Rankings = () => {
    const { t } = useTranslation();

  return (
    <Container maxWidth="md">
        <div>Rankings</div>
    </Container>
  );
};